import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, ScrollView, Image } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { screen, globalStyles } from "../components/styles";
import { getReportData } from "../data/reportData";

const InvestigationDetailsScreen = () => {
  const navigation = useNavigation();
  const [filledStatus, setFilledStatus] = useState({});
  const isFocused = useIsFocused();

  // Define the screens for each button
  const buttonScreens = [
    "2.1 Enquadramento",
    "2.2 Descrição dos Danos Causados",
    "2.3 Dados Dos Condutores Envolvidos",
  ];

  useEffect(() => {
    if (isFocused) {
      const data = getReportData();

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
        "2.1 Enquadramento": framingFilled,
        "2.2 Descrição dos Danos Causados":
          data.DamageCausedDescription?.trim?.().length > 0,
        "2.3 Dados Dos Condutores Envolvidos":
          DataDriverAFilled && DataDriverBFilled,
      });
    }
  }, [isFocused]);

  return (
    <ScrollView>
      <View style={screen.container}>
        {/* Header */}
        <View style={screen.header}>
          <Text style={screen.title}>Detalhes de Averiguação</Text>
        </View>

        {/* Buttons Container */}
        <View style={globalStyles.buttonsContainer}>
          {buttonScreens.map((screenName, index) => {
            const isFilled = filledStatus[screenName];
            return (
              <TouchableOpacity
                key={index}
                style={[
                  screen.button,
                  isFilled
                    ? globalStyles.filledButton
                    : globalStyles.unfilledButton,
                ]}
                onPress={() => navigation.navigate(screenName)}
              >
                <View style={screen.buttonContent}>
                  <Text style={screen.buttonText}>
                    {screenName.replace("CheckList", "")}
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
                        source={require("../assets/CheckIcon.png")}
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

export default InvestigationDetailsScreen;
