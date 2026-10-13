import { useEffect, useState } from "react";
import { FiBox, FiCheckCircle, FiShoppingBag, FiUsers } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : `http://${window.location.hostname}:5000`);

const metrics = [
  { key: "products", label: "Products in our store", icon: FiBox, color: "text-orange-600 bg-orange-50" },
  { key: "orders", label: "Orders received", icon: FiShoppingBag, color: "text-sky-700 bg-sky-50" },
  { key: "deliveredOrders", label: "Orders delivered", icon: FiCheckCircle, color: "text-emerald-700 bg-emerald-50" },
  { key: "customers", label: "Community members", icon: FiUsers, color: "text-rose-700 bg-rose-50" },
];

const getLastSixMonths = () => {
  const today = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      orders: 0,
      deliveredOrders: 0,
    };
  });
};

const ProgressPage = () => {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/store/progress`)
      .then((response) => {
        if (!response.ok) throw new Error("Progress is temporarily unavailable.");
        return response.json();
      })
      .then((data) => {
        if (active) setProgress(data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  const monthlyProgress = getLastSixMonths().map((month) => {
    const monthlyData = progress?.monthlyOrders?.find(
      (entry) => `${entry._id.year}-${entry._id.month}` === month.key
    );
    return monthlyData ? { ...month, ...monthlyData } : month;
  });
  const deliveryRate = progress?.orders
    ? Math.round((progress.deliveredOrders / progress.orders) * 100)
    : 0;
  const chartMaximum = Math.max(1, ...monthlyProgress.map((month) => month.orders));

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-4 pb-16 pt-28 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-emerald-900/10 pb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Our store, together</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-emerald-950 sm:text-5xl">A little more progress, every day.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">A snapshot of the store we are building with our community. These are shared totals only; personal customer and order details stay private.</p>
        </header>

        {error && <p role="status" className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>}

        <section aria-label="Company progress totals" className="mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ key, label, icon: Icon, color }) => (
            <article key={key} className="border-b border-slate-200 py-6 first:pt-0 sm:first:pt-6">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}><Icon className="text-xl" /></div>
              <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-950">
                {progress ? Number(progress[key] || 0).toLocaleString("en-IN") : "--"}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-8 border-t border-slate-200 pt-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700">Store activity</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">Orders over the last six months</h2>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-sky-600" />Orders</span>
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />Delivered</span>
              </div>
            </div>

            <div className="mt-6 grid h-60 grid-cols-6 gap-2 border-b border-slate-300 px-1 sm:gap-5" aria-label="Monthly orders and deliveries chart">
              {monthlyProgress.map((month) => (
                <div key={month.key} className="flex min-w-0 flex-col items-center justify-end">
                  <div className="flex h-48 w-full items-end justify-center gap-1 border-b border-slate-100 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_47px,#e5e7eb_48px)] sm:gap-2">
                    <div
                      className="w-3 rounded-t-sm bg-sky-600 transition-[height] duration-500 sm:w-6"
                      style={{ height: `${month.orders ? Math.max((month.orders / chartMaximum) * 100, 3) : 0}%` }}
                      title={`${month.label}: ${month.orders} orders`}
                      aria-label={`${month.label}: ${month.orders} orders`}
                    />
                    <div
                      className="w-3 rounded-t-sm bg-emerald-600 transition-[height] duration-500 sm:w-6"
                      style={{ height: `${month.deliveredOrders ? Math.max((month.deliveredOrders / chartMaximum) * 100, 3) : 0}%` }}
                      title={`${month.label}: ${month.deliveredOrders} delivered`}
                      aria-label={`${month.label}: ${month.deliveredOrders} delivered`}
                    />
                  </div>
                  <span className="py-2 text-xs font-medium text-slate-500">{month.label}</span>
                </div>
              ))}
            </div>
            {error && <p role="status" className="mt-4 text-sm text-amber-800">{error}</p>}
          </div>

          <aside className="flex flex-col items-center justify-center border-t border-slate-200 py-6 text-center lg:border-l lg:border-t-0 lg:pl-8">
            <p className="text-sm font-semibold text-slate-500">Delivery rate</p>
            <div
              className="mt-5 flex h-40 w-40 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(#059669 ${progress ? deliveryRate : 0}%, #e2e8f0 0)` }}
              role="img"
              aria-label={`Delivery rate ${progress ? deliveryRate : 0}%`}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#f7f8f4]">
                <span className="text-3xl font-bold tabular-nums text-emerald-900">{progress ? `${deliveryRate}%` : "--"}</span>
                <span className="mt-1 text-xs text-slate-500">delivered</span>
              </div>
            </div>
            <p className="mt-4 max-w-52 text-sm leading-6 text-slate-600">
              {progress
                ? `${Number(progress.deliveredOrders || 0).toLocaleString("en-IN")} of ${Number(progress.orders || 0).toLocaleString("en-IN")} orders delivered`
                : error || "Loading store progress..."}
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default ProgressPage;