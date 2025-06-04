import "react-native-gesture-handler";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
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

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CheckListVehicle" component={CheckListVehicle} />
        <Stack.Screen name="Sumário" component={SummaryScreen} />
        <Stack.Screen
          name="Detalhes de Averiguação"
          component={InvestigationDetailsScreen}
        />
        <Stack.Screen
          name="Ações Desenvolvidas"
          component={ActionsDevelopedScreen}
        />
        <Stack.Screen name="Causa Raiz do Incidente" component={RootCause} />
        <Stack.Screen
          name="2.2 Descrição dos Danos Causados"
          component={DamageCaused}
        />
        <Stack.Screen
          name="2.3 Dados Dos Condutores Envolvidos"
          component={DriversData}
        />
        <Stack.Screen name="2.1 Enquadramento" component={FramingScreen} />
        <Stack.Screen name="Dados Condutor A" component={DataDriverA} />
        <Stack.Screen name="Dados Condutor B" component={DataDriverB} />
        <Stack.Screen
          name="Caraterização de Acidente"
          component={AccidentCharacterizationScreen}
        />
        <Stack.Screen name="Conclusão" component={ConclusionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
