import { z } from "zod";

export const schemas = {
  credentials: z.object({ email: z.string().trim().email().max(254), password: z.string().min(8).max(128) }),
  signup: z.object({ username: z.string().trim().min(2).max(40), email: z.string().trim().email().max(254), password: z.string().min(8).max(128) }),
  otp: z.object({ email: z.string().trim().email(), otp: z.string().regex(/^\d{4,8}$/) }),
  message: z.object({ text: z.string().trim().max(4000).optional(), image: z.string().max(10_000_000).optional() }).refine((v) => v.text || v.image, "Message content is required"),
};
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(422).json({ message: "Invalid request", errors: result.error.flatten().fieldErrors });
  req.body = result.data;
  next();
};
