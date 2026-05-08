// utils/draftService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_BASE = "http://localhost:3000";

// Cria/atualiza rascunho no backend
export async function saveDraftToBackend({ reportNumber, user, data }) {
  const res = await fetch(`${API_BASE}/api/reports/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportNumber, user, data }),
  });
  if (!res.ok) throw new Error("Falha ao salvar rascunho no backend");
  return res.json();
}

// Obtém um rascunho pelo número
export async function loadDraftFromBackend(reportNumber) {
  const res = await fetch(
    `${API_BASE}/api/reports/draft/${encodeURIComponent(reportNumber)}`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Falha ao carregar rascunho do backend");
  return res.json(); // { reportNumber, user, data, updatedAt, status }
}

// Lista rascunhos do usuário
export async function listDraftsFromBackend(user) {
  const res = await fetch(
    `${API_BASE}/api/reports/draft?user=${encodeURIComponent(user)}`
  );
  if (!res.ok) throw new Error("Falha ao listar rascunhos do backend");
  return res.json(); // array
}

// Marca como finalizado (opcionalmente pode deletar)
export async function finalizeDraft(reportNumber) {
  const res = await fetch(
    `${API_BASE}/api/reports/draft/${encodeURIComponent(
      reportNumber
    )}/finalize`,
    {
      method: "POST",
    }
  );
  if (!res.ok) throw new Error("Falha ao finalizar rascunho");
  return res.json();
}

// Remove rascunho
export async function deleteDraft(reportNumber) {
  const res = await fetch(
    `${API_BASE}/api/reports/draft/${encodeURIComponent(reportNumber)}`,
    {
      method: "DELETE",
    }
  );
  if (res.status === 404) return;
  if (!res.ok) throw new Error("Falha ao apagar rascunho");
}
