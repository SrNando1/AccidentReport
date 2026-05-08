export const SECTION_NAME_MAP = {
  3.1: "3.1 Copy of the documentation of those involved",
  3.2: "3.2 Request for Clarification from the Operator",
  3.3: "3.3 Internal incident notification",
  3.4: "3.4 SPdH_086",
  3.5: "3.5 Registo_Fotografico",
  3.6: "3.6 Declaracao_Amigavel",
  6: "6 Procedimentos_Internos",
};

// evita caracteres problemáticos para nomes de pasta/ficheiro
export function sanitizeName(name = "") {
  return String(name)
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

export function sectionFolderName(id) {
  const key = String(id);
  return sanitizeName(SECTION_NAME_MAP[key] || `Secao_${key}`);
}
