// src/services/authService.js
import API from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "token";
const USER_KEY = "user"; // guarda o objeto completo { id, name, email, is_admin, ... }

export async function register({ name, email, password }) {
  const res = await API.post("/auth/register", { name, email, password });
  const user = res.data.user;

  // opcional: já logar após registrar
  if (res.data.token) {
    await AsyncStorage.setItem(TOKEN_KEY, res.data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    await setAuthHeader(res.data.token);
  }

  return user;
}

export async function login({ email, password }) {
  const { data } = await API.post("/auth/login", { email, password });
  const { token, user } = data;

  await AsyncStorage.setItem("token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));
  await AsyncStorage.setItem("userName", user.name);
  await AsyncStorage.setItem("userId", String(user.id));

  // Garante que as próximas requisições já usem o token
  await setAuthHeader(token);

  return user; // <-- LoginScreen pode checar user.is_admin aqui
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
  await AsyncStorage.multiRemove([
    "token",
    "user",
    "userName",
    "selectedVehicle",
    "userId",
  ]);
  // opcional: Remove header
  if (API?.defaults?.headers) delete API.defaults.headers.common.Authorization;
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function isAdmin() {
  const user = await getStoredUser();
  return !!user?.is_admin; // booleano
}

// Seta o Authorization header no axios (ou semelhante)
export async function setAuthHeader(token) {
  if (API?.defaults?.headers) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}

// (Opcional) Atualiza os dados do usuário a partir do backend
export async function refreshMe() {
  const token = await getToken();
  if (!token) return null;
  await setAuthHeader(token);
  const res = await API.get("/auth/me");
  const user = res.data.user;
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
