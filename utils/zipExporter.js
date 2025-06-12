// src/utils/exportFilesAsZip.js
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getReportData } from "../data/reportData";

// Mapeia os IDs das seções para nomes mais descritivos
const sectionNames = {
  3.1: "3.1 Cópia da documentação dos envolvidos",
  3.2: "3.2 Pedido de Esclarecimento ao Operador",
  3.3: "3.3 Notificação interna do incidente",
  3.4: "3.4 SPdH_086",
  3.5: "3.5 Registo_Fotografico",
  3.6: "3.6 Declaracao_Amigavel",
  6: "6 Procedimentos_Internos",
};

export async function exportFilesAsZip() {
  const zip = new JSZip();
  const report = getReportData();
  const files = report.files;

  for (const sectionId in files) {
    const sectionFiles = files[sectionId];

    if (!sectionFiles || sectionFiles.length === 0) continue;

    const folderName = sectionNames[sectionId] || `Secao_${sectionId}`;
    const folder = zip.folder(folderName);

    for (const file of sectionFiles) {
      try {
        const response = await fetch(file.uri);
        const blob = await response.blob();

        folder.file(file.name, blob);
      } catch (error) {
        console.warn(`Erro ao buscar o arquivo ${file.name}:`, error);
      }
    }
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "relatorio_anexos.zip");
    console.log("[exportFilesAsZip] Arquivos exportados com sucesso.");
  });
}
