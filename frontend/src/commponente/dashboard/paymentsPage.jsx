import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiClock, FiCreditCard, FiDollarSign } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
const formatINR = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
const isCashPayment = (method) => String(method || "").toLowerCase().includes("cash");

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/dashboard", { replace: true });
      return;
    }

    fetch(`${API_URL}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/dashboard", { replace: true });
          return;
        }
        if (!response.ok) throw new Error(data.message || "Could not load payments");
        setOrders(data.orders || []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const totals = useMemo(() => orders.reduce((summary, order) => {
    const amount = Number(order.totalINR || 0);
    const paid = order.paymentStatus === "Paid";
    if (!paid) summary.pending += amount;
    else if (isCashPayment(order.paymentMethod)) summary.cashReceived += amount;
    else summary.onlineReceived += amount;
    return summary;
  }, { onlineReceived: 0, cashReceived: 0, pending: 0 }), [orders]);

  const updatePaymentStatus = async (order) => {
    const token = localStorage.getItem("adminToken");
    const paymentStatus = order.paymentStatus === "Paid" ? "Pending" : "Paid";
    setUpdatingOrder(order.id);
    setError("");
    try {
      const response = await fetch(`${API_URL}/admin/orders/${encodeURIComponent(order.id)}/payment-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentStatus }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/dashboard", { replace: true });
        return;
      }
      if (!response.ok) throw new Error(data.message || "Could not update payment status");
      setOrders((current) => current.map((item) => item.id === order.id ? data.order : item));
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingOrder("");
    }
  };

  const filteredOrders = orders.filter((order) => filter === "All" || (filter === "Pending" ? order.paymentStatus !== "Paid" : order.paymentStatus === "Paid"));

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800"><FiArrowLeft /> Back to dashboard</Link>
        <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Accounts</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Payments</h1>
            <p className="mt-2 text-sm text-slate-500">Review collections and confirm payments after verifying receipt.</p>
          </div>
          <p className="text-sm text-slate-500">{orders.length} orders</p>
        </header>

        <section aria-label="Payment totals" className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="border-l-4 border-sky-500 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sky-700"><FiCreditCard /><h2 className="text-sm font-semibold">Online received</h2></div>
            <p className="mt-4 text-2xl font-bold tabular-nums">{formatINR(totals.onlineReceived)}</p>
            <p className="mt-1 text-xs text-slate-500">Paid UPI and card orders</p>
          </article>
          <article className="border-l-4 border-emerald-500 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700"><FiDollarSign /><h2 className="text-sm font-semibold">Cash received</h2></div>
            <p className="mt-4 text-2xl font-bold tabular-nums">{formatINR(totals.cashReceived)}</p>
            <p className="mt-1 text-xs text-slate-500">Confirmed cash collections</p>
          </article>
          <article className="border-l-4 border-amber-500 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700"><FiClock /><h2 className="text-sm font-semibold">Pending collection</h2></div>
            <p className="mt-4 text-2xl font-bold tabular-nums">{formatINR(totals.pending)}</p>
            <p className="mt-1 text-xs text-slate-500">Not yet marked as received</p>
          </article>
        </section>

        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Payment records</h2>
            <div className="flex gap-1" aria-label="Filter payments">
              {["All", "Pending", "Received"].map((option) => (
                <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-md px-3 py-2 text-sm font-semibold ${filter === option ? "bg-[#10251f] text-white" : "text-slate-600 hover:bg-white"}`}>{option}</button>
              ))}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto border-y border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3 font-semibold">Order</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Method</th><th className="px-4 py-3 font-semibold">Amount</th><th className="px-4 py-3 font-semibold">Payment status</th><th className="px-4 py-3 text-right font-semibold">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-500">Loading payments...</td></tr>
                  : filteredOrders.length === 0 ? <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-500">No payment records found.</td></tr>
                    : filteredOrders.map((order) => {
                      const paid = order.paymentStatus === "Paid";
                      return (
                        <tr key={order._id || order.id}>
                          <td className="px-4 py-4 font-semibold text-slate-800">{order.id}</td>
                          <td className="px-4 py-4 text-slate-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "Date unavailable"}</td>
                          <td className="px-4 py-4 text-slate-700">{order.paymentMethod || "Not specified"}</td>
                          <td className="px-4 py-4 font-semibold tabular-nums">{formatINR(Number(order.totalINR || 0))}</td>
                          <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{paid ? <FiCheckCircle /> : <FiClock />}{paid ? "Received" : "Pending"}</span></td>
                          <td className="px-4 py-4 text-right"><button type="button" disabled={updatingOrder === order.id} onClick={() => updatePaymentStatus(order)} className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50">{updatingOrder === order.id ? "Saving..." : paid ? "Mark pending" : "Mark received"}</button></td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default PaymentsPage;