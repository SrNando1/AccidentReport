// src/hooks/useReportData.js

import { useEffect, useState, useCallback } from "react";
import {
  initializeReportData,
  updateReportData as update,
  clearReportData,
  getFileSections,
  getFilesFromSection,
  addFileToSection,
  removeFileFromSection,
} from "../data/reportData";

export function useReportData() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega os dados ao montar
  useEffect(() => {
    async function loadData() {
      const data = await initializeReportData();
      setReportData(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Atualiza e reflete no estado
  const updateReportData = useCallback(async (newData) => {
    const updated = await update(newData);
    setReportData({ ...updated });
  }, []);

  const reset = useCallback(async () => {
    const resetData = await clearReportData();
    setReportData(resetData);
  }, []);

  return {
    reportData,
    updateReportData,
    loading,
    resetReportData: reset,
    getFileSections,
    getFilesFromSection,
    addFileToSection,
    removeFileFromSection,
  };
}
