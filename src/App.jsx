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
              {activePage === "payments" && "Payments & Settings"}
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

        {activePage === "payments" && <Payments />}
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
          className={activePage === "payments" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("payments")}
        >
          <span>₹</span>
          Payments & Settings
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

 const API_BASE = "";
    const configured = import.meta.env.VITE_API_BASE_URL?.trim();
    if (configured) return configured.replace(/\/$/, "");
    const { protocol, hostname, port } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") return `http://${hostname}:3000`;
    const codespacesHost = hostname.replace(/-\d+(?=\.app\.github\.dev$)/, "-3000");
    if (codespacesHost !== hostname) return `${protocol}//${codespacesHost}`;
    if (port === "3000") return `${protocol}//${hostname}`;
    return `${protocol}//${hostname}:3000`;
  });

  const loadConnectedBot = async () => {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        setBot(null);
        setLoading(false);
        return;
      }

      const { data, error: botError } = await supabase
        .from("connected_bots")
        .select("id, user_id, bot_name, bot_username, status, is_active, last_connected_at, last_seen_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (botError) throw botError;
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
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        throw new Error("Admin session expired. Please login again.");
      }

      const response = await fetch(`${API_BASE}/api/bots/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          botUsername: cleanUsername,
          botToken: cleanToken,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Bot connection failed.");
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

  const disconnectBot = async () => {
    const confirmed = window.confirm(
      "Disconnect this Telegram bot? The controller options will be locked again."
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken || !bot?.id) {
        setBot(null);
        return;
      }

      const { error: deleteError } = await supabase
        .from("connected_bots")
        .delete()
        .eq("id", bot.id);

      if (deleteError) throw deleteError;

      setBot(null);
      setSuccess("Telegram bot disconnected.");
    } catch (err) {
      console.error("Bot disconnect error:", err);
      setError(err.message || "Unable to disconnect bot.");
    }
  };

  if (loading) {
    return (
      <section className="page">
        <div className="empty-state">
          <div className="empty-icon">◷</div>
          <h3>Checking Telegram Bot...</h3>
          <p>Please wait while the bot connection is checked.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Bot Controller</h1>
          <p>
            Connect your Telegram bot first. Controller features unlock only after a successful connection.
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

      {!bot ? (
        <div className="panel-card" style={{ textAlign: "center", padding: "42px 24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>🤖</div>
          <h2>Connect Your Telegram Bot</h2>
          <p style={{ maxWidth: "620px", margin: "10px auto 24px", opacity: 0.75 }}>
            To use Bot Controller, connect your Telegram bot with its username and Bot Token. All controller features will remain hidden until the connection is verified.
          </p>

          <button
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
      ) : (
        <>
          <div className="panel-card" style={{ marginBottom: "18px" }}>
            <div className="panel-header">
              <div>
                <h2>✅ Telegram Bot Connected</h2>
                <p>
                  {bot.bot_username ? `@${bot.bot_username.replace(/^@/, "")}` : bot.bot_name || "Telegram Bot"}
                </p>
              </div>

              <button className="delete-btn" onClick={disconnectBot}>
                Disconnect
              </button>
            </div>
          </div>

          <div className="feature-grid">
            <FeatureCard icon="⚙" title="Bot Settings" description="Manage bot name, status and general configuration." />
            <FeatureCard icon="✉" title="Welcome Message" description="Edit the message users see when they start your bot." />
            <FeatureCard icon="⌘" title="Bot Commands" description="Create and manage commands and responses." />
            <FeatureCard icon="▦" title="Buttons" description="Manage buttons, links and their positions." />
            <FeatureCard icon="▤" title="Products" description="Manage products, prices, offers and keys." />
            <FeatureCard icon="★" title="Premium" description="Manage premium plans and subscriptions." />
            <FeatureCard icon="👥" title="Reseller" description="Manage reseller access and sales settings." />
            <FeatureCard icon="▶" title="Start / Stop Bot" description="Control the connected bot service." />
          </div>

          <div className="panel-card quick-panel">
            <div className="panel-header">
              <div>
                <h2>Quick Controls</h2>
                <p>Available because your Telegram bot is connected.</p>
              </div>
            </div>

            <div className="quick-actions">
              <button>＋ Add Command</button>
              <button>＋ Add Button</button>
              <button>✎ Edit Welcome Message</button>
              <button>⚙ Bot Settings</button>
              <button>▶ Start Bot</button>
              <button>■ Stop Bot</button>
            </div>
          </div>

          <BotSettings
            bot={bot}
            onSaved={(updatedBot) => setBot(updatedBot)}
          />
          <BotCommandsManager bot={bot} />
          <BotButtonsManager bot={bot} />
          <BotProductsManager bot={bot} />
          <ProductKeysManager bot={bot} />
          <PremiumManager bot={bot} />
        </>
      )}

      {showConnectForm && !bot && (
        <div className="panel-card" style={{ marginTop: "18px" }}>
          <div className="panel-header">
            <div>
              <h2>Connect Telegram Bot</h2>
              <p>Enter the bot username and Bot Token to verify the connection.</p>
            </div>
          </div>

          <form
            onSubmit={connectBot}
            style={{ display: "grid", gap: "14px", maxWidth: "680px" }}
          >
            <label>
              Bot Username
              <input
                value={botUsername}
                onChange={(e) => setBotUsername(e.target.value)}
                placeholder="@your_bot_username"
                autoComplete="off"
              />
            </label>

            <label>
              Bot Token
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="Enter Telegram Bot Token"
                autoComplete="new-password"
              />
            </label>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="primary-btn" type="submit" disabled={connecting}>
                {connecting ? "Verifying & Connecting..." : "Connect Bot"}
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

            <p style={{ margin: 0, opacity: 0.65, fontSize: "13px" }}>
              Security: the Bot Token is sent directly to the secure backend for verification and should not be stored in browser localStorage.
            </p>
          </form>
        </div>
      )}
    </section>
  );
}

/* =========================
   PRODUCTS
========================= */

function Products() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    stock: "",
    offer: "",
    offerPrice: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      description: "",
      price: "",
      duration: "",
      stock: "",
      offer: "",
      offerPrice: "",
    });
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
      const formattedProducts = (data || []).map((product) => ({
        ...product,
        offerPrice: product.offer_price,
      }));

      setProducts(formattedProducts);
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

  const addProduct = async (e) => {
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
      stock: Number(form.stock) || 0,
      offer: form.offer.trim() || null,
      offer_price:
        form.offerPrice === ""
          ? null
          : Number(form.offerPrice) || 0,
    };

    const { error: insertError } = await supabase
      .from("products")
      .insert(productData);

    if (insertError) {
      console.error("Product insert error:", insertError);
      setError(insertError.message);
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

    if (!confirmed) {
      return;
    }

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

    setDeletingId(null);
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Products</h1>
          <p>
            Add and manage your products, pricing, duration and stock.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="primary-btn"
            onClick={loadProducts}
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
            {showForm ? "Close" : "+ Add Product"}
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
              <h2>Add New Product</h2>
              <p>Enter the product information below.</p>
            </div>
          </div>

          <form
            className="product-form"
            onSubmit={addProduct}
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
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
            />

            <FormInput
              label="Duration"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="Example: 30 Days"
            />

            <FormInput
              label="Stock / Keys"
              name="stock"
              type="number"
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
              value={form.offerPrice}
              onChange={handleChange}
              placeholder="0"
            />

            <div className="form-full">
              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>Product List</h2>
            <p>
              {products.length} product(s) currently added.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <h3>Loading Products...</h3>
            <p>Please wait while products are loaded.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <h3>No Products Yet</h3>
            <p>
              Add your first product using the Add Product button.
            </p>
          </div>
        ) : (
          <div className="product-list">
            {products.map((product) => (
              <div
                className="product-row"
                key={product.id}
              >
                <div>
                  <h3>{product.name}</h3>

                  <p>
                    {product.description || "No description"}
                  </p>

                  <small>
                    {product.category || "No category"} •{" "}
                    {product.duration || "No duration"}
                  </small>

                  {product.offer && (
                    <small style={{ display: "block", marginTop: "5px" }}>
                      Offer: {product.offer}
                    </small>
                  )}
                </div>

                <div className="product-price">
                  <strong>
                    ₹
                    {product.offerPrice ??
                      product.price ??
                      "0"}
                  </strong>

                  {product.offerPrice !== null &&
                    product.offerPrice !== undefined &&
                    product.offerPrice !== "" &&
                    Number(product.offerPrice) <
                      Number(product.price) && (
                      <span
                        style={{
                          textDecoration: "line-through",
                          opacity: 0.6,
                        }}
                      >
                        ₹{product.price}
                      </span>
                    )}

                  <span>
                    Stock: {product.stock ?? "0"}
                  </span>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => deleteProduct(product.id)}
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            ))}
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

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Payments & Settings</h1>
          <p>
            Manage deposits, transactions and payment settings.
          </p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "deposits" ? "tab active" : "tab"}
          onClick={() => setActiveTab("deposits")}
        >
          Deposits
        </button>

        <button
          className={activeTab === "history" ? "tab active" : "tab"}
          onClick={() => setActiveTab("history")}
        >
          Payment History
        </button>

        <button
          className={activeTab === "methods" ? "tab active" : "tab"}
          onClick={() => setActiveTab("methods")}
        >
          Payment Methods
        </button>

        <button
          className={activeTab === "settings" ? "tab active" : "tab"}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      <div className="panel-card">
        {activeTab === "deposits" && (
          <EmptyPaymentState
            title="No Deposits Yet"
            description="Deposit records will appear here once users add funds."
          />
        )}

        {activeTab === "history" && (
          <EmptyPaymentState
            title="No Payment History"
            description="Completed and pending transactions will appear here."
          />
        )}

        {activeTab === "methods" && (
          <EmptyPaymentState
            title="Payment Methods"
            description="Payment method configuration will be connected to Supabase next."
          />
        )}

        {activeTab === "settings" && (
          <EmptyPaymentState
            title="Panel Settings"
            description="Security and panel configuration will be added here."
          />
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


function BotCommandsManager({ bot }) {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [command, setCommand] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const loadCommands = async () => {
    if (!bot) {
      setCommands([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("bot_commands")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setCommands(data || []);
    } catch (err) {
      console.error("Bot commands load error:", err);
      setError(err.message || "Commands load failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommands();
  }, [bot?.id]);

  const resetForm = () => {
    setEditingId(null);
    setCommand("");
    setResponseMessage("");
    setIsActive(true);
  };

  const saveCommand = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let cleanCommand = command.trim();

    if (!cleanCommand) {
      setError("Command is required.");
      return;
    }

    if (!cleanCommand.startsWith("/")) {
      cleanCommand = `/${cleanCommand}`;
    }

    cleanCommand = cleanCommand.split(/\s+/)[0].toLowerCase();

    if (!/^\/[a-z0-9_]{1,31}$/.test(cleanCommand)) {
      setError("Command must use letters, numbers or underscore, e.g. /start");
      return;
    }

    if (!responseMessage.trim()) {
      setError("Response message is required.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from("bot_commands")
          .update({
            command: cleanCommand,
            response_message: responseMessage.trim(),
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (updateError) throw updateError;

        setSuccess("Command updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("bot_commands")
          .insert({
            command: cleanCommand,
            response_message: responseMessage.trim(),
            is_active: isActive,
          });

        if (insertError) throw insertError;

        setSuccess("Command added successfully.");
      }

      resetForm();
      await loadCommands();
    } catch (err) {
      console.error("Bot command save error:", err);

      if (err?.code === "23505") {
        setError("Ye command already exists.");
      } else {
        setError(err.message || "Command save failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  const editCommand = (item) => {
    setEditingId(item.id);
    setCommand(item.command || "");
    setResponseMessage(item.response_message || "");
    setIsActive(item.is_active !== false);
    setError("");
    setSuccess("");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const toggleCommand = async (item) => {
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("bot_commands")
        .update({
          is_active: !item.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateError) throw updateError;

      setSuccess(`${item.command} ${item.is_active ? "disabled" : "enabled"}.`);
      await loadCommands();
    } catch (err) {
      console.error("Command toggle error:", err);
      setError(err.message || "Command status update failed.");
    }
  };

  const deleteCommand = async (item) => {
    const confirmed = window.confirm(`Delete ${item.command}?`);
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const { error: deleteError } = await supabase
        .from("bot_commands")
        .delete()
        .eq("id", item.id);

      if (deleteError) throw deleteError;

      if (editingId === item.id) resetForm();

      setSuccess(`${item.command} deleted successfully.`);
      await loadCommands();
    } catch (err) {
      console.error("Command delete error:", err);
      setError(err.message || "Command delete failed.");
    }
  };

  if (!bot) return null;

  return (
    <div className="panel-card" style={{ marginTop: "18px" }}>
      <div className="panel-header">
        <div>
          <h2>⌘ Bot Commands Manager</h2>
          <p>Create, edit, enable/disable and delete commands for the connected bot.</p>
        </div>
        <button type="button" onClick={loadCommands} disabled={loading}>
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "12px 14px",
          borderRadius: "10px",
          marginBottom: "14px",
          background: "rgba(220, 38, 38, 0.10)",
          color: "#b91c1c"
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: "12px 14px",
          borderRadius: "10px",
          marginBottom: "14px",
          background: "rgba(22, 163, 74, 0.10)",
          color: "#15803d"
        }}>
          {success}
        </div>
      )}

      <form onSubmit={saveCommand} style={{
        display: "grid",
        gap: "14px",
        padding: "16px",
        borderRadius: "14px",
        background: "rgba(127, 127, 127, 0.06)",
        marginBottom: "18px"
      }}>
        <div>
          <strong>{editingId ? "Edit Command" : "Add New Command"}</strong>
          <p style={{ margin: "5px 0 0", opacity: 0.7, fontSize: "13px" }}>
            Example: /start, /help, /support
          </p>
        </div>

        <label>
          Command
          <input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="/start"
            maxLength={32}
            autoComplete="off"
          />
        </label>

        <label>
          Response Message
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder="Write the message that the bot should send..."
            rows={5}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Command Active
        </label>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "＋ Add Command"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} disabled={saving}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div style={{ display: "grid", gap: "10px" }}>
        {loading && commands.length === 0 ? (
          <p>Loading commands...</p>
        ) : commands.length === 0 ? (
          <div style={{
            padding: "24px",
            textAlign: "center",
            border: "1px dashed rgba(127,127,127,.35)",
            borderRadius: "12px"
          }}>
            <strong>No commands yet</strong>
            <p style={{ opacity: 0.7, marginBottom: 0 }}>
              Add your first Telegram bot command above.
            </p>
          </div>
        ) : (
          commands.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid rgba(127,127,127,.18)",
                display: "grid",
                gap: "10px"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                alignItems: "center"
              }}>
                <strong style={{ fontSize: "16px" }}>{item.command}</strong>

                <span style={{
                  padding: "5px 9px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: item.is_active
                    ? "rgba(22,163,74,.12)"
                    : "rgba(127,127,127,.12)",
                  color: item.is_active ? "#15803d" : "inherit"
                }}>
                  {item.is_active ? "● ACTIVE" : "○ OFF"}
                </span>
              </div>

              <div style={{
                whiteSpace: "pre-wrap",
                opacity: 0.78,
                lineHeight: 1.5
              }}>
                {item.response_message}
              </div>

              <div style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap"
              }}>
                <button type="button" onClick={() => editCommand(item)}>
                  ✎ Edit
                </button>
                <button type="button" onClick={() => toggleCommand(item)}>
                  {item.is_active ? "⏸ Disable" : "▶ Enable"}
                </button>
                <button type="button" onClick={() => deleteCommand(item)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <p style={{ marginTop: "16px", fontSize: "12px", opacity: 0.65 }}>
        Note: This manager saves commands in Supabase. The Telegram runtime/webhook
        still needs to be connected on the backend before these saved commands
        automatically reply inside Telegram.
      </p>
    </div>
  );
}


function BotButtonsManager({ bot }) {
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [buttonText, setButtonText] = useState("");
  const [buttonType, setButtonType] = useState("url");
  const [buttonValue, setButtonValue] = useState("");
  const [position, setPosition] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const loadButtons = async () => {
    if (!bot) {
      setButtons([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("bot_buttons")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setButtons(data || []);
    } catch (err) {
      console.error("Bot buttons load error:", err);
      setError(err.message || "Buttons load failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadButtons();
  }, [bot?.id]);

  const resetForm = () => {
    setEditingId(null);
    setButtonText("");
    setButtonType("url");
    setButtonValue("");
    setPosition(buttons.length);
    setIsActive(true);
  };

  const saveButton = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanText = buttonText.trim();
    const cleanValue = buttonValue.trim();
    const cleanPosition = Math.max(0, Number.parseInt(position, 10) || 0);

    if (!cleanText) {
      setError("Button text is required.");
      return;
    }

    if (!cleanValue) {
      setError("Button URL / value is required.");
      return;
    }

    if (buttonType === "url" && !/^https?:\/\//i.test(cleanValue)) {
      setError("URL button ke liye http:// ya https:// URL use karo.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        button_text: cleanText,
        button_type: buttonType,
        button_value: cleanValue,
        position: cleanPosition,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("bot_buttons")
          .update(payload)
          .eq("id", editingId);

        if (updateError) throw updateError;
        setSuccess("Button updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("bot_buttons")
          .insert(payload);

        if (insertError) throw insertError;
        setSuccess("Button added successfully.");
      }

      await loadButtons();
      resetForm();
    } catch (err) {
      console.error("Bot button save error:", err);
      setError(err.message || "Button save failed.");
    } finally {
      setSaving(false);
    }
  };

  const editButton = (item) => {
    setEditingId(item.id);
    setButtonText(item.button_text || "");
    setButtonType(item.button_type || "url");
    setButtonValue(item.button_value || "");
    setPosition(item.position ?? 0);
    setIsActive(item.is_active !== false);
    setError("");
    setSuccess("");
  };

  const toggleButton = async (item) => {
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("bot_buttons")
        .update({
          is_active: !item.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateError) throw updateError;
      setSuccess(`${item.button_text} ${item.is_active ? "disabled" : "enabled"}.`);
      await loadButtons();
    } catch (err) {
      console.error("Button toggle error:", err);
      setError(err.message || "Button status update failed.");
    }
  };

  const deleteButton = async (item) => {
    if (!window.confirm(`Delete button "${item.button_text}"?`)) return;

    setError("");
    setSuccess("");

    try {
      const { error: deleteError } = await supabase
        .from("bot_buttons")
        .delete()
        .eq("id", item.id);

      if (deleteError) throw deleteError;
      if (editingId === item.id) resetForm();
      setSuccess(`${item.button_text} deleted successfully.`);
      await loadButtons();
    } catch (err) {
      console.error("Button delete error:", err);
      setError(err.message || "Button delete failed.");
    }
  };

  if (!bot) return null;

  return (
    <div className="panel-card" style={{ marginTop: "18px" }}>
      <div className="panel-header">
        <div>
          <h2>▦ Bot Buttons Manager</h2>
          <p>Create, edit, reorder and enable/disable buttons for the connected bot.</p>
        </div>
        <button type="button" onClick={loadButtons} disabled={loading}>
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px 14px", borderRadius: "10px", marginBottom: "14px", background: "rgba(220, 38, 38, 0.10)", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: "12px 14px", borderRadius: "10px", marginBottom: "14px", background: "rgba(22, 163, 74, 0.10)", color: "#15803d" }}>
          {success}
        </div>
      )}

      <form onSubmit={saveButton} style={{ display: "grid", gap: "14px", padding: "16px", borderRadius: "14px", background: "rgba(127, 127, 127, 0.06)", marginBottom: "18px" }}>
        <div>
          <strong>{editingId ? "Edit Button" : "Add New Button"}</strong>
          <p style={{ margin: "5px 0 0", opacity: 0.7, fontSize: "13px" }}>
            Example: Main Menu, Support, Website
          </p>
        </div>

        <label>
          Button Text
          <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="💬 Support" maxLength={64} />
        </label>

        <label>
          Button Type
          <select value={buttonType} onChange={(e) => setButtonType(e.target.value)}>
            <option value="url">URL</option>
            <option value="callback">Callback</option>
            <option value="command">Command</option>
          </select>
        </label>

        <label>
          {buttonType === "url" ? "Button URL" : "Button Value"}
          <input value={buttonValue} onChange={(e) => setButtonValue(e.target.value)} placeholder={buttonType === "url" ? "https://example.com" : "/support"} />
        </label>

        <label>
          Position
          <input type="number" min="0" max="999" value={position} onChange={(e) => setPosition(e.target.value)} />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Button Active
        </label>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "＋ Add Button"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} disabled={saving}>Cancel Edit</button>
          )}
        </div>
      </form>

      <div style={{ display: "grid", gap: "10px" }}>
        {loading && buttons.length === 0 ? (
          <p>Loading buttons...</p>
        ) : buttons.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", border: "1px dashed rgba(127,127,127,.35)", borderRadius: "12px" }}>
            <strong>No buttons yet</strong>
            <p style={{ opacity: 0.7, marginBottom: 0 }}>Add your first bot button above.</p>
          </div>
        ) : (
          buttons.map((item) => (
            <div key={item.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(127,127,127,.18)", display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "16px" }}>{item.button_text}</strong>
                  <div style={{ fontSize: "12px", opacity: 0.65, marginTop: "4px" }}>
                    Type: {item.button_type || "url"} · Position: {item.position ?? 0}
                  </div>
                </div>
                <span style={{ padding: "5px 9px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, background: item.is_active ? "rgba(22,163,74,.12)" : "rgba(127,127,127,.12)", color: item.is_active ? "#15803d" : "inherit" }}>
                  {item.is_active ? "● ACTIVE" : "○ OFF"}
                </span>
              </div>

              <div style={{ whiteSpace: "pre-wrap", opacity: 0.78, lineHeight: 1.5, overflowWrap: "anywhere" }}>
                {item.button_value}
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button type="button" onClick={() => editButton(item)}>✎ Edit</button>
                <button type="button" onClick={() => toggleButton(item)}>{item.is_active ? "⏸ Disable" : "▶ Enable"}</button>
                <button type="button" onClick={() => deleteButton(item)}>🗑 Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <p style={{ marginTop: "16px", fontSize: "12px", opacity: 0.65 }}>
        Note: Buttons are saved in Supabase. Telegram runtime wiring is still required before these saved buttons appear automatically inside Telegram.
      </p>
    </div>
  );
}

function BotSettings({ bot, onSaved }) {
  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = async () => {
    if (!bot?.id) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: settingsError } = await supabase
        .from("bot_customizations")
        .select("connected_bot_id, bot_name, bot_description, welcome_message, support_username, menu_button_text, menu_button_url, profile_photo_url, theme_name, is_active")
        .eq("connected_bot_id", bot.id)
        .maybeSingle();
      if (settingsError) throw settingsError;
      if (data) {
        setForm({
          bot_name: data.bot_name ?? bot.bot_name ?? "",
          bot_description: data.bot_description ?? "",
          welcome_message: data.welcome_message ?? "",
          support_username: data.support_username ?? "",
          menu_button_text: data.menu_button_text ?? "",
          menu_button_url: data.menu_button_url ?? "",
          profile_photo_url: data.profile_photo_url ?? "",
          theme_name: data.theme_name ?? "default",
          is_active: data.is_active ?? true,
        });
      } else {
        setForm((previous) => ({ ...previous, bot_name: bot.bot_name ?? previous.bot_name, is_active: bot.is_active ?? true }));
      }
    } catch (err) {
      console.error("Bot settings load error:", err);
      setError(err.message || "Unable to load bot settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, [bot?.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
    setSuccess("");
    setError("");
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    if (!bot?.id) { setError("Connected bot not found."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const payload = {
        connected_bot_id: bot.id,
        bot_name: form.bot_name.trim(),
        bot_description: form.bot_description.trim(),
        welcome_message: form.welcome_message.trim(),
        support_username: form.support_username.trim(),
        menu_button_text: form.menu_button_text.trim(),
        menu_button_url: form.menu_button_url.trim(),
        profile_photo_url: form.profile_photo_url.trim(),
        theme_name: form.theme_name,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      const { data: existing, error: findError } = await supabase
        .from("bot_customizations")
        .select("id")
        .eq("connected_bot_id", bot.id)
        .maybeSingle();
      if (findError) throw findError;

      let savedData;
      if (existing?.id) {
        const { data, error: updateError } = await supabase
          .from("bot_customizations")
          .update(payload)
          .eq("id", existing.id)
          .select("connected_bot_id, bot_name, bot_description, welcome_message, support_username, menu_button_text, menu_button_url, profile_photo_url, theme_name, is_active")
          .single();
        if (updateError) throw updateError;
        savedData = data;
      } else {
        const { data, error: insertError } = await supabase
          .from("bot_customizations")
          .insert(payload)
          .select("connected_bot_id, bot_name, bot_description, welcome_message, support_username, menu_button_text, menu_button_url, profile_photo_url, theme_name, is_active")
          .single();
        if (insertError) throw insertError;
        savedData = data;
      }

      const { error: botUpdateError } = await supabase
        .from("connected_bots")
        .update({ bot_name: form.bot_name.trim() || bot.bot_name, is_active: form.is_active, updated_at: new Date().toISOString() })
        .eq("id", bot.id);
      if (botUpdateError) throw botUpdateError;

      const updatedBot = { ...bot, bot_name: form.bot_name.trim() || bot.bot_name, is_active: form.is_active };
      if (savedData) {
        setForm({
          bot_name: savedData.bot_name ?? updatedBot.bot_name ?? "",
          bot_description: savedData.bot_description ?? "",
          welcome_message: savedData.welcome_message ?? "",
          support_username: savedData.support_username ?? "",
          menu_button_text: savedData.menu_button_text ?? "",
          menu_button_url: savedData.menu_button_url ?? "",
          profile_photo_url: savedData.profile_photo_url ?? "",
          theme_name: savedData.theme_name ?? "default",
          is_active: savedData.is_active ?? true,
        });
      }
      onSaved?.(updatedBot);
      setSuccess("Bot settings saved successfully.");
    } catch (err) {
      console.error("Bot settings save error:", err);
      setError(err.message || "Unable to save bot settings.");
    } finally { setSaving(false); }
  };

  return (
    <div className="panel-card" style={{ marginTop: "18px" }}>
      <div className="panel-header">
        <div><h2>⚙ Bot Settings</h2><p>Manage the connected bot's name, welcome message, support and menu settings.</p></div>
        <button type="button" className="primary-btn" onClick={loadSettings} disabled={loading || saving}>{loading ? "Loading..." : "↻ Refresh"}</button>
      </div>
      {error && <div style={{ marginBottom: "14px", padding: "12px 14px", borderRadius: "10px", background: "rgba(255, 70, 70, 0.10)", border: "1px solid rgba(255, 70, 70, 0.30)", color: "#ff7777" }}>{error}</div>}
      {success && <div style={{ marginBottom: "14px", padding: "12px 14px", borderRadius: "10px", background: "rgba(60, 210, 130, 0.10)", border: "1px solid rgba(60, 210, 130, 0.30)", color: "#63e6a1" }}>{success}</div>}
      {loading ? <p style={{ opacity: 0.7 }}>Loading bot settings...</p> : (
        <form onSubmit={saveSettings} style={{ display: "grid", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            <label>Bot Name<input name="bot_name" value={form.bot_name} onChange={handleChange} placeholder="My Telegram Bot" /></label>
            <label>Support Username<input name="support_username" value={form.support_username} onChange={handleChange} placeholder="@support_username" /></label>
          </div>
          <label>Bot Description<textarea name="bot_description" value={form.bot_description} onChange={handleChange} placeholder="Short description of your bot" rows={3} /></label>
          <label>Welcome Message<textarea name="welcome_message" value={form.welcome_message} onChange={handleChange} placeholder="Welcome message shown when users start the bot" rows={4} /></label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            <label>Menu Button Text<input name="menu_button_text" value={form.menu_button_text} onChange={handleChange} placeholder="Open Support" /></label>
            <label>Menu Button URL<input name="menu_button_url" value={form.menu_button_url} onChange={handleChange} placeholder="https://example.com" /></label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            <label>Profile Photo URL<input name="profile_photo_url" value={form.profile_photo_url} onChange={handleChange} placeholder="https://..." /></label>
            <label>Theme<select name="theme_name" value={form.theme_name} onChange={handleChange}><option value="default">Default</option><option value="dark">Dark</option><option value="light">Light</option><option value="neon">Neon</option></select></label>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}><input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /><span>Bot Active</span></label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}><button className="primary-btn" type="submit" disabled={saving}>{saving ? "Saving..." : "💾 Save Bot Settings"}</button></div>
        </form>
      )}
    </div>
  );
}

function BotProductsManager({ bot }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "0",
    duration: "",
    stock: "0",
    offer: "",
    offer_price: "",
    is_active: true,
  });

  const loadProducts = async () => {
    if (!bot) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      console.error("Bot products load error:", err);
      setError(err.message || "Products load failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [bot?.id]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      category: "",
      price: "0",
      duration: "",
      stock: "0",
      offer: "",
      offer_price: "",
      is_active: true,
    });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccess("");
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Math.max(0, Number.parseInt(form.stock, 10) || 0);
    const offerPrice = form.offer_price.trim() === "" ? null : Number(form.offer_price);

    if (!name) {
      setError("Product name is required.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Valid product price enter karo.");
      return;
    }
    if (offerPrice !== null && (!Number.isFinite(offerPrice) || offerPrice < 0)) {
      setError("Valid offer price enter karo.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        description: form.description.trim(),
        category: form.category.trim(),
        price,
        duration: form.duration.trim(),
        stock,
        offer: form.offer.trim(),
        offer_price: offerPrice,
        is_active: form.is_active,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);
        if (updateError) throw updateError;
        setSuccess("Product updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert(payload);
        if (insertError) throw insertError;
        setSuccess("Product added successfully.");
      }

      await loadProducts();
      resetForm();
    } catch (err) {
      console.error("Product save error:", err);
      setError(err.message || "Product save failed.");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "",
      price: item.price ?? "0",
      duration: item.duration || "",
      stock: item.stock ?? "0",
      offer: item.offer || "",
      offer_price: item.offer_price ?? "",
      is_active: item.is_active !== false,
    });
    setError("");
    setSuccess("");
  };

  const toggleProduct = async (item) => {
    setError("");
    setSuccess("");
    try {
      const { error: updateError } = await supabase
        .from("products")
        .update({ is_active: !item.is_active })
        .eq("id", item.id);
      if (updateError) throw updateError;
      setSuccess(`${item.name} ${item.is_active ? "disabled" : "enabled"}.`);
      await loadProducts();
    } catch (err) {
      console.error("Product toggle error:", err);
      setError(err.message || "Product status update failed.");
    }
  };

  const deleteProduct = async (item) => {
    if (!window.confirm(`Delete product "${item.name}"?`)) return;

    setError("");
    setSuccess("");
    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", item.id);
      if (deleteError) throw deleteError;
      if (editingId === item.id) resetForm();
      setSuccess(`${item.name} deleted successfully.`);
      await loadProducts();
    } catch (err) {
      console.error("Product delete error:", err);
      setError(err.message || "Product delete failed.");
    }
  };

  if (!bot) return null;

  return (
    <div className="panel-card" style={{ marginTop: "18px" }}>
      <div className="panel-header">
        <div>
          <h2>▤ Bot Products Manager</h2>
          <p>Manage products, prices, offers, duration and stock for your connected bot.</p>
        </div>
        <button type="button" className="primary-btn" onClick={loadProducts} disabled={loading || saving}>
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: "14px", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,70,70,.10)", border: "1px solid rgba(255,70,70,.30)", color: "#ff7777" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ marginBottom: "14px", padding: "12px 14px", borderRadius: "10px", background: "rgba(60,210,130,.10)", border: "1px solid rgba(60,210,130,.30)", color: "#63e6a1" }}>
          {success}
        </div>
      )}

      <form onSubmit={saveProduct} style={{ display: "grid", gap: "14px", padding: "16px", borderRadius: "14px", background: "rgba(127,127,127,.06)", marginBottom: "18px" }}>
        <div>
          <strong>{editingId ? "Edit Product" : "Add New Product"}</strong>
          <p style={{ margin: "5px 0 0", opacity: 0.7, fontSize: "13px" }}>
            Product details yahan set karo.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <label>Product Name<input name="name" value={form.name} onChange={handleChange} placeholder="Premium Key" /></label>
          <label>Category<input name="category" value={form.category} onChange={handleChange} placeholder="Premium / Key / Service" /></label>
        </div>

        <label>Description<textarea name="description" value={form.description} onChange={handleChange} placeholder="Product description" rows={3} /></label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          <label>Price<input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} /></label>
          <label>Duration<input name="duration" value={form.duration} onChange={handleChange} placeholder="30 Days" /></label>
          <label>Stock<input type="number" min="0" step="1" name="stock" value={form.stock} onChange={handleChange} /></label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <label>Offer<input name="offer" value={form.offer} onChange={handleChange} placeholder="20% OFF" /></label>
          <label>Offer Price<input type="number" min="0" step="0.01" name="offer_price" value={form.offer_price} onChange={handleChange} placeholder="Optional" /></label>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
          Product Active
        </label>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="primary-btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "💾 Save Changes" : "＋ Add Product"}
          </button>
          {editingId && <button type="button" onClick={resetForm} disabled={saving}>Cancel Edit</button>}
        </div>
      </form>

      <div style={{ display: "grid", gap: "10px" }}>
        {loading && products.length === 0 ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", border: "1px dashed rgba(127,127,127,.35)", borderRadius: "12px" }}>
            <strong>No products yet</strong>
            <p style={{ opacity: 0.7, marginBottom: 0 }}>Add your first product above.</p>
          </div>
        ) : (
          products.map((item) => (
            <div key={item.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(127,127,127,.18)", display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "16px" }}>{item.name}</strong>
                  <div style={{ fontSize: "12px", opacity: 0.65, marginTop: "4px" }}>
                    {item.category || "No category"} · {item.duration || "No duration"} · Stock: {item.stock ?? 0}
                  </div>
                </div>
                <span style={{ padding: "5px 9px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, background: item.is_active ? "rgba(22,163,74,.12)" : "rgba(127,127,127,.12)", color: item.is_active ? "#15803d" : "inherit" }}>
                  {item.is_active ? "● ACTIVE" : "○ OFF"}
                </span>
              </div>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "14px" }}>
                <span>Price: ₹{Number(item.price || 0).toFixed(2)}</span>
                {item.offer_price !== null && item.offer_price !== undefined && <span>Offer: ₹{Number(item.offer_price).toFixed(2)}</span>}
                {item.offer && <span>{item.offer}</span>}
              </div>

              {item.description && <div style={{ whiteSpace: "pre-wrap", opacity: 0.78, lineHeight: 1.5 }}>{item.description}</div>}

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button type="button" onClick={() => editProduct(item)}>✎ Edit</button>
                <button type="button" onClick={() => toggleProduct(item)}>{item.is_active ? "⏸ Disable" : "▶ Enable"}</button>
                <button type="button" onClick={() => deleteProduct(item)}>🗑 Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <p style={{ marginTop: "16px", fontSize: "12px", opacity: 0.65 }}>
        Note: Products are stored in Supabase. Product-key delivery and Telegram purchase flow will be connected to the bot runtime separately.
      </p>
    </div>
  );
}


function ProductKeysManager({ bot }) {
  const [keys, setKeys] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [form, setForm] = useState({ product_id: "", key_code: "", quantity: "1" });

  const loadData = async () => {
    if (!bot) {
      setKeys([]);
      setProducts([]);
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [{ data: keyData, error: keyError }, { data: productData, error: productError }, { data: userData, error: userError }] = await Promise.all([
        supabase.from("product_keys").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id,name").order("name", { ascending: true }),
        supabase.from("users").select("id,telegram_id,username,first_name").order("created_at", { ascending: false }),
      ]);
      if (keyError) throw keyError;
      if (productError) throw productError;
      if (userError) throw userError;
      setKeys(keyData || []);
      setProducts(productData || []);
      setUsers(userData || []);
    } catch (err) {
      console.error("Product keys load error:", err);
      setError(err.message || "Product keys load failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bot?.id]);

  const generateKey = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const part = (length) => Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `FZ-${part(5)}-${part(5)}-${part(5)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const createKeys = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.product_id) {
      setError("Please select a product.");
      return;
    }

    const quantity = Math.min(100, Math.max(1, Number.parseInt(form.quantity, 10) || 1));
    setSaving(true);

    try {
      const manualKey = form.key_code.trim();
      const codes = [];
      if (manualKey) {
        if (quantity !== 1) throw new Error("Manual key ke liye quantity 1 rakho.");
        codes.push(manualKey);
      } else {
        for (let i = 0; i < quantity; i += 1) codes.push(generateKey());
      }

      const rows = codes.map((key_code) => ({
        product_id: Number(form.product_id),
        key_code,
        status: "available",
      }));

      const { data, error: insertError } = await supabase
        .from("product_keys")
        .insert(rows)
        .select("*");

      if (insertError) throw insertError;

      setKeys((prev) => [...(data || []), ...prev]);
      setForm((prev) => ({ ...prev, key_code: "", quantity: "1" }));
      setSuccess(`${data?.length || quantity} product key${quantity > 1 ? "s" : ""} added successfully.`);
    } catch (err) {
      console.error("Product key create error:", err);
      setError(err.message || "Product key create failed.");
    } finally {
      setSaving(false);
    }
  };

  const deleteKey = async (item) => {
    if (!window.confirm(`Delete key ${item.key_code}?`)) return;
    setError("");
    setSuccess("");
    try {
      const { error: deleteError } = await supabase.from("product_keys").delete().eq("id", item.id);
      if (deleteError) throw deleteError;
      setKeys((prev) => prev.filter((key) => key.id !== item.id));
      setSuccess("Key deleted successfully.");
    } catch (err) {
      console.error("Product key delete error:", err);
      setError(err.message || "Key delete failed.");
    }
  };

  const toggleKeyStatus = async (item) => {
    const nextStatus = item.status === "available" ? "disabled" : "available";
    setError("");
    setSuccess("");
    try {
      const { data, error: updateError } = await supabase
        .from("product_keys")
        .update({ status: nextStatus })
        .eq("id", item.id)
        .select("*")
        .single();
      if (updateError) throw updateError;
      setKeys((prev) => prev.map((key) => (key.id === item.id ? data : key)));
      setSuccess(`Key status changed to ${nextStatus}.`);
    } catch (err) {
      console.error("Product key status error:", err);
      setError(err.message || "Key status update failed.");
    }
  };

  const assignKey = async (item) => {
    if (item.status !== "available") {
      setError("Only available keys can be assigned.");
      return;
    }
    const rawUser = window.prompt("User ID enter karo (users table ka numeric ID):");
    if (rawUser === null) return;
    const userId = Number.parseInt(rawUser.trim(), 10);
    if (!Number.isInteger(userId) || userId <= 0) {
      setError("Valid numeric User ID enter karo.");
      return;
    }
    const userExists = users.some((user) => Number(user.id) === userId);
    if (!userExists) {
      setError("Ye User ID users table me nahi mili.");
      return;
    }

    setError("");
    setSuccess("");
    try {
      const { data, error: updateError } = await supabase
        .from("product_keys")
        .update({ assigned_to: userId, status: "assigned", activated_at: new Date().toISOString() })
        .eq("id", item.id)
        .select("*")
        .single();
      if (updateError) throw updateError;
      setKeys((prev) => prev.map((key) => (key.id === item.id ? data : key)));
      setSuccess("Key assigned successfully.");
    } catch (err) {
      console.error("Product key assign error:", err);
      setError(err.message || "Key assignment failed.");
    }
  };

  const getProductName = (productId) => products.find((product) => Number(product.id) === Number(productId))?.name || "Unknown product";
  const getUserLabel = (userId) => {
    const user = users.find((item) => Number(item.id) === Number(userId));
    if (!user) return "—";
    return user.username ? `@${String(user.username).replace(/^@/, "")}` : user.first_name || user.telegram_id || `User #${user.id}`;
  };

  const filteredKeys = keys.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || String(item.key_code || "").toLowerCase().includes(query) || getProductName(item.product_id).toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesProduct = productFilter === "all" || String(item.product_id) === String(productFilter);
    return matchesSearch && matchesStatus && matchesProduct;
  });

  const counts = keys.reduce((acc, item) => {
    acc.total += 1;
    if (item.status === "available") acc.available += 1;
    if (item.status === "assigned") acc.assigned += 1;
    if (item.status === "used") acc.used += 1;
    return acc;
  }, { total: 0, available: 0, assigned: 0, used: 0 });

  return (
    <div className="panel-card" style={{ marginTop: "18px" }}>
      <div className="panel-header">
        <div>
          <h2>🔑 Product Keys Manager</h2>
          <p>Create, assign and manage product keys for your connected bot.</p>
        </div>
        <button type="button" onClick={loadData} disabled={loading}>↻ Refresh</button>
      </div>

      {error && <div style={{ padding: "11px 13px", marginBottom: "12px", borderRadius: "10px", background: "rgba(220,38,38,.10)", color: "#b91c1c" }}>{error}</div>}
      {success && <div style={{ padding: "11px 13px", marginBottom: "12px", borderRadius: "10px", background: "rgba(22,163,74,.10)", color: "#15803d" }}>{success}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "10px", marginBottom: "18px" }}>
        <div style={{ padding: "13px", borderRadius: "12px", background: "rgba(127,127,127,.08)" }}><strong>{counts.total}</strong><div style={{ fontSize: "12px", opacity: .7 }}>Total</div></div>
        <div style={{ padding: "13px", borderRadius: "12px", background: "rgba(22,163,74,.08)" }}><strong>{counts.available}</strong><div style={{ fontSize: "12px", opacity: .7 }}>Available</div></div>
        <div style={{ padding: "13px", borderRadius: "12px", background: "rgba(234,179,8,.10)" }}><strong>{counts.assigned}</strong><div style={{ fontSize: "12px", opacity: .7 }}>Assigned</div></div>
        <div style={{ padding: "13px", borderRadius: "12px", background: "rgba(127,127,127,.08)" }}><strong>{counts.used}</strong><div style={{ fontSize: "12px", opacity: .7 }}>Used</div></div>
      </div>

      <form onSubmit={createKeys} style={{ display: "grid", gap: "12px", padding: "15px", borderRadius: "12px", border: "1px solid rgba(127,127,127,.18)", marginBottom: "18px" }}>
        <strong>＋ Add Product Keys</strong>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "12px" }}>
          <label>Product
            <select name="product_id" value={form.product_id} onChange={handleChange}>
              <option value="">Select product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </label>
          <label>Quantity
            <input type="number" min="1" max="100" name="quantity" value={form.quantity} onChange={handleChange} />
          </label>
        </div>
        <label>Manual Key (optional)
          <input name="key_code" value={form.key_code} onChange={handleChange} placeholder="Blank = auto-generate" />
        </label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="primary-btn" type="submit" disabled={saving || products.length === 0}>{saving ? "Adding..." : "🔑 Add / Generate Keys"}</button>
          <button type="button" onClick={() => setForm((prev) => ({ ...prev, key_code: generateKey(), quantity: "1" }))}>Generate One Key</button>
        </div>
        {products.length === 0 && <small style={{ opacity: .7 }}>Pehle Products Manager me product create karo.</small>}
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "10px", marginBottom: "14px" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search key or product..." />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="used">Used</option>
          <option value="disabled">Disabled</option>
        </select>
        <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
          <option value="all">All products</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>
      </div>

      {loading ? <p>Loading keys...</p> : filteredKeys.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", border: "1px dashed rgba(127,127,127,.35)", borderRadius: "12px" }}>
          <strong>No matching keys</strong>
          <p style={{ opacity: .7, marginBottom: 0 }}>Create product keys above.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {filteredKeys.map((item) => (
            <div key={item.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(127,127,127,.18)", display: "grid", gap: "9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <strong style={{ fontFamily: "monospace", letterSpacing: ".4px", wordBreak: "break-all" }}>{item.key_code}</strong>
                <span style={{ padding: "5px 9px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>{String(item.status || "available").toUpperCase()}</span>
              </div>
              <div style={{ fontSize: "13px", opacity: .72 }}>
                Product: {getProductName(item.product_id)} · Assigned: {getUserLabel(item.assigned_to)}
              </div>
              {item.expires_at && <div style={{ fontSize: "12px", opacity: .65 }}>Expires: {new Date(item.expires_at).toLocaleString()}</div>}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {item.status === "available" && <button type="button" onClick={() => assignKey(item)}>👤 Assign User</button>}
                {(item.status === "available" || item.status === "disabled") && <button type="button" onClick={() => toggleKeyStatus(item)}>{item.status === "available" ? "⏸ Disable" : "▶ Enable"}</button>}
                <button type="button" onClick={() => deleteKey(item)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: "16px", fontSize: "12px", opacity: .65 }}>
        Keys are stored in Supabase <code>product_keys</code>. Status values used here include available, assigned, used and disabled.
      </p>
    </div>
  );
}


function PremiumManager({ bot }) {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", duration: "monthly", price: "", is_active: true });

  const loadData = async () => {
    if (!bot) {
      setPlans([]);
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [{ data: planData, error: planError }, { data: subData, error: subError }] = await Promise.all([
        supabase
          .from("premium_plans")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("premium_subscriptions")
          .select("*, users(id,telegram_id,username,first_name), premium_plans(id,name,duration,price)")
          .order("created_at", { ascending: false }),
      ]);

      if (planError) throw planError;
      if (subError) throw subError;

      setPlans(planData || []);
      setSubscriptions(subData || []);
    } catch (err) {
      console.error("Premium load error:", err);
      setError(err.message || "Unable to load premium data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [bot?.id]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", duration: "monthly", price: "", is_active: true });
  };

  const submitPlan = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const price = Number(form.price);

    if (!name) {
      setError("Plan name is required.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        duration: form.duration,
        price,
        is_active: Boolean(form.is_active),
      };

      if (editingId) {
        const { data, error: updateError } = await supabase
          .from("premium_plans")
          .update(payload)
          .eq("id", editingId)
          .select("*")
          .single();
        if (updateError) throw updateError;
        setPlans((prev) => prev.map((item) => (item.id === editingId ? data : item)));
        setSuccess("Premium plan updated successfully.");
      } else {
        const { data, error: insertError } = await supabase
          .from("premium_plans")
          .insert(payload)
          .select("*")
          .single();
        if (insertError) throw insertError;
        setPlans((prev) => [data, ...prev]);
        setSuccess("Premium plan added successfully.");
      }

      resetForm();
    } catch (err) {
      console.error("Premium plan save error:", err);
      setError(err.message || "Unable to save premium plan.");
    } finally {
      setSaving(false);
    }
  };

  const editPlan = (plan) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name || "",
      duration: plan.duration || "monthly",
      price: String(plan.price ?? ""),
      is_active: plan.is_active !== false,
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const deletePlan = async (plan) => {
    if (!window.confirm(`Delete premium plan "${plan.name}"?`)) return;

    setError("");
    setSuccess("");
    try {
      const { error: deleteError } = await supabase
        .from("premium_plans")
        .delete()
        .eq("id", plan.id);
      if (deleteError) throw deleteError;
      setPlans((prev) => prev.filter((item) => item.id !== plan.id));
      if (editingId === plan.id) resetForm();
      setSuccess("Premium plan deleted successfully.");
    } catch (err) {
      console.error("Premium plan delete error:", err);
      setError(err.message || "Unable to delete premium plan.");
    }
  };

  const togglePlan = async (plan) => {
    setError("");
    setSuccess("");
    try {
      const { data, error: updateError } = await supabase
        .from("premium_plans")
        .update({ is_active: !plan.is_active })
        .eq("id", plan.id)
        .select("*")
        .single();
      if (updateError) throw updateError;
      setPlans((prev) => prev.map((item) => (item.id === plan.id ? data : item)));
      setSuccess(`Plan ${data.is_active ? "activated" : "deactivated"}.`);
    } catch (err) {
      console.error("Premium plan status error:", err);
      setError(err.message || "Unable to change plan status.");
    }
  };

  const updateSubscription = async (subscription, nextStatus) => {
    setError("");
    setSuccess("");
    try {
      const payload = { status: nextStatus };
      if (nextStatus === "active" && !subscription.started_at) {
        payload.started_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from("premium_subscriptions")
        .update(payload)
        .eq("id", subscription.id)
        .select("*, users(id,telegram_id,username,first_name), premium_plans(id,name,duration,price)")
        .single();
      if (updateError) throw updateError;
      setSubscriptions((prev) => prev.map((item) => (item.id === subscription.id ? data : item)));
      setSuccess(`Subscription marked ${nextStatus}.`);
    } catch (err) {
      console.error("Premium subscription update error:", err);
      setError(err.message || "Unable to update subscription.");
    }
  };

  const deleteSubscription = async (subscription) => {
    if (!window.confirm("Delete this premium subscription?")) return;

    setError("");
    setSuccess("");
    try {
      const { error: deleteError } = await supabase
        .from("premium_subscriptions")
        .delete()
        .eq("id", subscription.id);
      if (deleteError) throw deleteError;
      setSubscriptions((prev) => prev.filter((item) => item.id !== subscription.id));
      setSuccess("Premium subscription deleted.");
    } catch (err) {
      console.error("Premium subscription delete error:", err);
      setError(err.message || "Unable to delete subscription.");
    }
  };

  const getUserLabel = (subscription) => {
    const user = subscription.users;
    if (!user) return "Unknown user";
    if (user.username) return `@${String(user.username).replace(/^@/, "")}`;
    if (user.first_name) return user.first_name;
    if (user.telegram_id) return `TG ${user.telegram_id}`;
    return `User #${user.id}`;
  };

  const activePlans = plans.filter((plan) => plan.is_active).length;
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").length;

  return (
    <div className="panel-card" style={{ marginTop: "18px" }}>
      <div className="panel-header">
        <div>
          <h2>★ Premium Manager</h2>
          <p>Manage monthly/yearly premium plans and premium subscribers for this bot.</p>
        </div>
        <button type="button" onClick={loadData} disabled={loading}>↻ Refresh</button>
      </div>

      {error && (
        <div style={{ padding: "11px 13px", marginBottom: "12px", borderRadius: "10px", background: "rgba(220,38,38,.10)", color: "#b91c1c" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "11px 13px", marginBottom: "12px", borderRadius: "10px", background: "rgba(22,163,74,.10)", color: "#15803d" }}>
          {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "10px", marginBottom: "18px" }}>
        <div style={{ padding: "13px", borderRadius: "12px", background: "rgba(127,127,127,.08)" }}><strong>{plans.length}</strong><div style={{ fontSize: "12px", opacity: .7 }}>Total Plans</div></div>
        <div style={{ padding: "13px", borderRadius: "12px", background: "rgba(22,163,74,.08)" }}><strong>{activePlans}</strong><div style={{ fontSize: "12px", opacity: .7 }}>Active Plans</div></div>
        <div style={{ padding: "13px", borderRadius: "12px", background: "rgba(127,127,127,.08)" }}><strong>{subscriptions.length}</strong><div style={{ fontSize: "12px", opacity: .7 }}>Subscribers</div></div>
        <div style={{ padding: "13px", borderRadius: "12px", background: "rgba(234,179,8,.10)" }}><strong>{activeSubscriptions}</strong><div style={{ fontSize: "12px", opacity: .7 }}>Active Premium</div></div>
      </div>

      <form onSubmit={submitPlan} style={{ display: "grid", gap: "12px", padding: "15px", borderRadius: "12px", border: "1px solid rgba(127,127,127,.18)", marginBottom: "18px" }}>
        <strong>{editingId ? "✎ Edit Premium Plan" : "＋ Add Premium Plan"}</strong>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "12px" }}>
          <label>Plan Name
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Monthly Premium" />
          </label>
          <label>Duration
            <select value={form.duration} onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label>Price
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="299" />
          </label>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
          Active plan
        </label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Add Plan"}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel Edit</button>}
        </div>
      </form>

      {loading ? <p>Loading premium data...</p> : (
        <>
          <div style={{ display: "grid", gap: "10px", marginBottom: "24px" }}>
            <h3 style={{ margin: 0 }}>Premium Plans</h3>
            {plans.length === 0 ? (
              <div style={{ padding: "18px", border: "1px dashed rgba(127,127,127,.35)", borderRadius: "12px" }}>No premium plans yet.</div>
            ) : plans.map((plan) => (
              <div key={plan.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(127,127,127,.18)", display: "grid", gap: "9px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <strong>{plan.name}</strong>
                  <span style={{ padding: "5px 9px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>{plan.is_active ? "ACTIVE" : "INACTIVE"}</span>
                </div>
                <div style={{ fontSize: "13px", opacity: .72 }}>
                  Duration: {plan.duration} · Price: ₹{Number(plan.price || 0).toFixed(2)}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => editPlan(plan)}>✎ Edit</button>
                  <button type="button" onClick={() => togglePlan(plan)}>{plan.is_active ? "⏸ Disable" : "▶ Enable"}</button>
                  <button type="button" className="delete-btn" onClick={() => deletePlan(plan)}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            <h3 style={{ margin: 0 }}>Premium Subscribers</h3>
            {subscriptions.length === 0 ? (
              <div style={{ padding: "18px", border: "1px dashed rgba(127,127,127,.35)", borderRadius: "12px" }}>No premium subscriptions yet.</div>
            ) : subscriptions.map((sub) => {
              const plan = sub.premium_plans;
              return (
                <div key={sub.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid rgba(127,127,127,.18)", display: "grid", gap: "9px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    <strong>{getUserLabel(sub)}</strong>
                    <span style={{ padding: "5px 9px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>{String(sub.status || "active").toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: "13px", opacity: .72 }}>
                    Plan: {plan?.name || "Unknown plan"} · ₹{Number(plan?.price || 0).toFixed(2)} · {plan?.duration || "—"}
                  </div>
                  <div style={{ fontSize: "12px", opacity: .65 }}>
                    Started: {sub.started_at ? new Date(sub.started_at).toLocaleString() : "—"} · Expires: {sub.expires_at ? new Date(sub.expires_at).toLocaleString() : "—"}
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {sub.status !== "active" && <button type="button" onClick={() => updateSubscription(sub, "active")}>▶ Activate</button>}
                    {sub.status === "active" && <button type="button" onClick={() => updateSubscription(sub, "expired")}>⏱ Mark Expired</button>}
                    <button type="button" className="delete-btn" onClick={() => deleteSubscription(sub)}>🗑 Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
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
}

export default App;
