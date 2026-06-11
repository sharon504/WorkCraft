export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "");

export const ECOM_API_BASE_URL = `${API_BASE_URL}/api/ecom`;
export const JOB_PORTAL_API_BASE_URL = `${API_BASE_URL}/api/jobPortal`;

export const ML_API_BASE_URL =
  import.meta.env.VITE_ML_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");
