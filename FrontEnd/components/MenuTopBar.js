import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import { logout } from "../utils/logoutHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import eventBus from "../utils/eventBus";
import { clearReportData } from "../data/reportData";

// base simples para o backend
const API_BASE = "http://localhost:3000/api";

const operatorMenuItems = [
  {
    key: "New Reports",
    label: "New Reports",
    icon: require("../assets/newreport.png"),
    screen: "CheckListVehicle",
  },
  {
    key: "vehicle",
    label: "Vehicle",
    icon: require("../assets/truck.png"),
    screen: "ChangeVehicle",
  },
  {
    key: "Completed Reports",
    label: "Completed Reports",
    icon: require("../assets/completreports.png"),
    screen: "CompletedReports",
  },
  {
    key: " Uncompleted Reports",
    label: "Uncompleted Reports",
    icon: require("../assets/completreports.png"),
    screen: "UncompletedReports",
  },
  {
    key: "Logout",
    label: "Logout",
    icon: require("../assets/logout.png"),
    action: "logout",
  },

  // Adicione mais itens conforme necessário
];

const supervisorMenuItems = [
  {
    key: "New Reports",
    label: "New Reports",
    icon: require("../assets/newreport.png"),
    screen: "CheckListVehicle",
  },
  {
    key: "shift",
    label: "Shift",
    icon: require("../assets/truck.png"),
    screen: "ChangeVehicle",
  },
  {
    key: "mycompletedreports",
    label: "My Completed Reports",
    icon: require("../assets/completreports.png"),
    screen: "CompletedReports",
    params: { scope: "mine", status: "completed" },
  },
  {
    key: "myuncompletedreports",
    label: "My Uncompleted Reports",
    icon: require("../assets/completreports.png"),
    screen: "CompletedReports",
    params: { scope: "mine", status: "uncompleted" },
  },
  {
    key: "teamReports",
    label: "Team Reports",
    icon: require("../assets/completreports.png"),
    screen: "CompletedReports",
    params: { scope: "team", status: "approved" },
  },
  {
    key: "pendingApprovals",
    label: "Pending Approvals",
    icon: require("../assets/completreports.png"),
    screen: "CompletedReports",
    params: { scope: "team", status: "pending" },
  },
  {
    key: "performance",
    label: "Team Performance",
    icon: require("../assets/completreports.png"),
    screen: "TeamPerfomance",
  },
  {
    key: "alerts",
    label: "Critical Alerts",
    icon: require("../assets/completreports.png"),
    screen: "CompletedReports",
    params: { scope: "team", status: "critical" },
  },
  {
    key: "Logout",
    label: "Logout",
    icon: require("../assets/completreports.png"),
    action: "logout",
  },
];

const adminMenuItems = [
  {
    key: "teamReports",
    label: "Team Reports",
    icon: require("../assets/completreports.png"),
    screen: "TeamReports",
  },
  {
    key: "pendingApprovals",
    label: "Pending Approvals",
    icon: require("../assets/completreports.png"),
    screen: "PendingApprovals",
  },
  {
    key: "performance",
    label: "Team Performance",
    icon: require("../assets/completreports.png"),
    screen: "PerformanceDashboard",
  },
  {
    key: "alerts",
    label: "Critical Alerts",
    icon: require("../assets/completreports.png"),
    screen: "Alerts",
  },
  {
    key: "Logout",
    label: "Logout",
    icon: require("../assets/completreports.png"),
    action: "logout",
  },
];

// Bolinha sobre o ícone (só aparece se count > 1)
const IconBadge = ({ count = 0, children }) => (
  <View style={{ position: "relative" }}>
    {children}
    {count > 1 && (
      <View style={styles.iconBadge}>
        <Text style={styles.iconBadgeText}>
          {count > 99 ? "99+" : String(count)}
        </Text>
      </View>
    )}
  </View>
);

