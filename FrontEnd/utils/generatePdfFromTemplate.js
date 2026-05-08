import * as PDFLib from "pdf-lib/dist/pdf-lib.min.js";
import { Asset } from "expo-asset";
import { causeData } from "../data/rootCauseData";

const getRiskColor = (risk) => {
  if (risk <= 4) return PDFLib.rgb(0.2, 0.7, 0.2); // verde
  if (risk <= 8) return PDFLib.rgb(0.9, 0.7, 0); // amarelo
  return PDFLib.rgb(0.8, 0.2, 0.2); // vermelho
};

const { PDFDocument, StandardFonts } = PDFLib;

const PAGE1_FIELDS = {
  /*textY +5*/

  summary: {
    x: 167, //Início da caixa no eixo horizontal (esquerda → direita)
    y: 709, //Base da caixa (de baixo → cima)
    w: 363, //Largura da caixa
    h: 14, //Altura da caixa
    textX: 167, //Onde o texto começa no eixo X
    textY: 718, //Onde o texto começa no eixo Y
    label: "summary",
  },
  vehicleA: {
    x: 185,
    y: 626,
    w: 345,
    h: 14,
    textX: 185,
    textY: 634,
    label: "vehicleA",
  },
  falsecA: {
    x: 251,
    y: 602,
    w: 279,
    h: 14,
    textX: 251,
    textY: 610,
    label: "falsecA",
  },
  enterpriseA: {
    x: 203,
    y: 577,
    w: 326,
    h: 14,
    textX: 203,
    textY: 585,
    label: "enterpriseA",
  },
  vehicleB: {
    x: 185,
    y: 485,
    w: 344,
    h: 14,
    textX: 185,
    textY: 493,
    label: "vehicleB",
  },
  DamageCausedDescription: {
    x: 70,
    y: 180,
    w: 470,
    h: 55,
    textX: 65,
    textY: 183,
    label: "DamageCausedDescription",
  },
  falsecB: {
    x: 250,
    y: 462,
    w: 276,
    h: 14,
    textX: 250,
    textY: 471,
    label: "falsecB",
  },
  enterpriseB: {
    x: 200,
    y: 437,
    w: 326,
    h: 14,
    textX: 200,
    textY: 446,
    label: "enterpriseB",
  },
  dateofoccurrence: {
    x: 151,
    y: 345,
    w: 376,
    h: 14,
    textX: 151,
    textY: 354,
    label: "dateofoccurrence",
  },
  timeofoccurrence: {
    x: 151,
    y: 321,
    w: 377,
    h: 14,
    textX: 151,
    textY: 330,
    label: "timeofoccurrence",
  },
  placeofoccurrence: {
    x: 180,
    y: 297,
    w: 348,
    h: 14,
    textX: 180,
    textY: 306,
    label: "placeofoccurrence",
  },
};
const PAGE2_FIELDS = {
  driverAName: {
    x: 160,
    y: 653,
    w: 370,
    h: 14,
    textX: 160,
    textY: 662,
    label: "driverAName",
  },
  driverAEnterprise: {
    x: 199,
    y: 629,
    w: 333,
    h: 14,
    textX: 199,
    textY: 638,
    label: "driverAEnterprise",
  },
  driverAEmployeeNumber: {
    x: 277,
    y: 605,
    w: 255,
    h: 14,
    textX: 277,
    textY: 614,
    label: "driverAEmployeeNumber",
  },
  driverAEmployeeFunction: {
    x: 197,
    y: 582,
    w: 332,
    h: 14,
    textX: 197,
    textY: 591,
    label: "driverAEmployeeFunction",
  },
  driverALicenseNumberANA: {
    x: 302,
    y: 558,
    w: 229,
    h: 14,
    textX: 302,
    textY: 567,
    label: "driverALicenseNumberANA",
  },
  driverAValidityANA: {
    x: 367,
    y: 534,
    w: 163,
    h: 14,
    textX: 367,
    textY: 543,
    label: "driverAValidityANA",
  },
  driverACategoryANA: {
    x: 296,
    y: 510,
    w: 235,
    h: 14,
    textX: 296,
    textY: 519,
    label: "driverACategoryANA",
  },
  driverACivilLicenseNumber: {
    x: 305,
    y: 486,
    w: 225,
    h: 14,
    textX: 305,
    textY: 495,
    label: "driverACivilLicenseNumber",
  },
  driverAValidityCivil: {
    x: 363,
    y: 463,
    w: 168,
    h: 14,
    textX: 363,
    textY: 472,
    label: "driverAValidityCivil",
  },
  driverACategoryCivil: {
    x: 293,
    y: 439,
    w: 237,
    h: 14,
    textX: 293,
    textY: 448,
    label: "driverACategoryCivil",
  },
  driverAAdmitionDate: {
    x: 270,
    y: 415,
    w: 260,
    h: 14,
    textX: 270,
    textY: 424,
    label: "driverAAdmitionDate",
  },
  driverAContractType: {
    x: 256,
    y: 391,
    w: 274,
    h: 14,
    textX: 256,
    textY: 400,
    label: "driverAContractType",
  },
  driverAFormation: {
    x: 244,
    y: 367,
    w: 286,
    h: 14,
    textX: 244,
    textY: 376,
    label: "driverAFormation",
  },
  driverAShiftTime: {
    x: 253,
    y: 344,
    w: 277,
    h: 14,
    textX: 253,
    textY: 353,
    label: "driverAShiftTime",
  },
  driverADayShift: {
    x: 207,
    y: 320,
    w: 323,
    h: 14,
    textX: 207,
    textY: 329,
    label: "driverADayShift",
  },
  driverADaysOff: {
    x: 329,
    y: 295,
    w: 201,
    h: 14,
    textX: 329,
    textY: 304,
    label: "driverADaysOff",
  },
  driverABreaks: {
    x: 351,
    y: 272,
    w: 179,
    h: 14,
    textX: 351,
    textY: 281,
    label: "driverABreaks",
  },
  driverAIncidentHistory: {
    x: 262,
    y: 248,
    w: 268,
    h: 14,
    textX: 262,
    textY: 257,
    label: "driverAIncidentHistory",
  },
  driverADescriptionFactsOperator: {
    x: 69,
    y: 133,
    w: 461,
    h: 90,
    textX: 74,
    textY: 136,
    label: "driverADescriptionFactsOperator",
  },
};
const PAGE3_FIELDS = {
  driverBName: {
    x: 160,
    y: 653,
    w: 370,
    h: 14,
    textX: 160,
    textY: 662,
    label: "driverBName",
  },
  driverBEnterprise: {
    x: 199,
    y: 629,
    w: 333,
    h: 14,
    textX: 199,
    textY: 638,
    label: "driverBEnterprise",
  },
  driverBEmployeeNumber: {
    x: 277,
    y: 605,
    w: 255,
    h: 14,
    textX: 277,
    textY: 614,
    label: "driverBEmployeeNumber",
  },
  driverBEmployeeFunction: {
    x: 197,
    y: 582,
    w: 332,
    h: 14,
    textX: 197,
    textY: 591,
    label: "driverBEmployeeFunction",
  },
  driverBLicenseNumberANA: {
    x: 302,
    y: 558,
    w: 229,
    h: 14,
    textX: 302,
    textY: 567,
    label: "driverBLicenseNumberANA",
  },
  driverBValidityANA: {
    x: 367,
    y: 534,
    w: 163,
    h: 14,
    textX: 367,
    textY: 543,
    label: "driverBValidityANA",
  },
  driverBCategoryANA: {
    x: 296,
    y: 510,
    w: 235,
    h: 14,
    textX: 296,
    textY: 519,
    label: "driverBCategoryANA",
  },
  driverBCivilLicenseNumber: {
    x: 305,
    y: 486,
    w: 225,
    h: 14,
    textX: 305,
    textY: 495,
    label: "driverBCivilLicenseNumber",
  },
  driverBValidityCivil: {
    x: 363,
    y: 463,
    w: 168,
    h: 14,
    textX: 363,
    textY: 472,
    label: "driverBValidityCivil",
  },
  driverBCategoryCivil: {
    x: 293,
    y: 439,
    w: 237,
    h: 14,
    textX: 293,
    textY: 448,
    label: "driverBCategoryCivil",
  },
  driverBAdmitionDate: {
    x: 270,
    y: 415,
    w: 260,
    h: 14,
    textX: 270,
    textY: 424,
    label: "driverBAdmitionDate",
  },
  driverBContractType: {
    x: 256,
    y: 391,
    w: 274,
    h: 14,
    textX: 256,
    textY: 400,
    label: "driverBContractType",
  },
  driverBFormation: {
    x: 244,
    y: 367,
    w: 286,
    h: 14,
    textX: 244,
    textY: 376,
    label: "driverBFormation",
  },
  driverBShiftTime: {
    x: 253,
    y: 344,
    w: 277,
    h: 14,
    textX: 253,
    textY: 353,
    label: "driverBShiftTime",
  },
  driverBDayShift: {
    x: 207,
    y: 320,
    w: 323,
    h: 14,
    textX: 207,
    textY: 329,
    label: "driverBDayShift",
  },
  driverBDaysOff: {
    x: 329,
    y: 295,
    w: 201,
    h: 14,
    textX: 329,
    textY: 304,
    label: "driverBDaysOff",
  },
  driverBBreaks: {
    x: 351,
    y: 272,
    w: 179,
    h: 14,
    textX: 351,
    textY: 281,
    label: "driverBBreaks",
  },
  driverBIncidentHistory: {
    x: 262,
    y: 248,
    w: 268,
    h: 14,
    textX: 262,
    textY: 257,
    label: "driverBIncidentHistory",
  },
  driverBDescriptionFactsOperator: {
    x: 69,
    y: 133,
    w: 461,
    h: 90,
    textX: 74,
    textY: 136,
    label: "driverBDescriptionFactsOperator",
  },
};
const PAGE4_FIELDS = {
  contributingFactors: {
    x: 252,
    y: 671,
    w: 278,
    h: 14,
    textX: 252,
    textY: 680,
    label: "contributingFactors",
  },
  rootCauseType: {
    x: 111,
    y: 601,
    w: 418,
    h: 14,
    textX: 111,
    textY: 610,
    label: "rootCauseType",
  },
  rootCauseCategory: {
    x: 147,
    y: 577,
    w: 384,
    h: 14,
    textX: 147,
    textY: 586,
    label: "rootCauseCategory",
  },
  rootCauseSubcategory: {
    x: 172,
    y: 554,
    w: 360,
    h: 14,
    textX: 172,
    textY: 563,
    label: "rootCauseSubcategory",
  },
  preventiveactions: {
    x: 69,
    y: 428,
    w: 459,
    h: 74,
    textX: 74,
    textY: 431,
    label: "preventiveactions",
  },
};
const PAGE5_FIELDS = {
  severityLevel: {
    x: 368,
    y: 672,
    w: 164,
    h: 14,
    textX: 368,
    textY: 681,
    label: "severityLevel",
  },
  frequencyLevel: {
    x: 343,
    y: 648,
    w: 191,
    h: 14,
    textX: 343,
    textY: 657,
    label: "frequencyLevel",
  },
  riskLevel: {
    x: 254,
    y: 581,
    w: 280,
    h: 14,
    textX: 254,
    textY: 590,
    label: "riskLevel",
  },
  requiredActions: {
    x: 297,
    y: 558,
    w: 238,
    h: 14,
    textX: 297,
    textY: 567,
    label: "requiredActions",
  },
  mitigatingmeasures: {
    x: 269,
    y: 517,
    w: 265,
    h: 14,
    textX: 269,
    textY: 526,
    label: "mitigatingmeasures",
  },
  severityActionLevel: {
    x: 306,
    y: 476,
    w: 227,
    h: 14,
    textX: 306,
    textY: 485,
    label: "severityActionLevel",
  },
  frequencyActionLevel: {
    x: 294,
    y: 453,
    w: 240,
    h: 14,
    textX: 294,
    textY: 462,
    label: "frequencyActionLevel",
  },
  finalAcceptability: {
    x: 279,
    y: 388,
    w: 254,
    h: 14,
    textX: 279,
    textY: 397,
    label: "finalAcceptability",
  },
  finalRisk: {
    x: 347,
    y: 430,
    w: 188,
    h: 14,
    textX: 347,
    textY: 439,
    label: "finalRisk",
  },
  conclusion: {
    x: 70,
    y: 261,
    w: 462,
    h: 80,
    textX: 70,
    textY: 270,
    label: "conclusion",
  },
};

