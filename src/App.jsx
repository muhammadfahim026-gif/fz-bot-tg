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
              {activePage === "premium" && "Premium"}
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

        {activePage === "premium" && <Premium />}
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

        <button
          className={activePage === "premium" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("premium")}
        >
          <span>★</span>
          Premium
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
