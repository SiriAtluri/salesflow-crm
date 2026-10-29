
import { useState } from "react";
import {
  BrowserRouter,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import "./App.css";

const ACCOUNT_KEY = "crm_employee_accounts";
const SESSION_KEY = "crm_logged_in_employee";

const initialCustomers = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com", phone: "9876543210", company: "Sharma Tech", status: "Active" },
  { id: 2, name: "Priya Reddy", email: "priya@example.com", phone: "9876501234", company: "Reddy Solutions", status: "Active" },
  { id: 3, name: "Arjun Kumar", email: "arjun@example.com", phone: "9876512345", company: "AK Enterprises", status: "Inactive" },
];

const initialLeads = [
  { id: 101, name: "Ananya Rao", email: "ananya@example.com", company: "Rao Digital", source: "Website", status: "New" },
  { id: 102, name: "Vikram Singh", email: "vikram@example.com", company: "Singh Industries", source: "Referral", status: "Contacted" },
  { id: 103, name: "Sneha Patel", email: "sneha@example.com", company: "Patel Retail", source: "Social Media", status: "Qualified" },
];

const initialDeals = [
  { id: 201, title: "Website Development", customer: "Rahul Sharma", value: 125000, stage: "Won", date: "2026-10-05" },
  { id: 202, title: "CRM Subscription", customer: "Priya Reddy", value: 85000, stage: "Proposal", date: "2026-10-12" },
  { id: 203, title: "Business Automation", customer: "Arjun Kumar", value: 175000, stage: "Negotiation", date: "2026-10-20" },
  { id: 204, title: "Support Package", customer: "Ananya Rao", value: 45000, stage: "Contacted", date: "2026-10-25" },
  { id: 205, title: "Software License", customer: "Vikram Singh", value: 65000, stage: "Won", date: "2026-10-27" },
];

function readAccounts() {
  try {
    const data = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: "bi-grid-1x2" },
  { label: "Leads", path: "/leads", icon: "bi-person-lines-fill" },
  { label: "Customers", path: "/customers", icon: "bi-people" },
  { label: "Deals", path: "/deals", icon: "bi-briefcase-fill" },
  { label: "Reports", path: "/reports", icon: "bi-bar-chart-line" },
];

function CRMApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [accounts, setAccounts] = useState(readAccounts);
  const [employee, setEmployee] = useState(readSession);
  const [profileOpen, setProfileOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [customers, setCustomers] = useState(initialCustomers);
  const [leads, setLeads] = useState(initialLeads);
  const [deals, setDeals] = useState(initialDeals);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  const [customerForm, setCustomerForm] = useState({
    name: "", email: "", phone: "", company: "", status: "Active",
  });

  const [leadForm, setLeadForm] = useState({
    name: "", email: "", company: "", source: "Website", status: "New",
  });

  const [dealForm, setDealForm] = useState({
    title: "", customer: "", value: "", stage: "New", date: "2026-10-29",
  });

  const isSignup = path === "/signup";
  const isForgot = path === "/forgot-password";
  const validPaths = [
    "/", "/login", "/signup", "/forgot-password",
    "/dashboard", "/leads", "/customers", "/deals", "/reports",
  ];

  function clearAuthFields() {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  }

  function goAuth(page) {
    clearAuthFields();
    setMessage("");
    setMessageType("error");
    navigate(
      page === "signup" ? "/signup" :
      page === "forgot" ? "/forgot-password" : "/login"
    );
  }

  function error(text) {
    setMessage(text);
    setMessageType("error");
  }

  function success(text) {
    setMessage(text);
    setMessageType("success");
  }

  function handleSignup(event) {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      error("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      error("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      error("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      error("Passwords do not match.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      error("This email is already registered. Please log in.");
      return;
    }

    const updated = [
      ...accounts,
      {
        id: Date.now(),
        name: fullName.trim(),
        email: normalizedEmail,
        password,
      },
    ];

    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updated));
      setAccounts(updated);
      clearAuthFields();
      navigate("/login", { replace: true });
      success("Account created successfully! Please log in.");
    } catch {
      error("Could not save the account in this browser.");
    }
  }

  function handleLogin(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find(
      (item) => item.email === normalizedEmail && item.password === password
    );

    if (!normalizedEmail || !password) {
      error("Please enter your email and password.");
      return;
    }
    if (!account) {
      error("Invalid email or password. Please try again.");
      return;
    }

    const session = {
      id: account.id,
      name: account.name,
      email: account.email,
    };

    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setEmployee(session);
      clearAuthFields();
      setMessage("");
      navigate("/dashboard", { replace: true });
    } catch {
      error("Could not save your session in this browser.");
    }
  }

  function handleForgotPassword(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirmPassword) {
      error("Enter your registered email and both password fields.");
      return;
    }
    if (password.length < 6) {
      error("Your new password must contain at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      error("Passwords do not match.");
      return;
    }
    if (!accounts.some((item) => item.email === normalizedEmail)) {
      error("No account found with this email address.");
      return;
    }

    const updated = accounts.map((item) =>
      item.email === normalizedEmail ? { ...item, password } : item
    );

    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updated));
      setAccounts(updated);
      clearAuthFields();
      navigate("/login", { replace: true });
      success("Password reset successfully! Please log in.");
    } catch {
      error("Could not update the password in this browser.");
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setEmployee(null);
    setSearch("");
    setShowForm(false);
    setNotice("");
    clearAuthFields();
    navigate("/login", { replace: true });
  }

  function addCustomer(event) {
    event.preventDefault();
    if (!customerForm.name.trim() || !customerForm.email.trim() || !customerForm.phone.trim()) {
      return;
    }

    setCustomers((items) => [
      ...items,
      {
        ...customerForm,
        id: Date.now(),
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
        company: customerForm.company.trim() || "Not specified",
      },
    ]);

    setCustomerForm({ name: "", email: "", phone: "", company: "", status: "Active" });
    setShowForm(false);
    setNotice("Customer added successfully.");
  }

  function addLead(event) {
    event.preventDefault();
    if (!leadForm.name.trim() || !leadForm.email.trim()) return;

    setLeads((items) => [
      ...items,
      { ...leadForm, id: Date.now(), name: leadForm.name.trim(), email: leadForm.email.trim() },
    ]);
    setLeadForm({ name: "", email: "", company: "", source: "Website", status: "New" });
    setShowForm(false);
    setNotice("Lead added successfully.");
  }

  function addDeal(event) {
    event.preventDefault();
    if (!dealForm.title.trim() || !dealForm.customer.trim() || Number(dealForm.value) <= 0) {
      return;
    }

    setDeals((items) => [
      ...items,
      {
        ...dealForm,
        id: Date.now(),
        title: dealForm.title.trim(),
        customer: dealForm.customer.trim(),
        value: Number(dealForm.value),
      },
    ]);
    setDealForm({ title: "", customer: "", value: "", stage: "New", date: "2026-10-29" });
    setShowForm(false);
    setNotice("Deal added successfully.");
  }

  function removeRecord(type, id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    if (type === "customers") setCustomers((items) => items.filter((item) => item.id !== id));
    if (type === "leads") setLeads((items) => items.filter((item) => item.id !== id));
    if (type === "deals") setDeals((items) => items.filter((item) => item.id !== id));
    setNotice("Record deleted.");
  }

  function updateDealStage(id, stage) {
    setDeals((items) =>
      items.map((item) => item.id === id ? { ...item, stage } : item)
    );
  }

  if (!employee && !["/", "/login", "/signup", "/forgot-password"].includes(path)) {
    return <Navigate to="/login" replace />;
  }

  if (employee && !navigation.some((item) => item.path === path)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!employee) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-logo"><i className="bi bi-graph-up-arrow" /></div>
          <h1>{isSignup ? "Create Account" : isForgot ? "Reset Password" : "Welcome Back!"}</h1>
          <p className="auth-subtitle">
            {isSignup ? "Create your employee account" : isForgot ? "Choose a new password" : "Sign in to your Sales CRM"}
          </p>

          {message && <div className={`auth-message ${messageType}`} role="alert">{message}</div>}

          <form className="auth-form" onSubmit={isSignup ? handleSignup : isForgot ? handleForgotPassword : handleLogin}>
            {isSignup && (
              <div className="auth-field">
                <label htmlFor="fullName">Full Name</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-person" />
                  <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" autoComplete="name" required />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrap">
                <i className="bi bi-envelope" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" autoComplete="email" required />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">{isForgot ? "New Password" : "Password"}</label>
              <div className="auth-input-wrap">
                <i className="bi bi-lock" />
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSignup || isForgot ? "At least 6 characters" : "Enter your password"} autoComplete={isSignup || isForgot ? "new-password" : "current-password"} required />
                <button type="button" className="auth-eye" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            {(isSignup || isForgot) && (
              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="auth-input-wrap">
                  <i className="bi bi-shield-lock" />
                  <input id="confirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Enter the password again" autoComplete="new-password" required />
                </div>
              </div>
            )}

            {!isSignup && !isForgot && (
              <div className="forgot-password-row">
                <button type="button" onClick={() => goAuth("forgot")}>Forgot Password?</button>
              </div>
            )}

            <button className="auth-submit" type="submit">
              {isSignup ? "Create Account" : isForgot ? "Reset Password" : "Login"}
              <i className="bi bi-arrow-right" />
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? "Already have an account?" : isForgot ? "Remember your password?" : "Don't have an account yet?"}{" "}
            <button type="button" onClick={() => goAuth(isSignup || isForgot ? "login" : "signup")}>
              {isSignup || isForgot ? "Log in" : "Sign up"}
            </button>
          </p>
          <p className="auth-footer">Sales CRM Management System</p>
        </section>
      </main>
    );
  }

  const revenue = deals.filter((deal) => deal.stage === "Won").reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter((deal) => deal.stage === "Won").length;
  const openDeals = deals.filter((deal) => !["Won", "Lost"].includes(deal.stage));
  const pipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);
  const qualifiedLeads = leads.filter((lead) => lead.status === "Qualified").length;

  const filteredCustomers = customers.filter((item) =>
    `${item.name} ${item.email} ${item.phone} ${item.company}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredLeads = leads.filter((item) =>
    `${item.name} ${item.email} ${item.company} ${item.source} ${item.status}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDeals = deals.filter((item) =>
    `${item.title} ${item.customer} ${item.stage}`.toLowerCase().includes(search.toLowerCase())
  );

  const pageTitle = navigation.find((item) => item.path === path)?.label || "Dashboard";

  const monthlySales = [
    { month: "May", value: 38 },
    { month: "Jun", value: 55 },
    { month: "Jul", value: 45 },
    { month: "Aug", value: 70 },
    { month: "Sep", value: 62 },
    { month: "Oct", value: 90 },
  ];

  return (
    <div className="crm-layout">
      <aside className="crm-sidebar">
        <div className="crm-brand">
          <div className="brand-mark"><i className="bi bi-graph-up-arrow" /></div>
          <span>Sales<span className="brand-light">Flow</span></span>
        </div>

        <p className="crm-nav-label">WORKSPACE</p>
        <nav className="crm-navigation">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.path}
              className={`crm-nav-item ${path === item.path ? "selected" : ""}`}
              onClick={() => {
                setSearch("");
                setShowForm(false);
                setNotice("");
                navigate(item.path);
              }}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
              {item.path === "/leads" && <span className="nav-count">{leads.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-help">
          <div className="help-icon"><i className="bi bi-lightbulb" /></div>
          <strong>Sales tip</strong>
          <p>Follow up with qualified leads to improve your conversion rate.</p>
        </div>

        <div className="crm-sidebar-bottom">
          <div className="crm-user">
            <div className="crm-avatar">{employee.name.charAt(0).toUpperCase()}</div>
            <div className="crm-user-info">
              <strong>{employee.name}</strong>
              <span>Sales employee</span>
            </div>
          </div>
          <button className="crm-logout" onClick={logout}>
            <i className="bi bi-box-arrow-left" /> Logout
          </button>
        </div>
      </aside>

      <main className="crm-main">
        <header className="crm-topbar">
          <div>
            <div className="breadcrumb">Workspace <i className="bi bi-chevron-right" /> {pageTitle}</div>
            <h1>{pageTitle}</h1>
            <p>{path === "/dashboard" ? `Welcome back, ${employee.name}. Here's your sales overview.` : `Manage your ${pageTitle.toLowerCase()} in one place.`}</p>
          </div>
          <div className="topbar-actions">
            <div className="topbar-date"><i className="bi bi-calendar3" /> October 2026</div>
            <div className="profile-menu">
  <button
    className="topbar-avatar"
    onClick={() => setProfileOpen(!profileOpen)}
    aria-label="Open profile menu"
  >
    {employee.name.charAt(0).toUpperCase()}
  </button>

  {profileOpen && (
    <div className="profile-dropdown">
      <strong>{employee.name}</strong>
      <span>Sales employee</span>

      <button onClick={logout} className="profile-logout">
        <i className="bi bi-box-arrow-left" /> Logout
      </button>
    </div>
  )}
</div>
          </div>
        </header>

        {notice && (
          <div className="crm-notice">
            <i className="bi bi-check-circle-fill" /> {notice}
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice"><i className="bi bi-x-lg" /></button>
          </div>
        )}

        {path === "/dashboard" && (
          <>
            <section className="welcome-banner">
              <div>
                <span className="welcome-eyebrow">SALES OVERVIEW</span>
                <h2>Turn opportunities into revenue.</h2>
                <p>Track your sales performance and keep every deal moving forward.</p>
                <button className="banner-button" onClick={() => navigate("/deals")}>
                  View all deals <i className="bi bi-arrow-up-right" />
                </button>
              </div>
              <div className="banner-art"><i className="bi bi-bar-chart-line-fill" /><span className="art-dot dot-one" /><span className="art-dot dot-two" /><span className="art-dot dot-three" /></div>
            </section>

            <section className="crm-stats">
              <div className="crm-stat-card">
                <div className="stat-top"><span>Total Revenue</span><span className="stat-icon blue"><i className="bi bi-currency-rupee" /></span></div>
                <h2>{money(revenue)}</h2>
                <div className="stat-foot"><span className="stat-positive"><i className="bi bi-arrow-up-right" /> {wonDeals} won deals</span><span>Revenue closed</span></div>
              </div>
              <div className="crm-stat-card">
                <div className="stat-top"><span>Open Pipeline</span><span className="stat-icon purple"><i className="bi bi-funnel" /></span></div>
                <h2>{money(pipelineValue)}</h2>
                <div className="stat-foot"><span>{openDeals.length} open deals</span><span>Potential value</span></div>
              </div>
              <div className="crm-stat-card">
                <div className="stat-top"><span>Total Leads</span><span className="stat-icon orange"><i className="bi bi-person-plus" /></span></div>
                <h2>{leads.length}</h2>
                <div className="stat-foot"><span>{qualifiedLeads} qualified</span><span>Lead generation</span></div>
              </div>
              <div className="crm-stat-card">
                <div className="stat-top"><span>Customers</span><span className="stat-icon green"><i className="bi bi-people" /></span></div>
                <h2>{customers.length}</h2>
                <div className="stat-foot"><span>{customers.filter((c) => c.status === "Active").length} active</span><span>Customer base</span></div>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="content-card sales-chart-card">
                <div className="card-heading">
                  <div><h2>Sales performance</h2><p>Monthly performance overview</p></div>
                  <span className="chart-legend"><i /> Sales index</span>
                </div>
                <div className="chart-total"><strong>{money(revenue)}</strong><span>Closed revenue in demo data</span></div>
                <div className="sales-chart">
                  <div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
                  <div className="chart-bars">
                    {monthlySales.map((item) => (
                      <div className="chart-column" key={item.month}>
                        <div className="bar-track"><div className={`chart-bar ${item.month === "Oct" ? "bar-highlight" : ""}`} style={{ height: `${item.value}%` }} title={`${item.month}: ${item.value}`} /></div>
                        <span>{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="chart-note"><i className="bi bi-info-circle" /> Sample performance index for demonstration.</p>
              </div>

              <div className="content-card pipeline-card">
                <div className="card-heading"><div><h2>Sales pipeline</h2><p>Deals by stage</p></div><button className="text-link" onClick={() => navigate("/deals")}>View deals <i className="bi bi-arrow-right" /></button></div>
                {["New", "Contacted", "Proposal", "Negotiation", "Won"].map((stage) => {
                  const count = deals.filter((deal) => deal.stage === stage).length;
                  const total = Math.max(deals.length, 1);
                  return (
                    <div className="pipeline-row" key={stage}>
                      <div className="pipeline-label"><span>{stage}</span><strong>{count}</strong></div>
                      <div className="pipeline-track"><div className={`pipeline-fill stage-${stage.toLowerCase()}`} style={{ width: `${(count / total) * 100}%` }} /></div>
                    </div>
                  );
                })}
                <div className="pipeline-footer"><span>Total deals</span><strong>{deals.length}</strong></div>
              </div>
            </section>

            <section className="content-card recent-deals-card">
              <div className="card-heading">
                <div><h2>Recent deals</h2><p>Keep an eye on your latest opportunities</p></div>
                <button className="text-link" onClick={() => navigate("/deals")}>View all deals <i className="bi bi-arrow-right" /></button>
              </div>
              <div className="table-wrap">
                <table className="crm-table">
                  <thead><tr><th>Deal name</th><th>Customer</th><th>Value</th><th>Stage</th><th>Expected date</th></tr></thead>
                  <tbody>
                    {[...deals].slice(-4).reverse().map((deal) => (
                      <tr key={deal.id}>
                        <td><div className="deal-name-cell"><span className="deal-symbol"><i className="bi bi-briefcase" /></span><strong>{deal.title}</strong></div></td>
                        <td>{deal.customer}</td>
                        <td className="money-cell">{money(deal.value)}</td>
                        <td><span className={`crm-status status-${deal.stage.toLowerCase()}`}>{deal.stage}</span></td>
                        <td>{deal.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {(path === "/customers" || path === "/leads" || path === "/deals") && (
          <section className="content-card records-card">
            <div className="card-heading records-heading">
              <div>
                <h2>{path === "/customers" ? "Customer directory" : path === "/leads" ? "Lead management" : "Deal management"}</h2>
                <p>
                  {path === "/customers" ? "Maintain your customer information." : path === "/leads" ? "Track prospects from first contact to qualification." : "Manage opportunities and track their sales stages."}
                </p>
              </div>
              <button className="primary-button" onClick={() => { setShowForm((v) => !v); setNotice(""); }}>
                <i className={`bi ${showForm ? "bi-x-lg" : "bi-plus-lg"}`} /> {showForm ? "Cancel" : path === "/customers" ? "Add Customer" : path === "/leads" ? "Add Lead" : "Add Deal"}
              </button>
            </div>

            {showForm && path === "/customers" && (
              <form className="record-form" onSubmit={addCustomer}>
                <label>Full name<input value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} placeholder="Customer name" required /></label>
                <label>Email<input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} placeholder="name@company.com" required /></label>
                <label>Phone<input type="tel" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="Phone number" required /></label>
                <label>Company<input value={customerForm.company} onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })} placeholder="Company name" /></label>
                <label>Status<select value={customerForm.status} onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label>
                <button className="primary-button" type="submit">Save customer</button>
              </form>
            )}

            {showForm && path === "/leads" && (
              <form className="record-form" onSubmit={addLead}>
                <label>Lead name<input value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="Lead name" required /></label>
                <label>Email<input type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="name@company.com" required /></label>
                <label>Company<input value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} placeholder="Company name" /></label>
                <label>Source<select value={leadForm.source} onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}><option>Website</option><option>Referral</option><option>Social Media</option><option>Advertisement</option><option>Cold Call</option></select></label>
                <label>Status<select value={leadForm.status} onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}><option>New</option><option>Contacted</option><option>Qualified</option></select></label>
                <button className="primary-button" type="submit">Save lead</button>
              </form>
            )}

            {showForm && path === "/deals" && (
              <form className="record-form" onSubmit={addDeal}>
                <label>Deal name<input value={dealForm.title} onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })} placeholder="e.g. Software subscription" required /></label>
                <label>Customer<input value={dealForm.customer} onChange={(e) => setDealForm({ ...dealForm, customer: e.target.value })} placeholder="Customer name" required /></label>
                <label>Deal value (₹)<input type="number" min="1" value={dealForm.value} onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })} placeholder="50000" required /></label>
                <label>Stage<select value={dealForm.stage} onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}>{["New", "Contacted", "Proposal", "Negotiation", "Won", "Lost"].map((stage) => <option key={stage}>{stage}</option>)}</select></label>
                <label>Expected date<input type="date" value={dealForm.date} onChange={(e) => setDealForm({ ...dealForm, date: e.target.value })} required /></label>
                <button className="primary-button" type="submit">Save deal</button>
              </form>
            )}

            <div className="records-toolbar">
              <div className="crm-search">
                <i className="bi bi-search" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${pageTitle.toLowerCase()}...`} />
              </div>
              <span className="record-count">
                {path === "/customers" ? filteredCustomers.length : path === "/leads" ? filteredLeads.length : filteredDeals.length} records
              </span>
            </div>

            <div className="table-wrap">
              {path === "/customers" && (
                <table className="crm-table">
                  <thead><tr><th>Customer</th><th>Company</th><th>Email</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredCustomers.map((item) => (
                      <tr key={item.id}>
                        <td><div className="person-cell"><span className="person-avatar">{item.name.charAt(0)}</span><strong>{item.name}</strong></div></td>
                        <td>{item.company}</td><td>{item.email}</td><td>{item.phone}</td>
                        <td><span className={`crm-status ${item.status === "Active" ? "status-won" : "status-lost"}`}>{item.status}</span></td>
                        <td><button className="icon-button danger" onClick={() => removeRecord("customers", item.id)} title="Delete customer" aria-label={`Delete ${item.name}`}><i className="bi bi-trash" /></button></td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && <tr><td colSpan="6" className="crm-empty">No customers found.</td></tr>}
                  </tbody>
                </table>
              )}

              {path === "/leads" && (
                <table className="crm-table">
                  <thead><tr><th>Lead</th><th>Company</th><th>Email</th><th>Source</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredLeads.map((item) => (
                      <tr key={item.id}>
                        <td><div className="person-cell"><span className="person-avatar">{item.name.charAt(0)}</span><strong>{item.name}</strong></div></td>
                        <td>{item.company || "—"}</td><td>{item.email}</td><td>{item.source}</td>
                        <td>
                          <select className="stage-select" value={item.status} onChange={(e) => setLeads((list) => list.map((lead) => lead.id === item.id ? { ...lead, status: e.target.value } : lead))}>
                            {["New", "Contacted", "Qualified"].map((stage) => <option key={stage}>{stage}</option>)}
                          </select>
                        </td>
                        <td><button className="icon-button danger" onClick={() => removeRecord("leads", item.id)} title="Delete lead" aria-label={`Delete ${item.name}`}><i className="bi bi-trash" /></button></td>
                      </tr>
                    ))}
                    {filteredLeads.length === 0 && <tr><td colSpan="6" className="crm-empty">No leads found.</td></tr>}
                  </tbody>
                </table>
              )}

              {path === "/deals" && (
                <table className="crm-table">
                  <thead><tr><th>Deal</th><th>Customer</th><th>Value</th><th>Stage</th><th>Expected date</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredDeals.map((item) => (
                      <tr key={item.id}>
                        <td><div className="deal-name-cell"><span className="deal-symbol"><i className="bi bi-briefcase" /></span><strong>{item.title}</strong></div></td>
                        <td>{item.customer}</td><td className="money-cell">{money(item.value)}</td>
                        <td>
                          <select className="stage-select" value={item.stage} onChange={(e) => updateDealStage(item.id, e.target.value)}>
                            {["New", "Contacted", "Proposal", "Negotiation", "Won", "Lost"].map((stage) => <option key={stage}>{stage}</option>)}
                          </select>
                        </td>
                        <td>{item.date}</td>
                        <td><button className="icon-button danger" onClick={() => removeRecord("deals", item.id)} title="Delete deal" aria-label={`Delete ${item.title}`}><i className="bi bi-trash" /></button></td>
                      </tr>
                    ))}
                    {filteredDeals.length === 0 && <tr><td colSpan="6" className="crm-empty">No deals found.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {path === "/reports" && (
          <>
            <section className="crm-stats">
              <div className="crm-stat-card"><div className="stat-top"><span>Closed Revenue</span><span className="stat-icon blue"><i className="bi bi-currency-rupee" /></span></div><h2>{money(revenue)}</h2><div className="stat-foot"><span>Won deals</span><strong>{wonDeals}</strong></div></div>
              <div className="crm-stat-card"><div className="stat-top"><span>Pipeline Value</span><span className="stat-icon purple"><i className="bi bi-funnel" /></span></div><h2>{money(pipelineValue)}</h2><div className="stat-foot"><span>Open deals</span><strong>{openDeals.length}</strong></div></div>
              <div className="crm-stat-card"><div className="stat-top"><span>Lead Conversion</span><span className="stat-icon green"><i className="bi bi-person-check" /></span></div><h2>{leads.length ? `${Math.round((qualifiedLeads / leads.length) * 100)}%` : "0%"}</h2><div className="stat-foot"><span>Qualified leads</span><strong>{qualifiedLeads}</strong></div></div>
              <div className="crm-stat-card"><div className="stat-top"><span>Customers</span><span className="stat-icon orange"><i className="bi bi-people" /></span></div><h2>{customers.length}</h2><div className="stat-foot"><span>Active customers</span><strong>{customers.filter((c) => c.status === "Active").length}</strong></div></div>
            </section>
            <section className="content-card report-card">
              <div className="card-heading"><div><h2>Deal stage report</h2><p>Current distribution of sales opportunities</p></div></div>
              {["New", "Contacted", "Proposal", "Negotiation", "Won", "Lost"].map((stage) => {
                const count = deals.filter((deal) => deal.stage === stage).length;
                const percent = deals.length ? Math.round((count / deals.length) * 100) : 0;
                return <div className="report-row" key={stage}><div><span>{stage}</span><strong>{count} deals · {percent}%</strong></div><div className="pipeline-track"><div className={`pipeline-fill stage-${stage.toLowerCase()}`} style={{ width: `${percent}%` }} /></div></div>;
              })}
            </section>
          </>
        )}

        <footer className="crm-footer">
          <span>SalesFlow CRM</span>
          <span>Sales management workspace · Demo data</span>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CRMApp />
    </BrowserRouter>
  );
}
