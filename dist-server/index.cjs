var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/index.ts
var index_exports = {};
__export(index_exports, {
  generateSalt: () => generateSalt,
  hashPassword: () => hashPassword,
  validatePhoneNumber: () => validatePhoneNumber
});
module.exports = __toCommonJS(index_exports);
var import_dotenv2 = __toESM(require("dotenv"), 1);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_resvg_js = require("@resvg/resvg-js");
var import_http = __toESM(require("http"), 1);
var import_ws = __toESM(require("ws"), 1);
var import_morgan = __toESM(require("morgan"), 1);
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_razorpay = __toESM(require("razorpay"), 1);
var import_crypto = __toESM(require("crypto"), 1);

// server/supabase.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_supabase_js = require("@supabase/supabase-js");
import_dotenv.default.config();
var supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || "";
var supabaseKey = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim() || process.env.SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.VITE_SUPABASE_API_KEY?.trim() || "";
console.log("===== SUPABASE ENV CHECK =====");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL);
console.log(
  "SUPABASE_SECRET_KEY:",
  process.env.SUPABASE_SECRET_KEY ? "FOUND" : "MISSING"
);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "FOUND" : "MISSING"
);
console.log(
  "SUPABASE_PUBLISHABLE_KEY:",
  process.env.SUPABASE_PUBLISHABLE_KEY ? "FOUND" : "MISSING"
);
console.log(
  "SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "FOUND" : "MISSING"
);
console.log(
  "VITE_SUPABASE_API_KEY:",
  process.env.VITE_SUPABASE_API_KEY ? "FOUND" : "MISSING"
);
console.log("==============================");
var supabaseAdmin = null;
var isSupabaseConfigured = false;
if (supabaseUrl && supabaseKey) {
  try {
    supabaseAdmin = (0, import_supabase_js.createClient)(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    isSupabaseConfigured = true;
    console.log("[Supabase Server] Successfully initialized Supabase admin client.");
  } catch (err) {
    console.error("[Supabase Server] Failed to initialize Supabase admin client:", err);
  }
} else {
  console.warn("[Supabase Server] Missing SUPABASE_URL or SUPABASE_SECRET_KEY/PUBLISHABLE_KEY. Server-side Supabase is disabled or in fallback mode.");
}
async function requireSupabaseAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token not provided" });
  }
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return res.status(503).json({ error: "Service Unavailable: Supabase server is not configured" });
  }
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid Supabase token", details: error?.message });
    }
    req.user = user;
    req.supabaseToken = token;
    next();
  } catch (err) {
    console.error("[Supabase Server] Auth verification error:", err);
    return res.status(500).json({ error: "Internal Server Error during auth verification", details: err.message });
  }
}

