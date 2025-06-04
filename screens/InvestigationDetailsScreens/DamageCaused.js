import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { getReportData, updateReportData } from "../../data/reportData";
import { globalStyles } from "../../components/styles";

const FramingScreen = ({ navigation }) => {
  // Pega os dados iniciais do reportData
  const [DamageCausedDescription, setDamageCausedDescription] = useState(
    getReportData().DamageCausedDescription
  );

  // Atualiza o reportData sempre que o campo muda
  useEffect(() => {
    updateReportData({
      DamageCausedDescription,
    });
  }, [DamageCausedDescription]);

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={globalStyles.formGroup1}>
        <Text style={globalStyles.label1}>
          2.2 Descrição de Danos Causados{" "}
        </Text>
        <TextInput
          style={[globalStyles.input, globalStyles.multilineInput]}
          value={DamageCausedDescription}
          onChangeText={setDamageCausedDescription}
          placeholder="Descreva os danos causados nas Viaturas"
          placeholderTextColor="red"
          multiline
          numberOfLines={5}
        />
      </View>
    </ScrollView>
  );
};

export default FramingScreen;
