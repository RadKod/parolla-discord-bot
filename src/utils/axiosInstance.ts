import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: 'https://api.radkod.com/parolla/api/v1/',
});

export default axiosInstance;
