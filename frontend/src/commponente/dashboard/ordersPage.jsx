import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

const OrdersPage = () => {
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [orders, setOrders] = useState(() => {
    const localOrders = JSON.parse(localStorage.getItem("grocify_orders") || "[]");
    return savedUser?.email ? localOrders.filter((order) => order.email?.toLowerCase() === savedUser.email.toLowerCase()) : [];
  });
  const [isLoading, setIsLoading] = useState(() => Boolean(savedUser?.email));

  useEffect(() => {
    if (!savedUser?.email) {
      return;
    }
    fetch(`${API_URL}/orders?email=${encodeURIComponent(savedUser.email)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load orders");
        return response.json();
      })
      .then((data) => setOrders(data.orders || []))
      .catch(() => {
        const localOrders = JSON.parse(localStorage.getItem("grocify_orders") || "[]");
        setOrders(localOrders.filter((order) => order.email?.toLowerCase() === savedUser.email?.toLowerCase()));
      })
      .finally(() => setIsLoading(false));
  }, [savedUser?.email, savedUser?.name]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">My orders</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Your orders</h1>
          </div>
          <Link to="/" className="rounded-xl bg-[#10251f] px-4 py-2 font-semibold text-white hover:bg-[#1d4437]">
            Store
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Items ordered</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Ordered on</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr><td colSpan="7" className="px-5 py-8 text-center text-slate-500">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">{order.id}</td>
                    <td className="px-5 py-4 text-slate-700">{order.customer}</td>
                    <td className="px-5 py-4 text-slate-700">{(order.items || []).map((item) => `${item.name} x${item.quantity}`).join(", ") || "No items"}</td>
                    <td className="px-5 py-4 text-slate-700">₹{Number(order.totalINR || 0).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        {order.status || "Processing"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Date unavailable"}</td>
                    <td className="px-5 py-4">
                      <Link to={`/orders/${order.id}`} className="font-semibold text-orange-600 hover:text-orange-700">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
