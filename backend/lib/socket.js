import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import Call from "../models/call.model.js";
import { allowedOrigins } from "../middlewares/security.middleware.js";
import { activeCalls, callCounter, socketConnections } from "./metrics.js";
import logger from "./logger.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true }, transports: ["websocket", "polling"] });
const userSocketMap = new Map();
const socketUserMap = new Map();
const callSockets = new Map();

const parseCookies = (value = "") => Object.fromEntries(value.split(";").map((v) => v.trim().split(/=(.*)/s)).filter(([k]) => k).map(([k, v]) => [k, decodeURIComponent(v || "")]));
io.use((socket, next) => {
  try {
    const token = parseCookies(socket.handshake.headers.cookie).jwt;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "access") throw new Error("wrong token type");
    socket.userId = String(decoded.userId);
    next();
  } catch { next(new Error("Unauthorized")); }
});
function getReceiverSocketId(userId) { return userSocketMap.get(String(userId)); }
function emitToUser(userId, event, payload) { const id = getReceiverSocketId(userId); if (id) io.to(id).emit(event, payload); return Boolean(id); }
function validTarget(socket, target) { return target && String(target) !== socket.userId && getReceiverSocketId(target); }
function eventLimiter(limit = 30) { return (socket, next) => { const now = Date.now(); socket.eventTimes = (socket.eventTimes || []).filter((t) => now - t < 1000); if (socket.eventTimes.length >= limit) return next(new Error("Rate limit exceeded")); socket.eventTimes.push(now); next(); }; }

io.on("connection", (socket) => {
  userSocketMap.set(socket.userId, socket.id); socketUserMap.set(socket.id, socket.userId); socketConnections.set(userSocketMap.size);
  io.emit("user-online", { userId: socket.userId }); io.emit("getOnlineUsers", [...userSocketMap.keys()]);
  socket.use(eventLimiter());
  socket.on("join-room", ({ roomId }, ack) => { if (!roomId || String(roomId).length > 128) return ack?.({ ok: false }); socket.join(`chat:${roomId}`); ack?.({ ok: true }); });
  socket.on("leave-room", ({ roomId }) => socket.leave(`chat:${roomId}`));
  for (const event of ["typing", "stop-typing"]) socket.on(event, ({ to }) => { if (validTarget(socket, to)) emitToUser(to, event, { from: socket.userId }); });
  socket.on("start-call", async ({ to, type }, ack) => {
    if (!validTarget(socket, to) || !["audio", "video"].includes(type)) return ack?.({ ok: false, error: "Recipient unavailable" });
    if ([...callSockets.values()].some((c) => c.caller === to || c.recipient === to)) return ack?.({ ok: false, error: "Recipient is busy" });
    try { const call = await Call.create({ caller: socket.userId, recipient: to, type }); callSockets.set(String(call._id), { caller: socket.userId, recipient: String(to) }); activeCalls.set(callSockets.size); emitToUser(to, "incoming-call", { callId: call._id, from: socket.userId, type }); ack?.({ ok: true, callId: call._id }); logger.info("call_started", { callId: call._id, caller: socket.userId }); } catch { ack?.({ ok: false, error: "Unable to start call" }); }
  });
  socket.on("accept-call", async ({ callId }, ack) => { const call = callSockets.get(String(callId)); if (!call || call.recipient !== socket.userId) return ack?.({ ok: false }); await Call.findByIdAndUpdate(callId, { status: "accepted", startedAt: new Date() }); emitToUser(call.caller, "call-accepted", { callId }); ack?.({ ok: true }); });
  socket.on("reject-call", async ({ callId }) => { const call = callSockets.get(String(callId)); if (!call || call.recipient !== socket.userId) return; await finishCall(callId, "rejected"); });
  for (const event of ["offer", "answer", "ice-candidate", "ice-restart", "mute", "camera-toggle", "screen-share"]) socket.on(event, ({ callId, payload }) => { const call = callSockets.get(String(callId)); if (!call || ![call.caller, call.recipient].includes(socket.userId)) return; emitToUser(call.caller === socket.userId ? call.recipient : call.caller, event, { callId, payload }); });
  socket.on("end-call", ({ callId }) => finishCall(callId, "ended"));
  socket.on("disconnect", async () => { userSocketMap.delete(socket.userId); socketUserMap.delete(socket.id); socketConnections.set(userSocketMap.size); io.emit("user-offline", { userId: socket.userId }); io.emit("getOnlineUsers", [...userSocketMap.keys()]); for (const [callId, call] of callSockets) if (call.caller === socket.userId || call.recipient === socket.userId) await finishCall(callId, "missed"); });
});
async function finishCall(callId, status) { const call = callSockets.get(String(callId)); if (!call) return; const doc = await Call.findById(callId); const endedAt = new Date(); const update = { status, endedAt }; if (doc?.startedAt) update.duration = Math.max(0, Math.round((endedAt - doc.startedAt) / 1000)); await Call.findByIdAndUpdate(callId, update); callSockets.delete(String(callId)); activeCalls.set(callSockets.size); callCounter.inc({ status }); emitToUser(call.caller, "call-ended", { callId, status }); emitToUser(call.recipient, "call-ended", { callId, status }); logger.info("call_finished", { callId, status }); }
export { app, server, io, getReceiverSocketId };
