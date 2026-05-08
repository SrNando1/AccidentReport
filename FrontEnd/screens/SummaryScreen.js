import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { getReportData, updateReportData } from "../data/reportData";
import { globalStyles } from "../components/styles";
import FormField from "../components/FormField";

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
        <Text style={globalStyles.label}>1. Summary</Text>
        <FormField
          style={[globalStyles.input, globalStyles.multilineInput]}
          value={summary}
          onChangeText={setSummary}
          placeholder="Please fill in this field"
          placeholderTextColor="red"
          multiline
          numberOfLines={5}
        />
      </View>
    </ScrollView>
  );
};

export default SummaryScreen;
