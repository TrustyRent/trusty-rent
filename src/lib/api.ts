// frontend/src/lib/api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");

let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

// Persistiamo l'access token per non perderlo al refresh della pagina
export function setAccessToken(token: string | null) {
  accessToken = token;
  try {
    if (token) localStorage.setItem("access_token", token);
    else localStorage.removeItem("access_token");
  } catch {}
}
export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  try {
    accessToken = localStorage.getItem("access_token");
  } catch {}
  return accessToken;
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // necessario per il cookie HttpOnly del refresh
  timeout: 20000,
});

// Attacca Authorization se abbiamo l'access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const t = getAccessToken();
  if (t && !config.headers?.Authorization) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

// Esegui un solo refresh alla volta e condividi la promise
async function refreshAccessToken(instance: AxiosInstance): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const r = await instance.post("/auth/refresh"); // il backend legge il cookie
        const t = r.data?.access_token ?? null;
        if (t) setAccessToken(t);
        return t;
      } catch {
        return null;
      } finally {
        setTimeout(() => (refreshInFlight = null), 0); // rilascia il lock
      }
    })();
  }
  return refreshInFlight;
}

// Se 401: tenta un (solo) refresh e poi un (solo) retry. Altrimenti logout.
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = (error.config || {}) as AxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;
    const isRefresh = !!original.url && original.url.includes("/auth/refresh");

    if (status !== 401 || isRefresh || original._retried) {
      return Promise.reject(error);
    }

    const newToken = await refreshAccessToken(api);
    if (!newToken) {
      setAccessToken(null);
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(error);
    }

    original._retried = true;
    original.headers = original.headers ?? {};
    (original.headers as any).Authorization = `Bearer ${newToken}`;
    return api.request(original);
  }
);

export default api;
