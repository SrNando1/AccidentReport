import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, ScrollView, Image } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { screen, globalStyles } from "../../components/styles";
import { getReportData } from "../../data/reportData";

const DriversData = () => {
  const navigation = useNavigation();
  const [filledStatus, setFilledStatus] = useState({});
  const isFocused = useIsFocused();

  // Define the screens for each button
  const buttonScreens = ["Dados Condutor A", "Dados Condutor B"];

  useEffect(() => {
    if (isFocused) {
      const data = getReportData();

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

      setFilledStatus({
        "Dados Condutor A": DataDriverAFilled,
        "Dados Condutor B": DataDriverBFilled,
      });
    }
  }, [isFocused]);
  return (
    <ScrollView>
      <View style={screen.container}>
        {/* Header */}
        <View style={screen.header}>
          <Text style={screen.title}>Dados dos Condutores</Text>
        </View>

        {/* Buttons Container */}
        <View style={screen.buttonsContainer}>
          {buttonScreens.map((screenName, index) => {
            const isFilled = filledStatus[screenName];

            return (
              <TouchableOpacity
                key={index}
                style={[
                  screen.button,
                  isFilled
                    ? globalStyles.filledButton
                    : globalStyles.unfilledButton, // botão verde claro se preenchido
                ]}
                onPress={() => navigation.navigate(screenName)}
              >
                <View style={screen.buttonContent}>
                  <Text style={screen.buttonText}>
                    {screenName.replace("CheckList", "")}{" "}
                    {/* Remove "CheckList" prefix */}
                  </Text>
                  <View
                    style={[
                      screen.darkRectangle,
                      isFilled
                        ? globalStyles.filledRectangle
                        : globalStyles.unfilledRectangle, // alterna entre verde ou laranja escuro
                    ]}
                  >
                    {isFilled && (
                      <Image
                        source={require("../../assets/CheckIcon.png")}
                        style={globalStyles.checkIcon}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default DriversData;
