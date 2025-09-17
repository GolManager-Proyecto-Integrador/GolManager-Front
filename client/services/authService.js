import axios from "axios";

const API_URL = "http://localhost:8085/api/auth"; // 👈 backend

export async function login(email, password) {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  // guarda el token en localStorage
  localStorage.setItem("token", response.data.token);
  return response.data;
}

export async function register(email, password) {
  return axios.post(`${API_URL}/register`, { email, password });
}

export function getToken() {
  return localStorage.getItem("token");
}
