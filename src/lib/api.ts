// src/lib/api.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";

/** Risolve la base URL dell’API */
function resolveApiBase() {
  const env = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "");
  if (env) return env; // Vercel/Prod

  // se siamo su vercel.app ma l'env manca, fallback a Render
  if (typeof window !== "undefined" && /\.vercel\.app$/.test(window.location.host)) {
    return "https://affitti-backend.onrender.com";
  }

  // dev locale
  return "http://127.0.0.1:8000";
}
const API_URL = resolveApiBase();

// ===== access token in memoria (opzionale) =====
let ACCESS_TOKEN: string | null = null;
export function setAccessToken(token: string | null) {
  ACCESS_TOKEN = token;
}
export function getAccessToken() {
  return ACCESS_TOKEN;
}

// ===== client axios =====
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // manda cookie HttpOnly
  timeout: 15000,
});

// Authorization se ho l’access token (non obbligatorio: i cookie bastano)
api.interceptors.request.use((config) => {
  if (ACCESS_TOKEN) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  return config;
});

// ===== auto-refresh su 401 con retry una sola volta =====
let isRefreshing = false;
let queue: { resolve: (v?: unknown) => void; reject: (e: unknown) => void; req: AxiosRequestConfig & { _retry?: boolean } }[] = [];

async function runRefresh() {
  // Il backend usa cookie HttpOnly: non serve leggere token, ma se arriva lo salviamo.
  const res = await api.post("/auth/refresh");
  const newToken = (res.data?.access_token ?? res.data?.accessToken) as string | undefined;
  if (newToken) setAccessToken(newToken);
  return true;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = (error.config || {}) as AxiosRequestConfig & { _retry?: boolean };
    if (status !== 401 || original._retry) throw error;

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => queue.push({ resolve, reject, req: original }));
    }

    try {
      isRefreshing = true;
      await runRefresh();

      // ritenta richieste in coda
      const results = queue.map(({ resolve, reject, req }) =>
        api.request(req).then(resolve).catch(reject)
      );
      queue = [];

      // ritenta la richiesta originale
      const retry = await api.request(original);
      await Promise.allSettled(results);
      return retry;
    } catch (e) {
      // refresh fallito: svuota coda e “logout soft”
      queue.forEach(({ reject }) => reject(e));
      queue = [];
      setAccessToken(null);
      if (typeof window !== "undefined") window.location.href = "/login";
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
