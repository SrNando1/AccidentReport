// utils/uploadService.js
import { Platform } from "react-native";

export async function uploadSingleFile(params) {
  const form = new FormData();

  // Campos de texto (sempre antes do arquivo)
  form.append("user", params.user);
  form.append("report_number", params.reportNumber);

  // envia sempre (ou garante fallback no backend)
  form.append("state", params.state || "PENDING");

  // level 1..25
  if (Number.isInteger(Number(params.level))) {
    form.append("level", String(params.level));
  }

  if (Number.isInteger(Number(params.userId))) {
    form.append("user_id", String(params.userId)); // <- NOVO
  }

  if (Number.isInteger(Number(params.employerId))) {
    form.append("employer_id", String(params.employerId)); // ✅ ENVIA employerId
  }

  if (Number.isInteger(Number(params.vehicleId))) {
    form.append("vehicle_id", String(params.vehicleId)); // ✅ ENVIA vehicleId
  }

  if (Platform.OS === "web") {
    if (params.file instanceof File) {
      form.append("file", params.file);
    } else if (params.blob) {
      const name = params.name || "report.zip";
      const type = params.type || "application/zip";
      form.append("file", new File([params.blob], name, { type }));
    } else if (params.uri instanceof File) {
      // compat: se alguém ainda mandar { uri: File }
      form.append("file", params.uri);
    } else {
      throw new Error("uploadSingleFile(web): faltou file/blob.");
    }
  } else {
    form.append("file", {
      uri: params.uri,
      name: params.name,
      type: params.type || "application/zip",
    });
  }

  const res = await fetch("http://localhost:3000/api/upload/file", {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Falha no upload do arquivo");
  return res.json();
}
