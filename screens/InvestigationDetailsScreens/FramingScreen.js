import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { getReportData, updateReportData } from "../../data/reportData";
import { globalStyles } from "../../components/styles";

const FramingScreen = ({ navigation }) => {
  // Pega os dados iniciais do reportData
  const initialData = getReportData();

  const [vehicleA, setVehicleA] = useState(initialData.vehicleA);
  const [falsecA, setFalsecA] = useState(initialData.falsecA);
  const [enterpriseA, setEnterpriseA] = useState(initialData.enterpriseA);
  const [vehicleB, setVehicleB] = useState(initialData.vehicleB);
  const [falsecB, setFalsecB] = useState(initialData.falsecB);
  const [enterpriseB, setEnterpriseB] = useState(initialData.enterpriseB);
  const [dateofoccurrence, setDateofoccurrence] = useState(
    initialData.dateofoccurrence
  );
  const [timeofoccurrence, setTimeofoccurrence] = useState(
    initialData.timeofoccurrence
  );
  const [placeofoccurrence, setPlaceofoccurrence] = useState(
    initialData.placeofoccurrence
  );

  // Atualiza o reportData sempre que o campo muda
  useEffect(() => {
    updateReportData({
      vehicleA,
      falsecA,
      enterpriseA,
      vehicleB,
      falsecB,
      enterpriseB,
      dateofoccurrence,
      timeofoccurrence,
      placeofoccurrence,
    });
  }, [
    vehicleA,
    falsecA,
    enterpriseA,
    vehicleB,
    falsecB,
    enterpriseB,
    dateofoccurrence,
    timeofoccurrence,
    placeofoccurrence,
  ]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        globalStyles.container,
        { flexGrow: 1, overflow: "auto" },
      ]}
    >
      <View style={globalStyles.formGroup}>
        <Text style={globalStyles.label}>Condutor Do Veiculo A </Text>
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label1}>2.1.1 Viatura A </Text>
          <TextInput
            style={[globalStyles.input]}
            value={vehicleA}
            onChangeText={setVehicleA}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.1.2 Número de Falsec </Text>
          <TextInput
            style={[globalStyles.input]}
            value={falsecA}
            onChangeText={setFalsecA}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.1.2.1 Empresa </Text>
          <TextInput
            style={[globalStyles.input]}
            value={enterpriseA}
            onChangeText={setEnterpriseA}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
        </View>
      </View>
      <View style={globalStyles.formGroup}>
        <Text style={globalStyles.label}>Condutor Do Veiculo B </Text>
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label1}>2.1.3 Viatura B </Text>
          <TextInput
            style={[globalStyles.input]}
            value={vehicleB}
            onChangeText={setVehicleB}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.1.4 Número de Falsec </Text>
          <TextInput
            style={[globalStyles.input]}
            value={falsecB}
            onChangeText={setFalsecB}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.1.4.1 Empresa </Text>
          <TextInput
            style={[globalStyles.input]}
            value={enterpriseB}
            onChangeText={setEnterpriseB}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
        </View>
      </View>
      <View style={globalStyles.formGroup}>
        <Text style={globalStyles.label}>Dados de Ocorrencia</Text>
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label1}>2.1.5 Data da Ocorrencia</Text>
          <TextInput
            style={globalStyles.input}
            value={dateofoccurrence}
            onChangeText={setDateofoccurrence}
            placeholder="Preencha este campo" // Changed to match the purpose
            placeholderTextColor="red"
            keyboardType="numeric" // If it's a date in format DD/MM/YYYY
          />
          <Text style={globalStyles.label1}>2.1.6 Hora da Ocorrencia </Text>
          <TextInput
            style={[globalStyles.input]}
            value={timeofoccurrence}
            onChangeText={setTimeofoccurrence}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.1.7 Local da Ocorrencia </Text>
          <TextInput
            style={[globalStyles.input]}
            value={placeofoccurrence}
            onChangeText={setPlaceofoccurrence}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default FramingScreen;
