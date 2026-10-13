import axios from "axios";

// Base API instance targeting the Express backend
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor: Attach JWT Bearer Token if available in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("campuscollab_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle expired tokens gracefully
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      if (localStorage.getItem("campuscollab_token")) {
        localStorage.removeItem("campuscollab_token");
        localStorage.removeItem("campuscollab_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
