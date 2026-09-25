import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "server/.env" });

const app = express();
const PORT = Number(process.env.PORT || 3000);

/* =========================================================
   BASIC SETTINGS
   ========================================================= */

app.disable("x-powered-by");

app.use(express.json({ limit: "1mb" }));

/* =========================================================
   CORS
   ========================================================= */

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const allowed = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
  ];

  if (allowed.includes(origin)) {
    return true;
  }

  return /^https:\/\/[a-zA-Z0-9-]+-\d+\.app\.github\.dev$/.test(
    origin
  );
}

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

    res.setHeader(
      "Access-Control-Allow-Credentials",
      "true"
    );
  }

  next();
});

app.options(/.*/, (req, res) => {
  const origin = req.headers.origin;

  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({
      success: false,
      message: "CORS origin not allowed.",
    });
  }

  if (origin) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );
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

  res.setHeader(
    "Access-Control-Allow-Credentials",
    "true"
  );

  return res.sendStatus(204);
});

/* =========================================================
   ENVIRONMENT
   ========================================================= */

const supabaseUrl = process.env.SUPABASE_URL;
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
    "Required: SUPABASE_URL, SUPABASE_SECRET_KEY, BOT_ENCRYPTION_KEY"
  );

  process.exit(1);
}

/* =========================================================
   ENCRYPTION
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
  const parts = String(value || "").split(".");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted bot token."
    );
  }

  const [ivPart, tagPart, encryptedPart] =
    parts;

  const iv = Buffer.from(
    ivPart,
    "base64url"
  );

  const tag = Buffer.from(
    tagPart,
    "base64url"
  );

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
   ADMIN AUTH
   ========================================================= */

async function requirePanelAdmin(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const accessToken = authorization
      .slice("Bearer ".length)
      .trim();

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Verify the Supabase access token.
    const {
      data: userData,
      error: userError,
    } = await adminSupabase.auth.getUser(accessToken);

    if (userError || !userData?.user?.id) {
      console.error(
        "Supabase user verification failed:",
        userError?.message || "User not found"
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }

    const authUserId = userData.user.id;
    const authUserFingerprint = crypto
  .createHash("sha256")
  .update(String(authUserId))
  .digest("hex")
  .slice(0, 12);

console.log(
  "AUTH USER FINGERPRINT:",
  authUserFingerprint
);

    // Check whether this authenticated user is a panel admin.
    const {
      data: adminRow,
      error: adminError,
    } = await adminSupabase
      .from("panel_admins")
      .select("user_id")
      .eq("user_id", authUserId)
      .maybeSingle();

    if (adminError) {
      console.error(
        "Panel admin lookup failed:",
        adminError.message
      );

      return res.status(500).json({
        success: false,
        message: "Admin verification failed.",
      });
    }
const adminFingerprint = adminRow?.user_id
  ? crypto
      .createHash("sha256")
      .update(String(adminRow.user_id))
      .digest("hex")
      .slice(0, 12)
  : "NONE";

console.log(
  "ADMIN ROW FINGERPRINT:",
  adminFingerprint
);
    if (!adminRow) {
      console.error(
        "Panel admin access denied for user:",
        authUserId
      );

      return res.status(403).json({
        success: false,
        message: "Panel admin access required.",
      });
    }

    // Authentication + admin authorization successful.
    req.authUser = userData.user;
    req.panelAdmin = adminRow;

    next();
  } catch (error) {
    console.error(
      "Panel admin authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authentication check failed.",
    });
  }
}


/* =========================================================
   TELEGRAM API
   ========================================================= */

