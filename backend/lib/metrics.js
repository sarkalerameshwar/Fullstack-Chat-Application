import client from "prom-client";

client.collectDefaultMetrics({ prefix: "chat_" });
export const socketConnections = new client.Gauge({ name: "chat_socket_connections", help: "Currently connected Socket.IO clients" });
export const activeCalls = new client.Gauge({ name: "chat_active_calls", help: "Calls currently ringing or active" });
export const callCounter = new client.Counter({ name: "chat_calls_total", help: "Calls by final status", labelNames: ["status"] });
export const register = client.register;
