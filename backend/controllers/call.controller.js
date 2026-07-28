import Call from "../models/call.model.js";

export async function getCallHistory(req, res, next) {
  try {
    const calls = await Call.find({ $or: [{ caller: req.user._id }, { recipient: req.user._id }] }).populate("caller recipient", "username profile_Pic").sort({ createdAt: -1 }).limit(100);
    res.json(calls);
  } catch (error) { next(error); }
}
