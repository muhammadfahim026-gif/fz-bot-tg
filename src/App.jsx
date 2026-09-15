import { useState } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const pageInfo = {
    dashboard: {
      title: "Dashboard",
      subtitle: "FZ BOT TG ka complete overview",
    },
    bot: {
      title: "Bot Controller",
      subtitle: "Apne Telegram bot ko ek jagah se manage karo",
    },
    products: {
      title: "Products",
      subtitle: "Apne products, prices, keys aur offers manage karo",
    },
    payments: {
      title: "Payments & Settings",
      subtitle: "Payments, Premium aur panel settings manage karo",
    },
  };

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="logo-area">
          <div className="logo-box">FZ</div>

          <div>
            <h2>FZ BOT TG</h2>
            <span>CONTROL PANEL</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            className={`nav-btn ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            <span>🏠</span>
            Dashboard
          </button>

          <button
            className={`nav-btn ${
              activePage === "bot" ? "active" : ""
            }`}
            onClick={() => setActivePage("bot")}
          >
            <span>🤖</span>
            Bot Controller
          </button>

          <button
            className={`nav-btn ${
              activePage === "products" ? "active" : ""
            }`}
            onClick={() => setActivePage("products")}
          >
            <span>📦</span>
            Products
          </button>

          <button
            className={`nav-btn ${
              activePage === "payments" ? "active" : ""
            }`}
            onClick={() => setActivePage("payments")}
          >
            <span>💳</span>
            Payments & Settings
          </button>

        </nav>

        <div className="sidebar-status">
          <span className="status-dot"></span>

          <div>
            <strong>FZ BOT TG</strong>
            <small>System Online</small>
          </div>
        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="main-content">

        <header className="topbar">

          <div>
            <h1>{pageInfo[activePage].title}</h1>

            <p>
              {pageInfo[activePage].subtitle}
            </p>
          </div>

          <div className="admin-area">

            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <small>Owner</small>
            </div>

          </div>

        </header>


        {/* ================= PAGES ================= */}

        {activePage === "dashboard" && <Dashboard />}

        {activePage === "bot" && <BotController />}

        {activePage === "products" && <Products />}

        {activePage === "payments" && <Payments />}

      </main>

    </div>
  );
}


/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {
  return (
    <div className="page">

      <section className="hero-card">

        <div className="hero-content">

          <span className="hero-label">
            FZ BOT TG
          </span>

          <h2>
            Control your Telegram
            <br />
            business from one place.
          </h2>

          <p>
            Users, products, keys, sales, payments
            aur Telegram bot ko ek hi panel se manage karo.
          </p>

        </div>

        <div className="revenue-box">

          <span>Total Revenue</span>

          <strong>₹0</strong>

          <small>
            +0% this month
          </small>

        </div>

      </section>


      <section className="stats-grid">

        <StatCard
          icon="👥"
          title="Total Users"
          value="0"
        />

        <StatCard
          icon="💰"
          title="Today's Sales"
          value="₹0"
        />

        <StatCard
          icon="📊"
          title="Monthly Sales"
          value="₹0"
        />

        <StatCard
          icon="📅"
          title="Yearly Sales"
          value="₹0"
        />

        <StatCard
          icon="🔑"
          title="Keys Available"
          value="0"
        />

        <StatCard
          icon="🛒"
          title="Keys Sold"
          value="0"
        />

        <StatCard
          icon="💳"
          title="Total Deposits"
          value="₹0"
        />

        <StatCard
          icon="👑"
          title="Premium Users"
          value="0"
        />

      </section>


      <section className="two-column">

        <div className="panel">

          <div className="panel-heading">

            <div>
              <h3>Sales Overview</h3>

              <p>
                Daily, monthly aur yearly sales
              </p>
            </div>

            <select>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>

          </div>

          <div className="chart-area">

            <div className="chart-empty">
              📊 Real sales chart database connect
              hone ke baad yahan dikhega.
            </div>

          </div>

        </div>


        <div className="panel">

          <div className="panel-heading">

            <div>
              <h3>Key Inventory</h3>

              <p>
                Keys ka current overview
              </p>
            </div>

          </div>

          <div className="inventory-grid">

            <InventoryItem
              title="Added"
              value="0"
            />

            <InventoryItem
              title="Sold"
              value="0"
            />

            <InventoryItem
              title="Available"
              value="0"
            />

          </div>

          <div className="inventory-bar">
            <span></span>
          </div>

        </div>

      </section>


      <section className="two-column">

        <ActivityPanel
          title="Recent Users"
          description="FZ BOT TG start karne wale users"
          icon="👥"
          message="No users yet"
        />

        <ActivityPanel
          title="Recent Activity"
          description="Latest purchases, deposits aur actions"
          icon="⚡"
          message="No activity yet"
        />

      </section>

    </div>
  );
}


/* =====================================================
   BOT CONTROLLER
===================================================== */

function BotController() {
  return (
    <div className="page">

      <div className="section-header">

        <div>
          <h2>🤖 Bot Controller</h2>

          <p>
            Telegram bot ke saare controls yahan manage honge.
          </p>
        </div>

        <div className="connection-badge">
          <span></span>
          Bot Connected
        </div>

      </div>


      <div className="feature-grid">

        <FeatureCard
          icon="🔌"
          title="Bot Connection"
          text="Telegram bot ko securely connect aur disconnect karo."
        />

        <FeatureCard
          icon="⚡"
          title="Commands Editor"
          text="Bot commands add, edit, disable aur organize karo."
        />

        <FeatureCard
          icon="🔘"
          title="Button Editor"
          text="Inline aur reply buttons create aur customize karo."
        />

        <FeatureCard
          icon="📝"
          title="Message Editor"
          text="Welcome, purchase aur other bot messages edit karo."
        />

        <FeatureCard
          icon="🎬"
          title="Video Ads"
          text="Promotional video ads aur advertisement messages manage karo."
        />

        <FeatureCard
          icon="📱"
          title="Payment QR Generator"
          text="Payment QR aur payment instructions manage karo."
        />

        <FeatureCard
          icon="🎧"
          title="Support System"
          text="Users ke support requests aur tickets manage karo."
        />

        <FeatureCard
          icon="👁️"
          title="Live Preview"
          text="Bot message publish karne se pehle preview dekho."
        />

      </div>


      <div className="panel bot-tools">

        <h3>Bot Quick Controls</h3>

        <div className="quick-buttons">

          <button>▶ Start Bot</button>

          <button>⏸ Pause Bot</button>

          <button>🔄 Sync Commands</button>

          <button>🧪 Test Message</button>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   PRODUCTS
===================================================== */

function Products() {

  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    duration: "Custom",
    stock: "",
    offer: false,
    offerPrice: "",
  });


  function updateForm(field, value) {
    setForm({
      ...form,
      [field]: value,
    });
  }


  function createProduct() {

    if (!form.name.trim()) {
      alert("Product name enter karo.");
      return;
    }

    const newProduct = {
      ...form,
      id: Date.now(),
    };

    setProducts([
      ...products,
      newProduct,
    ]);

    setForm({
      name: "",
      category: "",
      description: "",
      price: "",
      duration: "Custom",
      stock: "",
      offer: false,
      offerPrice: "",
    });

    setShowForm(false);
  }


  function deleteProduct(id) {

    const confirmed = window.confirm(
      "Kya tum ye product delete karna chahte ho?"
    );

    if (!confirmed) return;

    setProducts(
      products.filter(
        (product) => product.id !== id
      )
    );
  }


  return (
    <div className="page">

      <div className="section-header">

        <div>
          <h2>📦 Products</h2>

          <p>
            Jo products tum sell karna chaho,
            unhe yahan se create aur manage karo.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Product
        </button>

      </div>


      {/* ADD PRODUCT */}

      {showForm && (

        <div className="panel product-form">

          <div className="form-title">

            <div>
              <h3>➕ Create New Product</h3>

              <p>
                Apne product ki information enter karo.
              </p>
            </div>

            <button
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

          </div>


          <div className="form-grid">

            <FormInput
              label="Product Name"
              placeholder="Example: My Product"
              value={form.name}
              onChange={(value) =>
                updateForm("name", value)
              }
            />

            <FormInput
              label="Category"
              placeholder="Example: Gaming"
              value={form.category}
              onChange={(value) =>
                updateForm("category", value)
              }
            />

            <div className="form-field full">

              <label>Description</label>

              <textarea
                placeholder="Product description..."
                value={form.description}
                onChange={(e) =>
                  updateForm(
                    "description",
                    e.target.value
                  )
                }
              />

            </div>


            <FormInput
              label="Price ₹"
              type="number"
              placeholder="0"
              value={form.price}
              onChange={(value) =>
                updateForm("price", value)
              }
            />


            <div className="form-field">

              <label>Duration</label>

              <select
                value={form.duration}
                onChange={(e) =>
                  updateForm(
                    "duration",
                    e.target.value
                  )
                }
              >
                <option>Custom</option>
                <option>1 Day</option>
                <option>2 Days</option>
                <option>3 Days</option>
                <option>7 Days</option>
                <option>15 Days</option>
                <option>30 Days</option>
                <option>Lifetime</option>
              </select>

            </div>


            <FormInput
              label="Stock"
              type="number"
              placeholder="0"
              value={form.stock}
              onChange={(value) =>
                updateForm("stock", value)
              }
            />


            <div className="form-field">

              <label>Offer</label>

              <button
                type="button"
                className={`toggle ${
                  form.offer ? "on" : ""
                }`}
                onClick={() =>
                  updateForm(
                    "offer",
                    !form.offer
                  )
                }
              >
                <span></span>
              </button>

              <small>
                {form.offer
                  ? "Offer Enabled"
                  : "Offer Disabled"}
              </small>

            </div>


            {form.offer && (

              <FormInput
                label="Offer Price ₹"
                type="number"
                placeholder="0"
                value={form.offerPrice}
                onChange={(value) =>
                  updateForm(
                    "offerPrice",
                    value
                  )
                }
              />

            )}

          </div>


          <div className="form-actions">

            <button
              className="secondary-btn"
              onClick={() =>
                setShowForm(false)
              }
            >
              Cancel
            </button>

            <button
              className="primary-btn"
              onClick={createProduct}
            >
              ✓ Create Product
            </button>

          </div>

        </div>
      )}


      {/* PRODUCT LIST */}

      <div className="products-area">

        <div className="products-heading">

          <div>
            <h3>Your Products</h3>

            <span>
              {products.length} product
              {products.length === 1 ? "" : "s"}
            </span>
          </div>

        </div>


        {products.length === 0 ? (

          <div className="panel empty-products">

            <div className="empty-box-icon">
              📦
            </div>

            <h3>
              No Products Added
            </h3>

            <p>
              Abhi koi product create nahi hua.
              Apna first product add karo.
            </p>

            <button
              className="primary-btn"
              onClick={() =>
                setShowForm(true)
              }
            >
              + Add Your First Product
            </button>

          </div>

        ) : (

          <div className="product-list">

            {products.map((product) => (

              <div
                className="product-item"
                key={product.id}
              >

                <div className="product-top">

                  <div className="product-icon">
                    📦
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteProduct(product.id)
                    }
                  >
                    🗑️
                  </button>

                </div>


                <h3>
                  {product.name}
                </h3>


                {product.category && (
                  <span className="category">
                    {product.category}
                  </span>
                )}


                {product.description && (
                  <p className="description">
                    {product.description}
                  </p>
                )}


                <div className="product-details">

                  <div>
                    <span>Price</span>

                    <strong>
                      ₹
                      {product.offer &&
                      product.offerPrice
                        ? product.offerPrice
                        : product.price || "0"}
                    </strong>
                  </div>

                  <div>
                    <span>Duration</span>

                    <strong>
                      {product.duration}
                    </strong>
                  </div>

                  <div>
                    <span>Stock</span>

                    <strong>
                      {product.stock || "0"}
                    </strong>
                  </div>

                </div>


                {product.offer && (
                  <div className="offer-label">
                    🎁 Offer Active
                  </div>
                )}


                <div className="product-actions">

                  <button>
                    ✏️ Edit
                  </button>

                  <button>
                    🔑 Manage Keys
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}


/* =====================================================
   PAYMENTS & SETTINGS
===================================================== */

function Payments() {

  const [section, setSection] = useState("payments");

  return (
    <div className="page">

      <div className="section-header">

        <div>
          <h2>💳 Payments & Settings</h2>

          <p>
            Payments, Premium aur panel settings.
          </p>
        </div>

      </div>


      <div className="settings-tabs">

        <button
          className={
            section === "payments"
              ? "selected"
              : ""
          }
          onClick={() =>
            setSection("payments")
          }
        >
          💳 Payments
        </button>

        <button
          className={
            section === "transactions"
              ? "selected"
              : ""
          }
          onClick={() =>
            setSection("transactions")
          }
        >
          🧾 Transactions
        </button>

        <button
          className={
            section === "premium"
              ? "selected"
              : ""
          }
          onClick={() =>
            setSection("premium")
          }
        >
          ⭐ Premium
        </button>

        <button
          className={
            section === "security"
              ? "selected"
              : ""
          }
          onClick={() =>
            setSection("security")
          }
        >
          🔐 Security
        </button>

        <button
          className={
            section === "general"
              ? "selected"
              : ""
          }
          onClick={() =>
            setSection("general")
          }
        >
          ⚙️ General
        </button>

      </div>


      {section === "payments" && (

        <div className="settings-grid">

          <FeatureCard
            icon="💰"
            title="Deposits"
            text="Users ke deposits aur received payments."
          />

          <FeatureCard
            icon="📱"
            title="Payment Methods"
            text="Available payment methods manage karo."
          />

          <FeatureCard
            icon="🔳"
            title="QR Generator"
            text="Payment ke liye QR generate aur manage karo."
          />

          <FeatureCard
            icon="💸"
            title="Withdrawal"
            text="Withdrawal related settings manage karo."
          />

        </div>

      )}


      {section === "transactions" && (

        <div className="panel empty-section">

          <div>🧾</div>

          <h3>
            Transaction History
          </h3>

          <p>
            Real database connect hone ke baad
            complete transaction history yahan aayegi.
          </p>

        </div>

      )}


      {section === "premium" && (

        <>

          <div className="premium-banner">

            <div>

              <span>
                FZ BOT TG PREMIUM
              </span>

              <h2>
                Advanced Bot Editing
              </h2>

              <p>
                Monthly aur yearly Premium plans
                manage karo.
              </p>

            </div>

            <button className="primary-btn">
              Manage Plans
            </button>

          </div>


          <div className="premium-plans">

            <div className="plan-card">

              <span>MONTHLY</span>

              <h3>
                ₹0
              </h3>

              <p>
                Monthly subscription
              </p>

              <button>
                Configure
              </button>

            </div>


            <div className="plan-card">

              <span>YEARLY</span>

              <h3>
                ₹0
              </h3>

              <p>
                Yearly subscription
              </p>

              <button>
                Configure
              </button>

            </div>

          </div>

        </>

      )}


      {section === "security" && (

        <div className="settings-grid">

          <FeatureCard
            icon="🔐"
            title="Security"
            text="Panel access aur security controls."
          />

          <FeatureCard
            icon="📋"
            title="Audit Logs"
            text="Admin actions ka complete record."
          />

          <FeatureCard
            icon="🛡️"
            title="Access Control"
            text="Admin aur staff permissions manage karo."
          />

          <FeatureCard
            icon="🔔"
            title="Security Alerts"
            text="Important security events ki notifications."
          />

        </div>

      )}


      {section === "general" && (

        <div className="settings-grid">

          <FeatureCard
            icon="⚙️"
            title="General Settings"
            text="Panel name, currency aur basic settings."
          />

          <FeatureCard
            icon="🔔"
            title="Notifications"
            text="Payment aur purchase notifications."
          />

          <FeatureCard
            icon="🎨"
            title="Appearance"
            text="Panel appearance aur visual preferences."
          />

          <FeatureCard
            icon="🖥️"
            title="System Status"
            text="Bot, backend aur database status."
          />

        </div>

      )}

    </div>
  );
}


/* =====================================================
   SMALL COMPONENTS
===================================================== */

function StatCard({ icon, title, value }) {

  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}


function InventoryItem({ title, value }) {

  return (
    <div className="inventory-item">

      <span>{title}</span>

      <strong>{value}</strong>

    </div>
  );
}


function ActivityPanel({
  title,
  description,
  icon,
  message,
}) {

  return (
    <div className="panel">

      <div className="panel-heading">

        <div>
          <h3>{title}</h3>

          <p>{description}</p>
        </div>

      </div>

      <div className="empty-activity">

        <div className="activity-icon">
          {icon}
        </div>

        <strong>{message}</strong>

        <span>
          Real data database connect hone ke
          baad yahan automatically dikhega.
        </span>

      </div>

    </div>
  );
}


function FeatureCard({
  icon,
  title,
  text,
}) {

  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <div className="feature-content">

        <h3>{title}</h3>

        <p>{text}</p>

      </div>

      <span className="feature-arrow">
        →
      </span>

    </div>
  );
}


function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {

  return (
    <div className="form-field">

      <label>{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  );
}


export default App;