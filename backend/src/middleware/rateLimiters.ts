import rateLimit from "express-rate-limit";

// A blanket limit protects the whole API, but brute-force and spam risks
// concentrate on a few endpoints — login (credential stuffing), and the
// two writes that accept large payloads and create public-facing content
// (property creation with images, booking requests). These get tighter,
// named limits so a burst on one doesn't eat into another's budget.

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again in a few minutes." },
});

export const createPropertyRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many listings created recently. Please try again later." },
});

export const createBookingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many booking requests recently. Please try again later." },
});
