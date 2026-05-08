import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Button,
  Platform,
} from "react-native";
import {
  getReportData,
  updateReportData,
  setReportData,
} from "../data/reportData";
import { globalStyles } from "../components/styles";
import {
  showPickerOptions,
  dataURItoBlob,
  pickFileWeb,
} from "../utils/fileHandlers";

export default function ActionsDevelopedScreen() {
  const [files, setFiles] = useState(getReportData().files || {});
  const [modalVisible, setModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);

  // Atualiza os dados sempre que files mudar
  useEffect(() => {
    updateReportData({ files });
  }, [files]);

  // Carrega os dados ao montar o componente
  useEffect(() => {
    const loadedData = getReportData();
    if (loadedData.files) {
      setFiles(loadedData.files);
    }
  }, []);

  // Função que o fileHandlers chama ao selecionar arquivo

  const onFileSelected = async (file, sectionId) => {
    let finalFile = file;

    if (Platform.OS === "web") {
      // 🧠 Tenta converter .uri (data:...) em blob se não existir
      if (!file.blob && file.uri?.startsWith("data:")) {
        finalFile = {
          ...file,
          blob: dataURItoBlob(file.uri),
        };
      }
    }

    setFiles((prev) => {
      const updatedSectionFiles = prev[sectionId]
        ? [...prev[sectionId], finalFile]
        : [finalFile];
      return {
        ...prev,
        [sectionId]: updatedSectionFiles,
      };
    });
  };

  const handleFileSelect = async (sectionId) => {
    if (Platform.OS === "web") {
      await pickFileWeb(sectionId, onFileSelected);
    } else {
      await showPickerOptions(sectionId, onFileSelected);
    }
  };

  const handleRenameConfirm = () => {
    if (
      currentSection === null ||
      currentFileIndex === null ||
      !files[currentSection] ||
      !files[currentSection][currentFileIndex]
    )
      return;

    const file = files[currentSection][currentFileIndex];
    const ext = file.name.includes(".")
      ? file.name.substring(file.name.lastIndexOf("."))
      : "";

    const newName = tempName.trim();
    const finalName = newName.endsWith(ext) ? newName : newName + ext;

    setFiles((prev) => {
      const updatedFiles = [...prev[currentSection]];
      updatedFiles[currentFileIndex] = {
        ...file,
        name: finalName || file.name,
      };

      return {
        ...prev,
        [currentSection]: updatedFiles,
      };
    });

    setModalVisible(false);
  };

  const handleDeleteFile = (sectionId, index) => {
    setFiles((prev) => {
      const updatedFiles = [...(prev[sectionId] || [])];
      updatedFiles.splice(index, 1);
      return {
        ...prev,
        [sectionId]: updatedFiles,
      };
    });
  };

  const renderFileSection = (sectionId, title) => (
    <View style={globalStyles.formGroup1} key={sectionId}>
      <Text style={globalStyles.label}>{title}</Text>

      {files[sectionId]?.map((fileInfo, index) => (
        <View key={index} style={styles.fileContainer}>
          <Text style={styles.fileLabel}>File:</Text>
          <Text style={styles.fileText}>{fileInfo.name}</Text>
          <Text style={styles.fileLabel}>Date:</Text>
          <Text style={styles.fileText}>{fileInfo.modified}</Text>
          <View style={styles.fileActions}>
            <TouchableOpacity
              onPress={() => {
                setCurrentSection(sectionId);
                setCurrentFileIndex(index);
                setTempName(fileInfo.name);
                setModalVisible(true);
              }}
              style={styles.actionButton}
            >
              <Text style={styles.renameText}>Rename ✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteFile(sectionId, index)}
              style={styles.actionButton}
            >
              <Text style={styles.deleteText}>Remove ❌</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => handleFileSelect(sectionId)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Attach File or Photo</Text>
      </TouchableOpacity>
    </View>
  );

  const sections = [
    { id: "3.1", title: "3.1 Copy of the documentation of those involved" },
    { id: "3.2", title: "3.2 Request for Clarification from the Operator" },
    { id: "3.3", title: "3.3 Internal incident notification" },
    { id: "3.4", title: "3.4 Completed SPdH form 086" },
    { id: "3.5", title: "3.5 Photographic Record" },
    {
      id: "3.6",
      title: "3.6 Completed of the Friendly Accident Report Form",
    },
  ];

  return (
    <ScrollView style={globalStyles.container}>
      {sections.map((section) => renderFileSection(section.id, section.title))}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}> Rename file</Text>
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
              placeholder="Digite o novo nome"
            />
            <View style={styles.modalButtons}>
              <Button title="CANCEL" onPress={() => setModalVisible(false)} />
              <Button title="OK" onPress={handleRenameConfirm} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  fileLabel: {
    fontWeight: "bold",
    color: "#000",
  },
  fileText: {
    color: "#FFFFFF",
    marginBottom: 5,
  },
  fileContainer: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 10,
  },
  fileActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
  },
  actionButton: {
    marginLeft: 10,
  },
  renameText: {
    color: "blue",
  },
  deleteText: {
    color: "red",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
