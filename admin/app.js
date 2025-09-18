// admin/main.jsx
import React20 from "react";
import ReactDOM from "react-dom/client";

// admin/App.jsx
import React19 from "react";
import { BrowserRouter, Navigate, Route, Routes, Outlet as Outlet2 } from "react-router-dom";

// admin/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jsx } from "react/jsx-runtime";
var TOKEN_KEY = "monotours24_admin_token";
var USER_KEY = "monotours24_admin_user";
var BRANDING_KEY = "monotours24_admin_branding";
var AuthContext = createContext({
  token: null,
  user: null,
  branding: null,
  loading: false,
  error: null,
  login: async () => {
  },
  logout: () => {
  },
  setBranding: () => {
  }
});
function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [branding, setBranding] = useState(() => {
    const raw = localStorage.getItem(BRANDING_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let active = true;
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Sitzung ung\xFCltig");
        }
        const data = await response.json();
        if (!active)
          return;
        setUser(data.user);
        setBranding(data.branding ?? null);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(BRANDING_KEY, JSON.stringify(data.branding ?? null));
        setError(null);
      } catch (sessionError) {
        console.warn("Session check failed", sessionError);
        logout();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchSession();
    return () => {
      active = false;
    };
  }, [token]);
  const login = async (email, password) => {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: "Anmeldung fehlgeschlagen" }));
      throw new Error(errorBody.message || "Anmeldung fehlgeschlagen");
    }
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    setBranding(data.branding ?? null);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(BRANDING_KEY, JSON.stringify(data.branding ?? null));
    setError(null);
    return data.user;
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    setBranding(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(BRANDING_KEY);
  };
  const value = useMemo(
    () => ({ token, user, branding, loading, error, login, logout, setBranding }),
    [token, user, branding, loading, error]
  );
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  return useContext(AuthContext);
}

// admin/components/Layout.jsx
import React4 from "react";
import { Outlet } from "react-router-dom";

