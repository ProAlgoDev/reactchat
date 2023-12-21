import axios from 'axios';
// config
// const { REACT_APP_BASE_URL } = process.env;
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:9001/api";

// ----------------------------------------------------------------------
console.log(BASE_URL);
const axiosInstance = axios.create({ baseURL: BASE_URL });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;
