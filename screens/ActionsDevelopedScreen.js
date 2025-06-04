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
import { getReportData, updateReportData } from "../data/reportData";
import { globalStyles } from "../components/styles";
import { showPickerOptions, pickDocument } from "../utils/fileHandlers";

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
  const onFileSelected = (file, sectionId) => {
    setFiles((prev) => {
      const updatedSectionFiles = prev[sectionId]
        ? [...prev[sectionId], file]
        : [file];
      return {
        ...prev,
        [sectionId]: updatedSectionFiles,
      };
    });
  };

  const handleFileSelect = async (sectionId) => {
    if (Platform.OS === "web") {
      await pickDocument(sectionId, onFileSelected);
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
          <Text style={styles.fileLabel}>Arquivo:</Text>
          <Text style={styles.fileText}>{fileInfo.name}</Text>
          <Text style={styles.fileLabel}>Data:</Text>
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
              <Text style={styles.renameText}>Renomear ✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteFile(sectionId, index)}
              style={styles.actionButton}
            >
              <Text style={styles.deleteText}>Remover ❌</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => handleFileSelect(sectionId)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Anexar Arquivo ou Foto</Text>
      </TouchableOpacity>
    </View>
  );

  const sections = [
    { id: "3.1", title: "3.1 Cópia da documentação dos envolvidos" },
    { id: "3.2", title: "3.2 Pedido de Esclarecimento ao Operador" },
    { id: "3.3", title: "3.3 Notificação interna do incidente" },
    { id: "3.4", title: "3.4 Preenchido SPdH mod. 086" },
    { id: "3.5", title: "3.5 Registo Fotográfico" },
    {
      id: "3.6",
      title: "3.6 Preenchimento da Declaração Amigável de Acidente Automóvel",
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
            <Text style={styles.modalTitle}>Renomear arquivo</Text>
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
              placeholder="Digite o novo nome"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
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
