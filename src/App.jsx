import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Session error:", error);
      }

      setSession(data?.session ?? null);
      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActivePage("dashboard");
  };

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-box">
          <div className="login-logo">FZ</div>
          <h2>FZ BOT TG</h2>
          <p>Loading Control Panel...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <LoginPage
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        loginError={loginError}
        setLoginError={setLoginError}
        loginLoading={loginLoading}
        setLoginLoading={setLoginLoading}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>
              {activePage === "dashboard" && "Dashboard"}
              {activePage === "bot" && "Bot Controller"}
              {activePage === "products" && "Products"}
              {activePage === "keys" && "Key Management"}
              {activePage === "payments" && "Payments & Settings"}
              {activePage === "premium" && "Premium"}
              {activePage === "resellers" && "Resellers"}
            </h2>

            <p>Welcome back to FZ BOT TG Control Panel</p>
          </div>

          <div className="admin-area">
            <div className="admin-info">
              <strong>Admin / Owner</strong>
              <span>{session.user?.email || "Admin"}</span>
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {activePage === "dashboard" && <Dashboard />}

        {activePage === "bot" && <BotController />}

        {activePage === "products" && <Products />}
        {activePage === "keys" && <KeyManagement />}

        {activePage === "payments" && <Payments />}

        {activePage === "premium" && <Premium />}

        {activePage === "resellers" && <Resellers />}
      </main>
    </div>
  );
}

/* =========================
   LOGIN PAGE
========================= */

function LoginPage({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginError,
  setLoginError,
  loginLoading,
  setLoginLoading,
}) {
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");

    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter email and password.");
      return;
    }

    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
    }

    setLoginLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="login-card">
        <div className="login-logo">FZ</div>

        <h1>FZ BOT TG</h1>

        <p className="login-subtitle">
          CONTROL PANEL
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            value={loginEmail}
            onChange={(e) => {
              setLoginEmail(e.target.value);
              setLoginError("");
            }}
            placeholder="Enter admin email"
            autoComplete="email"
          />

          <label>Password</label>

          <input
            type="password"
            value={loginPassword}
            onChange={(e) => {
              setLoginPassword(e.target.value);
              setLoginError("");
            }}
            placeholder="Enter admin password"
            autoComplete="current-password"
          />

          {loginError && (
            <div className="login-error">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
          >
            {loginLoading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <p className="login-footer">
          Secure Admin Access
        </p>
      </div>
    </div>
  );
}

/* =========================
   SIDEBAR
========================= */

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">FZ</div>

        <div>
          <h1>FZ BOT TG</h1>
          <span>CONTROL PANEL</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={activePage === "dashboard" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("dashboard")}
        >
          <span>▣</span>
          Dashboard
        </button>

        <button
          className={activePage === "bot" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("bot")}
        >
          <span>⚙</span>
          Bot Controller
        </button>

        <button
          className={activePage === "products" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("products")}
        >
          <span>▤</span>
          Products
        </button>

        <button
          className={activePage === "keys" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("keys")}
        >
          <span>🔑</span>
          Key Management
        </button>

        <button
          className={activePage === "payments" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("payments")}
        >
          <span>₹</span>
          Payments & Settings
        </button>

        <button
          className={activePage === "premium" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("premium")}
        >
          <span>★</span>
          Premium
        </button>

        <button
          className={activePage === "resellers" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("resellers")}
        >
          <span>♟</span>
          Resellers
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="online-dot"></div>
        <span>System Online</span>
      </div>
    </aside>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard() {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>
            Monitor users, sales, keys, revenue and activity.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value="₹0.00"
          icon="₹"
        />

        <StatCard
          title="Total Users"
          value="0"
          icon="👥"
        />

        <StatCard
          title="Today's Sales"
          value="₹0.00"
          icon="▣"
        />

        <StatCard
          title="Monthly Sales"
          value="₹0.00"
          icon="◫"
        />

        <StatCard
          title="Yearly Sales"
          value="₹0.00"
          icon="◷"
        />

        <StatCard
          title="Keys Available"
          value="0"
          icon="🔑"
        />

        <StatCard
          title="Keys Sold"
          value="0"
          icon="✓"
        />

        <StatCard
          title="Total Deposits"
          value="₹0.00"
          icon="＋"
        />

        <StatCard
          title="Premium Users"
          value="0"
          icon="★"
        />
      </div>

      <div className="dashboard-columns">
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>Inventory Overview</h2>
              <p>Current product and key status</p>
            </div>
          </div>

          <div className="inventory-list">
            <InventoryItem
              title="Products"
              value="0"
              description="Active products"
            />

            <InventoryItem
              title="Available Keys"
              value="0"
              description="Ready to sell"
            />

            <InventoryItem
              title="Sold Keys"
              value="0"
              description="Keys sold"
            />
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest panel activity</p>
            </div>
          </div>

          <ActivityPanel />
        </div>
      </div>
    </section>
  );
}

