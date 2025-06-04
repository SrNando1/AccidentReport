import { Alert, Platform } from "react-native";

export const showExportOptions = async () => {
  const isWeb = Platform.OS === "web";

  const handleGenerateReport = async ({ share }) => {
    try {
      if (isWeb) {
        const { generateWordReportWeb } = require("../utils/generateWordWeb");
        await generateWordReportWeb();
        window.alert("Relatório descarregado com sucesso!");
      } else {
        const { generateWordReport } = require("../utils/generateWord");
        const fileUri = await generateWordReport(share);
        if (share) {
          // Partilha feita dentro da generateWordReport
        } else {
          console.log("Relatório guardado em:", fileUri);
          Alert.alert("Sucesso", "Relatório guardado com sucesso!");
        }
      }
    } catch (error) {
      console.error("Erro ao gerar o relatório:", error);
      isWeb
        ? window.alert("Erro ao gerar o relatório.")
        : Alert.alert("Erro", "Não foi possível gerar o relatório.");
    }
  };

  // Web: gera automaticamente, não mostra Alert
  if (isWeb) {
    await handleGenerateReport({ share: false }); // ou true, conforme tua lógica
    return;
  }

  // Mobile: mostra opções
  Alert.alert(
    "Exportar Relatório",
    "Escolha como deseja exportar o relatório:",
    [
      {
        text: "Partilhar",
        onPress: () => handleGenerateReport({ share: true }),
      },
      {
        text: "Guardar",
        onPress: () => handleGenerateReport({ share: false }),
      },
      { text: "Cancelar", style: "cancel" },
    ],
    { cancelable: true }
  );
};
