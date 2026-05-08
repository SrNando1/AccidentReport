import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Platform,
  Alert,
} from "react-native";
import {
  useNavigation,
  useIsFocused,
  useRoute,
} from "@react-navigation/native";
import {
  getReportData,
  clearReportData,
  setReportData,
} from "../data/reportData";
import MenuTopBar from "../components/MenuTopBar";
import { saveFullReport } from "../utils/saveFullReport";
import {
  saveDraftToBackend,
  loadDraftFromBackend,
  deleteDraft,
} from "../utils/draftService";
import { clearReportKeys } from "../helpers/clearReportStorage";

import API from "../src/services/api";

const SECTION_KEYS = [
  "Summary",
  "Investigation Details",
  "Actions Developed",
  "Root Cause of the Incident",
  "Accident Characterization",
  "Conclusion",
];

// Lê o level do objeto de relatório (número 1..25)
function getNumericLevel(data) {
  const v = data?.accidentCharacterization?.riskLevel ?? data?.riskLevel; // fallback se estiver noutro nível
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 25 ? n : null;
}

// Persiste o level na BD
async function persistLevel(reportNumber, level) {
  if (!reportNumber) return;
  const n = Number(level);
  if (!Number.isInteger(n) || n < 1 || n > 25) return; // ignora inválidos
  try {
    await API.post("/upload/level", { report_number: reportNumber, level: n });
  } catch (e) {
    console.warn("persistLevel falhou:", e?.message || e);
  }
}

async function addRiskToEmployerSms() {
  const data = getReportData();
  const employerId = data?.DataDriverA?.selectedEmployerId;
  const level = getNumericLevel(data); // 1..25 ou null
  if (!employerId || !level) return; // nada a fazer se faltar algo
  try {
    await API.patch(`/employers/${employerId}/sms/add`, { delta: level });
  } catch (e) {
    console.warn("Falha ao somar riskLevel no sms_score:", e?.message || e);
  }
}

