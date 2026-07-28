import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["audio", "video"], required: true },
  status: { type: String, enum: ["ringing", "accepted", "rejected", "missed", "ended", "busy", "failed"], default: "ringing", index: true },
  startedAt: Date,
  endedAt: Date,
  duration: { type: Number, default: 0 },
}, { timestamps: true });
callSchema.index({ caller: 1, createdAt: -1 });
callSchema.index({ recipient: 1, createdAt: -1 });
export default mongoose.model("Call", callSchema);
