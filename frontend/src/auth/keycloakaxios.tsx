import axios from "axios";
import { getKeycloak } from "./keycloak";

const keyaxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

keyaxios.interceptors.request.use(async config => {
  const keycloak = getKeycloak();

  if (keycloak?.token) {
    await keycloak.updateToken(30);
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }

  return config;
});

export default keyaxios;
