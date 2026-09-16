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
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Bot Controller</h1>
          <p>
            Manage your Telegram bot configuration from one place.
          </p>
        </div>
      </div>

      <div className="feature-grid">
        <FeatureCard
          icon="⌘"
          title="Bot Commands"
          description="Create and manage bot commands and their responses."
        />

        <FeatureCard
          icon="▣"
          title="Messages"
          description="Edit welcome and other bot messages."
        />

        <FeatureCard
          icon="▦"
          title="Buttons"
          description="Manage inline buttons, links and button positions."
        />

        <FeatureCard
          icon="💳"
          title="Payment Methods"
          description="Configure payment methods and payment information."
        />

        <FeatureCard
          icon="◉"
          title="Support"
          description="Configure your support username and support options."
        />

        <FeatureCard
          icon="▶"
          title="Video / Ads"
          description="Manage promotional content and advertisements."
        />
      </div>

      <div className="panel-card quick-panel">
        <div className="panel-header">
          <div>
            <h2>Quick Controls</h2>
            <p>Basic bot controls</p>
          </div>
        </div>

        <div className="quick-actions">
          <button>＋ Add Command</button>
          <button>＋ Add Button</button>
          <button>✎ Edit Messages</button>
          <button>⚙ Bot Settings</button>
        </div>
      </div>
    </section>
  );
}

/* =========================
   PRODUCTS
========================= */

function Products() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addProduct = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    const newProduct = {
      id: Date.now(),
      ...form,
    };

    setProducts((previous) => [
      ...previous,
      newProduct,
    ]);

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

    setShowForm(false);
  };

  const deleteProduct = (id) => {
    setProducts((previous) =>
      previous.filter((product) => product.id !== id)
    );
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

        <button
          className="primary-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close" : "+ Add Product"}
        </button>
      </div>

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
              >
                Save Product
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

        {products.length === 0 ? (
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
                </div>

                <div className="product-price">
                  <strong>
                    ₹{product.offerPrice || product.price || "0"}
                  </strong>

                  <span>
                    Stock: {product.stock || "0"}
                  </span>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => deleteProduct(product.id)}
                >
                  Delete
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