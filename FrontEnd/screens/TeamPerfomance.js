import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuTopBar from "../components/MenuTopBar";
import { LineChart } from "react-native-chart-kit";

const API_URL = "http://localhost:3000";

const daysOptions = [7, 14, 30];
const stateOptions = [
  { key: "all", label: "All" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

export default function TeamPerfomance({ navigation }) {
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [raw, setRaw] = useState([]); // lista bruta de /list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [days, setDays] = useState(7);
  const [stateFilter, setStateFilter] = useState("all"); // "all" | "APPROVED" | "REJECTED"

  const toggleMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const name = (await AsyncStorage.getItem("userName")) || "";
        setUserName(name);

        const res = await fetch(`${API_URL}/api/upload/list`);
        if (!res.ok) throw new Error("Falha ao obter lista de reports");
        const data = await res.json();
        setRaw(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // util: YYYY-MM-DD
  const dayKey = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // janela dos Latest Ndays (inclui hoje)
  const lastNDays = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      arr.push(dayKey(d.toISOString()));
    }
    return arr;
  }, [days]);

  // agrega por dia conforme filtro de state
  const series = useMemo(() => {
    const counts = Object.fromEntries(lastNDays.map((k) => [k, 0]));
    for (const r of raw) {
      const k = dayKey(r.datetime || r.created_at);
      if (!k || !(k in counts)) continue;

      const st = String(r.state || "").toUpperCase();
      if (stateFilter === "all" || st === stateFilter) {
        counts[k] += 1;
      }
    }
    const labels = lastNDays.map((k) => k.slice(5)); // "MM-DD"
    const data = lastNDays.map((k) => counts[k]);
    const total = data.reduce((a, b) => a + b, 0);
    return { labels, data, total };
  }, [raw, lastNDays, stateFilter]);

  const width = Dimensions.get("window").width - 24; // padding lateral
  const chartConfig = {
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    propsForDots: { r: "3" },
  };

  return (
    <View style={styles.container}>
      <MenuTopBar
        userName={userName}
        showMenu={showMenu}
        toggleMenu={toggleMenu}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Team Performance</Text>

        {/* filtros */}
        <View style={styles.filtersRow}>
          <View style={styles.segment}>
            {daysOptions.map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setDays(n)}
                style={[
                  styles.segmentBtn,
                  days === n && styles.segmentBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    days === n && styles.segmentTextActive,
                  ]}
                >
                  {n} days
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.segment}>
            {stateOptions.map((o) => (
              <TouchableOpacity
                key={o.key}
                onPress={() => setStateFilter(o.key)}
                style={[
                  styles.segmentBtn,
                  stateFilter === o.key && styles.segmentBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    stateFilter === o.key && styles.segmentTextActive,
                  ]}
                >
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* conteúdo */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <View style={styles.kpi}>
              <Text style={styles.kpiLabel}>Total for the period</Text>
              <Text style={styles.kpiValue}>{series.total}</Text>
            </View>

            <LineChart
              data={{
                labels: series.labels,
                datasets: [{ data: series.data }],
              }}
              width={width}
              height={240}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              fromZero
              transparent
            />

            <Text style={styles.caption}>
              {stateFilter === "all"
                ? "All reports"
                : `Only ${stateOptions
                    .find((s) => s.key === stateFilter)
                    ?.label?.toLowerCase()}`}
              {"  ·  "}
              Latest {days}days
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 12, paddingBottom: 32 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 12,
  },
  filtersRow: { gap: 12 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 4,
    alignSelf: "center",
    gap: 4,
  },
  segmentBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  segmentBtnActive: { backgroundColor: "#fff", elevation: 2 },
  segmentText: { fontWeight: "600", color: "#444" },
  segmentTextActive: { color: "#000" },
  kpi: {
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 6,
    alignItems: "center",
  },
  kpiLabel: { fontSize: 12, color: "#666" },
  kpiValue: { fontSize: 28, fontWeight: "800" },
  chart: { marginTop: 8, borderRadius: 12 },
  caption: { textAlign: "center", marginTop: 8, color: "#666" },
  error: { color: "crimson", textAlign: "center", marginTop: 12 },
});
