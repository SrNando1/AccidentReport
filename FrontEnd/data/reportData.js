// src/data/reportData.js
import { Platform } from "react-native";
import { storage } from "../data/storage";
import { dataURItoBlob } from "../utils/fileHandlers";

const STORAGE_KEY = "reportData";

const DEFAULT_REPORT_DATA = {
  summary: "",
  vehicleA: "",
  falsecA: "",
  enterpriseA: "",
  vehicleB: "",
  falsecB: "",
  enterpriseB: "",
  dateofoccurrence: "",
  timeofoccurrence: "",
  placeofoccurrence: "",
  DamageCausedDescription: "",
  RootCause: {
    contributingFactors: "",
    rootCauseType: "",
    rootCauseCategory: "",
    rootCauseSubcategory: "",
    preventiveactions: "",
  },
  accidentCharacterization: {
    severityLevel: null,
    frequencyLevel: null,
    severityActionLevel: null,
    frequencyActionLevel: null,
    riskLevel: null,
    finalAcceptability: null,
    requiredActions: "",
    mitigatingmeasures: "",
    finalRisk: null,
  },
  conclusion: "",
  DataDriverA: {
    name: "",
    Enterprise: "",
    EmployeeNumber: "",
    EmployeeFunction: "",
    LicenseNumberANA: "",
    ValidityANA: "",
    CategoryANA: "",
    CivilLicenseNumber: "",
    ValidityCivil: "",
    CategoryCivil: "",
    AdmitionDate: "",
    ContractType: "",
    Formation: "",
    ShiftTime: "",
    DayShift: "",
    DaysOff: "",
    Breaks: "",
    IncidentHistory: "",
    DescriptionFactsOperator: "",
  },
  DataDriverB: {
    name: "",
    Enterprise: "",
    EmployeeNumber: "",
    EmployeeFunction: "",
    LicenseNumberANA: "",
    ValidityANA: "",
    CategoryANA: "",
    CivilLicenseNumber: "",
    ValidityCivil: "",
    CategoryCivil: "",
    AdmitionDate: "",
    ContractType: "",
    Formation: "",
    ShiftTime: "",
    DayShift: "",
    DaysOff: "",
    Breaks: "",
    IncidentHistory: "",
    DescriptionFactsOperator: "",
  },
  files: {
    3.1: [],
    3.2: [],
    3.3: [],
    3.4: [],
    3.5: [],
    3.6: [],
    6: [],
  },
};

let reportData = null;

/* ------------------------ pub/sub reativo ------------------------ */
const listeners = new Set();
function emit() {
  listeners.forEach((l) => l());
}
/** Hook usa isto: */
export function subscribeReportData(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
/** Snapshot p/ useSyncExternalStore */
export const getReportDataSnapshot = () => reportData;
/* ---------------------------------------------------------------- */

/* ------------------------- helpers ------------------------- */
function deepMerge(base = {}, patch = {}) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(patch || {})) {
    const v = patch[k];
    out[k] =
      v && typeof v === "object" && !Array.isArray(v)
        ? deepMerge(base[k] || {}, v)
        : v;
  }
  return out;
}

async function saveToLocalStorage() {
  // por design, não persistimos ficheiros grandes (arrays vazios)
  try {
    const serializableData = {
      ...reportData,
      files: { 3.1: [], 3.2: [], 3.3: [], 3.4: [], 3.5: [], 3.6: [], 6: [] },
    };
    await storage.setItem(STORAGE_KEY, JSON.stringify(serializableData));
  } catch (error) {
    console.error("[reportData] Erro ao salvar:", error);
  }
}
/* ---------------------------------------------------------- */

/* ------------------------- API pública ------------------------- */
export async function initializeReportData() {
  try {
    const saved = await storage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      reportData = { ...DEFAULT_REPORT_DATA, ...parsed };
      emit();
      return reportData;
    }
  } catch (err) {
    console.warn("[reportData] init falhou, usando default:", err);
  }
  reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
  emit();
  return reportData;
}

