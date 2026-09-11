import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const USD_TO_INR = 83;

const OrderDetails = () => {
  const { orderId } = useParams();
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [order, setOrder] = useState(() => JSON.parse(localStorage.getItem("grocify_orders") || "[]").find((item) => item.id === orderId && item.email?.toLowerCase() === savedUser?.email?.toLowerCase()));
  const [isLoading, setIsLoading] = useState(() => Boolean(savedUser?.email));

  useEffect(() => {
    if (!savedUser?.email) return;
    fetch(`${API_URL}/orders/${encodeURIComponent(orderId)}?email=${encodeURIComponent(savedUser.email)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load order");
        return response.json();
      })
      .then((data) => setOrder(data.order))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [orderId, savedUser?.email]);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">Loading order...</div></div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Order not found</h1>
          <p className="mt-3 text-slate-600">This order does not exist in the saved records.</p>
          <Link to="/orders" className="mt-6 inline-block rounded-xl bg-[#10251f] px-4 py-2 font-semibold text-white">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Order details</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{order.id}</h1>
          </div>
          <Link to="/orders" className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-600">
            Back to orders
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-5">
            <h2 className="text-lg font-bold text-slate-900">Customer</h2>
            <p className="mt-3 text-slate-700">{order.customer}</p>
            <p className="mt-1 text-slate-500">{order.email || "No email provided"}</p>
            <p className="mt-2 text-slate-500">{order.address || "No address provided"}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <h2 className="text-lg font-bold text-slate-900">Summary</h2>
            <p className="mt-3 text-slate-700">Payment: {order.paymentMethod || "Not specified"}</p>
            <p className="mt-1 text-slate-700">Status: {order.status || "Processing"}</p>
            <p className="mt-1 text-slate-700">Total: ${Number(order.totalUSD || 0).toFixed(2)}</p>
            <p className="mt-1 text-slate-700">Total: ₹{Number(order.totalINR || 0).toLocaleString("en-IN")}</p>
            <p className="mt-1 text-slate-700">Ordered on: {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Date unavailable"}</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 font-semibold text-slate-800">Items</div>
          <div className="divide-y divide-slate-200">
            {(order.items || []).map((item) => (
              <div key={`${order.id}-${item.id || item.name}`} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right"><p className="font-semibold text-slate-900">${Number(item.price || 0).toFixed(2)}</p><p className="text-sm text-slate-500">₹{(Number(item.price || 0) * USD_TO_INR).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
