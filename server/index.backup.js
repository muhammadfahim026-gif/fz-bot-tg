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

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const allowedLocalOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
  ];

  if (allowedLocalOrigins.includes(origin)) {
    return true;
  }

  // GitHub Codespaces public URLs
  if (
    /^https:\/\/[a-zA-Z0-9-]+-\d+\.app\.github\.dev$/.test(origin)
  ) {
    return true;
  }

  return false;
}

/*
  CORS headers MUST be added before authentication.
  Browser first sends OPTIONS preflight request.
*/
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
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

    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.setHeader("Access-Control-Max-Age", "86400");
  }

  next();
});

/*
  Explicit OPTIONS handler.
  This is the important part for browser preflight.
*/
app.options(/.*/, (req, res) => {
  const origin = req.headers.origin;

  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({
      success: false,
      message: "CORS origin not allowed.",
    });
  }

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

  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.setHeader("Access-Control-Max-Age", "86400");

  return res.sendStatus(204);
});

app.use(express.json({ limit: "1mb" }));

/* =========================================================
   ENVIRONMENT
   ========================================================= */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const encryptionKeyHex = process.env.BOT_ENCRYPTION_KEY;

if (!supabaseUrl || !supabaseSecretKey || !encryptionKeyHex) {
  console.error("Missing required server environment variables.");
  console.error(
    "Required: SUPABASE_URL, SUPABASE_SECRET_KEY, BOT_ENCRYPTION_KEY"
  );
  process.exit(1);
}

let encryptionKey;

try {
  encryptionKey = Buffer.from(encryptionKeyHex, "hex");

  if (encryptionKey.length !== 32) {
    throw new Error(
      "BOT_ENCRYPTION_KEY must be 64 hexadecimal characters."
    );
  }
} catch (error) {
  console.error("Encryption key error:", error.message);
  process.exit(1);
}

const adminSupabase = createClient(
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
   BOT TOKEN ENCRYPTION
   Format: iv.tag.ciphertext
   ========================================================= */

function encryptBotToken(token) {
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

function decryptBotToken(value) {
  const [
    ivPart,
    tagPart,
    encryptedPart,
  ] = String(value || "").split(".");

  if (!ivPart || !tagPart || !encryptedPart) {
    throw new Error(
      "Stored bot token has an invalid encrypted format."
    );
  }

  const iv = Buffer.from(ivPart, "base64url");
  const tag = Buffer.from(tagPart, "base64url");
  const encrypted = Buffer.from(
    encryptedPart,
    "base64url"
  );

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
   PANEL ADMIN AUTH
   ========================================================= */

async function requirePanelAdmin(req, res, next) {
  try {
    const authorization =
      req.headers.authorization || "";

    const token = authorization
      .startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      data: userData,
      error: userError,
    } = await adminSupabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }

    const {
      data: adminRow,
      error: adminError,
    } = await adminSupabase
      .from("panel_admins")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError) {
      console.error(
        "Admin lookup error:",
        adminError
      );

      return res.status(500).json({
        success: false,
        message: "Admin verification failed.",
      });
    }

    if (!adminRow) {
      return res.status(403).json({
        success: false,
        message: "Panel admin access required.",
      });
    }

    req.authUser = userData.user;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authentication check failed.",
    });
  }
}

/* =========================================================
   TELEGRAM API HELPERS
   ========================================================= */

