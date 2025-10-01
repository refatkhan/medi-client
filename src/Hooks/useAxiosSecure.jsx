import axios from "axios";
import { useEffect } from "react";

const axiosSecure = axios.create({
  baseURL: `http://localhost:3000`,
});

const useAxiosSecure = () => {
  useEffect(() => {
    // Interceptor to add token to headers
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor to handle 401 errors (unauthorized)
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          // Redirect to sign-in if token is invalid or expired
          localStorage.removeItem("token");
          window.location.href = "/sign-in";
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return axiosSecure;
};

export default useAxiosSecure;
