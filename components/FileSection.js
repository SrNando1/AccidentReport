// components/FileSection.js
import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { ActionsDevelopedScreen } from "./styles";
import { showPickerOptions, pickDocument } from "../utils/fileHandlers";

export default function FileSection({
  sectionId,
  label,
  files,
  onFileSelected,
  onRename,
  onDelete,
}) {
  const hasFiles = files && files.length > 0;

  return (
    <View style={ActionsDevelopedScreen.formGroup}>
      <Text style={ActionsDevelopedScreen.label}>{label}</Text>
      <TouchableOpacity
        onPress={() =>
          Platform.OS === "web"
            ? pickDocument(sectionId, onFileSelected)
            : showPickerOptions(sectionId, onFileSelected)
        }
        style={ActionsDevelopedScreen.button}
      >
        {hasFiles ? (
          files.map((fileInfo, index) => (
            <View key={index}>
              <Text style={ActionsDevelopedScreen.fileLabel}>Arquivo:</Text>
              <Text style={ActionsDevelopedScreen.fileText}>
                {fileInfo.name}
              </Text>
              <Text style={ActionsDevelopedScreen.fileLabel}>Data:</Text>
              <Text style={ActionsDevelopedScreen.fileText}>
                {fileInfo.modified}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 5,
                }}
              >
                <TouchableOpacity
                  onPress={() => onRename(sectionId, index, fileInfo.name)}
                  style={{ marginTop: 5 }}
                >
                  <Text style={{ color: "blue" }}>Renomear ✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDelete(sectionId, index)}
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
  );
}
