import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "server/.env" });

const app = express();
const PORT = Number(process.env.PORT || 3000);

/* =========================================================
   CORS
   ========================================================= */

function allowedOrigin(origin) {
  if (!origin) return true;

  const local = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
  ];

  if (local.includes(origin)) return true;

  return /^https:\/\/.+-\d+\.app\.github\.dev$/.test(origin);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigin(origin)) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, Origin, X-Requested-With"
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
  }

  next();
});

app.use(express.json({ limit: "1mb" }));

/* =========================================================
   ENV
   ========================================================= */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const encryptionKeyHex = process.env.BOT_ENCRYPTION_KEY;

if (!supabaseUrl || !supabaseSecretKey || !encryptionKeyHex) {
  console.error(
    "Missing SUPABASE_URL, SUPABASE_SECRET_KEY or BOT_ENCRYPTION_KEY"
  );
  process.exit(1);
}

const encryptionKey = Buffer.from(encryptionKeyHex, "hex");

if (encryptionKey.length !== 32) {
  console.error(
    "BOT_ENCRYPTION_KEY must contain 64 hexadecimal characters."
  );
  process.exit(1);
}

const supabase = createClient(
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
   TOKEN ENCRYPTION
   ========================================================= */

function encryptToken(token) {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    encryptionKey,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

function decryptToken(value) {
  const parts = String(value || "").split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted bot token.");
  }

  const iv = Buffer.from(parts[0], "base64url");
  const tag = Buffer.from(parts[1], "base64url");
  const encrypted = Buffer.from(parts[2], "base64url");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey,
    iv
  );

  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}

/* =========================================================
   ADMIN AUTH
   ========================================================= */

async function requirePanelAdmin(req, res, next) {
  try {
    const authorization =
      req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const accessToken =
      authorization.slice(7).trim();

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !userData?.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }

    const {
      data: admin,
      error: adminError,
    } = await supabase
      .from("panel_admins")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError) {
      console.error("Admin lookup error:", adminError);

      return res.status(500).json({
        success: false,
        message: "Admin verification failed.",
      });
    }

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Panel admin access required.",
      });
    }

    req.authUser = userData.user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication check failed.",
    });
  }
}

/* =========================================================
   TELEGRAM API
   ========================================================= */

