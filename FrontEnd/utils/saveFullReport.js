// utils/saveFullReport.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReportData } from "../data/reportData";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { dataURItoBlob } from "./fileHandlers";
import JSZip from "jszip";
import { uploadSingleFile } from "./uploadService";
import { sectionFolderName } from "./sectionNames";

export async function saveFullReport(
  reportNumber,
  { download = true, state: stateOpt } = {},
) {
  const report = getReportData();

  const rawVehicleId = Number(report?.vehicleAId);
  const vehicleId = Number.isInteger(rawVehicleId) ? rawVehicleId : null;

  // normaliza o estado; default PENDING
  const allowed = new Set(["PENDING", "APPROVED", "REJECTED"]);
  const finalState = (() => {
    if (typeof stateOpt === "string" && allowed.has(stateOpt.toUpperCase())) {
      return stateOpt.toUpperCase();
    }
    return "PENDING";
  })();
  const employerId = Number(report?.DataDriverA?.selectedEmployerId);
  const safeEmployerId = Number.isInteger(employerId) ? employerId : null;
  const zip = new JSZip();

  const rawLevel = Number(report?.accidentCharacterization?.riskLevel);
  const level =
    Number.isInteger(rawLevel) && rawLevel >= 1 && rawLevel <= 25
      ? rawLevel
      : undefined; // se não houver, não envia
  console.log("[saveFullReport] Arquivos recebidos para o ZIP:", report.files);
  const zipName = `${Date.now()}_relatorio_anexos.zip`;

  let userId = null;
  try {
    const raw = await AsyncStorage.getItem("userId");
    if (raw != null && !Number.isNaN(Number(raw))) userId = Number(raw);
  } catch {}

  // ✅ Obtem nome do usuário de forma correta
  let user = "desconhecido";
  try {
    const storedName = await AsyncStorage.getItem("userName");
    if (storedName) user = storedName;
  } catch (err) {
    console.warn("❌ Erro ao buscar nome do usuário:", err);
  }

  // 1. Gerar o PDF
  console.log("📄 Gerando PDF...");

  const { generatePdfFromTemplate } = require("./generatePdfFromTemplate");

  const pdfBytes = await generatePdfFromTemplate(report);

  if (Platform.OS === "web") {
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    zip.file("RelatorioAcidente.pdf", pdfBlob);
  } else {
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
    zip.file("RelatorioAcidente.pdf", pdfBase64, { base64: true });
  }

  // 2. Anexar arquivos
  for (const sectionId in report.files || {}) {
    const section = report.files[sectionId];
    if (!section?.length) continue;

    const folder = zip.folder(sectionFolderName(sectionId));

    for (const file of section) {
      if (Platform.OS === "web") {
        if (Platform.OS === "web") {
          try {
            console.log("🧪 file.uri:", file.uri);

            let blob = null;

            if (file.blob instanceof Blob) {
              blob = file.blob;
            } else if (file.uri?.startsWith("data:")) {
              blob = dataURItoBlob(file.uri);
            } else if (file.uri?.startsWith("blob:")) {
              try {
                const response = await fetch(file.uri);
                blob = await response.blob();
              } catch (err) {
                console.warn(`❌ Erro ao buscar blob: ${file.uri}`, err);
              }
            }

            if (blob && typeof blob.arrayBuffer === "function") {
              const fileBuffer = await blob.arrayBuffer();
              folder.file(file.name, fileBuffer);
              console.log("✅ Adicionado ao zip:", file.name);
            } else {
              console.warn(`⚠️ Blob inválido para ${file.name}:`, blob);
            }
          } catch (err) {
            console.warn(
              `❌ Erro ao processar arquivo "${file.name}" no Web:`,
              err,
            );
          }
        }
      }
    }
  }

  // 3. Gerar e salvar o ZIP localmente (somente mobile)
  let localZipPath = null;

  if (Platform.OS !== "web") {
    const zipBase64 = await zip.generateAsync({ type: "base64" });
    localZipPath = FileSystem.documentDirectory + zipName;

    await FileSystem.writeAsStringAsync(localZipPath, zipBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const allFiles = Object.keys(zip.files);
  console.log("📦 Arquivos no ZIP:", allFiles);
  if (allFiles.length === 0) {
    console.warn("🚨 ZIP está vazio. Verifique os arquivos selecionados.");
  }

  let zipBlob = null;
  if (Platform.OS === "web") {
    zipBlob = await zip.generateAsync({ type: "blob" });
  }

  if (Platform.OS === "web") {
    // Já temos o zipBlob aqui
    const zipFile = new File([zipBlob], zipName, { type: "application/zip" });

    await uploadSingleFile({
      user,
      userId,
      reportNumber,
      name: zipName,
      file: zipFile, // <- agora é um File válido
      type: "application/zip",
      state: finalState,
      level,
      employerId: safeEmployerId,
      vehicleId,
    });

    // ⬇️ Dispara o download do ZIP no navegador
    try {
      if (download && zipBlob) {
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = zipName;
        document.body.appendChild(a);
        a.click();
        // limpeza
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
      }
    } catch (e) {
      console.warn("[saveFullReport] falha ao iniciar download:", e);
    }
  } else {
    // No mobile, envia o caminho local do arquivo salvo
    await uploadSingleFile({
      user,
      userId,
      reportNumber,
      name: zipName,
      uri: localZipPath, // ou file: zipFile no web
      type: "application/zip",
      state: finalState,
      level,
      employerId: safeEmployerId, // <-- ADICIONA ISTO
      vehicleId,
    });
  }
}
