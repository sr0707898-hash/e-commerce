import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProjectSettings, updateProjectSettings } from "./projectSettings";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(() => Boolean(localStorage.getItem("adminToken")));
  const [settings, setSettings] = useState(getProjectSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setIsAdmin(true);
  }, [navigate]);

  useEffect(() => {
    const syncSettings = () => setSettings(getProjectSettings());
    window.addEventListener("projectSettingsUpdated", syncSettings);
    return () => window.removeEventListener("projectSettingsUpdated", syncSettings);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const updated = updateProjectSettings(settings);
    setSettings(updated);
    setMessage("Project information saved successfully.");
    setIsSaving(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">Settings</p>
            <h1 className="mt-1 text-3xl font-bold">Project information</h1>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Store name
                <input
                  type="text"
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Tagline
                <input
                  type="text"
                  name="tagline"
                  value={settings.tagline}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Phone
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Address
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                About the store
                <textarea
                  name="about"
                  rows="4"
                  value={settings.about}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700 md:col-span-2">
                Support hours
                <input
                  type="text"
                  name="supportHours"
                  value={settings.supportHours}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>
            </div>

            {message && <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

            <button
              type="submit"
              disabled={isSaving}
              className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save project information"}
            </button>
          </form>

          <aside className="rounded-3xl border border-slate-200 bg-[#10251f] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/70">Live preview</p>
            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <p className="text-2xl font-black tracking-tight">
                {settings.storeName.split(" ").map((part, index) =>
                  index === 0 ? (
                    <span key={part}>
                      {part}
                    </span>
                  ) : (
                    <span key={part} className="text-orange-400">
                      {part}
                    </span>
                  )
                )}
              </p>
              <p className="mt-2 text-sm text-emerald-100/80">{settings.tagline}</p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-emerald-50/80">
              <p>Email: {settings.email}</p>
              <p>Phone: {settings.phone}</p>
              <p>Address: {settings.address}</p>
              <p>Hours: {settings.supportHours}</p>
            </div>

            <div className="mt-6 rounded-2xl bg-white/5 p-4">
              <p className="text-lg font-semibold">About us</p>
              <p className="mt-2 text-sm text-emerald-50/75">{settings.about}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
