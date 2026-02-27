import axios from 'axios';

// Replace with the actual Laravel API URL
const BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor for Auth Tokens
apiClient.interceptors.request.use(
    async (config) => {
        // TODO: Fetch token from SecureStore and append to headers
        // const token = await SecureStore.getItemAsync('userToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor for Error Handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors like 401 Unauthorized here
        return Promise.reject(error);
    }
);