// server/middleware/security.ts
var import_helmet = __toESM(require("helmet"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_compression = __toESM(require("compression"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_hpp = __toESM(require("hpp"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_xss_clean = __toESM(require("xss-clean"), 1);
function setupSecurityMiddlewares(app2) {
  app2.use((0, import_helmet.default)({
    contentSecurityPolicy: false,
    // Turn off CSP if we need to let the iframe or external assets load smoothly
    crossOriginEmbedderPolicy: false
  }));
  const allowedOrigin = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";
  app2.use((0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin || allowedOrigin.includes(origin) || origin.includes("localhost") || origin.includes("run.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  }));
  app2.use((0, import_hpp.default)());
  app2.use((0, import_xss_clean.default)());
  app2.use((0, import_compression.default)());
  const cookieSecret = process.env.COOKIE_SECRET || "default_cookie_secret_signing_key_12345";
  app2.use((0, import_cookie_parser.default)(cookieSecret));
  const apiLimiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 200,
    // Limit each IP to 200 requests per window
    standardHeaders: true,
    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,
    // Disable the `X-RateLimit-*` headers
    message: {
      error: "Too many requests from this IP. Please try again after 15 minutes."
    }
  });
  app2.use("/api/", apiLimiter);
}

// server/middleware/errorHandler.ts
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  console.error(`[Error Handler] ${req.method} ${req.url} - Status ${statusCode}:`, {
    message: err.message,
    code: err.code,
    stack: isProduction ? void 0 : err.stack,
    details: err.details
  });
  res.status(statusCode).json({
    success: false,
    error: err.message || "An unexpected error occurred on the server.",
    code: err.code || "INTERNAL_SERVER_ERROR",
    ...isProduction ? {} : { stack: err.stack, details: err.details }
  });
}

// server/validators/index.ts
var import_zod = require("zod");
function validateBody(schema) {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
}

// server/validators/auth.ts
var import_zod2 = require("zod");
var registerSchema = import_zod2.z.object({
  email: import_zod2.z.string().email({ message: "A valid email address is required." }),
  password: import_zod2.z.string().min(8, { message: "Password must be at least 8 characters long." }),
  phone_number: import_zod2.z.string().optional().refine((val) => {
    if (!val) return true;
    const cleanNum = val.trim().replace(/[\s-()]/g, "");
    return /^\+?[1-9]\d{6,14}$/.test(cleanNum);
  }, {
    message: "Invalid phone number format. Please provide a valid number containing 7 to 15 digits."
  })
});
var loginSchema = import_zod2.z.object({
  email: import_zod2.z.string().email({ message: "A valid email address is required." }),
  password: import_zod2.z.string().min(1, { message: "Password is required." })
});

// server/middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_64_character_random_string_for_local_testing_only";
function generateToken(payload) {
  return import_jsonwebtoken.default.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role
    },
    JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User authentication is required" });
    }
    const userRole = (req.user.role || "client").toLowerCase();
    const isAllowed = allowedRoles.map((r) => r.toLowerCase()).includes(userRole);
    if (!isAllowed) {
      return res.status(403).json({
        error: `Forbidden: This action is restricted to the following roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`
      });
    }
    next();
  };
}
var isAdmin = requireRole(["admin"]);
var isModel = requireRole(["model"]);
var isAgency = requireRole(["agency"]);
var isUser = requireRole(["client", "admin", "model", "agency"]);

// server/index.ts
import_dotenv2.default.config();
if (!globalThis.WebSocket) {
  globalThis.WebSocket = import_ws.default;
}
var razorpayClient = null;
function getRazorpay() {
  if (!razorpayClient) {
    const rawKeyId = process.env.RAZORPAY_KEY_ID;
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!rawKeyId || !rawKeySecret || rawKeyId.trim() === "" || rawKeySecret.trim() === "") {
      console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in the environment. Falling back to simulated/mock payments.");
      return null;
    }
    const keyId = rawKeyId.trim();
    const keySecret = rawKeySecret.trim();
    try {
      razorpayClient = new import_razorpay.default({
        key_id: keyId,
        key_secret: keySecret
      });
      console.log("Razorpay SDK client successfully initialized server-side with key: " + keyId);
    } catch (e) {
      console.error("Failed to initialize Razorpay SDK:", e);
    }
  }
  return razorpayClient;
}
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use((0, import_morgan.default)("combined"));
setupSecurityMiddlewares(app);
var pendingWebhookUnlocks = [];
var verifiedChatAccess = /* @__PURE__ */ new Set([
  "c1:m4",
  "c1:m6",
  "client:m4",
  "client:m6",
  "agency:m4",
  "agency:m6"
]);
app.use(import_express.default.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
var geminiApiKey = process.env.GEMINI_API_KEY || "";
var ai = null;
if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new import_genai.GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log("Gemini API successfully initialized server-side.");
  } catch (err) {
    console.error("Failed to initialize Gemini SDK", err);
  }
} else {
  console.warn("GEMINI_API_KEY missing or using placeholder, fallback response mode active.");
}
app.post("/api/chat/respond", async (req, res) => {
  const { modelName, modelCategory, modelBiography, messages, userMessage, clientId, modelId } = req.body;
  if (clientId && modelId) {
    const key = `${clientId}:${modelId}`;
    let isUnlocked = verifiedChatAccess.has(key);
    if (!isUnlocked && isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: payRecord } = await supabaseAdmin.from("payments").select("id").eq("userId", clientId).eq("modelId", modelId).eq("status", "captured").maybeSingle();
        if (payRecord) {
          isUnlocked = true;
          verifiedChatAccess.add(key);
          console.log(`Verified persistent db payment for client:model ${key}. Cache updated.`);
        }
      } catch (err) {
        console.error("Error checking database for payment verification:", err);
      }
    }
    if (!isUnlocked) {
      console.warn(`Unauthorized chat attempt detected for client key: ${key}`);
      return res.status(403).json({
        error: "Access Denied: Chat session is locked. Complete Razorpay payment verification first."
      });
    }
  }
  const prompt = `You are ${modelName}, a professional model in India registered under ModelVerse India. 
Your details:
- Category: ${modelCategory}
- Biography: ${modelBiography}

You are chatting with a potential fashion brand client, photographer, or event organizer on the ModelVerse India portal.
Maintain high professionalism, politeness, and luxury elegance.
Answer their latest message directly inside this conversation context.

CRITICAL RULE: Direct personal mobile numbers, WhatsApp numbers, email addresses, or any private contact details are SECURE and MUST NOT be shared. Encourage them to book you directly through the secure "Book Now" flow on ModelVerse India.

Conversation history:
${(messages || []).map((m) => `${m.senderId === "client" ? "Client" : "You"}: ${m.content}`).join("\n")}
Client latest message: "${userMessage}"

Generate a short, elegant, and context-appropriate reply (maximum 2-3 sentences):`;
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      const text = response.text || "";
      return res.json({ response: text.trim() });
    } catch (err) {
      console.error("Gemini call failed, executing fallback responder", err);
    }
  }
  let fallbackReply = `Thank you for your message! I'm definitely interested in working together on this campaign. Please submit an official booking request through the "Book Now" button on my dashboard so we can secure the dates.`;
  const lowerMsg = userMessage.toLowerCase();
  if (lowerMsg.includes("phone") || lowerMsg.includes("whatsapp") || lowerMsg.includes("number") || lowerMsg.includes("email") || lowerMsg.includes("contact")) {
    fallbackReply = `For safety and standard compliance, all our secure chat communication, invoice processing, and scheduling must remain inside ModelVerse India. Let's arrange our shoot dates and logistics right here!`;
  } else if (lowerMsg.includes("budget") || lowerMsg.includes("price") || lowerMsg.includes("rate") || lowerMsg.includes("pay") || lowerMsg.includes("charge")) {
    fallbackReply = `My starting rates are displayed on my profile, but I'm open to discussing project-specific scopes. Feel free to submit a booking proposal with your corporate budget, and my agency manager will review it right away!`;
  } else if (lowerMsg.includes("portfolio") || lowerMsg.includes("photos") || lowerMsg.includes("images")) {
    fallbackReply = `My main high-fashion gallery is curated right here on ModelVerse India! Once you submit a booking request or unlock premium details, you can also view additional measurements and my high-resolution comp card!`;
  } else if (lowerMsg.includes("hi") || lowerMsg.includes("hello") || lowerMsg.includes("hey")) {
    fallbackReply = `Hello! Thank you for reaching out to me via ModelVerse India. I'm excited to hear about your brand and discuss your upcoming creative campaign! What kind of shoot do you have in mind?`;
  }
  setTimeout(() => {
    return res.json({ response: fallbackReply });
  }, 1e3);
});
app.post("/api/payments/create-session", async (req, res) => {
  const { gateway, planType, userId, userName, userEmail, modelId, modelName, amount } = req.body;
  const origin = req.headers.origin || process.env.APP_URL || "http://localhost:3000";
  let targetAmount = 199;
  let title = "Premium Profile Unlock";
  if (planType === "enterprise") {
    targetAmount = 4999;
    title = "Enterprise Agency License";
  } else if (planType === "escrow") {
    targetAmount = Number(amount || 199);
    title = `Casting Campaign Escrow - ${modelName || "Model"}`;
  } else if (modelName) {
    title = `Premium Unlock - ${modelName}`;
  }
  const rzp = getRazorpay();
  if (rzp && gateway === "Razorpay") {
    try {
      const order = await rzp.orders.create({
        amount: targetAmount * 100,
        // Razorpay expects amount in paise (1 INR = 100 paise)
        currency: "INR",
        receipt: `rcpt_mvi_${Date.now()}`,
        notes: {
          planType: planType || "premium",
          userId: userId || "",
          modelId: modelId || "",
          modelName: modelName || "",
          amount: String(targetAmount)
        }
      });
      return res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || "",
        isReal: true,
        isMock: false
      });
    } catch (err) {
      console.error("Razorpay Order creation failed, falling back to simulated session:", err);
    }
  }
  const mockUrl = `${origin}/?mock_checkout=true&gateway=${gateway || "Razorpay"}&plan_type=${planType}&user_id=${userId || ""}&user_name=${encodeURIComponent(userName || "")}&user_email=${encodeURIComponent(userEmail || "")}&amount=${targetAmount}&model_id=${modelId || ""}&model_name=${encodeURIComponent(modelName || "")}`;
  return res.json({ id: `mock_sess_${Date.now()}`, url: mockUrl, isMock: true });
});
app.post("/api/payments/verify", async (req, res) => {
  const { gateway, sessionId, planType, amount, modelId, modelName, razorpay_payment_id, razorpay_order_id, razorpay_signature, userId, userName, userEmail } = req.body;
  if (gateway === "Razorpay" && razorpay_signature && razorpay_payment_id && razorpay_order_id) {
    const rawSecret = process.env.RAZORPAY_KEY_SECRET;
    if (!rawSecret || rawSecret.trim() === "") {
      return res.status(400).json({ error: "Razorpay secret key not configured on server." });
    }
    const secret = rawSecret.trim();
    try {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = import_crypto.default.createHmac("sha256", secret).update(body).digest("hex");
      const isVerified = expectedSignature === razorpay_signature;
      if (isVerified) {
        console.log(`Real Razorpay payment verified: Order ${razorpay_order_id}, Payment ${razorpay_payment_id}`);
        if (userId && modelId) {
          verifiedChatAccess.add(`${userId}:${modelId}`);
          console.log(`Chat access unlocked via verify: ${userId}:${modelId}`);
        }
        if (isSupabaseConfigured && supabaseAdmin) {
          try {
            const { error: dbError } = await supabaseAdmin.from("payments").insert({
              id: razorpay_payment_id,
              userId: userId || "anonymous_user",
              userName: userName || "Razorpay Customer",
              userEmail: userEmail || null,
              amount: Number(amount) || 199,
              paymentGateway: "Razorpay",
              status: "captured",
              description: `Verified Premium Chat Unlock for ${modelName || "Model"}`,
              createdAt: (/* @__PURE__ */ new Date()).toISOString(),
              invoiceId: razorpay_order_id,
              sessionId: razorpay_signature,
              modelId: modelId || null,
              modelName: modelName || null
            });
            if (dbError) throw dbError;
            console.log("Successfully recorded verified Razorpay transaction in Supabase database.");
          } catch (dbErr) {
            console.error("Failed to save verified Razorpay transaction to database:", dbErr.message || dbErr);
          }
        }
        return res.json({
          verified: true,
          isMock: false,
          isSandbox: false,
          gateway: "Razorpay",
          planType: planType || "premium",
          amount: amount || 199,
          modelId: modelId || "",
          modelName: modelName || "",
          paymentId: razorpay_payment_id
        });
      } else {
        console.error("Real Razorpay signature verification failed!");
        return res.status(400).json({ error: "Payment signature verification failed." });
      }
    } catch (e) {
      console.error("Error during real Razorpay verification:", e);
      return res.status(500).json({ error: e.message });
    }
  }
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required for verification." });
  }
  console.log(`Verifying secure platform checkout session ${sessionId} via ${gateway || "Gateway"}.`);
  if (userId && modelId) {
    verifiedChatAccess.add(`${userId}:${modelId}`);
    console.log(`Chat access unlocked via simulated verify: ${userId}:${modelId}`);
  }
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { error: dbError } = await supabaseAdmin.from("payments").insert({
        id: sessionId,
        userId: userId || "anonymous_user",
        userName: userName || "Simulated Customer",
        userEmail: userEmail || null,
        amount: Number(amount) || 199,
        paymentGateway: gateway || "Simulated Gateway",
        status: "captured",
        description: `Simulated Premium Chat Unlock for ${modelName || "Model"}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        invoiceId: `mock_order_${Date.now()}`,
        sessionId,
        modelId: modelId || null,
        modelName: modelName || null
      });
      if (dbError) throw dbError;
      console.log("Successfully recorded simulated transaction in Supabase database.");
    } catch (dbErr) {
      console.error("Failed to save simulated transaction to database:", dbErr.message || dbErr);
    }
  }
  return res.json({
    verified: true,
    isMock: true,
    isSandbox: true,
    gateway: gateway || "Razorpay",
    planType: planType || "premium",
    amount: amount || 199,
    modelId: modelId || "",
    modelName: modelName || ""
  });
});
app.post("/api/payments/webhook", async (req, res) => {
  const event = req.body;
  console.log("Received Razorpay payment webhook event:", JSON.stringify(event));
  if (event && (event.event === "payment.captured" || event.event === "order.paid")) {
    const paymentEntity = event.payload?.payment?.entity || event.payload?.order?.entity || event;
    const notes = paymentEntity.notes || {};
    const planType = notes.planType || "premium";
    const userId = notes.userId || "";
    const modelId = notes.modelId || "";
    const modelName = notes.modelName || "Model";
    const amount = Number(notes.amount || (paymentEntity.amount ? paymentEntity.amount / 100 : 199));
    if (userId && modelId) {
      const webhookUnlock = {
        id: `wh_pay_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
        userId,
        modelId,
        modelName,
        planType,
        amount,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      verifiedChatAccess.add(`${userId}:${modelId}`);
      pendingWebhookUnlocks.push(webhookUnlock);
      console.log("Successfully registered successful Razorpay webhook unlock:", webhookUnlock);
    }
  }
  if (event && event.custom_webhook_success === true) {
    const webhookUnlock = {
      id: `wh_pay_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
      userId: event.userId,
      modelId: event.modelId,
      modelName: event.modelName || "Model",
      planType: event.planType || "premium",
      amount: Number(event.amount || 199),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (event.userId && event.modelId) {
      verifiedChatAccess.add(`${event.userId}:${event.modelId}`);
    }
    pendingWebhookUnlocks.push(webhookUnlock);
    console.log("Successfully registered custom simulated payment webhook success:", webhookUnlock);
  }
  return res.json({ status: "ok", received: true });
});
app.get("/api/payments/pending-webhook-unlocks", (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "userId parameter is required" });
  }
  const userUnlocks = pendingWebhookUnlocks.filter((item) => item.userId === userId);
  for (const item of userUnlocks) {
    const idx = pendingWebhookUnlocks.indexOf(item);
    if (idx > -1) {
      pendingWebhookUnlocks.splice(idx, 1);
    }
  }
  return res.json({ unlocks: userUnlocks });
});
app.post("/api/talent/evaluate", async (req, res) => {
  const { name, category, age, height, city, experience, biography, languages } = req.body;
  const prompt = `You are the Lead Casting Director at ModelVerse India and a premium fashion advisor.
A model candidate just registered with these details:
- Name: ${name}
- Category: ${category}
- Age: ${age}
- Height: ${height}
- City: ${city}
- Experience: ${experience}
- Biography: ${biography}
- Languages: ${languages ? languages.join(", ") : "English"}

Evaluate this registration portfolio application for the Indian fashion ecosystem. Provide a JSON response format.

Generate custom structured evaluation in plain JSON with exactly these fields (no markdown formatting):
{
  "score": "Number between 7.5 and 9.8",
  "suitability": "Short 1-sentence analysis of which Indian brands or campaigns they fit best (e.g., Ethnic bride, urban athleisure, high-fashion Mumbai couture, digital UGC beauty).",
  "advice": "Two high-impact professional advice points to improve their portfolio and booking rates in India.",
  "statusDecision": "Approved"
}`;
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      const rawText = response.text || "";
      let parsed;
      try {
        const firstOpen = rawText.indexOf("{");
        const lastClose = rawText.lastIndexOf("}");
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
          const jsonStr = rawText.substring(firstOpen, lastClose + 1);
          parsed = JSON.parse(jsonStr);
        } else {
          const scrubbed = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          parsed = JSON.parse(scrubbed);
        }
        if (parsed && parsed.score) {
          parsed.score = Number(parsed.score) || 8.8;
        }
      } catch (e) {
        console.warn("Direct JSON parse failed, extracting fields using patterns", e);
        const scoreMatch = rawText.match(/"score"\s*:\s*"*([\d\.]+)"*/i) || rawText.match(/score\s*:\s*([\d\.]+)/i);
        const suitabilityMatch = rawText.match(/"suitability"\s*:\s*"([^"]+)"/i);
        const adviceMatch = rawText.match(/"advice"\s*:\s*"([^"]+)"/i);
        parsed = {
          score: scoreMatch ? Number(scoreMatch[1]) : 8.8,
          suitability: suitabilityMatch ? suitabilityMatch[1] : "Excellent match for premium Indian brand campaigns.",
          advice: adviceMatch ? adviceMatch[1] : "1. Curate clear bright daylight portfolio snaps. 2. Record multi-lingual intro clip.",
          statusDecision: "Approved"
        };
      }
      return res.json(parsed);
    } catch (err) {
      console.error("Gemini evaluation failed, falling back to rule-based analysis", err);
    }
  }
  const baseScore = experience.includes("5+") ? 9.6 : experience.includes("2-5") ? 8.9 : 7.8;
  const targetCasting = category === "UGC Creators" ? "Ideal fit for digital lifestyle brands in Bangalore, specializing in short-form cosmetic video ads." : "Perfect match for contemporary fashion apparel catalogs and regional high-street prints.";
  return res.json({
    score: baseScore,
    suitability: targetCasting,
    advice: "1. Enhance your portfolio with dynamic outdoor lifestyle shots to showcase casual versatility. 2. Record a brief multi-lingual cinematic presentation video to increase actor/influencer bookings.",
    statusDecision: "Approved"
  });
});
app.post("/api/talent/parse-pdf", async (req, res) => {
  const { pdfBase64, fileName } = req.body;
  let prompt = `You are an expert AI Parsing Assistant at ModelVerse India. You have been given a model's digital comp-card or resume PDF portfolio. 
Extract the model's professional styling, biometrical specs, and category details for registration into plain raw JSON.

Please output exactly the following JSON structure containing details parsed from the document (or generated beautifully based on the document's type if the document lacks explicit values):
{
  "name": "Full name of the model",
  "gender": "female" or "male" or "non-binary",
  "age": number (integer between 18 and 45),
  "height": "Height like 5'8\\" or 6'2\\"",
  "city": "An Indian city e.g. Mumbai, Delhi, Bangalore, etc.",
  "state": "The corresponding Indian State name",
  "category": "One of these exact categories: 'Fashion Models', 'Commercial Models', 'Fitness Models', 'Influencers', 'UGC Creators', 'Actors', 'Event Hosts', 'Promotional Models', 'Brand Ambassadors'",
  "langs": "Comma-separated spoken languages e.g. 'English, Hindi, Marathi'",
  "experience": "One of these exact values: 'Fresh Face', '1-2 years', '2-5 years', '5+ years'",
  "biography": "A professionally written, premium fashion biography (40-65 words) highlighting their aesthetic strengths and focus.",
  "portfolioLink1": "A premium high-resolution Unsplash model portrait URL (from fashion, modeling, or portrait category, e.g., https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&amp;w=600 or another professional-looking portrait image link. Must be a valid image URL)",
  "portfolioLink2": "A matching high-resolution Unsplash fashion model image URL (from fashion/modeling, e.g. https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&amp;w=600)",
  "portfolioLink3": "Another matching high-resolution Unsplash campaign or portrait image URL (e.g. https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&amp;w=600)"
}

Ensure your entire output is simply raw JSON. No markdown backticks or block formatting whatsoever.

If you analyze the fileName: "${fileName || ""}", tailor the details to make it highly authentic:
- If file contains "Couture_Fashion", generate a high-end couture fashion model with exquisite specs (e.g. height 5'9\\" or 6'1\\"), based in Mumbai, category "Fashion Models".
- If file contains "ModelVerse_Digital_Portfolio_Composite", generate a premium elegant influencer or UGC creator based in Bangalore, e.g. "Aanya Sen" or similar, category "Influencers".
- If file contains "Commercial_Acting", generate an actor/actress based in Mumbai with 2-5 years experience, category "Actors".
- Otherwise, extract what you can or fill it with highly plausible premium details.

If pdfBase64 is passed, analyze the base64 document content to pull exact names, heights, cities, experiences, languages, and biography if found.
`;
  if (ai) {
    try {
      const parts = [{ text: prompt }];
      if (pdfBase64) {
        const cleanedBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
        parts.push({
          inlineData: {
            data: cleanedBase64,
            mimeType: "application/pdf"
          }
        });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts }
      });
      const rawText = response.text || "";
      let parsed;
      try {
        const firstOpen = rawText.indexOf("{");
        const lastClose = rawText.lastIndexOf("}");
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
          const jsonStr = rawText.substring(firstOpen, lastClose + 1);
          parsed = JSON.parse(jsonStr);
        } else {
          const scrubbed = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          parsed = JSON.parse(scrubbed);
        }
      } catch (err) {
        console.warn("Direct PDF parsing JSON parse failed, using fallback", err);
      }
      if (parsed && parsed.name) {
        return res.json({ success: true, data: parsed });
      }
    } catch (err) {
      console.error("Gemini PDF parser failed, running smart fallback", err);
    }
  }
  const nameToUse = fileName || "";
  let fallbackData;
  if (nameToUse.includes("Couture_Fashion_Comp_Card_Spring")) {
    fallbackData = {
      name: "Rohan Malhotra",
      gender: "male",
      age: 24,
      height: `6'1"`,
      city: "Mumbai",
      state: "Maharashtra",
      category: "Fashion Models",
      langs: "English, Hindi, Punjabi",
      experience: "5+ years",
      biography: "Rohan is a premium editorial couture fashion model working out of Mumbai. He features sharp angular features and exquisite runway presence. Has walked for leading Indian designers at Lakme Fashion Week and featured heavily in Mens Luxury apparel campaigns.",
      portfolioLink1: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600",
      portfolioLink2: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600",
      portfolioLink3: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600"
    };
  } else if (nameToUse.includes("ModelVerse_Digital_Portfolio_Composite")) {
    fallbackData = {
      name: "Aanya Sen",
      gender: "female",
      age: 23,
      height: `5'7"`,
      city: "Bangalore",
      state: "Karnataka",
      category: "Influencers",
      langs: "English, Hindi, Bengali",
      experience: "2-5 years",
      biography: "Aanya is a digital influencer, travel blogger, and creator of aesthetically premium lifestyle reels. Based in Bangalore, she collaborates with premium cosmetic and urban leisure fashion labels, delivering rich high-engagement audience interactions.",
      portfolioLink1: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600",
      portfolioLink2: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600",
      portfolioLink3: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600"
    };
  } else if (nameToUse.includes("Commercial_Acting_Resume_Grid")) {
    fallbackData = {
      name: "Aditya Roy Bhatia",
      gender: "male",
      age: 27,
      height: `5'11"`,
      city: "Mumbai",
      state: "Maharashtra",
      category: "Actors",
      langs: "English, Hindi, Urdu",
      experience: "5+ years",
      biography: "Aditya is a versatile commercial actor and brand campaign model based in Mumbai. With an academic background in dramatic arts, he has starred in 12 major TV commercial spots for Indian banking, automotive, and apparel brands. Sharp, expressive, and premium camera presence.",
      portfolioLink1: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600",
      portfolioLink2: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600",
      portfolioLink3: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600"
    };
  } else {
    fallbackData = {
      name: "Karan Johar Patel",
      gender: "male",
      age: 25,
      height: `5'10"`,
      city: "Mumbai",
      state: "Maharashtra",
      category: "Commercial Models",
      langs: "English, Hindi, Gujarati",
      experience: "1-2 years",
      biography: "Karan is an energetic commercial model based in Mumbai. He excels in ethnic wear, lifestyle digital shoots, and casual brand representations. Always reliable with standard professional punctuality.",
      portfolioLink1: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600",
      portfolioLink2: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600",
      portfolioLink3: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600"
    };
  }
  return res.json({ success: true, data: fallbackData });
});
var staticModels = {
  m1: {
    name: "Priya Sharma",
    category: "Fashion Models",
    city: "Mumbai",
    height: `5'10"`,
    experience: "5+ Years",
    rating: "4.9",
    reviews: "48",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"
  },
  m2: {
    name: "Kabir Mehra",
    category: "Fitness Models",
    city: "Delhi",
    height: `6'2"`,
    experience: "2-5 Years",
    rating: "4.8",
    reviews: "32",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop"
  },
  m3: {
    name: "Anjali Rao",
    category: "UGC Creators",
    city: "Bangalore",
    height: `5'7"`,
    experience: "2-5 Years",
    rating: "4.7",
    reviews: "21",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop"
  },
  m4: {
    name: "Vikram Singh",
    category: "Actors",
    city: "Mumbai",
    height: `6'0"`,
    experience: "5+ Years",
    rating: "4.9",
    reviews: "54",
    imageUrl: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop"
  },
  m5: {
    name: "Rhea Kapoor",
    category: "Commercial Models",
    city: "Delhi",
    height: `5'8"`,
    experience: "2-5 Years",
    rating: "4.6",
    reviews: "15",
    imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop"
  },
  m6: {
    name: "Divya Nair",
    category: "Event Hosts",
    city: "Chennai",
    height: `5'6"`,
    experience: "Fresh Face",
    rating: "4.5",
    reviews: "9",
    imageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=600&auto=format&fit=crop"
  }
};
async function fetchImageAsBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.warn(`Failed to pre-fetch image ${url}, using default fallback placeholder`, error);
    return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }
}
app.get("/api/og-image/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const model = staticModels[id] || staticModels["m1"];
    const base64Image = await fetchImageAsBase64(model.imageUrl);
    const safeName = model.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeCategory = model.category.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeCity = model.city.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeHeight = model.height.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeExperience = model.experience.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svgTemplate = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f97316"/>
          <stop offset="50%" stop-color="#ec4899"/>
          <stop offset="100%" stop-color="#a855f7"/>
        </linearGradient>
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0c0a09"/>
          <stop offset="100%" stop-color="#1c1917"/>
        </linearGradient>
        <clipPath id="photo-rounded">
          <rect x="680" y="75" width="450" height="480" rx="24" ry="24" />
        </clipPath>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg-grad)"/>

      <!-- Ambient glow circles -->
      <circle cx="200" cy="315" r="350" fill="#f97316" opacity="0.08" />
      <circle cx="1000" cy="315" r="300" fill="#ec4899" opacity="0.06" />

      <!-- Top Branding Rail info -->
      <path d="M75 55L65 65L75 75M68 59L61 65L68 71" stroke="url(#brand-grad)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <text x="95" y="72" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="900" font-size="25" fill="#ffffff" letter-spacing="4">CORE CAST</text>
      <text x="315" y="70" font-family="ui-monospace, SFMono-Regular, monospace" font-weight="bold" font-size="12" fill="#f97316" letter-spacing="2">\u2022 INDIA'S PREMIUM CASTING ECOSYSTEM</text>
      <line x1="75" y1="95" x2="600" y2="95" stroke="#292524" stroke-width="1.5"/>

      <!-- Left main display cards -->
      <text x="75" y="160" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="20" fill="#a855f7" letter-spacing="2">VERIFIED PORTFOLIO</text>
      <text x="75" y="245" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="900" font-size="64" fill="#ffffff" letter-spacing="-1">${safeName}</text>
      <text x="75" y="305" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="24" fill="#d6d3d1">${safeCategory}</text>

      <!-- Grid layout specs -->
      <!-- Item A -->
      <rect x="75" y="340" width="168" height="90" rx="12" fill="#1c1917" stroke="#292524" stroke-width="1.5"/>
      <text x="95" y="372" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="12" fill="#78716c" letter-spacing="1">LOCATION</text>
      <text x="95" y="405" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="20" fill="#ffffff">${safeCity}</text>

      <!-- Item B -->
      <rect x="258" y="340" width="168" height="90" rx="12" fill="#1c1917" stroke="#292524" stroke-width="1.5"/>
      <text x="278" y="372" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="12" fill="#78716c" letter-spacing="1">HEIGHT</text>
      <text x="278" y="405" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="20" fill="#ffffff">${safeHeight}</text>

      <!-- Item C -->
      <rect x="441" y="340" width="168" height="90" rx="12" fill="#1c1917" stroke="#292524" stroke-width="1.5"/>
      <text x="461" y="372" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="12" fill="#78716c" letter-spacing="1">EXPERIENCE</text>
      <text x="461" y="405" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="20" fill="#ffffff">${safeExperience}</text>

      <!-- Status badges -->
      <!-- Live Ledger Auth -->
      <rect x="75" y="465" width="230" height="42" rx="21" fill="rgba(34, 197, 94, 0.08)" stroke="#22c55e" stroke-width="1"/>
      <circle cx="95" cy="486" r="7" fill="#22c55e"/>
      <path d="M92 486l2 2 4-4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <text x="115" y="492" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="12" fill="#4ade80" letter-spacing="0.5">SELFIE-VERIFIED LIVE</text>

      <!-- Premium stars rating -->
      <rect x="320" y="465" width="220" height="42" rx="21" fill="rgba(234, 179, 8, 0.08)" stroke="#eab308" stroke-width="1"/>
      <path d="M342 477l2.5 5 5.5.8-4 4 1 5.5-5-2.6-5 2.6 1-5.5-4-4 5.5-.8z" fill="#eab308"/>
      <text x="360" y="491" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="bold" font-size="12" fill="#facc15" letter-spacing="0.5">${model.rating} (${model.reviews} REVIEWS)</text>

      <!-- Trust terms notice -->
      <text x="75" y="555" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11" font-weight="bold" fill="#78716c" letter-spacing="1">TRUST ESCROW PROTECTED \u2022 ANTI-INTERMEDIARY LEDGER</text>

      <!-- Right image container with active gradient frame highlights -->
      <rect x="677" y="72" width="456" height="486" rx="27" ry="27" fill="none" stroke="url(#brand-grad)" stroke-width="3" opacity="0.8"/>
      <image href="${base64Image}" x="680" y="75" width="450" height="480" clip-path="url(#photo-rounded)" preserveAspectRatio="xMidYMid slice"/>
    </svg>
    `;
    const resvg = new import_resvg_js.Resvg(svgTemplate, {
      background: "#0c0a09",
      fitTo: { mode: "width", value: 1200 }
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    return res.send(pngBuffer);
  } catch (error) {
    console.error("Failed to generate Open Graph image card", error);
    return res.status(500).send("Open Graph generation failed");
  }
});
app.post("/api/ai/image-generate", async (req, res) => {
  const { prompt, aspectRatio, imageSize } = req.body;
  const fallbackImages = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800"
  ];
  const randomImg = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  if (!ai) {
    return res.json({ success: true, url: randomImg, base64: "" });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: [{ text: prompt || "High fashion portrait of Indian model, luxury golden hours" }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
          imageSize: imageSize || "1K"
        }
      }
    });
    let base64Image = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }
    if (base64Image) {
      return res.json({ success: true, base64: base64Image, url: `data:image/png;base64,${base64Image}` });
    } else {
      return res.json({ success: true, url: randomImg, base64: "" });
    }
  } catch (err) {
    console.warn("Image generation warning, loading high-fashion fallback:", err);
    return res.json({ success: true, url: randomImg, base64: "" });
  }
});
app.post("/api/ai/image-edit", async (req, res) => {
  const { prompt, base64Image, mimeType } = req.body;
  if (!base64Image) {
    return res.status(400).json({ success: false, error: "An image base64 input is required for image editing." });
  }
  if (!ai) {
    return res.json({ success: true, base64: base64Image.replace(/^data:image\/[a-z]+;base64,/, ""), url: base64Image });
  }
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg"
            }
          },
          { text: prompt || "Edit the image" }
        ]
      }
    });
    let resultBase64 = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        resultBase64 = part.inlineData.data;
        break;
      }
    }
    if (resultResultRaw(resultBase64)) {
      return res.json({ success: true, base64: resultBase64, url: `data:image/png;base64,${resultBase64}` });
    } else {
      return res.json({ success: true, base64: cleanBase64, url: base64Image });
    }
  } catch (err) {
    console.warn("Image editing warning, using original input fallback:", err);
    return res.json({ success: true, base64: base64Image.replace(/^data:image\/[a-z]+;base64,/, ""), url: base64Image });
  }
});
function resultResultRaw(text) {
  return typeof text === "string" && text.length > 50;
}
app.post("/api/generate-video", async (req, res) => {
  const { prompt, base64Image, mimeType, aspectRatio } = req.body;
  if (!ai) {
    return res.json({ success: true, operationName: "mock_veo_operation_" + Date.now() });
  }
  try {
    const config = {
      numberOfVideos: 1,
      resolution: "720p",
      aspectRatio: aspectRatio || "16:9"
    };
    let imagePayload = void 0;
    if (base64Image) {
      const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
      imagePayload = {
        imageBytes: cleanBase64,
        mimeType: mimeType || "image/png"
      };
    }
    const operation = await ai.models.generateVideos({
      model: "veo-3.1-lite-generate-preview",
      prompt: prompt || "Casting model walking gracefully on a high-fashion runway, cinematic depth",
      image: imagePayload,
      config
    });
    return res.json({ success: true, operationName: operation.name });
  } catch (err) {
    console.warn("Veo trigger warning, spawning mock animation operation:", err);
    return res.json({ success: true, operationName: "mock_veo_operation_" + Date.now() });
  }
});
app.post("/api/video-status", async (req, res) => {
  const { operationName } = req.body;
  if (operationName && operationName.startsWith("mock_veo_operation_")) {
    return res.json({ success: true, done: true });
  }
  if (!ai) {
    return res.json({ success: true, done: true });
  }
  try {
    const op = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: op });
    return res.json({ success: true, done: updated.done });
  } catch (err) {
    console.warn("Veo polling error warning, returning done:", err);
    return res.json({ success: true, done: true });
  }
});
app.post("/api/video-download", async (req, res) => {
  const { operationName } = req.body;
  const mockVideos = [
    "https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40134-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-posing-for-photoshoots-32189-large.mp4"
  ];
  const randomMockVideo = mockVideos[Math.floor(Math.random() * mockVideos.length)];
  if (operationName && operationName.startsWith("mock_veo_operation_")) {
    return res.redirect(randomMockVideo);
  }
  if (!ai) {
    return res.redirect(randomMockVideo);
  }
  try {
    const op = { name: operationName };
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.redirect(randomMockVideo);
    }
    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": geminiApiKey }
    });
    res.setHeader("Content-Type", "video/mp4");
    if (videoRes.body) {
      videoRes.body.pipeTo(
        new WritableStream({
          write(chunk) {
            res.write(chunk);
          },
          close() {
            res.end();
          },
          abort(err) {
            console.error("Pipe aborted:", err);
            res.end();
          }
        })
      );
    } else {
      const buffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    console.warn("Video download streaming error, redirecting to showcase:", err);
    return res.redirect(randomMockVideo);
  }
});
app.post("/api/ai/search-grounding", async (req, res) => {
  const { prompt } = req.body;
  if (!ai) {
    return res.status(500).json({ success: false, error: "Gemini AI is not initialized." });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return res.json({ success: true, response: response.text });
  } catch (err) {
    console.error("Search grounding failed:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/ai/maps-grounding", async (req, res) => {
  const { prompt } = req.body;
  if (!ai) {
    return res.status(550).json({ success: false, error: "Gemini AI is not initialized." });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }]
      }
    });
    return res.json({ success: true, response: response.text });
  } catch (err) {
    console.error("Maps grounding failed:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/ai/campaign-planner", async (req, res) => {
  const { prompt } = req.body;
  if (!ai) {
    return res.status(500).json({ success: false, error: "Gemini AI is not initialized." });
  }
  try {
    const complexSystemInstruction = `You are an elite haute-couture casting director and fashion brand planner at ModelVerse India. 
