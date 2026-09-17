import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

/* =========================================================
   APP
========================================================= */

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
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>
              {activePage === "dashboard" && "Dashboard"}
              {activePage === "bot" && "Bot Controller"}
              {activePage === "products" && "Products"}
              {activePage === "users" && "Users Management"}
              {activePage === "resellers" && "Resellers Management"}
              {activePage === "premium" && "Premium Management"}
              {activePage === "payments" && "Payments & Settings"}
            </h2>
            <p>Welcome back to FZ BOT TG Control Panel</p>
          </div>

          <div className="admin-area">
            <div className="admin-info">
              <strong>Admin / Owner</strong>
              <span>{session.user?.email || "Admin"}</span>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {activePage === "dashboard" && <Dashboard />}
        {activePage === "bot" && <BotController />}
        {activePage === "products" && <Products />}
        {activePage === "users" && <Users />}
        {activePage === "resellers" && <Resellers />}
        {activePage === "premium" && <PremiumManagement />}
        {activePage === "payments" && <Payments />}
      </main>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

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

    if (!loginEmail.trim() || !loginPassword) {
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
        <p className="login-subtitle">CONTROL PANEL</p>

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

          {loginError && <div className="login-error">{loginError}</div>}

          <button type="submit" disabled={loginLoading}>
            {loginLoading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <p className="login-footer">Secure Admin Access</p>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ activePage, setActivePage }) {
  const items = [
    ["dashboard", "▣", "Dashboard"],
    ["bot", "⚙", "Bot Controller"],
    ["users", "👥", "Users"],
    ["products", "▤", "Products"],
    ["resellers", "💼", "Resellers"],
    ["premium", "👑", "Premium"],
    ["payments", "₹", "Payments & Settings"],
  ];

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
        {items.map(([page, icon, title]) => (
          <button
            key={page}
            className={activePage === page ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage(page)}
          >
            <span>{icon}</span>
            {title}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="online-dot"></div>
        <span>System Online</span>
      </div>
    </aside>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    todaySales: 0,
    monthlySales: 0,
    yearlySales: 0,
    keysAvailable: 0,
    keysSold: 0,
    totalDeposits: 0,
    premiumUsers: 0,
    products: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const now = new Date();

      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const [
        usersResult,
        productsResult,
        keysResult,
        ordersResult,
        paymentsResult,
        premiumResult,
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("id", { count: "exact", head: true }),
        supabase.from("product_keys").select("status"),
        supabase.from("orders").select("amount, status, created_at"),
        supabase.from("payments").select("amount, status, created_at"),
        supabase
          .from("premium_subscriptions")
          .select("user_id, status"),
      ]);

      const firstError = [
        usersResult,
        productsResult,
        keysResult,
        ordersResult,
        paymentsResult,
        premiumResult,
      ].find((result) => result.error);

      if (firstError?.error) {
        throw new Error(firstError.error.message);
      }

      const orders = ordersResult.data || [];
      const payments = paymentsResult.data || [];
      const keys = keysResult.data || [];
      const subscriptions = premiumResult.data || [];

      const completedOrders = orders.filter((order) =>
        ["completed", "paid", "success", "successful"].includes(
          String(order.status || "").toLowerCase()
        )
      );

      const amount = (value) => Number(value) || 0;

      const sum = (list) =>
        list.reduce((total, item) => total + amount(item.amount), 0);

      const totalRevenue = sum(completedOrders);

      const todaySales = sum(
        completedOrders.filter(
          (item) =>
            item.created_at &&
            new Date(item.created_at) >= startOfToday
        )
      );

      const monthlySales = sum(
        completedOrders.filter(
          (item) =>
            item.created_at &&
            new Date(item.created_at) >= startOfMonth
        )
      );

      const yearlySales = sum(
        completedOrders.filter(
          (item) =>
            item.created_at &&
            new Date(item.created_at) >= startOfYear
        )
      );

      const keysAvailable = keys.filter(
        (key) => String(key.status).toLowerCase() === "available"
      ).length;

      const keysSold = keys.filter((key) =>
        ["sold", "used", "activated", "assigned"].includes(
          String(key.status).toLowerCase()
        )
      ).length;

      const totalDeposits = sum(
        payments.filter((payment) =>
          ["approved", "completed", "paid", "success", "successful"].includes(
            String(payment.status || "").toLowerCase()
          )
        )
      );

      const premiumUsers = new Set(
        subscriptions
          .filter(
            (item) =>
              String(item.status || "").toLowerCase() === "active"
          )
          .map((item) => item.user_id)
          .filter(Boolean)
      ).size;

      setStats({
        totalRevenue,
        totalUsers: usersResult.count || 0,
        todaySales,
        monthlySales,
        yearlySales,
        keysAvailable,
        keysSold,
        totalDeposits,
        premiumUsers,
        products: productsResult.count || 0,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Monitor users, sales, keys, revenue and activity.</p>
        </div>

        <button
          className="primary-btn"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="stats-grid">
        <StatCard title="Total Revenue" value={loading ? "..." : money(stats.totalRevenue)} icon="₹" />
        <StatCard title="Total Users" value={loading ? "..." : stats.totalUsers} icon="👥" />
        <StatCard title="Today's Sales" value={loading ? "..." : money(stats.todaySales)} icon="▣" />
        <StatCard title="Monthly Sales" value={loading ? "..." : money(stats.monthlySales)} icon="◫" />
        <StatCard title="Yearly Sales" value={loading ? "..." : money(stats.yearlySales)} icon="◷" />
        <StatCard title="Keys Available" value={loading ? "..." : stats.keysAvailable} icon="🔑" />
        <StatCard title="Keys Sold" value={loading ? "..." : stats.keysSold} icon="✓" />
        <StatCard title="Total Deposits" value={loading ? "..." : money(stats.totalDeposits)} icon="＋" />
        <StatCard title="Premium Users" value={loading ? "..." : stats.premiumUsers} icon="★" />
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
              value={loading ? "..." : stats.products}
              description="Products in database"
            />
            <InventoryItem
              title="Available Keys"
              value={loading ? "..." : stats.keysAvailable}
              description="Ready to sell"
            />
            <InventoryItem
              title="Sold Keys"
              value={loading ? "..." : stats.keysSold}
              description="Already sold/used"
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

/* =========================================================
   PRODUCTS
========================================================= */

function Products() {
  const emptyForm = {
    name: "",
    category: "",
    description: "",
    price: "0",
    duration: "",
    stock: "0",
    offer: "",
    offer_price: "",
    is_active: true,
  };

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error(fetchError);
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

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      price: String(product.price ?? 0),
      duration: product.duration || "",
      stock: String(product.stock ?? 0),
      offer: product.offer || "",
      offer_price:
        product.offer_price === null || product.offer_price === undefined
          ? ""
          : String(product.offer_price),
      is_active: Boolean(product.is_active),
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    const offerPrice =
      form.offer_price.trim() === "" ? null : Number(form.offer_price);

    if (!name) {
      setError("Product name is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a valid number.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number.");
      return;
    }

    if (
      offerPrice !== null &&
      (!Number.isFinite(offerPrice) || offerPrice < 0)
    ) {
      setError("Offer price must be a valid number.");
      return;
    }

    if (offerPrice !== null && offerPrice > price) {
      setError("Offer price should not be greater than the normal price.");
      return;
    }

    const payload = {
      name,
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      price,
      duration: form.duration.trim() || null,
      stock,
      offer: form.offer.trim() || null,
      offer_price: offerPrice,
      is_active: Boolean(form.is_active),
    };

    setSaving(true);

    let result;

    if (editingId) {
      result = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
    } else {
      result = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      console.error(result.error);
      setError(result.error.message);
      setSaving(false);
      return;
    }

    if (editingId) {
      setProducts((prev) =>
        prev.map((item) => (item.id === editingId ? result.data : item))
      );
    } else {
      setProducts((prev) => [result.data, ...prev]);
    }

    setSaving(false);
    closeForm();
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete product "${product.name}"?`)) return;

    setDeletingId(product.id);
    setError("");

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      console.error(deleteError);
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    setProducts((prev) =>
      prev.filter((item) => item.id !== product.id)
    );

    setDeletingId(null);
  };

  const toggleProduct = async (product) => {
    setError("");

    const { data, error: updateError } = await supabase
      .from("products")
      .update({
        is_active: !product.is_active,
      })
      .eq("id", product.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setProducts((prev) =>
      prev.map((item) => (item.id === product.id ? data : item))
    );
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return products;

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.description,
        product.duration,
        product.offer,
        String(product.id),
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(q)
      )
    );
  }, [products, search]);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Products Management</h1>
          <p>Manage products, prices, offers, duration and stock.</p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-btn"
            onClick={loadProducts}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <button className="primary-btn" onClick={openAdd}>
            ＋ Add Product
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {showForm && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
              <p>
                {editingId
                  ? "Update the selected product."
                  : "Create a new product."}
              </p>
            </div>

            <button className="secondary-btn" onClick={closeForm}>
              Close
            </button>
          </div>

          <form onSubmit={saveProduct}>
            <div className="form-grid">
              <label className="form-group">
                <span>Product Name *</span>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Example: Premium Key"
                  required
                />
              </label>

              <label className="form-group">
                <span>Category</span>
                <input
                  value={form.category}
                  onChange={(e) =>
                    updateForm("category", e.target.value)
                  }
                  placeholder="Example: Premium"
                />
              </label>

              <label className="form-group">
                <span>Price *</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  required
                />
              </label>

              <label className="form-group">
                <span>Duration</span>
                <input
                  value={form.duration}
                  onChange={(e) =>
                    updateForm("duration", e.target.value)
                  }
                  placeholder="7 Days / 30 Days"
                />
              </label>

              <label className="form-group">
                <span>Stock / Keys</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => updateForm("stock", e.target.value)}
                />
              </label>

              <label className="form-group">
                <span>Offer</span>
                <input
                  value={form.offer}
                  onChange={(e) => updateForm("offer", e.target.value)}
                  placeholder="20% OFF"
                />
              </label>

              <label className="form-group">
                <span>Offer Price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.offer_price}
                  onChange={(e) =>
                    updateForm("offer_price", e.target.value)
                  }
                  placeholder="Optional"
                />
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    updateForm("is_active", e.target.checked)
                  }
                />
                <span>Product Active</span>
              </label>

              <label className="form-group form-full">
                <span>Description</span>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                  placeholder="Product description..."
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>All Products</h2>
            <p>
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{ maxWidth: "350px" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="panel-card">
          <div className="empty-state">Loading products...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="panel-card">
          <div className="empty-state">
            <div className="empty-icon">▤</div>
            <h3>No Products Found</h3>
            <p>Click Add Product to create your first product.</p>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div className="panel-card product-card" key={product.id}>
              <div className="product-card-top">
                <div>
                  <h2>{product.name}</h2>

                  {product.category && (
                    <span className="muted-text">
                      {product.category}
                    </span>
                  )}
                </div>

                <span
                  className={
                    product.is_active
                      ? "status-badge active"
                      : "status-badge inactive"
                  }
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {product.description && (
                <p className="product-description">
                  {product.description}
                </p>
              )}

              <div className="product-info-grid">
                <div>
                  <small>Price</small>
                  <strong>₹{Number(product.price || 0).toFixed(2)}</strong>
                </div>

                <div>
                  <small>Duration</small>
                  <strong>{product.duration || "—"}</strong>
                </div>

                <div>
                  <small>Stock</small>
                  <strong>{product.stock ?? 0}</strong>
                </div>

                <div>
                  <small>Offer</small>
                  <strong>{product.offer || "—"}</strong>
                </div>
              </div>

              {product.offer_price !== null &&
                product.offer_price !== undefined && (
                  <div className="offer-box">
                    Offer Price:{" "}
                    <strong>
                      ₹{Number(product.offer_price).toFixed(2)}
                    </strong>
                  </div>
                )}

              <div className="table-actions">
                <button
                  className="secondary-btn"
                  onClick={() => openEdit(product)}
                >
                  Edit
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => toggleProduct(product)}
                >
                  {product.is_active ? "Disable" : "Enable"}
                </button>

                <button
                  className="danger-btn"
                  onClick={() => deleteProduct(product)}
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   USERS
========================================================= */

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editBalance, setEditBalance] = useState("");
  const [editPremium, setEditPremium] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setUsers([]);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEdit = (user) => {
    setEditingUser(user);
    setEditBalance(String(user.balance ?? 0));
    setEditPremium(Boolean(user.is_premium));
    setError("");
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditBalance("");
    setEditPremium(false);
  };

  const saveUser = async () => {
    if (!editingUser) return;

    const balance = Number(editBalance);

    if (!Number.isFinite(balance) || balance < 0) {
      setError("Balance must be a valid number.");
      return;
    }

    setSavingId(editingUser.id);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        balance,
        is_premium: editPremium,
      })
      .eq("id", editingUser.id);

    if (updateError) {
      setError(updateError.message);
      setSavingId(null);
      return;
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              balance,
              is_premium: editPremium,
            }
          : user
      )
    );

    setSavingId(null);
    closeEdit();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setDeletingId(id);

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    setUsers((prev) => prev.filter((user) => user.id !== id));
    setDeletingId(null);
  };

  const q = search.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!q) return true;

    return [
      user.telegram_id,
      user.username,
      user.first_name,
      String(user.id),
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Users Management</h1>
          <p>View and manage Telegram users.</p>
        </div>

        <button
          className="primary-btn"
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      {editingUser && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>Edit User</h2>
              <p>
                {editingUser.first_name || "User"}{" "}
                {editingUser.username
                  ? `(@${editingUser.username})`
                  : ""}
              </p>
            </div>

            <button className="secondary-btn" onClick={closeEdit}>
              Close
            </button>
          </div>

          <div className="form-grid">
            <label className="form-group">
              <span>Telegram ID</span>
              <input
                value={editingUser.telegram_id || ""}
                disabled
              />
            </label>

            <label className="form-group">
              <span>Balance</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
              />
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={editPremium}
                onChange={(e) => setEditPremium(e.target.checked)}
              />
              <span>Premium User</span>
            </label>
          </div>

          <div className="form-actions">
            <button className="secondary-btn" onClick={closeEdit}>
              Cancel
            </button>

            <button
              className="primary-btn"
              onClick={saveUser}
              disabled={savingId === editingUser.id}
            >
              {savingId === editingUser.id
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>All Users</h2>
            <p>
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Telegram ID, username..."
            style={{ maxWidth: "400px" }}
          />
        </div>
      </div>

      <div className="panel-card" style={{ overflowX: "auto" }}>
        {loading ? (
          <div className="empty-state">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>No users found</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Telegram ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Balance</th>
                <th>Premium</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.telegram_id || "—"}</td>
                  <td>
                    {user.username ? `@${user.username}` : "—"}
                  </td>
                  <td>{user.first_name || "—"}</td>
                  <td>
                    ₹{Number(user.balance || 0).toFixed(2)}
                  </td>
                  <td>{user.is_premium ? "⭐ Yes" : "No"}</td>
                  <td>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="secondary-btn small-btn"
                        onClick={() => openEdit(user)}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-btn small-btn"
                        onClick={() => deleteUser(user.id)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   RESELLERS
========================================================= */

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadResellers = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("resellers")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
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

  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  };

  const openEdit = (reseller) => {
    setEditingId(reseller.id);

    setForm({
      name: reseller.name || "",
      username: reseller.username || "",
      phone: reseller.phone || "",
      balance: String(reseller.balance ?? 0),
      total_keys_sold: String(reseller.total_keys_sold ?? 0),
      is_active: Boolean(reseller.is_active),
    });

    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveReseller = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const username = form.username.trim().replace(/^@/, "");
    const phone = form.phone.trim();
    const balance = Number(form.balance);
    const totalKeys = Number(form.total_keys_sold);

    if (!name) {
      setError("Reseller name is required.");
      return;
    }

    if (!Number.isFinite(balance) || balance < 0) {
      setError("Balance is invalid.");
      return;
    }

    if (!Number.isInteger(totalKeys) || totalKeys < 0) {
      setError("Total keys sold must be a whole number.");
      return;
    }

    const payload = {
      name,
      username: username || null,
      phone: phone || null,
      balance,
      total_keys_sold: totalKeys,
      is_active: Boolean(form.is_active),
    };

    setSaving(true);

    let result;

    if (editingId) {
      result = await supabase
        .from("resellers")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
    } else {
      result = await supabase
        .from("resellers")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    if (editingId) {
      setResellers((prev) =>
        prev.map((item) =>
          item.id === editingId ? result.data : item
        )
      );
    } else {
      setResellers((prev) => [result.data, ...prev]);
    }

    setSaving(false);
    closeForm();
  };

  const deleteReseller = async (id) => {
    if (!window.confirm("Delete this reseller?")) return;

    setDeletingId(id);

    const { error: deleteError } = await supabase
      .from("resellers")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    setResellers((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setDeletingId(null);
  };

  const q = search.trim().toLowerCase();

  const filtered = resellers.filter((item) => {
    if (!q) return true;

    return [
      item.name,
      item.username,
      item.phone,
      String(item.id),
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Resellers Management</h1>
          <p>Manage reseller accounts and key sales.</p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-btn"
            onClick={loadResellers}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <button className="primary-btn" onClick={openAdd}>
            ＋ Add Reseller
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      {showForm && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>{editingId ? "Edit Reseller" : "Add Reseller"}</h2>
              <p>Manage reseller information.</p>
            </div>

            <button className="secondary-btn" onClick={closeForm}>
              Close
            </button>
          </div>

          <form onSubmit={saveReseller}>
            <div className="form-grid">
              <label className="form-group">
                <span>Name *</span>
                <input
                  value={form.name}
                  onChange={(e) =>
                    updateForm("name", e.target.value)
                  }
                  required
                />
              </label>

              <label className="form-group">
                <span>Username</span>
                <input
                  value={form.username}
                  onChange={(e) =>
                    updateForm("username", e.target.value)
                  }
                  placeholder="@username"
                />
              </label>

              <label className="form-group">
                <span>Phone</span>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    updateForm("phone", e.target.value)
                  }
                />
              </label>

              <label className="form-group">
                <span>Balance</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.balance}
                  onChange={(e) =>
                    updateForm("balance", e.target.value)
                  }
                />
              </label>

              <label className="form-group">
                <span>Total Keys Sold</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.total_keys_sold}
                  onChange={(e) =>
                    updateForm("total_keys_sold", e.target.value)
                  }
                />
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    updateForm("is_active", e.target.checked)
                  }
                />
                <span>Active Reseller</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

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
            </div>
          </form>
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>All Resellers</h2>
            <p>
              Showing {filtered.length} of {resellers.length}
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reseller..."
            style={{ maxWidth: "350px" }}
          />
        </div>
      </div>

      <div className="panel-card" style={{ overflowX: "auto" }}>
        {loading ? (
          <div className="empty-state">Loading resellers...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No resellers found</h3>
          </div>
        ) : (
          <table className="data-table">
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
              {filtered.map((reseller) => (
                <tr key={reseller.id}>
                  <td>{reseller.id}</td>
                  <td>{reseller.name}</td>
                  <td>
                    {reseller.username
                      ? `@${reseller.username}`
                      : "—"}
                  </td>
                  <td>{reseller.phone || "—"}</td>
                  <td>
                    ₹{Number(reseller.balance || 0).toFixed(2)}
                  </td>
                  <td>{reseller.total_keys_sold || 0}</td>
                  <td>
                    {reseller.is_active
                      ? "🟢 Active"
                      : "🔴 Inactive"}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="secondary-btn small-btn"
                        onClick={() => openEdit(reseller)}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-btn small-btn"
                        onClick={() =>
                          deleteReseller(reseller.id)
                        }
                        disabled={deletingId === reseller.id}
                      >
                        {deletingId === reseller.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   BOT CONTROLLER
========================================================= */

function getBackendBaseUrl() {
  const configured = import.meta.env.VITE_BACKEND_URL;

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const hostname = window.location.hostname;

  // GitHub Codespaces:
  // xxxx-5173.app.github.dev -> xxxx-3000.app.github.dev
  if (hostname.includes("-5173.") && hostname.includes("app.github.dev")) {
    return `${window.location.protocol}//${hostname.replace(
      "-5173.",
      "-3000."
    )}`;
  }

  // Local development
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return `${window.location.protocol}//${hostname}:3000`;
  }

  return "";
}

function BotController() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);

  const [form, setForm] = useState({
    botToken: "",
  });

  const loadBots = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("connected_bots")
      .select(
        "id, user_id, bot_name, bot_username, status, is_active, last_connected_at, last_seen_at, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error(fetchError);
      setError(fetchError.message);
      setBots([]);
    } else {
      setBots(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBots();
  }, []);

  const connectBot = async (e) => {
    e.preventDefault();
    setError("");

    const botToken = form.botToken.trim();

    if (!botToken) {
      setError("Bot Token is required.");
      return;
    }

    setConnecting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Admin session expired. Please login again."
        );
      }

      const backend = getBackendBaseUrl();

      const endpoint = backend
        ? `${backend}/api/bots/connect`
        : "/api/bots/connect";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          botToken,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to connect bot."
        );
      }

      setForm({ botToken: "" });
      setShowForm(false);

      await loadBots();

      alert(
        `Bot connected successfully: @${result.bot?.username || "unknown"}`
      );
    } catch (err) {
      console.error("Bot connection error:", err);

      if (
        String(err.message || "").includes("Failed to fetch")
      ) {
        setError(
          "Backend server se connection nahi ho raha. Port 3000 running hai ya nahi check karo."
        );
      } else {
        setError(err.message || "Bot connection failed.");
      }
    } finally {
      setConnecting(false);
    }
  };

  const deleteBot = async (id) => {
    if (!window.confirm("Delete this connected bot?")) return;

    setDeletingId(id);
    setError("");

    const { error: deleteError } = await supabase
      .from("connected_bots")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setBots((prev) =>
        prev.filter((bot) => bot.id !== id)
      );

      if (selectedBot?.id === id) {
        setSelectedBot(null);
      }
    }

    setDeletingId(null);
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Bot Controller</h1>
          <p>
            Connect Telegram bots and customize each bot separately.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-btn"
            onClick={loadBots}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>

          <button
            className="primary-btn"
            onClick={() => {
              setShowForm((value) => !value);
              setError("");
            }}
          >
            {showForm ? "Close" : "＋ Connect Bot"}
          </button>
        </div>
      </div>

      <div className="info-banner">
        <strong>Secure connection:</strong> Bot Token backend ko
        verification ke liye bheja jayega. Token frontend mein
        permanently store nahi kiya jaata.
      </div>

      {error && <ErrorBox message={error} />}

      {showForm && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>Connect Telegram Bot</h2>
              <p>
                Telegram @BotFather se Bot Token lekar yahan paste
                karo.
              </p>
            </div>
          </div>

          <form className="form-grid" onSubmit={connectBot}>
            <label className="form-group form-full">
              <span>Bot Token *</span>

              <input
                type="password"
                value={form.botToken}
                onChange={(e) => {
                  setForm({
                    botToken: e.target.value,
                  });
                  setError("");
                }}
                placeholder="123456789:AA..."
                autoComplete="off"
                required
              />

              <small>
                Bot Token ko kisi ke saath share mat karo.
              </small>
            </label>

            <div className="form-actions form-full">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setForm({ botToken: "" });
                  setError("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={connecting}
              >
                {connecting
                  ? "Verifying & Connecting..."
                  : "Connect Bot"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="feature-grid">
        <FeatureCard
          icon="🎨"
          title="Per-Bot Customization"
          description="Customize selected bot separately."
          onClick={() => {
            if (bots.length > 0) {
              setSelectedBot(bots[0]);
            } else {
              setError("Pehle ek bot connect karo.");
            }
          }}
        />

        <FeatureCard
          icon="⌘"
          title="Commands"
          description="Configure bot commands and responses."
          onClick={() => {
            if (bots.length > 0) {
              setSelectedBot(bots[0]);
            } else {
              setError("Pehle ek bot connect karo.");
            }
          }}
        />

        <FeatureCard
          icon="▦"
          title="Buttons"
          description="Configure custom buttons and links."
          onClick={() => {
            if (bots.length > 0) {
              setSelectedBot(bots[0]);
            } else {
              setError("Pehle ek bot connect karo.");
            }
          }}
        />

        <FeatureCard
          icon="💳"
          title="Payments"
          description="Payment configuration is available in Payments."
          onClick={() => {
            alert(
              "Payment configuration Payments & Settings page mein available hai."
            );
          }}
        />

        <FeatureCard
          icon="◉"
          title="Support"
          description="Set support information for a bot."
          onClick={() => {
            if (bots.length > 0) {
              setSelectedBot(bots[0]);
            } else {
              setError("Pehle ek bot connect karo.");
            }
          }}
        />

        <FeatureCard
          icon="▶"
          title="24/7 Runner"
          description="Connected bots can be kept running after backend deployment."
          onClick={() => {
            alert(
              "24/7 bot running ke liye backend ko 24/7 hosting par deploy karna hoga."
            );
          }}
        />
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>Connected Bots</h2>
            <p>
              {bots.length} bot record
              {bots.length === 1 ? "" : "s"} in the system
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading connected bots...
          </div>
        ) : bots.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚙</div>
            <h3>No connected bots</h3>
            <p>
              Connect Bot button se customer Telegram bot add karo.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bot</th>
                  <th>Customer ID</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th>Last Connected</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {bots.map((bot) => (
                  <tr key={bot.id}>
                    <td>
                      <strong>
                        {bot.bot_name || "Telegram Bot"}
                      </strong>

                      <div className="muted-text">
                        {bot.bot_username
                          ? `@${String(
                              bot.bot_username
                            ).replace(/^@/, "")}`
                          : "No username"}
                      </div>
                    </td>

                    <td>{bot.user_id || "—"}</td>

                    <td>
                      <span
                        className={`status-badge ${String(
                          bot.status || "disconnected"
                        ).toLowerCase()}`}
                      >
                        {bot.status || "disconnected"}
                      </span>
                    </td>

                    <td>{bot.is_active ? "Yes" : "No"}</td>

                    <td>
                      {bot.last_connected_at
                        ? new Date(
                            bot.last_connected_at
                          ).toLocaleString()
                        : "—"}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="secondary-btn small-btn"
                          onClick={() =>
                            setSelectedBot(bot)
                          }
                        >
                          Customize
                        </button>

                        <button
                          className="danger-btn small-btn"
                          onClick={() =>
                            deleteBot(bot.id)
                          }
                          disabled={
                            deletingId === bot.id
                          }
                        >
                          {deletingId === bot.id
                            ? "Deleting..."
                            : "Delete"}
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

      {selectedBot && (
        <BotCustomization
          bot={selectedBot}
          onClose={() => setSelectedBot(null)}
        />
      )}
    </section>
  );
}

/* =========================================================
   BOT CUSTOMIZATION
========================================================= */

function BotCustomization({ bot, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("general");

  const [form, setForm] = useState({
    bot_name: bot.bot_name || "",
    bot_description: "",
    welcome_message: "",
    support_username: "",
    menu_button_text: "",
    menu_button_url: "",
    profile_photo_url: "",
    theme_name: "default",
    is_active: true,
  });

  const [commands, setCommands] = useState([]);
  const [buttons, setButtons] = useState([]);

  const [newCommand, setNewCommand] = useState("");
  const [newResponse, setNewResponse] = useState("");

  const [newButtonText, setNewButtonText] = useState("");
  const [newButtonType, setNewButtonType] = useState("url");
  const [newButtonValue, setNewButtonValue] = useState("");

  const loadCustomization = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: loadError } = await supabase
        .from("bot_customizations")
        .select("*")
        .eq("connected_bot_id", bot.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (loadError) throw loadError;

      if (data?.[0]) {
        const item = data[0];

        setForm({
          bot_name: item.bot_name ?? bot.bot_name ?? "",
          bot_description: item.bot_description ?? "",
          welcome_message: item.welcome_message ?? "",
          support_username: item.support_username ?? "",
          menu_button_text: item.menu_button_text ?? "",
          menu_button_url: item.menu_button_url ?? "",
          profile_photo_url: item.profile_photo_url ?? "",
          theme_name: item.theme_name ?? "default",
          is_active: Boolean(item.is_active),
        });
      }

      const [commandsResult, buttonsResult] =
        await Promise.all([
          supabase
            .from("bot_commands")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),
          supabase
            .from("bot_buttons")
            .select("*")
            .order("position", {
              ascending: true,
            }),
        ]);

      if (commandsResult.error) {
        console.error(commandsResult.error);
      } else {
        setCommands(commandsResult.data || []);
      }

      if (buttonsResult.error) {
        console.error(buttonsResult.error);
      } else {
        setButtons(buttonsResult.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load customization.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomization();
  }, [bot.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const saveCustomization = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const { data: existing, error: findError } =
        await supabase
          .from("bot_customizations")
          .select("id")
          .eq("connected_bot_id", bot.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(1);

      if (findError) throw findError;

      const payload = {
        connected_bot_id: bot.id,
        bot_name:
          form.bot_name.trim() ||
          bot.bot_name ||
          null,
        bot_description:
          form.bot_description.trim() || null,
        welcome_message:
          form.welcome_message || null,
        support_username:
          form.support_username.trim() || null,
        menu_button_text:
          form.menu_button_text.trim() || null,
        menu_button_url:
          form.menu_button_url.trim() || null,
        profile_photo_url:
          form.profile_photo_url.trim() || null,
        theme_name:
          form.theme_name || "default",
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (existing?.[0]?.id) {
        result = await supabase
          .from("bot_customizations")
          .update(payload)
          .eq("id", existing[0].id);
      } else {
        result = await supabase
          .from("bot_customizations")
          .insert(payload);
      }

      if (result.error) throw result.error;

      await supabase
        .from("connected_bots")
        .update({
          bot_name:
            form.bot_name.trim() ||
            bot.bot_name ||
            "Telegram Bot",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bot.id);

      alert("Bot customization saved successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to save customization."
      );
    } finally {
      setSaving(false);
    }
  };

  const addCommand = async () => {
    const command = newCommand.trim();
    const response = newResponse.trim();

    if (!command) {
      setError("Command is required.");
      return;
    }

    const cleanCommand = command.startsWith("/")
      ? command
      : `/${command}`;

    const { data, error: insertError } = await supabase
      .from("bot_commands")
      .insert({
        command: cleanCommand,
        response_message: response || null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setCommands((prev) => [data, ...prev]);
    setNewCommand("");
    setNewResponse("");
    setError("");
  };

  const deleteCommand = async (id) => {
    if (!window.confirm("Delete this command?")) return;

    const { error: deleteError } = await supabase
      .from("bot_commands")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setCommands((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const toggleCommand = async (item) => {
    const { data, error: updateError } = await supabase
      .from("bot_commands")
      .update({
        is_active: !item.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCommands((prev) =>
      prev.map((row) =>
        row.id === item.id ? data : row
      )
    );
  };

  const addButton = async () => {
    if (!newButtonText.trim()) {
      setError("Button text is required.");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("bot_buttons")
      .insert({
        button_text: newButtonText.trim(),
        button_type: newButtonType,
        button_value: newButtonValue.trim() || null,
        position: buttons.length,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setButtons((prev) => [...prev, data]);
    setNewButtonText("");
    setNewButtonValue("");
    setError("");
  };

  const deleteButton = async (id) => {
    if (!window.confirm("Delete this button?")) return;

    const { error: deleteError } = await supabase
      .from("bot_buttons")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setButtons((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const toggleButton = async (item) => {
    const { data, error: updateError } = await supabase
      .from("bot_buttons")
      .update({
        is_active: !item.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setButtons((prev) =>
      prev.map((row) =>
        row.id === item.id ? data : row
      )
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Customize Bot</h2>
            <p>
              {bot.bot_username
                ? `@${String(
                    bot.bot_username
                  ).replace(/^@/, "")}`
                : bot.bot_name}
            </p>
          </div>

          <button
            className="secondary-btn small-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="tabs">
          <button
            className={
              activeTab === "general"
                ? "tab active"
                : "tab"
            }
            onClick={() => setActiveTab("general")}
          >
            General
          </button>

          <button
            className={
              activeTab === "commands"
                ? "tab active"
                : "tab"
            }
            onClick={() => setActiveTab("commands")}
          >
            Commands
          </button>

          <button
            className={
              activeTab === "buttons"
                ? "tab active"
                : "tab"
            }
            onClick={() => setActiveTab("buttons")}
          >
            Buttons
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading customization...
          </div>
        ) : (
          <>
            {error && <ErrorBox message={error} />}

            {activeTab === "general" && (
              <form
                className="form-grid"
                onSubmit={saveCustomization}
              >
                <label className="form-group">
                  <span>Bot Display Name</span>
                  <input
                    name="bot_name"
                    value={form.bot_name}
                    onChange={handleChange}
                  />
                </label>

                <label className="form-group">
                  <span>Theme</span>

                  <select
                    name="theme_name"
                    value={form.theme_name}
                    onChange={handleChange}
                  >
                    <option value="default">
                      Default
                    </option>
                    <option value="modern">
                      Modern
                    </option>
                    <option value="minimal">
                      Minimal
                    </option>
                    <option value="gaming">
                      Gaming
                    </option>
                  </select>
                </label>

                <label className="form-group form-full">
                  <span>Bot Description</span>
                  <input
                    name="bot_description"
                    value={form.bot_description}
                    onChange={handleChange}
                  />
                </label>

                <label className="form-group form-full">
                  <span>Welcome Message</span>

                  <textarea
                    name="welcome_message"
                    rows="5"
                    value={form.welcome_message}
                    onChange={handleChange}
                    placeholder="Welcome message..."
                  />
                </label>

                <label className="form-group">
                  <span>Support Username</span>

                  <input
                    name="support_username"
                    value={form.support_username}
                    onChange={handleChange}
                    placeholder="@support"
                  />
                </label>

                <label className="form-group">
                  <span>Menu Button Text</span>

                  <input
                    name="menu_button_text"
                    value={form.menu_button_text}
                    onChange={handleChange}
                    placeholder="Open Website"
                  />
                </label>

                <label className="form-group form-full">
                  <span>Menu Button URL</span>

                  <input
                    type="url"
                    name="menu_button_url"
                    value={form.menu_button_url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </label>

                <label className="form-group form-full">
                  <span>Profile Photo URL</span>

                  <input
                    type="url"
                    name="profile_photo_url"
                    value={form.profile_photo_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </label>

                <label className="checkbox-row form-full">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />

                  <span>
                    Customization is active
                  </span>
                </label>

                <div className="form-actions form-full">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={onClose}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Customization"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "commands" && (
              <div>
                <div className="panel-card">
                  <div className="panel-header">
                    <div>
                      <h2>Add Command</h2>
                      <p>
                        Command responses can be managed here.
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <label className="form-group">
                      <span>Command</span>
                      <input
                        value={newCommand}
                        onChange={(e) =>
                          setNewCommand(e.target.value)
                        }
                        placeholder="/start"
                      />
                    </label>

                    <label className="form-group">
                      <span>Response</span>
                      <input
                        value={newResponse}
                        onChange={(e) =>
                          setNewResponse(e.target.value)
                        }
                        placeholder="Welcome!"
                      />
                    </label>

                    <div className="form-actions form-full">
                      <button
                        className="primary-btn"
                        onClick={addCommand}
                      >
                        ＋ Add Command
                      </button>
                    </div>
                  </div>
                </div>

                <div className="panel-card">
                  {commands.length === 0 ? (
                    <div className="empty-state">
                      No commands added yet.
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Command</th>
                          <th>Response</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {commands.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>
                                {item.command}
                              </strong>
                            </td>

                            <td>
                              {item.response_message ||
                                "—"}
                            </td>

                            <td>
                              {item.is_active
                                ? "🟢 Active"
                                : "🔴 Disabled"}
                            </td>

                            <td>
                              <div className="table-actions">
                                <button
                                  className="secondary-btn small-btn"
                                  onClick={() =>
                                    toggleCommand(item)
                                  }
                                >
                                  {item.is_active
                                    ? "Disable"
                                    : "Enable"}
                                </button>

                                <button
                                  className="danger-btn small-btn"
                                  onClick={() =>
                                    deleteCommand(item.id)
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
                  )}
                </div>
              </div>
            )}

            {activeTab === "buttons" && (
              <div>
                <div className="panel-card">
                  <div className="panel-header">
                    <div>
                      <h2>Add Button</h2>
                      <p>
                        Create URL or callback-style button
                        records.
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <label className="form-group">
                      <span>Button Text</span>

                      <input
                        value={newButtonText}
                        onChange={(e) =>
                          setNewButtonText(e.target.value)
                        }
                        placeholder="Open Website"
                      />
                    </label>

                    <label className="form-group">
                      <span>Button Type</span>

                      <select
                        value={newButtonType}
                        onChange={(e) =>
                          setNewButtonType(e.target.value)
                        }
                      >
                        <option value="url">
                          URL
                        </option>
                        <option value="callback">
                          Callback
                        </option>
                        <option value="web_app">
                          Web App
                        </option>
                      </select>
                    </label>

                    <label className="form-group form-full">
                      <span>Button Value</span>

                      <input
                        value={newButtonValue}
                        onChange={(e) =>
                          setNewButtonValue(e.target.value)
                        }
                        placeholder="https://example.com"
                      />
                    </label>

                    <div className="form-actions form-full">
                      <button
                        className="primary-btn"
                        onClick={addButton}
                      >
                        ＋ Add Button
                      </button>
                    </div>
                  </div>
                </div>

                <div className="panel-card">
                  {buttons.length === 0 ? (
                    <div className="empty-state">
                      No buttons added yet.
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Text</th>
                          <th>Type</th>
                          <th>Value</th>
                          <th>Position</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {buttons.map((item) => (
                          <tr key={item.id}>
                            <td>{item.button_text}</td>
                            <td>{item.button_type}</td>
                            <td>
                              {item.button_value || "—"}
                            </td>
                            <td>{item.position}</td>
                            <td>
                              {item.is_active
                                ? "🟢 Active"
                                : "🔴 Disabled"}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="secondary-btn small-btn"
                                  onClick={() =>
                                    toggleButton(item)
                                  }
                                >
                                  {item.is_active
                                    ? "Disable"
                                    : "Enable"}
                                </button>

                                <button
                                  className="danger-btn small-btn"
                                  onClick={() =>
                                    deleteButton(item.id)
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
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PREMIUM MANAGEMENT
========================================================= */

function PremiumManagement() {
  const emptyPlan = {
    name: "",
    duration: "monthly",
    price: "0",
    is_active: true,
  };

  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [form, setForm] = useState(emptyPlan);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPremium = async () => {
    setLoading(true);
    setError("");

    const [plansResult, subscriptionsResult] =
      await Promise.all([
        supabase
          .from("premium_plans")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("premium_subscriptions")
          .select(
            "id, user_id, plan_id, status, started_at, expires_at, created_at"
          )
          .order("created_at", {
            ascending: false,
          }),
      ]);

    if (plansResult.error) {
      setError(plansResult.error.message);
      setPlans([]);
    } else {
      setPlans(plansResult.data || []);
    }

    if (subscriptionsResult.error) {
      setError((prev) =>
        prev
          ? `${prev} | ${subscriptionsResult.error.message}`
          : subscriptionsResult.error.message
      );
      setSubscriptions([]);
    } else {
      setSubscriptions(
        subscriptionsResult.data || []
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPremium();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyPlan);
    setShowForm(true);
    setError("");
  };

  const openEdit = (plan) => {
    setEditingId(plan.id);

    setForm({
      name: plan.name || "",
      duration: plan.duration || "monthly",
      price: String(plan.price ?? 0),
      is_active: Boolean(plan.is_active),
    });

    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyPlan);
  };

  const savePlan = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const price = Number(form.price);

    if (!name) {
      setError("Plan name is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Plan price must be a valid number.");
      return;
    }

    const payload = {
      name,
      duration: form.duration.trim() || "monthly",
      price,
      is_active: Boolean(form.is_active),
    };

    setSaving(true);

    let result;

    if (editingId) {
      result = await supabase
        .from("premium_plans")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
    } else {
      result = await supabase
        .from("premium_plans")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    if (editingId) {
      setPlans((prev) =>
        prev.map((item) =>
          item.id === editingId ? result.data : item
        )
      );
    } else {
      setPlans((prev) => [result.data, ...prev]);
    }

    setSaving(false);
    closeForm();
  };

  const deletePlan = async (plan) => {
    if (!window.confirm(`Delete "${plan.name}"?`)) return;

    const { error: deleteError } = await supabase
      .from("premium_plans")
      .delete()
      .eq("id", plan.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setPlans((prev) =>
      prev.filter((item) => item.id !== plan.id)
    );
  };

  const togglePlan = async (plan) => {
    const { data, error: updateError } = await supabase
      .from("premium_plans")
      .update({
        is_active: !plan.is_active,
      })
      .eq("id", plan.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPlans((prev) =>
      prev.map((item) =>
        item.id === plan.id ? data : item
      )
    );
  };

  const activeSubscriptions = subscriptions.filter(
    (item) =>
      String(item.status || "").toLowerCase() === "active"
  );

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Premium Management</h1>
          <p>
            Manage monthly/yearly premium plans and subscriptions.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-btn"
            onClick={loadPremium}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <button className="primary-btn" onClick={openAdd}>
            ＋ Add Premium Plan
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="stats-grid">
        <StatCard
          title="Total Plans"
          value={plans.length}
          icon="👑"
        />

        <StatCard
          title="Active Plans"
          value={
            plans.filter((plan) => plan.is_active).length
          }
          icon="✓"
        />

        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions.length}
          icon="★"
        />
      </div>

      {showForm && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>
                {editingId
                  ? "Edit Premium Plan"
                  : "Add Premium Plan"}
              </h2>

              <p>
                Set plan name, duration and price.
              </p>
            </div>

            <button
              className="secondary-btn"
              onClick={closeForm}
            >
              Close
            </button>
          </div>

          <form onSubmit={savePlan}>
            <div className="form-grid">
              <label className="form-group">
                <span>Plan Name *</span>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Premium Monthly"
                  required
                />
              </label>

              <label className="form-group">
                <span>Duration *</span>

                <select
                  value={form.duration}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                >
                  <option value="monthly">
                    Monthly
                  </option>
                  <option value="yearly">
                    Yearly
                  </option>
                  <option value="7_days">
                    7 Days
                  </option>
                  <option value="30_days">
                    30 Days
                  </option>
                  <option value="custom">
                    Custom
                  </option>
                </select>
              </label>

              <label className="form-group">
                <span>Price *</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                />

                <span>Plan Active</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Plan"
                  : "Add Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>Premium Plans</h2>
            <p>Available premium subscription plans.</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading premium plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👑</div>
            <h3>No Premium Plans</h3>
            <p>
              Add a monthly or yearly premium plan.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {plans.map((plan) => (
              <div className="panel-card product-card" key={plan.id}>
                <div className="product-card-top">
                  <div>
                    <h2>{plan.name}</h2>
                    <span className="muted-text">
                      {plan.duration}
                    </span>
                  </div>

                  <span
                    className={
                      plan.is_active
                        ? "status-badge active"
                        : "status-badge inactive"
                    }
                  >
                    {plan.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div
                  style={{
                    margin: "20px 0",
                    fontSize: "30px",
                    fontWeight: 800,
                  }}
                >
                  ₹{Number(plan.price || 0).toFixed(2)}
                </div>

                <div className="table-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => openEdit(plan)}
                  >
                    Edit
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => togglePlan(plan)}
                  >
                    {plan.is_active
                      ? "Disable"
                      : "Enable"}
                  </button>

                  <button
                    className="danger-btn"
                    onClick={() => deletePlan(plan)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>Premium Subscriptions</h2>
            <p>
              Current premium subscription records.
            </p>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="empty-state">
            No premium subscriptions found.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Plan ID</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Expires</th>
                </tr>
              </thead>

              <tbody>
                {subscriptions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.user_id || "—"}</td>
                    <td>{item.plan_id || "—"}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.started_at
                        ? new Date(
                            item.started_at
                          ).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {item.expires_at
                        ? new Date(
                            item.expires_at
                          ).toLocaleString()
                        : "—"}
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

/* =========================================================
   PAYMENTS
========================================================= */

function Payments() {
  const [activeTab, setActiveTab] = useState("deposits");

  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [methodSaving, setMethodSaving] = useState(false);
  const [editingMethodId, setEditingMethodId] =
    useState(null);

  const [methodForm, setMethodForm] = useState({
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
  });

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    const [paymentsResult, usersResult] =
      await Promise.all([
        supabase
          .from("payments")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("users")
          .select(
            "id, telegram_id, username, first_name, balance"
          ),
      ]);

    if (paymentsResult.error) {
      setError(paymentsResult.error.message);
      setPayments([]);
    } else {
      setPayments(paymentsResult.data || []);
    }

    if (usersResult.error) {
      setError((prev) =>
        prev
          ? `${prev} | ${usersResult.error.message}`
          : usersResult.error.message
      );
      setUsers([]);
    } else {
      setUsers(usersResult.data || []);
    }

    setLoading(false);
  };

  const loadPaymentMethods = async () => {
    setMethodsLoading(true);

    const { data, error: fetchError } = await supabase
      .from("payment_methods")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setPaymentMethods([]);
    } else {
      setPaymentMethods(data || []);
    }

    setMethodsLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (activeTab === "methods") {
      loadPaymentMethods();
    }
  }, [activeTab]);

  const getUser = (id) =>
    users.find((user) => user.id === id);

  const formatUser = (id) => {
    const user = getUser(id);

    if (!user) return "Unknown User";
    if (user.username)
      return `@${String(user.username).replace(/^@/, "")}`;
    if (user.first_name) return user.first_name;
    if (user.telegram_id)
      return `TG: ${user.telegram_id}`;

    return `User #${user.id}`;
  };

  const approvePayment = async (payment) => {
    if (!payment.user_id) {
      setError(
        "This payment has no linked user."
      );
      return;
    }

    if (
      !window.confirm(
        `Approve ₹${Number(
          payment.amount || 0
        ).toFixed(2)} deposit for ${formatUser(
          payment.user_id
        )}?`
      )
    ) {
      return;
    }

    setProcessingId(payment.id);
    setError("");

    try {
      const { data: currentPayment, error: currentError } =
        await supabase
          .from("payments")
          .select("id, user_id, amount, status")
          .eq("id", payment.id)
          .single();

      if (currentError) throw currentError;

      if (
        ["approved", "completed"].includes(
          String(
            currentPayment.status || ""
          ).toLowerCase()
        )
      ) {
        throw new Error(
          "This payment is already approved."
        );
      }

      const user = getUser(
        currentPayment.user_id
      );

      if (!user) {
        throw new Error(
          "Linked user was not found."
        );
      }

      const newBalance =
        Number(user.balance || 0) +
        Number(currentPayment.amount || 0);

      const { error: paymentError } =
        await supabase
          .from("payments")
          .update({
            status: "approved",
          })
          .eq("id", currentPayment.id)
          .in("status", [
            "pending",
            "processing",
            "rejected",
          ]);

      if (paymentError) throw paymentError;

      const { error: balanceError } =
        await supabase
          .from("users")
          .update({
            balance: newBalance,
          })
          .eq("id", currentPayment.user_id);

      if (balanceError) {
        await supabase
          .from("payments")
          .update({
            status: "pending",
          })
          .eq("id", currentPayment.id);

        throw balanceError;
      }

      await supabase.from("activity_logs").insert({
        user_id: currentPayment.user_id,
        action: "deposit_approved",
        description: `Deposit of ₹${Number(
          currentPayment.amount || 0
        ).toFixed(2)} approved by panel admin.`,
      });

      await loadPayments();
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Payment approval failed."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPayment = async (payment) => {
    if (!window.confirm("Reject this payment?")) {
      return;
    }

    setProcessingId(payment.id);
    setError("");

    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "rejected",
      })
      .eq("id", payment.id)
      .in("status", ["pending", "processing"]);

    if (updateError) {
      setError(updateError.message);
      setProcessingId(null);
      return;
    }

    if (payment.user_id) {
      await supabase.from("activity_logs").insert({
        user_id: payment.user_id,
        action: "deposit_rejected",
        description: `Deposit of ₹${Number(
          payment.amount || 0
        ).toFixed(2)} rejected by panel admin.`,
      });
    }

    await loadPayments();
    setProcessingId(null);
  };

  const resetMethodForm = () => {
    setEditingMethodId(null);

    setMethodForm({
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
    });
  };

  const savePaymentMethod = async (e) => {
    e.preventDefault();
    setError("");

    if (!methodForm.name.trim()) {
      setError(
        "Payment method name is required."
      );
      return;
    }

    setMethodSaving(true);

    const payload = {
      name: methodForm.name.trim(),
      type: methodForm.type || "upi",
      upi_id: methodForm.upi_id.trim() || null,
      account_name:
        methodForm.account_name.trim() || null,
      account_number:
        methodForm.account_number.trim() || null,
      ifsc_code:
        methodForm.ifsc_code.trim() || null,
      qr_image_url:
        methodForm.qr_image_url.trim() || null,
      instructions:
        methodForm.instructions.trim() || null,
      is_active: Boolean(
        methodForm.is_active
      ),
      position: Number(
        methodForm.position || 0
      ),
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
      setError(result.error.message);
      setMethodSaving(false);
      return;
    }

    resetMethodForm();
    await loadPaymentMethods();
    setMethodSaving(false);
  };

  const editPaymentMethod = (method) => {
    setEditingMethodId(method.id);

    setMethodForm({
      name: method.name || "",
      type: method.type || "upi",
      upi_id: method.upi_id || "",
      account_name:
        method.account_name || "",
      account_number:
        method.account_number || "",
      ifsc_code: method.ifsc_code || "",
      qr_image_url:
        method.qr_image_url || "",
      instructions:
        method.instructions || "",
      is_active: Boolean(method.is_active),
      position: Number(method.position || 0),
    });
  };

  const deletePaymentMethod = async (method) => {
    if (
      !window.confirm(
        `Delete payment method "${method.name}"?`
      )
    ) {
      return;
    }

    const { error: deleteError } =
      await supabase
        .from("payment_methods")
        .delete()
        .eq("id", method.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadPaymentMethods();

    if (editingMethodId === method.id) {
      resetMethodForm();
    }
  };

  const togglePaymentMethod = async (method) => {
    const { error: updateError } =
      await supabase
        .from("payment_methods")
        .update({
          is_active: !method.is_active,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", method.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadPaymentMethods();
  };

  const filteredPayments = payments.filter(
    (payment) => {
      const user = getUser(payment.user_id);
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        String(payment.id).includes(q) ||
        String(
          payment.transaction_id || ""
        )
          .toLowerCase()
          .includes(q) ||
        String(
          payment.payment_method || ""
        )
          .toLowerCase()
          .includes(q) ||
        String(payment.notes || "")
          .toLowerCase()
          .includes(q) ||
        String(user?.telegram_id || "")
          .toLowerCase()
          .includes(q) ||
        String(user?.username || "")
          .toLowerCase()
          .includes(q);

      const status = String(
        payment.status || ""
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  const pendingCount = payments.filter(
    (payment) =>
      String(payment.status || "").toLowerCase() ===
      "pending"
  ).length;

  const pendingAmount = payments
    .filter(
      (payment) =>
        String(payment.status || "").toLowerCase() ===
        "pending"
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  const approvedAmount = payments
    .filter((payment) =>
      [
        "approved",
        "completed",
        "paid",
        "success",
        "successful",
      ].includes(
        String(payment.status || "").toLowerCase()
      )
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.amount || 0),
      0
    );

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Payments & Settings</h1>
          <p>
            Manage deposits, payment history and
            payment methods.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadPayments}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="stats-grid">
        <StatCard
          title="Pending Deposits"
          value={pendingCount}
          icon="⏳"
        />

        <StatCard
          title="Pending Amount"
          value={`₹${pendingAmount.toFixed(2)}`}
          icon="₹"
        />

        <StatCard
          title="Approved Amount"
          value={`₹${approvedAmount.toFixed(2)}`}
          icon="✓"
        />

        <StatCard
          title="Total Records"
          value={payments.length}
          icon="↗"
        />
      </div>

      <div className="tabs">
        <button
          className={
            activeTab === "deposits"
              ? "tab active"
              : "tab"
          }
          onClick={() =>
            setActiveTab("deposits")
          }
        >
          Deposits
        </button>

        <button
          className={
            activeTab === "history"
              ? "tab active"
              : "tab"
          }
          onClick={() =>
            setActiveTab("history")
          }
        >
          Payment History
        </button>

        <button
          className={
            activeTab === "methods"
              ? "tab active"
              : "tab"
          }
          onClick={() =>
            setActiveTab("methods")
          }
        >
          Payment Methods
        </button>

        <button
          className={
            activeTab === "settings"
              ? "tab active"
              : "tab"
          }
          onClick={() =>
            setActiveTab("settings")
          }
        >
          Settings
        </button>
      </div>

      {(activeTab === "deposits" ||
        activeTab === "history") && (
        <>
          <div className="panel-card">
            <div className="form-grid">
              <label className="form-group">
                <span>Search</span>
                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Transaction ID, username..."
                />
              </label>

              <label className="form-group">
                <span>Status</span>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    All Status
                  </option>
                  <option value="pending">
                    Pending
                  </option>
                  <option value="approved">
                    Approved
                  </option>
                  <option value="completed">
                    Completed
                  </option>
                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </label>
            </div>
          </div>

          <div
            className="panel-card"
            style={{ overflowX: "auto" }}
          >
            {loading ? (
              <div className="empty-state">
                Loading payments...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ₹
                </div>

                <h3>No Payment Records</h3>

                <p>
                  No payment records match the
                  current filter.
                </p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map(
                    (payment) => {
                      const status =
                        String(
                          payment.status ||
                            "pending"
                        ).toLowerCase();

                      const user = getUser(
                        payment.user_id
                      );

                      return (
                        <tr key={payment.id}>
                          <td>
                            #{payment.id}
                          </td>

                          <td>
                            <strong>
                              {formatUser(
                                payment.user_id
                              )}
                            </strong>

                            <div className="muted-text">
                              {user?.telegram_id
                                ? `TG: ${user.telegram_id}`
                                : ""}
                            </div>
                          </td>

                          <td>
                            <strong>
                              ₹
                              {Number(
                                payment.amount ||
                                  0
                              ).toFixed(2)}
                            </strong>
                          </td>

                          <td>
                            {payment.payment_method ||
                              "—"}
                          </td>

                          <td>
                            {payment.transaction_id ||
                              "—"}
                          </td>

                          <td>
                            <span className="status-badge">
                              {status}
                            </span>
                          </td>

                          <td>
                            {payment.created_at
                              ? new Date(
                                  payment.created_at
                                ).toLocaleString()
                              : "—"}
                          </td>

                          <td>
                            {status ===
                            "pending" ? (
                              <div className="table-actions">
                                <button
                                  className="primary-btn small-btn"
                                  onClick={() =>
                                    approvePayment(
                                      payment
                                    )
                                  }
                                  disabled={
                                    processingId ===
                                    payment.id
                                  }
                                >
                                  {processingId ===
                                  payment.id
                                    ? "..."
                                    : "Approve"}
                                </button>

                                <button
                                  className="danger-btn small-btn"
                                  onClick={() =>
                                    rejectPayment(
                                      payment
                                    )
                                  }
                                  disabled={
                                    processingId ===
                                    payment.id
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === "methods" && (
        <div className="dashboard-columns">
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h2>
                  {editingMethodId
                    ? "Edit Payment Method"
                    : "Add Payment Method"}
                </h2>

                <p>
                  UPI, bank transfer and QR
                  configuration.
                </p>
              </div>
            </div>

            <form onSubmit={savePaymentMethod}>
              <div className="form-grid">
                <label className="form-group">
                  <span>Name *</span>

                  <input
                    name="name"
                    value={methodForm.name}
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="UPI Payment"
                    required
                  />
                </label>

                <label className="form-group">
                  <span>Type</span>

                  <select
                    value={methodForm.type}
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                  >
                    <option value="upi">
                      UPI
                    </option>
                    <option value="bank">
                      Bank Transfer
                    </option>
                    <option value="other">
                      Other
                    </option>
                  </select>
                </label>

                <label className="form-group">
                  <span>UPI ID</span>

                  <input
                    value={methodForm.upi_id}
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        upi_id: e.target.value,
                      }))
                    }
                    placeholder="name@upi"
                  />
                </label>

                <label className="form-group">
                  <span>Account Name</span>

                  <input
                    value={
                      methodForm.account_name
                    }
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        account_name:
                          e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-group">
                  <span>Account Number</span>

                  <input
                    value={
                      methodForm.account_number
                    }
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        account_number:
                          e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-group">
                  <span>IFSC</span>

                  <input
                    value={methodForm.ifsc_code}
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        ifsc_code:
                          e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-group">
                  <span>QR Image URL</span>

                  <input
                    value={
                      methodForm.qr_image_url
                    }
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        qr_image_url:
                          e.target.value,
                      }))
                    }
                    placeholder="https://..."
                  />
                </label>

                <label className="form-group">
                  <span>Position</span>

                  <input
                    type="number"
                    min="0"
                    value={methodForm.position}
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        position:
                          e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-group form-full">
                  <span>Instructions</span>

                  <textarea
                    rows="4"
                    value={
                      methodForm.instructions
                    }
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        instructions:
                          e.target.value,
                      }))
                    }
                    placeholder="Payment instructions..."
                  />
                </label>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={
                      methodForm.is_active
                    }
                    onChange={(e) =>
                      setMethodForm((prev) => ({
                        ...prev,
                        is_active:
                          e.target.checked,
                      }))
                    }
                  />

                  <span>Active</span>
                </label>
              </div>

              {methodForm.qr_image_url && (
                <img
                  src={methodForm.qr_image_url}
                  alt="Payment QR"
                  style={{
                    width: "180px",
                    height: "180px",
                    objectFit: "contain",
                    background: "#fff",
                    padding: "8px",
                    borderRadius: "12px",
                    marginTop: "15px",
                  }}
                />
              )}

              <div className="form-actions">
                <button
                  className="primary-btn"
                  type="submit"
                  disabled={methodSaving}
                >
                  {methodSaving
                    ? "Saving..."
                    : editingMethodId
                    ? "Update Method"
                    : "Add Method"}
                </button>

                {editingMethodId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetMethodForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h2>Saved Payment Methods</h2>
                <p>
                  Enable, disable or delete methods.
                </p>
              </div>

              <button
                className="secondary-btn"
                onClick={loadPaymentMethods}
              >
                {methodsLoading
                  ? "Loading..."
                  : "↻ Refresh"}
              </button>
            </div>

            {methodsLoading &&
            paymentMethods.length === 0 ? (
              <div className="empty-state">
                Loading payment methods...
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="empty-state">
                No payment methods added.
              </div>
            ) : (
              <div className="product-grid">
                {paymentMethods.map((method) => (
                  <div
                    className="panel-card"
                    key={method.id}
                  >
                    <div className="product-card-top">
                      <div>
                        <h3>{method.name}</h3>
                        <span className="muted-text">
                          {method.type}
                        </span>
                      </div>

                      <span className="status-badge">
                        {method.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    {method.qr_image_url && (
                      <img
                        src={
                          method.qr_image_url
                        }
                        alt={`${method.name} QR`}
                        style={{
                          display: "block",
                          width: "150px",
                          height: "150px",
                          objectFit: "contain",
                          background: "#fff",
                          padding: "7px",
                          borderRadius: "10px",
                          margin: "15px auto",
                        }}
                      />
                    )}

                    <div
                      style={{
                        lineHeight: 1.8,
                        fontSize: "14px",
                      }}
                    >
                      {method.upi_id && (
                        <div>
                          <strong>UPI:</strong>{" "}
                          {method.upi_id}
                        </div>
                      )}

                      {method.account_name && (
                        <div>
                          <strong>Account:</strong>{" "}
                          {method.account_name}
                        </div>
                      )}

                      {method.account_number && (
                        <div>
                          <strong>A/C:</strong>{" "}
                          {method.account_number}
                        </div>
                      )}

                      {method.ifsc_code && (
                        <div>
                          <strong>IFSC:</strong>{" "}
                          {method.ifsc_code}
                        </div>
                      )}
                    </div>

                    {method.instructions && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "10px",
                          borderRadius: "10px",
                          background:
                            "rgba(255,255,255,0.04)",
                          whiteSpace:
                            "pre-wrap",
                        }}
                      >
                        {method.instructions}
                      </div>
                    )}

                    <div className="table-actions">
                      <button
                        className="secondary-btn"
                        onClick={() =>
                          editPaymentMethod(
                            method
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="secondary-btn"
                        onClick={() =>
                          togglePaymentMethod(
                            method
                          )
                        }
                      >
                        {method.is_active
                          ? "Disable"
                          : "Enable"}
                      </button>

                      <button
                        className="danger-btn"
                        onClick={() =>
                          deletePaymentMethod(
                            method
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h2>Payment Settings</h2>
              <p>
                Basic information about the payment
                system.
              </p>
            </div>
          </div>

          <div className="feature-grid">
            <FeatureCard
              icon="🗄️"
              title="Database"
              description="Payments are stored in Supabase."
              onClick={() =>
                alert(
                  "Supabase payment database connected."
                )
              }
            />

            <FeatureCard
              icon="✓"
              title="Admin Approval"
              description="Pending deposits can be approved or rejected."
              onClick={() =>
                setActivePaymentTab(
                  "deposits"
                )
              }
            />

            <FeatureCard
              icon="₹"
              title="Balance"
              description="Approved deposits update the linked user balance."
              onClick={() =>
                alert(
                  "Approved deposits update user balance."
                )
              }
            />
          </div>
        </div>
      )}
    </section>
  );

  function setActivePaymentTab(tab) {
    setActiveTab(tab);
  }
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ErrorBox({ message }) {
  return (
    <div className="error-box">
      {message}
    </div>
  );
}

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
      <div className="empty-icon">
        ◷
      </div>

      <h3>No Recent Activity</h3>

      <p>
        New user, payment and product activity
        will appear here.
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button onClick={onClick}>
        Manage →
      </button>
    </div>
  );
}

export default App;