import "react-native-gesture-handler";
import * as React from "react";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeReportData } from "./data/reportData"; // <-- importa a função async

// Importações de screens
import HomeScreen from "./screens/HomeScreen";
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
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
          headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
          headerBackTitleVisible: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#f5f5f5" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Início" }}
        />
        <Stack.Screen
          name="CheckListVehicle"
          component={CheckListVehicle}
          options={{ title: "Checklist do Veículo" }}
        />
        <Stack.Screen
          name="Sumário"
          component={SummaryScreen}
          options={{ title: "Resumo da Investigação" }}
        />
        <Stack.Screen
          name="Detalhes de Averiguação"
          component={InvestigationDetailsScreen}
          options={{ title: "Detalhes da Averiguação" }}
        />
        <Stack.Screen
          name="Ações Desenvolvidas"
          component={ActionsDevelopedScreen}
          options={{ title: "Ações Desenvolvidas" }}
        />
        <Stack.Screen
          name="Causa Raiz do Incidente"
          component={RootCause}
          options={{ title: "Causa Raiz" }}
        />
        <Stack.Screen
          name="2.2 Descrição dos Danos Causados"
          component={DamageCaused}
          options={{ title: "Danos Causados" }}
        />
        <Stack.Screen
          name="2.3 Dados Dos Condutores Envolvidos"
          component={DriversData}
          options={{ title: "Dados dos Condutores" }}
        />
        <Stack.Screen
          name="2.1 Enquadramento"
          component={FramingScreen}
          options={{ title: "Enquadramento", animation: "fade_from_bottom" }}
        />
        <Stack.Screen
          name="Dados Condutor A"
          component={DataDriverA}
          options={{ title: "Condutor A" }}
        />
        <Stack.Screen
          name="Dados Condutor B"
          component={DataDriverB}
          options={{ title: "Condutor B" }}
        />
        <Stack.Screen
          name="Caraterização de Acidente"
          component={AccidentCharacterizationScreen}
          options={{ title: "Caracterização do Acidente" }}
        />
        <Stack.Screen
          name="Conclusão"
          component={ConclusionScreen}
          options={{ title: "Conclusão", animation: "fade" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