// admin/components/Sidebar.jsx
import React2, { useState as useState2 } from "react";
import { NavLink } from "react-router-dom";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "\u{1F4CA}" },
  { to: "/content", label: "Inhalte", icon: "\u{1F4F0}" },
  { to: "/offers", label: "Hot Deals", icon: "\u{1F525}" },
  { to: "/products", label: "Produkte", icon: "\u{1F9F3}" },
  { to: "/users", label: "Kunden & Partner", icon: "\u{1F465}" },
  { to: "/bookings", label: "Buchungen", icon: "\u{1F4D1}" },
  { to: "/settings", label: "Einstellungen", icon: "\u2699\uFE0F" },
  { to: "/logs", label: "Aktivit\xE4ten", icon: "\u{1F4DC}" }
];
function Sidebar() {
  const { branding } = useAuth();
  const [open, setOpen] = useState2(false);
  return /* @__PURE__ */ jsxs("aside", { className: `admin-sidebar${open ? " is-open" : ""}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "sidebar-brand", children: [
      branding?.logoUrl ? /* @__PURE__ */ jsx2("img", { src: branding.logoUrl, alt: branding.brandName || "Monotours24", className: "sidebar-logo" }) : /* @__PURE__ */ jsx2("span", { className: "sidebar-fallback", children: "\u2708\uFE0F" }),
      /* @__PURE__ */ jsxs("div", { className: "sidebar-brand-text", children: [
        /* @__PURE__ */ jsx2("span", { className: "sidebar-brand-name", children: branding?.brandName || "Monotours24" }),
        branding?.tagline && /* @__PURE__ */ jsx2("span", { className: "sidebar-brand-tagline", children: branding.tagline })
      ] }),
      /* @__PURE__ */ jsx2("button", { type: "button", className: "sidebar-toggle", onClick: () => setOpen((state) => !state), "aria-label": "Navigation umschalten", children: "\u2630" })
    ] }),
    /* @__PURE__ */ jsx2("nav", { className: "sidebar-nav", "aria-label": "Admin Navigation", children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsxs(
      NavLink,
      {
        to: item.to,
        end: item.to === "/",
        className: ({ isActive }) => `sidebar-link${isActive ? " is-active" : ""}`,
        onClick: () => setOpen(false),
        children: [
          /* @__PURE__ */ jsx2("span", { className: "sidebar-icon", "aria-hidden": "true", children: item.icon }),
          /* @__PURE__ */ jsx2("span", { children: item.label })
        ]
      },
      item.to
    )) })
  ] });
}

// admin/components/TopBar.jsx
import React3 from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function TopBar({ branding }) {
  const { user, logout } = useAuth();
  return /* @__PURE__ */ jsxs2("header", { className: "admin-topbar", children: [
    /* @__PURE__ */ jsxs2("div", { className: "topbar-left", children: [
      /* @__PURE__ */ jsxs2("div", { className: "topbar-branding", children: [
        /* @__PURE__ */ jsx3("span", { className: "topbar-title", children: branding?.brandName || "Monotours24 Admin" }),
        branding?.tagline && /* @__PURE__ */ jsx3("span", { className: "topbar-tagline", children: branding.tagline })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "topbar-status", children: [
        /* @__PURE__ */ jsx3("span", { className: "status-indicator", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx3("span", { children: "Sicher verbunden" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs2("div", { className: "topbar-right", children: [
      /* @__PURE__ */ jsxs2("div", { className: "user-info", "aria-label": "Angemeldeter Benutzer", children: [
        /* @__PURE__ */ jsx3("div", { className: "user-avatar", "aria-hidden": "true", children: user?.name ? user.name.charAt(0) : "A" }),
        /* @__PURE__ */ jsxs2("div", { className: "user-meta", children: [
          /* @__PURE__ */ jsx3("span", { className: "user-name", children: user?.name || "Admin" }),
          /* @__PURE__ */ jsx3("span", { className: "user-role", children: user?.role ? user.role.toUpperCase() : "ADMIN" })
        ] })
      ] }),
      /* @__PURE__ */ jsx3("button", { type: "button", className: "btn btn-secondary", onClick: logout, children: "Abmelden" })
    ] })
  ] });
}

// admin/components/Layout.jsx
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function Layout() {
  const { branding } = useAuth();
  return /* @__PURE__ */ jsxs3("div", { className: "admin-shell", children: [
    /* @__PURE__ */ jsx4(Sidebar, {}),
    /* @__PURE__ */ jsxs3("div", { className: "admin-shell__main", children: [
      /* @__PURE__ */ jsx4(TopBar, { branding }),
      /* @__PURE__ */ jsx4("main", { className: "admin-content", id: "admin-content", tabIndex: -1, children: /* @__PURE__ */ jsx4(Outlet, {}) })
    ] })
  ] });
}

// admin/components/LoadingScreen.jsx
import React5 from "react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
function LoadingScreen({ message = "Daten werden geladen \u2026" }) {
  return /* @__PURE__ */ jsxs4("div", { className: "loading-screen", role: "status", "aria-live": "polite", children: [
    /* @__PURE__ */ jsx5("div", { className: "loading-indicator" }),
    /* @__PURE__ */ jsx5("p", { children: message })
  ] });
}

// admin/pages/LoginPage.jsx
import React6, { useState as useState3 } from "react";
import { useNavigate } from "react-router-dom";
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function LoginPage() {
  const { login, branding } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState3("admin@monotours24.de");
  const [password, setPassword] = useState3("admin123");
  const [error, setError] = useState3(null);
  const [loading, setLoading] = useState3(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx6("div", { className: "login-wrapper", children: /* @__PURE__ */ jsxs5("form", { className: "login-card", onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxs5("div", { className: "login-brand", children: [
      /* @__PURE__ */ jsx6("span", { className: "login-icon", children: "\u2708\uFE0F" }),
      /* @__PURE__ */ jsxs5("div", { className: "login-brand-text", children: [
        /* @__PURE__ */ jsx6("span", { className: "login-title", children: branding?.brandName || "Monotours24" }),
        /* @__PURE__ */ jsx6("span", { className: "login-subtitle", children: "Sicheres Administratoren-Portal" })
      ] })
    ] }),
    /* @__PURE__ */ jsx6("h1", { children: "Willkommen zur\xFCck" }),
    /* @__PURE__ */ jsx6("p", { className: "login-copy", children: "Verwalten Sie Inhalte, Angebote, Nutzer und Einstellungen in Echtzeit." }),
    error && /* @__PURE__ */ jsx6("div", { className: "login-error", children: error }),
    /* @__PURE__ */ jsxs5("label", { className: "form-field", children: [
      /* @__PURE__ */ jsx6("span", { children: "E-Mail" }),
      /* @__PURE__ */ jsx6("input", { type: "email", value: email, onChange: (event) => setEmail(event.target.value), required: true, autoComplete: "username" })
    ] }),
    /* @__PURE__ */ jsxs5("label", { className: "form-field", children: [
      /* @__PURE__ */ jsx6("span", { children: "Passwort" }),
      /* @__PURE__ */ jsx6(
        "input",
        {
          type: "password",
          value: password,
          onChange: (event) => setPassword(event.target.value),
          required: true,
          autoComplete: "current-password"
        }
      )
    ] }),
    /* @__PURE__ */ jsx6("button", { type: "submit", className: "btn btn-primary btn-full", disabled: loading, children: loading ? "Anmeldung \u2026" : "Anmelden" }),
    /* @__PURE__ */ jsx6("p", { className: "login-hint", children: "Demo-Zugang: admin@monotours24.de \xB7 admin123" })
  ] }) });
}

// admin/pages/DashboardPage.jsx
import React10, { useEffect as useEffect2, useState as useState4 } from "react";

// admin/components/StatCard.jsx
import React7 from "react";
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
function StatCard({ title, value, icon, trend }) {
  return /* @__PURE__ */ jsxs6("div", { className: "stat-card", children: [
    /* @__PURE__ */ jsx7("div", { className: "stat-card__icon", "aria-hidden": "true", children: icon }),
    /* @__PURE__ */ jsxs6("div", { className: "stat-card__content", children: [
      /* @__PURE__ */ jsx7("span", { className: "stat-card__label", children: title }),
      /* @__PURE__ */ jsx7("span", { className: "stat-card__value", children: value }),
      trend && /* @__PURE__ */ jsx7("span", { className: `stat-card__trend stat-card__trend--${trend.type || "neutral"}`, children: trend.label })
    ] })
  ] });
}

// admin/components/SectionCard.jsx
import React8 from "react";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
function SectionCard({ title, description, actions, children, footer }) {
  return /* @__PURE__ */ jsxs7("section", { className: "section-card", children: [
    /* @__PURE__ */ jsxs7("header", { className: "section-card__header", children: [
      /* @__PURE__ */ jsxs7("div", { children: [
        /* @__PURE__ */ jsx8("h2", { children: title }),
        description && /* @__PURE__ */ jsx8("p", { className: "section-card__description", children: description })
      ] }),
      actions && /* @__PURE__ */ jsx8("div", { className: "section-card__actions", children: actions })
    ] }),
    /* @__PURE__ */ jsx8("div", { className: "section-card__body", children }),
    footer && /* @__PURE__ */ jsx8("footer", { className: "section-card__footer", children: footer })
  ] });
}

// admin/components/InlineAlert.jsx
import React9 from "react";
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
function InlineAlert({ type = "info", title, message, onClose }) {
  return /* @__PURE__ */ jsxs8("div", { className: `inline-alert inline-alert--${type}`, role: "alert", children: [
    /* @__PURE__ */ jsxs8("div", { className: "inline-alert__content", children: [
      title && /* @__PURE__ */ jsx9("strong", { children: title }),
      message && /* @__PURE__ */ jsx9("span", { children: message })
    ] }),
    onClose && /* @__PURE__ */ jsx9("button", { type: "button", className: "inline-alert__close", onClick: onClose, "aria-label": "Hinweis schlie\xDFen", children: "\xD7" })
  ] });
}

// admin/hooks/useApi.js
import { useCallback } from "react";
function useApi() {
  const { token, logout } = useAuth();
  const request = useCallback(
    async (path, options = {}) => {
      const { method = "GET", body, headers = {}, rawResponse = false } = options;
      const finalHeaders = { ...headers };
      let payload = body;
      if (token) {
        finalHeaders.Authorization = `Bearer ${token}`;
      }
      if (payload instanceof FormData) {
      } else if (payload !== void 0 && payload !== null) {
        finalHeaders["Content-Type"] = "application/json";
        payload = JSON.stringify(payload);
      }
      const response = await fetch(path, {
        method,
        headers: finalHeaders,
        body: method === "GET" || method === "HEAD" ? void 0 : payload
      });
      if (response.status === 401) {
        logout();
        throw new Error("Sitzung ist abgelaufen. Bitte erneut anmelden.");
      }
      if (!response.ok) {
        let errorMessage = "Es ist ein Fehler aufgetreten.";
        try {
          const errorBody = await response.json();
          errorMessage = errorBody.message || errorMessage;
        } catch (error) {
        }
        throw new Error(errorMessage);
      }
      if (response.status === 204 || rawResponse) {
        return rawResponse ? response : null;
      }
      return response.json();
    },
    [token, logout]
  );
  return { request };
}

// admin/utils/format.js
function formatCurrency(value, currency = "EUR") {
  if (value === null || value === void 0 || Number.isNaN(Number(value))) {
    return "\u2013";
  }
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(Number(value));
}
function formatDate(value) {
  if (!value)
    return "\u2013";
  try {
    return new Intl.DateTimeFormat("de-DE").format(new Date(value));
  } catch (error) {
    return value;
  }
}

// admin/pages/DashboardPage.jsx
import { jsx as jsx10, jsxs as jsxs9 } from "react/jsx-runtime";
function DashboardPage() {
  const { request } = useApi();
  const [data, setData] = useState4(null);
  const [error, setError] = useState4(null);
  useEffect2(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request("/api/admin/dashboard");
        if (active) {
          setData(response);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);
  if (error) {
    return /* @__PURE__ */ jsx10(InlineAlert, { type: "error", title: "Fehler", message: error });
  }
  if (!data) {
    return /* @__PURE__ */ jsx10(LoadingScreen, { message: "Dashboard wird geladen \u2026" });
  }
  const { totals, revenue, upcoming, latestLogs } = data;
  return /* @__PURE__ */ jsxs9("div", { className: "dashboard-grid", children: [
    /* @__PURE__ */ jsxs9("div", { className: "stat-grid", children: [
      /* @__PURE__ */ jsx10(StatCard, { title: "Buchungen gesamt", value: totals.bookings, icon: "\u{1F4E6}" }),
      /* @__PURE__ */ jsx10(StatCard, { title: "Offene Buchungen", value: totals.openBookings, icon: "\u{1F552}", trend: { type: "warning", label: "Follow-up n\xF6tig" } }),
      /* @__PURE__ */ jsx10(StatCard, { title: "Partner", value: totals.partners, icon: "\u{1F91D}" }),
      /* @__PURE__ */ jsx10(StatCard, { title: "Kunden", value: totals.customers, icon: "\u{1F465}" }),
      /* @__PURE__ */ jsx10(StatCard, { title: "Hot Deals", value: totals.hotDeals, icon: "\u{1F525}" }),
      /* @__PURE__ */ jsx10(StatCard, { title: "Ver\xF6ff. Beitr\xE4ge", value: totals.publishedPosts, icon: "\u{1F4F0}" }),
      /* @__PURE__ */ jsx10(
        StatCard,
        {
          title: "Best\xE4tigtes Volumen",
          value: formatCurrency(revenue),
          icon: "\u{1F4B6}",
          trend: { type: "success", label: "Aktualisiert heute" }
        }
      )
    ] }),
    /* @__PURE__ */ jsx10(
      SectionCard,
      {
        title: "Anstehende Reisen",
        description: "Reisen mit Reisebeginn in den n\xE4chsten Wochen",
        actions: /* @__PURE__ */ jsx10("span", { className: "section-hint", children: "Automatische Erinnerung 7 Tage vorher" }),
        children: upcoming.length === 0 ? /* @__PURE__ */ jsx10("p", { className: "empty-state", children: "Aktuell stehen keine Reisen an." }) : /* @__PURE__ */ jsxs9("table", { className: "data-table", children: [
          /* @__PURE__ */ jsx10("thead", { children: /* @__PURE__ */ jsxs9("tr", { children: [
            /* @__PURE__ */ jsx10("th", { children: "Buchung" }),
            /* @__PURE__ */ jsx10("th", { children: "Status" }),
            /* @__PURE__ */ jsx10("th", { children: "Reisedatum" }),
            /* @__PURE__ */ jsx10("th", { children: "Betrag" })
          ] }) }),
          /* @__PURE__ */ jsx10("tbody", { children: upcoming.map((item) => /* @__PURE__ */ jsxs9("tr", { children: [
            /* @__PURE__ */ jsx10("td", { children: item.bookingReference }),
            /* @__PURE__ */ jsx10("td", { children: /* @__PURE__ */ jsx10("span", { className: `badge badge--${statusToBadge(item.status)}`, children: item.status }) }),
            /* @__PURE__ */ jsx10("td", { children: formatDate(item.travelDate) }),
            /* @__PURE__ */ jsx10("td", { children: formatCurrency(item.amount, item.currency) })
          ] }, item.bookingReference)) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx10(SectionCard, { title: "Letzte Aktivit\xE4ten", description: "\xC4nderungen im Admin-Panel der letzten Stunden", children: latestLogs.length === 0 ? /* @__PURE__ */ jsx10("p", { className: "empty-state", children: "Noch keine Aktivit\xE4ten erfasst." }) : /* @__PURE__ */ jsx10("ul", { className: "activity-list", children: latestLogs.map((log) => /* @__PURE__ */ jsxs9("li", { children: [
      /* @__PURE__ */ jsxs9("div", { children: [
        /* @__PURE__ */ jsx10("strong", { children: log.adminName || "System" }),
        /* @__PURE__ */ jsx10("span", { className: "activity-action", children: log.action }),
        log.entity && /* @__PURE__ */ jsx10("span", { className: "activity-entity", children: log.entity })
      ] }),
      /* @__PURE__ */ jsxs9("div", { className: "activity-meta", children: [
        /* @__PURE__ */ jsx10("span", { children: formatDate(log.createdAt) }),
        log.details && /* @__PURE__ */ jsx10("span", { className: "activity-details", children: summarizeDetails(log.details) })
      ] })
    ] }, log.id)) }) })
  ] });
}
function statusToBadge(status) {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("offen"))
    return "warning";
  if (normalized.includes("best\xE4tigt") || normalized.includes("abgeschlossen"))
    return "success";
  if (normalized.includes("storniert"))
    return "danger";
  return "neutral";
}
function summarizeDetails(details) {
  if (typeof details === "string")
    return details;
  try {
    return Object.entries(details).map(([key, value]) => `${key}: ${value}`).join(" \xB7 ");
  } catch (error) {
    return null;
  }
}

// admin/pages/ContentPage.jsx
import React12, { useEffect as useEffect3, useMemo as useMemo2, useState as useState5 } from "react";

// admin/components/TabNav.jsx
import React11 from "react";
import { jsx as jsx11 } from "react/jsx-runtime";
function TabNav({ items, active, onChange }) {
  return /* @__PURE__ */ jsx11("div", { className: "tab-nav", role: "tablist", children: items.map((item) => /* @__PURE__ */ jsx11(
    "button",
    {
      role: "tab",
      type: "button",
      className: `tab-nav__item${active === item.value ? " is-active" : ""}`,
      onClick: () => onChange(item.value),
      "aria-selected": active === item.value,
      children: item.label
    },
    item.value
  )) });
}

// admin/pages/ContentPage.jsx
import { jsx as jsx12, jsxs as jsxs10 } from "react/jsx-runtime";
var TABS = [
  { value: "navigation", label: "Navigation" },
  { value: "hero", label: "Hero Slider" },
  { value: "contact", label: "Kontakt & Footer" },
  { value: "services", label: "Services" },
  { value: "blog", label: "News & Blog" }
];
var INITIAL_POST = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  status: "draft",
  tags: "",
  publishedAt: "",
  scheduledAt: ""
};
function ContentPage() {
  const { request } = useApi();
  const [tab, setTab] = useState5("navigation");
  const [navigation, setNavigation] = useState5([]);
  const [heroSlides, setHeroSlides] = useState5([]);
  const [posts, setPosts] = useState5([]);
  const [settings, setSettings] = useState5(null);
  const [newNav, setNewNav] = useState5({ label: "", href: "#", sortOrder: navigation.length + 1, visible: true });
  const [newSlide, setNewSlide] = useState5({ title: "", imageUrl: "", ctaLabel: "Jetzt buchen", ctaLink: "#angebote" });
  const [newPost, setNewPost] = useState5(INITIAL_POST);
  const [message, setMessage] = useState5(null);
  const [error, setError] = useState5(null);
  const [loading, setLoading] = useState5(true);
  useEffect3(() => {
    let active = true;
    const load = async () => {
      try {
        const [navRes, heroRes, postRes, settingsRes] = await Promise.all([
          request("/api/admin/navigation"),
          request("/api/admin/hero-slides"),
          request("/api/admin/posts"),
          request("/api/admin/settings")
        ]);
        if (!active)
          return;
        setNavigation(navRes);
        setHeroSlides(heroRes);
        setPosts(postRes);
        setSettings(settingsRes);
        setNewNav((prev) => ({ ...prev, sortOrder: navRes.length + 1 }));
      } catch (err) {
        if (active)
          setError(err.message);
      } finally {
        if (active)
          setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);
  useEffect3(() => {
    if (!navigation.length)
      return;
    setNewNav((prev) => ({ ...prev, sortOrder: navigation.length + 1 }));
  }, [navigation]);
  const handleNavChange = (id, field, value) => {
    setNavigation((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const handleHeroChange = (id, field, value) => {
    setHeroSlides((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5e3);
  };
  const handleSaveNavigation = async (item) => {
    try {
      const payload = {
        label: item.label,
        href: item.href,
        sortOrder: Number(item.sortOrder) || 0,
        visible: Boolean(item.visible)
      };
      if (item.id) {
        const updated = await request(`/api/admin/navigation/${item.id}`, { method: "PUT", body: payload });
        setNavigation((items) => items.map((entry) => entry.id === item.id ? updated : entry));
      }
      showMessage("Navigation aktualisiert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleDeleteNavigation = async (id) => {
    try {
      await request(`/api/admin/navigation/${id}`, { method: "DELETE" });
      setNavigation((items) => items.filter((item) => item.id !== id));
      showMessage("Eintrag entfernt.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreateNavigation = async (event) => {
    event.preventDefault();
    try {
      const created = await request("/api/admin/navigation", {
        method: "POST",
        body: { ...newNav, sortOrder: Number(newNav.sortOrder) || navigation.length + 1 }
      });
      setNavigation((items) => [...items, created]);
      setNewNav({ label: "", href: "#", sortOrder: navigation.length + 2, visible: true });
      showMessage("Navigationspunkt erstellt.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleSaveSlide = async (slide) => {
    try {
      const payload = {
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        tag: slide.tag,
        priceLabel: slide.priceLabel,
        ctaLabel: slide.ctaLabel,
        ctaLink: slide.ctaLink,
        secondaryLine: slide.secondaryLine,
        imageUrl: slide.imageUrl,
        sortOrder: Number(slide.sortOrder) || 0,
        active: Boolean(slide.active)
      };
      const updated = await request(`/api/admin/hero-slides/${slide.id}`, { method: "PUT", body: payload });
      setHeroSlides((items) => items.map((entry) => entry.id === slide.id ? updated : entry));
      showMessage("Slide gespeichert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleDeleteSlide = async (id) => {
    try {
      await request(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
      setHeroSlides((items) => items.filter((item) => item.id !== id));
      showMessage("Slide gel\xF6scht.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreateSlide = async (event) => {
    event.preventDefault();
    try {
      const created = await request("/api/admin/hero-slides", {
        method: "POST",
        body: {
          ...newSlide,
          sortOrder: Number(newSlide.sortOrder) || heroSlides.length + 1,
          active: true
        }
      });
      setHeroSlides((items) => [...items, created]);
      setNewSlide({ title: "", imageUrl: "", ctaLabel: "Jetzt buchen", ctaLink: "#angebote" });
      showMessage("Neuer Slide angelegt.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleSaveSettings = async (key, value) => {
    try {
      const updated = await request(`/api/admin/settings/${key}`, { method: "PUT", body: value });
      setSettings((prev) => ({ ...prev, [key]: updated }));
      showMessage("Einstellungen gespeichert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleUpdatePost = async (post) => {
    try {
      const payload = {
        ...post,
        tags: post.tags?.split(",").map((tag) => tag.trim()).filter(Boolean),
        publishedAt: post.publishedAt || null,
        scheduledAt: post.scheduledAt || null
      };
      const updated = await request(`/api/admin/posts/${post.id}`, { method: "PUT", body: payload });
      setPosts((items) => items.map((entry) => entry.id === post.id ? updated : entry));
      showMessage("Beitrag gespeichert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreatePost = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...newPost,
        tags: newPost.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        publishedAt: newPost.publishedAt || null,
        scheduledAt: newPost.scheduledAt || null
      };
      const created = await request("/api/admin/posts", { method: "POST", body: payload });
      setPosts((items) => [created, ...items]);
      setNewPost(INITIAL_POST);
      showMessage("Neuer Beitrag erstellt.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleDeletePost = async (id) => {
    try {
      await request(`/api/admin/posts/${id}`, { method: "DELETE" });
      setPosts((items) => items.filter((item) => item.id !== id));
      showMessage("Beitrag entfernt.");
    } catch (err) {
      setError(err.message);
    }
  };
  const contactSettings = settings?.contact || {};
  const footerSettings = settings?.footer || {};
  const services = useMemo2(() => settings?.services || [], [settings]);
  if (loading) {
    return /* @__PURE__ */ jsx12(LoadingScreen, { message: "Inhalte werden geladen \u2026" });
  }
  if (error) {
    return /* @__PURE__ */ jsx12(InlineAlert, { type: "error", title: "Fehler", message: error });
  }
  return /* @__PURE__ */ jsxs10("div", { className: "content-page", children: [
    /* @__PURE__ */ jsx12(TabNav, { items: TABS, active: tab, onChange: setTab }),
    message && /* @__PURE__ */ jsx12(InlineAlert, { type: message.type, message: message.text }),
    tab === "navigation" && /* @__PURE__ */ jsxs10(
      SectionCard,
      {
        title: "Navigation",
        description: "Verwalten Sie die Hauptnavigation der Website, inklusive Sichtbarkeit und Reihenfolge.",
        footer: /* @__PURE__ */ jsx12("small", { children: "Men\xFCpunkte lassen sich in Echtzeit auf der Website aktualisieren." }),
        children: [
          /* @__PURE__ */ jsxs10("table", { className: "data-table", children: [
            /* @__PURE__ */ jsx12("thead", { children: /* @__PURE__ */ jsxs10("tr", { children: [
              /* @__PURE__ */ jsx12("th", { children: "Label" }),
              /* @__PURE__ */ jsx12("th", { children: "Link" }),
              /* @__PURE__ */ jsx12("th", { children: "Reihenfolge" }),
              /* @__PURE__ */ jsx12("th", { children: "Sichtbar" }),
              /* @__PURE__ */ jsx12("th", {})
            ] }) }),
            /* @__PURE__ */ jsx12("tbody", { children: navigation.map((item) => /* @__PURE__ */ jsxs10("tr", { children: [
              /* @__PURE__ */ jsx12("td", { children: /* @__PURE__ */ jsx12("input", { value: item.label, onChange: (event) => handleNavChange(item.id, "label", event.target.value) }) }),
              /* @__PURE__ */ jsx12("td", { children: /* @__PURE__ */ jsx12("input", { value: item.href, onChange: (event) => handleNavChange(item.id, "href", event.target.value) }) }),
              /* @__PURE__ */ jsx12("td", { children: /* @__PURE__ */ jsx12(
                "input",
                {
                  type: "number",
                  value: item.sortOrder,
                  onChange: (event) => handleNavChange(item.id, "sortOrder", event.target.value)
                }
              ) }),
              /* @__PURE__ */ jsx12("td", { children: /* @__PURE__ */ jsxs10("label", { className: "toggle", children: [
                /* @__PURE__ */ jsx12(
                  "input",
                  {
                    type: "checkbox",
                    checked: Boolean(item.visible),
                    onChange: (event) => handleNavChange(item.id, "visible", event.target.checked)
                  }
                ),
                /* @__PURE__ */ jsx12("span", { className: "toggle-indicator" })
              ] }) }),
              /* @__PURE__ */ jsxs10("td", { className: "table-actions", children: [
                /* @__PURE__ */ jsx12("button", { type: "button", className: "btn btn-small", onClick: () => handleSaveNavigation(item), children: "Speichern" }),
                /* @__PURE__ */ jsx12("button", { type: "button", className: "btn btn-link", onClick: () => handleDeleteNavigation(item.id), children: "Entfernen" })
              ] })
            ] }, item.id)) })
          ] }),
          /* @__PURE__ */ jsxs10("form", { className: "inline-form", onSubmit: handleCreateNavigation, children: [
            /* @__PURE__ */ jsx12(
              "input",
              {
                placeholder: "Label",
                value: newNav.label,
                onChange: (event) => setNewNav((prev) => ({ ...prev, label: event.target.value })),
                required: true
              }
            ),
            /* @__PURE__ */ jsx12(
              "input",
              {
                placeholder: "Link",
                value: newNav.href,
                onChange: (event) => setNewNav((prev) => ({ ...prev, href: event.target.value }))
              }
            ),
            /* @__PURE__ */ jsx12(
              "input",
              {
                type: "number",
                placeholder: "Reihenfolge",
                value: newNav.sortOrder,
                onChange: (event) => setNewNav((prev) => ({ ...prev, sortOrder: event.target.value }))
              }
            ),
            /* @__PURE__ */ jsxs10("label", { className: "toggle", children: [
              /* @__PURE__ */ jsx12(
                "input",
                {
                  type: "checkbox",
                  checked: newNav.visible,
                  onChange: (event) => setNewNav((prev) => ({ ...prev, visible: event.target.checked }))
                }
              ),
              /* @__PURE__ */ jsx12("span", { className: "toggle-indicator" }),
              /* @__PURE__ */ jsx12("span", { children: "sichtbar" })
            ] }),
            /* @__PURE__ */ jsx12("button", { type: "submit", className: "btn btn-primary", children: "Hinzuf\xFCgen" })
          ] })
        ]
      }
    ),
    tab === "hero" && /* @__PURE__ */ jsxs10(
      SectionCard,
      {
        title: "Hero Slider",
        description: "Steuern Sie Bilder, Texte und Call-to-Actions der Startseite.",
        actions: /* @__PURE__ */ jsxs10("span", { children: [
          "Aktive Slides: ",
          heroSlides.filter((slide) => slide.active).length
        ] }),
        children: [
          heroSlides.map((slide) => /* @__PURE__ */ jsxs10("details", { className: "collapsible", open: true, children: [
            /* @__PURE__ */ jsxs10("summary", { children: [
              /* @__PURE__ */ jsx12("strong", { children: slide.title || "Unbenannter Slide" }),
              /* @__PURE__ */ jsx12("span", { className: "collapsible-meta", children: slide.imageUrl && /* @__PURE__ */ jsx12("a", { href: slide.imageUrl, children: "Bild ansehen" }) })
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "collapsible-body", children: [
              /* @__PURE__ */ jsxs10("div", { className: "form-grid", children: [
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "Titel" }),
                  /* @__PURE__ */ jsx12("input", { value: slide.title, onChange: (event) => handleHeroChange(slide.id, "title", event.target.value) })
                ] }),
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "Untertitel" }),
                  /* @__PURE__ */ jsx12("input", { value: slide.subtitle || "", onChange: (event) => handleHeroChange(slide.id, "subtitle", event.target.value) })
                ] }),
                /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                  /* @__PURE__ */ jsx12("span", { children: "Beschreibung" }),
                  /* @__PURE__ */ jsx12(
                    "textarea",
                    {
                      value: slide.description || "",
                      onChange: (event) => handleHeroChange(slide.id, "description", event.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "CTA-Label" }),
                  /* @__PURE__ */ jsx12("input", { value: slide.ctaLabel || "", onChange: (event) => handleHeroChange(slide.id, "ctaLabel", event.target.value) })
                ] }),
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "CTA-Link" }),
                  /* @__PURE__ */ jsx12("input", { value: slide.ctaLink || "", onChange: (event) => handleHeroChange(slide.id, "ctaLink", event.target.value) })
                ] }),
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "Tag" }),
                  /* @__PURE__ */ jsx12("input", { value: slide.tag || "", onChange: (event) => handleHeroChange(slide.id, "tag", event.target.value) })
                ] }),
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "Preislabel" }),
                  /* @__PURE__ */ jsx12("input", { value: slide.priceLabel || "", onChange: (event) => handleHeroChange(slide.id, "priceLabel", event.target.value) })
                ] }),
                /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                  /* @__PURE__ */ jsx12("span", { children: "Hinweiszeile" }),
                  /* @__PURE__ */ jsx12(
                    "input",
                    {
                      value: slide.secondaryLine || "",
                      onChange: (event) => handleHeroChange(slide.id, "secondaryLine", event.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                  /* @__PURE__ */ jsx12("span", { children: "Bild-URL" }),
                  /* @__PURE__ */ jsx12("input", { value: slide.imageUrl || "", onChange: (event) => handleHeroChange(slide.id, "imageUrl", event.target.value) })
                ] }),
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "Reihenfolge" }),
                  /* @__PURE__ */ jsx12(
                    "input",
                    {
                      type: "number",
                      value: slide.sortOrder,
                      onChange: (event) => handleHeroChange(slide.id, "sortOrder", event.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { className: "toggle", children: [
                  /* @__PURE__ */ jsx12(
                    "input",
                    {
                      type: "checkbox",
                      checked: Boolean(slide.active),
                      onChange: (event) => handleHeroChange(slide.id, "active", event.target.checked)
                    }
                  ),
                  /* @__PURE__ */ jsx12("span", { className: "toggle-indicator" }),
                  /* @__PURE__ */ jsx12("span", { children: "aktiv" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs10("div", { className: "collapsible-actions", children: [
                /* @__PURE__ */ jsx12("button", { type: "button", className: "btn", onClick: () => handleSaveSlide(slide), children: "Speichern" }),
                /* @__PURE__ */ jsx12("button", { type: "button", className: "btn btn-link", onClick: () => handleDeleteSlide(slide.id), children: "L\xF6schen" })
              ] })
            ] })
          ] }, slide.id)),
          /* @__PURE__ */ jsxs10("form", { className: "hero-create", onSubmit: handleCreateSlide, children: [
            /* @__PURE__ */ jsx12("h3", { children: "Neuen Slide anlegen" }),
            /* @__PURE__ */ jsxs10("div", { className: "form-grid", children: [
              /* @__PURE__ */ jsxs10("label", { children: [
                /* @__PURE__ */ jsx12("span", { children: "Titel" }),
                /* @__PURE__ */ jsx12("input", { value: newSlide.title, onChange: (event) => setNewSlide((prev) => ({ ...prev, title: event.target.value })), required: true })
              ] }),
              /* @__PURE__ */ jsxs10("label", { children: [
                /* @__PURE__ */ jsx12("span", { children: "Bild-URL" }),
                /* @__PURE__ */ jsx12("input", { value: newSlide.imageUrl, onChange: (event) => setNewSlide((prev) => ({ ...prev, imageUrl: event.target.value })), required: true })
              ] }),
              /* @__PURE__ */ jsxs10("label", { children: [
                /* @__PURE__ */ jsx12("span", { children: "CTA-Label" }),
                /* @__PURE__ */ jsx12("input", { value: newSlide.ctaLabel, onChange: (event) => setNewSlide((prev) => ({ ...prev, ctaLabel: event.target.value })) })
              ] }),
              /* @__PURE__ */ jsxs10("label", { children: [
                /* @__PURE__ */ jsx12("span", { children: "CTA-Link" }),
                /* @__PURE__ */ jsx12("input", { value: newSlide.ctaLink, onChange: (event) => setNewSlide((prev) => ({ ...prev, ctaLink: event.target.value })) })
              ] }),
              /* @__PURE__ */ jsxs10("label", { children: [
                /* @__PURE__ */ jsx12("span", { children: "Reihenfolge" }),
                /* @__PURE__ */ jsx12(
                  "input",
                  {
                    type: "number",
                    value: newSlide.sortOrder || "",
                    onChange: (event) => setNewSlide((prev) => ({ ...prev, sortOrder: event.target.value }))
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx12("button", { type: "submit", className: "btn btn-primary", children: "Slide erstellen" })
          ] })
        ]
      }
    ),
    tab === "contact" && /* @__PURE__ */ jsx12(SectionCard, { title: "Kontaktinformationen", description: "Zentrale Kontaktdaten f\xFCr Website und Dokumente", children: /* @__PURE__ */ jsxs10(
      "form",
      {
        className: "form-grid",
        onSubmit: (event) => {
          event.preventDefault();
          const form = event.target;
          const value = {
            phone: form.phone.value,
            email: form.email.value,
            whatsapp: form.whatsapp.value,
            telegram: form.telegram.value,
            address: form.address.value,
            officeHours: form.officeHours.value
          };
          handleSaveSettings("contact", value);
        },
        children: [
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "Telefon" }),
            /* @__PURE__ */ jsx12("input", { name: "phone", defaultValue: contactSettings.phone || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "E-Mail" }),
            /* @__PURE__ */ jsx12("input", { name: "email", defaultValue: contactSettings.email || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "WhatsApp" }),
            /* @__PURE__ */ jsx12("input", { name: "whatsapp", defaultValue: contactSettings.whatsapp || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "Telegram" }),
            /* @__PURE__ */ jsx12("input", { name: "telegram", defaultValue: contactSettings.telegram || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx12("span", { children: "Adresse" }),
            /* @__PURE__ */ jsx12("textarea", { name: "address", defaultValue: contactSettings.address || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx12("span", { children: "\xD6ffnungszeiten" }),
            /* @__PURE__ */ jsx12("input", { name: "officeHours", defaultValue: contactSettings.officeHours || "" })
          ] }),
          /* @__PURE__ */ jsx12("div", { className: "form-actions", children: /* @__PURE__ */ jsx12("button", { type: "submit", className: "btn btn-primary", children: "Speichern" }) })
        ]
      }
    ) }),
    tab === "contact" && /* @__PURE__ */ jsx12(SectionCard, { title: "Footer & Rechtliches", description: "Firmendaten f\xFCr Impressum, Vertr\xE4ge und Footer", children: /* @__PURE__ */ jsxs10(
      "form",
      {
        className: "form-grid",
        onSubmit: (event) => {
          event.preventDefault();
          const form = event.target;
          const value = {
            company: form.company.value,
            street: form.street.value,
            postalCode: form.postalCode.value,
            city: form.city.value,
            country: form.country.value,
            managingDirector: form.managingDirector.value,
            phone: form.phone.value,
            email: form.email.value,
            website: form.website.value,
            taxNumber: form.taxNumber.value,
            vatId: form.vatId.value
          };
          handleSaveSettings("footer", value);
        },
        children: [
          /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx12("span", { children: "Firma" }),
            /* @__PURE__ */ jsx12("input", { name: "company", defaultValue: footerSettings.company || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "Stra\xDFe" }),
            /* @__PURE__ */ jsx12("input", { name: "street", defaultValue: footerSettings.street || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "PLZ" }),
            /* @__PURE__ */ jsx12("input", { name: "postalCode", defaultValue: footerSettings.postalCode || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "Ort" }),
            /* @__PURE__ */ jsx12("input", { name: "city", defaultValue: footerSettings.city || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "Land" }),
            /* @__PURE__ */ jsx12("input", { name: "country", defaultValue: footerSettings.country || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "Gesch\xE4ftsf\xFChrer" }),
            /* @__PURE__ */ jsx12("input", { name: "managingDirector", defaultValue: footerSettings.managingDirector || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "Telefon" }),
            /* @__PURE__ */ jsx12("input", { name: "phone", defaultValue: footerSettings.phone || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "E-Mail" }),
            /* @__PURE__ */ jsx12("input", { name: "email", defaultValue: footerSettings.email || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "Website" }),
            /* @__PURE__ */ jsx12("input", { name: "website", defaultValue: footerSettings.website || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "Steuernummer" }),
            /* @__PURE__ */ jsx12("input", { name: "taxNumber", defaultValue: footerSettings.taxNumber || "" })
          ] }),
          /* @__PURE__ */ jsxs10("label", { children: [
            /* @__PURE__ */ jsx12("span", { children: "USt.-ID" }),
            /* @__PURE__ */ jsx12("input", { name: "vatId", defaultValue: footerSettings.vatId || "" })
          ] }),
          /* @__PURE__ */ jsx12("div", { className: "form-actions", children: /* @__PURE__ */ jsx12("button", { type: "submit", className: "btn", children: "Aktualisieren" }) })
        ]
      }
    ) }),
    tab === "services" && /* @__PURE__ */ jsxs10(
      SectionCard,
      {
        title: "Service Highlights",
        description: "Icon, Titel und Beschreibung f\xFCr Kernleistungen",
        footer: /* @__PURE__ */ jsx12("small", { children: "Diese Services werden auf der Startseite im B2C/B2B Bereich dargestellt." }),
        children: [
          services.map((service, index) => /* @__PURE__ */ jsxs10("div", { className: "service-item", children: [
            /* @__PURE__ */ jsxs10("label", { children: [
              /* @__PURE__ */ jsx12("span", { children: "Icon" }),
              /* @__PURE__ */ jsx12(
                "input",
                {
                  value: service.icon,
                  onChange: (event) => {
                    const next = [...services];
                    next[index] = { ...next[index], icon: event.target.value };
                    setSettings((prev) => ({ ...prev, services: next }));
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxs10("label", { children: [
              /* @__PURE__ */ jsx12("span", { children: "Titel" }),
              /* @__PURE__ */ jsx12(
                "input",
                {
                  value: service.title,
                  onChange: (event) => {
                    const next = [...services];
                    next[index] = { ...next[index], title: event.target.value };
                    setSettings((prev) => ({ ...prev, services: next }));
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
              /* @__PURE__ */ jsx12("span", { children: "Beschreibung" }),
              /* @__PURE__ */ jsx12(
                "textarea",
                {
                  value: service.description,
                  onChange: (event) => {
                    const next = [...services];
                    next[index] = { ...next[index], description: event.target.value };
                    setSettings((prev) => ({ ...prev, services: next }));
                  }
                }
              )
            ] })
          ] }, index)),
          /* @__PURE__ */ jsxs10("div", { className: "form-actions", children: [
            /* @__PURE__ */ jsx12("button", { type: "button", className: "btn", onClick: () => handleSaveSettings("services", services), children: "Speichern" }),
            /* @__PURE__ */ jsx12(
              "button",
              {
                type: "button",
                className: "btn btn-link",
                onClick: () => setSettings((prev) => ({ ...prev, services: [...services, { icon: "\u2728", title: "Neue Leistung", description: "" }] })),
                children: "Service hinzuf\xFCgen"
              }
            )
          ] })
        ]
      }
    ),
    tab === "blog" && /* @__PURE__ */ jsxs10(
      SectionCard,
      {
        title: "Beitr\xE4ge",
        description: "Reise-News, Visa-Updates und B2B Inhalte verwalten",
        actions: /* @__PURE__ */ jsxs10("span", { children: [
          posts.length,
          " Beitr\xE4ge gesamt"
        ] }),
        children: [
          /* @__PURE__ */ jsx12("div", { className: "post-list", children: posts.map((post) => /* @__PURE__ */ jsxs10("details", { className: "collapsible", children: [
            /* @__PURE__ */ jsxs10("summary", { children: [
              /* @__PURE__ */ jsx12("strong", { children: post.title }),
              /* @__PURE__ */ jsxs10("span", { className: "collapsible-meta", children: [
                post.status,
                " \xB7 ",
                post.publishedAt ? formatDate(post.publishedAt) : "Entwurf"
              ] })
            ] }),
            /* @__PURE__ */ jsxs10("div", { className: "collapsible-body", children: [
              /* @__PURE__ */ jsxs10("div", { className: "form-grid", children: [
                /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                  /* @__PURE__ */ jsx12("span", { children: "Titel" }),
                  /* @__PURE__ */ jsx12(
                    "input",
                    {
                      value: post.title,
                      onChange: (event) => setPosts(
                        (items) => items.map((item) => item.id === post.id ? { ...item, title: event.target.value } : item)
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                  /* @__PURE__ */ jsx12("span", { children: "Slug" }),
                  /* @__PURE__ */ jsx12(
                    "input",
                    {
                      value: post.slug || "",
                      onChange: (event) => setPosts(
                        (items) => items.map((item) => item.id === post.id ? { ...item, slug: event.target.value } : item)
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                  /* @__PURE__ */ jsx12("span", { children: "Teaser" }),
                  /* @__PURE__ */ jsx12(
                    "textarea",
                    {
                      value: post.excerpt || "",
                      onChange: (event) => setPosts(
                        (items) => items.map((item) => item.id === post.id ? { ...item, excerpt: event.target.value } : item)
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                  /* @__PURE__ */ jsx12("span", { children: "Inhalt" }),
                  /* @__PURE__ */ jsx12(
                    "textarea",
                    {
                      rows: 6,
                      value: post.content || "",
                      onChange: (event) => setPosts(
                        (items) => items.map((item) => item.id === post.id ? { ...item, content: event.target.value } : item)
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                  /* @__PURE__ */ jsx12("span", { children: "Bild-URL" }),
                  /* @__PURE__ */ jsx12(
                    "input",
                    {
                      value: post.imageUrl || "",
                      onChange: (event) => setPosts(
                        (items) => items.map((item) => item.id === post.id ? { ...item, imageUrl: event.target.value } : item)
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "Status" }),
                  /* @__PURE__ */ jsxs10(
                    "select",
                    {
                      value: post.status,
                      onChange: (event) => setPosts(
                        (items) => items.map((item) => item.id === post.id ? { ...item, status: event.target.value } : item)
                      ),
                      children: [
                        /* @__PURE__ */ jsx12("option", { value: "draft", children: "Entwurf" }),
                        /* @__PURE__ */ jsx12("option", { value: "published", children: "Ver\xF6ffentlicht" }),
                        /* @__PURE__ */ jsx12("option", { value: "scheduled", children: "Geplant" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "Ver\xF6ffentlichung" }),
                  /* @__PURE__ */ jsx12(
                    "input",
                    {
                      type: "date",
                      value: post.publishedAt ? post.publishedAt.substring(0, 10) : "",
                      onChange: (event) => setPosts(
                        (items) => items.map(
                          (item) => item.id === post.id ? { ...item, publishedAt: event.target.value } : item
                        )
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { children: [
                  /* @__PURE__ */ jsx12("span", { children: "Geplant" }),
                  /* @__PURE__ */ jsx12(
                    "input",
                    {
                      type: "date",
                      value: post.scheduledAt ? post.scheduledAt.substring(0, 10) : "",
                      onChange: (event) => setPosts(
                        (items) => items.map(
                          (item) => item.id === post.id ? { ...item, scheduledAt: event.target.value } : item
                        )
                      )
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                  /* @__PURE__ */ jsx12("span", { children: "Tags (Kommagetrennt)" }),
                  /* @__PURE__ */ jsx12(
                    "input",
                    {
                      value: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "",
                      onChange: (event) => setPosts(
                        (items) => items.map((item) => item.id === post.id ? { ...item, tags: event.target.value } : item)
                      )
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs10("div", { className: "collapsible-actions", children: [
                /* @__PURE__ */ jsx12("button", { type: "button", className: "btn", onClick: () => handleUpdatePost(post), children: "Speichern" }),
                /* @__PURE__ */ jsx12("button", { type: "button", className: "btn btn-link", onClick: () => handleDeletePost(post.id), children: "L\xF6schen" })
              ] })
            ] })
          ] }, post.id)) }),
          /* @__PURE__ */ jsxs10("form", { className: "post-create", onSubmit: handleCreatePost, children: [
            /* @__PURE__ */ jsx12("h3", { children: "Neuen Beitrag erstellen" }),
            /* @__PURE__ */ jsxs10("div", { className: "form-grid", children: [
              /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx12("span", { children: "Titel" }),
                /* @__PURE__ */ jsx12("input", { value: newPost.title, onChange: (event) => setNewPost((prev) => ({ ...prev, title: event.target.value })), required: true })
              ] }),
              /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx12("span", { children: "Slug" }),
                /* @__PURE__ */ jsx12("input", { value: newPost.slug, onChange: (event) => setNewPost((prev) => ({ ...prev, slug: event.target.value })) })
              ] }),
              /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx12("span", { children: "Teaser" }),
                /* @__PURE__ */ jsx12(
                  "textarea",
                  {
                    value: newPost.excerpt,
                    onChange: (event) => setNewPost((prev) => ({ ...prev, excerpt: event.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx12("span", { children: "Inhalt" }),
                /* @__PURE__ */ jsx12(
                  "textarea",
                  {
                    rows: 6,
                    value: newPost.content,
                    onChange: (event) => setNewPost((prev) => ({ ...prev, content: event.target.value })),
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx12("span", { children: "Bild-URL" }),
                /* @__PURE__ */ jsx12("input", { value: newPost.imageUrl, onChange: (event) => setNewPost((prev) => ({ ...prev, imageUrl: event.target.value })) })
              ] }),
              /* @__PURE__ */ jsxs10("label", { children: [
                /* @__PURE__ */ jsx12("span", { children: "Status" }),
                /* @__PURE__ */ jsxs10("select", { value: newPost.status, onChange: (event) => setNewPost((prev) => ({ ...prev, status: event.target.value })), children: [
                  /* @__PURE__ */ jsx12("option", { value: "draft", children: "Entwurf" }),
                  /* @__PURE__ */ jsx12("option", { value: "published", children: "Ver\xF6ffentlicht" }),
                  /* @__PURE__ */ jsx12("option", { value: "scheduled", children: "Geplant" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs10("label", { children: [
                /* @__PURE__ */ jsx12("span", { children: "Ver\xF6ffentlichung" }),
                /* @__PURE__ */ jsx12(
                  "input",
                  {
                    type: "date",
                    value: newPost.publishedAt,
                    onChange: (event) => setNewPost((prev) => ({ ...prev, publishedAt: event.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs10("label", { children: [
                /* @__PURE__ */ jsx12("span", { children: "Geplante Ver\xF6ffentlichung" }),
                /* @__PURE__ */ jsx12(
                  "input",
                  {
                    type: "date",
                    value: newPost.scheduledAt,
                    onChange: (event) => setNewPost((prev) => ({ ...prev, scheduledAt: event.target.value }))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs10("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx12("span", { children: "Tags" }),
                /* @__PURE__ */ jsx12("input", { value: newPost.tags, onChange: (event) => setNewPost((prev) => ({ ...prev, tags: event.target.value })) })
              ] })
            ] }),
            /* @__PURE__ */ jsx12("button", { type: "submit", className: "btn btn-primary", children: "Beitrag ver\xF6ffentlichen" })
          ] })
        ]
      }
    )
  ] });
}

// admin/pages/OffersPage.jsx
import React13, { useEffect as useEffect4, useState as useState6 } from "react";
import { jsx as jsx13, jsxs as jsxs11 } from "react/jsx-runtime";
var EMPTY_DEAL = {
  title: "",
  destination: "",
  description: "",
  price: "",
  nights: "",
  imageUrl: "",
  endDate: "",
  perksText: "",
  isHot: true
};
function OffersPage() {
  const { request } = useApi();
  const [deals, setDeals] = useState6([]);
  const [newDeal, setNewDeal] = useState6(EMPTY_DEAL);
  const [loading, setLoading] = useState6(true);
  const [error, setError] = useState6(null);
  const [message, setMessage] = useState6(null);
  useEffect4(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request("/api/admin/deals");
        if (!active)
          return;
        setDeals(response.map((deal) => ({ ...deal, perksText: (deal.perks || []).join("\n") })));
      } catch (err) {
        if (active)
          setError(err.message);
      } finally {
        if (active)
          setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4e3);
  };
  const handleDealChange = (id, field, value) => {
    setDeals((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const handleSaveDeal = async (deal) => {
    try {
      const payload = {
        title: deal.title,
        destination: deal.destination,
        description: deal.description,
        price: deal.price ? Number(deal.price) : null,
        nights: deal.nights ? Number(deal.nights) : null,
        imageUrl: deal.imageUrl,
        endDate: deal.endDate || null,
        perks: deal.perksText ? deal.perksText.split("\n").map((item) => item.trim()).filter(Boolean) : [],
        isHot: Boolean(deal.isHot)
      };
      const updated = await request(`/api/admin/deals/${deal.id}`, { method: "PUT", body: payload });
      setDeals((items) => items.map((item) => item.id === deal.id ? { ...updated, perksText: (updated.perks || []).join("\n") } : item));
      showMessage("Angebot gespeichert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleDeleteDeal = async (id) => {
    try {
      await request(`/api/admin/deals/${id}`, { method: "DELETE" });
      setDeals((items) => items.filter((item) => item.id !== id));
      showMessage("Angebot entfernt.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreateDeal = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        title: newDeal.title,
        destination: newDeal.destination,
        description: newDeal.description,
        price: newDeal.price ? Number(newDeal.price) : null,
        nights: newDeal.nights ? Number(newDeal.nights) : null,
        imageUrl: newDeal.imageUrl,
        endDate: newDeal.endDate || null,
        perks: newDeal.perksText ? newDeal.perksText.split("\n").map((item) => item.trim()).filter(Boolean) : [],
        isHot: Boolean(newDeal.isHot)
      };
      const created = await request("/api/admin/deals", { method: "POST", body: payload });
      setDeals((items) => [{ ...created, perksText: (created.perks || []).join("\n") }, ...items]);
      setNewDeal(EMPTY_DEAL);
      showMessage("Neues Angebot angelegt.");
    } catch (err) {
      setError(err.message);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx13(LoadingScreen, { message: "Angebote werden geladen \u2026" });
  }
  if (error) {
    return /* @__PURE__ */ jsx13(InlineAlert, { type: "error", title: "Fehler", message: error });
  }
  return /* @__PURE__ */ jsxs11("div", { className: "offers-page", children: [
    message && /* @__PURE__ */ jsx13(InlineAlert, { type: message.type, message: message.text }),
    /* @__PURE__ */ jsxs11(
      SectionCard,
      {
        title: "Hot Deals & Last Minute",
        description: "Sonderangebote mit Countdown und Highlights",
        footer: /* @__PURE__ */ jsx13("small", { children: "Der Countdown orientiert sich am Enddatum. Angebote lassen sich als Last Minute markieren." }),
        children: [
          /* @__PURE__ */ jsxs11("table", { className: "data-table", children: [
            /* @__PURE__ */ jsx13("thead", { children: /* @__PURE__ */ jsxs11("tr", { children: [
              /* @__PURE__ */ jsx13("th", { children: "Angebot" }),
              /* @__PURE__ */ jsx13("th", { children: "Ziel" }),
              /* @__PURE__ */ jsx13("th", { children: "Preis" }),
              /* @__PURE__ */ jsx13("th", { children: "N\xE4chte" }),
              /* @__PURE__ */ jsx13("th", { children: "Enddatum" }),
              /* @__PURE__ */ jsx13("th", { children: "Hot" }),
              /* @__PURE__ */ jsx13("th", {})
            ] }) }),
            /* @__PURE__ */ jsx13("tbody", { children: deals.map((deal) => /* @__PURE__ */ jsxs11("tr", { children: [
              /* @__PURE__ */ jsxs11("td", { children: [
                /* @__PURE__ */ jsx13("input", { value: deal.title, onChange: (event) => handleDealChange(deal.id, "title", event.target.value) }),
                /* @__PURE__ */ jsx13(
                  "textarea",
                  {
                    value: deal.description || "",
                    onChange: (event) => handleDealChange(deal.id, "description", event.target.value),
                    className: "table-textarea"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx13("td", { children: /* @__PURE__ */ jsx13("input", { value: deal.destination || "", onChange: (event) => handleDealChange(deal.id, "destination", event.target.value) }) }),
              /* @__PURE__ */ jsxs11("td", { children: [
                /* @__PURE__ */ jsx13(
                  "input",
                  {
                    type: "number",
                    value: deal.price ?? "",
                    onChange: (event) => handleDealChange(deal.id, "price", event.target.value)
                  }
                ),
                /* @__PURE__ */ jsx13("div", { className: "table-meta", children: formatCurrency(deal.price) })
              ] }),
              /* @__PURE__ */ jsx13("td", { children: /* @__PURE__ */ jsx13(
                "input",
                {
                  type: "number",
                  value: deal.nights ?? "",
                  onChange: (event) => handleDealChange(deal.id, "nights", event.target.value)
                }
              ) }),
              /* @__PURE__ */ jsxs11("td", { children: [
                /* @__PURE__ */ jsx13(
                  "input",
                  {
                    type: "date",
                    value: deal.endDate ? deal.endDate.substring(0, 10) : "",
                    onChange: (event) => handleDealChange(deal.id, "endDate", event.target.value)
                  }
                ),
                /* @__PURE__ */ jsx13("div", { className: "table-meta", children: deal.endDate ? formatDate(deal.endDate) : "\u2014" })
              ] }),
              /* @__PURE__ */ jsx13("td", { children: /* @__PURE__ */ jsxs11("label", { className: "toggle", children: [
                /* @__PURE__ */ jsx13(
                  "input",
                  {
                    type: "checkbox",
                    checked: Boolean(deal.isHot),
                    onChange: (event) => handleDealChange(deal.id, "isHot", event.target.checked)
                  }
                ),
                /* @__PURE__ */ jsx13("span", { className: "toggle-indicator" })
              ] }) }),
              /* @__PURE__ */ jsxs11("td", { className: "table-actions", children: [
                /* @__PURE__ */ jsx13("button", { type: "button", className: "btn btn-small", onClick: () => handleSaveDeal(deal), children: "Speichern" }),
                /* @__PURE__ */ jsx13("button", { type: "button", className: "btn btn-link", onClick: () => handleDeleteDeal(deal.id), children: "L\xF6schen" })
              ] })
            ] }, deal.id)) })
          ] }),
          /* @__PURE__ */ jsx13("div", { className: "deal-details", children: deals.map((deal) => /* @__PURE__ */ jsxs11("details", { className: "collapsible", children: [
            /* @__PURE__ */ jsxs11("summary", { children: [
              /* @__PURE__ */ jsx13("strong", { children: deal.title }),
              /* @__PURE__ */ jsx13("span", { className: "collapsible-meta", children: "Highlights" })
            ] }),
            /* @__PURE__ */ jsx13(
              "textarea",
              {
                value: deal.perksText || "",
                onChange: (event) => handleDealChange(deal.id, "perksText", event.target.value),
                className: "table-textarea",
                placeholder: "Vorteil 1\nVorteil 2"
              }
            )
          ] }, `perks-${deal.id}`)) })
        ]
      }
    ),
    /* @__PURE__ */ jsx13(SectionCard, { title: "Neues Angebot", description: "Schnelles Anlegen eines weiteren Deals", children: /* @__PURE__ */ jsxs11("form", { className: "form-grid", onSubmit: handleCreateDeal, children: [
      /* @__PURE__ */ jsxs11("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx13("span", { children: "Titel" }),
        /* @__PURE__ */ jsx13("input", { value: newDeal.title, onChange: (event) => setNewDeal((prev) => ({ ...prev, title: event.target.value })), required: true })
      ] }),
      /* @__PURE__ */ jsxs11("label", { children: [
        /* @__PURE__ */ jsx13("span", { children: "Destination" }),
        /* @__PURE__ */ jsx13("input", { value: newDeal.destination, onChange: (event) => setNewDeal((prev) => ({ ...prev, destination: event.target.value })) })
      ] }),
      /* @__PURE__ */ jsxs11("label", { children: [
        /* @__PURE__ */ jsx13("span", { children: "Preis (EUR)" }),
        /* @__PURE__ */ jsx13(
          "input",
          {
            type: "number",
            value: newDeal.price,
            onChange: (event) => setNewDeal((prev) => ({ ...prev, price: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs11("label", { children: [
        /* @__PURE__ */ jsx13("span", { children: "N\xE4chte" }),
        /* @__PURE__ */ jsx13(
          "input",
          {
            type: "number",
            value: newDeal.nights,
            onChange: (event) => setNewDeal((prev) => ({ ...prev, nights: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs11("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx13("span", { children: "Beschreibung" }),
        /* @__PURE__ */ jsx13(
          "textarea",
          {
            value: newDeal.description,
            onChange: (event) => setNewDeal((prev) => ({ ...prev, description: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs11("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx13("span", { children: "Bild-URL" }),
        /* @__PURE__ */ jsx13("input", { value: newDeal.imageUrl, onChange: (event) => setNewDeal((prev) => ({ ...prev, imageUrl: event.target.value })) })
      ] }),
      /* @__PURE__ */ jsxs11("label", { children: [
        /* @__PURE__ */ jsx13("span", { children: "Enddatum" }),
        /* @__PURE__ */ jsx13(
          "input",
          {
            type: "date",
            value: newDeal.endDate,
            onChange: (event) => setNewDeal((prev) => ({ ...prev, endDate: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs11("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx13("span", { children: "Highlights" }),
        /* @__PURE__ */ jsx13(
          "textarea",
          {
            placeholder: "Vorteil 1\nVorteil 2",
            value: newDeal.perksText,
            onChange: (event) => setNewDeal((prev) => ({ ...prev, perksText: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs11("label", { className: "toggle", children: [
        /* @__PURE__ */ jsx13(
          "input",
          {
            type: "checkbox",
            checked: newDeal.isHot,
            onChange: (event) => setNewDeal((prev) => ({ ...prev, isHot: event.target.checked }))
          }
        ),
        /* @__PURE__ */ jsx13("span", { className: "toggle-indicator" }),
        /* @__PURE__ */ jsx13("span", { children: "Als Hot Deal markieren" })
      ] }),
      /* @__PURE__ */ jsx13("div", { className: "form-actions full-width", children: /* @__PURE__ */ jsx13("button", { type: "submit", className: "btn btn-primary", children: "Angebot speichern" }) })
    ] }) })
  ] });
}

// admin/pages/ProductsPage.jsx
import React14, { useEffect as useEffect5, useMemo as useMemo3, useState as useState7 } from "react";
import { jsx as jsx14, jsxs as jsxs12 } from "react/jsx-runtime";
var PRODUCT_TYPES = [
  { value: "flight", label: "Fl\xFCge" },
  { value: "hotel", label: "Hotels" },
  { value: "package", label: "Pakete" },
  { value: "transfer", label: "Transfers" }
];
var EMPTY_PRODUCT = {
  title: "",
  location: "",
  description: "",
  priceFrom: "",
  priceDisplay: "",
  availabilityStart: "",
  availabilityEnd: "",
  imageUrl: "",
  rating: "",
  amenitiesText: "",
  isHot: false,
  commissionRule: ""
};
function ProductsPage() {
  const { request } = useApi();
  const [products, setProducts] = useState7([]);
  const [activeType, setActiveType] = useState7(PRODUCT_TYPES[0].value);
  const [loading, setLoading] = useState7(true);
  const [error, setError] = useState7(null);
  const [message, setMessage] = useState7(null);
  const [newProduct, setNewProduct] = useState7({ ...EMPTY_PRODUCT, type: PRODUCT_TYPES[0].value });
  useEffect5(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request("/api/admin/products");
        if (!active)
          return;
        setProducts(response.map((product) => ({ ...product, amenitiesText: (product.amenities || []).join("\n") })));
      } catch (err) {
        if (active)
          setError(err.message);
      } finally {
        if (active)
          setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);
  const filteredProducts = useMemo3(
    () => products.filter((product) => product.type === activeType),
    [products, activeType]
  );
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4e3);
  };
  const handleChange = (id, field, value) => {
    setProducts((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const handleSave = async (product) => {
    try {
      const payload = {
        type: product.type,
        title: product.title,
        location: product.location,
        description: product.description,
        priceFrom: product.priceFrom ? Number(product.priceFrom) : null,
        priceDisplay: product.priceDisplay,
        availabilityStart: product.availabilityStart || null,
        availabilityEnd: product.availabilityEnd || null,
        imageUrl: product.imageUrl,
        rating: product.rating ? Number(product.rating) : null,
        amenities: product.amenitiesText ? product.amenitiesText.split("\n").map((item) => item.trim()).filter(Boolean) : [],
        isHot: Boolean(product.isHot),
        commissionRule: product.commissionRule
      };
      const updated = await request(`/api/admin/products/${product.id}`, { method: "PUT", body: payload });
      setProducts(
        (items) => items.map((item) => item.id === product.id ? { ...updated, amenitiesText: (updated.amenities || []).join("\n") } : item)
      );
      showMessage("Produkt aktualisiert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleDelete = async (id) => {
    try {
      await request(`/api/admin/products/${id}`, { method: "DELETE" });
      setProducts((items) => items.filter((item) => item.id !== id));
      showMessage("Produkt entfernt.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        type: newProduct.type,
        title: newProduct.title,
        location: newProduct.location,
        description: newProduct.description,
        priceFrom: newProduct.priceFrom ? Number(newProduct.priceFrom) : null,
        priceDisplay: newProduct.priceDisplay,
        availabilityStart: newProduct.availabilityStart || null,
        availabilityEnd: newProduct.availabilityEnd || null,
        imageUrl: newProduct.imageUrl,
        rating: newProduct.rating ? Number(newProduct.rating) : null,
        amenities: newProduct.amenitiesText ? newProduct.amenitiesText.split("\n").map((item) => item.trim()).filter(Boolean) : [],
        isHot: Boolean(newProduct.isHot),
        commissionRule: newProduct.commissionRule
      };
      const created = await request("/api/admin/products", { method: "POST", body: payload });
      setProducts((items) => [{ ...created, amenitiesText: (created.amenities || []).join("\n") }, ...items]);
      setNewProduct({ ...EMPTY_PRODUCT, type: newProduct.type });
      showMessage("Produkt angelegt.");
    } catch (err) {
      setError(err.message);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx14(LoadingScreen, { message: "Produkte werden geladen \u2026" });
  }
  if (error) {
    return /* @__PURE__ */ jsx14(InlineAlert, { type: "error", title: "Fehler", message: error });
  }
  return /* @__PURE__ */ jsxs12("div", { className: "products-page", children: [
    message && /* @__PURE__ */ jsx14(InlineAlert, { type: message.type, message: message.text }),
    /* @__PURE__ */ jsx14(TabNav, { items: PRODUCT_TYPES, active: activeType, onChange: (value) => setActiveType(value) }),
    /* @__PURE__ */ jsx14(
      SectionCard,
      {
        title: `Bestand: ${PRODUCT_TYPES.find((item) => item.value === activeType)?.label ?? ""}`,
        description: "Daten werden im Frontend automatisch aktualisiert",
        children: filteredProducts.length === 0 ? /* @__PURE__ */ jsx14("p", { className: "empty-state", children: "Keine Produkte vorhanden." }) : filteredProducts.map((product) => /* @__PURE__ */ jsxs12("details", { className: "collapsible", open: true, children: [
          /* @__PURE__ */ jsxs12("summary", { children: [
            /* @__PURE__ */ jsx14("strong", { children: product.title }),
            /* @__PURE__ */ jsxs12("span", { className: "collapsible-meta", children: [
              formatCurrency(product.priceFrom),
              " \xB7 ",
              product.availabilityStart ? formatDate(product.availabilityStart) : "Flexibel"
            ] })
          ] }),
          /* @__PURE__ */ jsxs12("div", { className: "collapsible-body", children: [
            /* @__PURE__ */ jsxs12("div", { className: "form-grid", children: [
              /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx14("span", { children: "Titel" }),
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    value: product.title,
                    onChange: (event) => handleChange(product.id, "title", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx14("span", { children: "Standort / Route" }),
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    value: product.location || "",
                    onChange: (event) => handleChange(product.id, "location", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx14("span", { children: "Beschreibung" }),
                /* @__PURE__ */ jsx14(
                  "textarea",
                  {
                    rows: 4,
                    value: product.description || "",
                    onChange: (event) => handleChange(product.id, "description", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { children: [
                /* @__PURE__ */ jsx14("span", { children: "Preis ab (EUR)" }),
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    type: "number",
                    value: product.priceFrom ?? "",
                    onChange: (event) => handleChange(product.id, "priceFrom", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { children: [
                /* @__PURE__ */ jsx14("span", { children: "Preistext" }),
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    value: product.priceDisplay || "",
                    onChange: (event) => handleChange(product.id, "priceDisplay", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { children: [
                /* @__PURE__ */ jsx14("span", { children: "Verf\xFCgbar ab" }),
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    type: "date",
                    value: product.availabilityStart ? product.availabilityStart.substring(0, 10) : "",
                    onChange: (event) => handleChange(product.id, "availabilityStart", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { children: [
                /* @__PURE__ */ jsx14("span", { children: "Verf\xFCgbar bis" }),
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    type: "date",
                    value: product.availabilityEnd ? product.availabilityEnd.substring(0, 10) : "",
                    onChange: (event) => handleChange(product.id, "availabilityEnd", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx14("span", { children: "Bild-URL" }),
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    value: product.imageUrl || "",
                    onChange: (event) => handleChange(product.id, "imageUrl", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { children: [
                /* @__PURE__ */ jsx14("span", { children: "Bewertung" }),
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    type: "number",
                    step: "0.1",
                    value: product.rating ?? "",
                    onChange: (event) => handleChange(product.id, "rating", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx14("span", { children: "Leistungen / Amenities" }),
                /* @__PURE__ */ jsx14(
                  "textarea",
                  {
                    value: product.amenitiesText || "",
                    onChange: (event) => handleChange(product.id, "amenitiesText", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
                /* @__PURE__ */ jsx14("span", { children: "Provision / Nettoregel" }),
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    value: product.commissionRule || "",
                    onChange: (event) => handleChange(product.id, "commissionRule", event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs12("label", { className: "toggle", children: [
                /* @__PURE__ */ jsx14(
                  "input",
                  {
                    type: "checkbox",
                    checked: Boolean(product.isHot),
                    onChange: (event) => handleChange(product.id, "isHot", event.target.checked)
                  }
                ),
                /* @__PURE__ */ jsx14("span", { className: "toggle-indicator" }),
                /* @__PURE__ */ jsx14("span", { children: "Hot Deal" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs12("div", { className: "collapsible-actions", children: [
              /* @__PURE__ */ jsx14("button", { type: "button", className: "btn", onClick: () => handleSave(product), children: "Speichern" }),
              /* @__PURE__ */ jsx14("button", { type: "button", className: "btn btn-link", onClick: () => handleDelete(product.id), children: "L\xF6schen" })
            ] })
          ] })
        ] }, product.id))
      }
    ),
    /* @__PURE__ */ jsx14(SectionCard, { title: "Neues Produkt", description: "Dem gew\xE4hlten Bereich hinzuf\xFCgen", children: /* @__PURE__ */ jsxs12("form", { className: "form-grid", onSubmit: handleCreate, children: [
      /* @__PURE__ */ jsxs12("label", { children: [
        /* @__PURE__ */ jsx14("span", { children: "Kategorie" }),
        /* @__PURE__ */ jsx14("select", { value: newProduct.type, onChange: (event) => setNewProduct((prev) => ({ ...prev, type: event.target.value })), children: PRODUCT_TYPES.map((type) => /* @__PURE__ */ jsx14("option", { value: type.value, children: type.label }, type.value)) })
      ] }),
      /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx14("span", { children: "Titel" }),
        /* @__PURE__ */ jsx14("input", { value: newProduct.title, onChange: (event) => setNewProduct((prev) => ({ ...prev, title: event.target.value })), required: true })
      ] }),
      /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx14("span", { children: "Standort / Route" }),
        /* @__PURE__ */ jsx14("input", { value: newProduct.location, onChange: (event) => setNewProduct((prev) => ({ ...prev, location: event.target.value })) })
      ] }),
      /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx14("span", { children: "Beschreibung" }),
        /* @__PURE__ */ jsx14(
          "textarea",
          {
            rows: 4,
            value: newProduct.description,
            onChange: (event) => setNewProduct((prev) => ({ ...prev, description: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12("label", { children: [
        /* @__PURE__ */ jsx14("span", { children: "Preis ab (EUR)" }),
        /* @__PURE__ */ jsx14(
          "input",
          {
            type: "number",
            value: newProduct.priceFrom,
            onChange: (event) => setNewProduct((prev) => ({ ...prev, priceFrom: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12("label", { children: [
        /* @__PURE__ */ jsx14("span", { children: "Preistext" }),
        /* @__PURE__ */ jsx14(
          "input",
          {
            value: newProduct.priceDisplay,
            onChange: (event) => setNewProduct((prev) => ({ ...prev, priceDisplay: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12("label", { children: [
        /* @__PURE__ */ jsx14("span", { children: "Verf\xFCgbar ab" }),
        /* @__PURE__ */ jsx14(
          "input",
          {
            type: "date",
            value: newProduct.availabilityStart,
            onChange: (event) => setNewProduct((prev) => ({ ...prev, availabilityStart: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12("label", { children: [
        /* @__PURE__ */ jsx14("span", { children: "Verf\xFCgbar bis" }),
        /* @__PURE__ */ jsx14(
          "input",
          {
            type: "date",
            value: newProduct.availabilityEnd,
            onChange: (event) => setNewProduct((prev) => ({ ...prev, availabilityEnd: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx14("span", { children: "Bild-URL" }),
        /* @__PURE__ */ jsx14("input", { value: newProduct.imageUrl, onChange: (event) => setNewProduct((prev) => ({ ...prev, imageUrl: event.target.value })) })
      ] }),
      /* @__PURE__ */ jsxs12("label", { children: [
        /* @__PURE__ */ jsx14("span", { children: "Bewertung" }),
        /* @__PURE__ */ jsx14(
          "input",
          {
            type: "number",
            step: "0.1",
            value: newProduct.rating,
            onChange: (event) => setNewProduct((prev) => ({ ...prev, rating: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx14("span", { children: "Ausstattung / Leistungen" }),
        /* @__PURE__ */ jsx14(
          "textarea",
          {
            value: newProduct.amenitiesText,
            onChange: (event) => setNewProduct((prev) => ({ ...prev, amenitiesText: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12("label", { className: "full-width", children: [
        /* @__PURE__ */ jsx14("span", { children: "Provision / Nettoregel" }),
        /* @__PURE__ */ jsx14(
          "input",
          {
            value: newProduct.commissionRule,
            onChange: (event) => setNewProduct((prev) => ({ ...prev, commissionRule: event.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs12("label", { className: "toggle", children: [
        /* @__PURE__ */ jsx14(
          "input",
          {
            type: "checkbox",
            checked: newProduct.isHot,
            onChange: (event) => setNewProduct((prev) => ({ ...prev, isHot: event.target.checked }))
          }
        ),
        /* @__PURE__ */ jsx14("span", { className: "toggle-indicator" }),
        /* @__PURE__ */ jsx14("span", { children: "Hot Deal" })
      ] }),
      /* @__PURE__ */ jsx14("div", { className: "form-actions full-width", children: /* @__PURE__ */ jsx14("button", { type: "submit", className: "btn btn-primary", children: "Produkt speichern" }) })
    ] }) })
  ] });
}

// admin/pages/UsersPage.jsx
import React15, { useEffect as useEffect6, useState as useState8 } from "react";
import { jsx as jsx15, jsxs as jsxs13 } from "react/jsx-runtime";
var NEW_CUSTOMER = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  status: "active"
};
var NEW_PARTNER = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  commissionRate: 10,
  accessEnabled: true,
  notes: ""
};
function UsersPage() {
  const { request } = useApi();
  const [customers, setCustomers] = useState8([]);
  const [partners, setPartners] = useState8([]);
  const [contactRequests, setContactRequests] = useState8([]);
  const [partnerRequests, setPartnerRequests] = useState8([]);
  const [newsletter, setNewsletter] = useState8([]);
  const [newCustomer, setNewCustomer] = useState8(NEW_CUSTOMER);
  const [newPartner, setNewPartner] = useState8(NEW_PARTNER);
  const [loading, setLoading] = useState8(true);
  const [error, setError] = useState8(null);
  const [message, setMessage] = useState8(null);
  useEffect6(() => {
    let active = true;
    const load = async () => {
      try {
        const [customerRes, partnerRes, contactRes, partnerReqRes, newsletterRes] = await Promise.all([
          request("/api/admin/customers"),
          request("/api/admin/partners"),
          request("/api/admin/requests/contact"),
          request("/api/admin/requests/partners"),
          request("/api/admin/newsletter")
        ]);
        if (!active)
          return;
        setCustomers(customerRes);
        setPartners(partnerRes);
        setContactRequests(contactRes);
        setPartnerRequests(partnerReqRes);
        setNewsletter(newsletterRes);
      } catch (err) {
        if (active)
          setError(err.message);
      } finally {
        if (active)
          setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4e3);
  };
  const handleCustomerChange = (id, field, value) => {
    setCustomers((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const handlePartnerChange = (id, field, value) => {
    setPartners((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const handleSaveCustomer = async (customer) => {
    try {
      const payload = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status
      };
      const updated = await request(`/api/admin/customers/${customer.id}`, { method: "PUT", body: payload });
      setCustomers((items) => items.map((item) => item.id === customer.id ? updated : item));
      showMessage("Kundendaten gespeichert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreateCustomer = async (event) => {
    event.preventDefault();
    try {
      const created = await request("/api/admin/customers", { method: "POST", body: newCustomer });
      setCustomers((items) => [created, ...items]);
      setNewCustomer(NEW_CUSTOMER);
      showMessage("Neuer Kunde angelegt.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleResetPassword = async (id) => {
    const password = window.prompt("Neues Passwort f\xFCr diesen Kunden setzen:");
    if (!password)
      return;
    try {
      await request(`/api/admin/customers/${id}/reset-password`, { method: "POST", body: { password } });
      showMessage("Passwort aktualisiert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleSavePartner = async (partner) => {
    try {
      const payload = {
        companyName: partner.companyName,
        contactName: partner.contactName,
        email: partner.email,
        phone: partner.phone,
        commissionRate: partner.commissionRate ? Number(partner.commissionRate) : 0,
        accessEnabled: Boolean(partner.accessEnabled),
        notes: partner.notes
      };
      const updated = await request(`/api/admin/partners/${partner.id}`, { method: "PUT", body: payload });
      setPartners((items) => items.map((item) => item.id === partner.id ? updated : item));
      showMessage("Partner aktualisiert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreatePartner = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...newPartner,
        commissionRate: newPartner.commissionRate ? Number(newPartner.commissionRate) : 0,
        accessEnabled: Boolean(newPartner.accessEnabled)
      };
      const created = await request("/api/admin/partners", { method: "POST", body: payload });
      setPartners((items) => [created, ...items]);
      setNewPartner(NEW_PARTNER);
      showMessage("Partnerprofil erstellt.");
    } catch (err) {
      setError(err.message);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx15(LoadingScreen, { message: "Daten werden geladen \u2026" });
  }
  if (error) {
    return /* @__PURE__ */ jsx15(InlineAlert, { type: "error", title: "Fehler", message: error });
  }
  return /* @__PURE__ */ jsxs13("div", { className: "users-page", children: [
    message && /* @__PURE__ */ jsx15(InlineAlert, { type: message.type, message: message.text }),
    /* @__PURE__ */ jsxs13(SectionCard, { title: "Kunden", description: "Buchungshistorie und Login-Verwaltung", children: [
      customers.length === 0 ? /* @__PURE__ */ jsx15("p", { className: "empty-state", children: "Noch keine Kunden angelegt." }) : /* @__PURE__ */ jsxs13("table", { className: "data-table", children: [
        /* @__PURE__ */ jsx15("thead", { children: /* @__PURE__ */ jsxs13("tr", { children: [
          /* @__PURE__ */ jsx15("th", { children: "Name" }),
          /* @__PURE__ */ jsx15("th", { children: "E-Mail" }),
          /* @__PURE__ */ jsx15("th", { children: "Telefon" }),
          /* @__PURE__ */ jsx15("th", { children: "Status" }),
          /* @__PURE__ */ jsx15("th", { children: "Buchungen" }),
          /* @__PURE__ */ jsx15("th", {})
        ] }) }),
        /* @__PURE__ */ jsx15("tbody", { children: customers.map((customer) => /* @__PURE__ */ jsxs13("tr", { children: [
          /* @__PURE__ */ jsxs13("td", { children: [
            /* @__PURE__ */ jsx15(
              "input",
              {
                value: customer.firstName || "",
                onChange: (event) => handleCustomerChange(customer.id, "firstName", event.target.value),
                placeholder: "Vorname"
              }
            ),
            /* @__PURE__ */ jsx15(
              "input",
              {
                value: customer.lastName || "",
                onChange: (event) => handleCustomerChange(customer.id, "lastName", event.target.value),
                placeholder: "Nachname"
              }
            )
          ] }),
          /* @__PURE__ */ jsx15("td", { children: /* @__PURE__ */ jsx15("input", { value: customer.email, onChange: (event) => handleCustomerChange(customer.id, "email", event.target.value) }) }),
          /* @__PURE__ */ jsx15("td", { children: /* @__PURE__ */ jsx15("input", { value: customer.phone || "", onChange: (event) => handleCustomerChange(customer.id, "phone", event.target.value) }) }),
          /* @__PURE__ */ jsx15("td", { children: /* @__PURE__ */ jsxs13("select", { value: customer.status, onChange: (event) => handleCustomerChange(customer.id, "status", event.target.value), children: [
            /* @__PURE__ */ jsx15("option", { value: "active", children: "Aktiv" }),
            /* @__PURE__ */ jsx15("option", { value: "inactive", children: "Inaktiv" })
          ] }) }),
          /* @__PURE__ */ jsx15("td", { children: customer.bookingCount }),
          /* @__PURE__ */ jsxs13("td", { className: "table-actions", children: [
            /* @__PURE__ */ jsx15("button", { type: "button", className: "btn btn-small", onClick: () => handleSaveCustomer(customer), children: "Speichern" }),
            /* @__PURE__ */ jsx15("button", { type: "button", className: "btn btn-link", onClick: () => handleResetPassword(customer.id), children: "Passwort zur\xFCcksetzen" })
          ] })
        ] }, customer.id)) })
      ] }),
      /* @__PURE__ */ jsxs13("form", { className: "inline-form", onSubmit: handleCreateCustomer, children: [
        /* @__PURE__ */ jsx15(
          "input",
          {
            placeholder: "Vorname",
            value: newCustomer.firstName,
            onChange: (event) => setNewCustomer((prev) => ({ ...prev, firstName: event.target.value })),
            required: true
          }
        ),
        /* @__PURE__ */ jsx15(
          "input",
          {
            placeholder: "Nachname",
            value: newCustomer.lastName,
            onChange: (event) => setNewCustomer((prev) => ({ ...prev, lastName: event.target.value })),
            required: true
          }
        ),
        /* @__PURE__ */ jsx15(
          "input",
          {
            type: "email",
            placeholder: "E-Mail",
            value: newCustomer.email,
            onChange: (event) => setNewCustomer((prev) => ({ ...prev, email: event.target.value })),
            required: true
          }
        ),
        /* @__PURE__ */ jsx15(
          "input",
          {
            placeholder: "Telefon",
            value: newCustomer.phone,
            onChange: (event) => setNewCustomer((prev) => ({ ...prev, phone: event.target.value }))
          }
        ),
        /* @__PURE__ */ jsx15(
          "input",
          {
            placeholder: "Initiales Passwort",
            value: newCustomer.password,
            onChange: (event) => setNewCustomer((prev) => ({ ...prev, password: event.target.value }))
          }
        ),
        /* @__PURE__ */ jsx15("button", { type: "submit", className: "btn btn-primary", children: "Kunde hinzuf\xFCgen" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs13(SectionCard, { title: "Partneragenturen", description: "Provisionen und Zug\xE4nge steuern", children: [
      partners.length === 0 ? /* @__PURE__ */ jsx15("p", { className: "empty-state", children: "Noch keine Partner hinterlegt." }) : partners.map((partner) => /* @__PURE__ */ jsxs13("details", { className: "collapsible", open: true, children: [
        /* @__PURE__ */ jsxs13("summary", { children: [
          /* @__PURE__ */ jsx15("strong", { children: partner.companyName }),
          /* @__PURE__ */ jsxs13("span", { className: "collapsible-meta", children: [
            partner.email,
            " \xB7 Provision ",
            partner.commissionRate,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs13("div", { className: "collapsible-body", children: [
          /* @__PURE__ */ jsxs13("div", { className: "form-grid", children: [
            /* @__PURE__ */ jsxs13("label", { className: "full-width", children: [
              /* @__PURE__ */ jsx15("span", { children: "Firmenname" }),
              /* @__PURE__ */ jsx15(
                "input",
                {
                  value: partner.companyName,
                  onChange: (event) => handlePartnerChange(partner.id, "companyName", event.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs13("label", { className: "full-width", children: [
              /* @__PURE__ */ jsx15("span", { children: "Ansprechpartner" }),
              /* @__PURE__ */ jsx15(
                "input",
                {
                  value: partner.contactName || "",
                  onChange: (event) => handlePartnerChange(partner.id, "contactName", event.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs13("label", { children: [
              /* @__PURE__ */ jsx15("span", { children: "E-Mail" }),
              /* @__PURE__ */ jsx15(
                "input",
                {
                  value: partner.email || "",
                  onChange: (event) => handlePartnerChange(partner.id, "email", event.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs13("label", { children: [
              /* @__PURE__ */ jsx15("span", { children: "Telefon" }),
              /* @__PURE__ */ jsx15(
                "input",
                {
                  value: partner.phone || "",
                  onChange: (event) => handlePartnerChange(partner.id, "phone", event.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs13("label", { children: [
              /* @__PURE__ */ jsx15("span", { children: "Provision (%)" }),
              /* @__PURE__ */ jsx15(
                "input",
                {
                  type: "number",
                  value: partner.commissionRate ?? 0,
                  onChange: (event) => handlePartnerChange(partner.id, "commissionRate", event.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs13("label", { className: "toggle", children: [
              /* @__PURE__ */ jsx15(
                "input",
                {
                  type: "checkbox",
                  checked: Boolean(partner.accessEnabled),
                  onChange: (event) => handlePartnerChange(partner.id, "accessEnabled", event.target.checked)
                }
              ),
              /* @__PURE__ */ jsx15("span", { className: "toggle-indicator" }),
              /* @__PURE__ */ jsx15("span", { children: "Zugang aktiv" })
            ] }),
            /* @__PURE__ */ jsxs13("label", { className: "full-width", children: [
              /* @__PURE__ */ jsx15("span", { children: "Notizen" }),
              /* @__PURE__ */ jsx15(
                "textarea",
                {
                  value: partner.notes || "",
                  onChange: (event) => handlePartnerChange(partner.id, "notes", event.target.value)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx15("div", { className: "collapsible-actions", children: /* @__PURE__ */ jsx15("button", { type: "button", className: "btn", onClick: () => handleSavePartner(partner), children: "Speichern" }) })
        ] })
      ] }, partner.id)),
      /* @__PURE__ */ jsxs13("form", { className: "form-grid", onSubmit: handleCreatePartner, children: [
        /* @__PURE__ */ jsx15("h3", { children: "Neuer Partner" }),
        /* @__PURE__ */ jsxs13("label", { className: "full-width", children: [
          /* @__PURE__ */ jsx15("span", { children: "Firmenname" }),
          /* @__PURE__ */ jsx15("input", { value: newPartner.companyName, onChange: (event) => setNewPartner((prev) => ({ ...prev, companyName: event.target.value })), required: true })
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "full-width", children: [
          /* @__PURE__ */ jsx15("span", { children: "Ansprechpartner" }),
          /* @__PURE__ */ jsx15("input", { value: newPartner.contactName, onChange: (event) => setNewPartner((prev) => ({ ...prev, contactName: event.target.value })) })
        ] }),
        /* @__PURE__ */ jsxs13("label", { children: [
          /* @__PURE__ */ jsx15("span", { children: "E-Mail" }),
          /* @__PURE__ */ jsx15("input", { value: newPartner.email, onChange: (event) => setNewPartner((prev) => ({ ...prev, email: event.target.value })) })
        ] }),
        /* @__PURE__ */ jsxs13("label", { children: [
          /* @__PURE__ */ jsx15("span", { children: "Telefon" }),
          /* @__PURE__ */ jsx15("input", { value: newPartner.phone, onChange: (event) => setNewPartner((prev) => ({ ...prev, phone: event.target.value })) })
        ] }),
        /* @__PURE__ */ jsxs13("label", { children: [
          /* @__PURE__ */ jsx15("span", { children: "Provision (%)" }),
          /* @__PURE__ */ jsx15(
            "input",
            {
              type: "number",
              value: newPartner.commissionRate,
              onChange: (event) => setNewPartner((prev) => ({ ...prev, commissionRate: event.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "toggle", children: [
          /* @__PURE__ */ jsx15(
            "input",
            {
              type: "checkbox",
              checked: newPartner.accessEnabled,
              onChange: (event) => setNewPartner((prev) => ({ ...prev, accessEnabled: event.target.checked }))
            }
          ),
          /* @__PURE__ */ jsx15("span", { className: "toggle-indicator" }),
          /* @__PURE__ */ jsx15("span", { children: "Zugang aktiv" })
        ] }),
        /* @__PURE__ */ jsxs13("label", { className: "full-width", children: [
          /* @__PURE__ */ jsx15("span", { children: "Notizen" }),
          /* @__PURE__ */ jsx15("textarea", { value: newPartner.notes, onChange: (event) => setNewPartner((prev) => ({ ...prev, notes: event.target.value })) })
        ] }),
        /* @__PURE__ */ jsx15("div", { className: "form-actions full-width", children: /* @__PURE__ */ jsx15("button", { type: "submit", className: "btn btn-primary", children: "Partner hinzuf\xFCgen" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx15(
      SectionCard,
      {
        title: "Kontaktanfragen",
        description: "Lead-Verlauf aus dem Kontaktformular",
        actions: /* @__PURE__ */ jsxs13("span", { children: [
          contactRequests.length,
          " Anfragen"
        ] }),
        children: contactRequests.length === 0 ? /* @__PURE__ */ jsx15("p", { className: "empty-state", children: "Keine neuen Kontaktanfragen." }) : /* @__PURE__ */ jsxs13("table", { className: "data-table", children: [
          /* @__PURE__ */ jsx15("thead", { children: /* @__PURE__ */ jsxs13("tr", { children: [
            /* @__PURE__ */ jsx15("th", { children: "Name" }),
            /* @__PURE__ */ jsx15("th", { children: "E-Mail" }),
            /* @__PURE__ */ jsx15("th", { children: "Telefon" }),
            /* @__PURE__ */ jsx15("th", { children: "Nachricht" }),
            /* @__PURE__ */ jsx15("th", { children: "Eingang" })
          ] }) }),
          /* @__PURE__ */ jsx15("tbody", { children: contactRequests.map((request2) => /* @__PURE__ */ jsxs13("tr", { children: [
            /* @__PURE__ */ jsx15("td", { children: `${request2.firstName || ""} ${request2.lastName || ""}`.trim() }),
            /* @__PURE__ */ jsx15("td", { children: request2.email }),
            /* @__PURE__ */ jsx15("td", { children: request2.phone }),
            /* @__PURE__ */ jsx15("td", { children: request2.message }),
            /* @__PURE__ */ jsx15("td", { children: formatDate(request2.createdAt) })
          ] }, request2.id)) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx15(
      SectionCard,
      {
        title: "Partneranfragen",
        description: "Agentur Leads via B2B Formular",
        actions: /* @__PURE__ */ jsxs13("span", { children: [
          partnerRequests.length,
          " offen"
        ] }),
        children: partnerRequests.length === 0 ? /* @__PURE__ */ jsx15("p", { className: "empty-state", children: "Keine Partneranfragen." }) : /* @__PURE__ */ jsxs13("table", { className: "data-table", children: [
          /* @__PURE__ */ jsx15("thead", { children: /* @__PURE__ */ jsxs13("tr", { children: [
            /* @__PURE__ */ jsx15("th", { children: "Unternehmen" }),
            /* @__PURE__ */ jsx15("th", { children: "Kontakt" }),
            /* @__PURE__ */ jsx15("th", { children: "E-Mail" }),
            /* @__PURE__ */ jsx15("th", { children: "Telefon" }),
            /* @__PURE__ */ jsx15("th", { children: "Nachricht" }),
            /* @__PURE__ */ jsx15("th", { children: "Datum" })
          ] }) }),
          /* @__PURE__ */ jsx15("tbody", { children: partnerRequests.map((request2) => /* @__PURE__ */ jsxs13("tr", { children: [
            /* @__PURE__ */ jsx15("td", { children: request2.companyName }),
            /* @__PURE__ */ jsx15("td", { children: request2.contactName }),
            /* @__PURE__ */ jsx15("td", { children: request2.email }),
            /* @__PURE__ */ jsx15("td", { children: request2.phone }),
            /* @__PURE__ */ jsx15("td", { children: request2.message }),
            /* @__PURE__ */ jsx15("td", { children: formatDate(request2.createdAt) })
          ] }, request2.id)) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx15(SectionCard, { title: "Newsletter", description: "Opt-ins aus dem Portal", children: newsletter.length === 0 ? /* @__PURE__ */ jsx15("p", { className: "empty-state", children: "Noch keine Newsletter-Abonnenten." }) : /* @__PURE__ */ jsxs13("table", { className: "data-table", children: [
      /* @__PURE__ */ jsx15("thead", { children: /* @__PURE__ */ jsxs13("tr", { children: [
        /* @__PURE__ */ jsx15("th", { children: "E-Mail" }),
        /* @__PURE__ */ jsx15("th", { children: "Name" }),
        /* @__PURE__ */ jsx15("th", { children: "Datum" })
      ] }) }),
      /* @__PURE__ */ jsx15("tbody", { children: newsletter.map((entry) => /* @__PURE__ */ jsxs13("tr", { children: [
        /* @__PURE__ */ jsx15("td", { children: entry.email }),
        /* @__PURE__ */ jsx15("td", { children: entry.firstName }),
        /* @__PURE__ */ jsx15("td", { children: formatDate(entry.createdAt) })
      ] }, entry.id)) })
    ] }) })
  ] });
}

// admin/pages/BookingsPage.jsx
import React16, { useEffect as useEffect7, useState as useState9 } from "react";
import { jsx as jsx16, jsxs as jsxs14 } from "react/jsx-runtime";
var STATUS_OPTIONS = ["offen", "best\xE4tigt", "abgeschlossen", "storniert"];
function BookingsPage() {
  const { request } = useApi();
  const [bookings, setBookings] = useState9([]);
  const [loading, setLoading] = useState9(true);
  const [error, setError] = useState9(null);
  const [message, setMessage] = useState9(null);
  useEffect7(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request("/api/admin/bookings");
        if (!active)
          return;
        setBookings(response);
      } catch (err) {
        if (active)
          setError(err.message);
      } finally {
        if (active)
          setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4e3);
  };
  const handleStatusChange = (id, value) => {
    setBookings((items) => items.map((item) => item.id === id ? { ...item, status: value } : item));
  };
  const handleSaveBooking = async (booking) => {
    try {
      const updated = await request(`/api/admin/bookings/${booking.id}`, {
        method: "PUT",
        body: { status: booking.status }
      });
      setBookings((items) => items.map((item) => item.id === booking.id ? { ...item, ...updated } : item));
      showMessage("Buchung aktualisiert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleExport = async () => {
    try {
      const response = await request("/api/admin/bookings/export", { rawResponse: true });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "monotours24-buchungen.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showMessage("Export erstellt.");
    } catch (err) {
      setError(err.message);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx16(LoadingScreen, { message: "Buchungen werden geladen \u2026" });
  }
  if (error) {
    return /* @__PURE__ */ jsx16(InlineAlert, { type: "error", title: "Fehler", message: error });
  }
  return /* @__PURE__ */ jsxs14("div", { className: "bookings-page", children: [
    message && /* @__PURE__ */ jsx16(InlineAlert, { type: message.type, message: message.text }),
    /* @__PURE__ */ jsx16(
      SectionCard,
      {
        title: "Buchungsverwaltung",
        description: "Status\xE4nderungen werden live an das Portal zur\xFCckgespielt",
        actions: /* @__PURE__ */ jsx16("button", { type: "button", className: "btn", onClick: handleExport, children: "Export als CSV" }),
        children: bookings.length === 0 ? /* @__PURE__ */ jsx16("p", { className: "empty-state", children: "Keine Buchungen vorhanden." }) : /* @__PURE__ */ jsxs14("table", { className: "data-table", children: [
          /* @__PURE__ */ jsx16("thead", { children: /* @__PURE__ */ jsxs14("tr", { children: [
            /* @__PURE__ */ jsx16("th", { children: "Referenz" }),
            /* @__PURE__ */ jsx16("th", { children: "Kunde" }),
            /* @__PURE__ */ jsx16("th", { children: "Partner" }),
            /* @__PURE__ */ jsx16("th", { children: "Typ" }),
            /* @__PURE__ */ jsx16("th", { children: "Betrag" }),
            /* @__PURE__ */ jsx16("th", { children: "Status" }),
            /* @__PURE__ */ jsx16("th", { children: "Reisedatum" }),
            /* @__PURE__ */ jsx16("th", { children: "Erstellt" }),
            /* @__PURE__ */ jsx16("th", {})
          ] }) }),
          /* @__PURE__ */ jsx16("tbody", { children: bookings.map((booking) => /* @__PURE__ */ jsxs14("tr", { children: [
            /* @__PURE__ */ jsx16("td", { children: booking.bookingReference }),
            /* @__PURE__ */ jsx16("td", { children: booking.customerName || "\u2014" }),
            /* @__PURE__ */ jsx16("td", { children: booking.partnerName || "\u2014" }),
            /* @__PURE__ */ jsx16("td", { children: booking.productType || "\u2014" }),
            /* @__PURE__ */ jsx16("td", { children: formatCurrency(booking.amount, booking.currency) }),
            /* @__PURE__ */ jsx16("td", { children: /* @__PURE__ */ jsx16("select", { value: booking.status, onChange: (event) => handleStatusChange(booking.id, event.target.value), children: STATUS_OPTIONS.map((status) => /* @__PURE__ */ jsx16("option", { value: status, children: status }, status)) }) }),
            /* @__PURE__ */ jsx16("td", { children: booking.travelDate ? formatDate(booking.travelDate) : "\u2014" }),
            /* @__PURE__ */ jsx16("td", { children: formatDate(booking.createdAt) }),
            /* @__PURE__ */ jsx16("td", { className: "table-actions", children: /* @__PURE__ */ jsx16("button", { type: "button", className: "btn btn-small", onClick: () => handleSaveBooking(booking), children: "Speichern" }) })
          ] }, booking.id)) })
        ] })
      }
    )
  ] });
}

// admin/pages/SettingsPage.jsx
import React17, { useEffect as useEffect8, useState as useState10 } from "react";
import { jsx as jsx17, jsxs as jsxs15 } from "react/jsx-runtime";
var ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "editor", label: "Redaktion" },
  { value: "support", label: "Support" }
];
var NEW_ADMIN = {
  name: "",
  email: "",
  password: "",
  role: "editor"
};
function SettingsPage() {
  const { request } = useApi();
  const [settings, setSettings] = useState10(null);
  const [seo, setSeo] = useState10([]);
  const [legal, setLegal] = useState10([]);
  const [payments, setPayments] = useState10([]);
  const [admins, setAdmins] = useState10([]);
  const [newAdmin, setNewAdmin] = useState10(NEW_ADMIN);
  const [loading, setLoading] = useState10(true);
  const [error, setError] = useState10(null);
  const [message, setMessage] = useState10(null);
  useEffect8(() => {
    let active = true;
    const load = async () => {
      try {
        const [settingsRes, seoRes, legalRes, paymentRes, adminRes] = await Promise.all([
          request("/api/admin/settings"),
          request("/api/admin/seo"),
          request("/api/admin/legal"),
          request("/api/admin/payment"),
          request("/api/admin/admin-users")
        ]);
        if (!active)
          return;
        setSettings(settingsRes);
        setSeo(seoRes);
        setLegal(legalRes);
        setPayments(paymentRes);
        setAdmins(adminRes);
      } catch (err) {
        if (active)
          setError(err.message);
      } finally {
        if (active)
          setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4e3);
  };
  const handleSaveSettings = async (key, value) => {
    try {
      const updated = await request(`/api/admin/settings/${key}`, { method: "PUT", body: value });
      setSettings((prev) => ({ ...prev, [key]: updated }));
      showMessage("Einstellungen aktualisiert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file)
      return;
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const branding2 = await request("/api/admin/settings/logo", { method: "POST", body: formData });
      setSettings((prev) => ({ ...prev, branding: branding2 }));
      showMessage("Logo aktualisiert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleSaveSeo = async (entry) => {
    try {
      const payload = {
        title: entry.title,
        description: entry.description,
        keywords: entry.keywords?.split(",").map((item) => item.trim()).filter(Boolean) || []
      };
      const updated = await request(`/api/admin/seo/${entry.page}`, { method: "PUT", body: payload });
      setSeo((items) => items.map((item) => item.page === entry.page ? { ...updated, keywords: payload.keywords } : item));
      showMessage("SEO-Daten gespeichert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleSaveLegal = async (entry) => {
    try {
      const updated = await request(`/api/admin/legal/${entry.slug}`, {
        method: "PUT",
        body: { title: entry.title, content: entry.content }
      });
      setLegal((items) => items.map((item) => item.slug === entry.slug ? updated : item));
      showMessage("Rechtstext aktualisiert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleSavePayment = async (gateway) => {
    try {
      const payload = {
        enabled: Boolean(gateway.enabled),
        config: gateway.config
      };
      const updated = await request(`/api/admin/payment/${gateway.code}`, { method: "PUT", body: payload });
      setPayments((items) => items.map((item) => item.code === gateway.code ? { ...updated, config: payload.config } : item));
      showMessage("Zahlungsoption gespeichert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleSaveAdmin = async (admin) => {
    try {
      const payload = {
        name: admin.name,
        role: admin.role,
        status: admin.status
      };
      const updated = await request(`/api/admin/admin-users/${admin.id}`, { method: "PUT", body: payload });
      setAdmins((items) => items.map((item) => item.id === admin.id ? updated : item));
      showMessage("Admin aktualisiert.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...newAdmin };
      if (!payload.password) {
        delete payload.password;
      }
      const created = await request("/api/admin/admin-users", { method: "POST", body: payload });
      setAdmins((items) => [created, ...items]);
      setNewAdmin(NEW_ADMIN);
      showMessage("Neues Admin-Profil erstellt.");
    } catch (err) {
      setError(err.message);
    }
  };
  const handlePaymentConfigChange = (code, key, value) => {
    setPayments(
      (items) => items.map(
        (item) => item.code === code ? { ...item, config: { ...item.config || {}, [key]: value } } : item
      )
    );
  };
  if (loading) {
    return /* @__PURE__ */ jsx17(LoadingScreen, { message: "Einstellungen werden geladen \u2026" });
  }
  if (error) {
    return /* @__PURE__ */ jsx17(InlineAlert, { type: "error", title: "Fehler", message: error });
  }
  const branding = settings?.branding || {};
  const theme = settings?.theme || {};
  const multilingual = settings?.multilingual || { defaultLocale: "de", availableLocales: ["de"], englishEnabled: false };
  return /* @__PURE__ */ jsxs15("div", { className: "settings-page", children: [
    message && /* @__PURE__ */ jsx17(InlineAlert, { type: message.type, message: message.text }),
    /* @__PURE__ */ jsx17(SectionCard, { title: "Branding", description: "Logo, Claim und Unternehmensfarben", children: /* @__PURE__ */ jsxs15(
      "form",
      {
        className: "form-grid",
        onSubmit: (event) => {
          event.preventDefault();
          const form = event.target;
          const value = {
            brandName: form.brandName.value,
            tagline: form.tagline.value,
            logoUrl: branding.logoUrl || "",
            logoUpdatedAt: branding.logoUpdatedAt || null
          };
          handleSaveSettings("branding", value);
        },
        children: [
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Markenname" }),
            /* @__PURE__ */ jsx17("input", { name: "brandName", defaultValue: branding.brandName || "" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Claim" }),
            /* @__PURE__ */ jsx17("input", { name: "tagline", defaultValue: branding.tagline || "" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Aktuelles Logo" }),
            branding.logoUrl ? /* @__PURE__ */ jsx17("img", { src: branding.logoUrl, alt: "Logo", className: "logo-preview" }) : /* @__PURE__ */ jsx17("p", { children: "Kein Logo hinterlegt" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Logo austauschen" }),
            /* @__PURE__ */ jsx17("input", { type: "file", accept: "image/*", onChange: handleLogoUpload })
          ] }),
          /* @__PURE__ */ jsx17("div", { className: "form-actions full-width", children: /* @__PURE__ */ jsx17("button", { type: "submit", className: "btn btn-primary", children: "Branding speichern" }) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx17(SectionCard, { title: "Designsystem", description: "Farben und Typografie", children: /* @__PURE__ */ jsxs15(
      "form",
      {
        className: "form-grid",
        onSubmit: (event) => {
          event.preventDefault();
          const form = event.target;
          const value = {
            primaryColor: form.primaryColor.value,
            secondaryColor: form.secondaryColor.value,
            accentColor: form.accentColor.value,
            neutralColor: form.neutralColor.value,
            fontHeading: form.fontHeading.value,
            fontBody: form.fontBody.value,
            buttonShape: form.buttonShape.value
          };
          handleSaveSettings("theme", value);
        },
        children: [
          /* @__PURE__ */ jsxs15("label", { children: [
            /* @__PURE__ */ jsx17("span", { children: "Prim\xE4rfarbe" }),
            /* @__PURE__ */ jsx17("input", { type: "color", name: "primaryColor", defaultValue: theme.primaryColor || "#0a6cff" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { children: [
            /* @__PURE__ */ jsx17("span", { children: "Sekund\xE4rfarbe" }),
            /* @__PURE__ */ jsx17("input", { type: "color", name: "secondaryColor", defaultValue: theme.secondaryColor || "#06b6d4" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { children: [
            /* @__PURE__ */ jsx17("span", { children: "Akzent" }),
            /* @__PURE__ */ jsx17("input", { type: "color", name: "accentColor", defaultValue: theme.accentColor || "#f97316" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { children: [
            /* @__PURE__ */ jsx17("span", { children: "Neutral" }),
            /* @__PURE__ */ jsx17("input", { type: "color", name: "neutralColor", defaultValue: theme.neutralColor || "#0f172a" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { children: [
            /* @__PURE__ */ jsx17("span", { children: "Schrift Headlines" }),
            /* @__PURE__ */ jsx17("input", { name: "fontHeading", defaultValue: theme.fontHeading || "Montserrat" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { children: [
            /* @__PURE__ */ jsx17("span", { children: "Schrift Flie\xDFtext" }),
            /* @__PURE__ */ jsx17("input", { name: "fontBody", defaultValue: theme.fontBody || "Poppins" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { children: [
            /* @__PURE__ */ jsx17("span", { children: "Button-Form" }),
            /* @__PURE__ */ jsxs15("select", { name: "buttonShape", defaultValue: theme.buttonShape || "rounded", children: [
              /* @__PURE__ */ jsx17("option", { value: "rounded", children: "Abgerundet" }),
              /* @__PURE__ */ jsx17("option", { value: "pill", children: "Pill" }),
              /* @__PURE__ */ jsx17("option", { value: "square", children: "Eckig" })
            ] })
          ] }),
          /* @__PURE__ */ jsx17("div", { className: "form-actions full-width", children: /* @__PURE__ */ jsx17("button", { type: "submit", className: "btn", children: "Design speichern" }) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx17(SectionCard, { title: "Sprachen", description: "Mehrsprachigkeit steuern", children: /* @__PURE__ */ jsxs15(
      "form",
      {
        className: "form-grid",
        onSubmit: (event) => {
          event.preventDefault();
          const form = event.target;
          const value = {
            defaultLocale: form.defaultLocale.value,
            availableLocales: form.availableLocales.value.split(",").map((item) => item.trim()).filter(Boolean),
            englishEnabled: form.englishEnabled.checked
          };
          handleSaveSettings("multilingual", value);
        },
        children: [
          /* @__PURE__ */ jsxs15("label", { children: [
            /* @__PURE__ */ jsx17("span", { children: "Standardsprache" }),
            /* @__PURE__ */ jsx17("input", { name: "defaultLocale", defaultValue: multilingual.defaultLocale || "de" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Verf\xFCgbare Sprachen (Kommagetrennt)" }),
            /* @__PURE__ */ jsx17(
              "input",
              {
                name: "availableLocales",
                defaultValue: (multilingual.availableLocales || ["de"]).join(", ")
              }
            )
          ] }),
          /* @__PURE__ */ jsxs15("label", { className: "toggle", children: [
            /* @__PURE__ */ jsx17("input", { name: "englishEnabled", type: "checkbox", defaultChecked: Boolean(multilingual.englishEnabled) }),
            /* @__PURE__ */ jsx17("span", { className: "toggle-indicator" }),
            /* @__PURE__ */ jsx17("span", { children: "Englische Version aktivieren" })
          ] }),
          /* @__PURE__ */ jsx17("div", { className: "form-actions full-width", children: /* @__PURE__ */ jsx17("button", { type: "submit", className: "btn", children: "Sprachoptionen speichern" }) })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx17(SectionCard, { title: "SEO", description: "Metadaten pro Seite", children: seo.map((entry) => /* @__PURE__ */ jsxs15(
      "form",
      {
        className: "form-grid",
        onSubmit: (event) => {
          event.preventDefault();
          const form = event.target;
          const updated = {
            page: entry.page,
            title: form.title.value,
            description: form.description.value,
            keywords: form.keywords.value
          };
          handleSaveSeo(updated);
        },
        children: [
          /* @__PURE__ */ jsx17("h3", { children: entry.page }),
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Titel" }),
            /* @__PURE__ */ jsx17("input", { name: "title", defaultValue: entry.title || "" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Beschreibung" }),
            /* @__PURE__ */ jsx17("textarea", { name: "description", defaultValue: entry.description || "" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Keywords" }),
            /* @__PURE__ */ jsx17("input", { name: "keywords", defaultValue: Array.isArray(entry.keywords) ? entry.keywords.join(", ") : "" })
          ] }),
          /* @__PURE__ */ jsx17("div", { className: "form-actions", children: /* @__PURE__ */ jsx17("button", { type: "submit", className: "btn btn-small", children: "Speichern" }) })
        ]
      },
      entry.page
    )) }),
    /* @__PURE__ */ jsx17(SectionCard, { title: "Rechtliche Seiten", description: "Impressum, Datenschutz & Cookies", children: legal.map((entry) => /* @__PURE__ */ jsxs15(
      "form",
      {
        className: "form-grid",
        onSubmit: (event) => {
          event.preventDefault();
          const form = event.target;
          handleSaveLegal({ slug: entry.slug, title: form.title.value, content: form.content.value });
        },
        children: [
          /* @__PURE__ */ jsx17("h3", { children: entry.title }),
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Titel" }),
            /* @__PURE__ */ jsx17("input", { name: "title", defaultValue: entry.title || "" })
          ] }),
          /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: "Inhalt" }),
            /* @__PURE__ */ jsx17("textarea", { name: "content", defaultValue: entry.content || "", rows: 6 })
          ] }),
          /* @__PURE__ */ jsx17("div", { className: "form-actions", children: /* @__PURE__ */ jsx17("button", { type: "submit", className: "btn btn-small", children: "Aktualisieren" }) })
        ]
      },
      entry.slug
    )) }),
    /* @__PURE__ */ jsx17(SectionCard, { title: "Zahlungsanbieter", description: "Checkout-Konfiguration und Aktivierung", children: payments.map((gateway) => /* @__PURE__ */ jsxs15(
      "form",
      {
        className: "form-grid",
        onSubmit: (event) => {
          event.preventDefault();
          handleSavePayment(gateway);
        },
        children: [
          /* @__PURE__ */ jsx17("h3", { children: gateway.name }),
          /* @__PURE__ */ jsxs15("label", { className: "toggle", children: [
            /* @__PURE__ */ jsx17(
              "input",
              {
                type: "checkbox",
                checked: Boolean(gateway.enabled),
                onChange: (event) => setPayments((items) => items.map((item) => item.code === gateway.code ? { ...item, enabled: event.target.checked ? 1 : 0 } : item))
              }
            ),
            /* @__PURE__ */ jsx17("span", { className: "toggle-indicator" }),
            /* @__PURE__ */ jsx17("span", { children: "Aktiv" })
          ] }),
          Object.entries(gateway.config || {}).map(([key, value]) => /* @__PURE__ */ jsxs15("label", { className: "full-width", children: [
            /* @__PURE__ */ jsx17("span", { children: key }),
            /* @__PURE__ */ jsx17(
              "input",
              {
                value,
                onChange: (event) => handlePaymentConfigChange(gateway.code, key, event.target.value)
              }
            )
          ] }, key)),
          /* @__PURE__ */ jsx17("div", { className: "form-actions", children: /* @__PURE__ */ jsx17("button", { type: "submit", className: "btn btn-small", children: "Speichern" }) })
        ]
      },
      gateway.code
    )) }),
    /* @__PURE__ */ jsxs15(SectionCard, { title: "Admin-Benutzer", description: "Zugriffsrechte verwalten", children: [
      /* @__PURE__ */ jsxs15("table", { className: "data-table", children: [
        /* @__PURE__ */ jsx17("thead", { children: /* @__PURE__ */ jsxs15("tr", { children: [
          /* @__PURE__ */ jsx17("th", { children: "Name" }),
          /* @__PURE__ */ jsx17("th", { children: "E-Mail" }),
          /* @__PURE__ */ jsx17("th", { children: "Rolle" }),
          /* @__PURE__ */ jsx17("th", { children: "Status" }),
          /* @__PURE__ */ jsx17("th", {})
        ] }) }),
        /* @__PURE__ */ jsx17("tbody", { children: admins.map((admin) => /* @__PURE__ */ jsxs15("tr", { children: [
          /* @__PURE__ */ jsx17("td", { children: admin.name }),
          /* @__PURE__ */ jsx17("td", { children: admin.email }),
          /* @__PURE__ */ jsx17("td", { children: /* @__PURE__ */ jsx17(
            "select",
            {
              value: admin.role,
              onChange: (event) => setAdmins((items) => items.map((item) => item.id === admin.id ? { ...item, role: event.target.value } : item)),
              children: ROLES.map((role) => /* @__PURE__ */ jsx17("option", { value: role.value, children: role.label }, role.value))
            }
          ) }),
          /* @__PURE__ */ jsx17("td", { children: /* @__PURE__ */ jsxs15(
            "select",
            {
              value: admin.status,
              onChange: (event) => setAdmins((items) => items.map((item) => item.id === admin.id ? { ...item, status: event.target.value } : item)),
              children: [
                /* @__PURE__ */ jsx17("option", { value: "active", children: "Aktiv" }),
                /* @__PURE__ */ jsx17("option", { value: "inactive", children: "Inaktiv" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx17("td", { className: "table-actions", children: /* @__PURE__ */ jsx17("button", { type: "button", className: "btn btn-small", onClick: () => handleSaveAdmin(admin), children: "Aktualisieren" }) })
        ] }, admin.id)) })
      ] }),
      /* @__PURE__ */ jsxs15("form", { className: "inline-form", onSubmit: handleCreateAdmin, children: [
        /* @__PURE__ */ jsx17(
          "input",
          {
            placeholder: "Name",
            value: newAdmin.name,
            onChange: (event) => setNewAdmin((prev) => ({ ...prev, name: event.target.value })),
            required: true
          }
        ),
        /* @__PURE__ */ jsx17(
          "input",
          {
            type: "email",
            placeholder: "E-Mail",
            value: newAdmin.email,
            onChange: (event) => setNewAdmin((prev) => ({ ...prev, email: event.target.value })),
            required: true
          }
        ),
        /* @__PURE__ */ jsx17("select", { value: newAdmin.role, onChange: (event) => setNewAdmin((prev) => ({ ...prev, role: event.target.value })), children: ROLES.map((role) => /* @__PURE__ */ jsx17("option", { value: role.value, children: role.label }, role.value)) }),
        /* @__PURE__ */ jsx17(
          "input",
          {
            type: "password",
            placeholder: "Passwort (optional)",
            value: newAdmin.password,
            onChange: (event) => setNewAdmin((prev) => ({ ...prev, password: event.target.value }))
          }
        ),
        /* @__PURE__ */ jsx17("button", { type: "submit", className: "btn btn-primary", children: "Admin hinzuf\xFCgen" })
      ] })
    ] })
  ] });
}

// admin/pages/LogsPage.jsx
import React18, { useEffect as useEffect9, useState as useState11 } from "react";
import { jsx as jsx18, jsxs as jsxs16 } from "react/jsx-runtime";
function LogsPage() {
  const { request } = useApi();
  const [logs, setLogs] = useState11([]);
  const [loading, setLoading] = useState11(true);
  const [error, setError] = useState11(null);
  useEffect9(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await request("/api/admin/logs");
        if (!active)
          return;
        setLogs(response);
      } catch (err) {
        if (active)
          setError(err.message);
      } finally {
        if (active)
          setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [request]);
  if (loading) {
    return /* @__PURE__ */ jsx18(LoadingScreen, { message: "Aktivit\xE4tsprotokoll wird geladen \u2026" });
  }
  if (error) {
    return /* @__PURE__ */ jsx18(InlineAlert, { type: "error", title: "Fehler", message: error });
  }
  return /* @__PURE__ */ jsx18("div", { className: "logs-page", children: /* @__PURE__ */ jsx18(SectionCard, { title: "Admin-Aktivit\xE4ten", description: "Protokoll der letzten \xC4nderungen", children: logs.length === 0 ? /* @__PURE__ */ jsx18("p", { className: "empty-state", children: "Noch keine Aktivit\xE4ten dokumentiert." }) : /* @__PURE__ */ jsxs16("table", { className: "data-table", children: [
    /* @__PURE__ */ jsx18("thead", { children: /* @__PURE__ */ jsxs16("tr", { children: [
      /* @__PURE__ */ jsx18("th", { children: "Datum" }),
      /* @__PURE__ */ jsx18("th", { children: "Benutzer" }),
      /* @__PURE__ */ jsx18("th", { children: "Aktion" }),
      /* @__PURE__ */ jsx18("th", { children: "Bereich" }),
      /* @__PURE__ */ jsx18("th", { children: "Details" })
    ] }) }),
    /* @__PURE__ */ jsx18("tbody", { children: logs.map((log) => /* @__PURE__ */ jsxs16("tr", { children: [
      /* @__PURE__ */ jsx18("td", { children: formatDate(log.createdAt) }),
      /* @__PURE__ */ jsx18("td", { children: log.adminName || "System" }),
      /* @__PURE__ */ jsx18("td", { children: log.action }),
      /* @__PURE__ */ jsx18("td", { children: log.entity || "\u2014" }),
      /* @__PURE__ */ jsx18("td", { children: log.details ? /* @__PURE__ */ jsx18("pre", { className: "log-details", children: typeof log.details === "string" ? log.details : JSON.stringify(log.details, null, 2) }) : "\u2014" })
    ] }, log.id)) })
  ] }) }) });
}

// admin/App.jsx
import { jsx as jsx19, jsxs as jsxs17 } from "react/jsx-runtime";
function ProtectedRoute() {
  const { token, loading } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx19(LoadingScreen, { message: "Session wird gepr\xFCft \u2026" });
  }
  if (!token) {
    return /* @__PURE__ */ jsx19(Navigate, { to: "/login", replace: true });
  }
  return /* @__PURE__ */ jsx19(Outlet2, {});
}
function App() {
  return /* @__PURE__ */ jsx19(AuthProvider, { children: /* @__PURE__ */ jsx19(BrowserRouter, { basename: "/admin", children: /* @__PURE__ */ jsxs17(Routes, { children: [
    /* @__PURE__ */ jsx19(Route, { path: "/login", element: /* @__PURE__ */ jsx19(LoginPage, {}) }),
    /* @__PURE__ */ jsx19(Route, { element: /* @__PURE__ */ jsx19(ProtectedRoute, {}), children: /* @__PURE__ */ jsxs17(Route, { element: /* @__PURE__ */ jsx19(Layout, {}), children: [
      /* @__PURE__ */ jsx19(Route, { index: true, element: /* @__PURE__ */ jsx19(DashboardPage, {}) }),
      /* @__PURE__ */ jsx19(Route, { path: "content", element: /* @__PURE__ */ jsx19(ContentPage, {}) }),
      /* @__PURE__ */ jsx19(Route, { path: "offers", element: /* @__PURE__ */ jsx19(OffersPage, {}) }),
      /* @__PURE__ */ jsx19(Route, { path: "products", element: /* @__PURE__ */ jsx19(ProductsPage, {}) }),
      /* @__PURE__ */ jsx19(Route, { path: "users", element: /* @__PURE__ */ jsx19(UsersPage, {}) }),
      /* @__PURE__ */ jsx19(Route, { path: "bookings", element: /* @__PURE__ */ jsx19(BookingsPage, {}) }),
      /* @__PURE__ */ jsx19(Route, { path: "settings", element: /* @__PURE__ */ jsx19(SettingsPage, {}) }),
      /* @__PURE__ */ jsx19(Route, { path: "logs", element: /* @__PURE__ */ jsx19(LogsPage, {}) })
    ] }) }),
    /* @__PURE__ */ jsx19(Route, { path: "*", element: /* @__PURE__ */ jsx19(Navigate, { to: "/", replace: true }) })
  ] }) }) });
}

// admin/main.jsx
import { jsx as jsx20 } from "react/jsx-runtime";
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsx20(App, {}));
