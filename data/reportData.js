// src/data/reportData.js

import { storage } from "../data/storage"; // ajusta conforme o teu caminho

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
    mitigatingmeasures: "",
    preventiveactions: "",
  },
  accidentCharacterization: {
    severityLevel: null,
    frequencyLevel: null,
    riskLevel: null,
    requiredActions: "",
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

export async function initializeReportData() {
  try {
    const savedData = await storage.getItem("reportData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      reportData = { ...DEFAULT_REPORT_DATA, ...parsed };
      return reportData;
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
  reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
  return reportData;
}

export const updateReportData = async (newData) => {
  reportData = {
    ...reportData,
    ...newData,
    ...(newData.RootCause && {
      RootCause: { ...reportData.RootCause, ...newData.RootCause },
    }),
    ...(newData.accidentCharacterization && {
      accidentCharacterization: {
        ...reportData.accidentCharacterization,
        ...newData.accidentCharacterization,
      },
    }),
    ...(newData.files && {
      files: { ...reportData.files, ...newData.files },
    }),
  };
  await saveToLocalStorage();
  return reportData;
};

export const updateFileList = async (sectionId, fileList) => {
  if (!reportData.files[sectionId]) {
    console.warn(`Seção ${sectionId} não existe nos arquivos`);
    return;
  }
  reportData.files[sectionId] = fileList;
  await saveToLocalStorage();
  return reportData.files;
};

export const getReportData = () => {
  return JSON.parse(JSON.stringify(reportData));
};

export const getSectionData = (section) => {
  return JSON.parse(JSON.stringify(reportData[section]));
};

export const resetReportData = async () => {
  reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
  await saveToLocalStorage();
  return reportData;
};

export const addFileToSection = async (sectionId, file) => {
  if (!reportData.files[sectionId]) {
    console.warn(`Seção ${sectionId} não encontrada`);
    return false;
  }
  reportData.files[sectionId].push(file);
  await saveToLocalStorage();
  return true;
};

export const removeFileFromSection = async (sectionId, fileIndex) => {
  if (!reportData.files[sectionId]?.[fileIndex]) {
    console.warn(`Arquivo não encontrado na seção ${sectionId}`);
    return false;
  }
  reportData.files[sectionId].splice(fileIndex, 1);
  await saveToLocalStorage();
  return true;
};

async function saveToLocalStorage() {
  try {
    const serializableData = {
      ...reportData,
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
    await storage.setItem("reportData", JSON.stringify(serializableData));
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
  }
}

export const getFileSections = () => {
  return Object.keys(DEFAULT_REPORT_DATA.files);
};

export const getFilesFromSection = (sectionId) => {
  return [...(reportData.files[sectionId] || [])];
};

export const clearReportData = async () => {
  reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
  await saveToLocalStorage();
  return reportData;
};
