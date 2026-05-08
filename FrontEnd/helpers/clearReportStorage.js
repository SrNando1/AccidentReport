import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearReportData } from "../data/reportData";

// remove apenas chaves relacionadas ao relatório
export async function clearReportKeys() {
  const keys = await AsyncStorage.getAllKeys();
  const prefixes = [
    "report:",
    "reports:",
    "reportData",
    "files:",
    "photos:",
    "videos:",
  ];
  const toRemove = keys.filter((k) =>
    prefixes.some((p) => k.startsWith(p) || k === p)
  );
  if (toRemove.length) await AsyncStorage.multiRemove(toRemove);

  // também zera o store em memória
  await clearReportData();
}
