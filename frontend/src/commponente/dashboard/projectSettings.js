export const PROJECT_SETTINGS_KEY = "grocify_project_settings";

export const defaultProjectSettings = {
  storeName: "Grocify",
  tagline: "Fresh groceries, delivered with care.",
  email: "hello@grocify.store",
  phone: "+91 98765 43210",
  address: "12 Market Road, New Delhi, India",
  about:
    "Fresh, seasonal groceries and household essentials for modern Indian homes.",
  supportHours: "Mon - Sat, 9:00 AM to 9:00 PM",
};

export const getProjectSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECT_SETTINGS_KEY) || "null");
    return { ...defaultProjectSettings, ...(saved || {}) };
  } catch {
    return { ...defaultProjectSettings };
  }
};

export const updateProjectSettings = (nextValues) => {
  const updated = { ...getProjectSettings(), ...nextValues };
  localStorage.setItem(PROJECT_SETTINGS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("projectSettingsUpdated"));
  return updated;
};
