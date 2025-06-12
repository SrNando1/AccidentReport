import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

const RootCauseScreen = () => {
  const [selectedSeverity, setSelectedSeverity] = useState(null);

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
        "Sem lesões.\nSem danos no equipamento Groundforce mas com danos no equipamento ou infraestrutura de terceiros",
    },
    {
      level: 3,
      title: "MODERADO",
      description:
        "Sem lesões.\nCom danos no equipamento Groundforce e no equipamento ou infraestrutura de terceiros com imobilização até 24 horas",
    },
    {
      level: 4,
      title: "CRÍTICO",
      description:
        "Com lesões ligeiras\nCom danos no equipamento Groundforce e no equipamento ou infraestrutura de terceiros com imobilização superior a 24 horas",
    },
    {
      level: 5,
      title: "CATASTRÓFICO",
      description:
        "Com lesões graves\nPerda total do equipamento\nAusência de reporte",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>SEVERIDADE DAS CONSEQUÊNCIAS</Text>

      <View style={styles.table}>
        {severityData.map((item) => (
          <View key={item.level} style={styles.row}>
            <TouchableOpacity
              style={[
                styles.levelButton,
                selectedSeverity === item.level && styles.selectedButton,
              ]}
              onPress={() => setSelectedSeverity(item.level)}
            >
              <Text style={styles.levelText}>{item.level}</Text>
            </TouchableOpacity>

            <View style={styles.descriptionContainer}>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  levelButton: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 20,
  },
  selectedButton: {
    backgroundColor: "#2e86de",
  },
  levelText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  descriptionContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});

export default RootCauseScreen;