async function telegramApi(
  token,
  method,
  payload = {}
) {
  const response = await fetch(
    `https://api.telegram.org/bot${encodeURIComponent(
      token
    )}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok || !data?.ok) {
    const error = new Error(
      data?.description ||
        `Telegram API request failed: ${method}`
    );

    error.telegramCode =
      data?.error_code;

    throw error;
  }

  return data.result;
}

function cleanCommand(command) {
  return String(command || "")
    .trim()
    .replace(/^\//, "")
    .split(/\s+/)[0]
    .split("@")[0]
    .toLowerCase();
}

function safeText(value, fallback) {
  const text = String(value ?? "").trim();

  return text || fallback;
}

/* =========================================================
   BOT RUNTIME MANAGER
   ========================================================= */

const runtimes = new Map();

function runtimeInfo(botId) {
  const runtime =
    runtimes.get(String(botId));

  if (!runtime) {
    return {
      running: false,
      offset: null,
      lastError: null,
    };
  }

  return {
    running: runtime.running,
    offset: runtime.offset ?? null,
    lastError:
      runtime.lastError || null,
  };
}

async function loadBotRecord(botId) {
  const {
    data,
    error,
  } = await adminSupabase
    .from("connected_bots")
    .select("*")
    .eq("id", botId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function loadCustomization(botId) {
  const {
    data,
    error,
  } = await adminSupabase
    .from("bot_customizations")
    .select("*")
    .eq("connected_bot_id", botId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || {};
}

async function loadCommands() {
  const {
    data,
    error,
  } = await adminSupabase
    .from("bot_commands")
    .select(
      "command,response_message,is_active"
    )
    .eq("is_active", true)
    .order("id", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

async function loadButtons() {
  const {
    data,
    error,
  } = await adminSupabase
    .from("bot_buttons")
    .select(
      "button_text,button_type,button_value,position,is_active"
    )
    .eq("is_active", true)
    .order("position", {
      ascending: true,
    })
    .order("id", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

function buildInlineKeyboard(buttons) {
  const rows = [];

  for (const button of buttons) {
    const text = safeText(
      button.button_text,
      "Open"
    );

    const type = String(
      button.button_type || "url"
    ).toLowerCase();

    const value = String(
      button.button_value || ""
    ).trim();

    if (!value) {
      continue;
    }

    if (type === "url") {
      rows.push([
        {
          text,
          url: value,
        },
      ]);
    } else if (
      type === "callback" ||
      type === "callback_data"
    ) {
      rows.push([
        {
          text,
          callback_data:
            value.slice(0, 64),
        },
      ]);
    }
  }

  return rows;
}

async function syncTelegramCommands(token) {
  const commands =
    await loadCommands();

  const telegramCommands = [];
  const seen = new Set();

  for (const item of commands) {
    const command =
      cleanCommand(item.command);

    if (!command || seen.has(command)) {
      continue;
    }

    seen.add(command);

    telegramCommands.push({
      command: command.slice(0, 32),
      description: safeText(
        item.response_message,
        "Bot command"
      ).slice(0, 256),
    });

    if (telegramCommands.length >= 100) {
      break;
    }
  }

  await telegramApi(
    token,
    "setMyCommands",
    {
      commands: telegramCommands,
    }
  );

  return telegramCommands.length;
}

/* =========================================================
   TELEGRAM USER
   ========================================================= */

async function upsertTelegramUser(message) {
  const from = message?.from;

  if (!from?.id) {
    return null;
  }

  const telegramId =
    String(from.id);

  const payload = {
    telegram_id: telegramId,
    username:
      from.username || null,
    first_name:
      from.first_name || null,
  };

  const {
    data: existing,
    error: existingError,
  } = await adminSupabase
    .from("users")
    .select(
      "id,balance,is_premium"
    )
    .eq(
      "telegram_id",
      telegramId
    )
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    const {
      data,
      error,
    } = await adminSupabase
      .from("users")
      .update(payload)
      .eq("id", existing.id)
      .select(
        "id,balance,is_premium"
      )
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const {
    data,
    error,
  } = await adminSupabase
    .from("users")
    .insert({
      ...payload,
      balance: 0,
      is_premium: false,
    })
    .select(
      "id,balance,is_premium"
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   ACTIVITY LOG
   ========================================================= */

async function logActivity(
  userId,
  action,
  description
) {
  if (!userId) {
    return;
  }

  const { error } =
    await adminSupabase
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
   CALLBACK QUERY
   ========================================================= */

async function handleCallbackQuery(
  token,
  callbackQuery
) {
  if (!callbackQuery?.id) {
    return;
  }

  try {
    await telegramApi(
      token,
      "answerCallbackQuery",
      {
        callback_query_id:
          callbackQuery.id,
        text: "Done",
      }
    );
  } catch (error) {
    console.error(
      "Callback answer error:",
      error.message
    );
  }
}

/* =========================================================
   HANDLE TELEGRAM MESSAGE
   ========================================================= */

async function handleMessage(
  token,
  botId,
  message
) {
  const chatId =
    message?.chat?.id;

  if (
    chatId === undefined ||
    chatId === null
  ) {
    return;
  }

  const user =
    await upsertTelegramUser(
      message
    );

  const custom =
    await loadCustomization(
      botId
    );

  const buttons =
    await loadButtons();

  const commands =
    await loadCommands();

  const inline_keyboard =
    buildInlineKeyboard(
      buttons
    );

  const rawText =
    String(message.text || "")
      .trim();

  const commandName =
    rawText.startsWith("/")
      ? cleanCommand(rawText)
      : "";

  /* =========================
     /start
     ========================= */

  if (commandName === "start") {
    const welcome =
      safeText(
        custom.welcome_message,
        "Welcome! Your bot is ready."
      );

    const payload = {
      chat_id: chatId,
      text: welcome.slice(0, 4096),
    };

    if (inline_keyboard.length) {
      payload.reply_markup = {
        inline_keyboard,
      };
    }

    await telegramApi(
      token,
      "sendMessage",
      payload
    );

    await logActivity(
      user?.id,
      "bot_start",
      `Started bot ${botId}`
    );

    return;
  }

  /* =========================
     CUSTOM COMMAND
     ========================= */

  if (commandName) {
    const matched =
      commands.find(
        (item) =>
          cleanCommand(
            item.command
          ) === commandName
      );

    if (matched) {
      const responseMessage =
        safeText(
          matched.response_message,
          "Command received."
        );

      const payload = {
        chat_id: chatId,
        text: responseMessage.slice(
          0,
          4096
        ),
      };

      if (inline_keyboard.length) {
        payload.reply_markup = {
          inline_keyboard,
        };
      }

      await telegramApi(
        token,
        "sendMessage",
        payload
      );

      await logActivity(
        user?.id,
        "bot_command",
        `Used /${commandName}`
      );

      return;
    }
  }
}

/* =========================================================
   BOT POLLING
   ========================================================= */

async function pollBot(
  botId,
  token,
  runtime
) {
  while (runtime.running) {
    try {
      const updates =
        await telegramApi(
          token,
          "getUpdates",
          {
            offset:
              runtime.offset ??
              undefined,
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
              token,
              botId,
              update.message
            );
          } else if (
            update.callback_query
          ) {
            await handleCallbackQuery(
              token,
              update.callback_query
            );
          }
        } catch (updateError) {
          console.error(
            `Bot ${botId} update ${update.update_id} error:`,
            updateError
          );

          runtime.lastError =
            updateError.message;
        }
      }
    } catch (error) {
      runtime.lastError =
        error.message;

      console.error(
        `Bot ${botId} polling error:`,
        error.message
      );

      if (
        error?.telegramCode === 409
      ) {
        runtime.lastError =
          "Telegram conflict: another getUpdates/webhook process is using this bot.";
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
   START BOT RUNTIME
   ========================================================= */

async function startBotRuntime(botId) {
  const key = String(botId);

  const existingRuntime =
    runtimes.get(key);

  if (existingRuntime?.running) {
    return {
      alreadyRunning: true,
      ...runtimeInfo(botId),
    };
  }

  const bot =
    await loadBotRecord(botId);

  if (!bot) {
    throw new Error(
      "Connected bot not found."
    );
  }

  if (!bot.is_active) {
    throw new Error(
      "This bot is disabled."
    );
  }

  if (!bot.bot_token_encrypted) {
    throw new Error(
      "Encrypted bot token is missing."
    );
  }

  const token =
    decryptBotToken(
      bot.bot_token_encrypted
    );

  /*
    Long polling and webhook cannot
    be used together.
  */
  await telegramApi(
    token,
    "deleteWebhook",
    {
      drop_pending_updates: false,
    }
  );

  const me =
    await telegramApi(
      token,
      "getMe"
    );

  const commandCount =
    await syncTelegramCommands(
      token
    );

  const runtime = {
    running: true,
    offset: null,
    lastError: null,
    startedAt:
      new Date().toISOString(),
  };

  runtimes.set(
    key,
    runtime
  );

  await adminSupabase
    .from("connected_bots")
    .update({
      status: "running",
      last_connected_at:
        new Date().toISOString(),
      last_seen_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", botId);

  pollBot(
    botId,
    token,
    runtime
  ).catch((error) => {
    console.error(
      `Bot ${botId} runtime stopped unexpectedly:`,
      error
    );

    runtime.lastError =
      error.message;

    runtime.running = false;
  });

  return {
    alreadyRunning: false,

    bot: {
      id: bot.id,
      bot_name:
        bot.bot_name,
      bot_username:
        bot.bot_username ||
        me?.username ||
        null,
    },

    commandCount,

    ...runtimeInfo(botId),
  };
}

/* =========================================================
   STOP BOT RUNTIME
   ========================================================= */

async function stopBotRuntime(botId) {
  const key = String(botId);

  const runtime =
    runtimes.get(key);

  if (runtime) {
    runtime.running = false;
    runtimes.delete(key);
  }

  const {
    data,
    error,
  } = await adminSupabase
    .from("connected_bots")
    .update({
      status: "stopped",
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", botId)
    .select(
      "id,bot_name,bot_username,status,is_active,last_connected_at,last_seen_at"
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
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
      runtimes:
        runtimes.size,
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
          ? req.body.botUsername
              .trim()
              .replace(/^@/, "")
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

      /*
        Verify token directly with Telegram.
      */
      const telegramBot =
        await telegramApi(
          botToken,
          "getMe"
        );

      const usernameForLookup =
        telegramBot.username ||
        botUsername ||
        "";

      /*
        Check whether this bot
        already exists.
      */
      const {
        data: existing,
        error: existingError,
      } = await adminSupabase
        .from("connected_bots")
        .select("id")
        .eq(
          "bot_username",
          usernameForLookup
        )
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      const now =
        new Date().toISOString();

      const encryptedToken =
        encryptBotToken(
          botToken
        );

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

      /*
        UPDATE existing bot
      */
      if (existing?.id) {
        const {
          data,
          error,
        } = await adminSupabase
          .from("connected_bots")
          .update(
            botDatabaseData
          )
          .eq(
            "id",
            existing.id
          )
          .select(
            "id,user_id,bot_name,bot_username,status,is_active,last_connected_at,last_seen_at"
          )
          .single();

        if (error) {
          throw error;
        }

        savedBot = data;
      }

      /*
        INSERT new bot
      */
      else {
        const {
          data,
          error,
        } = await adminSupabase
          .from("connected_bots")
          .insert(
            botDatabaseData
          )
          .select(
            "id,user_id,bot_name,bot_username,status,is_active,last_connected_at,last_seen_at"
          )
          .single();

        if (error) {
          throw error;
        }

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
   START BOT
   ========================================================= */

app.post(
  "/api/bots/:id/start",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const botId =
        Number(req.params.id);

      if (
        !Number.isInteger(botId) ||
        botId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid bot ID.",
        });
      }

      const result =
        await startBotRuntime(
          botId
        );

      return res.json({
        success: true,

        message:
          result.alreadyRunning
            ? "Bot is already running."
            : "Telegram bot started successfully.",

        ...result,
      });
    } catch (error) {
      console.error(
        "Bot start error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Bot start failed.",
      });
    }
  }
);

/* =========================================================
   STOP BOT
   ========================================================= */

app.post(
  "/api/bots/:id/stop",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const botId =
        Number(req.params.id);

      if (
        !Number.isInteger(botId) ||
        botId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid bot ID.",
        });
      }

      const bot =
        await stopBotRuntime(
          botId
        );

      return res.json({
        success: true,
        message:
          "Telegram bot stopped successfully.",
        bot,
        runtime:
          runtimeInfo(botId),
      });
    } catch (error) {
      console.error(
        "Bot stop error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Bot stop failed.",
      });
    }
  }
);

/* =========================================================
   BOT STATUS
   ========================================================= */

app.get(
  "/api/bots/:id/status",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const botId =
        Number(req.params.id);

      if (
        !Number.isInteger(botId) ||
        botId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid bot ID.",
        });
      }

      const bot =
        await loadBotRecord(
          botId
        );

      if (!bot) {
        return res.status(404).json({
          success: false,
          message:
            "Connected bot not found.",
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
          status:
            bot.status,
          is_active:
            bot.is_active,
          last_connected_at:
            bot.last_connected_at,
          last_seen_at:
            bot.last_seen_at,
        },

        runtime:
          runtimeInfo(botId),
      });
    } catch (error) {
      console.error(
        "Bot status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Bot status check failed.",
      });
    }
  }
);

/* =========================================================
   START ALL ACTIVE BOTS
   ========================================================= */

async function startAllActiveBots() {
  const {
    data,
    error,
  } = await adminSupabase
    .from("connected_bots")
    .select(
      "id,is_active,status"
    )
    .eq(
      "is_active",
      true
    );

  if (error) {
    console.error(
      "Active bot load error:",
      error
    );

    return;
  }

  for (const bot of data || []) {
    try {
      await startBotRuntime(
        bot.id
      );

      console.log(
        `Bot ${bot.id} runtime started.`
      );
    } catch (error) {
      console.error(
        `Could not start bot ${bot.id}:`,
        error.message
      );

      await adminSupabase
        .from("connected_bots")
        .update({
          status: "error",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          bot.id
        );
    }
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
  async () => {
    console.log(
      `FZ BOT TG backend running on port ${PORT}`
    );

    await startAllActiveBots();
  }
);