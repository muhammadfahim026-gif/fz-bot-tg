import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "server/.env" });

const app = express();
const PORT = Number(process.env.PORT || 3000);

/* =========================================================
   CORS
   ========================================================= */

function isAllowedOrigin(origin) {
  // Requests without Origin header
  if (!origin) return true;

  // Local development
  if (
    origin === "http://localhost:5173" ||
    origin === "http://localhost:5174" ||
    origin === "http://localhost:5175" ||
    origin === "http://127.0.0.1:5173" ||
    origin === "http://127.0.0.1:5174" ||
    origin === "http://127.0.0.1:5175"
  ) {
    return true;
  }

  // GitHub Codespaces
  if (
    /^https:\/\/.+-\d+\.app\.github\.dev$/.test(origin)
  ) {
    return true;
  }

  return false;
}

/*
  CORS middleware
*/
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    if (origin) {
      res.setHeader(
        "Access-Control-Allow-Origin",
        origin
      );
    }

    res.setHeader(
      "Vary",
      "Origin"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, Origin, X-Requested-With"
    );

    res.setHeader(
      "Access-Control-Max-Age",
      "86400"
    );

    // Handle browser preflight request
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
  }

  next();
});

/* =========================================================
   BODY PARSER
   ========================================================= */

app.use(
  express.json({
    limit: "1mb",
  })
);

/* =========================================================
   ENVIRONMENT
   ========================================================= */

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY;

const encryptionKeyHex =
  process.env.BOT_ENCRYPTION_KEY;

if (
  !supabaseUrl ||
  !supabaseSecretKey ||
  !encryptionKeyHex
) {
  console.error(
    "Missing required server environment variables."
  );

  console.error(
    "Required:"
  );

  console.error(
    "SUPABASE_URL"
  );

  console.error(
    "SUPABASE_SECRET_KEY"
  );

  console.error(
    "BOT_ENCRYPTION_KEY"
  );

  process.exit(1);
}

/* =========================================================
   ENCRYPTION KEY
   ========================================================= */

let encryptionKey;

try {
  encryptionKey = Buffer.from(
    encryptionKeyHex,
    "hex"
  );

  if (encryptionKey.length !== 32) {
    throw new Error(
      "BOT_ENCRYPTION_KEY must be 64 hexadecimal characters."
    );
  }
} catch (error) {
  console.error(
    "Encryption key error:",
    error.message
  );

  process.exit(1);
}

/* =========================================================
   SUPABASE ADMIN CLIENT
   ========================================================= */

const adminSupabase =
  createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

/* =========================================================
   ENCRYPT BOT TOKEN
   ========================================================= */

function encryptBotToken(token) {
  const iv =
    crypto.randomBytes(12);

  const cipher =
    crypto.createCipheriv(
      "aes-256-gcm",
      encryptionKey,
      iv
    );

  const encrypted =
    Buffer.concat([
      cipher.update(
        token,
        "utf8"
      ),
      cipher.final(),
    ]);

  const tag =
    cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

/* =========================================================
   PANEL ADMIN AUTH
   ========================================================= */

async function requirePanelAdmin(
  req,
  res,
  next
) {
  try {
    const authorization =
      req.headers.authorization || "";

    const token =
      authorization.startsWith(
        "Bearer "
      )
        ? authorization
            .slice(7)
            .trim()
        : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const {
      data: userData,
      error: userError,
    } =
      await adminSupabase.auth.getUser(
        token
      );

    if (
      userError ||
      !userData?.user
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired session.",
      });
    }

    const {
      data: adminRow,
      error: adminError,
    } =
      await adminSupabase
        .from("panel_admins")
        .select("user_id")
        .eq(
          "user_id",
          userData.user.id
        )
        .maybeSingle();

    if (adminError) {
      console.error(
        "Admin lookup error:",
        adminError
      );

      return res.status(500).json({
        success: false,
        message:
          "Admin verification failed.",
      });
    }

    if (!adminRow) {
      return res.status(403).json({
        success: false,
        message:
          "Panel admin access required.",
      });
    }

    req.authUser =
      userData.user;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Authentication check failed.",
    });
  }
}

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "FZ BOT TG backend is running",
    });
  }
);