async function telegram(method, token, body = {}) {
  const response = await fetch(
    `https://api.telegram.org/bot${encodeURIComponent(
      token
    )}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    const error = new Error(
      data?.description ||
        `Telegram API error: ${method}`
    );

    error.telegramCode = data?.error_code;

    throw error;
  }

  return data.result;
}

/* =========================================================
   HELPERS
   ========================================================= */

function cleanCommand(value) {
  return String(value || "")
    .trim()
    .replace(/^\//, "")
    .split(/\s+/)[0]
    .split("@")[0]
    .toLowerCase();
}

function text(value, fallback = "") {
  const result = String(value ?? "").trim();
  return result || fallback;
}

/* =========================================================
   BOT RUNTIMES
   ========================================================= */

const runtimes = new Map();

function runtimeStatus(botId) {
  const runtime = runtimes.get(String(botId));

  if (!runtime) {
    return {
      running: false,
      lastError: null,
    };
  }

  return {
    running: runtime.running,
    lastError: runtime.lastError || null,
  };
}

/* =========================================================
   DATABASE
   ========================================================= */

async function getBot(botId) {
  const {
    data,
    error,
  } = await supabase
    .from("connected_bots")
    .select("*")
    .eq("id", botId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function getCustomization(botId) {
  const {
    data,
    error,
  } = await supabase
    .from("bot_customizations")
    .select("*")
    .eq("connected_bot_id", botId)
    .maybeSingle();

  if (error) throw error;

  return data || {};
}

async function getCommands() {
  const {
    data,
    error,
  } = await supabase
    .from("bot_commands")
    .select(
      "id,command,response_message,is_active"
    )
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) throw error;

  return data || [];
}

async function getButtons() {
  const {
    data,
    error,
  } = await supabase
    .from("bot_buttons")
    .select(
      "id,button_text,button_type,button_value,position,is_active"
    )
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;

  return data || [];
}

/* =========================================================
   TELEGRAM BUTTONS
   ========================================================= */

function makeKeyboard(buttons) {
  const rows = [];

  for (const button of buttons) {
    const buttonText = text(
      button.button_text,
      "Open"
    );

    const type = String(
      button.button_type || "url"
    ).toLowerCase();

    const value = String(
      button.button_value || ""
    ).trim();

    if (!value) continue;

    if (type === "url") {
      rows.push([
        {
          text: buttonText,
          url: value,
        },
      ]);
    }

    if (
      type === "callback" ||
      type === "callback_data"
    ) {
      rows.push([
        {
          text: buttonText,
          callback_data: value.slice(0, 64),
        },
      ]);
    }
  }

  return rows;
}

/* =========================================================
   USERS
   ========================================================= */

async function saveTelegramUser(message) {
  const from = message?.from;

  if (!from?.id) return null;

  const telegramId = String(from.id);

  const payload = {
    telegram_id: telegramId,
    username: from.username || null,
    first_name: from.first_name || null,
  };

  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from("users")
    .select("id,balance,is_premium")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.id) {
    const {
      data,
      error,
    } = await supabase
      .from("users")
      .update(payload)
      .eq("id", existing.id)
      .select("id,balance,is_premium")
      .single();

    if (error) throw error;

    return data;
  }

  const {
    data,
    error,
  } = await supabase
    .from("users")
    .insert({
      ...payload,
      balance: 0,
      is_premium: false,
    })
    .select("id,balance,is_premium")
    .single();

  if (error) throw error;

  return data;
}

async function activity(userId, action, description) {
  if (!userId) return;

  const { error } = await supabase
    .from("activity_logs")
    .insert({
      user_id: userId,
      action,
      description,
    });

  if (error) {
    console.error(
      "Activity log error:",
      error.message
    );
  }
}

/* =========================================================
   SYNC COMMAND MENU
   ========================================================= */

async function syncCommands(token) {
  const commands = await getCommands();

  const telegramCommands = [];
  const used = new Set();

  for (const item of commands) {
    const command = cleanCommand(item.command);

    if (!command || used.has(command)) {
      continue;
    }

    used.add(command);

    telegramCommands.push({
      command: command.slice(0, 32),
      description: text(
        item.response_message,
        "Bot command"
      ).slice(0, 256),
    });

    if (telegramCommands.length >= 100) {
      break;
    }
  }

  await telegram(
    "setMyCommands",
    token,
    {
      commands: telegramCommands,
    }
  );

  return telegramCommands.length;
}

/* =========================================================
   MESSAGE HANDLER
   ========================================================= */

async function handleMessage(
  botId,
  token,
  message
) {
  const chatId = message?.chat?.id;

  if (
    chatId === undefined ||
    chatId === null
  ) {
    return;
  }

  const user = await saveTelegramUser(message);

  const customization =
    await getCustomization(botId);

  const commands =
    await getCommands();

  const buttons =
    await getButtons();

  const keyboard =
    makeKeyboard(buttons);

  const rawText = String(
    message.text || ""
  ).trim();

  const command =
    rawText.startsWith("/")
      ? cleanCommand(rawText)
      : "";

  /* -----------------------------
     /START
     ----------------------------- */

  if (command === "start") {
    const welcome = text(
      customization.welcome_message,
      "Welcome! 👋"
    );

    const payload = {
      chat_id: chatId,
      text: welcome.slice(0, 4096),
    };

    if (keyboard.length) {
      payload.reply_markup = {
        inline_keyboard: keyboard,
      };
    }

    await telegram(
      "sendMessage",
      token,
      payload
    );

    await activity(
      user?.id,
      "bot_start",
      `User started bot ${botId}`
    );

    return;
  }

  /* -----------------------------
     CUSTOM COMMAND
     ----------------------------- */

  if (command) {
    const found = commands.find(
      (item) =>
        cleanCommand(item.command) ===
        command
    );

    if (found) {
      const response = text(
        found.response_message,
        "Command received."
      );

      const payload = {
        chat_id: chatId,
        text: response.slice(0, 4096),
      };

      if (keyboard.length) {
        payload.reply_markup = {
          inline_keyboard: keyboard,
        };
      }

      await telegram(
        "sendMessage",
        token,
        payload
      );

      await activity(
        user?.id,
        "bot_command",
        `Used /${command}`
      );
    }
  }
}

/* =========================================================
   CALLBACK QUERY
   ========================================================= */

async function handleCallback(
  token,
  callback
) {
  if (!callback?.id) return;

  await telegram(
    "answerCallbackQuery",
    token,
    {
      callback_query_id: callback.id,
      text: "Done",
    }
  ).catch((error) => {
    console.error(
      "Callback error:",
      error.message
    );
  });
}

/* =========================================================
   POLLING
   ========================================================= */

async function pollBot(
  botId,
  token,
  runtime
) {
  while (runtime.running) {
    try {
      const updates =
        await telegram(
          "getUpdates",
          token,
          {
            offset:
              runtime.offset ?? undefined,
            timeout: 25,
            limit: 50,
            allowed_updates: [
              "message",
              "callback_query",
            ],
          }
        );

      runtime.lastError = null;

      for (const update of updates || []) {
        runtime.offset =
          Number(update.update_id) + 1;

        try {
          if (update.message) {
            await handleMessage(
              botId,
              token,
              update.message
            );
          }

          if (update.callback_query) {
            await handleCallback(
              token,
              update.callback_query
            );
          }
        } catch (error) {
          console.error(
            `Bot ${botId} update error:`,
            error
          );

          runtime.lastError =
            error.message;
        }
      }
    } catch (error) {
      console.error(
        `Bot ${botId} polling error:`,
        error.message
      );

      runtime.lastError =
        error.message;

      if (error.telegramCode === 409) {
        runtime.lastError =
          "Telegram conflict. Another process is using this bot.";
      }

      if (!runtime.running) {
        break;
      }

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 5000)
      );
    }
  }
}

/* =========================================================
   START BOT
   ========================================================= */

async function startBot(botId) {
  const key = String(botId);

  const existing =
    runtimes.get(key);

  if (existing?.running) {
    return runtimeStatus(botId);
  }

  const bot =
    await getBot(botId);

  if (!bot) {
    throw new Error(
      "Connected bot not found."
    );
  }

  if (!bot.bot_token_encrypted) {
    throw new Error(
      "Bot token is missing."
    );
  }

  const token =
    decryptToken(
      bot.bot_token_encrypted
    );

  /* Remove webhook before polling */

  await telegram(
    "deleteWebhook",
    token,
    {
      drop_pending_updates: false,
    }
  );

  /* Verify bot */

  const telegramBot =
    await telegram(
      "getMe",
      token
    );

  await syncCommands(token);

  const runtime = {
    running: true,
    offset: null,
    lastError: null,
  };

  runtimes.set(
    key,
    runtime
  );

  await supabase
    .from("connected_bots")
    .update({
      status: "connected",
      is_active: true,
      last_connected_at:
        new Date().toISOString(),
      last_seen_at:
        new Date().toISOString(),
    })
    .eq("id", botId);

  pollBot(
    botId,
    token,
    runtime
  ).catch((error) => {
    console.error(
      `Bot ${botId} runtime stopped:`,
      error
    );

    runtime.lastError =
      error.message;

    runtime.running = false;
  });

  return {
    running: true,
    bot: {
      id: botId,
      username:
        telegramBot.username || null,
      first_name:
        telegramBot.first_name || null,
    },
  };
}

/* =========================================================
   STOP BOT
   ========================================================= */

async function stopBot(botId) {
  const key = String(botId);

  const runtime =
    runtimes.get(key);

  if (runtime) {
    runtime.running = false;
    runtimes.delete(key);
  }

  await supabase
    .from("connected_bots")
    .update({
      status: "disconnected",
      last_seen_at:
        new Date().toISOString(),
    })
    .eq("id", botId);

  return {
    running: false,
  };
}

/* =========================================================
   HEALTH
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
   CONNECT BOT
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

      const telegramBot =
        await telegram(
          "getMe",
          botToken
        );

      const encrypted =
        encryptToken(botToken);

      const username =
        telegramBot.username ||
        botUsername ||
        null;

      const now =
        new Date().toISOString();

      const databaseData = {
        bot_name:
          telegramBot.first_name ||
          telegramBot.username ||
          "Telegram Bot",

        bot_username:
          username,

        bot_token_encrypted:
          encrypted,

        status: "connected",

        is_active: true,

        last_connected_at:
          now,

        last_seen_at:
          now,

        updated_at:
          now,
      };

      const {
        data: existing,
        error: lookupError,
      } = await supabase
        .from("connected_bots")
        .select("id")
        .eq(
          "bot_username",
          username
        )
        .maybeSingle();

      if (lookupError) {
        throw lookupError;
      }

      let savedBot;

      if (existing?.id) {
        const {
          data,
          error,
        } = await supabase
          .from("connected_bots")
          .update(databaseData)
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

        if (error) throw error;

        savedBot = data;
      } else {
        const {
          data,
          error,
        } = await supabase
          .from("connected_bots")
          .insert(
            databaseData
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

        if (error) throw error;

        savedBot = data;
      }

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
   START BOT API
   ========================================================= */

app.post(
  "/api/bots/:id/start",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const botId =
        Number(req.params.id);

      if (!Number.isInteger(botId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid bot ID.",
        });
      }

      const result =
        await startBot(botId);

      return res.json({
        success: true,
        message:
          "Telegram bot started.",
        ...result,
      });
    } catch (error) {
      console.error(
        "Start bot error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to start bot.",
      });
    }
  }
);

/* =========================================================
   STOP BOT API
   ========================================================= */

app.post(
  "/api/bots/:id/stop",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const botId =
        Number(req.params.id);

      if (!Number.isInteger(botId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid bot ID.",
        });
      }

      const result =
        await stopBot(botId);

      return res.json({
        success: true,
        message:
          "Telegram bot stopped.",
        ...result,
      });
    } catch (error) {
      console.error(
        "Stop bot error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to stop bot.",
      });
    }
  }
);

/* =========================================================
   BOT STATUS API
   ========================================================= */

app.get(
  "/api/bots/:id/status",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const botId =
        Number(req.params.id);

      if (!Number.isInteger(botId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid bot ID.",
        });
      }

      const bot =
        await getBot(botId);

      if (!bot) {
        return res.status(404).json({
          success: false,
          message:
            "Bot not found.",
        });
      }

      return res.json({
        success: true,
        bot: {
          id: bot.id,
          bot_name:
            bot.bot_name,
          bot_username:
            bot.bot_username,
          database_status:
            bot.status,
          is_active:
            bot.is_active,
          runtime:
            runtimeStatus(botId),
        },
      });
    } catch (error) {
      console.error(
        "Bot status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to get bot status.",
      });
    }
  }
);

/* =========================================================
   AUTO START ACTIVE BOTS
   ========================================================= */

async function autoStartBots() {
  try {
    const {
      data: bots,
      error,
    } = await supabase
      .from("connected_bots")
      .select("id,is_active")
      .eq("is_active", true);

    if (error) {
      console.error(
        "Auto-start lookup error:",
        error
      );
      return;
    }

    for (const bot of bots || []) {
      try {
        await startBot(bot.id);

        console.log(
          `Auto-started bot ${bot.id}`
        );
      } catch (error) {
        console.error(
          `Could not auto-start bot ${bot.id}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Auto-start error:",
      error
    );
  }
}

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
   ERROR HANDLER
   ========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "Server error:",
      error
    );

    res.status(500).json({
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
  async () => {
    console.log(
      `FZ BOT TG backend running on port ${PORT}`
    );

    await autoStartBots();
  }
);