import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminDashboard from "../screens/AdminDashboard";
import CheckListVehicle from "../screens/CheckListVehicle";
import SummaryScreen from "../screens/SummaryScreen";
import InvestigationDetailsScreen from "../screens/InvestigationDetailsScreen";
import ActionsDevelopedScreen from "../screens/ActionsDevelopedScreen";
import RootCause from "../screens/RootCauseScreen";
import DamageCaused from "../screens/InvestigationDetailsScreens/DamageCaused";
import DriversData from "../screens/InvestigationDetailsScreens/DriversData";
import FramingScreen from "../screens/InvestigationDetailsScreens/FramingScreen";
import DataDriverA from "../screens/InvestigationDetailsScreens/DriversDataScreens/DataDriverA";
import DataDriverB from "../screens/InvestigationDetailsScreens/DriversDataScreens/DataDriverB";
import AccidentCharacterizationScreen from "../screens/AccidentCharacterizationScreen";
import ConclusionScreen from "../screens/ConclusionScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import CompletedReports from "../screens/CompletedReports";
import ChangeVehicle from "../screens/ChangeVehicle";
import UncompletedReports from "../screens/UncompletedReports";
import TeamPerfomance from "../screens/TeamPerfomance";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="CheckListVehicle" component={CheckListVehicle} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
        <Stack.Screen
          name="Investigation Details"
          component={InvestigationDetailsScreen}
        />
        <Stack.Screen
          name="Actions Developed"
          component={ActionsDevelopedScreen}
        />
        <Stack.Screen name="Root Cause of the Incident" component={RootCause} />
        <Stack.Screen
          name="2.2 Description of the Damage Caused"
          component={DamageCaused}
        />
        <Stack.Screen
          name="2.3 Data of the Drivers Involved"
          component={DriversData}
        />
        <Stack.Screen name="2.1 Framing" component={FramingScreen} />
        <Stack.Screen name="Driver Data A" component={DataDriverA} />
        <Stack.Screen name="Driver Data B" component={DataDriverB} />
        <Stack.Screen
          name="Accident Characterization"
          component={AccidentCharacterizationScreen}
        />
        <Stack.Screen name="Conclusion" component={ConclusionScreen} />
        <Stack.Screen name="CompletedReports" component={CompletedReports} />
        <Stack.Screen
          name="UncompletedReports"
          component={UncompletedReports}
        />
        <Stack.Screen name="ChangeVehicle" component={ChangeVehicle} />
        <Stack.Screen name="TeamPerfomance" component={TeamPerfomance} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
