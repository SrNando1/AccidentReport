// screens/UncompletedReports.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuTopBar from "../components/MenuTopBar";
import { loadDraftFromBackend } from "../utils/draftService";
// Se tiver esta função no seu store, descomente a linha abaixo:
import { setReportData } from "../data/reportData"; // opcional

const API_URL = "http://localhost:3000";

const UncompletedReports = ({ navigation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const name = (await AsyncStorage.getItem("userName")) || "";
        if (!name) throw new Error("Usuário não logado");
        setUserName(name);

        // 👉 agora buscamos DRAFTS no backend
        const res = await fetch(
          `${API_URL}/api/reports/drafts?user=${encodeURIComponent(name)}`,
        );
        if (!res.ok) throw new Error("Erro ao buscar rascunhos");
        const data = await res.json();
        setDrafts(data); // [{report_number, user, status, updated_at}, ...]
      } catch (err) {
        console.error("Erro ao carregar rascunhos:", err);
        setError("Não foi possível carregar os rascunhos.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  const resumeDraft = async (reportNumber) => {
    try {
      await AsyncStorage.setItem("nextReportNumber", reportNumber);

      const draft = await loadDraftFromBackend(reportNumber);
      const payload =
        typeof draft?.data === "string" ? JSON.parse(draft.data) : draft?.data;

      // 👉 injeta TUDO no store (substituição completa)
      await setReportData(payload, { merge: false, keepLocalFiles: true });

      navigation.navigate("CheckListVehicle", { fromDraft: true });
    } catch (err) {
      console.error("Erro ao abrir rascunho:", err);
      Alert.alert("Erro", "Não foi possível abrir o rascunho.");
    }
  };

  return (
    <View style={styles.container}>
      <MenuTopBar
        userName={userName}
        showMenu={showMenu}
        toggleMenu={toggleMenu}
        navigation={navigation}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Rascunhos de Relatórios</Text>
      </View>

      {loading && (
        <Text style={styles.statusText}>Carregando rascunhos...</Text>
      )}
      {error && (
        <Text style={[styles.statusText, styles.errorText]}>{error}</Text>
      )}

      {!loading && !error && (
        <ScrollView contentContainerStyle={styles.list}>
          {drafts.length === 0 && (
            <Text style={styles.statusText}>Sem rascunhos no momento.</Text>
          )}

          {drafts.map((d) => {
            const dt = d.updated_at
              ? new Date(d.updated_at).toLocaleString()
              : "—";
            return (
              <TouchableOpacity
                key={d.report_number}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => resumeDraft(d.report_number)}
              >
                <View style={styles.left}>
                  <Text style={styles.number}>{d.report_number}</Text>
                  <Text style={styles.label}>Last updated</Text>
                  <Text style={styles.value}>{dt}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.badge}>Draft</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  statusText: { textAlign: "center", marginTop: 20, color: "#666" },
  errorText: { color: "red" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    marginBottom: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  left: { flex: 1 },
  right: { marginLeft: 12, alignItems: "flex-end" },
  number: { fontSize: 18, fontWeight: "700", color: "#222" },
  label: { fontSize: 12, marginTop: 6, color: "#666" },
  value: { fontSize: 14, fontWeight: "500", color: "#333" },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "#ffb100",
    color: "#222",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
});

export default UncompletedReports;