export function getReportData() {
  // devolve cópia p/ evitar mutações fora do store
  return JSON.parse(JSON.stringify(reportData));
}

export async function updateReportData(patch) {
  reportData = deepMerge(reportData, patch);
  await saveToLocalStorage();
  emit();
  return reportData;
}

/**
 * Substitui (ou faz merge) do estado com dados externos (ex.: draft).
 * options:
 *  - merge: true mantém o que já existe e sobrepõe com o draft
 *  - keepLocalFiles: true mantém anexos locais em memória
 */
export async function setReportData(
  next,
  { merge = false, keepLocalFiles = true } = {},
) {
  if (!next) {
    reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
    await saveToLocalStorage();
    emit();
    return reportData;
  }

  let incoming = next;
  if (typeof incoming === "string") {
    try {
      incoming = JSON.parse(incoming);
    } catch {
      incoming = {};
    }
  }

  const normalized = {
    ...DEFAULT_REPORT_DATA,
    ...incoming,
    RootCause: deepMerge(
      DEFAULT_REPORT_DATA.RootCause,
      incoming?.RootCause || {},
    ),
    accidentCharacterization: deepMerge(
      DEFAULT_REPORT_DATA.accidentCharacterization,
      incoming?.accidentCharacterization || {},
    ),
    DataDriverA: deepMerge(
      DEFAULT_REPORT_DATA.DataDriverA,
      incoming?.DataDriverA || {},
    ),
    DataDriverB: deepMerge(
      DEFAULT_REPORT_DATA.DataDriverB,
      incoming?.DataDriverB || {},
    ),
    files: keepLocalFiles
      ? reportData?.files || DEFAULT_REPORT_DATA.files
      : deepMerge(DEFAULT_REPORT_DATA.files, incoming?.files || {}),
  };

  reportData = merge ? deepMerge(reportData || {}, normalized) : normalized;
  await saveToLocalStorage();
  emit();
  return reportData;
}

export const resetReportData = async () => {
  reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
  await saveToLocalStorage();
  emit();
  return reportData;
};

export const clearReportData = async () => {
  reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
  await saveToLocalStorage();
  emit();
  return reportData;
};

export async function hydrateReportData() {
  try {
    const saved = await storage.getItem(STORAGE_KEY);
    if (saved) {
      reportData = { ...DEFAULT_REPORT_DATA, ...JSON.parse(saved) };
    } else {
      reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
    }
  } catch {
    reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
  }
  emit();
  return reportData;
}

/* -------------------- ficheiros (anexos) -------------------- */
export const getFileSections = () => Object.keys(DEFAULT_REPORT_DATA.files);

export const getFilesFromSection = (sectionId) => [
  ...(reportData?.files?.[sectionId] || []),
];

export const updateFileList = async (sectionId, fileList) => {
  if (!reportData.files[sectionId]) {
    console.warn(`[reportData] seção ${sectionId} não existe`);
    return reportData.files;
  }
  reportData.files[sectionId] = fileList;
  await saveToLocalStorage();
  emit();
  return reportData.files;
};

export const addFileToSection = async (sectionId, file) => {
  if (!reportData.files[sectionId]) {
    console.warn(`[reportData] seção ${sectionId} não encontrada`);
    return false;
  }

  let fixedFile = null;
  if (Platform.OS === "web") {
    if (!file?.uri?.startsWith?.("data:")) {
      console.warn("[reportData] URI inválida no Web:", file);
      return false;
    }
    fixedFile = { name: file.name, blob: dataURItoBlob(file.uri) };
  } else {
    fixedFile = { name: file.name, uri: file.uri };
  }

  reportData.files[sectionId].push(fixedFile);
  await saveToLocalStorage();
  emit();
  return true;
};

export const removeFileFromSection = async (sectionId, fileIndex) => {
  if (!reportData.files[sectionId]?.[fileIndex]) return false;
  reportData.files[sectionId].splice(fileIndex, 1);
  await saveToLocalStorage();
  emit();
  return true;
};
/* ------------------------------------------------------------ */
