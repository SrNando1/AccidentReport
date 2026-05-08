import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { getReportData } from "../data/reportData";
import { causeData } from "../data/rootCauseData";

export async function generateWordReportWeb() {
  console.log("✅ generateWordReportWeb foi chamado!");
  const data = getReportData();

  if (!data || typeof data !== "object") {
    alert("Erro: dados do relatório estão vazios ou corrompidos.");
    return;
  }

  const isEmpty =
    !data.summary &&
    !data.vehicleA &&
    !data.vehicleB &&
    !data.dateofoccurrence &&
    !data.DamageCausedDescription;

  if (isEmpty) {
    alert(
      "O relatório está incompleto. Por favor, preencha os dados antes de gerar o documento.",
    );
    return;
  }

  function getNameFromCauseData(causeData, typeId, categoryId, subcategoryId) {
    const type = causeData.types.find((t) => t.id === typeId);
    const category = causeData.categories[typeId]?.find(
      (c) => c.id === categoryId,
    );
    const categoryNum = categoryId?.split("-")[1];
    const subcategoryKey = `${typeId}-${categoryNum}`;
    const subcategory = causeData.subcategories[subcategoryKey]?.find(
      (s) => s.id === subcategoryId,
    );

    return {
      typeName: type?.name || "Não selecionado",
      categoryName: category?.name || "Não selecionado",
      subcategoryName: subcategory?.name || "Não selecionado",
    };
  }

  const { typeName, categoryName, subcategoryName } = getNameFromCauseData(
    causeData,
    data.RootCause?.rootCauseType,
    data.RootCause?.rootCauseCategory,
    data.RootCause?.rootCauseSubcategory,
  );

  try {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [
                new TextRun({
                  text: "Relatório de Acidente",
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: `Summary: ${data.summary || "N/A"}` }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Driver of Vehicle A", bold: true }),
            new Paragraph({ text: `Vehicle A: ${data.vehicleA || "N/A"}` }),
            new Paragraph({
              text: `Falsec number: ${data.falsecA || "N/A"}`,
            }),
            new Paragraph({ text: `Company: ${data.enterpriseA || "N/A"}` }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Driver of Vehicle B", bold: true }),
            new Paragraph({ text: `Vehicle B: ${data.vehicleB || "N/A"}` }),
            new Paragraph({
              text: `Falsec number: ${data.falsecB || "N/A"}`,
            }),
            new Paragraph({ text: `Company: ${data.enterpriseB || "N/A"}` }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Incident Data", bold: true }),
            new Paragraph({ text: `Date: ${data.dateofoccurrence || "N/A"}` }),
            new Paragraph({ text: `Time: ${data.timeofoccurrence || "N/A"}` }),
            new Paragraph({
              text: `Location: ${data.placeofoccurrence || "N/A"}`,
            }),

            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Description of Damages Caused",
              bold: true,
            }),
            new Paragraph({ text: data.DamageCausedDescription || "N/A" }),

            // Drivers Data
            new Paragraph({}),
            new Paragraph({ text: "Drivers Data", bold: true }),

            // Condutor A
            new Paragraph({}),
            new Paragraph({ text: "Driver A:", bold: true }),
            new Paragraph({ text: `Name: ${data.DataDriverA?.name || "N/A"}` }),
            new Paragraph({
              text: `Company: ${data.DataDriverA?.Enterprise || "N/A"}`,
            }),
            new Paragraph({
              text: `Number of employee: ${
                data.DataDriverA?.EmployeeNumber || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Function: ${data.DataDriverA?.EmployeeFunction || "N/A"}`,
            }),
            new Paragraph({
              text: `ANA driving license Nº: ${
                data.DataDriverA?.LicenseNumberANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Validity of ANA driving license: ${
                data.DataDriverA?.ValidityANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Categoria de Licença Ana: ${
                data.DataDriverA?.CategoryANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Licença de condução civil Nº: ${
                data.DataDriverA?.CivilLicenseNumber || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Validade licença de condução civil: ${
                data.DataDriverA?.ValidityCivil || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Categoria da licença civil: ${
                data.DataDriverA?.CategoryCivil || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Data de admissão: ${
                data.DataDriverA?.AdmitionDate || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Tipo de contrato: ${
                data.DataDriverA?.ContractType || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Formação válida: ${data.DataDriverA?.Formation || "N/A"}`,
            }),
            new Paragraph({
              text: `Horário laboral: ${data.DataDriverA?.ShiftTime || "N/A"}`,
            }),
            new Paragraph({
              text: `Dia do turno: ${data.DataDriverA?.DayShift || "N/A"}`,
            }),
            new Paragraph({
              text: `Folgas antes do turno: ${
                data.DataDriverA?.DaysOff || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Pausas antes do incidente: ${
                data.DataDriverA?.Breaks || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Histórico de incidentes: ${
                data.DataDriverA?.IncidentHistory || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Descrição dos factos do operador: ${
                data.DataDriverA?.DescriptionFactsOperator || "N/A"
              }`,
            }),

            // Condutor B
            new Paragraph({}),
            new Paragraph({ text: "Condutor B:", bold: true }),
            new Paragraph({ text: `Nome: ${data.DataDriverB?.name || "N/A"}` }),
            new Paragraph({
              text: `Company: ${data.DataDriverB?.Enterprise || "N/A"}`,
            }),
            new Paragraph({
              text: `Número de funcionário: ${
                data.DataDriverB?.EmployeeNumber || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Função: ${data.DataDriverB?.EmployeeFunction || "N/A"}`,
            }),
            new Paragraph({
              text: `Licença de condução ANA Nº: ${
                data.DataDriverB?.LicenseNumberANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Validade de licença de condução ANA: ${
                data.DataDriverB?.ValidityANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Categoria de Licença Ana: ${
                data.DataDriverB?.CategoryANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Licença de condução civil Nº: ${
                data.DataDriverB?.CivilLicenseNumber || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Validade licença de condução civil: ${
                data.DataDriverB?.ValidityCivil || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Categoria da licença civil: ${
                data.DataDriverB?.CategoryCivil || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Data de admissão: ${
                data.DataDriverB?.AdmitionDate || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Tipo de contrato: ${
                data.DataDriverB?.ContractType || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Formação válida: ${data.DataDriverB?.Formation || "N/A"}`,
            }),
            new Paragraph({
              text: `Horário laboral: ${data.DataDriverB?.ShiftTime || "N/A"}`,
            }),
            new Paragraph({
              text: `Dia do turno: ${data.DataDriverB?.DayShift || "N/A"}`,
            }),
            new Paragraph({
              text: `Folgas antes do turno: ${
                data.DataDriverB?.DaysOff || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Pausas antes do incidente: ${
                data.DataDriverB?.Breaks || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Histórico de incidentes: ${
                data.DataDriverB?.IncidentHistory || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Descrição dos factos do operador: ${
                data.DataDriverB?.DescriptionFactsOperator || "N/A"
              }`,
            }),

            // Root Cause of the Incident
            new Paragraph({}),
            new Paragraph({ text: "Root Cause of the Incident", bold: true }),
            new Paragraph({ text: "Fatores Contribuintes", bold: true }),
            new Paragraph({
              text: data.RootCause?.contributingFactors || "N/A",
            }),
            new Paragraph({ text: "Tipo de Causa", bold: true }),
            new Paragraph({ text: `Tipo: ${typeName}` }),
            new Paragraph({ text: `Categoria: ${categoryName}` }),
            new Paragraph({ text: `Subcategoria: ${subcategoryName}` }),
            new Paragraph({ text: "Medidas Mitigatorias", bold: true }),
            new Paragraph({
              text: `${data.RootCause?.mitigatingmeasures || "N/A"}`,
            }),
            new Paragraph({ text: "Outras Ações Preventivas", bold: true }),
            new Paragraph({
              text: `${data.RootCause?.preventiveactions || "N/A"}`,
            }),

            // Accident Characterization
            new Paragraph({}),
            new Paragraph({ text: "Accident Characterization", bold: true }),
            new Paragraph({
              text: `SEVERIDADE DAS CONSEQUÊNCIAS: ${
                data.accidentCharacterization?.severityLevel ?? "N/A"
              }`,
            }),
            new Paragraph({
              text: `FREQUÊNCIA DAS OCORRÊNCIAS: ${
                data.accidentCharacterization?.frequencyLevel ?? "N/A"
              }`,
            }),

            // 9.2. FREQUENCY OF OCCURRENCES
            new Paragraph({}),
            new Paragraph({
              text: "9.2. FREQUENCY OF OCCURRENCES",
              bold: true,
            }),
            new Paragraph({
              text: `Nível de Aceitabilidade: ${
                data.accidentCharacterization?.riskLevel ?? "N/A"
              }`,
            }),
            new Paragraph({
              text: `Ações a Desenvolver: ${
                data.accidentCharacterization?.requiredActions || "N/A"
              }`,
            }),

            // Conclusion
            new Paragraph({}),
            new Paragraph({ text: "Conclusion", bold: true }),
            new Paragraph({ text: `${data.conclusion || "N/A"}` }),
          ],
        },
      ],
    });

    let blob;
    try {
      blob = await Packer.toBlob(doc);
    } catch (err) {
      console.error("Erro ao converter o documento para blob:", err);
      alert(
        "Erro ao gerar o ficheiro Word. Verifique se os dados estão completos.",
      );
      return;
    }

    saveAs(blob, "RelatorioAcidente.docx");
    console.log("✅ Relatório gerado com sucesso!");
  } catch (error) {
    console.error("❌ Erro geral ao gerar o relatório:", error);
    alert("Ocorreu um erro inesperado. Tente novamente.");
  }
}