const CheckListVehicle = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();

  // bloqueia autoload de draft quando inicia novo relatório
  const [suppressDraftLoad, setSuppressDraftLoad] = useState(false);

  const [filledStatus, setFilledStatus] = useState(
    SECTION_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {}),
  );

  const [nextReportNumber, setNextReportNumber] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState("");

  // Fetch next report number from backend
  useEffect(() => {
    AsyncStorage.getItem("userName").then((name) => name && setUserName(name));

    async function initReportNumber() {
      // se veio de draft, usa o número já guardado e NÃO recalcula
      const fromDraft = route?.params?.fromDraft;
      const stored = await AsyncStorage.getItem("nextReportNumber");
      if (fromDraft && stored) {
        setNextReportNumber(stored);
        return;
      }

      // se já há um número guardado (p.ex. depois de "Novo relatório"), usa-o
      if (stored) {
        setNextReportNumber(stored);
        return;
      }

      // senão, pede ao backend
      try {
        const res = await API.get("/reports/next"); // ou /last como fallback
        const next = res?.data?.report_number || "RPT-001";
        setNextReportNumber(next);
        await AsyncStorage.setItem("nextReportNumber", next);
      } catch {
        setNextReportNumber("RPT-001");
        await AsyncStorage.setItem("nextReportNumber", "RPT-001");
      }
    }

    initReportNumber();
  }, [route?.params?.fromDraft]);

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
        data.files?.["6"]?.length > 0;

      const accidentCharacterizationFilled = !!(
        data.accidentCharacterization &&
        data.accidentCharacterization.frequencyLevel &&
        data.accidentCharacterization.severityLevel &&
        data.accidentCharacterization.riskLevel &&
        data.accidentCharacterization.severityActionLevel &&
        data.accidentCharacterization.frequencyActionLevel &&
        data.accidentCharacterization.mitigatingmeasures?.trim?.().length > 0 &&
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
        Summary: data.summary?.trim?.().length > 0,
        "Investigation Details":
          data.DamageCausedDescription?.trim?.().length > 0 &&
          DataDriverAFilled &&
          DataDriverBFilled &&
          framingFilled,
        "Actions Developed": allActionsFilesPresent,
        "Root Cause of the Incident": rootCauseFilled,
        "Accident Characterization": accidentCharacterizationFilled,
        Conclusion: data.conclusion?.trim?.().length > 0,
      });
    }
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused) return;
    if (suppressDraftLoad) return; // começando um novo relatório
    if (route?.params?.fromDraft !== true) return; // só carrega se veio de draft

    (async () => {
      const reportNumber = await AsyncStorage.getItem("nextReportNumber");
      if (!reportNumber) return;
      const draft = await loadDraftFromBackend(reportNumber);
      if (draft?.data) {
        await setReportData(
          typeof draft.data === "string" ? JSON.parse(draft.data) : draft.data,
          { merge: false },
        );
      }
      // opcional: já limpa a flag para não tentar de novo
      navigation.setParams({ fromDraft: false });
    })();
  }, [isFocused, route?.params?.fromDraft, suppressDraftLoad]);

  const buttonScreens = SECTION_KEYS;
  const allSectionsFilled = SECTION_KEYS.every(
    (k) => filledStatus?.[k] === true,
  );

  return (
    <View style={styles.container1}>
      <MenuTopBar
        userName={userName}
        showMenu={showMenu}
        toggleMenu={() => setShowMenu((prev) => !prev)}
        navigation={navigation}
      />
      <ScrollView>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Vehicle Checklist</Text>
          </View>

          {/* Display next report number */}
          <View style={styles.reportNumberContainer}>
            <Text style={styles.reportNumberText}>
              Report Number: {nextReportNumber}
            </Text>
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

          {/* Botão Save Draft (sempre visível) */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              { backgroundColor: "#007bff", marginTop: 10 },
            ]}
            onPress={async () => {
              try {
                const reportNumber =
                  await AsyncStorage.getItem("nextReportNumber");
                if (!reportNumber)
                  throw new Error("Número do relatório ausente.");

                const user =
                  (await AsyncStorage.getItem("userName")) || "desconhecido";
                const data = getReportData();

                // 1) salva o rascunho no backend
                await saveDraftToBackend({ reportNumber, user, data });

                // 2) limpa o estado local do relatório
                await clearReportKeys();

                // 3) pede um novo número ao backend
                const {
                  data: { report_number: newNumber },
                } = await API.get("/reports/next");

                // 4) atualiza storage/estado
                await AsyncStorage.setItem("nextReportNumber", newNumber);
                setNextReportNumber(newNumber);

                // 5) reseta os “checks” visuais
                setFilledStatus(
                  SECTION_KEYS.reduce((a, k) => ({ ...a, [k]: false }), {}),
                );

                // 🧹 2) se veio de draft, limpa a flag para voltar ao modo "novo relatório"
                if (route?.params?.fromDraft) {
                  navigation.setParams({ fromDraft: false });
                }

                Alert.alert(
                  "Rascunho salvo",
                  `Novo relatório iniciado: ${newNumber}`,
                );
              } catch (err) {
                console.error("Erro ao Save Draft:", err);
                Alert.alert("Erro", "Não foi possível salvar o rascunho.");
              }
            }}
          >
            <Text style={styles.generateButtonText}>Save Draft</Text>
          </TouchableOpacity>

          {/* BOTÃO GERAR DOCUMENTO - FORA DO MAP */}
          {allSectionsFilled && (
            <View style={{ alignItems: "center" }}>
              {/* Botão Gerar Documento */}
              <TouchableOpacity
                style={styles.generateButton}
                onPress={async () => {
                  try {
                    const reportNumber =
                      await AsyncStorage.getItem("nextReportNumber");
                    if (!reportNumber)
                      throw new Error("Número do relatório ausente.");

                    // 1) gera DOCX, zippa, faz upload e registra como concluído (saveFullReport já faz tudo)
                    const formData = getReportData();
                    await persistLevel(reportNumber, getNumericLevel(formData));
                    await addRiskToEmployerSms(); // <<< soma riskLevel em sms_score do employer
                    await saveFullReport(reportNumber, { download: true });

                    // 2) remove o draft correspondente (se existir)
                    try {
                      await deleteDraft(reportNumber);
                    } catch (e) {
                      console.warn("deleteDraft:", e?.message || e);
                    }

                    // 3) reset total do formulário e UI
                    setSuppressDraftLoad(true);
                    await clearReportData();
                    setFilledStatus(
                      SECTION_KEYS.reduce((a, k) => ({ ...a, [k]: false }), {}),
                    );

                    // 4) pedir novo número e iniciar novo relatório
                    const { data: nextResp } = await API.get("/reports/next");
                    const newNumber = nextResp?.report_number || "RPT-001";
                    await AsyncStorage.setItem("nextReportNumber", newNumber);
                    setNextReportNumber(newNumber);
                    if (route?.params?.fromDraft)
                      navigation.setParams({ fromDraft: false });

                    Alert.alert(
                      "Sucesso",
                      `Documento gerado e enviado. Novo relatório: ${newNumber}`,
                    );
                  } catch (err) {
                    console.error("Erro ao gerar documento:", err);
                    Alert.alert("Erro", String(err?.message || err));
                  } finally {
                    setSuppressDraftLoad(false);
                  }
                }}
              >
                <Text style={styles.generateButtonText}>Generate Document</Text>
              </TouchableOpacity>

              {/* Botão Gerar e Enviar */}
              <TouchableOpacity
                style={styles.generateButton}
                onPress={async () => {
                  try {
                    const reportNumber =
                      await AsyncStorage.getItem("nextReportNumber");
                    if (!reportNumber)
                      throw new Error("Número do relatório ausente.");

                    // 1) gera Word+ZIP, faz upload (NÃO baixa o ZIP)
                    const formData = getReportData();
                    await persistLevel(reportNumber, getNumericLevel(formData));
                    await saveFullReport(reportNumber, {
                      download: false,
                      state: "PENDING",
                    });

                    // 2) remove draft (se existir)
                    try {
                      await deleteDraft(reportNumber);
                    } catch (e) {
                      console.warn("deleteDraft:", e?.message || e);
                    }

                    // 3) reset TOTAL do formulário e UI
                    setSuppressDraftLoad(true); // evita tentar carregar draft do novo número
                    await clearReportData(); // emite para todos os <FormField/> e zera campos
                    setFilledStatus(
                      SECTION_KEYS.reduce((a, k) => ({ ...a, [k]: false }), {}),
                    );

                    // 4) pega o próximo número e inicia novo report
                    const { data: nextResp } = await API.get("/reports/next");
                    const newNumber = nextResp?.report_number || "RPT-001";
                    await AsyncStorage.setItem("nextReportNumber", newNumber);
                    setNextReportNumber(newNumber);

                    // se veio de draft, limpa a flag para novo ciclo
                    if (route?.params?.fromDraft)
                      navigation.setParams({ fromDraft: false });

                    Alert.alert(
                      "Sucesso",
                      `Relatório enviado. Novo relatório iniciado: ${newNumber}`,
                    );
                  } catch (err) {
                    console.error("Erro ao salvar relatório:", err);
                    Alert.alert("Erro", String(err?.message || err));
                  } finally {
                    setSuppressDraftLoad(false);
                  }
                }}
              >
                <Text style={styles.generateButtonText}>Save</Text>
              </TouchableOpacity>

              {/* Botão Novo Relatório — só mobile */}
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    { backgroundColor: "#ccc", marginTop: 10 },
                  ]}
                  onPress={async () => {
                    console.log("Iniciando limpeza");
                    try {
                      await clearReportData();
                      console.log("clearReportData ok");
                      Alert.alert(
                        "Novo Relatório",
                        "Dados limpos com sucesso.",
                        [
                          {
                            text: "OK",
                            onPress: () => {
                              navigation.reset({
                                index: 0,
                                routes: [{ name: "Home" }],
                              });
                            },
                          },
                        ],
                        { cancelable: false },
                      );
                    } catch (err) {
                      console.error("Erro ao limpar dados:", err);
                      Alert.alert("Erro", "Não foi possível limpar os dados.");
                    }
                  }}
                >
                  <Text style={styles.generateButtonText}>New Report</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  container1: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
  reportNumberContainer: {
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    marginBottom: 20,
  },
  reportNumberText: { fontSize: 18, fontWeight: "500" },
});

export default CheckListVehicle;