Your job is to generate a comprehensive, ultra-professional campaign casting photoshoot brief based on the user's provided brand guidelines, dates, and ideas.
Structure your reply beautifully with markdown using sections like:
- "1. Creative Campaign Mood & Concept"
- "2. Detailed Model Styling, Hair, Make-Up, and Wardrobe Directives"
- "3. Ideal Shooting Schedule, Backdrops, Lighting and Set Design"
- "4. Indian Talent Category & Demographics Recommendation"
- "5. Suggested Standard Indian Professional Casting Rate Safeguards"
Keep details highly descriptive and upscale.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt || "Heritage elegance couture shoot in Rajasthan",
      config: {
        systemInstruction: complexSystemInstruction
      }
    });
    return res.json({ success: true, response: response.text });
  } catch (err) {
    console.error("Campaign planner failed:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/ai/bio-enhancer", async (req, res) => {
  const { bio } = req.body;
  if (!ai) {
    return res.status(500).json({ success: false, error: "Gemini AI is not initialized." });
  }
  try {
    const prompt = `Rewrite this crude modeling biography to sound extremely upscale, elegant, couture, and professional (length exactly 40-55 words). Retain key facts but dress them in sleek, luxury, fashion-forward phrasing. Format: plain paragraph, no styling or markdown. Bio: "${bio || ""}"`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    return res.json({ success: true, response: response.text?.trim() });
  } catch (err) {
    console.error("Bio enhancer failed:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/sitemap.xml", async (req, res) => {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host || "modelverse.in";
    const baseUrl = `${protocol}://${host}`;
    const staticPages = [
      { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0" },
      { loc: `${baseUrl}/?tab=models`, changefreq: "daily", priority: "0.9" },
      { loc: `${baseUrl}/?tab=become-model`, changefreq: "weekly", priority: "0.8" },
      { loc: `${baseUrl}/?tab=pricing`, changefreq: "monthly", priority: "0.7" },
      { loc: `${baseUrl}/?tab=blog`, changefreq: "weekly", priority: "0.7" }
    ];
    const categories = [
      "Fashion Models",
      "Commercial Models",
      "Fitness Models",
      "Influencers",
      "UGC Creators",
      "Actors",
      "Event Hosts",
      "Promotional Models",
      "Brand Ambassadors"
    ];
    const categoryPages = categories.map((cat) => ({
      loc: `${baseUrl}/?category=${encodeURIComponent(cat)}`,
      changefreq: "weekly",
      priority: "0.8"
    }));
    const talentPages = [];
    const firebaseConfigPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
    let firebaseConfig = null;
    try {
      if (import_fs.default.existsSync(firebaseConfigPath)) {
        firebaseConfig = JSON.parse(import_fs.default.readFileSync(firebaseConfigPath, "utf8"));
      }
    } catch (e) {
      console.warn("Sitemap generator could not parse firebase-applet-config.json:", e);
    }
    const fetchedModelIds = new Set(Object.keys(staticModels));
    if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.firestoreDatabaseId) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/models`;
        const firestoreRes = await fetch(url);
        if (firestoreRes.ok) {
          const fsData = await firestoreRes.json();
          if (fsData && fsData.documents) {
            for (const doc of fsData.documents) {
              const parts = doc.name.split("/");
              const modelId = parts[parts.length - 1];
              if (modelId) {
                fetchedModelIds.add(modelId);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Sitemap dynamic Firestore fetch failed, using default seed model ids:", err);
      }
    }
    fetchedModelIds.forEach((id) => {
      talentPages.push({
        loc: `${baseUrl}/?model_id=${id}`,
        changefreq: "weekly",
        priority: "0.9"
      });
    });
    const allPages = [...staticPages, ...categoryPages, ...talentPages];
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    allPages.forEach((p) => {
      xml += "  <url>\n";
      xml += `    <loc>${p.loc}</loc>
`;
      xml += `    <changefreq>${p.changefreq}</changefreq>
`;
      xml += `    <priority>${p.priority}</priority>
`;
      xml += "  </url>\n";
    });
    xml += "</urlset>";
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    return res.send(xml);
  } catch (error) {
    console.error("Failed to generate sitemap.xml:", error);
    return res.status(500).send("Internal Server Error generating Sitemap");
  }
});
app.get("/api/supabase/status", (req, res) => {
  return res.json({
    isConfigured: isSupabaseConfigured,
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL ? "Configured" : "Missing",
    hasSecretKey: !!(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasPublishableKey: !!(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_API_KEY)
  });
});
function validatePhoneNumber(phone) {
  if (!phone) return false;
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone.trim().replace(/[\s-()]/g, ""));
}
function generateSalt() {
  return import_crypto.default.randomBytes(16).toString("hex");
}
function hashPassword(password, salt) {
  return import_crypto.default.createHash("sha256").update(password + salt).digest("hex");
}
var LOCAL_USERS_FILE = import_path.default.join(process.cwd(), "local_hashed_users.json");
function getLocalHashedUsers() {
  try {
    if (import_fs.default.existsSync(LOCAL_USERS_FILE)) {
      return JSON.parse(import_fs.default.readFileSync(LOCAL_USERS_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Error reading local hashed users file:", e);
  }
  return [];
}
function saveLocalHashedUsers(users) {
  try {
    import_fs.default.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing local hashed users file:", e);
  }
}
app.post("/api/auth/register-db", validateBody(registerSchema), async (req, res) => {
  const { email, password, phone_number } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  const salt = import_crypto.default.randomBytes(16).toString("hex");
  const passwordHash = await import_bcrypt.default.hash(password, 12);
  const userId = import_crypto.default.randomUUID();
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data: existingUser } = await supabaseAdmin.from("users").select("id").eq("email", cleanEmail).maybeSingle();
      if (existingUser) {
        return res.status(400).json({ error: "User with this email is already registered." });
      }
      const { data, error: insertError } = await supabaseAdmin.from("users").insert({
        id: userId,
        email: cleanEmail,
        password_hash: passwordHash,
        salt,
        phone_number: phone_number || null,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select().single();
      if (insertError) {
        throw insertError;
      }
      const token2 = generateToken({ id: userId, email: cleanEmail, role: "client" });
      return res.status(201).json({
        message: "User registered successfully in PostgreSQL database with secure Bcrypt 12-round hashing.",
        token: token2,
        user: {
          id: userId,
          email: cleanEmail,
          phone_number: phone_number || null,
          created_at: data.created_at
        }
      });
    } catch (err) {
      console.warn("[Supabase users fallback] Supabase insert failed, using fallback database:", err.message || err);
    }
  }
  const localUsers = getLocalHashedUsers();
  if (localUsers.find((u) => u.email === cleanEmail)) {
    return res.status(400).json({ error: "User with this email is already registered." });
  }
  const newUser = {
    id: userId,
    email: cleanEmail,
    password_hash: passwordHash,
    salt,
    phone_number: phone_number || null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  localUsers.push(newUser);
  saveLocalHashedUsers(localUsers);
  const token = generateToken({ id: userId, email: cleanEmail, role: "client" });
  return res.status(201).json({
    message: "User registered successfully in local-fallback mock database with secure Bcrypt 12-round hashing.",
    token,
    user: {
      id: userId,
      email: cleanEmail,
      phone_number: phone_number || null,
      created_at: newUser.created_at
    }
  });
});
app.post("/api/auth/login-db", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data: user2 } = await supabaseAdmin.from("users").select("*").eq("email", cleanEmail).maybeSingle();
      if (user2) {
        let isPasswordCorrect = false;
        try {
          isPasswordCorrect = await import_bcrypt.default.compare(password, user2.password_hash);
        } catch (err) {
          isPasswordCorrect = false;
        }
        if (!isPasswordCorrect) {
          const legacyHash = hashPassword(password, user2.salt);
          if (legacyHash === user2.password_hash) {
            isPasswordCorrect = true;
            console.log(`Legacy user ${cleanEmail} authenticated successfully via SHA-256 fallback. Upgrading hash to Bcrypt...`);
            const updatedBcryptHash = await import_bcrypt.default.hash(password, 12);
            await supabaseAdmin.from("users").update({ password_hash: updatedBcryptHash }).eq("id", user2.id);
          }
        }
        if (isPasswordCorrect) {
          const token = generateToken({ id: user2.id, email: user2.email, role: "client" });
          return res.json({
            message: "Authentication successful. Login validated via secure hashed credentials.",
            token,
            user: {
              id: user2.id,
              email: user2.email,
              phone_number: user2.phone_number,
              created_at: user2.created_at
            }
          });
        } else {
          return res.status(401).json({ error: "Invalid email or password." });
        }
      }
    } catch (err) {
      console.warn("[Supabase users query fallback] Supabase login query failed, querying fallback database:", err.message || err);
    }
  }
  const localUsers = getLocalHashedUsers();
  const user = localUsers.find((u) => u.email === cleanEmail);
  if (user) {
    let isPasswordCorrect = false;
    try {
      isPasswordCorrect = await import_bcrypt.default.compare(password, user.password_hash);
    } catch (err) {
      isPasswordCorrect = false;
    }
    if (!isPasswordCorrect) {
      const legacyHash = hashPassword(password, user.salt);
      if (legacyHash === user.password_hash) {
        isPasswordCorrect = true;
        console.log(`Legacy fallback user ${cleanEmail} authenticated successfully. Upgrading to Bcrypt...`);
        user.password_hash = await import_bcrypt.default.hash(password, 12);
        saveLocalHashedUsers(localUsers);
      }
    }
    if (isPasswordCorrect) {
      const token = generateToken({ id: user.id, email: user.email, role: "client" });
      return res.json({
        message: "Authentication successful (fallback). Login validated via secure hashed credentials.",
        token,
        user: {
          id: user.id,
          email: user.email,
          phone_number: user.phone_number,
          created_at: user.created_at
        }
      });
    }
  }
  return res.status(401).json({ error: "Invalid email or password." });
});
app.post("/api/supabase/verify-token", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return res.status(503).json({ error: "Supabase server-side client is not initialized" });
  }
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token", details: error?.message });
    }
    return res.json({ valid: true, user });
  } catch (err) {
    return res.status(500).json({ error: "Failed to verify token", details: err.message });
  }
});
app.get("/api/supabase/profile", requireSupabaseAuth, (req, res) => {
  return res.json({
    message: "Profile fetched securely from Supabase Server",
    user: req.user
  });
});
app.get("/api/supabase/users", requireSupabaseAuth, async (req, res) => {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return res.status(503).json({ error: "Supabase server-side client is not initialized" });
  }
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.warn("Could not list users from auth admin, attempting public users table:", error.message);
      const { data: publicUsers, error: publicError } = await supabaseAdmin.from("users").select("*");
      if (publicError) {
        return res.status(403).json({
          error: "Forbidden: Elevate permissions using the service_role key to access admin functions",
          details: publicError.message
        });
      }
      return res.json({ source: "public_table", users: publicUsers });
    }
    return res.json({ source: "auth_admin", users });
  } catch (err) {
    return res.status(500).json({ error: "Failed to retrieve users list", details: err.message });
  }
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", serverTime: (/* @__PURE__ */ new Date()).toISOString() });
});
var server = import_http.default.createServer(app);
var wss = new import_ws.WebSocketServer({ noServer: true });
wss.on("connection", async (clientWs, request) => {
  console.log("Client connected for live voice audition.");
  if (!ai || !geminiApiKey) {
    clientWs.send(JSON.stringify({ error: "Gemini Live API is not initialized. Key is missing on backend." }));
    clientWs.close();
    return;
  }
  const reqUrl = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
  const voiceParam = reqUrl.searchParams.get("voice") || "riya";
  let voiceName = "Kore";
  let systemInstruction = "You are an elegant and helpful casting voice coach at ModelVerse India named Riya. Speak clearly, encouragingly, and elegantly. Recommend models on keeping high confidence, posing, or preparing for high-fashion runway walks.";
  if (voiceParam === "aarav") {
    voiceName = "Fenrir";
    systemInstruction = "You are Aarav, an elite runway coordinator and campaign director with 15+ years of experience directing Lakme and Milan Fashion Weeks. Your advice is sharp, direct, professional, and authoritative. Teach models how to master complex catwalk turns, handle wardrobe malfunctions on the ramp, and negotiate premium casting terms. Keep your answers highly focused and direct.";
  } else if (voiceParam === "zack") {
    voiceName = "Puck";
    systemInstruction = 'You are Zack, a flamboyant and high-energy runway stylist and casting vocal coach. Your vibe is super energetic, modern, and inspiring. Use terms like "fabulous", "fierce", and "work it". Guide models on bold self expression, creative posing, runway rhythm, and avant-garde catalogs. Keep your answers energetic and relatively short.';
  } else if (voiceParam === "diya") {
    voiceName = "Aoede";
    systemInstruction = "You are Diya, a compassionate and experienced model mentor. You focus on mental confidence, handling rejection in auditions, speech projection, and natural authenticity. Speak in a soothing, thoughtful, and encouraging tone. Keep your responses short and calming.";
  }
  try {
    const session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } }
        },
        systemInstruction
      },
      callbacks: {
        onmessage: (msg) => {
          const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            clientWs.send(JSON.stringify({ audio: base64Audio }));
          }
          if (msg.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          clientWs.close();
        },
        onerror: (err) => {
          clientWs.send(JSON.stringify({ error: err.message || "Gemini Live service error" }));
        }
      }
    });
    clientWs.on("message", async (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio) {
          session.sendRealtimeInput({
            audio: {
              data: payload.audio,
              mimeType: "audio/pcm;rate=16000"
            }
          });
        }
      } catch (err) {
        console.error("Error matching voice PCM streams:", err);
      }
    });
    clientWs.on("close", () => {
      try {
        session.close();
      } catch (e) {
      }
    });
  } catch (err) {
    console.error("Live API connection setup failed:", err);
    clientWs.send(JSON.stringify({ error: `Connection failed: ${err.message}` }));
    clientWs.close();
  }
});
app.get(["/oauth-callback", "/oauth-callback/"], (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authenticating...</title>
    </head>
    <body style="background-color: #121212; color: #ffffff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
      <div style="text-align: center; padding: 20px;">
        <p style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Authenticating with Google...</p>
        <p style="font-size: 14px; color: #a0a0a0;">This window will close automatically once authentication is completed.</p>
      </div>
      <script>
        console.log("OAuth popup callback loaded, hash:", window.location.hash);
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'OAUTH_AUTH_SUCCESS', 
            hash: window.location.hash,
            search: window.location.search
          }, '*');
          window.close();
        } else {
          window.location.href = '/';
        }
      </script>
    </body>
    </html>
  `);
});
async function startServer() {
  app.use(errorHandler);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in Development mode.");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    console.log("Serving production build assets from /dist.");
  }
  server.on("upgrade", (request, socket, head) => {
    try {
      const urlStr = request.url || "";
      const pathname = urlStr.split("?")[0];
      if (pathname === "/api/live-audition" || pathname.startsWith("/api/live-audition")) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else if (process.env.NODE_ENV !== "production") {
      } else {
        socket.destroy();
      }
    } catch (err) {
      console.error("Upgrade routing error:", err);
      socket.destroy();
    }
  });
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`ModelVerse India server fully operational on http://localhost:${PORT}`);
  });
}
startServer();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateSalt,
  hashPassword,
  validatePhoneNumber
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=index.cjs.map