/* =========================
   BOT CONTROLLER
========================= */
function BotController() {
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showConnectForm, setShowConnectForm] = useState(false);
  const [botUsername, setBotUsername] = useState("");
  const [botToken, setBotToken] = useState("");

  const [showBotSettings, setShowBotSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const [botSettings, setBotSettings] = useState({
    bot_name: "",
    bot_description: "",
    welcome_message: "",
    support_username: "",
    menu_button_text: "",
    menu_button_url: "",
    profile_photo_url: "",
    theme_name: "default",
    is_active: true,
  });

  /* COMMANDS */
  const [showCommands, setShowCommands] = useState(false);
  const [commandsLoading, setCommandsLoading] = useState(false);
  const [commandSaving, setCommandSaving] = useState(false);
  const [commands, setCommands] = useState([]);

  const [commandForm, setCommandForm] = useState({
  id: null,
  command: "",
  response_message: "",
  media_type: "none",
  media_url: "",
  is_active: true,
});

  /* BUTTONS */
  const [showButtons, setShowButtons] = useState(false);
  const [buttonsLoading, setButtonsLoading] = useState(false);
  const [buttonSaving, setButtonSaving] = useState(false);
  const [buttons, setButtons] = useState([]);

  const [buttonForm, setButtonForm] = useState({
  id: null,
  button_text: "",
  button_type: "callback",
  button_value: "",
  action_type: "screen",
  product_id: "",
  price_id: "",
  target_screen_id: "",
  callback_data: "",
  position: 0,
  is_active: true,
});
  /* BOT STATUS */
  const [botActionLoading, setBotActionLoading] = useState(false);

  const API_BASE = "";

  /* SCREENS & MENUS */
  const [showScreens, setShowScreens] = useState(false);
  const [screensLoading, setScreensLoading] = useState(false);
  const [screenSaving, setScreenSaving] = useState(false);
  const [screens, setScreens] = useState([]);
  const [selectedScreenId, setSelectedScreenId] = useState(null);

  const [screenForm, setScreenForm] = useState({
    id: null,
    screen_key: "",
    title: "",
    message_text: "",
    media_type: "none",
    media_url: "",
    parent_screen_id: "",
    position: 0,
    is_active: true,
  });  

  /* =========================
     SESSION
  ========================= */

    const loadScreens = async () => {
    if (!bot?.id) return;

    setScreensLoading(true);
    setError("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/screens`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load screens."
        );
      }

      setScreens(
        Array.isArray(data.screens)
          ? data.screens
          : []
      );
    } catch (err) {
      console.error("Screens load error:", err);
      setError(
        err.message || "Unable to load screens."
      );
    } finally {
      setScreensLoading(false);
    }
  };

  const openScreens = async () => {
    setShowScreens(true);
    setShowButtons(false);
    setShowCommands(false);
    setShowBotSettings(false);

    setScreenForm({
      id: null,
      screen_key: "",
      title: "",
      message_text: "",
      media_type: "none",
      media_url: "",
      parent_screen_id: "",
      position: screens.length,
      is_active: true,
    });

    await loadScreens();
  };

  const resetScreenForm = () => {
    setScreenForm({
      id: null,
      screen_key: "",
      title: "",
      message_text: "",
      media_type: "none",
      media_url: "",
      parent_screen_id: "",
      position: screens.length,
      is_active: true,
    });
  };

  const saveScreen = async () => {
    if (!bot?.id) return;

    const key = screenForm.screen_key.trim();
    const title = screenForm.title.trim();
    const message = screenForm.message_text.trim();

    if (!key) {
      setError("Screen key is required.");
      return;
    }

    if (!title) {
      setError("Screen title is required.");
      return;
    }

    setScreenSaving(true);
    setError("");
    setSuccess("");

    try {
      const accessToken = await getAccessToken();

      const editing = Boolean(screenForm.id);

      const url = editing
        ? `${API_BASE}/api/bots/${bot.id}/screens/${screenForm.id}`
        : `${API_BASE}/api/bots/${bot.id}/screens`;

      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          screen_key: key,
          title,
          message_text: message,
          media_type: screenForm.media_type,
          media_url: screenForm.media_url.trim(),
          parent_screen_id:
            screenForm.parent_screen_id === ""
              ? null
              : Number(screenForm.parent_screen_id),
          position: Number(screenForm.position) || 0,
          is_active: screenForm.is_active,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Screen save failed."
        );
      }

      setSuccess(
        editing
          ? "Screen updated successfully."
          : "Screen created successfully."
      );

      resetScreenForm();
      await loadScreens();
    } catch (err) {
      console.error("Screen save error:", err);
      setError(
        err.message || "Screen save failed."
      );
    } finally {
      setScreenSaving(false);
    }
  };

  const editScreen = (screen) => {
    setScreenForm({
      id: screen.id,
      screen_key: screen.screen_key || "",
      title: screen.title || "",
      message_text: screen.message_text || "",
      media_type: screen.media_type || "none",
      media_url: screen.media_url || "",
      parent_screen_id:
        screen.parent_screen_id ?? "",
      position: screen.position ?? 0,
      is_active: screen.is_active !== false,
    });

    setSelectedScreenId(screen.id);
  };

  const deleteScreen = async (screen) => {
    const confirmed = window.confirm(
      `Delete "${screen.title}" screen?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/screens/${screen.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Screen delete failed."
        );
      }

      if (selectedScreenId === screen.id) {
        setSelectedScreenId(null);
      }

      setSuccess("Screen deleted successfully.");

      await loadScreens();
    } catch (err) {
      console.error("Screen delete error:", err);
      setError(
        err.message || "Screen delete failed."
      );
    }
  };
  const getAccessToken = async () => {
    const { data, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const accessToken = data?.session?.access_token;

    if (!accessToken) {
      throw new Error("Admin session expired. Please login again.");
    }

    return accessToken;
  };

  /* =========================
     LOAD CONNECTED BOT
  ========================= */

  const loadConnectedBot = async () => {
    setLoading(true);
    setError("");

    try {
      await getAccessToken();

      const { data, error: botError } = await supabase
        .from("connected_bots")
        .select(
          "id, user_id, bot_name, bot_username, status, is_active, last_connected_at, last_seen_at"
        )
        .order("created_at", { ascending: false })
        .limit(1);

      if (botError) {
        throw botError;
      }

      setBot(data?.[0] || null);
    } catch (err) {
      console.error("Bot load error:", err);
      setError(err.message || "Unable to load bot.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnectedBot();
  }, []);

  /* =========================
     CONNECT BOT
  ========================= */

  const connectBot = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanUsername = botUsername.trim();
    const cleanToken = botToken.trim();

    if (!cleanUsername) {
      setError("Bot Username is required.");
      return;
    }

    if (!cleanToken) {
      setError("Bot Token is required.");
      return;
    }

    setConnecting(true);

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            botUsername: cleanUsername,
            botToken: cleanToken,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Bot connection failed."
        );
      }

      setBot(data.bot || null);

      setBotUsername("");
      setBotToken("");
      setShowConnectForm(false);

      setSuccess("Telegram bot connected successfully.");
    } catch (err) {
      console.error("Bot connection error:", err);
      setError(err.message || "Bot connection failed.");
    } finally {
      setConnecting(false);
    }
  };

  /* =========================
     DISCONNECT BOT
  ========================= */

  const disconnectBot = async () => {
    const confirmed = window.confirm(
      "Disconnect this Telegram bot?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      if (!bot?.id) {
        setBot(null);
        return;
      }

      const { error: deleteError } = await supabase
        .from("connected_bots")
        .delete()
        .eq("id", bot.id);

      if (deleteError) {
        throw deleteError;
      }

      setBot(null);
      setShowBotSettings(false);
      setShowCommands(false);
      setShowButtons(false);

      setSuccess("Telegram bot disconnected.");
    } catch (err) {
      console.error("Bot disconnect error:", err);
      setError(
        err.message || "Unable to disconnect bot."
      );
    }
  };

  /* =========================
     BOT SETTINGS
  ========================= */

  const loadBotSettings = async () => {
    if (!bot?.id) return;

    setSettingsLoading(true);
    setError("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/customization`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load bot settings."
        );
      }

      const customization = data.customization || {};

      setBotSettings({
        bot_name:
          customization.bot_name ||
          bot.bot_name ||
          "",

        bot_description:
          customization.bot_description || "",

        welcome_message:
          customization.welcome_message ||
          "Welcome! Your bot is ready.",

        support_username:
          customization.support_username || "",

        menu_button_text:
          customization.menu_button_text || "",

        menu_button_url:
          customization.menu_button_url || "",

        profile_photo_url:
          customization.profile_photo_url || "",

        theme_name:
          customization.theme_name || "default",

        is_active:
          customization.is_active !== false,
      });
    } catch (err) {
      console.error("Bot settings load error:", err);
      setError(
        err.message || "Unable to load bot settings."
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveBotSettings = async () => {
    if (!bot?.id) return;

    setSettingsSaving(true);
    setError("");
    setSuccess("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/customization`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(botSettings),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Failed to save bot settings."
        );
      }

      setBotSettings(
        data.customization || botSettings
      );

      setShowBotSettings(false);
      setSuccess("Bot settings saved successfully.");
    } catch (err) {
      console.error("Bot settings save error:", err);
      setError(
        err.message || "Failed to save bot settings."
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  /* =========================
     COMMANDS
  ========================= */

  const loadCommands = async () => {
    if (!bot?.id) return;

    setCommandsLoading(true);
    setError("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/commands`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load commands."
        );
      }

      setCommands(
        Array.isArray(data.commands)
          ? data.commands
          : []
      );
    } catch (err) {
      console.error("Commands load error:", err);
      setError(
        err.message || "Unable to load commands."
      );
    } finally {
      setCommandsLoading(false);
    }
  };

  const openCommands = async () => {
    setShowCommands(true);
    setShowButtons(false);
    setShowBotSettings(false);

    setCommandForm({
  id: null,
  command: "",
  response_message: "",
  media_type: "none",
  media_url: "",
  is_active: true,
});

    await loadCommands();
  };

  const resetCommandForm = () => {
    setCommandForm({
      id: null,
      command: "",
      response_message: "",
      is_active: true,
    });
  };

  const saveCommand = async () => {
    const command = commandForm.command.trim();
    const responseMessage =
      commandForm.response_message.trim();

    if (!command) {
      setError("Command name is required.");
      return;
    }

    if (!responseMessage) {
      setError("Command response is required.");
      return;
    }

    setCommandSaving(true);
    setError("");
    setSuccess("");

    try {
      const accessToken = await getAccessToken();

      const isEditing = Boolean(commandForm.id);

      const url = isEditing
        ? `${API_BASE}/api/bots/${bot.id}/commands/${commandForm.id}`
        : `${API_BASE}/api/bots/${bot.id}/commands`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
  command,
  response_message: responseMessage,
  media_type: commandForm.media_type || "none",
  media_url: commandForm.media_url.trim(),
  is_active: commandForm.is_active,
}),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            (isEditing
              ? "Command update failed."
              : "Command creation failed.")
        );
      }

      await loadCommands();

      resetCommandForm();

      setSuccess(
        isEditing
          ? "Command updated successfully."
          : "Command added successfully."
      );
    } catch (err) {
      console.error("Command save error:", err);
      setError(
        err.message || "Unable to save command."
      );
    } finally {
      setCommandSaving(false);
    }
  };

  const editCommand = (item) => {
  setCommandForm({
    id: item.id,
    command: String(item.command || "").replace(
      /^\//,
      ""
    ),
    response_message:
      item.response_message || "",
    media_type: item.media_type || "none",
    media_url: item.media_url || "",
    is_active: item.is_active !== false,
  });

  setShowCommands(true);
  setError("");
};

  const deleteCommand = async (commandId) => {
    const confirmed = window.confirm(
      "Delete this command?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/commands/${commandId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to delete command."
        );
      }

      await loadCommands();

      if (commandForm.id === commandId) {
        resetCommandForm();
      }

      setSuccess("Command deleted successfully.");
    } catch (err) {
      console.error("Command delete error:", err);
      setError(
        err.message || "Unable to delete command."
      );
    }
  };

  /* =========================
     BUTTONS
  ========================= */

  const loadButtons = async () => {
    if (!bot?.id) return;

    setButtonsLoading(true);
    setError("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/buttons`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load buttons."
        );
      }

      setButtons(
        Array.isArray(data.buttons)
          ? data.buttons
          : []
      );
    } catch (err) {
      console.error("Buttons load error:", err);
      setError(
        err.message || "Unable to load buttons."
      );
    } finally {
      setButtonsLoading(false);
    }
  };

  const openButtons = async () => {
    setShowButtons(true);
    setShowCommands(false);
    setShowBotSettings(false);

    setButtonForm({
      id: null,
      button_text: "",
      button_type: "url",
      button_value: "",
      position: 0,
      is_active: true,
    });

    await loadButtons();
  };

  const resetButtonForm = () => {
    setButtonForm({
      id: null,
      button_text: "",
      button_type: "url",
      button_value: "",
      position: 0,
      is_active: true,
    });
  };

  const saveButton = async () => {
    const buttonText =
      buttonForm.button_text.trim();

    const buttonValue =
      buttonForm.button_value.trim();

    if (!buttonText) {
      setError("Button text is required.");
      return;
    }

    if (!buttonValue) {
      setError("Button value is required.");
      return;
    }

    setButtonSaving(true);
    setError("");
    setSuccess("");

    try {
      const accessToken = await getAccessToken();

      const isEditing = Boolean(buttonForm.id);

      const url = isEditing
        ? `${API_BASE}/api/bots/${bot.id}/buttons/${buttonForm.id}`
        : `${API_BASE}/api/bots/${bot.id}/buttons`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          button_text: buttonText,
          button_type: buttonForm.button_type,
          button_value: buttonValue,
          position: Number(buttonForm.position) || 0,
          is_active: buttonForm.is_active,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            (isEditing
              ? "Button update failed."
              : "Button creation failed.")
        );
      }

      await loadButtons();
      resetButtonForm();

      setSuccess(
        isEditing
          ? "Button updated successfully."
          : "Button added successfully."
      );
    } catch (err) {
      console.error("Button save error:", err);
      setError(
        err.message || "Unable to save button."
      );
    } finally {
      setButtonSaving(false);
    }
  };

  const editButton = (item) => {
    setButtonForm({
      id: item.id,
      button_text: item.button_text || "",
      button_type: item.button_type || "url",
      button_value: item.button_value || "",
      position: item.position || 0,
      is_active: item.is_active !== false,
    });

    setShowButtons(true);
    setError("");
  };

  const deleteButton = async (buttonId) => {
    const confirmed = window.confirm(
      "Delete this button?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/buttons/${buttonId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to delete button."
        );
      }

      await loadButtons();

      if (buttonForm.id === buttonId) {
        resetButtonForm();
      }

      setSuccess("Button deleted successfully.");
    } catch (err) {
      console.error("Button delete error:", err);
      setError(
        err.message || "Unable to delete button."
      );
    }
  };

  /* =========================
     START / STOP BOT
  ========================= */

  const startBot = async () => {
    if (!bot?.id) return;

    setBotActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to start bot."
        );
      }

      setBot((current) =>
        current
          ? {
              ...current,
              status: "connected",
              is_active: true,
            }
          : current
      );

      setSuccess("Telegram bot started successfully.");
    } catch (err) {
      console.error("Bot start error:", err);
      setError(
        err.message || "Unable to start bot."
      );
    } finally {
      setBotActionLoading(false);
    }
  };

  const stopBot = async () => {
    if (!bot?.id) return;

    setBotActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${API_BASE}/api/bots/${bot.id}/stop`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to stop bot."
        );
      }

      setBot((current) =>
        current
          ? {
              ...current,
              status: "stopped",
              is_active: false,
            }
          : current
      );

      setSuccess("Telegram bot stopped.");
    } catch (err) {
      console.error("Bot stop error:", err);
      setError(
        err.message || "Unable to stop bot."
      );
    } finally {
      setBotActionLoading(false);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <section className="page">
        <div className="empty-state">
          <div className="empty-icon">◷</div>
          <h3>Checking Telegram Bot...</h3>
          <p>
            Please wait while the bot connection is checked.
          </p>
        </div>
      </section>
    );
  }

  /* =========================
     PAGE
  ========================= */

  return (
    <section className="page">

      <div className="page-heading">
        <div>
          <h1>Bot Controller</h1>
          <p>
            Connect your Telegram bot first.
            Controller features unlock after connection.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "rgba(255, 70, 70, 0.10)",
            border: "1px solid rgba(255, 70, 70, 0.30)",
            color: "#ff7777",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "rgba(60, 210, 130, 0.10)",
            border: "1px solid rgba(60, 210, 130, 0.30)",
            color: "#63e6a1",
          }}
        >
          {success}
        </div>
      )}

      {/* =========================
          CONNECT SCREEN
      ========================= */}

      {!bot && !showConnectForm && (
        <div
          className="panel-card"
          style={{
            textAlign: "center",
            padding: "42px 24px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "14px",
            }}
          >
            🤖
          </div>

          <h2>Connect Your Telegram Bot</h2>

          <p
            style={{
              maxWidth: "620px",
              margin: "10px auto 24px",
              opacity: 0.75,
            }}
          >
            Connect your Telegram bot to unlock the
            complete controller.
          </p>

          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setShowConnectForm(true);
              setError("");
              setSuccess("");
            }}
          >
            🔗 Connect Your Telegram Bot
          </button>
        </div>
      )}

      {/* =========================
          CONNECT FORM
      ========================= */}

      {showConnectForm && !bot && (
        <div
          className="panel-card"
          style={{ marginTop: "18px" }}
        >
          <div className="panel-header">
            <div>
              <h2>🔗 Connect Telegram Bot</h2>
              <p>
                Enter your Telegram bot username and token.
              </p>
            </div>
          </div>

          <form
            onSubmit={connectBot}
            style={{
              display: "grid",
              gap: "14px",
              maxWidth: "680px",
            }}
          >
            <label>
              Bot Username
              <input
                value={botUsername}
                onChange={(e) =>
                  setBotUsername(e.target.value)
                }
                placeholder="@your_bot_username"
                autoComplete="off"
              />
            </label>

            <label>
              Bot Token
              <input
                type="password"
                value={botToken}
                onChange={(e) =>
                  setBotToken(e.target.value)
                }
                placeholder="Enter Telegram Bot Token"
                autoComplete="new-password"
              />
            </label>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                className="primary-btn"
                type="submit"
                disabled={connecting}
              >
                {connecting
                  ? "Verifying & Connecting..."
                  : "Connect Bot"}
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={() => {
                  setShowConnectForm(false);
                  setBotUsername("");
                  setBotToken("");
                  setError("");
                }}
                disabled={connecting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================
          CONNECTED BOT
      ========================= */}

      {bot && (
        <>
          <div
            className="panel-card"
            style={{ marginBottom: "18px" }}
          >
            <div className="panel-header">
              <div>
                <h2>✅ Telegram Bot Connected</h2>

                <p>
                  {bot.bot_username
                    ? `@${String(
                        bot.bot_username
                      ).replace(/^@/, "")}`
                    : bot.bot_name ||
                      "Telegram Bot"}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background:
                      bot.status === "connected"
                        ? "rgba(60,210,130,.12)"
                        : "rgba(255,180,60,.12)",
                    color:
                      bot.status === "connected"
                        ? "#63e6a1"
                        : "#ffc266",
                    fontSize: "13px",
                  }}
                >
                  {bot.status === "connected"
                    ? "● Online"
                    : `● ${bot.status || "Unknown"}`}
                </span>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={disconnectBot}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* FEATURE CARDS */}

          <div className="feature-grid">

            <button
              type="button"
              className="feature-card"
              onClick={() => {
                setShowBotSettings(true);
                setShowCommands(false);
                setShowButtons(false);
                loadBotSettings();
              }}
              style={{
                textAlign: "left",
                cursor: "pointer",
                width: "100%",
                border: "none",
              }}
            >
              <div className="feature-icon">⚙</div>
              <div>
                <h3>Bot Settings</h3>
                <p>
                  Manage bot name, welcome message,
                  support and status.
                </p>
              </div>
            </button>

            <button
              type="button"
              className="feature-card"
              onClick={() => {
                setShowBotSettings(false);
                setShowButtons(false);
                openCommands();
              }}
              style={{
                textAlign: "left",
                cursor: "pointer",
                width: "100%",
                border: "none",
              }}
            >
              <div className="feature-icon">⌘</div>
              <div>
                <h3>Bot Commands</h3>
                <p>
                  Add, edit and delete Telegram commands.
                </p>
              </div>
            </button>

            <button
              type="button"
              className="feature-card"
              onClick={() => {
                setShowBotSettings(false);
                setShowCommands(false);
                openButtons();
              }}
              style={{
                textAlign: "left",
                cursor: "pointer",
                width: "100%",
                border: "none",
              }}
            >
              <div className="feature-icon">▦</div>
              <div>
                <h3>Buttons</h3>
                <p>
                  Create URL and callback buttons.
                </p>
              </div>
            </button>

            <button
  type="button"
  className="feature-card"
  onClick={() => {
    setShowBotSettings(false);
    setShowCommands(false);
    setShowButtons(false);
    openScreens();
  }}
  style={{
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
    border: "none",
  }}
>
  <div className="feature-icon">🖥️</div>

  <div>
    <h3>Screens & Menus</h3>
    <p>
      Create and manage Main Menu, Products,
      Balance, Profile, Support and other screens.
    </p>
  </div>
</button>

            <button
              type="button"
              className="feature-card"
              onClick={() => {
                setShowBotSettings(true);
                loadBotSettings();
              }}
              style={{
                textAlign: "left",
                cursor: "pointer",
                width: "100%",
                border: "none"
              }}
            >
              <div className="feature-icon">✉</div>
              <div>
                <h3>Welcome Message</h3>
                <p>Edit the message users see when they start your bot.</p>
              </div>
              <span className="feature-action">Manage →</span>
            </button>

            <button
              type="button"
              className="feature-card"
              onClick={
                bot.status === "connected"
                  ? stopBot
                  : startBot
              }
              disabled={botActionLoading}
              style={{
                textAlign: "left",
                cursor: botActionLoading
                  ? "wait"
                  : "pointer",
                width: "100%",
                border: "none",
                opacity: botActionLoading ? 0.7 : 1,
              }}
            >
              <div className="feature-icon">
                {bot.status === "connected"
                  ? "■"
                  : "▶"}
              </div>

              <div>
                <h3>
                  {bot.status === "connected"
                    ? "Stop Bot"
                    : "Start Bot"}
                </h3>

                <p>
                  {bot.status === "connected"
                    ? "Stop the Telegram bot service."
                    : "Start the Telegram bot service."}
                </p>
              </div>
            </button>
          </div>

          {/* QUICK CONTROLS */}

          <div
            className="panel-card quick-panel"
            style={{ marginTop: "18px" }}
          >
            <div className="panel-header">
              <div>
                <h2>⚡ Quick Controls</h2>
                <p>
                  Manage your connected Telegram bot.
                </p>
              </div>
            </div>

            <div className="quick-actions">

              <button
                type="button"
                onClick={openCommands}
              >
                ＋ Add Command
              </button>

              <button
                type="button"
                onClick={openButtons}
              >
                ＋ Add Button
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCommands(false);
                  setShowButtons(false);
                  setShowBotSettings(true);
                  loadBotSettings();
                }}
              >
                ✎ Edit Welcome Message
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCommands(false);
                  setShowButtons(false);
                  setShowBotSettings(true);
                  loadBotSettings();
                }}
              >
                ⚙ Bot Settings
              </button>

              <button
                type="button"
                onClick={startBot}
                disabled={
                  botActionLoading ||
                  bot.status === "connected"
                }
              >
                ▶ Start Bot
              </button>

              <button
                type="button"
                onClick={stopBot}
                disabled={
                  botActionLoading ||
                  bot.status !== "connected"
                }
              >
                ■ Stop Bot
              </button>
            </div>
          </div>

          {/* =========================
              LIVE PREVIEW
          ========================= */}

          <div
            className="panel-card"
            style={{ marginTop: "18px" }}
          >
            <div className="panel-header">
              <div>
                <h2>👁 LIVE PREVIEW</h2>
                <p>
                  Preview your bot configuration, commands and buttons.
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await Promise.all([
                    loadBotSettings(),
                    openCommands(),
                    openButtons(),
                  ]);
                }}
              >
                🔄 Refresh Preview
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(280px, 420px) 1fr",
                gap: "20px",
                alignItems: "start",
              }}
            >
              {/* TELEGRAM STYLE PREVIEW */}
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "18px",
                  overflow: "hidden",
                  background: "#111827",
                  minHeight: "500px",
                }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong>
                      🤖 {botSettings.bot_name || bot.bot_username || "Your Bot"}
                    </strong>
                    <div
                      style={{
                        fontSize: "12px",
                        marginTop: "3px",
                        opacity: 0.7,
                      }}
                    >
                      {bot.status === "connected"
                        ? "🟢 Connected"
                        : "🔴 Disconnected"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "18px",
                    minHeight: "390px",
                    background:
                      "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "90%",
                        background: "#1f2937",
                        borderRadius: "14px 14px 14px 4px",
                        padding: "12px 14px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          opacity: 0.65,
                          marginBottom: "6px",
                        }}
                      >
                        {botSettings.bot_name || "Your Bot"}
                      </div>

                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.5,
                        }}
                      >
                        {botSettings.welcome_message ||
                          "Welcome! Your bot is ready."}
                      </div>

                      {buttons.length > 0 && (
                        <div
                          style={{
                            display: "grid",
                            gap: "7px",
                            marginTop: "12px",
                          }}
                        >
                          {buttons.map((button) => (
                            <div
                              key={button.id}
                              style={{
                                padding: "9px 10px",
                                borderRadius: "9px",
                                background: "rgba(59,130,246,0.16)",
                                border:
                                  "1px solid rgba(59,130,246,0.35)",
                                textAlign: "center",
                                fontSize: "13px",
                              }}
                            >
                              🔘 {button.button_text || "Button"}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CONFIGURATION STATUS */}
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <strong>Bot Status</strong>
                  <div style={{ marginTop: "8px" }}>
                    {bot.status === "connected" ? (
                      <span>🟢 Bot Connected</span>
                    ) : (
                      <span>🔴 Bot Disconnected</span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <strong>Welcome Message</strong>
                  <div
                    style={{
                      marginTop: "8px",
                      opacity: botSettings.welcome_message ? 1 : 0.55,
                    }}
                  >
                    {botSettings.welcome_message
                      ? "🟢 Configured"
                      : "🟡 Default message"}
                  </div>
                </div>

                <div
                  style={{
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <strong>Commands</strong>
                  <div style={{ marginTop: "8px" }}>
                    {commands.length > 0
                      ? `🟢 ${commands.length} command(s) configured`
                      : "🟡 No commands configured"}
                  </div>

                  {commands.length > 0 && (
                    <div
                      style={{
                        marginTop: "10px",
                        display: "grid",
                        gap: "7px",
                      }}
                    >
                      {commands.map((command) => (
                        <div
                          key={command.id}
                          style={{
                            padding: "9px 10px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          <strong>
                            /{String(command.command || "").replace(/^\//, "")}
                          </strong>

                          <div
                            style={{
                              marginTop: "3px",
                              fontSize: "12px",
                              opacity: 0.7,
                            }}
                          >
                            {command.response_message ||
                              "No response message set"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "15px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <strong>Buttons</strong>
                  <div style={{ marginTop: "8px" }}>
                    {buttons.length > 0
                      ? `🟢 ${buttons.length} button(s) configured`
                      : "🟡 No buttons configured"}
                  </div>

                  {buttons.length > 0 && (
                    <div
                      style={{
                        marginTop: "10px",
                        display: "grid",
                        gap: "7px",
                      }}
                    >
                      {buttons.map((button) => (
                        <div
                          key={button.id}
                          style={{
                            padding: "9px 10px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          🔘 {button.button_text || "Button"}
                          <div
                            style={{
                              marginTop: "3px",
                              fontSize: "12px",
                              opacity: 0.65,
                            }}
                          >
                            {button.button_type || "url"}
                            {button.button_value
                              ? ` • ${button.button_value}`
                              : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              BOT SETTINGS PANEL
          ========================= */}

          {showBotSettings && (
            <div
              className="panel-card"
              style={{ marginTop: "18px" }}
            >
              <div className="panel-header">
                <div>
                  <h2>⚙ Bot Settings</h2>
                  <p>
                    Configure your connected Telegram bot.
                  </p>
                </div>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    setShowBotSettings(false)
                  }
                  disabled={settingsSaving}
                >
                  Close
                </button>
              </div>

              {settingsLoading ? (
                <div className="empty-state">
                  <div className="empty-icon">◷</div>
                  <h3>Loading Settings...</h3>
                  <p>
                    Please wait while settings are loaded.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                    maxWidth: "720px",
                  }}
                >
                  <label>
                    Bot Name
                    <input
                      type="text"
                      value={botSettings.bot_name}
                      onChange={(e) =>
                        setBotSettings({
                          ...botSettings,
                          bot_name: e.target.value,
                        })
                      }
                      placeholder="My Telegram Bot"
                    />
                  </label>

                  <label>
                    Bot Description
                    <textarea
                      rows="3"
                      value={
                        botSettings.bot_description
                      }
                      onChange={(e) =>
                        setBotSettings({
                          ...botSettings,
                          bot_description:
                            e.target.value,
                        })
                      }
                      placeholder="Enter bot description"
                    />
                  </label>

                  <label>
                    Welcome Message
                    <textarea
                      rows="5"
                      value={
                        botSettings.welcome_message
                      }
                      onChange={(e) =>
                        setBotSettings({
                          ...botSettings,
                          welcome_message:
                            e.target.value,
                        })
                      }
                      placeholder="Welcome message"
                    />
                  </label>

                  <label>
                    Support Username
                    <input
                      type="text"
                      value={
                        botSettings.support_username
                      }
                      onChange={(e) =>
                        setBotSettings({
                          ...botSettings,
                          support_username:
                            e.target.value,
                        })
                      }
                      placeholder="@support"
                    />
                  </label>

                  <label>
                    Menu Button Text
                    <input
                      type="text"
                      value={
                        botSettings.menu_button_text
                      }
                      onChange={(e) =>
                        setBotSettings({
                          ...botSettings,
                          menu_button_text:
                            e.target.value,
                        })
                      }
                      placeholder="Support"
                    />
                  </label>

                  <label>
                    Menu Button URL
                    <input
                      type="url"
                      value={
                        botSettings.menu_button_url
                      }
                      onChange={(e) =>
                        setBotSettings({
                          ...botSettings,
                          menu_button_url:
                            e.target.value,
                        })
                      }
                      placeholder="https://example.com"
                    />
                  </label>

                  <label>
                    Profile Photo URL
                    <input
                      type="url"
                      value={
                        botSettings.profile_photo_url
                      }
                      onChange={(e) =>
                        setBotSettings({
                          ...botSettings,
                          profile_photo_url:
                            e.target.value,
                        })
                      }
                      placeholder="https://example.com/photo.jpg"
                    />
                  </label>

                  <label>
                    Theme
                    <select
                      value={
                        botSettings.theme_name
                      }
                      onChange={(e) =>
                        setBotSettings({
                          ...botSettings,
                          theme_name:
                            e.target.value,
                        })
                      }
                    >
                      <option value="default">
                        Default
                      </option>
                      <option value="dark">
                        Dark
                      </option>
                      <option value="blue">
                        Blue
                      </option>
                      <option value="purple">
                        Purple
                      </option>
                    </select>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        botSettings.is_active
                      }
                      onChange={(e) =>
                        setBotSettings({
                          ...botSettings,
                          is_active:
                            e.target.checked,
                        })
                      }
                    />

                    Bot Active
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={saveBotSettings}
                      disabled={settingsSaving}
                    >
                      {settingsSaving
                        ? "Saving..."
                        : "💾 Save Changes"}
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        setShowBotSettings(false)
                      }
                      disabled={settingsSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================
              COMMANDS PANEL
          ========================= */}

          {showCommands && (
            <div
              className="panel-card"
              style={{ marginTop: "18px" }}
            >
              <div className="panel-header">
                <div>
                  <h2>⌘ Bot Commands</h2>
                  <p>
                    Create and manage Telegram commands.
                  </p>
                </div>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    setShowCommands(false)
                  }
                >
                  Close
                </button>
              </div>

              {/* COMMAND FORM */}

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  maxWidth: "720px",
                  marginBottom: "24px",
                }}
              >
                <label>
                  Command
                  <input
                    type="text"
                    value={commandForm.command}
                    onChange={(e) =>
                      setCommandForm({
                        ...commandForm,
                        command: e.target.value,
                      })
                    }
                    placeholder="start"
                  />
                </label>

                <label>
                  Response Message
                  <textarea
                    rows="5"
                    value={
                      commandForm.response_message
                    }
                    onChange={(e) =>
                      setCommandForm({
                        ...commandForm,
                        response_message:
                          e.target.value,
                      })
                    }
                    placeholder="Enter command response..."
                  />
                </label>
                                <label>
                  Media Type
                  <select
                    value={commandForm.media_type}
                    onChange={(e) =>
                      setCommandForm({
                        ...commandForm,
                        media_type: e.target.value,
                        media_url:
                          e.target.value === "none"
                            ? ""
                            : commandForm.media_url,
                      })
                    }
                  >
                    <option value="none">No Media</option>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </select>
                </label>

                {commandForm.media_type !== "none" && (
                  <label>
                    {commandForm.media_type === "photo"
                      ? "Photo URL"
                      : "Video URL"}

                    <input
                      type="url"
                      value={commandForm.media_url}
                      onChange={(e) =>
                        setCommandForm({
                          ...commandForm,
                          media_url: e.target.value,
                        })
                      }
                      placeholder={
                        commandForm.media_type === "photo"
                          ? "https://example.com/photo.jpg"
                          : "https://example.com/video.mp4"
                      }
                    />

                    <small
                      style={{
                        display: "block",
                        marginTop: "6px",
                        opacity: 0.7,
                      }}
                    >
                      Direct public URL use karo. Telegram bot ko
                      media access karna chahiye.
                    </small>
                  </label>
                )}

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      commandForm.is_active
                    }
                    onChange={(e) =>
                      setCommandForm({
                        ...commandForm,
                        is_active:
                          e.target.checked,
                      })
                    }
                  />

                  Command Active
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={saveCommand}
                    disabled={commandSaving}
                  >
                    {commandSaving
                      ? "Saving..."
                      : commandForm.id
                      ? "💾 Update Command"
                      : "＋ Add Command"}
                  </button>

                  {commandForm.id && (
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={resetCommandForm}
                      disabled={commandSaving}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
                          {/* LIVE PREVIEW */}

              <div
                style={{
                  marginTop: "10px",
                  marginBottom: "24px",
                  maxWidth: "720px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  👀 Live Preview
                </h3>

                <div
                  style={{
                    background: "#17212b",
                    borderRadius: "14px",
                    padding: "16px",
                    maxWidth: "420px",
                    color: "#ffffff",
                    boxShadow:
                      "0 8px 30px rgba(0,0,0,0.25)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.65,
                      marginBottom: "10px",
                    }}
                  >
                    FZ BOT TG • Telegram Preview
                  </div>

                  {commandForm.media_type === "photo" &&
                    commandForm.media_url && (
                      <img
                        src={commandForm.media_url}
                        alt="Command media preview"
                        style={{
                          width: "100%",
                          maxHeight: "240px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          marginBottom: "12px",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    )}

                  {commandForm.media_type === "video" &&
                    commandForm.media_url && (
                      <video
                        src={commandForm.media_url}
                        controls
                        style={{
                          width: "100%",
                          maxHeight: "240px",
                          borderRadius: "10px",
                          marginBottom: "12px",
                        }}
                      />
                    )}

                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    {commandForm.response_message ||
                      "Your response message will appear here..."}
                  </div>

                  {commandForm.command && (
                    <div
                      style={{
                        marginTop: "12px",
                        fontSize: "12px",
                        opacity: 0.55,
                      }}
                    >
                      Command: /{commandForm.command.replace(
                        /^\//,
                        ""
                      )}
                    </div>
                  )}
                </div>
               {/* BUTTON PREVIEW */}

{buttons.filter((button) => button.is_active !== false).length > 0 && (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "8px",
      marginTop: "14px",
    }}
  >
    {buttons
      .filter((button) => button.is_active !== false)
      .sort(
        (a, b) =>
          Number(a.position || 0) -
          Number(b.position || 0)
      )
      .map((button) => (
        <button
          key={button.id}
          type="button"
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "10px 12px",
            background: "#2481cc",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "default",
          }}
        >
          {button.button_text || "Button"}
        </button>
      ))}
  </div>
)} 
              </div>

              {/* COMMAND LIST */}

              {commandsLoading ? (
                <div className="empty-state">
                  <div className="empty-icon">◷</div>
                  <h3>Loading Commands...</h3>
                </div>
              ) : commands.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">⌘</div>
                  <h3>No Commands Yet</h3>
                  <p>
                    Add your first command above.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {commands.map((item) => (
                    <div
                      key={item.id}
                      className="panel-card"
                      style={{
                        margin: 0,
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "16px",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <strong
                            style={{
                              fontSize: "16px",
                            }}
                          >
                            {item.command?.startsWith("/")
                              ? item.command
                              : `/${item.command}`}
                          </strong>

                          <p
                            style={{
                              margin:
                                "8px 0 0",
                              opacity: 0.75,
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {item.response_message ||
                              "No response"}
                          </p>

                          <span
                            style={{
                              display:
                                "inline-block",
                              marginTop: "10px",
                              padding:
                                "5px 9px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "12px",
                              background:
                                item.is_active
                                  ? "rgba(60,210,130,.12)"
                                  : "rgba(255,80,80,.12)",
                              color:
                                item.is_active
                                  ? "#63e6a1"
                                  : "#ff7777",
                            }}
                          >
                            {item.is_active
                              ? "Active"
                              : "Disabled"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              editCommand(item)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              deleteCommand(
                                item.id
                              )
                            }
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================
              BUTTONS PANEL
          ========================= */}

          {showButtons && (
            <div
              className="panel-card"
              style={{ marginTop: "18px" }}
            >
              <div className="panel-header">
                <div>
                  <h2>▦ Bot Buttons</h2>
                  <p>
                    Create and manage Telegram buttons.
                  </p>
                </div>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    setShowButtons(false)
                  }
                >
                  Close
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                  maxWidth: "720px",
                  marginBottom: "24px",
                }}
              >
                <label>
                  Button Text
                  <input
                    type="text"
                    value={
                      buttonForm.button_text
                    }
                    onChange={(e) =>
                      setButtonForm({
                        ...buttonForm,
                        button_text:
                          e.target.value,
                      })
                    }
                    placeholder="Join Channel"
                  />
                </label>

                <label>
                  Button Type
                  <select
                    value={
                      buttonForm.button_type
                    }
                    onChange={(e) =>
                      setButtonForm({
                        ...buttonForm,
                        button_type:
                          e.target.value,
                      })
                    }
                  >
                    <option value="url">
                      URL
                    </option>
                    <option value="callback">
                      Callback
                    </option>
                  </select>
                </label>

                <label>
                  Button Value
                  <input
                    type="text"
                    value={
                      buttonForm.button_value
                    }
                    onChange={(e) =>
                      setButtonForm({
                        ...buttonForm,
                        button_value:
                          e.target.value,
                      })
                    }
                    placeholder={
                      buttonForm.button_type ===
                      "url"
                        ? "https://t.me/yourchannel"
                        : "callback_value"
                    }
                  />
                </label>

                <label>
                  Position
                  <input
                    type="number"
                    min="0"
                    value={buttonForm.position}
                    onChange={(e) =>
                      setButtonForm({
                        ...buttonForm,
                        position:
                          e.target.value,
                      })
                    }
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      buttonForm.is_active
                    }
                    onChange={(e) =>
                      setButtonForm({
                        ...buttonForm,
                        is_active:
                          e.target.checked,
                      })
                    }
                  />

                  Button Active
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={saveButton}
                    disabled={buttonSaving}
                  >
                    {buttonSaving
                      ? "Saving..."
                      : buttonForm.id
                      ? "💾 Update Button"
                      : "＋ Add Button"}
                  </button>

                  {buttonForm.id && (
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={resetButtonForm}
                      disabled={buttonSaving}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              {buttonsLoading ? (
                <div className="empty-state">
                  <div className="empty-icon">◷</div>
                  <h3>Loading Buttons...</h3>
                </div>
              ) : buttons.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">▦</div>
                  <h3>No Buttons Yet</h3>
                  <p>
                    Add your first button above.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {buttons.map((item) => (
                    <div
                      key={item.id}
                      className="panel-card"
                      style={{
                        margin: 0,
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "16px",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <strong>
                            {item.button_text}
                          </strong>

                          <p
                            style={{
                              margin:
                                "7px 0",
                              opacity: 0.7,
                            }}
                          >
                            Type:{" "}
                            {item.button_type ||
                              "url"}
                            {" • "}
                            Position:{" "}
                            {item.position ?? 0}
                          </p>

                          <p
                            style={{
                              margin: 0,
                              opacity: 0.75,
                              wordBreak:
                                "break-word",
                            }}
                          >
                            {item.button_value}
                          </p>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              editButton(item)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              deleteButton(
                                item.id
                              )
                            }
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      {/* SCREENS & MENUS PANEL */}
{showScreens && (
  <section className="panel-section">
    <div className="section-header">
      <div>
        <h2>Screens & Menus</h2>
        <p>
          Telegram bot ke different screens aur menus yahan manage karo.
        </p>
      </div>

      <button
        type="button"
        className="primary-btn"
        onClick={resetScreenForm}
      >
        + New Screen
      </button>
    </div>

    {screensLoading ? (
      <div className="empty-state">
        Loading screens...
      </div>
    ) : (
      <div className="screen-layout">

        {/* SCREEN LIST */}
        <div className="screen-list">
          <h3>Bot Screens</h3>

          {screens.length === 0 ? (
            <div className="empty-state">
              <p>No screens created yet.</p>

              <button
                type="button"
                className="primary-btn"
                onClick={resetScreenForm}
              >
                Create First Screen
              </button>
            </div>
          ) : (
            screens.map((screen) => (
              <button
                key={screen.id}
                type="button"
                className={`screen-item ${
                  selectedScreenId === screen.id
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setSelectedScreenId(screen.id);
                  editScreen(screen);
                }}
              >
                <div>
                  <strong>
                    {screen.title || screen.screen_key}
                  </strong>

                  <small>
                    {screen.screen_key}
                  </small>
                </div>

                <span>→</span>
              </button>
            ))
          )}
        </div>

        {/* SCREEN EDITOR */}
        <div className="screen-editor">
          <h3>
            {screenForm.id
              ? "Edit Screen"
              : "Create Screen"}
          </h3>

          <div className="form-grid">

            <div className="form-group">
              <label>Screen Key</label>

              <input
                type="text"
                value={screenForm.screen_key}
                onChange={(e) =>
                  setScreenForm((prev) => ({
                    ...prev,
                    screen_key: e.target.value,
                  }))
                }
                placeholder="main_menu"
              />
            </div>

            <div className="form-group">
              <label>Screen Title</label>

              <input
                type="text"
                value={screenForm.title}
                onChange={(e) =>
                  setScreenForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Main Menu"
              />
            </div>

          </div>

          <div className="form-group">
            <label>Message</label>

            <textarea
              rows="6"
              value={screenForm.message_text}
              onChange={(e) =>
                setScreenForm((prev) => ({
                  ...prev,
                  message_text: e.target.value,
                }))
              }
              placeholder="Welcome to FZ BOT TG..."
            />
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>Media Type</label>

              <select
                value={screenForm.media_type}
                onChange={(e) =>
                  setScreenForm((prev) => ({
                    ...prev,
                    media_type: e.target.value,
                  }))
                }
              >
                <option value="none">No Media</option>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="form-group">
              <label>Media URL</label>

              <input
                type="text"
                value={screenForm.media_url}
                onChange={(e) =>
                  setScreenForm((prev) => ({
                    ...prev,
                    media_url: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>

          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>Parent Screen</label>

              <select
                value={screenForm.parent_screen_id}
                onChange={(e) =>
                  setScreenForm((prev) => ({
                    ...prev,
                    parent_screen_id: e.target.value,
                  }))
                }
              >
                <option value="">
                  No Parent
                </option>

                {screens
                  .filter(
                    (screen) =>
                      screen.id !== screenForm.id
                  )
                  .map((screen) => (
                    <option
                      key={screen.id}
                      value={screen.id}
                    >
                      {screen.title ||
                        screen.screen_key}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Position</label>

              <input
                type="number"
                value={screenForm.position}
                onChange={(e) =>
                  setScreenForm((prev) => ({
                    ...prev,
                    position:
                      Number(e.target.value) || 0,
                  }))
                }
              />
            </div>

          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={screenForm.is_active}
              onChange={(e) =>
                setScreenForm((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
            />

            <span>Screen Active</span>
          </label>

          <div className="form-actions">

            <button
              type="button"
              className="primary-btn"
              onClick={saveScreen}
              disabled={screenSaving}
            >
              {screenSaving
                ? "Saving..."
                : screenForm.id
                ? "Update Screen"
                : "Create Screen"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={resetScreenForm}
            >
              Clear
            </button>

            {screenForm.id && (
              <button
                type="button"
                className="danger-btn"
                onClick={() =>
                  deleteScreen(screenForm)
                }
              >
                Delete
              </button>
            )}

          </div>

        </div>
      </div>
    )}
  </section>
)}
    </section>
  );
}

/* =========================
   PRODUCTS
========================= */

function PurchasePanel() {
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [methods, setMethods] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPurchaseData();
  }, []);

  const loadPurchaseData = async () => {
    setLoadingProducts(true);
    setError("");

    const [productsResult, methodsResult] =
      await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("payment_methods")
          .select("*")
          .eq("is_active", true)
          .order("position", { ascending: true }),
      ]);

    if (productsResult.error) {
      setError(productsResult.error.message);
      setProducts([]);
    } else {
      setProducts(productsResult.data || []);
    }

    if (methodsResult.error) {
      setError(methodsResult.error.message);
      setMethods([]);
    } else {
      setMethods(methodsResult.data || []);
    }

    setLoadingProducts(false);
  };

  const loadPrices = async (productId) => {
    if (!productId) {
      setPrices([]);
      setSelectedDuration("");
      return;
    }

    setLoadingPrices(true);
    setError("");

    const { data, error: priceError } = await supabase
      .from("product_prices")
      .select("*")
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (priceError) {
      setError(priceError.message);
      setPrices([]);
    } else {
      setPrices(data || []);
    }

    setSelectedDuration("");
    setLoadingPrices(false);
  };

  const selectedProduct = products.find(
    (product) =>
      String(product.id) === String(selectedProductId)
  );

  const selectedPrice = prices.find(
    (item) => item.duration === selectedDuration
  );

  const selectedMethod =
    methods.find(
      (method) =>
        method.type === "upi" &&
        method.upi_id
    ) || null;

  const qrUrl = (() => {
    if (!selectedMethod || !selectedPrice) {
      return "";
    }

    const upiUrl =
      `upi://pay?pa=${encodeURIComponent(
        selectedMethod.upi_id
      )}` +
      `&pn=${encodeURIComponent(
        selectedMethod.account_name ||
          selectedMethod.name ||
          "FZ BOT TG"
      )}` +
      `&am=${encodeURIComponent(
        Number(selectedPrice.price).toFixed(2)
      )}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(
        `${selectedProduct?.name || "Product"} - ${selectedDuration}`
      )}`;

    return (
      "https://api.qrserver.com/v1/create-qr-code/" +
      `?size=320x320&data=${encodeURIComponent(upiUrl)}`
    );
  })();

  const submitPayment = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedProductId) {
      setError("Please select a product.");
      return;
    }

    if (!selectedDuration) {
      setError("Please select a duration.");
      return;
    }

    if (!selectedPrice) {
      setError("Selected price not found.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter your transaction ID.");
      return;
    }

    if (!selectedMethod) {
      setError("No active UPI payment method available.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: sessionData,
      } = await supabase.auth.getSession();

      const userId =
        sessionData?.session?.user?.id || null;

      const { error: insertError } = await supabase
        .from("payments")
        .insert({
          user_id: userId,
          amount: Number(selectedPrice.price),
          payment_method: selectedMethod.name,
          transaction_id: transactionId.trim(),
          status: "pending",
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess(
        "Payment submitted successfully. Verification pending."
      );

      setTransactionId("");
    } catch (submitError) {
      console.error(
        "Purchase payment error:",
        submitError
      );

      setError(
        submitError?.message ||
          "Payment submit failed."
      );
    }

    setSubmitting(false);
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>🛒 Purchase</h1>
          <p>
            Select product, duration and complete payment.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "rgba(239,68,68,0.12)",
            border:
              "1px solid rgba(239,68,68,0.35)",
            color: "#fca5a5",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "rgba(34,197,94,0.12)",
            border:
              "1px solid rgba(34,197,94,0.35)",
            color: "#86efac",
          }}
        >
          ✅ {success}
        </div>
      )}

      <div
        className="panel-card"
        style={{
          maxWidth: "900px",
        }}
      >
        {loadingProducts ? (
          <div className="empty-state">
            <h3>Loading products...</h3>
          </div>
        ) : (
          <form
            onSubmit={submitPayment}
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            <label>
              Product

              <select
                value={selectedProductId}
                onChange={(event) => {
                  const value = event.target.value;

                  setSelectedProductId(value);
                  loadPrices(value);
                  setSuccess("");
                }}
                style={{
                  width: "100%",
                  marginTop: "6px",
                }}
              >
                <option value="">
                  Select Product
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedProductId && (
              <label>
                Duration

                <select
                  value={selectedDuration}
                  onChange={(event) =>
                    setSelectedDuration(
                      event.target.value
                    )
                  }
                  disabled={loadingPrices}
                  style={{
                    width: "100%",
                    marginTop: "6px",
                  }}
                >
                  <option value="">
                    {loadingPrices
                      ? "Loading prices..."
                      : "Select Duration"}
                  </option>

                  {prices.map((item) => (
                    <option
                      key={item.id}
                      value={item.duration}
                    >
                      {item.duration} — ₹
                      {Number(item.price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedPrice && (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    "rgba(37,99,235,0.10)",
                  border:
                    "1px solid rgba(37,99,235,0.25)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.7,
                  }}
                >
                  Selected Plan
                </div>

                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "800",
                    marginTop: "5px",
                  }}
                >
                  {selectedProduct?.name}
                </div>

                <div style={{ marginTop: "5px" }}>
                  {selectedDuration}
                </div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    marginTop: "8px",
                  }}
                >
                  ₹{Number(selectedPrice.price).toFixed(2)}
                </div>
              </div>
            )}

            {selectedPrice && selectedMethod && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(250px, 1fr) minmax(240px, 320px)",
                  gap: "24px",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3>💳 Pay with UPI</h3>

                  <p>
                    UPI ID:{" "}
                    <strong>
                      {selectedMethod.upi_id}
                    </strong>
                  </p>

                  {selectedMethod.instructions && (
                    <p
                      style={{
                        opacity: 0.7,
                      }}
                    >
                      {selectedMethod.instructions}
                    </p>
                  )}
                </div>

                {qrUrl && (
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={qrUrl}
                      alt="Payment QR"
                      style={{
                        width: "260px",
                        maxWidth: "100%",
                        background: "#ffffff",
                        padding: "8px",
                        borderRadius: "12px",
                      }}
                    />

                    <div
                      style={{
                        marginTop: "8px",
                        fontWeight: "700",
                      }}
                    >
                      Scan & Pay ₹
                      {Number(
                        selectedPrice.price
                      ).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedPrice && (
              <label>
                Transaction ID / UTR

                <input
                  type="text"
                  value={transactionId}
                  onChange={(event) =>
                    setTransactionId(
                      event.target.value
                    )
                  }
                  placeholder="Enter UTR / Transaction ID"
                  style={{
                    width: "100%",
                    marginTop: "6px",
                  }}
                />
              </label>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "💳 Submit Payment"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
function Products() {
  const emptyForm = {
    name: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    stock: "",
    offer: "",
    offerPrice: "",
  };

  const emptyPriceForm = {
    duration: "",
    price: "",
  };

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  /* =========================
     PRICING STATES
  ========================= */

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [prices, setPrices] = useState([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceDeletingId, setPriceDeletingId] = useState(null);
  const [priceError, setPriceError] = useState("");
  const [priceForm, setPriceForm] = useState(emptyPriceForm);
  const [editingPriceId, setEditingPriceId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  /* =========================
     PRODUCT FUNCTIONS
  ========================= */

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Products load error:", fetchError);
      setError(fetchError.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    resetForm();
    setError("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      duration: product.duration || "",
      stock: String(product.stock ?? ""),
      offer: product.offer || "",
      offerPrice:
        product.offer_price === null ||
        product.offer_price === undefined
          ? ""
          : String(product.offer_price),
    });

    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
    setError("");
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    setSaving(true);

    const productData = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      price: Number(form.price) || 0,
      duration: form.duration.trim() || null,
      stock: Math.max(0, Number(form.stock) || 0),
      offer: form.offer.trim() || null,
      offer_price:
        form.offerPrice === ""
          ? null
          : Math.max(0, Number(form.offerPrice) || 0),
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("products")
        .insert(productData);
    }

    if (result.error) {
      console.error("Product save error:", result.error);
      setError(result.error.message);
      setSaving(false);
      return;
    }

    resetForm();
    setShowForm(false);

    await loadProducts();

    setSaving(false);
  };

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setError("");
    setDeletingId(id);

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Product delete error:", deleteError);
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    setProducts((previous) =>
      previous.filter((product) => product.id !== id)
    );

    if (selectedProductId === id) {
      setSelectedProductId(null);
      setPrices([]);
    }

    if (editingId === id) {
      closeForm();
    }

    setDeletingId(null);
  };

  /* =========================
     PRICING FUNCTIONS
  ========================= */

  const resetPriceForm = () => {
    setPriceForm(emptyPriceForm);
    setEditingPriceId(null);
  };

  const loadPrices = async (productId) => {
    if (!productId) {
      setPrices([]);
      return;
    }

    setPriceLoading(true);
    setPriceError("");

    const { data, error: fetchError } = await supabase
      .from("product_prices")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Product pricing load error:", fetchError);
      setPriceError(fetchError.message);
      setPrices([]);
    } else {
      setPrices(data || []);
    }

    setPriceLoading(false);
  };

  const openPricing = async (productId) => {
    setSelectedProductId(productId);
    resetPriceForm();
    setPriceError("");

    await loadPrices(productId);
  };

  const closePricing = () => {
    setSelectedProductId(null);
    setPrices([]);
    resetPriceForm();
    setPriceError("");
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;

    setPriceForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const editPricing = (priceItem) => {
    setEditingPriceId(priceItem.id);

    setPriceForm({
      duration: priceItem.duration || "",
      price: String(priceItem.price ?? ""),
    });

    setPriceError("");
  };

  const savePricing = async (e) => {
    e.preventDefault();

    setPriceError("");

    if (!selectedProductId) {
      setPriceError("Please select a product first.");
      return;
    }

    if (!priceForm.duration.trim()) {
      setPriceError("Duration is required.");
      return;
    }

    const priceValue = Number(priceForm.price);

    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setPriceError("Please enter a valid price.");
      return;
    }

    setPriceSaving(true);

    const priceData = {
      product_id: selectedProductId,
      duration: priceForm.duration.trim(),
      price: priceValue,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (editingPriceId) {
      result = await supabase
        .from("product_prices")
        .update({
          duration: priceData.duration,
          price: priceData.price,
          updated_at: priceData.updated_at,
        })
        .eq("id", editingPriceId);
    } else {
      result = await supabase
        .from("product_prices")
        .insert(priceData);
    }

    if (result.error) {
      console.error("Pricing save error:", result.error);
      setPriceError(result.error.message);
      setPriceSaving(false);
      return;
    }

    resetPriceForm();

    await loadPrices(selectedProductId);

    setPriceSaving(false);
  };

  const deletePricing = async (priceId) => {
    const confirmed = window.confirm(
      "Delete this pricing plan?"
    );

    if (!confirmed) return;

    setPriceError("");
    setPriceDeletingId(priceId);

    const { error: deleteError } = await supabase
      .from("product_prices")
      .delete()
      .eq("id", priceId);

    if (deleteError) {
      console.error("Pricing delete error:", deleteError);
      setPriceError(deleteError.message);
      setPriceDeletingId(null);
      return;
    }

    setPrices((previous) =>
      previous.filter((item) => item.id !== priceId)
    );

    if (editingPriceId === priceId) {
      resetPriceForm();
    }

    setPriceDeletingId(null);
  };

  const togglePricing = async (priceItem) => {
    setPriceError("");

    const { error: updateError } = await supabase
      .from("product_prices")
      .update({
        is_active: !priceItem.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", priceItem.id);

    if (updateError) {
      console.error("Pricing status error:", updateError);
      setPriceError(updateError.message);
      return;
    }

    setPrices((previous) =>
      previous.map((item) =>
        item.id === priceItem.id
          ? {
              ...item,
              is_active: !item.is_active,
            }
          : item
      )
    );
  };

  /* =========================
     SEARCH
  ========================= */

  const filteredProducts = products.filter((product) => {
    const searchableText = [
      product.name,
      product.category,
      product.description,
      product.duration,
      product.offer,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.toLowerCase());
  });

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId
  );

  return (
    <section className="page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-heading">
        <div>
          <h1>Products</h1>
          <p>
            Add and manage products, pricing, duration and stock.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="primary-btn"
            onClick={loadProducts}
            disabled={loading}
            type="button"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <button
            className="primary-btn"
            onClick={showForm ? closeForm : openAddForm}
            type="button"
          >
            {showForm ? "Close" : "+ Add Product"}
          </button>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "rgba(255, 70, 70, 0.10)",
            border: "1px solid rgba(255, 70, 70, 0.30)",
            color: "#ff7777",
          }}
        >
          {error}
        </div>
      )}

      {/* =========================
          PRODUCT FORM
      ========================= */}

      {showForm && (
        <div className="panel-card product-form-card">

          <div className="panel-header">
            <div>
              <h2>
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p>
                {editingId
                  ? "Update the product information below."
                  : "Enter the product information below."}
              </p>
            </div>
          </div>

          <form
            className="product-form"
            onSubmit={saveProduct}
          >

            <FormInput
              label="Product Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />

            <FormInput
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Enter category"
            />

            <FormInput
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
            />

            <FormInput
              label="Base Price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
            />

            <FormInput
              label="Base Duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="Example: 30 Days"
            />

            <FormInput
              label="Stock / Keys"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
            />

            <FormInput
              label="Offer"
              name="offer"
              value={form.offer}
              onChange={handleChange}
              placeholder="Example: 20% OFF"
            />

            <FormInput
              label="Offer Price"
              name="offerPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.offerPrice}
              onChange={handleChange}
              placeholder="0"
            />

            <div
              className="form-full"
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >

              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Save Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeForm}
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>
        </div>
      )}

      {/* =========================
          PRODUCT LIST
      ========================= */}

      <div className="panel-card">

        <div className="panel-header">

          <div>
            <h2>Product List</h2>

            <p>
              {filteredProducts.length} product(s) shown
              {" "}•{" "}
              {products.length} total
            </p>
          </div>

          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
          />

        </div>

        {loading ? (

          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <h3>Loading Products...</h3>
            <p>
              Please wait while products are loaded.
            </p>
          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="empty-state">
            <div className="empty-icon">▤</div>

            <h3>
              {products.length === 0
                ? "No Products Yet"
                : "No Matching Products"}
            </h3>

            <p>
              {products.length === 0
                ? "Add your first product using the Add Product button."
                : "Try another search term."}
            </p>
          </div>

        ) : (

          <div className="product-list">

            {filteredProducts.map((product) => {

              const hasOfferPrice =
                product.offer_price !== null &&
                product.offer_price !== undefined &&
                product.offer_price !== "" &&
                Number(product.offer_price) <
                  Number(product.price);

              const isPricingOpen =
                selectedProductId === product.id;

              return (
                <div
                  className="product-row"
                  key={product.id}
                  style={{
                    alignItems: "flex-start",
                  }}
                >

                  {/* PRODUCT INFO */}

                  <div>

                    <h3>{product.name}</h3>

                    <p>
                      {product.description ||
                        "No description"}
                    </p>

                    <small>
                      {product.category ||
                        "No category"}{" "}
                      •{" "}
                      {product.duration ||
                        "No duration"}
                    </small>

                    {product.offer && (
                      <small
                        style={{
                          display: "block",
                          marginTop: "5px",
                        }}
                      >
                        Offer: {product.offer}
                      </small>
                    )}

                  </div>

                  {/* PRODUCT PRICE */}

                  <div className="product-price">

                    <strong>
                      ₹
                      {hasOfferPrice
                        ? Number(
                            product.offer_price
                          ).toFixed(2)
                        : Number(
                            product.price || 0
                          ).toFixed(2)}
                    </strong>

                    {hasOfferPrice && (
                      <span
                        style={{
                          textDecoration:
                            "line-through",
                          opacity: 0.6,
                        }}
                      >
                        ₹
                        {Number(
                          product.price || 0
                        ).toFixed(2)}
                      </span>
                    )}

                    <span>
                      Stock: {product.stock ?? 0}
                    </span>

                  </div>

                  {/* ACTIONS */}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() =>
                        isPricingOpen
                          ? closePricing()
                          : openPricing(product.id)
                      }
                    >
                      {isPricingOpen
                        ? "Close Pricing"
                        : "💰 Pricing"}
                    </button>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        openEditForm(product)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        deleteProduct(product.id)
                      }
                      disabled={
                        deletingId === product.id
                      }
                    >
                      {deletingId === product.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                  {/* =========================
                      PRICING MANAGER
                  ========================= */}

                  {isPricingOpen && (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        width: "100%",
                        marginTop: "14px",
                        padding: "16px",
                        borderRadius: "12px",
                        border:
                          "1px solid rgba(255,255,255,0.10)",
                        background:
                          "rgba(255,255,255,0.025)",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginBottom: "14px",
                        }}
                      >

                        <div>
                          <h3
                            style={{
                              margin: 0,
                            }}
                          >
                            💰 Pricing Plans
                          </h3>

                          <p
                            style={{
                              margin:
                                "5px 0 0",
                              opacity: 0.7,
                            }}
                          >
                            {selectedProduct?.name ||
                              "Product"}{" "}
                            • Multiple plans
                          </p>
                        </div>

                        <span
                          style={{
                            padding:
                              "6px 10px",
                            borderRadius:
                              "999px",
                            background:
                              "rgba(0,200,120,0.10)",
                            border:
                              "1px solid rgba(0,200,120,0.20)",
                            fontSize:
                              "12px",
                          }}
                        >
                          {prices.length} plan(s)
                        </span>

                      </div>

                      {priceError && (
                        <div
                          style={{
                            marginBottom: "12px",
                            padding:
                              "10px 12px",
                            borderRadius: "9px",
                            background:
                              "rgba(255,70,70,0.10)",
                            border:
                              "1px solid rgba(255,70,70,0.25)",
                            color: "#ff7777",
                          }}
                        >
                          {priceError}
                        </div>
                      )}

                      {/* ADD / EDIT PRICE FORM */}

                      <form
                        onSubmit={savePricing}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(160px, 1fr) minmax(120px, 180px) auto",
                          gap: "10px",
                          marginBottom:
                            "16px",
                        }}
                      >

                        <input
                          className="search-input"
                          name="duration"
                          value={
                            priceForm.duration
                          }
                          onChange={
                            handlePriceChange
                          }
                          placeholder="Duration e.g. 7 Days"
                          required
                        />

                        <input
                          className="search-input"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            priceForm.price
                          }
                          onChange={
                            handlePriceChange
                          }
                          placeholder="Price ₹"
                          required
                        />

                        <button
                          type="submit"
                          className="primary-btn"
                          disabled={
                            priceSaving
                          }
                        >
                          {priceSaving
                            ? "Saving..."
                            : editingPriceId
                            ? "Update"
                            : "+ Add Plan"}
                        </button>

                      </form>

                      {editingPriceId && (
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={
                            resetPriceForm
                          }
                          style={{
                            marginBottom:
                              "12px",
                          }}
                        >
                          Cancel Pricing Edit
                        </button>
                      )}

                      {/* PRICE LIST */}

                      {priceLoading ? (

                        <div
                          style={{
                            padding: "15px",
                            textAlign: "center",
                            opacity: 0.7,
                          }}
                        >
                          Loading pricing...
                        </div>

                      ) : prices.length === 0 ? (

                        <div
                          style={{
                            padding: "18px",
                            textAlign: "center",
                            borderRadius: "10px",
                            border:
                              "1px dashed rgba(255,255,255,0.15)",
                            opacity: 0.7,
                          }}
                        >
                          No pricing plans yet.
                          Add the first plan above.
                        </div>

                      ) : (

                        <div
                          style={{
                            display: "flex",
                            flexDirection:
                              "column",
                            gap: "8px",
                          }}
                        >

                          {prices.map(
                            (priceItem) => (
                              <div
                                key={
                                  priceItem.id
                                }
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  alignItems:
                                    "center",
                                  gap: "12px",
                                  flexWrap:
                                    "wrap",
                                  padding:
                                    "12px",
                                  borderRadius:
                                    "10px",
                                  border:
                                    "1px solid rgba(255,255,255,0.08)",
                                  background:
                                    "rgba(255,255,255,0.02)",
                                }}
                              >

                                <div>
                                  <strong>
                                    {priceItem.duration}
                                  </strong>

                                  <div
                                    style={{
                                      marginTop:
                                        "4px",
                                      fontSize:
                                        "18px",
                                      fontWeight:
                                        "700",
                                    }}
                                  >
                                    ₹
                                    {Number(
                                      priceItem.price ||
                                        0
                                    ).toFixed(2)}
                                  </div>
                                </div>

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    gap:
                                      "7px",
                                    flexWrap:
                                      "wrap",
                                    alignItems:
                                      "center",
                                  }}
                                >

                                  <span
                                    style={{
                                      padding:
                                        "5px 9px",
                                      borderRadius:
                                        "999px",
                                      fontSize:
                                        "11px",
                                      background:
                                        priceItem.is_active
                                          ? "rgba(0,200,120,0.10)"
                                          : "rgba(255,255,255,0.07)",
                                    }}
                                  >
                                    {priceItem.is_active
                                      ? "ACTIVE"
                                      : "INACTIVE"}
                                  </span>

                                  <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() =>
                                      editPricing(
                                        priceItem
                                      )
                                    }
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() =>
                                      togglePricing(
                                        priceItem
                                      )
                                    }
                                  >
                                    {priceItem.is_active
                                      ? "Disable"
                                      : "Enable"}
                                  </button>

                                  <button
                                    type="button"
                                    className="delete-btn"
                                    onClick={() =>
                                      deletePricing(
                                        priceItem.id
                                      )
                                    }
                                    disabled={
                                      priceDeletingId ===
                                      priceItem.id
                                    }
                                  >
                                    {priceDeletingId ===
                                    priceItem.id
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>

                                </div>

                              </div>
                            )
                          )}

                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>

    </section>
  );
}

