import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "server/.env" });

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const encryptionKeyHex = process.env.BOT_ENCRYPTION_KEY;

if (!supabaseUrl || !supabaseSecretKey || !encryptionKeyHex) {
  console.error("Missing required server environment variables.");
  process.exit(1);
}

let encryptionKey;
try {
  encryptionKey = Buffer.from(encryptionKeyHex, "hex");
  if (encryptionKey.length !== 32) throw new Error("BOT_ENCRYPTION_KEY must be 32 bytes (64 hex characters).");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function encryptBotToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

async function requirePanelAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const { data: userData, error: userError } = await adminSupabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({ success: false, message: "Invalid or expired session." });
    }

    const { data: adminRow, error: adminError } = await adminSupabase
      .from("panel_admins")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError || !adminRow) {
      return res.status(403).json({ success: false, message: "Panel admin access required." });
    }

    req.authUser = userData.user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ success: false, message: "Authentication check failed." });
  }
}

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "FZ BOT TG backend is running" });
});

app.post("/api/bots/connect", requirePanelAdmin, async (req, res) => {
  try {
    const botToken = typeof req.body?.botToken === "string" ? req.body.botToken.trim() : "";

    if (!botToken) {
      return res.status(400).json({ success: false, message: "Bot Token is required." });
    }

    if (botToken.length > 512) {
      return res.status(400).json({ success: false, message: "Bot Token is invalid." });
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(botToken)}/getMe`
    );
    const telegramData = await telegramResponse.json().catch(() => null);

    if (!telegramResponse.ok || !telegramData?.ok || !telegramData?.result) {
      return res.status(400).json({ success: false, message: "Invalid Telegram Bot Token." });
    }

    const bot = telegramData.result;
    const encryptedToken = encryptBotToken(botToken);

    const { data: existing, error: existingError } = await adminSupabase
      .from("connected_bots")
      .select("id")
      .eq("bot_username", bot.username || "")
      .maybeSingle();

    if (existingError) {
      console.error("Existing bot lookup error:", existingError);
      return res.status(500).json({ success: false, message: existingError.message });
    }

    let savedBot;

    if (existing?.id) {
      const { data, error } = await adminSupabase
        .from("connected_bots")
        .update({
          bot_name: bot.first_name || bot.username || "Telegram Bot",
          bot_username: bot.username || null,
          bot_token_encrypted: encryptedToken,
          status: "connected",
          is_active: true,
          last_connected_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("id, user_id, bot_name, bot_username, status, is_active, last_connected_at, last_seen_at")
        .single();

      if (error) throw error;
      savedBot = data;
    } else {
      const { data, error } = await adminSupabase
        .from("connected_bots")
        .insert({
          bot_name: bot.first_name || bot.username || "Telegram Bot",
          bot_username: bot.username || null,
          bot_token_encrypted: encryptedToken,
          status: "connected",
          is_active: true,
          last_connected_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        })
        .select("id, user_id, bot_name, bot_username, status, is_active, last_connected_at, last_seen_at")
        .single();

      if (error) throw error;
      savedBot = data;
    }

    return res.json({
      success: true,
      message: "Telegram bot connected successfully.",
      bot: savedBot,
    });
  } catch (error) {
    console.error("Bot connection error:", error);
    return res.status(500).json({ success: false, message: error.message || "Bot connection failed." });
  }
});

app.listen(PORT, () => {
  console.log(`FZ BOT TG backend running on port ${PORT}`);
});
