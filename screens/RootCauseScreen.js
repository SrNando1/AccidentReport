import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getReportData, updateReportData } from "../data/reportData";
import {
  globalStyles,
  ActionsDevelopedScreen,
  ModalStyles,
} from "../components/styles";
import { showPickerOptions, pickDocument } from "../utils/fileHandlers";
import { causeData } from "../data/rootCauseData";

const RootCauseScreen = () => {
  const fullData = getReportData();
  const initialRootCauseData = fullData.RootCause || {};
  const initialFiles = fullData.files || {};
  const [files, setFiles] = useState(initialFiles);

  const [contributingFactors, setContributingFactors] = useState(
    initialRootCauseData.contributingFactors || ""
  );
  const [rootCauseType, setRootCauseType] = useState(
    initialRootCauseData.rootCauseType || null
  );
  const [rootCauseCategory, setRootCauseCategory] = useState(
    initialRootCauseData.rootCauseCategory || null
  );
  const [rootCauseSubcategory, setRootCauseSubcategory] = useState(
    initialRootCauseData.rootCauseSubcategory || null
  );
  const [mitigatingmeasures, setMitigatingmeasures] = useState(
    initialRootCauseData.mitigatingmeasures || ""
  );
  const [preventiveactions, setPreventiveactions] = useState(
    initialRootCauseData.preventiveactions || ""
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");
  const [currentFileIndex, setCurrentFileIndex] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);

  useEffect(() => {
    updateReportData({
      RootCause: {
        contributingFactors,
        rootCauseType,
        rootCauseCategory,
        rootCauseSubcategory,
        mitigatingmeasures,
        preventiveactions,
      },
      files,
    });
  }, [
    contributingFactors,
    rootCauseType,
    rootCauseCategory,
    rootCauseSubcategory,
    mitigatingmeasures,
    preventiveactions,
    files,
  ]);

  const updateRootCause = (updatedFields = {}) => {
    updateReportData({
      RootCause: {
        ...getReportData().RootCause,
        contributingFactors,
        mitigatingmeasures,
        preventiveactions,
        files,
        ...updatedFields, // prioriza campos atualizados via Picker
      },
    });
  };

  const onFileSelected = (file, sectionId) => {
    setFiles((prev) => {
      const newFiles = [...(prev[sectionId] || []), file];
      setCurrentSection(sectionId);
      setCurrentFileIndex(newFiles.length - 1);
      setTempName(file.name);
      return { ...prev, [sectionId]: newFiles };
    });
    setModalVisible(true);
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
      return { ...prev, [currentSection]: updatedFiles };
    });

    setModalVisible(false);
  };

  const handleDeleteFile = (sectionId, index) => {
    setFiles((prev) => {
      const updatedFiles = [...(prev[sectionId] || [])];
      updatedFiles.splice(index, 1);
      return { ...prev, [sectionId]: updatedFiles };
    });
  };

  // Obtém categorias para o tipo selecionado
  const getCurrentCategories = () => {
    if (!rootCauseType) return [];
    return causeData.categories[rootCauseType] || [];
  };

  // Obtém subcategorias para a categoria selecionada
  const getCurrentSubcategories = () => {
    if (!rootCauseType || !rootCauseCategory) return [];
    const subcategoryKey = `${rootCauseType}-${
      rootCauseCategory.split("-")[1]
    }`;
    return causeData.subcategories[subcategoryKey] || [];
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={globalStyles.formGroup}>
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label}>4. Fatores Contribuintes</Text>
          <TextInput
            style={[globalStyles.input, globalStyles.multilineInput]}
            value={contributingFactors}
            onChangeText={setContributingFactors}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
            multiline
            numberOfLines={4}
          />
        </View>
        <View style={globalStyles.formGroup1}>
          {/* Tipo de Causa */}
          <Text style={globalStyles.label}>5. Tipo de Causa</Text>
          <View style={globalStyles.pickerContainer}>
            <Picker
              selectedValue={rootCauseType}
              onValueChange={(value) => {
                setRootCauseType(value);
                setRootCauseCategory(null);
                setRootCauseSubcategory(null);
                updateRootCause({
                  rootCauseType: value,
                  rootCauseCategory: null,
                  rootCauseSubcategory: null,
                });
              }}
            >
              <Picker.Item label="Selecione um tipo" value={null} />
              {causeData.types.map((type) => (
                <Picker.Item key={type.id} label={type.name} value={type.id} />
              ))}
            </Picker>
          </View>

          {/* Categoria (aparece apenas quando tipo é selecionado) */}
          {rootCauseType && (
            <View style={globalStyles.pickerContainer}>
              <Picker
                selectedValue={rootCauseCategory}
                onValueChange={(value) => {
                  setRootCauseCategory(value);
                  setRootCauseSubcategory(null);
                  updateRootCause({
                    rootCauseType, // mantém o tipo
                    rootCauseCategory: value, // atualiza categoria
                    rootCauseSubcategory: null, // limpa subcategoria
                  });
                }}
              >
                <Picker.Item label="Selecione uma categoria" value={null} />
                {getCurrentCategories().map((cat) => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>
            </View>
          )}

          {/* Subcategoria (aparece apenas quando categoria é selecionada) */}
          {rootCauseCategory && getCurrentSubcategories().length > 0 && (
            <View style={globalStyles.pickerContainer}>
              <Picker
                selectedValue={rootCauseSubcategory}
                onValueChange={(value) => {
                  setRootCauseSubcategory(value);
                  updateRootCause({
                    rootCauseType,
                    rootCauseCategory,
                    rootCauseSubcategory: value,
                  });
                }}
              >
                <Picker.Item label="Selecione uma subcategoria" value={null} />
                {getCurrentSubcategories().map((sub) => (
                  <Picker.Item key={sub.id} label={sub.name} value={sub.id} />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* Procedimentos Internos */}
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label}>6. Procedimentos Internos</Text>
          <TouchableOpacity
            onPress={() =>
              Platform.OS === "web"
                ? pickDocument("6", onFileSelected)
                : showPickerOptions("6", onFileSelected)
            }
            style={ActionsDevelopedScreen.button}
          >
            {files["6"]?.length > 0 ? (
              files["6"].map((file, i) => (
                <View key={i}>
                  <Text style={ActionsDevelopedScreen.fileLabel}>Arquivo:</Text>
                  <Text style={ActionsDevelopedScreen.fileText}>
                    {file.name}
                  </Text>
                  <Text style={ActionsDevelopedScreen.fileLabel}>Data:</Text>
                  <Text style={ActionsDevelopedScreen.fileText}>
                    {file.modified}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 5,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setCurrentSection("6");
                        setCurrentFileIndex(i);
                        setTempName(file.name);
                        setModalVisible(true);
                      }}
                      style={{ marginTop: 5 }}
                    >
                      <Text style={{ color: "blue" }}>Renomear ✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteFile("6", i)}
                      style={{ marginTop: 5 }}
                    >
                      <Text style={{ color: "red" }}>Remover ❌</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={ActionsDevelopedScreen.buttonText}>
                Anexar Arquivo ou Foto
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label}>7. Medidas Mitigatorias</Text>
          <TextInput
            style={[globalStyles.input]}
            value={mitigatingmeasures}
            onChangeText={setMitigatingmeasures}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
        </View>

        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label}>8. Outras Ações Preventivas</Text>
          <TextInput
            style={[globalStyles.input]}
            value={preventiveactions}
            onChangeText={setPreventiveactions}
            placeholder="Descreva os fatores contribuintes"
            placeholderTextColor="red"
          />
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={ModalStyles.modalBackdrop}>
          <View style={ModalStyles.modalContainer}>
            <Text style={ModalStyles.modalTitle}>Renomear arquivo</Text>
            <TextInput
              style={ModalStyles.input}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
              placeholder="Digite o novo nome"
            />
            <View style={ModalStyles.modalButtons}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="OK" onPress={handleRenameConfirm} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default RootCauseScreen;
