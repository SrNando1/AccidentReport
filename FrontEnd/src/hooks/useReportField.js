import { useSyncExternalStore } from "react";
import {
  subscribeReportData,
  getReportDataSnapshot,
  updateReportData,
} from "../../data/reportData";

function getByPath(obj, path) {
  if (!obj || typeof path !== "string") return undefined;
  return path
    .split(".")
    .reduce((acc, k) => (acc && k in acc ? acc[k] : undefined), obj);
}
function buildPatch(path, value) {
  if (typeof path !== "string") return {};
  const parts = path.split(".");
  const root = {};
  let cur = root;
  parts.forEach(
    (k, i) => (cur = i === parts.length - 1 ? (cur[k] = value) : (cur[k] = {}))
  );
  return root;
}
export function useReportField(path, def = "") {
  if (typeof path !== "string" || !path.length) {
    console.warn('[useReportField] prop "name" é obrigatória. Recebido:', path);
    return [def, () => {}];
  }
  const snapshot = useSyncExternalStore(
    subscribeReportData,
    getReportDataSnapshot,
    getReportDataSnapshot
  );
  const value = getByPath(snapshot ?? {}, path);
  const onChange = (v) => updateReportData(buildPatch(path, v));
  return [value ?? def, onChange];
}
