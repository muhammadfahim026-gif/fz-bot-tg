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
          className={
            activePage === "dashboard" ? "nav-item active" : "nav-item"
          }
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
          className={activePage === "users" ? "nav-item active" : "nav-item"}
          onClick={() => setActivePage("users")}
        >
          <span>👥</span>
          Users
        </button>

        <button
          className={
            activePage === "products" ? "nav-item active" : "nav-item"
          }
          onClick={() => setActivePage("products")}
        >
          <span>▤</span>
          Products
        </button>
\n        <button
          className={
            activePage === "resellers" ? "nav-item active" : "nav-item"
          }
          onClick={() => setActivePage("resellers")}
        >
          <span>💼</span>
          Resellers
        </button>

        <button
          className={
            activePage === "premium" ? "nav-item active" : "nav-item"
          }
          onClick={() => setActivePage("premium")}
        >
          <span>👑</span>
          Premium
        </button>

        <button
          className={
            activePage === "payments" ? "nav-item active" : "nav-item"
          }
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

      const startOfYear = new Date(
        now.getFullYear(),
        0,
        1
      );

      const [
        usersResult,
        productsResult,
        keysResult,
        ordersResult,
        paymentsResult,
        premiumResult,
      ] = await Promise.all([
        supabase
          .from("users")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("products")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("product_keys")
          .select("status"),

        supabase
          .from("orders")
          .select("amount, status, created_at"),

        supabase
          .from("payments")
          .select("amount, status, created_at"),

        supabase
          .from("premium_subscriptions")
          .select("user_id, status"),
      ]);

      const results = [
        usersResult,
        productsResult,
        keysResult,
        ordersResult,
        paymentsResult,
        premiumResult,
      ];

      const firstError = results.find((result) => result.error);

      if (firstError?.error) {
        throw new Error(firstError.error.message);
      }

      const usersCount = usersResult.count || 0;
      const productsCount = productsResult.count || 0;

      const keys = keysResult.data || [];
      const orders = ordersResult.data || [];
      const payments = paymentsResult.data || [];
      const premiumSubscriptions = premiumResult.data || [];

      const isCompletedOrder = (status) =>
        ["completed", "paid", "success", "successful"].includes(
          String(status || "").toLowerCase()
        );

      const isCompletedPayment = (status) =>
        ["completed", "paid", "success", "successful", "approved"].includes(
          String(status || "").toLowerCase()
        );

      const getAmount = (amount) => Number(amount) || 0;

      const completedOrders = orders.filter((order) =>
        isCompletedOrder(order.status)
      );

      const totalRevenue = completedOrders.reduce(
        (total, order) => total + getAmount(order.amount),
        0
      );

      const todaySales = completedOrders
        .filter(
          (order) =>
            order.created_at &&
            new Date(order.created_at) >= startOfToday
        )
        .reduce(
          (total, order) => total + getAmount(order.amount),
          0
        );

      const monthlySales = completedOrders
        .filter(
          (order) =>
            order.created_at &&
            new Date(order.created_at) >= startOfMonth
        )
        .reduce(
          (total, order) => total + getAmount(order.amount),
          0
        );

      const yearlySales = completedOrders
        .filter(
          (order) =>
            order.created_at &&
            new Date(order.created_at) >= startOfYear
        )
        .reduce(
          (total, order) => total + getAmount(order.amount),
          0
        );

      const keysAvailable = keys.filter(
        (key) => String(key.status).toLowerCase() === "available"
      ).length;

      const keysSold = keys.filter((key) =>
        ["sold", "used", "activated", "assigned"].includes(
          String(key.status).toLowerCase()
        )
      ).length;

      const totalDeposits = payments
        .filter((payment) => isCompletedPayment(payment.status))
        .reduce(
          (total, payment) => total + getAmount(payment.amount),
          0
        );

      const activePremiumUserIds = new Set(
        premiumSubscriptions
          .filter(
            (subscription) =>
              String(subscription.status).toLowerCase() === "active"
          )
          .map((subscription) => subscription.user_id)
          .filter(Boolean)
      );

      setStats({
        totalRevenue,
        totalUsers: usersCount,
        todaySales,
        monthlySales,
        yearlySales,
        keysAvailable,
        keysSold,
        totalDeposits,
        premiumUsers: activePremiumUserIds.size,
        products: productsCount,
      });
    } catch (dashboardError) {
      console.error("Dashboard load error:", dashboardError);
      setError(dashboardError.message || "Unable to load dashboard data.");
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

      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={loading ? "..." : money(stats.totalRevenue)}
          icon="₹"
        />

        <StatCard
          title="Total Users"
          value={loading ? "..." : stats.totalUsers}
          icon="👥"
        />

        <StatCard
          title="Today's Sales"
          value={loading ? "..." : money(stats.todaySales)}
          icon="▣"
        />

        <StatCard
          title="Monthly Sales"
          value={loading ? "..." : money(stats.monthlySales)}
          icon="◫"
        />

        <StatCard
          title="Yearly Sales"
          value={loading ? "..." : money(stats.yearlySales)}
          icon="◷"
        />

        <StatCard
          title="Keys Available"
          value={loading ? "..." : stats.keysAvailable}
          icon="🔑"
        />

        <StatCard
          title="Keys Sold"
          value={loading ? "..." : stats.keysSold}
          icon="✓"
        />

        <StatCard
          title="Total Deposits"
          value={loading ? "..." : money(stats.totalDeposits)}
          icon="＋"
        />

        <StatCard
          title="Premium Users"
          value={loading ? "..." : stats.premiumUsers}
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
              value={loading ? "..." : stats.products}
              description="Active products"
            />

            <InventoryItem
              title="Available Keys"
              value={loading ? "..." : stats.keysAvailable}
              description="Ready to sell"
            />

            <InventoryItem
              title="Sold Keys"
              value={loading ? "..." : stats.keysSold}
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
   USERS MANAGEMENT
   SUPABASE CONNECTED
========================= */

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
      console.error("Users load error:", fetchError);
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
      setError("Balance must be a valid number greater than or equal to 0.");
      return;
    }

    setSavingId(editingUser.id);
    setError("");

    const { error: updateError } = await supabase
      .from("users")
      .update({
        balance,
        is_premium: editPremium,
      })
      .eq("id", editingUser.id);

    if (updateError) {
      console.error("User update error:", updateError);
      setError(updateError.message);
      setSavingId(null);
      return;
    }

    setUsers((previous) =>
      previous.map((user) =>
        user.id === editingUser.id
          ? { ...user, balance, is_premium: editPremium }
          : user
      )
    );

    setSavingId(null);
    closeEdit();
  };

  const deleteUser = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("User delete error:", deleteError);
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    setUsers((previous) => previous.filter((user) => user.id !== id));

    if (editingUser?.id === id) {
      closeEdit();
    }

    setDeletingId(null);
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!normalizedSearch) return true;

    return [
      user.telegram_id,
      user.username,
      user.first_name,
      String(user.id),
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Users Management</h1>
          <p>View and manage Telegram users stored in Supabase.</p>
        </div>

        <button
          className="primary-btn"
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
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

      <div
        className="panel-card"
        style={{
          marginBottom: "18px",
          padding: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>All Users</h2>
            <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>

          <input
            type="text"
            placeholder="Search Telegram ID, username, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "min(420px, 100%)",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
              outline: "none",
            }}
          />
        </div>
      </div>

      {editingUser && (
        <div
          className="panel-card"
          style={{
            marginBottom: "18px",
            padding: "20px",
          }}
        >
          <div className="panel-header">
            <div>
              <h2>Edit User</h2>
              <p>
                {editingUser.first_name || "User"}{" "}
                {editingUser.username ? `(@${editingUser.username})` : ""}
              </p>
            </div>

            <button className="secondary-btn" onClick={closeEdit}>
              Close
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <label className="form-group">
              <span>Telegram ID</span>
              <input
                type="text"
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

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                paddingTop: "28px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={editPremium}
                onChange={(e) => setEditPremium(e.target.checked)}
              />
              <span>Premium User</span>
            </label>
          </div>

          <div
            style={{
              marginTop: "16px",
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
            }}
          >
            <button className="secondary-btn" onClick={closeEdit}>
              Cancel
            </button>

            <button
              className="primary-btn"
              onClick={saveUser}
              disabled={savingId === editingUser.id}
            >
              {savingId === editingUser.id ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      <div className="panel-card" style={{ overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", opacity: 0.7 }}>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", opacity: 0.7 }}>
            {users.length === 0
              ? "No users found yet."
              : "No users match your search."}
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr>
                {[
                  "ID",
                  "Telegram ID",
                  "Username",
                  "First Name",
                  "Balance",
                  "Premium",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "14px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.10)",
                      fontSize: "13px",
                      opacity: 0.75,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: "14px 12px" }}>{user.id}</td>

                  <td style={{ padding: "14px 12px" }}>
                    {user.telegram_id || "—"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    {user.username ? `@${user.username}` : "—"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    {user.first_name || "—"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    ₹{Number(user.balance || 0).toFixed(2)}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    {user.is_premium ? "⭐ Yes" : "No"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleString()
                      : "—"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="secondary-btn"
                        onClick={() => openEdit(user)}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-btn"
                        onClick={() => deleteUser(user.id)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? "Deleting..." : "Delete"}
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

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

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
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
    setError("");
    setShowForm(true);
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
    const totalKeysSold = Number(form.total_keys_sold);

    if (!name) {
      setError("Reseller name is required.");
      return;
    }

    if (!Number.isFinite(balance) || balance < 0) {
      setError("Balance must be a valid number greater than or equal to 0.");
      return;
    }

    if (!Number.isInteger(totalKeysSold) || totalKeysSold < 0) {
      setError("Total keys sold must be a whole number greater than or equal to 0.");
      return;
    }

    const payload = {
      name,
      username: username || null,
      phone: phone || null,
      balance,
      total_keys_sold: totalKeysSold,
      is_active: Boolean(form.is_active),
    };

    setSaving(true);

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from("resellers")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();

      if (updateError) {
        console.error("Reseller update error:", updateError);
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setResellers((previous) =>
        previous.map((item) => (item.id === editingId ? data : item))
      );
    } else {
      const { data, error: insertError } = await supabase
        .from("resellers")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        console.error("Reseller insert error:", insertError);
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setResellers((previous) => [data, ...previous]);
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteReseller = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reseller?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    const { error: deleteError } = await supabase
      .from("resellers")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Reseller delete error:", deleteError);
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    setResellers((previous) => previous.filter((item) => item.id !== id));
    setDeletingId(null);
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredResellers = resellers.filter((reseller) => {
    if (!normalizedSearch) return true;

    return [
      reseller.name,
      reseller.username,
      reseller.phone,
      String(reseller.id),
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Resellers Management</h1>
          <p>Manage reseller accounts, balances and key sales.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="secondary-btn"
            onClick={loadResellers}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <button className="primary-btn" onClick={openAdd}>
            + Add Reseller
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

      <div
        className="panel-card"
        style={{ marginBottom: "18px", padding: "18px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>All Resellers</h2>
            <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
              Showing {filteredResellers.length} of {resellers.length} resellers
            </p>
          </div>

          <input
            type="text"
            placeholder="Search name, username, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "min(420px, 100%)",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
              outline: "none",
            }}
          />
        </div>
      </div>

      {showForm && (
        <div
          className="panel-card"
          style={{ marginBottom: "18px", padding: "20px" }}
        >
          <div className="panel-header">
            <div>
              <h2>{editingId ? "Edit Reseller" : "Add Reseller"}</h2>
              <p>
                {editingId
                  ? "Update the reseller information below."
                  : "Create a new reseller account."}
              </p>
            </div>

            <button
              className="secondary-btn"
              onClick={closeForm}
              disabled={saving}
            >
              Close
            </button>
          </div>

          <form onSubmit={saveReseller}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <label className="form-group">
                <span>Reseller Name *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Enter reseller name"
                  required
                />
              </label>

              <label className="form-group">
                <span>Telegram Username</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => updateForm("username", e.target.value)}
                  placeholder="@username"
                />
              </label>

              <label className="form-group">
                <span>Phone</span>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  placeholder="Phone number"
                />
              </label>

              <label className="form-group">
                <span>Balance</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.balance}
                  onChange={(e) => updateForm("balance", e.target.value)}
                  placeholder="0"
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
                  placeholder="0"
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  paddingTop: "28px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => updateForm("is_active", e.target.checked)}
                />
                <span>Active Reseller</span>
              </label>
            </div>

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="secondary-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button type="submit" className="primary-btn" disabled={saving}>
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

      <div className="panel-card" style={{ overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", opacity: 0.7 }}>
            Loading resellers...
          </div>
        ) : filteredResellers.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", opacity: 0.7 }}>
            {resellers.length === 0
              ? "No resellers found yet. Click + Add Reseller to create one."
              : "No resellers match your search."}
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "950px",
            }}
          >
            <thead>
              <tr>
                {[
                  "ID",
                  "Name",
                  "Username",
                  "Phone",
                  "Balance",
                  "Keys Sold",
                  "Status",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "14px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.10)",
                      fontSize: "13px",
                      opacity: 0.75,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredResellers.map((reseller) => (
                <tr key={reseller.id}>
                  <td style={{ padding: "14px 12px" }}>{reseller.id}</td>

                  <td style={{ padding: "14px 12px", fontWeight: 600 }}>
                    {reseller.name || "—"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    {reseller.username ? `@${reseller.username}` : "—"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    {reseller.phone || "—"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    ₹{Number(reseller.balance || 0).toFixed(2)}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    {Number(reseller.total_keys_sold || 0)}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    {reseller.is_active ? "🟢 Active" : "🔴 Inactive"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    {reseller.created_at
                      ? new Date(reseller.created_at).toLocaleString()
                      : "—"}
                  </td>

                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="secondary-btn"
                        onClick={() => openEdit(reseller)}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-btn"
                        onClick={() => deleteReseller(reseller.id)}
                        disabled={deletingId === reseller.id}
                      >
                        {deletingId === reseller.id ? "Deleting..." : "Delete"}
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

/* =========================
   BOT CONTROLLER
========================= */

function BotController() {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Bot Controller</h1>
          <p>Manage your Telegram bot configuration from one place.</p>
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
   SUPABASE CONNECTED
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

    setDeletingId(null);
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Products</h1>
          <p>Add and manage your products, pricing, duration and stock.</p>
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

          <form className="product-form" onSubmit={addProduct}>
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
            <p>{products.length} product(s) currently added.</p>
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
            <p>Add your first product using the Add Product button.</p>
          </div>
        ) : (
          <div className="product-list">
            {products.map((product) => {
              const hasOfferPrice =
                product.offerPrice !== null &&
                product.offerPrice !== undefined &&
                product.offerPrice !== "";

              const displayPrice = hasOfferPrice
                ? product.offerPrice
                : product.price ?? 0;

              return (
                <div className="product-row" key={product.id}>
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

                  <div className="product-price">
                    <strong>₹{displayPrice}</strong>

                    {hasOfferPrice &&
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

                    <span>Stock: {product.stock ?? 0}</span>
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}


/* =========================
   PREMIUM MANAGEMENT
========================= */

function PremiumManagement() {
  const emptyForm = {
    name: "",
    duration: "",
    price: "",
    is_active: true,
  };

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadPlans = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("premium_plans")
      .select("*")
      .order("created_at", { ascending: true });

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

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name || "",
      duration: plan.duration || "",
      price: String(plan.price ?? ""),
      is_active: Boolean(plan.is_active),
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

  const savePlan = async (e) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const duration = form.duration.trim();
    const price = Number(form.price);

    if (!name) {
      setError("Plan name is required.");
      return;
    }

    if (!duration) {
      setError("Duration is required. Example: 1 Month or 1 Year.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a valid number greater than or equal to 0.");
      return;
    }

    const payload = {
      name,
      duration,
      price,
      is_active: Boolean(form.is_active),
    };

    setSaving(true);

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from("premium_plans")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();

      if (updateError) {
        console.error("Premium plan update error:", updateError);
        setError(updateError.message);
        setSaving(false);
        return;
      }

      setPlans((previous) =>
        previous.map((plan) => (plan.id === editingId ? data : plan))
      );
    } else {
      const { data, error: insertError } = await supabase
        .from("premium_plans")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        console.error("Premium plan insert error:", insertError);
        setError(insertError.message);
        setSaving(false);
        return;
      }

      setPlans((previous) => [...previous, data]);
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deletePlan = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this premium plan?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    const { error: deleteError } = await supabase
      .from("premium_plans")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Premium plan delete error:", deleteError);
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    setPlans((previous) => previous.filter((plan) => plan.id !== id));
    setDeletingId(null);
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Premium Management</h1>
          <p>Set and manage your own monthly and yearly premium prices.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="secondary-btn"
            onClick={loadPlans}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

          <button className="primary-btn" onClick={openAdd}>
            + Add Premium Plan
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
        <div
          className="panel-card"
          style={{ marginBottom: "18px", padding: "20px" }}
        >
          <div className="panel-header">
            <div>
              <h2>{editingId ? "Edit Premium Plan" : "Add Premium Plan"}</h2>
              <p>
                {editingId
                  ? "Change the premium plan price or other details."
                  : "Create a premium plan with your own price."}
              </p>
            </div>

            <button
              className="secondary-btn"
              onClick={closeForm}
              disabled={saving}
            >
              Close
            </button>
          </div>

          <form onSubmit={savePlan}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <label className="form-group">
                <span>Plan Name *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Example: Premium Monthly"
                  required
                />
              </label>

              <label className="form-group">
                <span>Duration *</span>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => updateForm("duration", e.target.value)}
                  placeholder="Example: 1 Month"
                  required
                />
              </label>

              <label className="form-group">
                <span>Price (₹) *</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="Enter your price"
                  required
                />
              </label>

              <label
                className="form-group"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  paddingTop: "28px",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    updateForm("is_active", e.target.checked)
                  }
                  style={{ width: "18px", height: "18px" }}
                />
                <span>Plan Active</span>
              </label>
            </div>

            <div style={{ marginTop: "16px" }}>
              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Premium Plan"
                  : "Save Premium Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h2>Your Premium Plans</h2>
            <p>
              Prices shown here are controlled directly from this panel.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <h3>Loading Premium Plans...</h3>
            <p>Please wait while plans are loaded.</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">★</div>
            <h3>No Premium Plans Yet</h3>
            <p>
              Add a monthly, yearly, or any custom-duration plan using the
              button above.
            </p>
          </div>
        ) : (
          <div className="product-list">
            {plans.map((plan) => (
              <div className="product-row" key={plan.id}>
                <div>
                  <h3>{plan.name}</h3>
                  <p>{plan.duration}</p>
                  <small>
                    {plan.is_active ? "Active" : "Inactive"} • Plan ID:{" "}
                    {plan.id}
                  </small>
                </div>

                <div className="product-price">
                  <strong>₹{Number(plan.price || 0).toFixed(2)}</strong>
                  <span>{plan.duration}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="secondary-btn"
                    onClick={() => openEdit(plan)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deletePlan(plan.id)}
                    disabled={deletingId === plan.id}
                  >
                    {deletingId === plan.id ? "Deleting..." : "Delete"}
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
   PAYMENTS
========================= */

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
  const [editingMethodId, setEditingMethodId] = useState(null);
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

    const [paymentsResult, usersResult] = await Promise.all([
      supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("users")
        .select("id, telegram_id, username, first_name, balance"),
    ]);

    if (paymentsResult.error) {
      console.error("Payments load error:", paymentsResult.error);
      setError(paymentsResult.error.message);
      setPayments([]);
    } else {
      setPayments(paymentsResult.data || []);
    }

    if (usersResult.error) {
      console.error("Users load error:", usersResult.error);
      setError((previous) =>
        previous
          ? `${previous} | Users: ${usersResult.error.message}`
          : usersResult.error.message
      );
      setUsers([]);
    } else {
      setUsers(usersResult.data || []);
    }

    setLoading(false);
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

  const loadPaymentMethods = async () => {
    setMethodsLoading(true);
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Payment methods load error:", error);
      setError(error.message);
      setPaymentMethods([]);
    } else {
      setPaymentMethods(data || []);
    }
    setMethodsLoading(false);
  };

  const handleMethodChange = (event) => {
    const { name, value, type, checked } = event.target;
    setMethodForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      position: Number(method.position || 0),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const savePaymentMethod = async (event) => {
    event.preventDefault();
    setError("");

    if (!methodForm.name.trim()) {
      setError("Payment method name is required.");
      return;
    }

    setMethodSaving(true);

    const payload = {
      name: methodForm.name.trim(),
      type: methodForm.type || "upi",
      upi_id: methodForm.upi_id.trim() || null,
      account_name: methodForm.account_name.trim() || null,
      account_number: methodForm.account_number.trim() || null,
      ifsc_code: methodForm.ifsc_code.trim() || null,
      qr_image_url: methodForm.qr_image_url.trim() || null,
      instructions: methodForm.instructions.trim() || null,
      is_active: Boolean(methodForm.is_active),
      position: Number(methodForm.position || 0),
      updated_at: new Date().toISOString(),
    };

    let result;
    if (editingMethodId) {
      result = await supabase
        .from("payment_methods")
        .update(payload)
        .eq("id", editingMethodId);
    } else {
      result = await supabase.from("payment_methods").insert(payload);
    }

    if (result.error) {
      console.error("Payment method save error:", result.error);
      setError(result.error.message);
      setMethodSaving(false);
      return;
    }

    resetMethodForm();
    await loadPaymentMethods();
    setMethodSaving(false);
  };

  const deletePaymentMethod = async (method) => {
    if (!window.confirm(`Delete payment method "${method.name}"?`)) return;

    setError("");
    const { error: deleteError } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", method.id);

    if (deleteError) {
      console.error("Payment method delete error:", deleteError);
      setError(deleteError.message);
      return;
    }

    if (editingMethodId === method.id) resetMethodForm();
    await loadPaymentMethods();
  };

  const togglePaymentMethod = async (method) => {
    setError("");
    const { error: updateError } = await supabase
      .from("payment_methods")
      .update({
        is_active: !method.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", method.id);

    if (updateError) {
      console.error("Payment method status error:", updateError);
      setError(updateError.message);
      return;
    }

    await loadPaymentMethods();
  };

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (activeTab === "methods") {
      loadPaymentMethods();
    }
  }, [activeTab]);

  const getUser = (userId) => {
    return users.find((user) => user.id === userId);
  };

  const formatUser = (userId) => {
    const user = getUser(userId);

    if (!user) return "Unknown User";

    if (user.username) return `@${String(user.username).replace(/^@/, "")}`;
    if (user.first_name) return user.first_name;
    if (user.telegram_id) return `TG: ${user.telegram_id}`;

    return `User #${user.id}`;
  };

  const approvePayment = async (payment) => {
    if (
      !window.confirm(
        `Approve ₹${Number(payment.amount || 0).toFixed(2)} deposit for ${formatUser(
          payment.user_id
        )}?`
      )
    ) {
      return;
    }

    if (payment.status === "approved" || payment.status === "completed") {
      setError("This payment is already approved/completed.");
      return;
    }

    if (!payment.user_id) {
      setError("This payment has no linked user, so balance cannot be updated.");
      return;
    }

    setProcessingId(payment.id);
    setError("");

    // Re-check the current payment status before changing the balance.
    const { data: currentPayment, error: currentPaymentError } = await supabase
      .from("payments")
      .select("id, user_id, amount, status")
      .eq("id", payment.id)
      .single();

    if (currentPaymentError) {
      setError(currentPaymentError.message);
      setProcessingId(null);
      return;
    }

    if (
      currentPayment.status === "approved" ||
      currentPayment.status === "completed"
    ) {
      setError("This payment was already approved.");
      await loadPayments();
      setProcessingId(null);
      return;
    }

    const user = getUser(currentPayment.user_id);

    if (!user) {
      setError("Linked user was not found.");
      setProcessingId(null);
      return;
    }

    const newBalance =
      Number(user.balance || 0) + Number(currentPayment.amount || 0);

    // Mark payment first. The UI also disables the action while processing.
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({ status: "approved" })
      .eq("id", currentPayment.id)
      .in("status", ["pending", "processing", "rejected"]);

    if (paymentUpdateError) {
      console.error("Payment approval error:", paymentUpdateError);
      setError(paymentUpdateError.message);
      setProcessingId(null);
      return;
    }

    const { error: balanceError } = await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", currentPayment.user_id);

    if (balanceError) {
      console.error("Balance update error:", balanceError);

      // Try to restore the payment to pending if the balance update failed.
      await supabase
        .from("payments")
        .update({ status: "pending" })
        .eq("id", currentPayment.id)
        .eq("status", "approved");

      setError(
        `Balance update failed: ${balanceError.message}. Payment was returned to pending.`
      );
      await loadPayments();
      setProcessingId(null);
      return;
    }

    await supabase.from("activity_logs").insert({
      user_id: currentPayment.user_id,
      action: "deposit_approved",
      description: `Deposit of ₹${Number(currentPayment.amount || 0).toFixed(
        2
      )} approved by panel admin.`,
    });

    await loadPayments();
    setProcessingId(null);
  };

  const rejectPayment = async (payment) => {
    if (
      !window.confirm(
        `Reject ₹${Number(payment.amount || 0).toFixed(2)} deposit for ${formatUser(
          payment.user_id
        )}?`
      )
    ) {
      return;
    }

    if (
      payment.status === "approved" ||
      payment.status === "completed" ||
      payment.status === "rejected"
    ) {
      setError("This payment cannot be rejected in its current status.");
      return;
    }

    setProcessingId(payment.id);
    setError("");

    const { error: updateError } = await supabase
      .from("payments")
      .update({ status: "rejected" })
      .eq("id", payment.id)
      .in("status", ["pending", "processing"]);

    if (updateError) {
      console.error("Payment rejection error:", updateError);
      setError(updateError.message);
      setProcessingId(null);
      return;
    }

    if (payment.user_id) {
      await supabase.from("activity_logs").insert({
        user_id: payment.user_id,
        action: "deposit_rejected",
        description: `Deposit of ₹${Number(payment.amount || 0).toFixed(
          2
        )} rejected by panel admin.`,
      });
    }

    await loadPayments();
    setProcessingId(null);
  };

  const filteredPayments = payments.filter((payment) => {
    const user = getUser(payment.user_id);
    const text = search.trim().toLowerCase();

    const matchesSearch =
      !text ||
      String(payment.id).includes(text) ||
      String(payment.transaction_id || "").toLowerCase().includes(text) ||
      String(payment.payment_method || "").toLowerCase().includes(text) ||
      String(payment.notes || "").toLowerCase().includes(text) ||
      String(user?.telegram_id || "").toLowerCase().includes(text) ||
      String(user?.username || "").toLowerCase().includes(text) ||
      String(user?.first_name || "").toLowerCase().includes(text);

    const normalizedStatus = String(payment.status || "").toLowerCase();
    const matchesStatus =
      statusFilter === "all" || normalizedStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = payments.filter(
    (payment) =>
      String(payment.status || "").toLowerCase() === "pending"
  ).length;

  const approvedAmount = payments
    .filter((payment) =>
      ["approved", "completed", "paid", "success", "successful"].includes(
        String(payment.status || "").toLowerCase()
      )
    )
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const pendingAmount = payments
    .filter(
      (payment) =>
        String(payment.status || "").toLowerCase() === "pending"
    )
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>Payments & Settings</h1>
          <p>Manage deposits, payment history and payment configuration.</p>
        </div>

        <button
          className="secondary-btn"
          onClick={loadPayments}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div>
            <p>Pending Deposits</p>
            <h2>{pendingCount}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">₹</div>
          <div>
            <p>Pending Amount</p>
            <h2>₹{pendingAmount.toFixed(2)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <p>Approved Amount</p>
            <h2>₹{approvedAmount.toFixed(2)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">↗</div>
          <div>
            <p>Total Records</p>
            <h2>{payments.length}</h2>
          </div>
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

      {(activeTab === "deposits" || activeTab === "history") && (
        <>
          <div
            className="panel-card"
            style={{
              marginBottom: "18px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(220px, 1fr) 180px",
                gap: "12px",
              }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, username, transaction ID, method..."
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="panel-card" style={{ overflowX: "auto" }}>
            <div className="panel-header">
              <div>
                <h2>
                  {activeTab === "deposits"
                    ? "Deposit Requests"
                    : "Payment History"}
                </h2>
                <p>
                  {filteredPayments.length} record(s) shown from{" "}
                  {payments.length} total.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <div className="empty-icon">◷</div>
                <h3>Loading Payments...</h3>
                <p>Please wait while payment records are loaded.</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">₹</div>
                <h3>No Payment Records</h3>
                <p>
                  {payments.length === 0
                    ? "Payment records will appear here when users create deposits."
                    : "No payments match your current search or filter."}
                </p>
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1050px",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "ID",
                      "User",
                      "Amount",
                      "Method",
                      "Transaction ID",
                      "Status",
                      "Date",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: "left",
                          padding: "14px 12px",
                          borderBottom:
                            "1px solid rgba(255,255,255,0.10)",
                          fontSize: "13px",
                          opacity: 0.75,
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => {
                    const status = String(
                      payment.status || "pending"
                    ).toLowerCase();

                    const user = getUser(payment.user_id);

                    return (
                      <tr key={payment.id}>
                        <td style={{ padding: "14px 12px" }}>
                          #{payment.id}
                        </td>

                        <td style={{ padding: "14px 12px" }}>
                          <strong>{formatUser(payment.user_id)}</strong>
                          <div
                            style={{
                              fontSize: "12px",
                              opacity: 0.65,
                              marginTop: "3px",
                            }}
                          >
                            {user?.telegram_id
                              ? `TG: ${user.telegram_id}`
                              : "No Telegram ID"}
                          </div>
                        </td>

                        <td style={{ padding: "14px 12px" }}>
                          <strong>
                            ₹{Number(payment.amount || 0).toFixed(2)}
                          </strong>
                        </td>

                        <td style={{ padding: "14px 12px" }}>
                          {payment.payment_method || "—"}
                        </td>

                        <td style={{ padding: "14px 12px" }}>
                          {payment.transaction_id || "—"}
                        </td>

                        <td style={{ padding: "14px 12px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "5px 9px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              textTransform: "capitalize",
                              background:
                                status === "approved" ||
                                status === "completed" ||
                                status === "paid" ||
                                status === "success" ||
                                status === "successful"
                                  ? "rgba(70, 220, 130, 0.12)"
                                  : status === "rejected"
                                  ? "rgba(255, 70, 70, 0.12)"
                                  : "rgba(255, 190, 70, 0.12)",
                              border:
                                status === "approved" ||
                                status === "completed" ||
                                status === "paid" ||
                                status === "success" ||
                                status === "successful"
                                  ? "1px solid rgba(70, 220, 130, 0.25)"
                                  : status === "rejected"
                                  ? "1px solid rgba(255, 70, 70, 0.25)"
                                  : "1px solid rgba(255, 190, 70, 0.25)",
                            }}
                          >
                            {status}
                          </span>
                        </td>

                        <td style={{ padding: "14px 12px" }}>
                          {payment.created_at
                            ? new Date(payment.created_at).toLocaleString()
                            : "—"}
                        </td>

                        <td style={{ padding: "14px 12px" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            {status === "pending" && (
                              <>
                                <button
                                  className="primary-btn"
                                  onClick={() => approvePayment(payment)}
                                  disabled={processingId === payment.id}
                                >
                                  {processingId === payment.id
                                    ? "Processing..."
                                    : "Approve"}
                                </button>

                                <button
                                  className="danger-btn"
                                  onClick={() => rejectPayment(payment)}
                                  disabled={processingId === payment.id}
                                >
                                  {processingId === payment.id
                                    ? "Processing..."
                                    : "Reject"}
                                </button>
                              </>
                            )}

                            {status !== "pending" && (
                              <span
                                style={{
                                  fontSize: "13px",
                                  opacity: 0.65,
                                }}
                              >
                                No action
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === "methods" && (
        <div style={{ display: "grid", gap: "18px" }}>
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h2>{editingMethodId ? "Edit Payment Method" : "Add Payment Method"}</h2>
                <p>Manage UPI, bank transfer and QR payment options from the panel.</p>
              </div>
              {editingMethodId && (
                <button className="secondary-btn" type="button" onClick={resetMethodForm}>
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={savePaymentMethod}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                }}
              >
                <label className="field">
                  <span>Method Name *</span>
                  <input
                    name="name"
                    value={methodForm.name}
                    onChange={handleMethodChange}
                    placeholder="Example: UPI Payment"
                    required
                  />
                </label>

                <label className="field">
                  <span>Type</span>
                  <select name="type" value={methodForm.type} onChange={handleMethodChange}>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label className="field">
                  <span>UPI ID</span>
                  <input
                    name="upi_id"
                    value={methodForm.upi_id}
                    onChange={handleMethodChange}
                    placeholder="yourname@upi"
                  />
                </label>

                <label className="field">
                  <span>Account Name</span>
                  <input
                    name="account_name"
                    value={methodForm.account_name}
                    onChange={handleMethodChange}
                    placeholder="Account holder name"
                  />
                </label>

                <label className="field">
                  <span>Account Number</span>
                  <input
                    name="account_number"
                    value={methodForm.account_number}
                    onChange={handleMethodChange}
                    placeholder="Bank account number"
                  />
                </label>

                <label className="field">
                  <span>IFSC Code</span>
                  <input
                    name="ifsc_code"
                    value={methodForm.ifsc_code}
                    onChange={handleMethodChange}
                    placeholder="IFSC0000000"
                  />
                </label>

                <label className="field">
                  <span>QR Image URL</span>
                  <input
                    name="qr_image_url"
                    value={methodForm.qr_image_url}
                    onChange={handleMethodChange}
                    placeholder="https://.../qr.png"
                  />
                </label>

                <label className="field">
                  <span>Display Position</span>
                  <input
                    name="position"
                    type="number"
                    min="0"
                    value={methodForm.position}
                    onChange={handleMethodChange}
                  />
                </label>
              </div>

              <label className="field" style={{ marginTop: "14px" }}>
                <span>Payment Instructions</span>
                <textarea
                  name="instructions"
                  value={methodForm.instructions}
                  onChange={handleMethodChange}
                  placeholder="Tell users how to make the payment and what transaction details they should submit."
                  rows="4"
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "14px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="is_active"
                  checked={methodForm.is_active}
                  onChange={handleMethodChange}
                />
                <span>Active — show this payment method to users</span>
              </label>

              {methodForm.qr_image_url && (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ marginBottom: "8px", opacity: 0.75 }}>QR Preview</p>
                  <img
                    src={methodForm.qr_image_url}
                    alt="Payment QR preview"
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "contain",
                      borderRadius: "12px",
                      background: "#fff",
                      padding: "8px",
                    }}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
                <button className="primary-btn" type="submit" disabled={methodSaving}>
                  {methodSaving ? "Saving..." : editingMethodId ? "Update Method" : "Add Method"}
                </button>
                {editingMethodId && (
                  <button className="secondary-btn" type="button" onClick={resetMethodForm}>
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h2>Saved Payment Methods</h2>
                <p>These methods are stored in Supabase and can be enabled or disabled anytime.</p>
              </div>
              <button
                className="secondary-btn"
                type="button"
                onClick={loadPaymentMethods}
                disabled={methodsLoading}
              >
                {methodsLoading ? "Loading..." : "↻ Refresh"}
              </button>
            </div>

            {methodsLoading && paymentMethods.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">…</div>
                <h3>Loading Payment Methods</h3>
                <p>Please wait.</p>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">▣</div>
                <h3>No Payment Methods</h3>
                <p>Add your first UPI or bank payment method above.</p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "14px",
                }}
              >
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    style={{
                      padding: "16px",
                      borderRadius: "14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{method.name}</h3>
                        <p style={{ margin: "5px 0 0", opacity: 0.65, textTransform: "uppercase", fontSize: "12px" }}>
                          {method.type || "upi"}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: "5px 9px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          background: method.is_active ? "rgba(70,220,130,0.12)" : "rgba(255,255,255,0.08)",
                        }}
                      >
                        {method.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {method.qr_image_url && (
                      <img
                        src={method.qr_image_url}
                        alt={`${method.name} QR`}
                        style={{
                          display: "block",
                          width: "150px",
                          height: "150px",
                          objectFit: "contain",
                          background: "#fff",
                          padding: "7px",
                          borderRadius: "10px",
                          margin: "14px auto",
                        }}
                      />
                    )}

                    <div style={{ fontSize: "13px", lineHeight: 1.7, opacity: 0.82 }}>
                      {method.upi_id && <div><strong>UPI:</strong> {method.upi_id}</div>}
                      {method.account_name && <div><strong>Account:</strong> {method.account_name}</div>}
                      {method.account_number && <div><strong>A/C:</strong> {method.account_number}</div>}
                      {method.ifsc_code && <div><strong>IFSC:</strong> {method.ifsc_code}</div>}
                      <div><strong>Position:</strong> {method.position ?? 0}</div>
                    </div>

                    {method.instructions && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "10px",
                          borderRadius: "9px",
                          background: "rgba(255,255,255,0.04)",
                          whiteSpace: "pre-wrap",
                          fontSize: "13px",
                        }}
                      >
                        {method.instructions}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
                      <button className="secondary-btn" type="button" onClick={() => editPaymentMethod(method)}>
                        Edit
                      </button>
                      <button className="secondary-btn" type="button" onClick={() => togglePaymentMethod(method)}>
                        {method.is_active ? "Disable" : "Enable"}
                      </button>
                      <button className="danger-btn" type="button" onClick={() => deletePaymentMethod(method)}>
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
              <p>Basic payment-panel information.</p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <strong>Database Status</strong>
              <p style={{ opacity: 0.7, marginTop: "6px" }}>
                Connected through Supabase.
              </p>
            </div>

            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <strong>Admin Approval</strong>
              <p style={{ opacity: 0.7, marginTop: "6px" }}>
                Pending deposits can be approved or rejected from this panel.
              </p>
            </div>

            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <strong>Balance Update</strong>
              <p style={{ opacity: 0.7, marginTop: "6px" }}>
                Approved deposits add the payment amount to the linked user
                balance.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

function InventoryItem({ title, value, description }) {
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

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button>Manage →</button>
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

function EmptyPaymentState({ title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">₹</div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

export default App;
