import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: "/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor for adding auth headers if needed
api.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        // const token = getAuthToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Global error handling
        if (error.response?.status === 401) {
            // Handle unauthorized errors
            console.error("Unauthorized access");
            // Redirect to login or refresh token
        }

        if (error.response?.status === 403) {
            // Handle forbidden errors
            console.error("Access forbidden");
        }

        if (error.response?.status >= 500) {
            // Handle server errors
            console.error("Server error");
        }

        return Promise.reject(error);
    }
);

export { api };
