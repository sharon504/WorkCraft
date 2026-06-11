import axios from "axios";
import { ECOM_API_BASE_URL } from "./config/api";

const instance = axios.create({
  baseURL: ECOM_API_BASE_URL,
});

export default instance;
