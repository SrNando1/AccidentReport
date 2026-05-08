import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getReportData, updateReportData } from "../../../data/reportData";
import { globalStyles } from "../../../components/styles";
import API from "../../../src/services/api";

const DataDriverA = ({ navigation }) => {
  // Busca os dados iniciais do reportData
  const report = getReportData() || {};
  const initialDriverAData = report.DataDriverA || {};

  // Estados para cada campo do DataDriverA
  const [name, setName] = useState(initialDriverAData.name || "");
  const [Enterprise, setEnterprise] = useState(
    initialDriverAData.Enterprise || "",
  );
  const [EmployeeNumber, setEmployeeNumber] = useState(
    initialDriverAData.EmployeeNumber || "",
  );
  const [EmployeeFunction, setEmployeeFunction] = useState(
    initialDriverAData.EmployeeFunction || "",
  );
  const [LicenseNumberANA, setLicenseNumberANA] = useState(
    initialDriverAData.LicenseNumberANA || "",
  );
  const [ValidityANA, setValidityANA] = useState(
    initialDriverAData.ValidityANA || "",
  );
  const [CategoryANA, setCategoryANA] = useState(
    initialDriverAData.CategoryANA || "",
  );
  const [CivilLicenseNumber, setCivilLicenseNumber] = useState(
    initialDriverAData.CivilLicenseNumber || "",
  );
  const [ValidityCivil, setValidityCivil] = useState(
    initialDriverAData.ValidityCivil || "",
  );
  const [CategoryCivil, setCategoryCivil] = useState(
    initialDriverAData.CategoryCivil || "",
  );
  const [AdmitionDate, setAdmitionDate] = useState(
    initialDriverAData.AdmitionDate || "",
  );
  const [ContractType, setContractType] = useState(
    initialDriverAData.ContractType || "",
  );
  const [Formation, setFormation] = useState(
    initialDriverAData.Formation || "",
  );
  const [ShiftTime, setShiftTime] = useState(
    initialDriverAData.ShiftTime || "",
  );
  const [DayShift, setDayShift] = useState(initialDriverAData.DayShift || "");
  const [DaysOff, setDaysOff] = useState(initialDriverAData.DaysOff || "");
  const [Breaks, setBreaks] = useState(initialDriverAData.Breaks || "");
  const [IncidentHistory, setIncidentHistory] = useState(
    initialDriverAData.IncidentHistory || "",
  );
  const [DescriptionFactsOperator, setDescriptionFactsOperator] = useState(
    initialDriverAData.DescriptionFactsOperator || "",
  );

  const [employers, setEmployers] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);
  const [employersError, setEmployersError] = useState(null);
  const initialData = getReportData();
  const [selectedEmployerId, setSelectedEmployerId] = useState(
    initialDriverAData.selectedEmployerId || "",
  );

  // Atualiza o reportData sempre que algum campo muda
  useEffect(() => {
    updateReportData({
      DataDriverA: {
        ...(getReportData().DataDriverA || {}),
        name,
        Enterprise,
        EmployeeNumber,
        EmployeeFunction,
        LicenseNumberANA,
        ValidityANA,
        CategoryANA,
        CivilLicenseNumber,
        ValidityCivil,
        CategoryCivil,
        AdmitionDate,
        ContractType,
        Formation,
        ShiftTime,
        DayShift,
        DaysOff,
        Breaks,
        IncidentHistory,
        DescriptionFactsOperator,
        selectedEmployerId: String(selectedEmployerId || ""),
      },
    });
  }, [
    name,
    Enterprise,
    EmployeeNumber,
    EmployeeFunction,
    LicenseNumberANA,
    ValidityANA,
    CategoryANA,
    CivilLicenseNumber,
    ValidityCivil,
    CategoryCivil,
    AdmitionDate,
    ContractType,
    Formation,
    ShiftTime,
    DayShift,
    DaysOff,
    Breaks,
    IncidentHistory,
    DescriptionFactsOperator,
    selectedEmployerId,
  ]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingEmployers(true);
        const { data } = await API.get("/employers");
        if (alive) setEmployers(data);
      } catch (e) {
        if (alive) setEmployersError("Erro ao carregar lista de condutores");
      } finally {
        if (alive) setLoadingEmployers(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={globalStyles.formGroup}>
        <Text style={globalStyles.label}>Driver of Vehicle A</Text>
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label1}>
            2.3.1 Name of the driver of vehicle A
          </Text>
          <View style={[globalStyles.input, { paddingVertical: 0 }]}>
            <Picker
              selectedValue={selectedEmployerId}
              onValueChange={(id) => {
                setSelectedEmployerId(String(id));

                const emp = employers.find(
                  (e) => String(e.employers_id) === String(id),
                );
                if (!emp) return;

                // Atualiza estados locais
                setName(emp.full_name || ""); // <<< IMPORTANTE
                setEmployeeNumber(emp.employee_number || "");
                setEmployeeFunction(emp.employee_function || "");
                setLicenseNumberANA(emp.license_number_ana || "");
                setValidityANA(emp.validity_ana || "");
                setCategoryANA(emp.category_ana || "");
                setCivilLicenseNumber(emp.civil_license_number || "");
                setValidityCivil(emp.validity_civil || "");
                setCategoryCivil(emp.category_civil || "");
                setFormation(emp.formation || "");
                setEnterprise(emp.company || "");
                setAdmitionDate(emp.contract_date || "");

                // Guardar tudo no reportData
                updateReportData({
                  _userHasSelectedACondutor: true, // opcional mas útil
                  DataDriverA: {
                    ...(getReportData().DataDriverA || {}),
                    selectedEmployerId: String(id),
                    name: emp.full_name || "", // <<< IMPORTANTE
                    EmployeeNumber: emp.employee_number || "",
                    EmployeeFunction: emp.employee_function || "",
                    LicenseNumberANA: emp.license_number_ana || "",
                    ValidityANA: emp.validity_ana || "",
                    CategoryANA: emp.category_ana || "",
                    CivilLicenseNumber: emp.civil_license_number || "",
                    ValidityCivil: emp.validity_civil || "",
                    CategoryCivil: emp.category_civil || "",
                    Formation: emp.formation || "",
                    Enterprise: emp.company || "",
                    AdmitionDate: emp.contract_date || "",
                  },
                });
              }}
            >
              <Picker.Item
                label={
                  loadingEmployers ? "Loading drivers..." : "Select a driver"
                }
                value=""
              />
              {employers.map((emp) => (
                <Picker.Item
                  key={emp.employers_id}
                  label={emp.full_name}
                  value={String(emp.employers_id)}
                />
              ))}
            </Picker>
          </View>
          <Text style={globalStyles.label1}>2.3.1.1 Company</Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {Enterprise || "—"}
          </Text>
          <Text style={globalStyles.label1}>2.3.2 Number of employee</Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {EmployeeNumber || "—"}
          </Text>
          <Text style={globalStyles.label1}>2.3.2.1 Function</Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {EmployeeFunction || "—"}
          </Text>
          <Text style={globalStyles.label1}>
            2.3.2.2 ANA driving license Nº
          </Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {LicenseNumberANA || "—"}
          </Text>
          <Text style={globalStyles.label1}>
            2.3.2.3 Validity of ANA driving license
          </Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {ValidityANA || "—"}
          </Text>
          <Text style={globalStyles.label1}>2.3.2.4 Ana License Category</Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {CategoryANA || "—"}
          </Text>
          <Text style={globalStyles.label1}>
            2.3.2.5 Civil driving license Nº
          </Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {CivilLicenseNumber || "—"}
          </Text>
          <Text style={globalStyles.label1}>
            2.3.2.6 Validity of civil driving license
          </Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {ValidityCivil || "—"}
          </Text>
          <Text style={globalStyles.label1}>
            2.3.2.7 Civil license category
          </Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {CategoryCivil || "—"}
          </Text>
          <Text style={globalStyles.label1}>2.3.2.8 Date of admission</Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {AdmitionDate || "—"}
          </Text>
          <Text style={globalStyles.label1}>2.3.2.9 Type of contract</Text>
          <TextInput
            style={[globalStyles.input]}
            value={ContractType}
            onChangeText={setContractType}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2.10 Valid training</Text>
          <Text style={[globalStyles.input, { paddingVertical: 12 }]}>
            {Formation || "—"}
          </Text>
          <Text style={globalStyles.label1}>2.3.2.11 Working hours</Text>
          <TextInput
            style={[globalStyles.input]}
            value={ShiftTime}
            onChangeText={setShiftTime}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2.12 Shift Day</Text>
          <TextInput
            style={[globalStyles.input]}
            value={DayShift}
            onChangeText={setDayShift}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.13 Days off before the shift
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={DaysOff}
            onChangeText={setDaysOff}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.14 Pauses before the incident
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={Breaks}
            onChangeText={setBreaks}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2.15 Incident history </Text>
          <TextInput
            style={[globalStyles.input]}
            value={IncidentHistory}
            onChangeText={setIncidentHistory}
            placeholder="Fill in this field"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.16 Description of the operator's facts
          </Text>
          <TextInput
            style={[globalStyles.input, globalStyles.multilineInput]}
            value={DescriptionFactsOperator}
            onChangeText={setDescriptionFactsOperator}
            placeholder="Fill in this field"
            placeholderTextColor="red"
            multiline
            numberOfLines={7}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const pickerStyles = {
  picker: {
    width: "100%",
    color: "#111827", // ou outra cor de texto
    fontSize: 16,
  },
};

export default DataDriverA;
