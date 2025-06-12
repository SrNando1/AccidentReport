import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { getReportData, clearReportData } from "../data/reportData";
import { showExportOptions } from "../utils/showExportOptions";
import { exportFilesAsZip } from "../utils/zipExporter";

const CheckListVehicle = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [filledStatus, setFilledStatus] = useState({});

  useEffect(() => {
    if (isFocused) {
      const data = getReportData();
      const files = data.files || {};

      const allActionsFilesPresent =
        files["3.1"]?.length > 0 &&
        files["3.2"]?.length > 0 &&
        files["3.3"]?.length > 0 &&
        files["3.4"]?.length > 0 &&
        files["3.5"]?.length > 0 &&
        files["3.6"]?.length > 0;

      const rootCauseFilled =
        data.RootCause &&
        data.RootCause.contributingFactors?.trim?.().length > 0 &&
        data.RootCause.rootCauseType &&
        data.RootCause.rootCauseCategory &&
        data.RootCause.rootCauseSubcategory &&
        data.RootCause.preventiveactions?.trim?.().length > 0 &&
        data.RootCause.mitigatingmeasures?.trim?.().length > 0 &&
        data.RootCause.files?.["6"]?.length > 0;

      const accidentCharacterizationFilled = !!(
        data.accidentCharacterization &&
        data.accidentCharacterization.frequencyLevel &&
        data.accidentCharacterization.severityLevel &&
        data.accidentCharacterization.riskLevel &&
        data.accidentCharacterization.requiredActions
      );

      const DataDriverAFilled = !!(
        data.DataDriverA.name?.trim?.().length > 0 &&
        data.DataDriverA.Enterprise?.trim?.().length > 0 &&
        data.DataDriverA.EmployeeNumber?.trim?.().length > 0 &&
        data.DataDriverA.EmployeeFunction?.trim?.().length > 0 &&
        data.DataDriverA.LicenseNumberANA?.trim?.().length > 0 &&
        data.DataDriverA.ValidityANA?.trim?.().length > 0 &&
        data.DataDriverA.CategoryANA?.trim?.().length > 0 &&
        data.DataDriverA.CivilLicenseNumber?.trim?.().length > 0 &&
        data.DataDriverA.ValidityCivil?.trim?.().length > 0 &&
        data.DataDriverA.CategoryCivil?.trim?.().length > 0 &&
        data.DataDriverA.AdmitionDate?.trim?.().length > 0 &&
        data.DataDriverA.ContractType?.trim?.().length > 0 &&
        data.DataDriverA.Formation?.trim?.().length > 0 &&
        data.DataDriverA.ShiftTime?.trim?.().length > 0 &&
        data.DataDriverA.DayShift?.trim?.().length > 0 &&
        data.DataDriverA.DaysOff?.trim?.().length > 0 &&
        data.DataDriverA.Breaks?.trim?.().length > 0 &&
        data.DataDriverA.IncidentHistory?.trim?.().length > 0 &&
        data.DataDriverA.DescriptionFactsOperator?.trim?.().length > 0
      );

      const DataDriverBFilled = !!(
        data.DataDriverB.name?.trim?.().length > 0 &&
        data.DataDriverB.Enterprise?.trim?.().length > 0 &&
        data.DataDriverB.EmployeeNumber?.trim?.().length > 0 &&
        data.DataDriverB.EmployeeFunction?.trim?.().length > 0 &&
        data.DataDriverB.LicenseNumberANA?.trim?.().length > 0 &&
        data.DataDriverB.ValidityANA?.trim?.().length > 0 &&
        data.DataDriverB.CategoryANA?.trim?.().length > 0 &&
        data.DataDriverB.CivilLicenseNumber?.trim?.().length > 0 &&
        data.DataDriverB.ValidityCivil?.trim?.().length > 0 &&
        data.DataDriverB.CategoryCivil?.trim?.().length > 0 &&
        data.DataDriverB.AdmitionDate?.trim?.().length > 0 &&
        data.DataDriverB.ContractType?.trim?.().length > 0 &&
        data.DataDriverB.Formation?.trim?.().length > 0 &&
        data.DataDriverB.ShiftTime?.trim?.().length > 0 &&
        data.DataDriverB.DayShift?.trim?.().length > 0 &&
        data.DataDriverB.DaysOff?.trim?.().length > 0 &&
        data.DataDriverB.Breaks?.trim?.().length > 0 &&
        data.DataDriverB.IncidentHistory?.trim?.().length > 0 &&
        data.DataDriverB.DescriptionFactsOperator?.trim?.().length > 0
      );

      const framingFilled = !!(
        data.vehicleA?.trim?.().length > 0 &&
        data.falsecA?.trim?.().length > 0 &&
        data.enterpriseA?.trim?.().length > 0 &&
        data.vehicleB?.trim?.().length > 0 &&
        data.falsecB?.trim?.().length > 0 &&
        data.enterpriseB?.trim?.().length > 0 &&
        data.dateofoccurrence?.trim?.().length > 0 &&
        data.timeofoccurrence?.trim?.().length > 0 &&
        data.placeofoccurrence?.trim?.().length > 0
      );

      setFilledStatus({
        Sumário: data.summary?.trim?.().length > 0,
        "Detalhes de Averiguação":
          data.DamageCausedDescription?.trim?.().length > 0 &&
          DataDriverAFilled &&
          DataDriverBFilled &&
          framingFilled,
        "Ações Desenvolvidas": allActionsFilesPresent,
        "Causa Raiz do Incidente": rootCauseFilled,
        "Caraterização de Acidente": accidentCharacterizationFilled,
        Conclusão: data.conclusion?.trim?.().length > 0,
      });
    }
  }, [isFocused]);

  const allSectionsFilled = Object.values(filledStatus).every(Boolean);

  // Define the screens for each button
  const buttonScreens = Object.keys(filledStatus);

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vehicle Checklist</Text>
        </View>

        {/* Buttons Container */}
        <View style={styles.buttonsContainer}>
          {buttonScreens.map((screenName, index) => {
            const isFilled = filledStatus[screenName];

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  isFilled ? styles.filledButton : styles.unfilledButton, // botão verde claro se preenchido
                ]}
                onPress={() => navigation.navigate(screenName)}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>
                    {screenName.replace("CheckList", "")}
                  </Text>
                  <View
                    style={[
                      styles.darkRectangle,
                      isFilled
                        ? styles.filledRectangle
                        : styles.unfilledRectangle, // alterna entre verde ou laranja escuro
                    ]}
                  >
                    {isFilled && (
                      <Image
                        source={require("../assets/CheckIcon.png")}
                        style={styles.checkIcon}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* BOTÃO GERAR DOCUMENTO - FORA DO MAP */}
        {allSectionsFilled && (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={async () => {
              await showExportOptions();
              await exportFilesAsZip();
              await clearReportData();

              // Adiciona delay antes de recarregar
              await new Promise((resolve) => setTimeout(resolve, 1000));

              window.location.reload();
            }}
          >
            <Text style={styles.generateButtonText}>Gerar Documento</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#000",
    height: 80,
    marginBottom: 15,
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 15,
    flex: 1,
    textTransform: "capitalize",
  },
  darkRectangle: {
    backgroundColor: "#808080",
    width: "15%",
    height: "100%",
    position: "absolute",
    right: 0,
  },
  filledRectangle: {
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    width: 40,
    height: 40,
    tintColor: "white", // se quiser aplicar cor branca ao ícone
  },
  unfilledRectangle: {
    backgroundColor: "#ffaa00", // laranja escuro
  },
  filledButton: {
    backgroundColor: "#A5D6A7", // verde claro para o botão inteiro
  },
  unfilledButton: {
    backgroundColor: "#fee2aa", // laranja claro
  },
  generateButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CheckListVehicle;
