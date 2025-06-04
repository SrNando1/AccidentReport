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
      info.modificationTime || Date.now()
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

      onFileSelected(
        {
          name: file.name,
          uri: file.uri,
          modified,
        },
        sectionId
      );
    }
  } catch (err) {
    console.error("Erro ao selecionar documento:", err);
  }
};

export const openCamera = async (sectionId, onFileSelected) => {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permissão negada",
        "É necessária permissão para usar a câmera."
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
        sectionId
      );
    }
  } catch (err) {
    console.error("Erro ao abrir câmera:", err);
  }
};

export const showPickerOptions = async (sectionId, onFileSelected) => {
  Alert.alert(
    "Selecionar fonte",
    "Escolha como deseja anexar o arquivo",
    [
      { text: "Câmera", onPress: () => openCamera(sectionId, onFileSelected) },
      {
        text: "Arquivos",
        onPress: () => pickDocument(sectionId, onFileSelected),
      },
      { text: "Cancelar", style: "cancel" },
    ],
    { cancelable: true }
  );
};
