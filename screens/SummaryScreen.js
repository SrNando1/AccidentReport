import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { getReportData, updateReportData } from "../data/reportData";
import { globalStyles } from "../components/styles";

const SummaryScreen = ({}) => {
  // Pega os dados iniciais do reportData
  const [summary, setSummary] = useState(getReportData().summary);

  // Atualiza o reportData sempre que o campo muda
  useEffect(() => {
    updateReportData({ summary });
  }, [summary]);

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={globalStyles.formGroup1}>
        <Text style={globalStyles.label}>1. Sumário</Text>
        <TextInput
          style={[globalStyles.input, globalStyles.multilineInput]}
          value={summary}
          onChangeText={setSummary}
          placeholder="Preencha este campo"
          placeholderTextColor="red"
          multiline
          numberOfLines={5}
        />
      </View>
    </ScrollView>
  );
};

export default SummaryScreen;
