import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { getReportData } from "../data/reportData";
import { causeData } from "../data/rootCauseData";

export async function generateWordReportWeb() {
  console.log("✅ generateWordReportWeb foi chamado!");
  const data = getReportData();

  // Validação reforçada
  if (!data || typeof data !== "object") {
    throw new Error(
      "Dados do relatório são inválidos ou não foram carregados."
    );
  }

  function getNameFromCauseData(causeData, typeId, categoryId, subcategoryId) {
    // 1. Encontrar o tipo
    const type = causeData.types.find((t) => t.id === typeId);

    // 2. Encontrar a categoria (dentro do categories[typeId])
    const category = causeData.categories[typeId]?.find(
      (c) => c.id === categoryId
    );

    // 3. Construir a chave para subcategorias (formato "typeId-categoryNum")
    const categoryNum = categoryId?.split("-")[1]; // extrai o número da categoria (parte após o '-')
    const subcategoryKey = `${typeId}-${categoryNum}`;

    // 4. Encontrar a subcategoria
    const subcategory = causeData.subcategories[subcategoryKey]?.find(
      (s) => s.id === subcategoryId
    );

    return {
      typeName: type?.name || "Não selecionado",
      categoryName: category?.name || "Não selecionado",
      subcategoryName: subcategory?.name || "Não selecionado",
    };
  }

  const typeId = data.RootCause?.rootCauseType;
  const categoryId = data.RootCause?.rootCauseCategory;
  const subcategoryId = data.RootCause?.rootCauseSubcategory;

  const names = getNameFromCauseData(
    causeData,
    data.RootCause?.rootCauseType,
    data.RootCause?.rootCauseCategory,
    data.RootCause?.rootCauseSubcategory
  );
  const { typeName, categoryName, subcategoryName } = names;

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

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Condutor Do Veiculo A", bold: true }),
            new Paragraph({ text: `Viatura A: ${data.vehicleA || "N/A"}` }),
            new Paragraph({
              text: `Número de Falsec: ${data.falsecA || "N/A"}`,
            }),
            new Paragraph({ text: `Empresa: ${data.enterpriseA || "N/A"}` }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Condutor Do Veiculo B", bold: true }),
            new Paragraph({ text: `Viatura B: ${data.vehicleB || "N/A"}` }),
            new Paragraph({
              text: `Número de Falsec: ${data.falsecB || "N/A"}`,
            }),
            new Paragraph({ text: `Empresa: ${data.enterpriseB || "N/A"}` }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Dados de Ocorrência", bold: true }),
            new Paragraph({ text: `Data: ${data.dateofoccurrence || "N/A"}` }),
            new Paragraph({ text: `Hora: ${data.timeofoccurrence || "N/A"}` }),
            new Paragraph({
              text: `Local: ${data.placeofoccurrence || "N/A"}`,
            }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "Descrição de Danos Causados", bold: true }),
            new Paragraph({ text: data.DamageCausedDescription || "N/A" }),

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
            new Paragraph({
              text: data.RootCause?.contributingFactors || "N/A",
            }),

            new Paragraph({ text: "Tipo de Causa", bold: true }),
            new Paragraph({ text: `Tipo: ${names.typeName}` }),
            new Paragraph({ text: `Categoria: ${names.categoryName}` }),
            new Paragraph({ text: `Subcategoria: ${names.subcategoryName}` }),

            new Paragraph({ text: "Medidas Mitigatorias", bold: true }),
            new Paragraph({
              text: `${data.RootCause?.mitigatingmeasures || "N/A"}`,
            }),

            new Paragraph({ text: "Outras Ações Preventivas", bold: true }),
            new Paragraph({
              text: `${data.RootCause?.preventiveactions || "N/A"}`,
            }),

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

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "RelatorioAcidente.docx");
    console.log("✅ Relatório gerado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao gerar o relatório:", error);
    throw error; // Propaga o erro para ser tratado no chamador
  }
}
