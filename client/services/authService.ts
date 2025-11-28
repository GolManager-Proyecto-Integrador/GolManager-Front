import axios from "axios";

const API_URL = "/api/auth"; // 👈 Backend base URL

// 🔹 Iniciar sesión
export async function login(email: string, password: string) {
  const response = await axios.post(`${API_URL}/login`, { email, password });

  // Guarda el token en localStorage
  localStorage.setItem("token", response.data.token);

  return response.data;
}

// 🔹 Registrar nuevo usuario
export async function register(email: string, password: string) {
  return axios.post(`${API_URL}/register`, { email, password });
}

// 🔹 Obtener token almacenado
export function getToken(): string | null {
  return localStorage.getItem("token");
}

// 🔹 Cerrar sesión (borrar token)
export function logout(): void {
  localStorage.removeItem("token");
}
