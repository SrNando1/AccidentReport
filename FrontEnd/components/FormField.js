import React from "react";
import { TextInput } from "react-native";
import { useReportField } from "../src/hooks/useReportField"; // ajuste o path conforme seu projeto

export default function FormField({
  name,
  value: vProp,
  onChangeText: cProp,
  ...props
}) {
  const [v, c] = useReportField(name);
  return (
    <TextInput value={vProp ?? v ?? ""} onChangeText={cProp ?? c} {...props} />
  );
}
