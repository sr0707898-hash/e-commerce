import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiBell,
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiPlus,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiShoppingCart,
  FiUsers,
  FiX,
} from "react-icons/fi";

const sales = [
  { day: "Mon", value: 62 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 55 },
  { day: "Thu", value: 88 },
  { day: "Fri", value: 72 },
  { day: "Sat", value: 96 },
  { day: "Sun", value: 83 },
];

const defaultOrders = [
  { id: "#GC-1048", customer: "Aarav Sharma", items: "6 items", total: "₹7,000.00", status: "Packed", initials: "AS", color: "bg-orange-100 text-orange-700" },
  { id: "#GC-1047", customer: "Meera Kapoor", items: "3 items", total: "₹3,500.00", status: "Out for delivery", initials: "MK", color: "bg-sky-100 text-sky-700" },
  { id: "#GC-1046", customer: "Kabir Verma", items: "9 items", total: "₹10,500.00", status: "Delivered", initials: "KV", color: "bg-emerald-100 text-emerald-700" },
  { id: "#GC-1045", customer: "Anaya Singh", items: "2 items", total: "₹2,300.00", status: "Processing", initials: "AS", color: "bg-violet-100 text-violet-700" },
];

const inventory = [
  { name: "Organic Avocado", category: "Fruits", stock: 8, max: 40, tone: "bg-red-500" },
  { name: "Greek Yogurt", category: "Dairy", stock: 12, max: 40, tone: "bg-amber-500" },
  { name: "Atlantic Salmon", category: "Seafood", stock: 18, max: 40, tone: "bg-amber-500" },
];

const statusStyles = {
  Packed: "bg-orange-50 text-orange-700",
  "Out for delivery": "bg-sky-50 text-sky-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Processing: "bg-violet-50 text-violet-700",
};

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
const formatINR = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
const formatOrder = (order, index) => ({
  _id: order._id || "",
  id: order.id || `#GC-saved-${index + 1}`,
  customer: order.customer || order.name || "Customer",
  items: `${order.items?.length || 0} items`,
  itemCount: (order.items || []).reduce((count, item) => count + Number(item.quantity || 0), 0),
  totalINR: Number(order.totalINR || 0),
  totalUSD: Number(order.totalUSD || 0),
  total: formatINR(Number(order.totalINR || 0)),
  status: order.status || "Processing",
  initials: (order.customer || "C").split(" ").map((chunk) => chunk[0]).join("").slice(0, 2).toUpperCase(),
  color: "bg-violet-100 text-violet-700",
  address: order.address || "",
  houseNo: order.houseNo || "",
  sectorColony: order.sectorColony || "",
  district: order.district || "",
  state: order.state || "",
  email: order.email || "",
  paymentMethod: order.paymentMethod || "UPI",
});

const getSavedOrders = () => {
  try {
    const savedOrders = JSON.parse(localStorage.getItem("grocify_orders") || "[]");
    return savedOrders.length > 0
      ? savedOrders.map(formatOrder)
      : defaultOrders;
  } catch {
    return defaultOrders;
  }
};