function drawField(page, value, field, font, size = 10) {
  const text = String(value || "");
  const maxWidth = field.w - 10; // margem interna

  const words = text.split(" ");
  let lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? currentLine + " " + word : word;
    const width = font.widthOfTextAtSize(testLine, size);

    if (width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);

  const maxLines = Math.floor(field.h / (size + 2));
  lines = lines.slice(0, maxLines);

  // desenhar linhas (de cima para baixo)
  let y = field.y + field.h - size;

  lines.forEach((line) => {
    page.drawText(line, {
      x: field.textX,
      y,
      size,
      font,
    });

    y -= size + 2; // espaço entre linhas
  });
}

function getCauseTypeName(typeId) {
  return (
    causeData.types.find((t) => String(t.id) === String(typeId))?.name || ""
  );
}

function getCauseCategoryName(typeId, categoryId) {
  const categories = causeData.categories[String(typeId)] || [];
  return (
    categories.find((c) => String(c.id) === String(categoryId))?.name || ""
  );
}

function getCauseSubcategoryName(typeId, categoryId, subcategoryId) {
  if (!typeId || !categoryId) return "";
  const subKey = `${typeId}-${String(categoryId).split("-")[1]}`;
  const subcategories = causeData.subcategories[subKey] || [];
  return (
    subcategories.find((s) => String(s.id) === String(subcategoryId))?.name ||
    ""
  );
}