async function telegramApi(
  token,
  method,
  payload = {}
) {
  const url =
    `https://api.telegram.org/bot${token}/${method}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data =
    await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    const error = new Error(
      data?.description ||
        `Telegram API failed: ${method}`
    );

    error.telegramCode =
      data?.error_code;

    throw error;
  }

  return data.result;
}

/* =========================================================
   HELPERS
   ========================================================= */

function cleanCommand(command) {
  return String(command || "")
    .trim()
    .replace(/^\//, "")
    .split(/\s+/)[0]
    .split("@")[0]
    .toLowerCase();
}

function normalizeCommand(command) {
  return String(command || "")
    .trim()
    .replace(/^\//, "")
    .split(/\s+/)[0]
    .split("@")[0]
    .toLowerCase();
}

function safeText(value, fallback) {
  const text = String(
    value ?? ""
  ).trim();

  return text || fallback;
}

/* =========================================================
   DATABASE
   ========================================================= */

async function getBot(botId) {
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

async function getCustomization(botId) {
  const {
    data,
    error,
  } = await adminSupabase
    .from("bot_customizations")
    .select("*")
    .eq(
      "connected_bot_id",
      botId
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || {};
}

async function getCommands() {
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

async function getButtons() {
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

/* =========================================================
   USER
   ========================================================= */

async function saveTelegramUser(message) {
  const from = message?.from;

  if (!from?.id) {
    return null;
  }

  const telegramId =
    String(from.id);

  const userPayload = {
    telegram_id: telegramId,
    username:
      from.username || null,
    first_name:
      from.first_name || null,
  };

  const {
    data: existing,
    error: existingError,
  } =
    await adminSupabase
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
    } =
      await adminSupabase
        .from("users")
        .update(userPayload)
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
  } =
    await adminSupabase
      .from("users")
      .insert({
        ...userPayload,
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
   ACTIVITY
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
   BUTTONS
   ========================================================= */

function buildKeyboard(buttons) {
  const rows = [];

  for (const button of buttons) {
    if (!button?.is_active) {
      continue;
    }

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
    }

    if (
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

/* =========================================================
   TELEGRAM COMMAND SYNC
   ========================================================= */

async function syncCommands(token) {
  const commands =
    await getCommands();

  const result = [];
  const seen = new Set();

  for (const item of commands) {
    const command =
      cleanCommand(item.command);

    if (
      !command ||
      seen.has(command)
    ) {
      continue;
    }

    seen.add(command);

    result.push({
      command: command.slice(0, 32),
      description: safeText(
        item.response_message,
        "Bot command"
      ).slice(0, 256),
    });

    if (result.length >= 100) {
      break;
    }
  }

  await telegramApi(
    token,
    "setMyCommands",
    {
      commands: result,
    }
  );

  return result.length;
}

/* =========================================================
   BOT RUNTIME
   ========================================================= */

const runtimes = new Map();

function getRuntime(botId) {
  return runtimes.get(
    String(botId)
  );
}

function runtimeStatus(botId) {
  const runtime =
    getRuntime(botId);

  if (!runtime) {
    return {
      running: false,
      lastError: null,
      lastSeenAt: null,
    };
  }

  return {
    running: runtime.running,
    lastError:
      runtime.lastError || null,
    lastSeenAt:
      runtime.lastSeenAt || null,
  };
}

/* =========================================================
   HANDLE CALLBACK
   ========================================================= */

async function handleCallback(
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
      "Callback error:",
      error.message
    );
  }
}

/* =========================================================
   HANDLE MESSAGE
   ========================================================= */

async function handleMessage(
  token,
  botId,
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

  const customization = await getCustomization(botId);
  const commands = await getCommands();
  const buttons = await getButtons();

  const keyboard = buildKeyboard(buttons);

  const text = String(message.text || "").trim();

  const command = text.startsWith("/")
    ? cleanCommand(text)
    : "";

  /* -----------------------------------------
     START
  ----------------------------------------- */

  if (command === "start") {
    const welcome = safeText(
      customization.welcome_message,
      "Welcome! Your bot is ready."
    );

    const payload = {
      chat_id: chatId,
      text: welcome.slice(0, 4096),
    };

    if (keyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: keyboard,
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
      `Telegram user started bot ${botId}`
    );

    return;
  }

  /* -----------------------------------------
     CUSTOM COMMAND
  ----------------------------------------- */

  if (command) {
    const matched = commands.find(
      (item) =>
        cleanCommand(item.command) === command &&
        item.is_active !== false
    );

    if (matched) {
      const response = safeText(
        matched.response_message,
        "Command received."
      );

      const mediaType = String(
        matched.media_type || "none"
      )
        .trim()
        .toLowerCase();

      const mediaUrl = String(
        matched.media_url || ""
      ).trim();

      /*
       * PHOTO
       */

      if (
        mediaType === "photo" &&
        mediaUrl
      ) {
        const payload = {
          chat_id: chatId,
          photo: mediaUrl,
          caption: response.slice(0, 1024),
        };

        if (keyboard.length > 0) {
          payload.reply_markup = {
            inline_keyboard: keyboard,
          };
        }

        await telegramApi(
          token,
          "sendPhoto",
          payload
        );
      }

      /*
       * VIDEO
       */

      else if (
        mediaType === "video" &&
        mediaUrl
      ) {
        const payload = {
          chat_id: chatId,
          video: mediaUrl,
          caption: response.slice(0, 1024),
        };

        if (keyboard.length > 0) {
          payload.reply_markup = {
            inline_keyboard: keyboard,
          };
        }

        await telegramApi(
          token,
          "sendVideo",
          payload
        );
      }

      /*
       * NORMAL TEXT
       */

      else {
        const payload = {
          chat_id: chatId,
          text: response.slice(0, 4096),
        };

        if (keyboard.length > 0) {
          payload.reply_markup = {
            inline_keyboard: keyboard,
          };
        }

        await telegramApi(
          token,
          "sendMessage",
          payload
        );
      }

      await logActivity(
        user?.id,
        "bot_command",
        `Used /${command} on bot ${botId}`
      );

      return;
    }
  }

  /* -----------------------------------------
     NORMAL TEXT
  ----------------------------------------- */

  if (text) {
    const defaultReply = safeText(
      customization.default_reply,
      ""
    );

    if (defaultReply) {
      const payload = {
        chat_id: chatId,
        text: defaultReply.slice(0, 4096),
      };

      if (keyboard.length > 0) {
        payload.reply_markup = {
          inline_keyboard: keyboard,
        };
      }

      await telegramApi(
        token,
        "sendMessage",
        payload
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
    return {
      success: true,
      message: "Bot is already running.",
    };
  }

  const bot =
    await getBot(botId);

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

  const token =
    decryptBotToken(
      bot.bot_token_encrypted
    );

  /* Verify token */

  const telegramBot =
    await telegramApi(
      token,
      "getMe"
    );

  /* Remove webhook so polling works */

  try {
    await telegramApi(
      token,
      "deleteWebhook",
      {
        drop_pending_updates: false,
      }
    );
  } catch (error) {
    console.error(
      "Webhook removal warning:",
      error.message
    );
  }

  /* Sync commands */

  try {
    await syncCommands(token);
  } catch (error) {
    console.error(
      "Command sync warning:",
      error.message
    );
  }

  const runtime = {
    running: true,
    offset: 0,
    lastError: null,
    lastSeenAt: null,
    stopping: false,
  };

  runtimes.set(key, runtime);

  await adminSupabase
    .from("connected_bots")
    .update({
      status: "connected",
      last_connected_at:
        new Date().toISOString(),
      last_seen_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", botId);

  console.log(
    `Telegram bot started: @${telegramBot.username}`
  );

  /* -----------------------------------------
     POLLING LOOP
  ----------------------------------------- */

  (async () => {
    while (
      runtime.running &&
      !runtime.stopping
    ) {
      try {
        const updates =
          await telegramApi(
            token,
            "getUpdates",
            {
              offset: runtime.offset,
              timeout: 25,
              allowed_updates: [
                "message",
                "callback_query",
              ],
            }
          );

        runtime.lastSeenAt =
          new Date().toISOString();

        if (
          Array.isArray(updates) &&
          updates.length
        ) {
          for (const update of updates) {
            runtime.offset =
              Number(update.update_id) + 1;

            try {
              if (update.message) {
                await handleMessage(
                  token,
                  botId,
                  update.message
                );
              }

              if (
                update.callback_query
              ) {
                await handleCallback(
                  token,
                  update.callback_query
                );
              }
            } catch (error) {
              console.error(
                `Update error for bot ${botId}:`,
                error.message
              );

              runtime.lastError =
                error.message;
            }
          }
        }

        await adminSupabase
          .from("connected_bots")
          .update({
            status: "connected",
            last_seen_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", botId);
      } catch (error) {
        if (
          !runtime.running ||
          runtime.stopping
        ) {
          break;
        }

        runtime.lastError =
          error.message;

        console.error(
          `Polling error for bot ${botId}:`,
          error.message
        );

        await adminSupabase
          .from("connected_bots")
          .update({
            status: "error",
            last_seen_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", botId);

        /* Wait before retry */

        await new Promise(
          (resolve) =>
            setTimeout(resolve, 3000)
        );
      }
    }

    console.log(
      `Telegram bot polling stopped: ${botId}`
    );
  })();

  return {
    success: true,
    bot: {
      id: bot.id,
      name: bot.bot_name,
      username:
        telegramBot.username,
      firstName:
        telegramBot.first_name,
      idTelegram:
        telegramBot.id,
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

  if (!runtime) {
    await adminSupabase
      .from("connected_bots")
      .update({
        status: "disconnected",
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", botId);

    return {
      success: true,
      message: "Bot is not running.",
    };
  }

  runtime.stopping = true;
  runtime.running = false;

  runtimes.delete(key);

  await adminSupabase
    .from("connected_bots")
    .update({
      status: "disconnected",
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", botId);

  return {
    success: true,
    message: "Bot stopped.",
  };
}

/* =========================================================
   ROOT
   ========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FZ BOT TG backend is running.",
    service: "telegram-bot-backend",
  });
});

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
      telegramBots:
        runtimes.size,
      time:
        new Date().toISOString(),
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
      const botUsername =
        String(
          req.body?.botUsername || ""
        )
          .trim()
          .replace(/^@/, "");

      const botToken =
        String(
          req.body?.botToken || ""
        ).trim();

      if (!botUsername) {
        return res.status(400).json({
          success: false,
          message:
            "Bot username is required.",
        });
      }

      if (!botToken) {
        return res.status(400).json({
          success: false,
          message:
            "Bot token is required.",
        });
      }

      /* ---------------------------------------
         VERIFY TELEGRAM TOKEN
      --------------------------------------- */

      let telegramBot;

      try {
        telegramBot =
          await telegramApi(
            botToken,
            "getMe"
          );
      } catch (error) {
        console.error(
          "Telegram token verification failed:",
          error.message
        );

        return res.status(400).json({
          success: false,
          message:
            error.message ||
            "Invalid Telegram bot token.",
        });
      }

      /* ---------------------------------------
         CHECK USERNAME
      --------------------------------------- */

      if (
        telegramBot.username &&
        telegramBot.username
          .toLowerCase() !==
          botUsername.toLowerCase()
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Bot username does not match the token. Token belongs to @${telegramBot.username}.`,
        });
      }

      /* ---------------------------------------
         CHECK EXISTING BOT
      --------------------------------------- */

      const {
        data: existingBot,
        error: existingError,
      } =
        await adminSupabase
          .from("connected_bots")
          .select("id")
          .eq(
            "bot_username",
            telegramBot.username
          )
          .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingBot?.id) {
        /* Update existing bot */

        const encryptedToken =
          encryptBotToken(
            botToken
          );

        const {
          data,
          error,
        } =
          await adminSupabase
            .from("connected_bots")
            .update({
              bot_name:
                telegramBot.first_name ||
                botUsername,
              bot_username:
                telegramBot.username ||
                botUsername,
              bot_token_encrypted:
                encryptedToken,
              status: "connected",
              is_active: true,
              last_connected_at:
                new Date().toISOString(),
              last_seen_at:
                new Date().toISOString(),
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              "id",
              existingBot.id
            )
            .select(
              "id,bot_name,bot_username,status,is_active"
            )
            .single();

        if (error) {
          throw error;
        }

        /* Start bot */

        await startBot(data.id);

        return res.json({
          success: true,
          message:
            "Telegram bot connected successfully.",
          bot: data,
        });
      }

      /* ---------------------------------------
         CREATE NEW BOT
      --------------------------------------- */

      const encryptedToken =
        encryptBotToken(
          botToken
        );

      const {
        data: newBot,
        error: insertError,
      } =
        await adminSupabase
          .from("connected_bots")
          .insert({
            user_id: null,
            bot_name:
              telegramBot.first_name ||
              botUsername,
            bot_username:
              telegramBot.username ||
              botUsername,
            bot_token_encrypted:
              encryptedToken,
            status: "connected",
            is_active: true,
            last_connected_at:
              new Date().toISOString(),
            last_seen_at:
              new Date().toISOString(),
          })
          .select(
            "id,bot_name,bot_username,status,is_active"
          )
          .single();

      if (insertError) {
        throw insertError;
      }

      /* ---------------------------------------
         CREATE CUSTOMIZATION ROW
      --------------------------------------- */

      const {
        error: customizationError,
      } =
        await adminSupabase
          .from("bot_customizations")
          .insert({
            connected_bot_id:
              newBot.id,
            bot_name:
              telegramBot.first_name ||
              botUsername,
            welcome_message:
              "Welcome! Your bot is ready.",
            is_active: true,
          });

      if (
        customizationError &&
        customizationError.code !==
          "23505"
      ) {
        console.error(
          "Customization insert warning:",
          customizationError.message
        );
      }

      /* ---------------------------------------
         START BOT
      --------------------------------------- */

      await startBot(
        newBot.id
      );

      await logActivity(
        null,
        "bot_connected",
        `Connected Telegram bot @${telegramBot.username}`
      );

      return res.json({
        success: true,
        message:
          "Telegram bot connected successfully.",
        bot: {
          ...newBot,
          telegram_id:
            telegramBot.id,
          telegram_first_name:
            telegramBot.first_name,
          telegram_username:
            telegramBot.username,
        },
      });
    } catch (error) {
      console.error(
        "Connect bot error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Bot connection failed.",
      });
    }
  }
);

