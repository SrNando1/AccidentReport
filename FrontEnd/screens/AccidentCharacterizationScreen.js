import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { getReportData, updateReportData } from "../data/reportData";
import {
  AccidentCharacterizationScreen,
  globalStyles,
} from "../components/styles";

const AccidentCharacterization = () => {
  const initialData = getReportData();
  const [selectedSeverity, setSelectedSeverity] = useState(
    initialData.accidentCharacterization?.severityLevel || null,
  );
  const [selectedFrequency, setSelectedFrequency] = useState(
    initialData.accidentCharacterization?.frequencyLevel || null,
  );
  const [riskLevel, setRiskLevel] = useState(
    initialData.accidentCharacterization?.riskLevel || null,
  );
  const [requiredActions, setRequiredActions] = useState(
    initialData.accidentCharacterization?.requiredActions || "",
  );

  const createEmptyMitigationSection = () => ({
    mitigatingmeasures: "",
    actionseverity: null,
    actionfrequency: null,
    finalRisk: null,
    finalAcceptability: null,
  });

  const [mitigationSections, setMitigationSections] = useState(
    initialData.accidentCharacterization?.mitigationSections || [
      createEmptyMitigationSection(),
    ],
  );

  // Verifica se ambas as seleções foram feitas
  const bothSelected = selectedSeverity !== null && selectedFrequency !== null;

  // Calcula o nível de risco quando as seleções mudam
  useEffect(() => {
    if (!selectedSeverity || !selectedFrequency) return;

    const calculatedRisk = selectedSeverity * selectedFrequency;
    setRiskLevel(calculatedRisk);

    let actions = "";
    if (calculatedRisk <= 4)
      actions = "Safety awareness briefing with the Operational Supervisor";
    else if (calculatedRisk <= 8)
      actions = "Attend Airside Safety refresher training";
    else if (calculatedRisk <= 12)
      actions = "Safety awareness meeting with the Operations Director";
    else actions = "Immediate suspension of operations";

    setRequiredActions(actions);

    updateReportData({
      accidentCharacterization: {
        severityLevel: selectedSeverity,
        frequencyLevel: selectedFrequency,
        riskLevel: calculatedRisk,
        requiredActions: actions,
      },
    });
  }, [selectedSeverity, selectedFrequency]);

  const addSection = () => {
    setMitigationSections((prev) => {
      const last = prev[prev.length - 1];

      return [
        ...prev,
        {
          ...last,
        },
      ];
    });
  };

  const getAcceptability = (risk) => {
    if (risk <= 4) return "ACCEPTABLE";
    if (risk <= 8) return "TOLERABLE WITH MONITORING";
    if (risk <= 12) return "TOLERABLE WITH MITIGATION";
    return "UNACCEPTABLE";
  };

  const getGlobalFinalRisk = (sections) => {
    const risks = sections
      .map((s) => Number(s.finalRisk))
      .filter((risk) => Number.isFinite(risk));

    if (risks.length === 0) return null;

    return Math.min(...risks); // usa o melhor risco
  };

  const updateMitigationSection = (index, field, value) => {
    setMitigationSections((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      const severity = updated[index].actionseverity;
      const frequency = updated[index].actionfrequency;

      if (severity !== null && frequency !== null) {
        const calculatedRisk = severity * frequency;

        updated[index].finalRisk = calculatedRisk;
        updated[index].finalAcceptability = getAcceptability(calculatedRisk);
      }

      updateReportData({
        accidentCharacterization: {
          severityLevel: selectedSeverity,
          frequencyLevel: selectedFrequency,
          riskLevel,
          requiredActions,
          mitigationSections: updated,

          mitigatingmeasures: updated[0]?.mitigatingmeasures || "",
          severityActionLevel: updated[0]?.actionseverity || null,
          frequencyActionLevel: updated[0]?.actionfrequency || null,
          finalRisk: updated[0]?.finalRisk || null,
          finalAcceptability: updated[0]?.finalAcceptability || null,

          globalFinalRisk: getGlobalFinalRisk(updated),
          globalFinalAcceptability: getAcceptability(
            getGlobalFinalRisk(updated),
          ),
        },
      });

      return updated;
    });
  };

  const severityData = [
    {
      level: 1,
      title: "NEGLIGIBLE",
      description: "No injuries.\nNo damage to equipment or infrastructure",
    },
    {
      level: 2,
      title: "MINOR",
      description:
        "No injuries.\nNo damage to Fuel Staff equipment but damage to third-party equipment or infrastructure",
    },
    {
      level: 3,
      title: "MODERATE",
      description:
        "No injuries.\nDamage to Fuel Staff equipment and third-party equipment or infrastructure with operational downtime up to 24 hours",
    },
    {
      level: 4,
      title: "CRITICAL",
      description:
        "Minor injuries.\nDamage to Fuel Staff equipment and third-party equipment or infrastructure with operational downtime greater than 24 hours",
    },
    {
      level: 5,
      title: "CATASTROPHIC",
      description:
        "Serious injuries.\nTotal loss of equipment.\nFailure to report the occurrence",
    },
  ];

  const frequencyData = [
    {
      level: 1,
      title: "VERY RARE",
      description: "1 occurrence every 5 years",
    },
    {
      level: 2,
      title: "RARE",
      description: "2 occurrences every 5 years",
    },
    {
      level: 3,
      title: "REMOTE",
      description: "3 occurrences every 5 years",
    },
    {
      level: 4,
      title: "FREQUENT",
      description: "4 occurrences every 5 years",
    },
    {
      level: 5,
      title: "VERY FREQUENT",
      description: "1 or more occurrences in the last year",
    },
  ];

  const severityAction = [
    {
      level: 1,
      title: "NEGLIGIBLE",
      description:
        "No injuries. No damage to aircraft, equipment or infrastructure.",
    },
    {
      level: 2,
      title: "MINOR",
      description: "No injuries. Minor damage with no impact on operations.",
    },
    {
      level: 3,
      title: "MODERATE",
      description:
        "Minor injuries or moderate damage. Limited operational disruption.",
    },
    {
      level: 4,
      title: "MAJOR",
      description:
        "Serious injury or significant damage. Major operational disruption.",
    },
    {
      level: 5,
      title: "CATASTROPHIC",
      description:
        "Fatalities, total loss of equipment/aircraft, or complete operational failure.",
    },
  ];

  const frequencyAction = [
    {
      level: 1,
      title: "EXTREMELY IMPROBABLE",
      description: "Almost inconceivable occurrence (≤1 in 5 years)",
    },
    {
      level: 2,
      title: "IMPROBABLE",
      description: "Very unlikely to occur",
    },
    {
      level: 3,
      title: "REMOTE",
      description: "Unlikely but possible",
    },
    {
      level: 4,
      title: "OCCASIONAL",
      description: "Likely to occur sometimes",
    },
    {
      level: 5,
      title: "FREQUENT",
      description: "Likely to occur frequently",
    },
  ];

  // Helpers de cor para o Nível de Risco
  const getRiskBgColor = (value) => {
    if (value >= 1 && value <= 4) return "#2ecc71"; // verde
    if (value >= 5 && value <= 8) return "#f1c40f"; // amarelo
    if (value >= 9 && value <= 12) return "#e67e22"; // laranja
    if (value >= 13 && value <= 25) return "#e74c3c"; // vermelho
    return "transparent";
  };

  const getRiskTextColor = (value) => {
    // Em verde/amarelo, texto escuro; em laranja/vermelho, texto branco
    if (value >= 1 && value <= 8) return "#111";
    if (value >= 9 && value <= 25) return "#fff";
    return "#111";
  };

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

  const getAcceptabilityBgColor = (value) => {
    switch (value) {
      case "ACCEPTABLE":
        return "#2ecc71"; // verde
      case "TOLERABLE WITH MONITORING":
        return "#f1c40f"; // amarelo
      case "TOLERABLE WITH MITIGATION":
        return "#e67e22"; // laranja
      case "UNACCEPTABLE":
        return "#e74c3c"; // vermelho
      default:
        return "transparent";
    }
  };

  const getAcceptabilityTextColor = (value) => {
    switch (value) {
      case "ACCEPTABLE":
      case "TOLERABLE WITH MONITORING":
        return "#111";
      case "TOLERABLE WITH MITIGATION":
      case "UNACCEPTABLE":
        return "#fff";
      default:
        return "#111";
    }
  };

  const removeSection = (indexToRemove) => {
    setMitigationSections((prev) => {
      if (prev.length === 1) return prev;

      const updated = prev.filter((_, index) => index !== indexToRemove);

      updateReportData({
        accidentCharacterization: {
          severityLevel: selectedSeverity,
          frequencyLevel: selectedFrequency,
          riskLevel,
          requiredActions,
          mitigationSections: updated,

          mitigatingmeasures: updated[0]?.mitigatingmeasures || "",
          severityActionLevel: updated[0]?.actionseverity || null,
          frequencyActionLevel: updated[0]?.actionfrequency || null,
          finalRisk: updated[0]?.finalRisk || null,
          finalAcceptability: updated[0]?.finalAcceptability || null,

          globalFinalRisk: getGlobalFinalRisk(updated),
          globalFinalAcceptability: getAcceptability(
            getGlobalFinalRisk(updated),
          ),
        },
      });

      return updated;
    });
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={globalStyles.formGroup}>
        {/* Seção de Severidade */}
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label}>
            9.1. Severity of the Consequences
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
          <Text style={globalStyles.label}>9.2. FREQUENCY OF OCCURRENCES</Text>
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
                    9.3. Acceptability Level
                  </Text>
                </View>
                <View
                  style={[
                    AccidentCharacterizationScreen.tableCell,
                    {
                      flex: 1,
                      justifyContent: "center",
                      backgroundColor: riskLevel
                        ? getRiskBgColor(riskLevel)
                        : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      AccidentCharacterizationScreen.tableValueText,
                      {
                        color: riskLevel ? getRiskTextColor(riskLevel) : "#111",
                      },
                    ]}
                  >
                    {riskLevel ? riskLevel : "Select above"}
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
                    9.4. Actions to be Developed
                  </Text>
                </View>
                <View
                  style={[
                    AccidentCharacterizationScreen.tableCell,
                    { flex: 1, justifyContent: "center" },
                  ]}
                >
                  <Text style={AccidentCharacterizationScreen.tableValueText}>
                    {requiredActions || "Select above"}
                  </Text>
                </View>
              </View>
            </View>

            {mitigationSections.map((section, index) => {
              const suffix = index === 0 ? "" : `.${index}`;

              const canAddThisSection =
                section.mitigatingmeasures?.trim?.().length > 0 &&
                section.actionseverity !== null &&
                section.actionfrequency !== null &&
                section.finalRisk !== null &&
                section.finalAcceptability !== null;

              const isLastSection = index === mitigationSections.length - 1;

              return (
                <View key={`mitigation-section-${index}`}>
                  {index > 0 && (
                    <TouchableOpacity
                      onPress={() => removeSection(index)}
                      style={{
                        backgroundColor: "#e74c3c",
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        alignSelf: "flex-end",
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        Remove Section
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View style={globalStyles.formGroup1}>
                    <Text style={globalStyles.label}>
                      9.5{suffix}. Mitigation Measures
                    </Text>

                    <TextInput
                      style={[globalStyles.input]}
                      value={section.mitigatingmeasures}
                      onChangeText={(text) =>
                        updateMitigationSection(
                          index,
                          "mitigatingmeasures",
                          text,
                        )
                      }
                      placeholder="Fill in this field"
                      placeholderTextColor="red"
                    />
                  </View>

                  <View style={globalStyles.formGroup1}>
                    <Text style={globalStyles.label}>
                      9.6{suffix}. SEVERITY OF THE ACTION
                    </Text>

                    <View style={AccidentCharacterizationScreen.table}>
                      {severityAction.map((item) => (
                        <SelectionItem
                          key={`severity-action-${index}-${item.level}`}
                          item={item}
                          selected={section.actionseverity}
                          onSelect={(value) =>
                            updateMitigationSection(
                              index,
                              "actionseverity",
                              value,
                            )
                          }
                        />
                      ))}
                    </View>
                  </View>

                  <View style={globalStyles.formGroup1}>
                    <Text style={globalStyles.label}>
                      9.7{suffix}. FREQUENCY OF ACTION
                    </Text>

                    <View style={AccidentCharacterizationScreen.table}>
                      {frequencyAction.map((item) => (
                        <SelectionItem
                          key={`frequency-action-${index}-${item.level}`}
                          item={item}
                          selected={section.actionfrequency}
                          onSelect={(value) =>
                            updateMitigationSection(
                              index,
                              "actionfrequency",
                              value,
                            )
                          }
                        />
                      ))}
                    </View>
                  </View>

                  <View style={globalStyles.formGroup1}>
                    <Text style={globalStyles.label}>
                      9.8{suffix}. AFTER MITIGATION MEASURES
                    </Text>

                    <View style={AccidentCharacterizationScreen.table}>
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
                          <Text
                            style={
                              AccidentCharacterizationScreen.tableHeaderText
                            }
                          >
                            Residual Risk Level
                          </Text>
                        </View>

                        <View
                          style={[
                            AccidentCharacterizationScreen.tableCell,
                            {
                              flex: 1,
                              justifyContent: "center",
                              backgroundColor: section.finalRisk
                                ? getRiskBgColor(section.finalRisk)
                                : "transparent",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              AccidentCharacterizationScreen.tableValueText,
                              {
                                color: section.finalRisk
                                  ? getRiskTextColor(section.finalRisk)
                                  : "#111",
                              },
                            ]}
                          >
                            {section.finalRisk || "Select above"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={globalStyles.formGroup1}>
                    <Text style={globalStyles.label}>
                      9.9{suffix}. FINAL ACCEPTABILITY
                    </Text>

                    <View style={AccidentCharacterizationScreen.table}>
                      <View
                        style={[
                          AccidentCharacterizationScreen.row,
                          { flexDirection: "row" },
                        ]}
                      >
                        <View
                          style={[
                            AccidentCharacterizationScreen.tableCell,
                            {
                              flex: 1,
                              justifyContent: "center",
                              backgroundColor: getAcceptabilityBgColor(
                                section.finalAcceptability,
                              ),
                            },
                          ]}
                        >
                          <Text
                            style={[
                              AccidentCharacterizationScreen.tableValueText,
                              {
                                color: getAcceptabilityTextColor(
                                  section.finalAcceptability,
                                ),
                              },
                            ]}
                          >
                            {section.finalAcceptability || "Select above"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {isLastSection && canAddThisSection && (
                    <TouchableOpacity
                      onPress={addSection}
                      style={{
                        backgroundColor: "#2e86de",
                        width: 45,
                        height: 45,
                        borderRadius: 25,
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                        marginTop: 20,
                        marginBottom: 20,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 26,
                          fontWeight: "bold",
                        }}
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {getGlobalFinalRisk(mitigationSections) !== null && (
              <View style={globalStyles.formGroup1}>
                <Text style={globalStyles.label}>
                  9.10. GLOBAL FINAL ACCEPTABILITY
                </Text>

                <View style={AccidentCharacterizationScreen.table}>
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
                      <Text
                        style={AccidentCharacterizationScreen.tableHeaderText}
                      >
                        Best Residual Risk
                      </Text>
                    </View>

                    <View
                      style={[
                        AccidentCharacterizationScreen.tableCell,
                        {
                          flex: 1,
                          justifyContent: "center",
                          backgroundColor: getRiskBgColor(
                            getGlobalFinalRisk(mitigationSections),
                          ),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          AccidentCharacterizationScreen.tableValueText,
                          {
                            color: getRiskTextColor(
                              getGlobalFinalRisk(mitigationSections),
                            ),
                          },
                        ]}
                      >
                        {getGlobalFinalRisk(mitigationSections)}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      AccidentCharacterizationScreen.row,
                      { flexDirection: "row" },
                    ]}
                  >
                    <View
                      style={[
                        AccidentCharacterizationScreen.tableCell,
                        {
                          flex: 1,
                          justifyContent: "center",
                          backgroundColor: getAcceptabilityBgColor(
                            getAcceptability(
                              getGlobalFinalRisk(mitigationSections),
                            ),
                          ),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          AccidentCharacterizationScreen.tableValueText,
                          {
                            color: getAcceptabilityTextColor(
                              getAcceptability(
                                getGlobalFinalRisk(mitigationSections),
                              ),
                            ),
                          },
                        ]}
                      >
                        {getAcceptability(
                          getGlobalFinalRisk(mitigationSections),
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default AccidentCharacterization;
