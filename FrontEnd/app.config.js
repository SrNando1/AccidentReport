// app.config.js
import "dotenv/config";

// Configuração dinâmica do Expo
export default ({ config }) => ({
  // Identificadores do projeto (devClient e EAS)
  name: "AccidentReport",
  slug: "AccidentReport",
  version: config.version,

  // Ícone e splash (só resolvidos em Managed, mas ok se mantidos)
  icon: "./assets/AccidentReportIcon.png",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  // Configurações nativas são lidas diretamente em android/ e ios/
  extra: {
    eas: {
      projectId: "57978877-9df4-41d7-b908-3c9fa35906d7",
    },
  },
});
