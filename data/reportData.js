// src/data/reportData.js

// Objeto padrão com estrutura completa
const DEFAULT_REPORT_DATA = {
  summary: "",

  // Enquadramento
  vehicleA: "",
  falsecA: "",
  enterpriseA: "",
  vehicleB: "",
  falsecB: "",
  enterpriseB: "",

  // Dados de Ocorrência
  dateofoccurrence: "",
  timeofoccurrence: "",
  placeofoccurrence: "",

  // Descrição de Danos
  DamageCausedDescription: "",

  // Causa Raiz (campos duplicados removidos)
  RootCause: {
    contributingFactors: "",
    rootCauseType: "",
    rootCauseCategory: "",
    rootCauseSubcategory: "",
    mitigatingmeasures: "",
    preventiveactions: "",
  },

  // Caracterização de Acidente
  accidentCharacterization: {
    severityLevel: null,
    frequencyLevel: null,
    riskLevel: null,
    requiredActions: "",
  },

  // Conclusão
  conclusion: "",

  // Dados dos Condutores
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

  // Sistema de arquivos organizado por seção
  files: {
    3.1: [], // Cópia da documentação
    3.2: [], // Pedido de Esclarecimento
    3.3: [], // Notificação interna
    3.4: [], // SPdH mod. 086
    3.5: [], // Registo Fotográfico
    3.6: [], // Declaração Amigável
    6: [], // Procedimentos Internos
  },
};

// Estado global
let reportData = initializeReportData();

// Inicializa com dados do localStorage ou padrão
function initializeReportData() {
  try {
    const savedData = localStorage.getItem("reportData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Garante que novas propriedades sejam adicionadas se faltarem
      return { ...DEFAULT_REPORT_DATA, ...parsed };
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
  return JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
}

// Atualiza os dados do relatório
export const updateReportData = (newData) => {
  reportData = {
    ...reportData,
    ...newData,
    // Merge profundo para objetos aninhados
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
  saveToLocalStorage();
  return reportData;
};

// Atualiza uma lista específica de arquivos
export const updateFileList = (sectionId, fileList) => {
  if (!reportData.files[sectionId]) {
    console.warn(`Seção ${sectionId} não existe nos arquivos`);
    return;
  }

  reportData.files[sectionId] = fileList;
  saveToLocalStorage();
  return reportData.files;
};

// Obtém os dados atuais
export const getReportData = () => {
  return JSON.parse(JSON.stringify(reportData));
};

// Obtém dados de uma seção específica
export const getSectionData = (section) => {
  return JSON.parse(JSON.stringify(reportData[section]));
};

// Reseta todos os dados
export const resetReportData = () => {
  reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
  saveToLocalStorage();
  return reportData;
};

// Adiciona um arquivo a uma seção específica
export const addFileToSection = (sectionId, file) => {
  if (!reportData.files[sectionId]) {
    console.warn(`Seção ${sectionId} não encontrada`);
    return false;
  }

  reportData.files[sectionId].push(file);
  saveToLocalStorage();
  return true;
};

// Remove um arquivo de uma seção
export const removeFileFromSection = (sectionId, fileIndex) => {
  if (!reportData.files[sectionId]?.[fileIndex]) {
    console.warn(`Arquivo não encontrado na seção ${sectionId}`);
    return false;
  }

  reportData.files[sectionId].splice(fileIndex, 1);
  saveToLocalStorage();
  return true;
};

function saveToLocalStorage() {
  try {
    // Clona os dados, mas zera os arquivos
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

    localStorage.setItem("reportData", JSON.stringify(serializableData));
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
  }
}

// Funções úteis adicionais
export const getFileSections = () => {
  return Object.keys(DEFAULT_REPORT_DATA.files);
};

export const getFilesFromSection = (sectionId) => {
  return [...(reportData.files[sectionId] || [])];
};

export const clearReportData = () => {
  reportData = JSON.parse(JSON.stringify(DEFAULT_REPORT_DATA));
  saveToLocalStorage();
  return reportData;
};
