import axios from "axios";

const axiosInstance = axios.create({
    baseURL: `https://medi-server-ten.vercel.app/`,
});

const useAxios = () => {
    return axiosInstance;
};

export default useAxios;