const MenuTopBar = ({ showMenu, toggleMenu, navigation }) => {
  const [userName, setUserName] = useState(""); // <-- Adicionado corretamente aqui
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [role, setRole] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [counts, setCounts] = useState({});
  const normalizedRole = (role || "").toString().trim().toUpperCase();

  const dashboardTitle =
    normalizedRole === "AERO"
      ? "Aerofuller Dashboard"
      : normalizedRole === "SUP"
        ? "Supervisor Dashboard"
        : normalizedRole === "ADMIN"
          ? "Administrator Dashboard"
          : "Aerofuller Dashboard"; // default

  useEffect(() => {
    let isMounted = true;

    const onVehicleChanged = (vehicleLabel) => {
      if (!isMounted) return;
      setSelectedVehicle(String(vehicleLabel || ""));
    };
    const onShiftChanged = (shift) => {
      if (!isMounted) return;
      setSelectedShift(String(shift || ""));
    };
    eventBus.on("vehicleChanged", onVehicleChanged);
    eventBus.on("shiftChanged", onShiftChanged);

    const loadData = async () => {
      try {
        // lê tudo em paralelo
        const [
          rawUser,
          legacyName,
          plate,
          selShift,
          turnShift,
          turnShiftSnake,
        ] = await Promise.all([
          AsyncStorage.getItem("user"),
          AsyncStorage.getItem("userName"), // chave antiga
          AsyncStorage.getItem("selectedPlate"), // veículo
          AsyncStorage.getItem("selectedShift"),
          AsyncStorage.getItem("turnShift"),
          AsyncStorage.getItem("turn_shift"),
        ]);
        const shiftVal = selShift || turnShift || turnShiftSnake || "";
        if (shiftVal) setSelectedShift(shiftVal);

        let name = "";
        let userRole = "";

        if (rawUser) {
          try {
            const u = JSON.parse(rawUser);
            name = u?.name ?? "";
            userRole = u?.role ?? ""; // AERO | SUP | ADMIN (ou vazio)
          } catch (e) {
            console.warn("user JSON parse error:", e);
          }
        }

        // fallback para o nome antigo, se necessário
        if (!name && legacyName) name = legacyName;

        if (isMounted) {
          if (name) setUserName(name);
          if (userRole) setRole(userRole);
          if (plate) setSelectedVehicle(plate);
        }
      } catch (e) {
        console.warn("loadData error:", e);
      }
    };

    loadData();

    const listener = (vehicleLabel) => setSelectedVehicle(vehicleLabel);
    eventBus.on("vehicleChanged", listener);

    return () => {
      isMounted = false;
      eventBus.off("vehicleChanged", onVehicleChanged);
      eventBus.off("shiftChanged", onShiftChanged);
    };
  }, []);

  // helpers simples
  const isPending = (r) => String(r.state).toUpperCase() === "PENDING";
  const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const inCriticalRange = (level) => {
    const n = toNum(level);
    return n >= 15 && n <= 25;
  };

  // Busca reports + drafts e calcula contagens relevantes
  const refreshCounts = async () => {
    try {
      // vamos buscar All reports e depois filtramos
      const [reportsRes, draftsRes] = await Promise.all([
        fetch(`${API_BASE}/upload/list`),
        fetch(`${API_BASE}/drafts/list`).catch(() => null), // drafts pode não existir; tratamos abaixo
      ]);

      const reportsJson = await reportsRes.json();
      const reports = Array.isArray(reportsJson)
        ? reportsJson
        : reportsJson?.data || [];

      let drafts = [];
      if (draftsRes && draftsRes.ok) {
        const draftsJson = await draftsRes.json();
        drafts = Array.isArray(draftsJson)
          ? draftsJson
          : draftsJson?.data || [];
      }

      // filtros (podes apertar por turno se quiseres)
      const pendings = reports.filter(isPending);
      const criticals = reports.filter(
        (r) => isPending(r) && inCriticalRange(r.level),
      );

      // rascunhos apenas do utilizador logado (se houver nome)
      const myDrafts = userName
        ? drafts.filter(
            (d) =>
              String(d?.user || d?.author || "").trim() ===
              String(userName).trim(),
          )
        : drafts;

      setCounts({
        // supervisão
        pendingApprovals: pendings.length,
        alerts: criticals.length,
        // pessoal
        myuncompletedreports: myDrafts.length,
        // (ex.: poderias ter outros, como mycompletedreports, teamReports, etc.)
      });
    } catch (e) {
      console.warn("[MenuTopBar] refreshCounts error:", e);
    }
  };

  // Atualiza ao montar e quando o turno mudar (outra vista de equipa)
  useEffect(() => {
    refreshCounts();
    // opcional: reage a eventos (quando um report muda)
    const onAnyChange = () => refreshCounts();
    eventBus.on("reportsChanged", onAnyChange);
    eventBus.on("draftsChanged", onAnyChange);
    return () => {
      eventBus.off("reportsChanged", onAnyChange);
      eventBus.off("draftsChanged", onAnyChange);
    };
    // inclui dependências que mexem no filtro "de equipa"
  }, [selectedShift, userName]);

  // Decide o menu conforme o role
  let itemsToShow = operatorMenuItems;
  if (role === "SUP") {
    itemsToShow = supervisorMenuItems;
  } else if (role === "ADMIN") {
    itemsToShow = adminMenuItems;
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <TouchableOpacity
        style={[styles.topBar, showMenu && styles.topBarActive]}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Text style={styles.topBarTitle}>{dashboardTitle}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.topBarText}>Operator: {userName}</Text>
          {normalizedRole !== "ADMIN" && (
            <Text style={styles.topBarText}>
              {normalizedRole === "SUP"
                ? `Shift: ${selectedShift || "-"}`
                : `Vehicle: ${selectedVehicle || "-"}`}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Menu horizontal */}
      {showMenu && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={Platform.OS !== "android"}
          contentContainerStyle={styles.menuContentContainer}
          style={styles.menuContainer}
        >
          {itemsToShow.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={async () => {
                if (item.action === "logout") {
                  await clearReportData();
                  await logout(navigation);
                } else if (item.screen) {
                  navigation.navigate(item.screen, item.params || {});
                }
              }}
            >
              <IconBadge count={counts[item.key] || 0}>
                <Image
                  source={item.icon}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
              </IconBadge>
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default MenuTopBar;

const styles = StyleSheet.create({
  topBar: {
    // de "row" para "column" para colocar o título por cima
    flexDirection: "column",
    backgroundColor: "#a10000ff",
    paddingVertical: 12,
    // "left" não é válido em RN — usa flex-start
    alignItems: "flex-start",
    paddingHorizontal: 10,
    gap: 4, // pequeno espaço entre título e linha de info (opcional)
  },

  topBarActive: {
    backgroundColor: "red",
  },

  // novo: título maior, branco, com contorno (via sombra curta)
  topBarTitle: {
    color: "#fff",
    fontSize: 20, // ligeiramente maior
    fontWeight: "bold",
    textShadowColor: "#000", // “contorno” preto subtil
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    paddingHorizontal: 10,
  },

  // nova linha para role + vehicle lado a lado
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  topBarText: {
    paddingHorizontal: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  menuContainer: {
    width: "100%",
    maxHeight: Platform.OS === "web" ? 100 : 80,
  },
  menuContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#a10000ff",
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  menuItem: {
    alignItems: "center",
    paddingHorizontal: 50,
    paddingVertical: 50,
  },
  menuIcon: {
    width: 50,
    height: 50,
  },
  menuText: {
    marginTop: 5,
    fontSize: 12,
    color: "#ffffffff",
  },
  iconBadge: {
    position: "absolute",
    right: -2, // ajusta conforme o teu ícone
    top: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#e53935",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  iconBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