/* =========================
   PAYMENTS
========================= */

function Payments() {
  const [activeTab, setActiveTab] = useState("deposits");
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [methods, setMethods] = useState([]);

  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);

  const [savingMethod, setSavingMethod] = useState(false);
  const [deletingMethod, setDeletingMethod] = useState(null);
  const [editingMethodId, setEditingMethodId] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const emptyMethod = {
    name: "",
    type: "upi",
    upi_id: "",
    account_name: "",
    account_number: "",
    ifsc_code: "",
    qr_image_url: "",
    instructions: "",
    is_active: true,
    position: 0,
  };

  const [methodForm, setMethodForm] = useState(emptyMethod);
  const [qrMethodId, setQrMethodId] = useState("");
const [qrAmount, setQrAmount] = useState("");
const [qrNote, setQrNote] = useState("FZ BOT TG Payment");
const [qrGeneratedUrl, setQrGeneratedUrl] = useState("");

  const loadPayments = async () => {
    setLoadingPayments(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("payments")
      .select(`
        *,
        users (
          telegram_id,
          username,
          first_name
        )
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Payments load error:", fetchError);
      setError(fetchError.message);
      setPayments([]);
    } else {
      setPayments(data || []);
    }

    setLoadingPayments(false);
  };

  const loadOrders = async () => {
    setLoadingOrders(true);

    const { data, error: fetchError } = await supabase
      .from("orders")
      .select(`
        *,
        users (
          telegram_id,
          username,
          first_name
        ),
        products (
          name,
          duration
        ),
        product_keys (
          key_code,
          status,
          expires_at
        )
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Orders load error:", fetchError);
      setOrders([]);
      setError(fetchError.message);
    } else {
      setOrders(data || []);
    }

    setLoadingOrders(false);
  };

  const loadMethods = async () => {
    setLoadingMethods(true);

    const { data, error: fetchError } = await supabase
      .from("payment_methods")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Payment methods load error:", fetchError);
      setMethods([]);
      setError(fetchError.message);
    } else {
      setMethods(data || []);
    }

    setLoadingMethods(false);
  };

  useEffect(() => {
    loadPayments();
    loadOrders();
    loadMethods();
  }, []);

  const resetMethodForm = () => {
    setMethodForm(emptyMethod);
    setEditingMethodId(null);
  };

  const savePaymentMethod = async (event) => {
    event.preventDefault();

    if (!methodForm.name.trim()) {
      setError("Payment method name required.");
      return;
    }

    if (methodForm.type === "upi" && !methodForm.upi_id.trim()) {
      setError("UPI ID required.");
      return;
    }

    setSavingMethod(true);
    setError("");

    const payload = {
      name: methodForm.name.trim(),
      type: methodForm.type,
      upi_id: methodForm.upi_id.trim() || null,
      account_name: methodForm.account_name.trim() || null,
      account_number: methodForm.account_number.trim() || null,
      ifsc_code: methodForm.ifsc_code.trim() || null,
      qr_image_url: methodForm.qr_image_url.trim() || null,
      instructions: methodForm.instructions.trim() || null,
      is_active: Boolean(methodForm.is_active),
      position: Number(methodForm.position) || 0,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (editingMethodId) {
      result = await supabase
        .from("payment_methods")
        .update(payload)
        .eq("id", editingMethodId);
    } else {
      result = await supabase
        .from("payment_methods")
        .insert(payload);
    }

    if (result.error) {
      console.error("Payment method save error:", result.error);
      setError(result.error.message);
    } else {
      resetMethodForm();
      await loadMethods();
    }

    setSavingMethod(false);
  };

  const editPaymentMethod = (method) => {
    setEditingMethodId(method.id);

    setMethodForm({
      name: method.name || "",
      type: method.type || "upi",
      upi_id: method.upi_id || "",
      account_name: method.account_name || "",
      account_number: method.account_number || "",
      ifsc_code: method.ifsc_code || "",
      qr_image_url: method.qr_image_url || "",
      instructions: method.instructions || "",
      is_active: Boolean(method.is_active),
      position: method.position || 0,
    });
  };

  const deletePaymentMethod = async (id) => {
    if (!window.confirm("Delete this payment method?")) return;

    setDeletingMethod(id);
    setError("");

    const { error: deleteError } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Payment method delete error:", deleteError);
      setError(deleteError.message);
    } else {
      await loadMethods();

      if (editingMethodId === id) {
        resetMethodForm();
      }
    }

    setDeletingMethod(null);
  };

  const togglePaymentMethod = async (method) => {
    const { error: updateError } = await supabase
      .from("payment_methods")
      .update({
        is_active: !method.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", method.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await loadMethods();
    }
  };

  const generateUpiQrUrl = (method) => {
    const generatePaymentQr = () => {
  const activeMethods = methods.filter(
    (method) =>
      method.is_active !== false &&
      method.type === "upi" &&
      method.upi_id
  );

  const selectedMethod =
    activeMethods.find(
      (method) => String(method.id) === String(qrMethodId)
    ) || activeMethods[0];

  if (!selectedMethod) {
    setError("Pehle ek active UPI payment method add karo.");
    setQrGeneratedUrl("");
    return;
  }

  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(selectedMethod.upi_id)}` +
    `&pn=${encodeURIComponent(
      selectedMethod.account_name ||
        selectedMethod.name ||
        "FZ BOT TG"
    )}` +
    (qrAmount.trim()
      ? `&am=${encodeURIComponent(qrAmount.trim())}`
      : "") +
    `&cu=INR` +
    (qrNote.trim()
      ? `&tn=${encodeURIComponent(qrNote.trim())}`
      : "");

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/` +
    `?size=320x320&data=${encodeURIComponent(upiUrl)}`;

  setQrGeneratedUrl(qrUrl);
  setError("");
};
    if (!method?.upi_id) return "";

    const upiUrl =
      `upi://pay?pa=${encodeURIComponent(method.upi_id)}` +
      `&pn=${encodeURIComponent(method.account_name || method.name || "FZ BOT TG")}`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}`;
  };

  const refreshAll = async () => {
    await Promise.all([
      loadPayments(),
      loadOrders(),
      loadMethods(),
    ]);
  };

  const successfulPayments = payments.filter(
    (item) => String(item.status || "").toLowerCase() === "success" ||
      String(item.status || "").toLowerCase() === "completed" ||
      String(item.status || "").toLowerCase() === "paid"
  );

  const pendingPayments = payments.filter(
    (item) => String(item.status || "").toLowerCase() === "pending"
  );

  const failedPayments = payments.filter(
    (item) => String(item.status || "").toLowerCase() === "failed" ||
      String(item.status || "").toLowerCase() === "rejected"
  );

  const totalDeposits = payments.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const filteredPayments = payments.filter((payment) => {
    const text = [
      payment.transaction_id,
      payment.payment_method,
      payment.status,
      payment.users?.username,
      payment.users?.telegram_id,
      payment.users?.first_name,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const filteredOrders = orders.filter((order) => {
    const text = [
      order.status,
      order.payment_method,
      order.transaction_id,
      order.products?.name,
      order.products?.duration,
      order.users?.username,
      order.users?.telegram_id,
      order.product_keys?.key_code,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>💳 Payments & Settings</h1>
          <p>
            Manage deposits, payment history, payment methods and QR settings.
          </p>
        </div>

        <button type="button" onClick={refreshAll}>
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.35)",
            color: "#fca5a5",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* PAYMENT OVERVIEW */}

      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div className="stat-card">
          <span>Total Deposits</span>
          <strong>₹{totalDeposits.toFixed(2)}</strong>
        </div>

        <div className="stat-card">
          <span>Successful</span>
          <strong>{successfulPayments.length}</strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{pendingPayments.length}</strong>
        </div>

        <div className="stat-card">
          <span>Failed</span>
          <strong>{failedPayments.length}</strong>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "deposits" ? "tab active" : "tab"}
          onClick={() => setActiveTab("deposits")}
        >
          💰 Deposits
        </button>

        <button
          className={activeTab === "history" ? "tab active" : "tab"}
          onClick={() => setActiveTab("history")}
        >
          📜 Payment History
        </button>

        <button
          className={activeTab === "methods" ? "tab active" : "tab"}
          onClick={() => setActiveTab("methods")}
        >
          💳 Payment Methods
        </button>

        <button
          className={activeTab === "settings" ? "tab active" : "tab"}
          onClick={() => setActiveTab("settings")}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* DEPOSITS */}

      {/* QR GENERATOR */}

<div
  className="panel-card"
  style={{
    marginTop: "18px",
    marginBottom: "18px",
  }}
>
  <div className="panel-header">
    <div>
      <h2>📱 Payment QR Generator</h2>
      <p>
        UPI payment ke liye amount-based QR generate karo.
      </p>
    </div>
  </div>

  {methods.filter(
    (method) =>
      method.is_active !== false &&
      method.type === "upi" &&
      method.upi_id
  ).length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">₹</div>

      <h3>No Active UPI Method</h3>

      <p>
        Pehle Payment Methods tab me ek active UPI
        payment method add karo.
      </p>
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(280px, 1fr) minmax(240px, 320px)",
        gap: "24px",
        alignItems: "start",
      }}
    >
      {/* QR FORM */}

      <div>
        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          <label>
            <span>UPI Payment Method</span>

            <select
              value={qrMethodId}
              onChange={(event) => {
                setQrMethodId(event.target.value);
                setQrGeneratedUrl("");
              }}
              style={{
                width: "100%",
                marginTop: "6px",
              }}
            >
              <option value="">
                Select UPI Method
              </option>

              {methods
                .filter(
                  (method) =>
                    method.is_active !== false &&
                    method.type === "upi" &&
                    method.upi_id
                )
                .map((method) => (
                  <option
                    key={method.id}
                    value={method.id}
                  >
                    {method.name} — {method.upi_id}
                  </option>
                ))}
            </select>
          </label>

          <label>
            <span>Amount ₹</span>

            <input
              type="number"
              min="1"
              step="0.01"
              value={qrAmount}
              onChange={(event) => {
                setQrAmount(event.target.value);
                setQrGeneratedUrl("");
              }}
              placeholder="Example: 320"
              style={{
                width: "100%",
                marginTop: "6px",
              }}
            />
          </label>

          <label>
            <span>Payment Note</span>

            <input
              type="text"
              value={qrNote}
              onChange={(event) => {
                setQrNote(event.target.value);
                setQrGeneratedUrl("");
              }}
              placeholder="FZ BOT TG Payment"
              style={{
                width: "100%",
                marginTop: "6px",
              }}
            />
          </label>

          <button
            type="button"
            onClick={generatePaymentQr}
            style={{
              marginTop: "4px",
              padding: "12px 16px",
              border: "none",
              borderRadius: "10px",
              background:
                "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "#ffffff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🔳 Generate Payment QR
          </button>
        </div>
      </div>

      {/* QR PREVIEW */}

      <div
        style={{
          minHeight: "320px",
          borderRadius: "14px",
          border:
            "1px solid rgba(255,255,255,0.08)",
          background:
            "rgba(255,255,255,0.025)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px",
          textAlign: "center",
        }}
      >
        {qrGeneratedUrl ? (
          <>
            <img
              src={qrGeneratedUrl}
              alt="UPI Payment QR"
              style={{
                width: "260px",
                height: "260px",
                maxWidth: "100%",
                borderRadius: "12px",
                background: "#ffffff",
                padding: "8px",
              }}
            />

            <div
              style={{
                marginTop: "12px",
                fontWeight: "700",
              }}
            >
              {qrAmount
                ? `₹${Number(qrAmount).toFixed(2)}`
                : "Payment QR"}
            </div>

            <a
              href={qrGeneratedUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                textDecoration: "none",
                padding: "9px 14px",
                borderRadius: "8px",
                background: "#16a34a",
                color: "#ffffff",
                fontWeight: "600",
              }}
            >
              🔗 Open QR
            </a>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "54px",
                marginBottom: "10px",
              }}
            >
              📱
            </div>

            <h3 style={{ margin: "0 0 6px" }}>
              QR Preview
            </h3>

            <p
              style={{
                margin: 0,
                opacity: 0.65,
              }}
            >
              UPI method aur amount select karke
              Generate QR dabao.
            </p>
          </>
        )}
      </div>
    </div>
  )}
</div>

      {activeTab === "deposits" && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>💰 User Deposits</h2>
              <p>Track money added by Telegram users.</p>
            </div>

            <input
              type="search"
              placeholder="Search user / transaction..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ maxWidth: "300px" }}
            />
          </div>

          {loadingPayments ? (
            <div className="empty-state">
              <h3>Loading deposits...</h3>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">₹</div>
              <h3>No Deposits Yet</h3>
              <p>
                Deposit records will appear here when users add funds.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Telegram ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Transaction</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        {payment.users?.username
                          ? `@${payment.users.username}`
                          : payment.users?.first_name || "Unknown"}
                      </td>

                      <td>{payment.users?.telegram_id || "—"}</td>

                      <td>
                        ₹{Number(payment.amount || 0).toFixed(2)}
                      </td>

                      <td>{payment.payment_method || "—"}</td>

                      <td>{payment.transaction_id || "—"}</td>

                      <td>
                        {String(payment.status || "pending")}
                      </td>

                      <td>
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PAYMENT HISTORY / ORDERS */}

      {activeTab === "history" && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>📜 Payment & Purchase History</h2>
              <p>
                Payment and product purchase records.
              </p>
            </div>

            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ maxWidth: "300px" }}
            />
          </div>

          {loadingOrders ? (
            <div className="empty-state">
              <h3>Loading orders...</h3>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <h3>No Orders Yet</h3>
              <p>
                Product purchase records will appear here.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Product</th>
                    <th>Duration</th>
                    <th>Amount</th>
                    <th>Key</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        {order.users?.username
                          ? `@${order.users.username}`
                          : order.users?.first_name || "Unknown"}
                      </td>

                      <td>{order.products?.name || "—"}</td>

                      <td>
                        {order.products?.duration || "—"}
                      </td>

                      <td>
                        ₹{Number(order.amount || 0).toFixed(2)}
                      </td>

                      <td>
                        {order.product_keys?.key_code || "Not assigned"}
                      </td>

                      <td>{order.status || "pending"}</td>

                      <td>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PAYMENT METHODS */}

      {activeTab === "methods" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(300px, 0.9fr) minmax(320px, 1.1fr)",
            gap: "18px",
          }}
        >
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h2>
                  {editingMethodId
                    ? "✏️ Edit Payment Method"
                    : "➕ Add Payment Method"}
                </h2>

                <p>
                  Configure the UPI account used for customer payments.
                </p>
              </div>
            </div>

            <form
              onSubmit={savePaymentMethod}
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              <label>
                Method Name
                <input
                  type="text"
                  placeholder="Main UPI"
                  value={methodForm.name}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Type
                <select
                  value={methodForm.type}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      type: event.target.value,
                    })
                  }
                >
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                UPI ID
                <input
                  type="text"
                  placeholder="example@upi"
                  value={methodForm.upi_id}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      upi_id: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Account Name
                <input
                  type="text"
                  placeholder="Account holder name"
                  value={methodForm.account_name}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      account_name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Account Number
                <input
                  type="text"
                  placeholder="Optional"
                  value={methodForm.account_number}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      account_number: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                IFSC Code
                <input
                  type="text"
                  placeholder="Optional"
                  value={methodForm.ifsc_code}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      ifsc_code: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Custom QR Image URL
                <input
                  type="url"
                  placeholder="Optional"
                  value={methodForm.qr_image_url}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      qr_image_url: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Payment Instructions
                <textarea
                  rows="4"
                  placeholder="Example: Pay the exact amount and wait for verification."
                  value={methodForm.instructions}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      instructions: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Position
                <input
                  type="number"
                  min="0"
                  value={methodForm.position}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      position: event.target.value,
                    })
                  }
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={methodForm.is_active}
                  onChange={(event) =>
                    setMethodForm({
                      ...methodForm,
                      is_active: event.target.checked,
                    })
                  }
                />
                Active payment method
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button type="submit" disabled={savingMethod}>
                  {savingMethod
                    ? "Saving..."
                    : editingMethodId
                    ? "Update Method"
                    : "Add Method"}
                </button>

                {editingMethodId && (
                  <button
                    type="button"
                    onClick={resetMethodForm}
                    disabled={savingMethod}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h2>💳 Saved Payment Methods</h2>
                <p>
                  Active methods can be used by the payment system.
                </p>
              </div>
            </div>

            {loadingMethods ? (
              <div className="empty-state">
                <h3>Loading methods...</h3>
              </div>
            ) : methods.length === 0 ? (
              <div className="empty-state">
                <h3>No Payment Method Added</h3>
                <p>
                  Add your UPI method from the form.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {methods.map((method) => {
                  const generatedQr = generateUpiQrUrl(method);
                  const qr =
                    method.qr_image_url || generatedQr;

                  return (
                    <div
                      key={method.id}
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0 }}>
                            {method.name}
                          </h3>

                          <p style={{ margin: "6px 0" }}>
                            {method.type?.toUpperCase()}
                          </p>

                          {method.upi_id && (
                            <p style={{ margin: "4px 0" }}>
                              UPI: <strong>{method.upi_id}</strong>
                            </p>
                          )}

                          {method.account_name && (
                            <p style={{ margin: "4px 0" }}>
                              Name: {method.account_name}
                            </p>
                          )}

                          <p style={{ margin: "8px 0" }}>
                            {method.is_active
                              ? "🟢 Active"
                              : "🔴 Inactive"}
                          </p>
                        </div>

                        {qr && (
                          <img
                            src={qr}
                            alt={`${method.name} QR`}
                            style={{
                              width: "130px",
                              height: "130px",
                              objectFit: "contain",
                              background: "#fff",
                              borderRadius: "8px",
                              padding: "5px",
                            }}
                          />
                        )}
                      </div>

                      {method.instructions && (
                        <p
                          style={{
                            marginTop: "10px",
                            opacity: 0.75,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {method.instructions}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginTop: "12px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => editPaymentMethod(method)}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            togglePaymentMethod(method)
                          }
                        >
                          {method.is_active
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            deletePaymentMethod(method.id)
                          }
                          disabled={deletingMethod === method.id}
                        >
                          {deletingMethod === method.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS */}

      {activeTab === "settings" && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>⚙️ Payment Settings</h2>
              <p>
                Payment verification and purchase rules.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "12px",
              maxWidth: "760px",
            }}
          >
            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <strong>QR Payments</strong>
              <p style={{ opacity: 0.7 }}>
                QR codes are generated from the active UPI payment method.
              </p>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <strong>Exact Amount Rule</strong>
              <p style={{ opacity: 0.7 }}>
                A purchase should be confirmed only when the verified payment
                amount matches the required product price.
              </p>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <strong>Automatic Key Delivery</strong>
              <p style={{ opacity: 0.7 }}>
                After successful payment verification, the backend can assign
                an available product key and record the purchase.
              </p>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(255,193,7,0.08)",
                border: "1px solid rgba(255,193,7,0.2)",
              }}
            >
              <strong>⚠️ Payment Gateway</strong>
              <p style={{ opacity: 0.75 }}>
                QR generation alone does not verify whether money was actually
                received. Automatic payment detection requires a supported
                payment gateway/API and webhook. We will connect that separately
                before enabling automatic key delivery.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


/* =========================
   KEY MANAGEMENT
========================= */

function KeyManagement() {
  const [products, setProducts] = useState([]);
  const [keys, setKeys] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pricingProduct, setPricingProduct] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingDeleting, setPricingDeleting] = useState(null);

  const emptyPricingForm = {
    duration: "",
    price: "",
    offerPrice: "",
  };

  const [pricingForm, setPricingForm] = useState(emptyPricingForm);
  const [editingPricingId, setEditingPricingId] = useState(null);

  const loadPricingPlans = async (productId) => {
    if (!productId) return;

    setPricingLoading(true);

    const { data, error } = await supabase
      .from("product_prices")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Pricing load error:", error);
      setError(error.message);
      setPricingPlans([]);
    } else {
      setPricingPlans(data || []);
    }

    setPricingLoading(false);
  };

  const openPricingManager = async (product) => {
    setError("");
    setPricingProduct(product);
    setEditingPricingId(null);
    setPricingForm(emptyPricingForm);

    await loadPricingPlans(product.id);
  };

  const closePricingManager = () => {
    setPricingProduct(null);
    setPricingPlans([]);
    setEditingPricingId(null);
    setPricingForm(emptyPricingForm);
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;

    setPricingForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const savePricing = async (e) => {
    e.preventDefault();

    if (!pricingProduct) return;

    setError("");

    if (!pricingForm.duration.trim()) {
      setError("Duration is required.");
      return;
    }

    if (pricingForm.price === "" || Number(pricingForm.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setPricingSaving(true);

    const pricingData = {
      product_id: pricingProduct.id,
      duration: pricingForm.duration.trim(),
      price: Number(pricingForm.price),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    if (pricingForm.offerPrice !== "") {
      pricingData.offer_price = Math.max(
        0,
        Number(pricingForm.offerPrice)
      );
    }

    let result;

    if (editingPricingId) {
      result = await supabase
        .from("product_prices")
        .update(pricingData)
        .eq("id", editingPricingId);
    } else {
      result = await supabase
        .from("product_prices")
        .insert(pricingData);
    }

    if (result.error) {
      console.error("Pricing save error:", result.error);
      setError(result.error.message);
      setPricingSaving(false);
      return;
    }

    setPricingForm(emptyPricingForm);
    setEditingPricingId(null);

    await loadPricingPlans(pricingProduct.id);

    setPricingSaving(false);
  };

  const editPricing = (pricing) => {
    setEditingPricingId(pricing.id);

    setPricingForm({
      duration: pricing.duration || "",
      price: String(pricing.price ?? ""),
      offerPrice:
        pricing.offer_price === null ||
        pricing.offer_price === undefined
          ? ""
          : String(pricing.offer_price),
    });
  };

  const deletePricing = async (pricingId) => {
    const confirmed = window.confirm(
      "Delete this pricing plan?"
    );

    if (!confirmed) return;

    setPricingDeleting(pricingId);
    setError("");

    const { error } = await supabase
      .from("product_prices")
      .delete()
      .eq("id", pricingId);

    if (error) {
      console.error("Pricing delete error:", error);
      setError(error.message);
      setPricingDeleting(null);
      return;
    }

    if (pricingProduct) {
      await loadPricingPlans(pricingProduct.id);
    }

    setPricingDeleting(null);
  };
  const [form, setForm] = useState({

    product_id: "",
    duration: "7 Days",
    keysText: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [productsResult, keysResult] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("product_keys")
        .select(`
          *,
          products (
            name
          ),
          users (
            username,
            telegram_id,
            first_name
          )
        `)
        .order("created_at", { ascending: false }),
    ]);

    if (productsResult.error) {
      console.error("Products load error:", productsResult.error);
      setError(productsResult.error.message);
    } else {
      setProducts(productsResult.data || []);
    }

    if (keysResult.error) {
      console.error("Keys load error:", keysResult.error);
      setError(keysResult.error.message);
      setKeys([]);
    } else {
      setKeys(keysResult.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addKeys = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.product_id) {
      setError("Please select a product.");
      return;
    }

    const rawKeys = form.keysText
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (rawKeys.length === 0) {
      setError("Please enter at least one key.");
      return;
    }

    // Remove duplicate keys from the pasted list.
    const uniqueKeys = [...new Set(rawKeys)];

    setSaving(true);

    const rows = uniqueKeys.map((keyCode) => ({
      product_id: Number(form.product_id),
      key_code: keyCode,
      duration: form.duration,
      status: "available",
    }));

    const { error: insertError } = await supabase
      .from("product_keys")
      .insert(rows);

    if (insertError) {
      console.error("Key insert error:", insertError);
      setError(insertError.message);
    } else {
      setForm({
        product_id: form.product_id,
        duration: form.duration,
        keysText: "",
      });

      await loadData();
    }

    setSaving(false);
  };

  const deleteKey = async (id) => {
    if (!window.confirm("Delete this key?")) return;

    setDeleting(id);
    setError("");

    const { error: deleteError } = await supabase
      .from("product_keys")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Key delete error:", deleteError);
      setError(deleteError.message);
    } else {
      await loadData();
    }

    setDeleting(null);
  };

  const filteredKeys = keys.filter((item) => {
    const text = [
      item.key_code,
      item.status,
      item.duration,
      item.products?.name,
      item.users?.username,
      item.users?.telegram_id,
      item.users?.first_name,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const availableCount = keys.filter(
    (item) => item.status === "available"
  ).length;

  const soldCount = keys.filter(
    (item) =>
      item.status === "sold" ||
      item.status === "assigned" ||
      item.assigned_to
  ).length;

  const expiredCount = keys.filter(
    (item) =>
      item.status === "expired" ||
      (item.expires_at &&
        new Date(item.expires_at).getTime() < Date.now())
  ).length;

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>🔑 Key Management</h1>
          <p>
            Add, manage and track product keys.
          </p>
        </div>

        <button type="button" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.35)",
            color: "#fca5a5",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* KEY OVERVIEW */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div className="stat-card">
          <span>Total Keys</span>
          <strong>{keys.length}</strong>
        </div>

        <div className="stat-card">
          <span>Available</span>
          <strong>{availableCount}</strong>
        </div>

        <div className="stat-card">
          <span>Sold / Assigned</span>
          <strong>{soldCount}</strong>
        </div>

        <div className="stat-card">
          <span>Expired</span>
          <strong>{expiredCount}</strong>
        </div>
      </div>

      {/* ADD KEYS */}

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>➕ Add Product Keys</h2>
            <p>
              Paste multiple keys, one key per line.
            </p>
          </div>
        </div>

        <form
          onSubmit={addKeys}
          style={{
            display: "grid",
            gap: "14px",
            maxWidth: "760px",
          }}
        >
          <label>
            Product

            <select
              value={form.product_id}
              onChange={(event) =>
                setForm({
                  ...form,
                  product_id: event.target.value,
                })
              }
            >
              <option value="">
                Select Product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Duration

            <select
              value={form.duration}
              onChange={(event) =>
                setForm({
                  ...form,
                  duration: event.target.value,
                })
              }
            >
              <option value="1 Day">1 Day</option>
              <option value="2 Days">2 Days</option>
              <option value="3 Days">3 Days</option>
              <option value="7 Days">7 Days</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="Lifetime">Lifetime</option>
            </select>
          </label>

          <label>
            Keys

            <textarea
              rows="8"
              placeholder={`ABC-123-XYZ
