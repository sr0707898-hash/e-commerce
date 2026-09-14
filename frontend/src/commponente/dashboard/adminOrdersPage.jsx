import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import fallbackProducts from "../productList/productList";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
const USD_TO_INR = 83;
const fallbackImages = new Map(fallbackProducts.map((product) => [product.name.trim().toLowerCase(), product.image]));
const getProductImage = (item) => item.image || fallbackImages.get(String(item.name || "").trim().toLowerCase()) || "";

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/dashboard");
      return;
    }

    fetch(`${API_URL}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/dashboard");
          return;
        }
        if (!response.ok) throw new Error(data.message || "Could not load orders");
        setOrders(data.orders || []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-6 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link to="/dashboard" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Back to dashboard</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Order management</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Customer orders</h1>
            <p className="mt-1 text-sm text-slate-500">Complete customer and product details for every order.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm">{orders.length} orders</div>
        </div>

        {isLoading && <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading orders...</div>}
        {error && <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">{error}</div>}
        {!isLoading && !error && orders.length === 0 && <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">No orders placed yet.</div>}

        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-5 md:flex-row md:items-start md:px-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">Order</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">{order.id}</h2>
                  <p className="mt-1 text-sm text-slate-500">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Date unavailable"}</p>
                </div>
                <div className="text-left md:text-right">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">{order.status || "Processing"}</span>
                  <p className="mt-3 text-lg font-bold text-slate-950">₹{Number(order.totalINR || 0).toLocaleString("en-IN")}</p>
                  <p className="text-sm text-slate-500">${Number(order.totalUSD || 0).toFixed(2)} via {order.paymentMethod || "Not specified"}</p>
                </div>
              </div>

              <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:p-6">
                <section className="rounded-xl bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-950">Customer details</h3>
                  <p className="mt-4 font-semibold text-slate-800">{order.customer || "Customer"}</p>
                  <p className="mt-1 break-all text-sm text-slate-600">{order.email || "No email provided"}</p>
                  <p className="mt-1 text-sm text-slate-600">{order.phone || "No phone provided"}</p>
                  <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">Delivery address</p>
                    <p className="mt-1">{order.address || "No address provided"}</p>
                    <p className="mt-1">{[order.houseNo, order.sectorColony, order.district, order.state].filter(Boolean).join(", ")}</p>
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-slate-950">Products ordered</h3>
                  <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
                    {(order.items || []).map((item, index) => (
                      <div key={`${order.id}-${item.id || item.name || index}`} className="flex items-center gap-4 p-4">
                        {getProductImage(item) ? <img src={getProductImage(item)} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg bg-slate-50 object-contain p-1" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">No image</div>}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800">{item.name || "Unnamed product"}</p>
                          <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">${Number(item.price || 0).toFixed(2)}</p>
                          <p className="text-sm text-slate-500">₹{(Number(item.price || 0) * USD_TO_INR).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdminOrdersPage;