/* =========================================================
   CONNECT TELEGRAM BOT
   ========================================================= */

app.post(
  "/api/bots/connect",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const botToken =
        typeof req.body?.botToken ===
        "string"
          ? req.body.botToken.trim()
          : "";

      const botUsername =
        typeof req.body?.botUsername ===
        "string"
          ? req.body.botUsername.trim()
          : "";

      if (!botToken) {
        return res.status(400).json({
          success: false,
          message:
            "Bot Token is required.",
        });
      }

      if (botToken.length > 512) {
        return res.status(400).json({
          success: false,
          message:
            "Bot Token is invalid.",
        });
      }

      /* -----------------------------------------
         VERIFY TOKEN WITH TELEGRAM
         ----------------------------------------- */

      const telegramResponse =
        await fetch(
          `https://api.telegram.org/bot${encodeURIComponent(
            botToken
          )}/getMe`
        );

      const telegramData =
        await telegramResponse
          .json()
          .catch(() => null);

      if (
        !telegramResponse.ok ||
        !telegramData?.ok ||
        !telegramData?.result
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Telegram Bot Token.",
        });
      }

      const telegramBot =
        telegramData.result;

      /* -----------------------------------------
         ENCRYPT TOKEN
         ----------------------------------------- */

      const encryptedToken =
        encryptBotToken(
          botToken
        );

      /* -----------------------------------------
         FIND EXISTING BOT
         ----------------------------------------- */

      const usernameForLookup =
        telegramBot.username ||
        botUsername ||
        "";

      const {
        data: existing,
        error: existingError,
      } =
        await adminSupabase
          .from("connected_bots")
          .select("id")
          .eq(
            "bot_username",
            usernameForLookup
          )
          .maybeSingle();

      if (existingError) {
        console.error(
          "Existing bot lookup error:",
          existingError
        );

        return res.status(500).json({
          success: false,
          message:
            existingError.message,
        });
      }

      /* -----------------------------------------
         BOT DATABASE DATA
         ----------------------------------------- */

      const now =
        new Date().toISOString();

      const botDatabaseData = {
        bot_name:
          telegramBot.first_name ||
          telegramBot.username ||
          "Telegram Bot",

        bot_username:
          telegramBot.username ||
          botUsername ||
          null,

        bot_token_encrypted:
          encryptedToken,

        status: "connected",

        is_active: true,

        last_connected_at:
          now,

        last_seen_at:
          now,

        updated_at:
          now,
      };

      let savedBot;

      /* -----------------------------------------
         UPDATE EXISTING
         ----------------------------------------- */

      if (existing?.id) {
        const {
          data,
          error,
        } =
          await adminSupabase
            .from("connected_bots")
            .update(
              botDatabaseData
            )
            .eq(
              "id",
              existing.id
            )
            .select(
              `
                id,
                user_id,
                bot_name,
                bot_username,
                status,
                is_active,
                last_connected_at,
                last_seen_at
              `
            )
            .single();

        if (error) {
          throw error;
        }

        savedBot = data;
      }

      /* -----------------------------------------
         INSERT NEW
         ----------------------------------------- */

      else {
        const {
          data,
          error,
        } =
          await adminSupabase
            .from("connected_bots")
            .insert(
              botDatabaseData
            )
            .select(
              `
                id,
                user_id,
                bot_name,
                bot_username,
                status,
                is_active,
                last_connected_at,
                last_seen_at
              `
            )
            .single();

        if (error) {
          throw error;
        }

        savedBot = data;
      }

      /* -----------------------------------------
         SUCCESS
         ----------------------------------------- */

      return res.json({
        success: true,
        message:
          "Telegram bot connected successfully.",
        bot: savedBot,
      });
    } catch (error) {
      console.error(
        "Bot connection error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Bot connection failed.",
      });
    }
  }
);

/* =========================================================
   404
   ========================================================= */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "API route not found.",
      path:
        req.originalUrl,
    });
  }
);

/* =========================================================
   GLOBAL ERROR HANDLER
   ========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Server error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error.",
    });
  }
);

/* =========================================================
   START SERVER
   ========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `FZ BOT TG backend running on port ${PORT}`
    );
  }
);