export async function generateWordReportWebSilent() {
  const data = getReportData();

  if (!data || typeof data !== "object") {
    console.error("❌ Dados do relatório estão vazios ou corrompidos.");
    return null;
  }

  const isEmpty =
    !data.summary &&
    !data.vehicleA &&
    !data.vehicleB &&
    !data.dateofoccurrence &&
    !data.DamageCausedDescription;

  if (isEmpty) {
    console.warn("⚠️ O relatório está incompleto. Dados ausentes.");
    return null;
  }

  function getNameFromCauseData(causeData, typeId, categoryId, subcategoryId) {
    const type = causeData.types.find((t) => t.id === typeId);
    const category = causeData.categories[typeId]?.find(
      (c) => c.id === categoryId,
    );
    const categoryNum = categoryId?.split("-")[1];
    const subcategoryKey = `${typeId}-${categoryNum}`;
    const subcategory = causeData.subcategories[subcategoryKey]?.find(
      (s) => s.id === subcategoryId,
    );

    return {
      typeName: type?.name || "Não selecionado",
      categoryName: category?.name || "Não selecionado",
      subcategoryName: subcategory?.name || "Não selecionado",
    };
  }

  const { typeName, categoryName, subcategoryName } = getNameFromCauseData(
    causeData,
    data.RootCause?.rootCauseType,
    data.RootCause?.rootCauseCategory,
    data.RootCause?.rootCauseSubcategory,
  );

  try {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [
                new TextRun({
                  text: "Relatório de Acidente",
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: `Summary: ${data.summary || "N/A"}` }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Driver of Vehicle A", bold: true }),
            new Paragraph({ text: `Vehicle A: ${data.vehicleA || "N/A"}` }),
            new Paragraph({
              text: `Falsec Number: ${data.falsecA || "N/A"}`,
            }),
            new Paragraph({ text: `Company: ${data.enterpriseA || "N/A"}` }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Driver of Vehicle B", bold: true }),
            new Paragraph({ text: `Vehicle B: ${data.vehicleB || "N/A"}` }),
            new Paragraph({
              text: `Falsec Number: ${data.falsecB || "N/A"}`,
            }),
            new Paragraph({ text: `Company: ${data.enterpriseB || "N/A"}` }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Occurrence Data", bold: true }),
            new Paragraph({ text: `Date: ${data.dateofoccurrence || "N/A"}` }),
            new Paragraph({ text: `Time: ${data.timeofoccurrence || "N/A"}` }),
            new Paragraph({
              text: `Location: ${data.placeofoccurrence || "N/A"}`,
            }),

            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Description of Damages Caused",
              bold: true,
            }),
            new Paragraph({ text: data.DamageCausedDescription || "N/A" }),

            // Drivers Data
            new Paragraph({}),
            new Paragraph({ text: "Drivers Data", bold: true }),

            // Driver A
            new Paragraph({}),
            new Paragraph({ text: "Driver A:", bold: true }),
            new Paragraph({ text: `Name: ${data.DataDriverA?.name || "N/A"}` }),
            new Paragraph({
              text: `Company: ${data.DataDriverA?.Enterprise || "N/A"}`,
            }),
            new Paragraph({
              text: `Employee Number: ${data.DataDriverA?.EmployeeNumber || "N/A"}`,
            }),
            new Paragraph({
              text: `Function: ${data.DataDriverA?.EmployeeFunction || "N/A"}`,
            }),
            new Paragraph({
              text: `ANA Driving License Nº: ${
                data.DataDriverA?.LicenseNumberANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Validity of ANA Driving License: ${
                data.DataDriverA?.ValidityANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `ANA License Category: ${
                data.DataDriverA?.CategoryANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Civil Driving License Nº: ${
                data.DataDriverA?.CivilLicenseNumber || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Validity of Civil Driving License: ${
                data.DataDriverA?.ValidityCivil || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Civil License Category: ${
                data.DataDriverA?.CategoryCivil || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Admission Date: ${
                data.DataDriverA?.AdmitionDate || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Contract Type: ${data.DataDriverA?.ContractType || "N/A"}`,
            }),
            new Paragraph({
              text: `Valid Training: ${data.DataDriverA?.Formation || "N/A"}`,
            }),
            new Paragraph({
              text: `Working Schedule: ${data.DataDriverA?.ShiftTime || "N/A"}`,
            }),
            new Paragraph({
              text: `Shift Day: ${data.DataDriverA?.DayShift || "N/A"}`,
            }),
            new Paragraph({
              text: `Days Off Before Shift: ${
                data.DataDriverA?.DaysOff || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Breaks Before Incident: ${
                data.DataDriverA?.Breaks || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Incident History: ${
                data.DataDriverA?.IncidentHistory || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Operator's Description of Facts: ${
                data.DataDriverA?.DescriptionFactsOperator || "N/A"
              }`,
            }),

            // Driver B
            new Paragraph({}),
            new Paragraph({ text: "Driver B:", bold: true }),
            new Paragraph({ text: `Name: ${data.DataDriverB?.name || "N/A"}` }),
            new Paragraph({
              text: `Company: ${data.DataDriverB?.Enterprise || "N/A"}`,
            }),
            new Paragraph({
              text: `Employee Number: ${
                data.DataDriverB?.EmployeeNumber || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Function: ${data.DataDriverB?.EmployeeFunction || "N/A"}`,
            }),
            new Paragraph({
              text: `ANA Driving License Nº: ${
                data.DataDriverB?.LicenseNumberANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Validity of ANA Driving License: ${
                data.DataDriverB?.ValidityANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `ANA License Category: ${
                data.DataDriverB?.CategoryANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Civil Driving License Nº: ${
                data.DataDriverB?.CivilLicenseNumber || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Validity of Civil Driving License: ${
                data.DataDriverB?.ValidityCivil || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Civil License Category: ${
                data.DataDriverB?.CategoryCivil || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Admission Date: ${
                data.DataDriverB?.AdmitionDate || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Contract Type: ${data.DataDriverB?.ContractType || "N/A"}`,
            }),
            new Paragraph({
              text: `Valid Training: ${data.DataDriverB?.Formation || "N/A"}`,
            }),
            new Paragraph({
              text: `Working Schedule: ${data.DataDriverB?.ShiftTime || "N/A"}`,
            }),
            new Paragraph({
              text: `Shift Day: ${data.DataDriverB?.DayShift || "N/A"}`,
            }),
            new Paragraph({
              text: `Days Off Before Shift: ${
                data.DataDriverB?.DaysOff || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Breaks Before Incident: ${
                data.DataDriverB?.Breaks || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Incident History: ${
                data.DataDriverB?.IncidentHistory || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Operator's Description of Facts: ${
                data.DataDriverB?.DescriptionFactsOperator || "N/A"
              }`,
            }),

            // Root Cause of the Incident
            new Paragraph({}),
            new Paragraph({ text: "Root Cause of the Incident", bold: true }),
            new Paragraph({ text: "Contributing Factors", bold: true }),
            new Paragraph({
              text: data.RootCause?.contributingFactors || "N/A",
            }),
            new Paragraph({ text: "Type of Cause", bold: true }),
            new Paragraph({ text: `Type: ${typeName}` }),
            new Paragraph({ text: `Category: ${categoryName}` }),
            new Paragraph({ text: `Subcategory: ${subcategoryName}` }),
            new Paragraph({ text: "Mitigating Measures", bold: true }),
            new Paragraph({
              text: `${data.RootCause?.mitigatingmeasures || "N/A"}`,
            }),
            new Paragraph({ text: "Other Preventive Actions", bold: true }),
            new Paragraph({
              text: `${data.RootCause?.preventiveactions || "N/A"}`,
            }),

            // Accident Characterization
            new Paragraph({}),
            new Paragraph({ text: "Accident Characterization", bold: true }),
            new Paragraph({
              text: `SEVERITY OF CONSEQUENCES: ${
                data.accidentCharacterization?.severityLevel ?? "N/A"
              }`,
            }),
            new Paragraph({
              text: `FREQUENCY OF OCCURRENCES: ${
                data.accidentCharacterization?.frequencyLevel ?? "N/A"
              }`,
            }),

            // Risk Evaluation
            new Paragraph({}),
            new Paragraph({
              text: "9.2. FREQUENCY OF OCCURRENCES",
              bold: true,
            }),
            new Paragraph({
              text: `Acceptability Level: ${
                data.accidentCharacterization?.riskLevel ?? "N/A"
              }`,
            }),
            new Paragraph({
              text: `Actions to be Developed: ${
                data.accidentCharacterization?.requiredActions || "N/A"
              }`,
            }),

            // Conclusion
            new Paragraph({}),
            new Paragraph({ text: "Conclusion", bold: true }),
            new Paragraph({ text: `${data.conclusion || "N/A"}` }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
  } catch (error) {
    console.error("❌ Erro ao gerar relatório silencioso:", error);
    return null;
  }
}