async function loadTemplateBytes() {
  const asset = Asset.fromModule(
    require("../assets/AccidentReportTemplate.pdf"),
  );

  await asset.downloadAsync();

  const uri = asset.localUri || asset.uri;
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error("Não foi possível carregar o template PDF.");
  }

  return await response.arrayBuffer();
}

function drawMitigationSections(pdfDoc, firstPage, sections, font) {
  const maxSectionsOnFirstPage = 1;
  const maxSectionsPerExtraPage = 3;

  const drawSection = (page, section, indexLabel, baseY) => {
    const suffix = indexLabel === 0 ? "" : `.${indexLabel}`;

    page.drawText(`9.5${suffix}. Mitigation Measures`, {
      x: 70,
      y: baseY + 34,
      size: 9,
      font,
    });

    drawField(
      page,
      section.mitigatingmeasures || "",
      {
        x: 269,
        y: baseY + 18,
        w: 265,
        h: 14,
        textX: 269,
        textY: baseY + 27,
      },
      font,
    );

    page.drawText(`9.6${suffix}. Severity of the Action`, {
      x: 70,
      y: baseY - 6,
      size: 9,
      font,
    });

    drawField(
      page,
      section.actionseverity || "",
      {
        x: 306,
        y: baseY - 22,
        w: 227,
        h: 14,
        textX: 306,
        textY: baseY - 13,
      },
      font,
    );

    page.drawText(`9.7${suffix}. Frequency of Action`, {
      x: 70,
      y: baseY - 30,
      size: 9,
      font,
    });

    drawField(
      page,
      section.actionfrequency || "",
      {
        x: 294,
        y: baseY - 46,
        w: 240,
        h: 14,
        textX: 294,
        textY: baseY - 37,
      },
      font,
    );

    page.drawText(`9.8${suffix}. Residual Risk Level`, {
      x: 70,
      y: baseY - 54,
      size: 9,
      font,
    });

    page.drawText(String(section.finalRisk || ""), {
      x: 347,
      y: baseY - 61,
      size: 10,
      font,
      color: getRiskColor(section.finalRisk || 0),
    });

    page.drawText(`9.9${suffix}. Final Acceptability`, {
      x: 70,
      y: baseY - 78,
      size: 9,
      font,
    });

    drawField(
      page,
      section.finalAcceptability || "",
      {
        x: 279,
        y: baseY - 94,
        w: 254,
        h: 14,
        textX: 279,
        textY: baseY - 85,
      },
      font,
    );

    page.drawText("MITIGATION MEASURES (CONTINUED)", {
      x: 150,
      y: 800,
      size: 12,
      font,
    });

    page.drawText(`SECTION ${indexLabel + 1}`, {
      x: 400,
      y: baseY + 34,
      size: 10,
      font,
    });
  };

  sections.forEach((section, index) => {
    if (index < maxSectionsOnFirstPage) {
      drawSection(firstPage, section, index, 499);
      return;
    }

    const extraIndex = index - maxSectionsOnFirstPage;
    const pageIndex = Math.floor(extraIndex / maxSectionsPerExtraPage);
    const positionInPage = extraIndex % maxSectionsPerExtraPage;

    let page;

    const pages = pdfDoc.getPages();

    if (pages[5 + pageIndex]) {
      page = pages[5 + pageIndex];
    } else {
      page = pdfDoc.addPage([595.28, 841.89]);
    }

    const baseY = 730 - positionInPage * 220;

    drawSection(page, section, index, baseY);
  });
}

