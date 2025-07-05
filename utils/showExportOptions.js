import { Alert, Platform } from "react-native";

// Função principal de exibição de opções de exportação
export const showExportOptions = async () => {
  console.log("🔧 showExportOptions chamado — Platform.OS:", Platform.OS);

  if (Platform.OS === "web") {
    console.log(
      "🔧 Web branch — chamando handleGenerateReport com share:false"
    );
    await handleGenerateReport({ share: false });
    return;
  }

  // Ramo Mobile: exibe alerta nativo com opções
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

// Função que efetivamente gera o relatório (Web ou Mobile)
const handleGenerateReport = async ({ share }) => {
  console.log("🔧 handleGenerateReport chamado — share:", share);

  try {
    if (Platform.OS === "web") {
      console.log("🔧 Generating Word Web...");
      const { generateWordReportWeb } = require("./generateWordWeb");
      await generateWordReportWeb();
      window.alert("✅ Relatório descarregado com sucesso!");
    } else {
      console.log("🔧 Generating Word Mobile...");
      const { generateWordReport } = require("./generateWord");
      const fileUri = await generateWordReport(share);
      // Aqui você pode adicionar lógica de share ou salvar local no Mobile
    }
  } catch (error) {
    console.error("❌ Erro ao gerar o relatório:", error);
    if (Platform.OS === "web") {
      window.alert("❌ Ocorreu um erro inesperado. Tente novamente.");
    } else {
      Alert.alert("Erro", "Não foi possível gerar o relatório.");
    }
  }
};
