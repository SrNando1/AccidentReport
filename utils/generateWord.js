import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { getReportData } from "../data/reportData";
import { causeData } from "../data/rootCauseData";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { Buffer } from "buffer";

export async function generateWordReport() {
  const data = getReportData();

  if (!data || typeof data !== "object") {
    Alert.alert("Erro", "Dados do relatório estão vazios ou corrompidos.");
    return;
  }

  const hasAlgumConteudo =
    !!data.summary ||
    !!data.vehicleA ||
    !!data.vehicleB ||
    !!data.dateofoccurrence ||
    !!data.DamageCausedDescription;

  if (!hasAlgumConteudo) {
    Alert.alert(
      "Aviso",
      "O relatório está completamente vazio. Preencha pelo menos um campo."
    );
    return;
  }

  const getNameFromCauseData = (
    causeData,
    typeId,
    categoryId,
    subcategoryId
  ) => {
    const type = causeData.types.find((t) => t.id === typeId);
    const category = causeData.categories[typeId]?.find(
      (c) => c.id === categoryId
    );
    const categoryNum = categoryId?.split("-")[1];
    const subcategoryKey = `${typeId}-${categoryNum}`;
    const subcategory = causeData.subcategories[subcategoryKey]?.find(
      (s) => s.id === subcategoryId
    );

    return {
      typeName: type?.name || "Não selecionado",
      categoryName: category?.name || "Não selecionado",
      subcategoryName: subcategory?.name || "Não selecionado",
    };
  };

  const { typeName, categoryName, subcategoryName } = getNameFromCauseData(
    causeData,
    data.RootCause?.rootCauseType,
    data.RootCause?.rootCauseCategory,
    data.RootCause?.rootCauseSubcategory
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
            new Paragraph({ text: `Resumo: ${data.summary || "N/A"}` }),

            // Detalhes de Averiguação
            new Paragraph({}),
            new Paragraph({ text: "Detalhes de Averiguação", bold: true }),

            // Enquadramento
            new Paragraph({}),
            new Paragraph({ text: "Enquadramento", bold: true }),

            // Condutor Do Veiculo A
            new Paragraph({}),
            new Paragraph({ text: "Condutor Do Veiculo A ", bold: true }),
            new Paragraph({ text: `Viatura A: ${data.vehicleA || "N/A"}` }),
            new Paragraph({
              text: `Número de Falsec  : ${data.falsecA || "N/A"}`,
            }),
            new Paragraph({ text: `Empresa: ${data.enterpriseA || "N/A"}` }),

            // Condutor Do Veiculo B
            new Paragraph({}),
            new Paragraph({ text: "Condutor Do Veiculo B ", bold: true }),
            new Paragraph({ text: `Viatura B: ${data.vehicleB || "N/A"}` }),
            new Paragraph({
              text: `Número de Falsec  : ${data.falsecB || "N/A"}`,
            }),
            new Paragraph({ text: `Empresa: ${data.enterpriseB || "N/A"}` }),

            // Dados de Ocorrencia
            new Paragraph({}),
            new Paragraph({ text: "Dados de Ocorrencia ", bold: true }),
            new Paragraph({
              text: `Data da Ocorrencia: ${data.dateofoccurrence || "N/A"}`,
            }),
            new Paragraph({
              text: `Hora da Ocorrencia: ${data.timeofoccurrence || "N/A"}`,
            }),
            new Paragraph({
              text: `Local da Ocorrencia: ${data.placeofoccurrence || "N/A"}`,
            }),

            // Descrição de Danos Causados
            new Paragraph({}),
            new Paragraph({ text: "Descrição de Danos Causados", bold: true }),
            new Paragraph({ text: `${data.DamageCausedDescription || "N/A"}` }),

            // Dados dos Condutores
            new Paragraph({}),
            new Paragraph({ text: "Dados dos Condutores", bold: true }),

            // Condutor A
            new Paragraph({}),
            new Paragraph({ text: "Condutor A:", bold: true }),
            new Paragraph({ text: `Nome: ${data.DataDriverA?.name || "N/A"}` }),
            new Paragraph({
              text: `Empresa: ${data.DataDriverA?.Enterprise || "N/A"}`,
            }),
            new Paragraph({
              text: `Número de funcionário: ${
                data.DataDriverA?.EmployeeNumber || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Função: ${data.DataDriverA?.EmployeeFunction || "N/A"}`,
            }),
            new Paragraph({
              text: `Licença de condução ANA Nº: ${
                data.DataDriverA?.LicenseNumberANA || "N/A"
              }`,
            }),
            new Paragraph({
              text: `Validade de licença de condução ANA: ${
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
              text: `Empresa: ${data.DataDriverB?.Enterprise || "N/A"}`,
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

            // Causa Raiz do Incidente
            new Paragraph({}),
            new Paragraph({ text: "Causa Raiz do Incidente", bold: true }),
            new Paragraph({ text: "Fatores Contribuintes", bold: true }),
            new Paragraph({ text: `${data.contributingFactors || "N/A"}` }),
            new Paragraph({ text: "Tipo de Causa", bold: true }),
            new Paragraph({ text: `${data.rootCauseType || "N/A"}` }),
            new Paragraph({ text: `${data.rootCauseCategory || "N/A"}` }),
            new Paragraph({ text: `${data.rootCauseSubcategory || "N/A"}` }),
            new Paragraph({ text: "Medidas Mitigatorias", bold: true }),
            new Paragraph({ text: `${data.mitigatingmeasures || "N/A"}` }),
            new Paragraph({ text: "Outras Ações Preventivas", bold: true }),
            new Paragraph({ text: `${data.preventiveactions || "N/A"}` }),

            // Caraterização de Acidente
            new Paragraph({}),
            new Paragraph({ text: "Caraterização de Acidente", bold: true }),
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

            // AVALIAÇÃO DE RISCO
            new Paragraph({}),
            new Paragraph({ text: "AVALIAÇÃO DE RISCO", bold: true }),
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

            // Conclusão
            new Paragraph({}),
            new Paragraph({ text: "Conclusão", bold: true }),
            new Paragraph({ text: `${data.conclusion || "N/A"}` }),
          ],
        },
      ],
    });

    let base64Doc;
    try {
      base64Doc = await Packer.toBase64String(doc);
    } catch (err) {
      console.error("Erro ao gerar o ficheiro DOCX:", err);
      Alert.alert("Erro", "Falha ao gerar o documento. Verifique os dados.");
      return;
    }

    const filePath = FileSystem.documentDirectory + "RelatorioAcidente.docx";
    await FileSystem.writeAsStringAsync(filePath, base64Doc, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("📄 Relatório guardado em:", filePath);
    await Sharing.shareAsync(filePath);
    console.log("✅ Relatório (mobile) gerado e partilhado com sucesso!");
  } catch (error) {
    console.error("Erro geral ao gerar o relatório:", error);
    Alert.alert("Erro inesperado", "Algo correu mal ao gerar o documento.");
  }
}
