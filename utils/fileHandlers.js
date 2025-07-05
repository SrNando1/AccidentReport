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

// Garante que o URI seja um file:// válido, copiando content:// no Android
const ensureFileUri = async (uri) => {
  if (Platform.OS === "android" && uri.startsWith("content://")) {
    const filename = uri.split("/").pop();
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    try {
      await FileSystem.copyAsync({ from: uri, to: fileUri });
      return fileUri;
    } catch (err) {
      console.error("Erro ao copiar URI de conteúdo:", err);
      return uri;
    }
  }
  return uri;
};

export const pickDocument = async (sectionId, onFileSelected) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: false,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      // Converte content:// em file:// se necessário
      const uri = await ensureFileUri(file.uri);
      const modified = await getFileData(uri);

      onFileSelected(
        {
          name: file.name,
          uri,
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
      // Mesmo que venha file://, garantimos via ensureFileUri
      const originalUri = result.assets[0].uri;
      const uri = await ensureFileUri(originalUri);
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