function StatCard({ icon: Icon, label, value, change, positive, accent }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="text-xl" />
        </div>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
          {positive ? <FiArrowUpRight /> : <FiArrowDownRight />} {change}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
    </article>
  );
}

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [range, setRange] = useState("Last 7 days");
  const [activeTab, setActiveTab] = useState("All orders");
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken"));
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const [adminError, setAdminError] = useState("");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentTime] = useState(() => Date.now());
  const [orders, setOrders] = useState(getSavedOrders);
  const totalRevenue = orders.reduce((total, order) => total + Number(order.totalINR || 0), 0);
  const productsSold = orders.reduce((total, order) => total + Number(order.itemCount || 0), 0);
  const dollarPayments = orders.reduce((total, order) => total + Number(order.totalUSD || 0), 0);
  const newUsers = users.filter((user) => user.createdAt && currentTime - new Date(user.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000).length;
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productMessage, setProductMessage] = useState("");
  const [productForm, setProductForm] = useState({ name: "", category: "Fruits", price: "", stock: "", image: "" });

  useEffect(() => {
    if (!adminToken) return;
    const loadAdminData = async () => {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [usersResponse, productsResponse, ordersResponse] = await Promise.all([fetch(`${API_URL}/admin/users`, { headers }), fetch(`${API_URL}/admin/products`, { headers }), fetch(`${API_URL}/admin/orders`, { headers })]);
      if (usersResponse.status === 401 || productsResponse.status === 401 || ordersResponse.status === 401) {
        localStorage.removeItem("adminToken");
        setAdminToken(null);
        return;
      }
      if (!usersResponse.ok || !productsResponse.ok || !ordersResponse.ok) throw new Error("Could not load admin data");
      setUsers((await usersResponse.json()).users);
      setProducts((await productsResponse.json()).products);
      setOrders((await ordersResponse.json()).orders.map(formatOrder));
    };
    loadAdminData().catch(() => setAdminError("Backend server connect nahi ho raha"));
  }, [adminToken]);

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setAdminError("");
    try {
      const response = await fetch(`${API_URL}/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: adminForm.email.trim(), password: adminForm.password.trim() }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setAdminError(data.message);
      localStorage.setItem("adminToken", data.token);
      setAdminToken(data.token);
    } catch {
      setAdminError("Backend server connect nahi ho raha");
    }
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    setAdminError("");
    setProductMessage("");
    setIsSavingProduct(true);
    try {
      const response = await fetch(`${API_URL}/admin/products${editingProduct ? `/${editingProduct._id}` : ""}`, { method: editingProduct ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ ...productForm, image: productForm.image.trim(), price: Number(productForm.price), stock: Number(productForm.stock) }) });
      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        setAdminToken(null);
        return;
      }
      if (!response.ok) return setAdminError(data.message || "Could not add product");
      setProducts((currentProducts) => editingProduct ? currentProducts.map((product) => product._id === data.product._id ? data.product : product) : [data.product, ...currentProducts]);
      setProductForm({ name: "", category: "Fruits", price: "", stock: "", image: "" });
      setEditingProduct(null);
      setShowProductForm(false);
      setProductMessage(`${data.product.name} ${editingProduct ? "updated" : "added"} successfully.`);
    } catch {
      setAdminError("Backend server connect nahi ho raha");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({ name: product.name, category: product.category, price: product.price, stock: product.stock, image: product.image || "" });
    setShowProductForm(true);
  };

  const handleImageFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAdminError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAdminError("Image must be smaller than 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProductForm((currentForm) => ({ ...currentForm, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setAdminError("");
    try {
      const response = await fetch(`${API_URL}/admin/products/${product._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        setAdminToken(null);
        return;
      }
      if (!response.ok) return setAdminError(data.message || "Could not delete product");
      setProducts((currentProducts) => currentProducts.filter((item) => item._id !== product._id));
      setProductMessage(`${product.name} deleted successfully.`);
    } catch {
      setAdminError("Backend server connect nahi ho raha");
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!order._id) {
      const savedOrders = JSON.parse(localStorage.getItem("grocify_orders") || "[]");
      localStorage.setItem("grocify_orders", JSON.stringify(savedOrders.filter((item) => item.id !== order.id)));
      setOrders((currentOrders) => currentOrders.filter((item) => item.id !== order.id));
      setProductMessage(`${order.id} deleted successfully.`);
      return;
    }
    if (!window.confirm(`Delete order ${order.id}?`)) return;
    setAdminError("");
    try {
      const response = await fetch(`${API_URL}/admin/orders/${order.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${adminToken}` } });
      const data = await response.json();
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        setAdminToken(null);
        return;
      }
      if (!response.ok) return setAdminError(data.message || "Could not delete order");
      setOrders((currentOrders) => currentOrders.filter((item) => item.id !== order.id));
      setProductMessage(`${order.id} deleted successfully.`);
    } catch {
      setAdminError("Backend server connect nahi ho raha");
    }
  };

  if (!adminToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#10251f] px-5 py-10">
        <form onSubmit={handleAdminLogin} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">Grocify private area</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Only the authorized store owner can access this panel.</p>
          <label className="mt-7 block text-sm font-semibold text-slate-700">Admin email<input required type="email" value={adminForm.email} onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500" /></label>
          <label className="mt-4 block text-sm font-semibold text-slate-700">Password<input required type="password" value={adminForm.password} onChange={(event) => setAdminForm({ ...adminForm, password: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500" /></label>
          {adminError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{adminError}</p>}
          <button className="mt-6 w-full rounded-xl bg-[#10251f] py-3 font-semibold text-white hover:bg-[#1d4437]">Enter dashboard</button>
          <Link to="/" className="mt-5 block text-center text-sm text-slate-500 hover:text-orange-500">Back to store</Link>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#10251f] px-5 py-6 text-white transition-transform duration-300 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <Link to="/" className="text-2xl font-black tracking-tight">Gr<span className="text-[#f5a623]">O</span>cify</Link>
          <button className="lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu"><FiX /></button>
        </div>
        <p className="mt-10 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/60">Workspace</p>
        <nav className="mt-3 space-y-1">
          <a href="#overview" className="flex items-center gap-3 rounded-xl bg-[#f5a623] px-3 py-3 text-sm font-semibold text-[#10251f]"><FiGrid /> Overview</a>
          <a href="#products" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-50/70 hover:bg-white/10 hover:text-white"><FiPackage /> Products</a>
          <a href="#orders" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-50/70 hover:bg-white/10 hover:text-white"><FiShoppingCart /> Orders</a>
          <a href="#customers" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-50/70 hover:bg-white/10 hover:text-white"><FiUsers /> Customers</a>
        </nav>
        <p className="mt-9 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/60">Manage</p>
        <nav className="mt-3 space-y-1">
          <a href="#inventory" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-50/70 hover:bg-white/10 hover:text-white"><FiShoppingBag /> Inventory</a>
          <a href="#settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-50/70 hover:bg-white/10 hover:text-white"><FiSettings /> Settings</a>
        </nav>
        <div className="mt-auto rounded-2xl bg-white/10 p-4">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5a623] font-bold text-[#10251f]">SR</div><div><p className="text-sm font-semibold">Sumit Ranoliya</p><p className="text-xs text-emerald-100/60">Store manager</p></div></div>
          <button className="mt-4 flex items-center gap-2 text-xs text-emerald-100/70 hover:text-white"><FiLogOut /> Sign out</button>
        </div>
      </aside>

      {menuOpen && <button className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}

      <main className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-slate-200 bg-[#f6f8fb]/90 px-4 py-3 backdrop-blur sm:px-5 md:px-8">
          <div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-white lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><FiMenu /></button><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Monday, 7 September 2026</p><h1 className="mt-1 text-xl font-bold text-slate-950 md:text-2xl">Good morning, Riya</h1></div></div>
          <div className="flex items-center gap-2 md:gap-4"><button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 md:flex"><FiSearch /> Search</button><button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:text-orange-500" aria-label="Notifications"><FiBell /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500" /></button><div className="hidden h-8 w-px bg-slate-200 sm:block" /><div className="hidden text-right sm:block"><p className="text-sm font-semibold">Sumit Ranoliya</p><p className="text-xs text-slate-500">Administrator</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10251f] text-sm font-bold text-white">RK</div></div>
        </header>

        <div id="overview" className="mx-auto max-w-360 space-y-6 p-5 md:p-8">
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm text-slate-500">Here is what is happening with your store today.</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Store overview</h2><p className="mt-1 text-xs text-slate-400">{products.length} products in your private catalog</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setShowProductForm(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm"><FiPlus className="text-orange-500" /> Add product</button><button onClick={() => setRange(range === "Last 7 days" ? "Last 30 days" : "Last 7 days")} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm">{range}<FiChevronDown /></button></div></section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={FiShoppingBag} label="Total revenue (INR)" value={formatINR(totalRevenue)} change="Live" positive accent="bg-orange-100 text-orange-600" /><StatCard icon={FiShoppingCart} label="Total orders" value={orders.length.toLocaleString("en-IN")} change="Live" positive accent="bg-sky-100 text-sky-600" /><StatCard icon={FiUsers} label="New users (30 days)" value={newUsers.toLocaleString("en-IN")} change="Live" positive accent="bg-violet-100 text-violet-600" /><StatCard icon={FiUsers} label="Total users" value={users.length.toLocaleString("en-IN")} change="Live" positive accent="bg-blue-100 text-blue-600" /><StatCard icon={FiPackage} label="Products sold" value={productsSold.toLocaleString("en-IN")} change="Live" positive accent="bg-emerald-100 text-emerald-600" /><StatCard icon={FiPackage} label="Total products" value={products.length.toLocaleString("en-IN")} change="Live" positive accent="bg-cyan-100 text-cyan-600" /><StatCard icon={FiShoppingBag} label="Dollar payments" value={`$${dollarPayments.toFixed(2)}`} change="Live" positive accent="bg-amber-100 text-amber-600" /></section>

          <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23-42,0.04)] md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-950">Revenue overview</h3><p className="mt-1 text-sm text-slate-500">Weekly performance across all channels</p></div><span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">Live</span></div><div className="mt-8 flex h-52 items-end justify-between gap-2 border-b border-slate-100 px-1 pb-0 sm:gap-5">{sales.map((item, index) => <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className={`w-full max-w-10 rounded-t-lg transition-all hover:bg-orange-400 ${index === 5 ? "bg-[#f5a623]" : "bg-orange-100"}`} style={{ height: `${item.value}%` }} title={`${item.day}: ${formatINR(item.value * 100)}`} /><span className="text-xs text-slate-400">{item.day}</span></div>)}</div><div className="mt-5 flex items-center justify-between text-sm"><span className="text-slate-500">Net revenue</span><span className="font-bold text-slate-950">{formatINR(totalRevenue)}</span></div></article>
            <article className="rounded-2xl bg-[#10251f] p-6 text-white shadow-[0_8px_30px_rgba(16,37,31,0.14)]"><div className="flex items-start justify-between"><div><p className="text-sm text-emerald-100/60">Fulfilment health</p><h3 className="mt-1 text-3xl font-bold">92.4%</h3></div><div className="rounded-xl bg-white/10 p-3 text-[#f5a623]"><FiPackage className="text-xl" /></div></div><div className="mt-7 h-2 rounded-full bg-white/10"><div className="h-2 w-[92%] rounded-full bg-[#f5a623]" /></div><div className="mt-3 flex justify-between text-xs text-emerald-100/60"><span>On-time delivery</span><span>Target 90%</span></div><div className="mt-9 grid grid-cols-2 gap-4 border-t border-white/10 pt-5"><div><p className="text-2xl font-bold">18</p><p className="mt-1 text-xs text-emerald-100/60">Open issues</p></div><div><p className="text-2xl font-bold">4.8<span className="text-sm text-[#f5a623]">/5</span></p><p className="mt-1 text-xs text-emerald-100/60">Customer rating</p></div></div></article>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <article id="orders" className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
                <div><h3 className="font-bold text-slate-950">Recent orders</h3><p className="mt-1 text-sm text-slate-500">Orders stay here until you delete them.</p></div>
                <span className="text-sm font-semibold text-slate-500">{orders.length} orders</span>
              </div>
              <div className="flex gap-5 overflow-x-auto px-5 pt-4 text-sm md:px-6">{["All orders", "Processing", "Delivered"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 pb-3 font-medium ${activeTab === tab ? "border-orange-500 text-orange-500" : "border-transparent text-slate-500"}`}>{tab}</button>)}</div>
              <div className="overflow-x-auto"><table className="w-full min-w-190 text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3 font-semibold md:px-6">Order</th><th className="px-3 py-3 font-semibold">Customer</th><th className="px-3 py-3 font-semibold">Total</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{orders.filter(order => activeTab === "All orders" || order.status === activeTab).map(order => <tr key={order.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-800 md:px-6">{order.id}<p className="mt-1 text-xs font-normal text-slate-400">{order.items}</p></td><td className="px-3 py-4"><div className="flex items-center gap-2.5"><span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${order.color}`}>{order.initials}</span><span className="font-medium">{order.customer}</span></div></td><td className="px-3 py-4 font-semibold">{order.total}</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>{order.status}</span></td><td className="px-3 py-4"><button type="button" onClick={() => handleDeleteOrder(order)} className="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button></td></tr>)}</tbody></table></div>
            </article>

            <article id="inventory" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-6"><div className="flex items-start justify-between"><div><h3 className="font-bold text-slate-950">Low stock alert</h3><p className="mt-1 text-sm text-slate-500">Products that need attention</p></div><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">3 items</span></div><div className="mt-6 space-y-5">{inventory.map(item => <div key={item.name}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs text-slate-400">{item.category}</p></div><span className="text-sm font-bold text-red-500">{item.stock} left</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className={`h-1.5 rounded-full ${item.tone}`} style={{ width: `${(item.stock / item.max) * 100}%` }} /></div></div>)}</div><button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:border-orange-300 hover:text-orange-500">Review inventory <FiChevronRight /></button></article>
          </section>

          <section id="products" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-950">Product catalog</h3><p className="mt-1 text-sm text-slate-500">Products added from this dashboard</p></div><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">{products.length} products</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{products.map((product) => <div key={product._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-white">{product.image ? <img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.style.display = "none"; }} className="h-full w-full object-cover" /> : <FiPackage className="text-3xl text-orange-300" />}</div><div className="mt-3 flex items-start justify-between gap-2"><p className="truncate font-semibold text-slate-800">{product.name}</p><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => handleEditProduct(product)} className="text-xs font-semibold text-sky-600 hover:text-sky-700">Edit</button><button type="button" onClick={() => handleDeleteProduct(product)} className="text-xs font-semibold text-red-500 hover:text-red-700">Delete</button></div></div><p className="mt-1 text-xs text-slate-500">{product.category}</p><div className="mt-2 flex justify-between text-sm"><span className="font-bold text-slate-900">${Number(product.price).toFixed(2)}</span><span className="text-slate-500">{product.stock} in stock</span></div></div>)}{products.length === 0 && <p className="text-sm text-slate-400">No products added yet.</p>}</div>{adminError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{adminError}</p>}</section>

          <section id="customers" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-950">Registered customers</h3><p className="mt-1 text-sm text-slate-500">Users who have created an account in your store</p></div><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-600">{users.length} users</span></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{users.slice(0, 6).map((user) => <div key={user._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="font-semibold text-slate-800">{user.name}</p><p className="mt-1 text-xs text-slate-500">{user.email}</p><p className="mt-1 text-xs text-slate-400">@{user.username}</p></div>)}{users.length === 0 && <p className="text-sm text-slate-400">No registered users yet.</p>}</div></section>

          <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-orange-100 p-5 sm:flex-row sm:items-center md:p-6"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-500"><FiHelpCircle className="text-xl" /></div><div><h3 className="font-bold text-slate-950">Need a hand with your store?</h3><p className="mt-1 text-sm text-slate-600">Your private store workspace is ready.</p></div></div><button onClick={() => { localStorage.removeItem("adminToken"); setAdminToken(null); }} className="rounded-xl bg-[#10251f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4437]">Sign out</button></section>
        </div>
      </main>
      {productMessage && <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">{productMessage}</div>}
      {showProductForm && <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-5"><form onSubmit={handleAddProduct} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Add product</h2><button type="button" onClick={() => setShowProductForm(false)} aria-label="Close product form"><FiX /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><input required placeholder="Product name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2" /><select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5"><option>Fruits</option><option>Vegetables</option><option>Dairy</option><option>Seafood</option></select><input required min="0" step="0.01" type="number" placeholder="Price" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5" /><input required min="0" type="number" placeholder="Stock" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5" /><label className="rounded-xl border border-dashed border-orange-300 bg-orange-50 px-3 py-2.5 text-sm font-semibold text-orange-700 sm:col-span-2">Choose image from computer<input type="file" accept="image/*" onChange={handleImageFile} className="mt-2 block w-full text-sm font-normal text-slate-600" /></label><input type="url" placeholder="Or paste direct image URL" value={productForm.image.startsWith("data:") ? "" : productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 sm:col-span-2" /></div>{productForm.image.trim() && <div className="mt-4 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-slate-50"><img src={productForm.image.trim()} alt="Product preview" onError={(event) => { event.currentTarget.style.display = "none"; }} className="h-full w-full object-contain" /></div>}{adminError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{adminError}</p>}<button disabled={isSavingProduct} className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">{isSavingProduct ? "Saving..." : "Save product"}</button></form></div>}
    </div>
  );
}

export default Dashboard;
