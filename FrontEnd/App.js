import "react-native-gesture-handler";
import * as React from "react";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeReportData } from "./data/reportData"; // <-- importa a função async

// Importações de screens
import AdminDashboard from "./screens/AdminDashboard";
import CheckListVehicle from "./screens/CheckListVehicle";
import SummaryScreen from "./screens/SummaryScreen";
import InvestigationDetailsScreen from "./screens/InvestigationDetailsScreen";
import ActionsDevelopedScreen from "./screens/ActionsDevelopedScreen";
import RootCause from "./screens/RootCauseScreen";
import DamageCaused from "./screens/InvestigationDetailsScreens/DamageCaused";
import DriversData from "./screens/InvestigationDetailsScreens/DriversData";
import FramingScreen from "./screens/InvestigationDetailsScreens/FramingScreen";
import DataDriverA from "./screens/InvestigationDetailsScreens/DriversDataScreens/DataDriverA";
import DataDriverB from "./screens/InvestigationDetailsScreens/DriversDataScreens/DataDriverB";
import AccidentCharacterizationScreen from "./screens/AccidentCharacterizationScreen";
import ConclusionScreen from "./screens/ConclusionScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import CompletedReports from "./screens/CompletedReports";
import ChangeVehicle from "./screens/ChangeVehicle";
import UncompletedReports from "./screens/UncompletedReports";
import TeamPerfomance from "./screens/TeamPerfomance";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadData() {
      await initializeReportData();
      setIsReady(true);
    }
    loadData();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>A carregar dados...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
          headerBackTitleVisible: true,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#f5f5f5" },
        }}
      >
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ title: "LoginScreen" }}
        />
        <Stack.Screen
          name="SignupScreen"
          component={SignupScreen}
          options={{ title: "SignupScreen" }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{ title: "Início" }}
        />
        <Stack.Screen
          name="CheckListVehicle"
          component={CheckListVehicle}
          options={{ title: "Checklist do Veículo" }}
        />
        <Stack.Screen
          name="Summary"
          component={SummaryScreen}
          options={{ title: "Resumo da Investigação" }}
        />
        <Stack.Screen
          name="Investigation Details"
          component={InvestigationDetailsScreen}
          options={{ title: "Investigation Details" }}
        />
        <Stack.Screen
          name="Actions Developed"
          component={ActionsDevelopedScreen}
          options={{ title: "Actions Developed" }}
        />
        <Stack.Screen
          name="Root Cause of the Incident"
          component={RootCause}
          options={{ title: "Root Cause" }}
        />
        <Stack.Screen
          name="2.2 Description of the Damage Caused"
          component={DamageCaused}
          options={{ title: "Damages Caused" }}
        />
        <Stack.Screen
          name="2.3 Data of the Drivers Involved"
          component={DriversData}
          options={{ title: "Drivers Data" }}
        />
        <Stack.Screen
          name="2.1 Framing"
          component={FramingScreen}
          options={{ title: "Framing", animation: "fade_from_bottom" }}
        />
        <Stack.Screen
          name="Driver Data A"
          component={DataDriverA}
          options={{ title: "Condutor A" }}
        />
        <Stack.Screen
          name="Driver Data B"
          component={DataDriverB}
          options={{ title: "Condutor B" }}
        />
        <Stack.Screen
          name="Accident Characterization"
          component={AccidentCharacterizationScreen}
          options={{ title: "Accident Characterization" }}
        />
        <Stack.Screen
          name="CompletedReports"
          component={CompletedReports}
          options={{ title: "CompletedReports" }}
        />
        <Stack.Screen
          name="UncompletedReports"
          component={UncompletedReports}
          options={{ title: "UncompletedReports" }}
        />
        <Stack.Screen
          name="Conclusion"
          component={ConclusionScreen}
          options={{ title: "Conclusion", animation: "fade" }}
        />
        <Stack.Screen
          name="ChangeVehicle"
          component={ChangeVehicle}
          options={{ title: "ChangeVehicle", animation: "fade" }}
        />
        <Stack.Screen
          name="TeamPerfomance"
          component={TeamPerfomance}
          options={{ title: "TeamPerfomance", animation: "fade" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
