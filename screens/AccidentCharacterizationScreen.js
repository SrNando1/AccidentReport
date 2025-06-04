import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { getReportData, updateReportData } from "../data/reportData";
import {
  AccidentCharacterizationScreen,
  globalStyles,
} from "../components/styles";

const AccidentCharacterization = () => {
  const initialData = getReportData();
  const [selectedSeverity, setSelectedSeverity] = useState(
    initialData.accidentCharacterization?.severityLevel || null
  );
  const [selectedFrequency, setSelectedFrequency] = useState(
    initialData.accidentCharacterization?.frequencyLevel || null
  );
  const [riskLevel, setRiskLevel] = useState(
    initialData.accidentCharacterization?.riskLevel || null
  );
  const [requiredActions, setRequiredActions] = useState(
    initialData.accidentCharacterization?.requiredActions || ""
  );

  // Verifica se ambas as seleções foram feitas
  const bothSelected = selectedSeverity !== null && selectedFrequency !== null;

  // Calcula o nível de risco quando as seleções mudam
  useEffect(() => {
    if (selectedSeverity && selectedFrequency) {
      const calculatedRisk = selectedSeverity * selectedFrequency;
      setRiskLevel(calculatedRisk);

      // Determina as ações baseadas no nível de risco
      let actions = "";
      if (calculatedRisk <= 4) {
        actions = "Ação de sensibilização com a Chefia Operacional";
      } else if (calculatedRisk >= 5 && calculatedRisk <= 8) {
        actions = "Frequenta refrescamento da formação Airside Safety";
      } else if (calculatedRisk >= 9 && calculatedRisk <= 12) {
        actions = "Ação de Sensibilização com o Diretor de Operações";
      } else if (calculatedRisk >= 15 && calculatedRisk <= 25) {
        actions = "Paralisação imediata das atividades";
      }
      setRequiredActions(actions);

      updateReportData({
        accidentCharacterization: {
          severityLevel: selectedSeverity,
          frequencyLevel: selectedFrequency,
          riskLevel: calculatedRisk,
          requiredActions: actions,
        },
      });
    }
  }, [selectedSeverity, selectedFrequency]);

  const severityData = [
    {
      level: 1,
      title: "NEGLIGENCIÁVEL",
      description: "Sem lesões.\nSem danos no equipamento ou infraestrutura",
    },
    {
      level: 2,
      title: "MENOR",
      description:
        "Sem lesões.\nSem danos no equipamento Fuel Staff mas com danos no equipamento ou infraestrutura de terceiros",
    },
    {
      level: 3,
      title: "MODERADO",
      description:
        "Sem lesões.\nCom danos no equipamento Fuel Staff e no equipamento ou infraestrutura de terceiros com imobilização até 24 horas",
    },
    {
      level: 4,
      title: "CRÍTICO",
      description:
        "Com lesões ligeiras\nCom danos no equipamento Fuel Staff e no equipamento ou infraestrutura de terceiros com imobilização superior a 24 horas",
    },
    {
      level: 5,
      title: "CATASTRÓFICO",
      description:
        "Com lesões graves\nPerda total do equipamento\nAusência de reporte",
    },
  ];

  const frequencyData = [
    {
      level: 1,
      title: "MUITO RARO",
      description: "1 Ocorrência a cada 5 anos",
    },
    { level: 2, title: "RARO", description: "2 Ocorrências a cada 5 anos" },
    { level: 3, title: "REMOTA", description: "3 Ocorrências a cada 5 anos" },
    {
      level: 4,
      title: "FREQUENTE",
      description: "4 Ocorrências a cada 5 anos",
    },
    {
      level: 5,
      title: "MUITO FREQUENTE",
      description: "1 ou mais ocorrências no último ano",
    },
  ];

  const SelectionItem = ({ item, selected, onSelect }) => (
    <TouchableOpacity
      style={[
        AccidentCharacterizationScreen.row,
        selected === item.level && { backgroundColor: "#f0f8ff" },
      ]}
      onPress={() => onSelect(item.level)}
      activeOpacity={0.7}
    >
      <View style={AccidentCharacterizationScreen.levelButton}>
        <Text
          style={[
            AccidentCharacterizationScreen.levelText,
            selected === item.level && { color: "#2e86de" },
          ]}
        >
          {item.level}
        </Text>
      </View>

      <View style={AccidentCharacterizationScreen.descriptionContainer}>
        <Text
          style={[
            AccidentCharacterizationScreen.titleText,
            selected === item.level && { color: "#2e86de" },
          ]}
        >
          {item.title}
        </Text>
        <Text style={AccidentCharacterizationScreen.descriptionText}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={globalStyles.formGroup}>
        {/* Seção de Severidade */}
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label}>
            9.1 SEVERIDADE DAS CONSEQUÊNCIAS
          </Text>
          <View style={AccidentCharacterizationScreen.table}>
            {severityData.map((item) => (
              <SelectionItem
                key={`severity-${item.level}`}
                item={item}
                selected={selectedSeverity}
                onSelect={setSelectedSeverity}
              />
            ))}
          </View>
        </View>

        {/* Seção de Frequência */}
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label}>9.2 FREQUÊNCIA DAS OCORRÊNCIAS</Text>
          <View style={AccidentCharacterizationScreen.table}>
            {frequencyData.map((item) => (
              <SelectionItem
                key={`frequency-${item.level}`}
                item={item}
                selected={selectedFrequency}
                onSelect={setSelectedFrequency}
              />
            ))}
          </View>
        </View>

        {/* Seção de Resultado - Tabela 2x2 */}
        {bothSelected && (
          <View style={globalStyles.formGroup1}>
            <Text style={globalStyles.label}>AVALIAÇÃO DE RISCO</Text>
            <View style={AccidentCharacterizationScreen.table}>
              {/* Primeira linha */}
              <View
                style={[
                  AccidentCharacterizationScreen.row,
                  { flexDirection: "row" },
                ]}
              >
                <View
                  style={[
                    AccidentCharacterizationScreen.tableCell,
                    { flex: 1, justifyContent: "center" },
                  ]}
                >
                  <Text style={AccidentCharacterizationScreen.tableHeaderText}>
                    9.3 Nível de Aceitabilidade
                  </Text>
                </View>
                <View
                  style={[
                    AccidentCharacterizationScreen.tableCell,
                    { flex: 1, justifyContent: "center" },
                  ]}
                >
                  <Text style={AccidentCharacterizationScreen.tableValueText}>
                    {riskLevel ? riskLevel : "Selecione acima"}
                  </Text>
                </View>
              </View>

              {/* Segunda linha */}
              <View
                style={[
                  AccidentCharacterizationScreen.row,
                  { flexDirection: "row" },
                ]}
              >
                <View
                  style={[
                    AccidentCharacterizationScreen.tableCell,
                    { flex: 1, justifyContent: "center" },
                  ]}
                >
                  <Text style={AccidentCharacterizationScreen.tableHeaderText}>
                    9.4 Ações a Desenvolver
                  </Text>
                </View>
                <View
                  style={[
                    AccidentCharacterizationScreen.tableCell,
                    { flex: 1, justifyContent: "center" },
                  ]}
                >
                  <Text style={AccidentCharacterizationScreen.tableValueText}>
                    {requiredActions || "Selecione acima"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default AccidentCharacterization;