export async function generatePdfFromTemplate(data) {
  const templateBytes = await loadTemplateBytes();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page2 = pages[1];
  const page3 = pages[2];
  const page4 = pages[3];
  const page5 = pages[4];

  const mitigationSections =
    data.accidentCharacterization?.mitigationSections?.length > 0
      ? data.accidentCharacterization.mitigationSections
      : [
          {
            mitigatingmeasures:
              data.accidentCharacterization?.mitigatingmeasures || "",
            actionseverity:
              data.accidentCharacterization?.severityActionLevel || "",
            actionfrequency:
              data.accidentCharacterization?.frequencyActionLevel || "",
            finalRisk: data.accidentCharacterization?.finalRisk || "",
            finalAcceptability:
              data.accidentCharacterization?.finalAcceptability || "",
          },
        ];

  drawMitigationSections(pdfDoc, page5, mitigationSections, font);

  drawField(page1, data.summary || "Summary", PAGE1_FIELDS.summary, font);
  drawField(
    page1,
    data.vehicleA || "TESTE VEHICLE A",
    PAGE1_FIELDS.vehicleA,
    font,
  );
  drawField(page1, data.falsecA || "falsecA", PAGE1_FIELDS.falsecA, font);
  drawField(
    page1,
    data.enterpriseA || "enterpriseA",
    PAGE1_FIELDS.enterpriseA,
    font,
  );
  drawField(
    page1,
    data.DamageCausedDescription || "DamageCausedDescription",
    PAGE1_FIELDS.DamageCausedDescription,
    font,
  );
  drawField(page1, data.vehicleB || "vehicleB", PAGE1_FIELDS.vehicleB, font);
  drawField(page1, data.falsecB || "falsecB", PAGE1_FIELDS.falsecB, font);
  drawField(
    page1,
    data.enterpriseB || "enterpriseB",
    PAGE1_FIELDS.enterpriseB,
    font,
  );
  drawField(
    page1,
    data.dateofoccurrence || "dateofoccurrence",
    PAGE1_FIELDS.dateofoccurrence,
    font,
  );
  drawField(
    page1,
    data.timeofoccurrence || "timeofoccurrence",
    PAGE1_FIELDS.timeofoccurrence,
    font,
  );
  drawField(
    page1,
    data.placeofoccurrence || "placeofoccurrence",
    PAGE1_FIELDS.placeofoccurrence,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.name || "",
    PAGE2_FIELDS.driverAName,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.Enterprise || "",
    PAGE2_FIELDS.driverAEnterprise,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.EmployeeNumber || "",
    PAGE2_FIELDS.driverAEmployeeNumber,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.EmployeeFunction || "",
    PAGE2_FIELDS.driverAEmployeeFunction,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.LicenseNumberANA || "",
    PAGE2_FIELDS.driverALicenseNumberANA,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.ValidityANA || "",
    PAGE2_FIELDS.driverAValidityANA,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.CategoryANA || "",
    PAGE2_FIELDS.driverACategoryANA,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.CivilLicenseNumber || "",
    PAGE2_FIELDS.driverACivilLicenseNumber,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.ValidityCivil || "",
    PAGE2_FIELDS.driverAValidityCivil,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.CategoryCivil || "",
    PAGE2_FIELDS.driverACategoryCivil,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.AdmitionDate || "",
    PAGE2_FIELDS.driverAAdmitionDate,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.ContractType || "",
    PAGE2_FIELDS.driverAContractType,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.Formation || "",
    PAGE2_FIELDS.driverAFormation,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.ShiftTime || "",
    PAGE2_FIELDS.driverAShiftTime,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.DayShift || "",
    PAGE2_FIELDS.driverADayShift,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.DaysOff || "",
    PAGE2_FIELDS.driverADaysOff,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.Breaks || "",
    PAGE2_FIELDS.driverABreaks,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.IncidentHistory || "",
    PAGE2_FIELDS.driverAIncidentHistory,
    font,
  );
  drawField(
    page2,
    data?.DataDriverA?.DescriptionFactsOperator || "",
    PAGE2_FIELDS.driverADescriptionFactsOperator,
    font,
  );

  drawField(
    page3,
    data?.DataDriverB?.name || "",
    PAGE3_FIELDS.driverBName,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.Enterprise || "",
    PAGE3_FIELDS.driverBEnterprise,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.EmployeeNumber || "",
    PAGE3_FIELDS.driverBEmployeeNumber,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.EmployeeFunction || "",
    PAGE3_FIELDS.driverBEmployeeFunction,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.LicenseNumberANA || "",
    PAGE3_FIELDS.driverBLicenseNumberANA,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.ValidityANA || "",
    PAGE3_FIELDS.driverBValidityANA,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.CategoryANA || "",
    PAGE3_FIELDS.driverBCategoryANA,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.CivilLicenseNumber || "",
    PAGE3_FIELDS.driverBCivilLicenseNumber,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.ValidityCivil || "",
    PAGE3_FIELDS.driverBValidityCivil,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.CategoryCivil || "",
    PAGE3_FIELDS.driverBCategoryCivil,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.AdmitionDate || "",
    PAGE3_FIELDS.driverBAdmitionDate,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.ContractType || "",
    PAGE3_FIELDS.driverBContractType,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.Formation || "",
    PAGE3_FIELDS.driverBFormation,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.ShiftTime || "",
    PAGE3_FIELDS.driverBShiftTime,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.DayShift || "",
    PAGE3_FIELDS.driverBDayShift,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.DaysOff || "",
    PAGE3_FIELDS.driverBDaysOff,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.Breaks || "",
    PAGE3_FIELDS.driverBBreaks,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.IncidentHistory || "",
    PAGE3_FIELDS.driverBIncidentHistory,
    font,
  );
  drawField(
    page3,
    data?.DataDriverB?.DescriptionFactsOperator || "",
    PAGE3_FIELDS.driverBDescriptionFactsOperator,
    font,
  );
  drawField(
    page4,
    data?.RootCause?.contributingFactors || "",
    PAGE4_FIELDS.contributingFactors,
    font,
  );
  const rootCauseTypeName = getCauseTypeName(data?.RootCause?.rootCauseType);
  const rootCauseCategoryName = getCauseCategoryName(
    data?.RootCause?.rootCauseType,
    data?.RootCause?.rootCauseCategory,
  );
  const rootCauseSubcategoryName = getCauseSubcategoryName(
    data?.RootCause?.rootCauseType,
    data?.RootCause?.rootCauseCategory,
    data?.RootCause?.rootCauseSubcategory,
  );

  drawField(page4, rootCauseTypeName, PAGE4_FIELDS.rootCauseType, font);
  drawField(page4, rootCauseCategoryName, PAGE4_FIELDS.rootCauseCategory, font);
  drawField(
    page4,
    rootCauseSubcategoryName,
    PAGE4_FIELDS.rootCauseSubcategory,
    font,
  );
  drawField(
    page4,
    data?.RootCause?.preventiveactions || "",
    PAGE4_FIELDS.preventiveactions,
    font,
  );
  drawField(
    page5,
    data.accidentCharacterization?.severityLevel || "",
    PAGE5_FIELDS.severityLevel,
    font,
  );
  drawField(
    page5,
    data.accidentCharacterization?.frequencyLevel || "",
    PAGE5_FIELDS.frequencyLevel,
    font,
  );
  drawField(
    page5,
    data.accidentCharacterization?.riskLevel || "",
    PAGE5_FIELDS.riskLevel,
    font,
  );
  drawField(
    page5,
    data.accidentCharacterization?.requiredActions || "",
    PAGE5_FIELDS.requiredActions,
    font,
  );

  const allPages = pdfDoc.getPages();
  let lastPage = allPages[allPages.length - 1];

  if (mitigationSections.length > 1) {
    lastPage = pdfDoc.addPage([595.28, 841.89]);
  }

  drawField(lastPage, data.conclusion || "", PAGE5_FIELDS.conclusion, font);
  return await pdfDoc.save();
}
