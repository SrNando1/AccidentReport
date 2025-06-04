import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { getReportData, updateReportData } from "../../../data/reportData";
import { globalStyles } from "../../../components/styles";

const DataDriverA = ({ navigation }) => {
  // Busca os dados iniciais do reportData
  const initialDriverAData = getReportData().DataDriverA || {};

  // Estados para cada campo do DataDriverA
  const [name, setName] = useState(initialDriverAData.name || "");
  const [Enterprise, setEnterprise] = useState(
    initialDriverAData.Enterprise || ""
  );
  const [EmployeeNumber, setEmployeeNumber] = useState(
    initialDriverAData.EmployeeNumber || ""
  );
  const [EmployeeFunction, setEmployeeFunction] = useState(
    initialDriverAData.EmployeeFunction || ""
  );
  const [LicenseNumberANA, setLicenseNumberANA] = useState(
    initialDriverAData.LicenseNumberANA || ""
  );
  const [ValidityANA, setValidityANA] = useState(
    initialDriverAData.ValidityANA || ""
  );
  const [CategoryANA, setCategoryANA] = useState(
    initialDriverAData.CategoryANA || ""
  );
  const [CivilLicenseNumber, setCivilLicenseNumber] = useState(
    initialDriverAData.CivilLicenseNumber || ""
  );
  const [ValidityCivil, setValidityCivil] = useState(
    initialDriverAData.ValidityCivil || ""
  );
  const [CategoryCivil, setCategoryCivil] = useState(
    initialDriverAData.CategoryCivil || ""
  );
  const [AdmitionDate, setAdmitionDate] = useState(
    initialDriverAData.AdmitionDate || ""
  );
  const [ContractType, setContractType] = useState(
    initialDriverAData.ContractType || ""
  );
  const [Formation, setFormation] = useState(
    initialDriverAData.Formation || ""
  );
  const [ShiftTime, setShiftTime] = useState(
    initialDriverAData.ShiftTime || ""
  );
  const [DayShift, setDayShift] = useState(initialDriverAData.DayShift || "");
  const [DaysOff, setDaysOff] = useState(initialDriverAData.DaysOff || "");
  const [Breaks, setBreaks] = useState(initialDriverAData.Breaks || "");
  const [IncidentHistory, setIncidentHistory] = useState(
    initialDriverAData.IncidentHistory || ""
  );
  const [DescriptionFactsOperator, setDescriptionFactsOperator] = useState(
    initialDriverAData.DescriptionFactsOperator || ""
  );

  // Atualiza o reportData sempre que algum campo muda
  useEffect(() => {
    updateReportData({
      DataDriverA: {
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
  ]);

  return (
    <ScrollView contentContainerStyle={globalStyles.container}>
      <View style={globalStyles.formGroup}>
        <Text style={globalStyles.label}>Condutor Do Veiculo A</Text>
        <View style={globalStyles.formGroup1}>
          <Text style={globalStyles.label1}>
            2.3.1 Nome do condutor do veiculo A
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={name}
            onChangeText={setName}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.1.1 Empresa</Text>
          <TextInput
            style={[globalStyles.input]}
            value={Enterprise}
            onChangeText={setEnterprise}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2 Nº de funcionário</Text>
          <TextInput
            style={[globalStyles.input]}
            value={EmployeeNumber}
            onChangeText={setEmployeeNumber}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2.1 Função</Text>
          <TextInput
            style={[globalStyles.input]}
            value={EmployeeFunction}
            onChangeText={setEmployeeFunction}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.2 Licença de condução ANA nº
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={LicenseNumberANA}
            onChangeText={setLicenseNumberANA}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.3 Validade de licença de condução ANA
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={ValidityANA}
            onChangeText={setValidityANA}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.4 Categoria de Licença Ana
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={CategoryANA}
            onChangeText={setCategoryANA}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.5 Licença de condução civil nº
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={CivilLicenseNumber}
            onChangeText={setCivilLicenseNumber}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.6 Validade licença de condução civil
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={ValidityCivil}
            onChangeText={setValidityCivil}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.7 Categoria da licença civil
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={CategoryCivil}
            onChangeText={setCategoryCivil}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2.8 Data de admissão</Text>
          <TextInput
            style={[globalStyles.input]}
            value={AdmitionDate}
            onChangeText={setAdmitionDate}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2.9 Tipo de contrato</Text>
          <TextInput
            style={[globalStyles.input]}
            value={ContractType}
            onChangeText={setContractType}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2.10 Formação válida</Text>
          <TextInput
            style={[globalStyles.input]}
            value={Formation}
            onChangeText={setFormation}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2.11 Horário laboral</Text>
          <TextInput
            style={[globalStyles.input]}
            value={ShiftTime}
            onChangeText={setShiftTime}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>2.3.2.12 Dia do turno</Text>
          <TextInput
            style={[globalStyles.input]}
            value={DayShift}
            onChangeText={setDayShift}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.13 Folgas antes do turno
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={DaysOff}
            onChangeText={setDaysOff}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.14 Pausas antes do incidente
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={Breaks}
            onChangeText={setBreaks}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.15 Histórico de incidentes
          </Text>
          <TextInput
            style={[globalStyles.input]}
            value={IncidentHistory}
            onChangeText={setIncidentHistory}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
          />
          <Text style={globalStyles.label1}>
            2.3.2.16 Descrição dos factos do operador
          </Text>
          <TextInput
            style={[globalStyles.input, globalStyles.multilineInput]}
            value={DescriptionFactsOperator}
            onChangeText={setDescriptionFactsOperator}
            placeholder="Preencha este campo"
            placeholderTextColor="red"
            multiline
            numberOfLines={7}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default DataDriverA;