/* =========================================================
   START
   ========================================================= */

app.post(
  "/api/bots/:id/start",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const result =
        await startBot(
          req.params.id
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Start bot error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to start bot.",
      });
    }
  }
);

/* =========================================================
   STOP
   ========================================================= */

app.post(
  "/api/bots/:id/stop",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const result =
        await stopBot(
          req.params.id
        );

      res.json(result);
    } catch (error) {
      console.error(
        "Stop bot error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to stop bot.",
      });
    }
  }
);

/* =========================================================
   STATUS
   ========================================================= */

app.get(
  "/api/bots/:id/status",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const bot =
        await getBot(
          req.params.id
        );

      if (!bot) {
        return res.status(404).json({
          success: false,
          message:
            "Bot not found.",
        });
      }

      res.json({
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
          runtime:
            runtimeStatus(
              bot.id
            ),
        },
      });
    } catch (error) {
      console.error(
        "Bot status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to get bot status.",
      });
    }
  }
);

/* =========================================================
   LIST CONNECTED BOTS
   ========================================================= */

app.get(
  "/api/bots",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error,
      } =
        await adminSupabase
          .from("connected_bots")
          .select(
            "id,bot_name,bot_username,status,is_active,last_connected_at,last_seen_at,created_at,updated_at"
          )
          .order("id", {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      const bots =
        (data || []).map(
          (bot) => ({
            ...bot,
            runtime:
              runtimeStatus(
                bot.id
              ),
          })
        );

      res.json({
        success: true,
        bots,
      });
    } catch (error) {
      console.error(
        "List bots error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load bots.",
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
    } =
      await adminSupabase
        .from("connected_bots")
        .select(
          "id,bot_name,bot_username,is_active"
        )
        .eq(
          "is_active",
          true
        );

    if (error) {
      throw error;
    }

    for (const bot of bots || []) {
      try {
        await startBot(
          bot.id
        );
      } catch (error) {
        console.error(
          `Auto-start failed for @${bot.bot_username}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Auto-start bots error:",
      error
    );
  }
}

/* =========================================================
   BOT CUSTOMIZATION APIs
   ========================================================= */

// GET bot customization
app.get(
  "/api/bots/:id/customization",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const botId = req.params.id;

      const bot = await getBot(botId);

      if (!bot) {
        return res.status(404).json({
          success: false,
          message: "Bot not found.",
        });
      }

      const customization = await getCustomization(botId);

      return res.json({
        success: true,
        customization,
      });
    } catch (error) {
      console.error(
        "Get customization error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load bot customization.",
      });
    }
  }
);


// UPDATE bot customization
app.put(
  "/api/bots/:id/customization",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const botId = req.params.id;

      const bot = await getBot(botId);

      if (!bot) {
        return res.status(404).json({
          success: false,
          message: "Bot not found.",
        });
      }

      const {
        bot_name,
        bot_description,
        welcome_message,
        support_username,
        menu_button_text,
        menu_button_url,
        profile_photo_url,
        theme_name,
        is_active,
      } = req.body || {};

      const updateData = {
        bot_name:
          safeText(
            bot_name,
            bot.bot_name || "Telegram Bot"
          ),

        bot_description:
          String(
            bot_description ?? ""
          ).trim(),

        welcome_message:
          safeText(
            welcome_message,
            "Welcome! Your bot is ready."
          ),

        support_username:
          String(
            support_username ?? ""
          ).trim(),

        menu_button_text:
          String(
            menu_button_text ?? ""
          ).trim(),

        menu_button_url:
          String(
            menu_button_url ?? ""
          ).trim(),

        profile_photo_url:
          String(
            profile_photo_url ?? ""
          ).trim(),

        theme_name:
          safeText(
            theme_name,
            "default"
          ),

        is_active:
          typeof is_active === "boolean"
            ? is_active
            : true,

        updated_at:
          new Date().toISOString(),
      };

      const {
        data,
        error,
      } = await adminSupabase
        .from("bot_customizations")
        .update(updateData)
        .eq("connected_bot_id", botId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        message:
          "Bot customization saved successfully.",
        customization: data || updateData,
      });
    } catch (error) {
      console.error(
        "Update customization error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to save bot customization.",
      });
    }
  }
);


/* =========================================================
   BOT COMMAND APIs
   ========================================================= */

// GET commands
app.get(
  "/api/bots/:id/commands",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error,
      } = await adminSupabase
        .from("bot_commands")
        .select(
  "id,command,response_message,media_type,media_url,is_active,created_at,updated_at"
)
        .order("id", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        commands: data || [],
      });
    } catch (error) {
      console.error(
        "Get commands error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load commands.",
      });
    }
  }
);


// CREATE command
app.post(
  "/api/bots/:id/commands",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const {
  command,
  response_message,
  media_type = "none",
  media_url = "",
  is_active = true,
} = req.body || {};

      const cleanCommand =
        normalizeCommand(command);

      if (!cleanCommand) {
        return res.status(400).json({
          success: false,
          message:
            "Command is required.",
        });
      }

      const {
        data,
        error,
      } = await adminSupabase
        .from("bot_commands")
        .insert({
  command:
    `/${cleanCommand}`,
  response_message:
    String(
      response_message ?? ""
    ).trim(),
  media_type:
    String(media_type || "none")
      .trim()
      .toLowerCase(),
  media_url:
    String(media_url || "").trim(),
  is_active:
    Boolean(is_active),
})
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        message:
          "Command created successfully.",
        command: data,
      });
    } catch (error) {
      console.error(
        "Create command error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create command.",
      });
    }
  }
);


// UPDATE command
app.put(
  "/api/bots/:id/commands/:commandId",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const commandId =
        req.params.commandId;

      const {
        command,
        response_message,
        is_active,
      } = req.body || {};

      const updateData = {};

      if (
        command !== undefined
      ) {
        const cleanCommand =
          normalizeCommand(command);

        if (!cleanCommand) {
          return res.status(400).json({
            success: false,
            message:
              "Command is required.",
          });
        }

        updateData.command =
          `/${cleanCommand}`;
      }

      if (
        response_message !== undefined
      ) {
        updateData.response_message =
          String(
            response_message
          ).trim();
      }
      if (
  media_type !== undefined
) {
  updateData.media_type =
    String(
      media_type || "none"
    )
      .trim()
      .toLowerCase();
}

if (
  media_url !== undefined
) {
  updateData.media_url =
    String(
      media_url || ""
    ).trim();
}

      if (
        typeof is_active ===
        "boolean"
      ) {
        updateData.is_active =
          is_active;
      }

      updateData.updated_at =
        new Date().toISOString();

      const {
        data,
        error,
      } = await adminSupabase
        .from("bot_commands")
        .update(updateData)
        .eq("id", commandId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        message:
          "Command updated successfully.",
        command: data,
      });
    } catch (error) {
      console.error(
        "Update command error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update command.",
      });
    }
  }
);


// DELETE command
app.delete(
  "/api/bots/:id/commands/:commandId",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const {
        error,
      } = await adminSupabase
        .from("bot_commands")
        .delete()
        .eq(
          "id",
          req.params.commandId
        );

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        message:
          "Command deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete command error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete command.",
      });
    }
  }
);


/* =========================================================
   BOT BUTTON APIs
   ========================================================= */

// GET buttons
app.get(
  "/api/bots/:id/buttons",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error,
      } = await adminSupabase
        .from("bot_buttons")
        .select("*")
        .order("position", {
          ascending: true,
        })
        .order("id", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        buttons: data || [],
      });
    } catch (error) {
      console.error(
        "Get buttons error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to load buttons.",
      });
    }
  }
);


// CREATE button
app.post(
  "/api/bots/:id/buttons",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const {
        button_text,
        button_type = "url",
        button_value,
        position = 0,
        is_active = true,
      } = req.body || {};

      const cleanText =
        String(
          button_text ?? ""
        ).trim();

      if (!cleanText) {
        return res.status(400).json({
          success: false,
          message:
            "Button text is required.",
        });
      }

      const {
        data,
        error,
      } = await adminSupabase
        .from("bot_buttons")
        .insert({
          button_text:
            cleanText,
          button_type:
            safeText(
              button_type,
              "url"
            ),
          button_value:
            String(
              button_value ?? ""
            ).trim(),
          position:
            Number.isFinite(
              Number(position)
            )
              ? Number(position)
              : 0,
          is_active:
            Boolean(is_active),
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        message:
          "Button created successfully.",
        button: data,
      });
    } catch (error) {
      console.error(
        "Create button error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create button.",
      });
    }
  }
);


// UPDATE button
app.put(
  "/api/bots/:id/buttons/:buttonId",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const buttonId =
        req.params.buttonId;

      const {
        button_text,
        button_type,
        button_value,
        position,
        is_active,
      } = req.body || {};

      const updateData = {};

      if (
        button_text !== undefined
      ) {
        updateData.button_text =
          String(
            button_text
          ).trim();
      }

      if (
        button_type !== undefined
      ) {
        updateData.button_type =
          String(
            button_type
          ).trim();
      }

      if (
        button_value !== undefined
      ) {
        updateData.button_value =
          String(
            button_value
          ).trim();
      }

      if (
        position !== undefined
      ) {
        updateData.position =
          Number(position) || 0;
      }

      if (
        typeof is_active ===
        "boolean"
      ) {
        updateData.is_active =
          is_active;
      }

      updateData.updated_at =
        new Date().toISOString();

      const {
        data,
        error,
      } = await adminSupabase
        .from("bot_buttons")
        .update(updateData)
        .eq("id", buttonId)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        message:
          "Button updated successfully.",
        button: data,
      });
    } catch (error) {
      console.error(
        "Update button error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update button.",
      });
    }
  }
);


// DELETE button
app.delete(
  "/api/bots/:id/buttons/:buttonId",
  requirePanelAdmin,
  async (req, res) => {
    try {
      const {
        error,
      } = await adminSupabase
        .from("bot_buttons")
        .delete()
        .eq(
          "id",
          req.params.buttonId
        );

      if (error) {
        throw error;
      }

      return res.json({
        success: true,
        message:
          "Button deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete button error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete button.",
      });
    }
  }
);

/* =========================================================
   SERVER START
   ========================================================= */

/* =========================================================
   BOT SCREENS API
   ========================================================= */

// GET ALL SCREENS FOR A BOT
app.get("/api/bots/:id/screens", requirePanelAdmin, async (req, res) => {
  try {
    const botId = Number(req.params.id);

    if (!Number.isInteger(botId) || botId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot ID.",
      });
    }

    const { data, error } = await adminSupabase
      .from("bot_screens")
      .select(
        "id,connected_bot_id,screen_key,title,message_text,media_type,media_url,parent_screen_id,is_active,position,created_at,updated_at"
      )
      .eq("connected_bot_id", botId)
      .order("position", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw error;

    return res.json({
      success: true,
      screens: data || [],
    });
  } catch (error) {
    console.error("Get screens error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to load screens.",
    });
  }
});


// CREATE SCREEN
app.post("/api/bots/:id/screens", requirePanelAdmin, async (req, res) => {
  try {
    const botId = Number(req.params.id);

    if (!Number.isInteger(botId) || botId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot ID.",
      });
    }

    const {
      screen_key,
      title = "",
      message_text = "",
      media_type = "none",
      media_url = "",
      parent_screen_id = null,
      is_active = true,
      position = 0,
    } = req.body || {};

    const cleanKey = String(screen_key || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

    if (!cleanKey) {
      return res.status(400).json({
        success: false,
        message: "Screen key is required.",
      });
    }

    const { data, error } = await adminSupabase
      .from("bot_screens")
      .insert({
        connected_bot_id: botId,
        screen_key: cleanKey,
        title: String(title || "").trim(),
        message_text: String(message_text || "").trim(),
        media_type: String(media_type || "none").trim(),
        media_url: String(media_url || "").trim() || null,
        parent_screen_id:
          parent_screen_id === null || parent_screen_id === ""
            ? null
            : Number(parent_screen_id),
        is_active: Boolean(is_active),
        position: Math.max(0, Number(position) || 0),
      })
      .select("*")
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Screen created successfully.",
      screen: data,
    });
  } catch (error) {
    console.error("Create screen error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create screen.",
    });
  }
});


// UPDATE SCREEN
app.patch("/api/bots/:id/screens/:screenId", requirePanelAdmin, async (req, res) => {
  try {
    const botId = Number(req.params.id);
    const screenId = Number(req.params.screenId);

    if (!Number.isInteger(botId) || botId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot ID.",
      });
    }

    if (!Number.isInteger(screenId) || screenId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid screen ID.",
      });
    }

    const {
      screen_key,
      title,
      message_text,
      media_type,
      media_url,
      parent_screen_id,
      is_active,
      position,
    } = req.body || {};

    const updateData = {};

    if (screen_key !== undefined) {
      const cleanKey = String(screen_key)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");

      if (!cleanKey) {
        return res.status(400).json({
          success: false,
          message: "Invalid screen key.",
        });
      }

      updateData.screen_key = cleanKey;
    }

    if (title !== undefined) {
      updateData.title = String(title || "").trim();
    }

    if (message_text !== undefined) {
      updateData.message_text = String(message_text || "").trim();
    }

    if (media_type !== undefined) {
      updateData.media_type = String(media_type || "none").trim();
    }

    if (media_url !== undefined) {
      updateData.media_url = String(media_url || "").trim() || null;
    }

    if (parent_screen_id !== undefined) {
      updateData.parent_screen_id =
        parent_screen_id === null || parent_screen_id === ""
          ? null
          : Number(parent_screen_id);
    }

    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }

    if (position !== undefined) {
      updateData.position = Math.max(0, Number(position) || 0);
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await adminSupabase
      .from("bot_screens")
      .update(updateData)
      .eq("id", screenId)
      .eq("connected_bot_id", botId)
      .select("*")
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Screen updated successfully.",
      screen: data,
    });
  } catch (error) {
    console.error("Update screen error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update screen.",
    });
  }
});


// DELETE SCREEN
app.delete("/api/bots/:id/screens/:screenId", requirePanelAdmin, async (req, res) => {
  try {
    const botId = Number(req.params.id);
    const screenId = Number(req.params.screenId);

    if (!Number.isInteger(botId) || !Number.isInteger(screenId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot or screen ID.",
      });
    }

    const { error } = await adminSupabase
      .from("bot_screens")
      .delete()
      .eq("id", screenId)
      .eq("connected_bot_id", botId);

    if (error) throw error;

    return res.json({
      success: true,
      message: "Screen deleted successfully.",
    });
  } catch (error) {
    console.error("Delete screen error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to delete screen.",
    });
  }
});


/* =========================================================
   CONNECTED BOT BUTTON API
   ========================================================= */

// GET BUTTONS
app.get("/api/bots/:id/buttons", requirePanelAdmin, async (req, res) => {
  try {
    const botId = Number(req.params.id);
    const screenId = req.query.screen_id
      ? Number(req.query.screen_id)
      : null;

    if (!Number.isInteger(botId) || botId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot ID.",
      });
    }

    let query = adminSupabase
      .from("bot_buttons")
      .select(
        "id,connected_bot_id,screen_id,button_text,button_type,button_value,action_type,product_id,price_id,target_screen_id,callback_data,position,is_active,created_at,updated_at"
      )
      .eq("connected_bot_id", botId)
      .order("position", { ascending: true })
      .order("id", { ascending: true });

    if (Number.isInteger(screenId) && screenId > 0) {
      query = query.eq("screen_id", screenId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      buttons: data || [],
    });
  } catch (error) {
    console.error("Get buttons error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to load buttons.",
    });
  }
});


// CREATE BUTTON
app.post("/api/bots/:id/buttons", requirePanelAdmin, async (req, res) => {
  try {
    const botId = Number(req.params.id);

    if (!Number.isInteger(botId) || botId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot ID.",
      });
    }

    const {
      screen_id = null,
      button_text = "",
      button_type = "callback",
      button_value = "",
      action_type = "screen",
      product_id = null,
      price_id = null,
      target_screen_id = null,
      callback_data = "",
      position = 0,
      is_active = true,
    } = req.body || {};

    const cleanText = String(button_text || "").trim();

    if (!cleanText) {
      return res.status(400).json({
        success: false,
        message: "Button text is required.",
      });
    }

    const action = String(action_type || "screen")
      .trim()
      .toLowerCase();

    let generatedCallback = String(callback_data || "").trim();

    if (!generatedCallback) {
      if (action === "screen" && target_screen_id) {
        generatedCallback = `fz:screen:${Number(target_screen_id)}`;
      } else if (action === "product" && product_id) {
        generatedCallback = `fz:product:${Number(product_id)}`;
      } else if (action === "price" && price_id) {
        generatedCallback = `fz:price:${Number(price_id)}`;
      } else if (action === "purchase" && price_id) {
        generatedCallback = `fz:purchase:${Number(price_id)}`;
      } else if (action === "balance") {
        generatedCallback = "fz:balance";
      } else if (action === "add_funds") {
        generatedCallback = "fz:add_funds";
      } else if (action === "orders") {
        generatedCallback = "fz:orders";
      } else if (action === "profile") {
        generatedCallback = "fz:profile";
      } else if (action === "support") {
        generatedCallback = "fz:support";
      } else if (action === "back") {
        generatedCallback = "fz:back";
      } else if (action === "main_menu") {
        generatedCallback = "fz:main_menu";
      }
    }

    const { data, error } = await adminSupabase
      .from("bot_buttons")
      .insert({
        connected_bot_id: botId,
        screen_id:
          screen_id === null || screen_id === ""
            ? null
            : Number(screen_id),
        button_text: cleanText,
        button_type:
          action === "url"
            ? "url"
            : "callback",
        button_value: String(button_value || "").trim(),
        action_type: action,
        product_id:
          product_id === null || product_id === ""
            ? null
            : Number(product_id),
        price_id:
          price_id === null || price_id === ""
            ? null
            : Number(price_id),
        target_screen_id:
          target_screen_id === null || target_screen_id === ""
            ? null
            : Number(target_screen_id),
        callback_data: generatedCallback.slice(0, 64) || null,
        position: Math.max(0, Number(position) || 0),
        is_active: Boolean(is_active),
      })
      .select("*")
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Button created successfully.",
      button: data,
    });
  } catch (error) {
    console.error("Create button error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to create button.",
    });
  }
});


// UPDATE BUTTON
app.patch("/api/bots/:id/buttons/:buttonId", requirePanelAdmin, async (req, res) => {
  try {
    const botId = Number(req.params.id);
    const buttonId = Number(req.params.buttonId);

    if (!Number.isInteger(botId) || !Number.isInteger(buttonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot or button ID.",
      });
    }

    const allowedFields = [
      "screen_id",
      "button_text",
      "button_type",
      "button_value",
      "action_type",
      "product_id",
      "price_id",
      "target_screen_id",
      "callback_data",
      "position",
      "is_active",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.button_text !== undefined) {
      updateData.button_text = String(updateData.button_text || "").trim();
    }

    if (updateData.button_value !== undefined) {
      updateData.button_value = String(updateData.button_value || "").trim();
    }

    if (updateData.action_type !== undefined) {
      updateData.action_type = String(
        updateData.action_type || "screen"
      )
        .trim()
        .toLowerCase();
    }

    if (updateData.callback_data !== undefined) {
      updateData.callback_data =
        String(updateData.callback_data || "").trim().slice(0, 64) || null;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await adminSupabase
      .from("bot_buttons")
      .update(updateData)
      .eq("id", buttonId)
      .eq("connected_bot_id", botId)
      .select("*")
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Button updated successfully.",
      button: data,
    });
  } catch (error) {
    console.error("Update button error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update button.",
    });
  }
});


// DELETE BUTTON
app.delete("/api/bots/:id/buttons/:buttonId", requirePanelAdmin, async (req, res) => {
  try {
    const botId = Number(req.params.id);
    const buttonId = Number(req.params.buttonId);

    if (!Number.isInteger(botId) || !Number.isInteger(buttonId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bot or button ID.",
      });
    }

    const { error } = await adminSupabase
      .from("bot_buttons")
      .delete()
      .eq("id", buttonId)
      .eq("connected_bot_id", botId);

    if (error) throw error;

    return res.json({
      success: true,
      message: "Button deleted successfully.",
    });
  } catch (error) {
    console.error("Delete button error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to delete button.",
    });
  }
});

/* =========================================================
   404
   ========================================================= */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "API route not found.",
      path: req.path,
    });
  }
);

/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "Unhandled server error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Internal server error.",
    });
  }
);

app.listen(
  PORT,
  "0.0.0.0",
  async () => {
    console.log(
      `FZ BOT TG backend running on port ${PORT}`
    );

    console.log(
      `Health: http://localhost:${PORT}/api/health`
    );

    await autoStartBots();
  }
);
