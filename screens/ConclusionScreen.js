import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { getReportData, updateReportData } from "../data/reportData";
import { globalStyles } from "../components/styles";

const ConclusionScreen = ({}) => {
  // Pega os dados iniciais do reportData
  const [conclusion, setConclusion] = useState(getReportData().conclusion);

  // Atualiza o reportData sempre que o campo muda
  useEffect(() => {
    updateReportData({ conclusion });
  }, [conclusion]);

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={globalStyles.formGroup1}>
        <Text style={globalStyles.label}>10. Conclusão</Text>
        <TextInput
          style={[globalStyles.input, globalStyles.multilineInput]}
          value={conclusion}
          onChangeText={setConclusion}
          placeholder="Preencha este campo"
          placeholderTextColor="red"
          multiline
          numberOfLines={5}
        />
      </View>
    </ScrollView>
  );
};

export default ConclusionScreen;
