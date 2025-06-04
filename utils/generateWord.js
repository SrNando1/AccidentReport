import RNFS from "react-native-fs";
import Share from "react-native-share";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { getReportData } from "../data/reportData";

export async function generateWordReport(shouldShare = false) {
  const data = getReportData();

  if (!data || typeof data !== "object") {
    throw new Error("Dados do relatório estão indefinidos ou mal formatados.");
  }

  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
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
            new Paragraph({}),
            new Paragraph({ text: "Sumário:", bold: true }),
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

    // ✅ Usa método direto do `docx` para gerar base64
    const base64data = await Packer.toBase64String(doc);
    const fileName = "RelatorioAcidente.docx";
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    // Salva o ficheiro no dispositivo
    await RNFS.writeFile(path, base64data, "base64");
    console.log("Arquivo salvo em:", path);

    if (shouldShare) {
      const options = {
        url: `file://${path}`,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        title: "Partilhar Relatório",
        subject: "Relatório de Acidente",
        failOnCancel: false,
      };

      await Share.open(options);
    }

    return path;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    throw new Error("Ocorreu um erro ao gerar o relatório: " + error.message);
  }
}
