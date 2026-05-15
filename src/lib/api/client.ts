import axios from "axios";
import { useAuthStore } from "@/app/store/authStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request Interceptor (Token ekleme)
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor (Senior Hata Yönetimi)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 1. 401 Unauthorized & Refresh Token Yönetimi
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Sessizce yeni token almayı dene (Zustand içindeki refresh action'ı)
        const newToken = await useAuthStore.getState().refreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh de patladıysa kullanıcıyı temizce çıkışa zorla
        useAuthStore.getState().logout();
        // SPA dostu yönlendirme: Sayfa yenilemeden custom bir event veya global history ile
        window.dispatchEvent(new Event("auth:unauthorized"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. 403 Forbidden Yönetimi (Kullanıcıyı haberdar et, akışı durdur)
    if (status === 403) {
      window.dispatchEvent(new Event("auth:forbidden"));
    }

    return Promise.reject(error);
  }
);

export default apiClient;