// fileHandlers.js
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";

// Função para obter metadata do arquivo
const getFileData = async (uri) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    const modified = new Date(
      info.modificationTime || Date.now(),
    ).toLocaleDateString();
    return modified;
  } catch {
    return new Date().toLocaleDateString();
  }
};

export const pickDocument = async (sectionId, onFileSelected) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: false,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const modified = await getFileData(file.uri);

      const fileToSave = {
        name: file.name,
        uri: file.uri,
        modified,
      };

      if (Platform.OS === "web") {
        try {
          const blob = file.file || file.blob; // caso venha direto
          if (blob) {
            fileToSave.blob = blob;
          } else {
            const response = await fetch(file.uri);
            const fetchedBlob = await response.blob();
            fileToSave.blob = fetchedBlob;
          }
        } catch (err) {
          console.error("❌ Erro ao obter blob (web):", err);
        }
      }

      onFileSelected(fileToSave, sectionId);
    }
  } catch (err) {
    console.error("Error selecting document:", err);
  }
};

export const openCamera = async (sectionId, onFileSelected) => {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão negada",
        "É necessária permissão para usar a câmera.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const modified = await getFileData(uri);
      const name = uri.split("/").pop();

      onFileSelected(
        {
          name,
          uri,
          modified,
        },
        sectionId,
      );
    }
  } catch (err) {
    console.error("Erro ao abrir câmera:", err);
  }
};

export const showPickerOptions = async (sectionId, onFileSelected) => {
  Alert.alert(
    "Select source",
    "Choose how you want to attach the file",
    [
      { text: "Camera", onPress: () => openCamera(sectionId, onFileSelected) },
      {
        text: "Files",
        onPress: () => pickDocument(sectionId, onFileSelected),
      },
      { text: "Cancel", style: "cancel" },
    ],
    { cancelable: true },
  );
};

// 🔄 Alternativa de seleção de arquivos no Web
export async function pickFileWeb(sectionId, onFileSelected) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "*/*";
  input.multiple = true;

  input.onchange = async () => {
    const files = Array.from(input.files);

    for (const file of files) {
      const fileObj = {
        name: file.name,
        uri: URL.createObjectURL(file),
        modified: file.lastModified,
        blob: file, // ✅ ESSENCIAL: isso precisa ser o File (Blob)
      };
      onFileSelected(fileObj, sectionId);
    }
  };

  input.click();
}

export function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}
