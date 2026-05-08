import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import API from "../../src/services/api"; // usa o axios já configurado
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
    initialData.dateofoccurrence,
  );
  const [timeofoccurrence, setTimeofoccurrence] = useState(
    initialData.timeofoccurrence,
  );
  const [placeofoccurrence, setPlaceofoccurrence] = useState(
    initialData.placeofoccurrence,
  );

  // Lista de employers para o dropdown
  const [employers, setEmployers] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);
  const [employersError, setEmployersError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleAId, setVehicleAId] = useState(initialData.vehicleAId || "");

  useEffect(() => {
    fetch("http://localhost:3000/api/vehicles") // endpoint que retorna todos os veículos
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => console.error("Erro ao buscar veículos:", err));
  }, []);

  // Atualiza o reportData sempre que o campo muda
  useEffect(() => {
    updateReportData({
      vehicleAId,
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
    vehicleAId,
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

  useEffect(() => {
    if (!vehicleAId && vehicleA && vehicles.length) {
      const v = vehicles.find((x) => x.plate_number === vehicleA);
      if (v) setVehicleAId(String(v.id));
    }
  }, [vehicles, vehicleA, vehicleAId]);

  // Carrega employers da API
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingEmployers(true);
        setEmployersError(null);
        const { data } = await API.get("/employers"); // GET /api/employers
        // espera [{ employers_id, full_name, ... }]
        if (alive) setEmployers(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setEmployersError("Erro ao carregar employers");
        console.warn(e);
      } finally {
        if (alive) setLoadingEmployers(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        globalStyles.container,
        { flexGrow: 1, overflow: "auto" },
      ]}
    >
      <View style={globalStyles.formGroup}>
        <Text style={globalStyles.label}>Driver of Vehicle A</Text>
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label1}>2.1.1 Vehicle A</Text>
          <Picker
            selectedValue={vehicleAId}
            onValueChange={(val) => {
              setVehicleAId(val);

              const selectedId = Number(val);
              const vehicle = vehicles.find((v) => v.id === selectedId); // <-- é "id"

              if (vehicle) {
                setVehicleA(vehicle.plate_number); // matrícula no reportData
                setFalsecA(vehicle.falsec_number || "");
              } else {
                setVehicleA("");
                setFalsecA("");
              }
            }}
          >
            <Picker.Item label="Select the plate" value="" />
            {vehicles.map((v) => (
              <Picker.Item
                key={v.id}
                label={v.plate_number}
                value={String(v.id)}
              />
            ))}
          </Picker>

          <Text style={globalStyles.label1}>2.1.2 Number of Falsec</Text>
          <TextInput
            style={globalStyles.input}
            value={falsecA || ""}
            onChangeText={setFalsecA}
            placeholder="Nº de Falsec"
            editable={false}
          />

          <Text style={globalStyles.label1}>2.1.2.1 Company</Text>
          <TextInput
            style={[globalStyles.input]}
            value={enterpriseA}
            onChangeText={setEnterpriseA}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
        </View>
      </View>
      <View style={globalStyles.formGroup}>
        <Text style={globalStyles.label}>Driver of Vehicle B</Text>
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label1}>2.1.3 Vehicle B</Text>
          <TextInput
            style={[globalStyles.input]}
            value={vehicleB}
            onChangeText={setVehicleB}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.1.4 Number of Falsec</Text>
          <TextInput
            style={[globalStyles.input]}
            value={falsecB}
            onChangeText={setFalsecB}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.1.4.1 Company </Text>
          <TextInput
            style={[globalStyles.input]}
            value={enterpriseB}
            onChangeText={setEnterpriseB}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
        </View>
      </View>
      <View style={globalStyles.formGroup}>
        <Text style={globalStyles.label}>Incident Data</Text>
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label1}>2.1.5 Date of Occurrence</Text>
          <TextInput
            style={globalStyles.input}
            value={dateofoccurrence}
            onChangeText={setDateofoccurrence}
            placeholder="Fill in this field" // Changed to match the purpose
            placeholderTextColor="red"
            keyboardType="numeric" // If it's a date in format DD/MM/YYYY
          />
          <Text style={globalStyles.label1}>2.1.6 Time of Occurrence</Text>
          <TextInput
            style={[globalStyles.input]}
            value={timeofoccurrence}
            onChangeText={setTimeofoccurrence}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.1.7 Location of the Incident{" "}
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={placeofoccurrence}
            onChangeText={setPlaceofoccurrence}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default FramingScreen;
