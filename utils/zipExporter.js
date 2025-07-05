import JSZip from "jszip";
import { Platform } from "react-native";
import { getReportData } from "../data/reportData";

let saveAs, FileSystem, Sharing;
if (Platform.OS === "web") {
  saveAs = require("file-saver").saveAs;
} else {
  FileSystem = require("expo-file-system");
  Sharing = require("expo-sharing");
}

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
        if (!file.uri || typeof file.uri !== "string") {
          console.warn(`URI inválido para o ficheiro ${file.name}`);
          continue;
        }

        console.log(`📄 A ler localmente ${file.name} de:`, file.uri);

        const base64Content = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        folder.file(file.name, base64Content, { base64: true });
      } catch (err) {
        console.warn(`❌ Erro ao processar localmente ${file.name}:`, err);
        continue;
      }
    }
  }

  if (Platform.OS === "web") {
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "relatorio_anexos.zip");
    console.log("[Web] Zip exportado com sucesso.");
  } else {
    console.log("➡️ A gerar conteúdo ZIP...");
    const content = await zip.generateAsync({ type: "base64" });

    console.log("📦 A gravar ficheiro ZIP...");
    const zipPath = FileSystem.documentDirectory + "relatorio_anexos.zip";

    await FileSystem.writeAsStringAsync(zipPath, content, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log("✅ Ficheiro ZIP gravado em:", zipPath);

    const fileInfo = await FileSystem.getInfoAsync(zipPath);
    console.log("📂 Existe ZIP?", fileInfo.exists, "| Tamanho:", fileInfo.size);

    console.log("📤 A partilhar...");
    await Sharing.shareAsync(zipPath);
    console.log("✅ Partilha concluída.");
  }
}