DEF-456-XYZ
GHI-789-XYZ`}
              value={form.keysText}
              onChange={(event) =>
                setForm({
                  ...form,
                  keysText: event.target.value,
                })
              }
            />
          </label>

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Adding Keys..."
              : "🔑 Add Keys"}
          </button>
        </form>
      </div>

      {/* KEY INVENTORY */}

      <div
        className="panel-card"
        style={{ marginTop: "18px" }}
      >
        <div className="panel-header">
          <div>
            <h2>📦 Key Inventory</h2>
            <p>
              View all uploaded and purchased keys.
            </p>
          </div>

          <input
            type="search"
            placeholder="Search key / product / user..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            style={{ maxWidth: "320px" }}
          />
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading Keys...</h3>
            <p>
              Please wait while keys are loaded.
            </p>
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔑</div>
            <h3>No Keys Found</h3>
            <p>
              Add product keys above to create your inventory.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Product</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>User</th>
                  <th>Expiry</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredKeys.map((item) => {
                  const isExpired =
                    item.expires_at &&
                    new Date(item.expires_at).getTime() <
                      Date.now();

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>
                          {item.key_code}
                        </strong>
                      </td>

                      <td>
                        {item.products?.name || "—"}
                      </td>

                      <td>
                        {item.duration || "—"}
                      </td>

                      <td>
                        {isExpired
                          ? "expired"
                          : item.status || "available"}
                      </td>

                      <td>
                        {item.users?.username
                          ? `@${item.users.username}`
                          : item.users?.telegram_id ||
                            "—"}
                      </td>

                      <td>
                        {item.expires_at
                          ? new Date(
                              item.expires_at
                            ).toLocaleString()
                          : "—"}
                      </td>

                      <td>
                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleString()
                          : "—"}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            deleteKey(item.id)
                          }
                          disabled={
                            deleting === item.id
                          }
                        >
                          {deleting === item.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================
   PREMIUM
========================= */

function Premium() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    duration: "monthly",
    price: "",
  });

  const loadPlans = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("premium_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Premium plans load error:", fetchError);
      setError(fetchError.message);
      setPlans([]);
    } else {
      setPlans(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const addPlan = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Premium plan name is required.");
      return;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid premium plan price.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("premium_plans")
      .insert({
        name: form.name.trim(),
        duration: form.duration,
        price,
        is_active: true,
      });

    if (insertError) {
      console.error("Premium plan insert error:", insertError);
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setForm({ name: "", duration: "monthly", price: "" });
    setShowForm(false);
    await loadPlans();
    setSaving(false);
  };

  const togglePlan = async (plan) => {
    setError("");

    const { error: updateError } = await supabase
      .from("premium_plans")
      .update({ is_active: !plan.is_active })
      .eq("id", plan.id);

    if (updateError) {
      console.error("Premium plan update error:", updateError);
      setError(updateError.message);
      return;
    }

    setPlans((previous) =>
      previous.map((item) =>
        item.id === plan.id
          ? { ...item, is_active: !item.is_active }
          : item
      )
    );
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this premium plan?")) return;

    setError("");

    const { error: deleteError } = await supabase
      .from("premium_plans")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Premium plan delete error:", deleteError);
      setError(deleteError.message);
      return;
    }

    setPlans((previous) => previous.filter((plan) => plan.id !== id));
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Premium</h1>
          <p>Manage premium plans, pricing and active status.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="primary-btn"
            onClick={loadPlans}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <button
            className="primary-btn"
            onClick={() => {
              setShowForm(!showForm);
              setError("");
            }}
          >
            {showForm ? "Close" : "+ Add Premium Plan"}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "rgba(255, 70, 70, 0.10)",
            border: "1px solid rgba(255, 70, 70, 0.30)",
            color: "#ff7777",
          }}
        >
          {error}
        </div>
      )}

      {showForm && (
        <div className="panel-card product-form-card">
          <div className="panel-header">
            <div>
              <h2>Add Premium Plan</h2>
              <p>Create a monthly or yearly premium plan.</p>
            </div>
          </div>

          <form
            className="product-form"
            onSubmit={addPlan}
          >
            <FormInput
              label="Plan Name"
              name="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Example: Premium Monthly"
              required
            />

            <div className="form-group">
              <label>Duration</label>
              <select
                value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <FormInput
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="0"
              required
            />

            <div className="form-full">
              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Premium Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>Premium Plans</h2>
            <p>{plans.length} premium plan(s) added.</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">★</div>
            <h3>Loading Premium Plans...</h3>
            <p>Please wait.</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">★</div>
            <h3>No Premium Plans Yet</h3>
            <p>Add your first premium plan using the button above.</p>
          </div>
        ) : (
          <div className="product-list">
            {plans.map((plan) => (
              <div className="product-row" key={plan.id}>
                <div>
                  <h3>{plan.name}</h3>
                  <p>{plan.duration}</p>
                  <small>
                    Status: {plan.is_active ? "Active" : "Inactive"}
                  </small>
                </div>

                <div className="product-price">
                  <strong>₹{plan.price ?? 0}</strong>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    className="primary-btn"
                    onClick={() => togglePlan(plan)}
                  >
                    {plan.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deletePlan(plan.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

function InventoryItem({
  title,
  value,
  description,
}) {
  return (
    <div className="inventory-item">
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <b>{value}</b>
    </div>
  );
}

function ActivityPanel() {
  return (
    <div className="empty-state small">
      <div className="empty-icon">◷</div>

      <h3>No Recent Activity</h3>

      <p>
        New user, payment and product activity will appear here.
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button>
        Manage →
      </button>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="form-group">
      <label>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function EmptyPaymentState({
  title,
  description,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">₹</div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}export default App;

/* =========================
   RESELLERS MANAGEMENT
========================= */

function Resellers() {
  const emptyForm = {
    name: "",
    username: "",
    phone: "",
    balance: "0",
    total_keys_sold: "0",
    is_active: true,
  };

  const [resellers, setResellers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadResellers = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("resellers")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Resellers load error:", fetchError);
      setError(fetchError.message);
      setResellers([]);
    } else {
      setResellers(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadResellers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Reseller name is required.");
      return;
    }

    setSaving(true);
    setError("");

    const resellerData = {
      name: form.name.trim(),
      username: form.username.trim() || null,
      phone: form.phone.trim() || null,
      balance: Number(form.balance) || 0,
      total_keys_sold: Number(form.total_keys_sold) || 0,
      is_active: form.is_active,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("resellers")
        .update(resellerData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("resellers")
        .insert(resellerData);
    }

    if (result.error) {
      console.error("Reseller save error:", result.error);
      setError(result.error.message);
    } else {
      setForm(emptyForm);
      setEditingId(null);
      await loadResellers();
    }

    setSaving(false);
  };

  const startEdit = (reseller) => {
    setEditingId(reseller.id);

    setForm({
      name: reseller.name || "",
      username: reseller.username || "",
      phone: reseller.phone || "",
      balance: String(reseller.balance ?? 0),
      total_keys_sold: String(reseller.total_keys_sold ?? 0),
      is_active: reseller.is_active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const deleteReseller = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reseller?"
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("resellers")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Reseller delete error:", deleteError);
      setError(deleteError.message);
      return;
    }

    await loadResellers();
  };

  const toggleStatus = async (reseller) => {
    const { error: updateError } = await supabase
      .from("resellers")
      .update({
        is_active: !reseller.is_active,
      })
      .eq("id", reseller.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadResellers();
  };

  const filteredResellers = resellers.filter((reseller) => {
    const text = [
      reseller.name,
      reseller.username,
      reseller.phone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <section className="page">

      <div className="page-heading">
        <div>
          <h1>Resellers Management</h1>
          <p>
            Add, edit and manage your resellers.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadResellers}
          type="button"
        >
          Refresh
        </button>
      </div>

      <div className="panel-card">

        <h2>
          {editingId ? "Edit Reseller" : "Add New Reseller"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div>
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Reseller name"
              />
            </div>

            <div>
              <label>Username</label>
              <input
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
                placeholder="@username"
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone number"
              />
            </div>

            <div>
              <label>Balance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.balance}
                onChange={(e) =>
                  setForm({
                    ...form,
                    balance: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label>Total Keys Sold</label>
              <input
                type="number"
                min="0"
                value={form.total_keys_sold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    total_keys_sold: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label>Status</label>

              <select
                value={form.is_active ? "active" : "inactive"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_active: e.target.value === "active",
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-actions">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Reseller"
                : "Add Reseller"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </div>

      <div className="panel-card">

        <div className="table-header">

          <div>
            <h2>All Resellers</h2>
            <p>
              {filteredResellers.length} reseller(s)
            </p>
          </div>

          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reseller..."
          />

        </div>

        {loading ? (
          <p>Loading resellers...</p>
        ) : filteredResellers.length === 0 ? (
          <p>No resellers found.</p>
        ) : (
          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Keys Sold</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredResellers.map((reseller) => (
                  <tr key={reseller.id}>

                    <td>#{reseller.id}</td>

                    <td>
                      <strong>
                        {reseller.name}
                      </strong>
                    </td>

                    <td>
                      {reseller.username || "-"}
                    </td>

                    <td>
                      {reseller.phone || "-"}
                    </td>

                    <td>
                      ₹{Number(reseller.balance || 0).toFixed(2)}
                    </td>

                    <td>
                      {reseller.total_keys_sold || 0}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="status-btn"
                        onClick={() =>
                          toggleStatus(reseller)
                        }
                      >
                        {reseller.is_active
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() =>
                            startEdit(reseller)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() =>
                            deleteReseller(reseller.id)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </section>
  );
}
