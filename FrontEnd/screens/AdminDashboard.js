// screens/AdminDashboard.js

import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  ScrollView,
  SafeAreaView,
  Dimensions,
  useWindowDimensions,
  TextInput,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { logout } from "../utils/logoutHelper";

import API from "../src/services/api";

const DARK = "#1f2937"; // dark gray
const LIGHT = "#f3f4f6"; // light background for content

const API_URL = "http://localhost:3000";

const AdminDashboard = ({
  navigation,
  logoSource,
  userName = "",
  usersEndpoint = "/api/users",
  loadUsers,
  loadEmployers,
}) => {
  const [displayName, setDisplayName] = useState(userName);
  const [showMenu, setShowMenu] = useState(false);
  const { width } = Dimensions.get("window");
  const isLargeScreen = width >= 768; // keep sidebar fixed open on tablets/web
  const [activeSection, setActiveSection] = useState("statistics");
  const [showEmployerForm, setShowEmployerForm] = useState(false);
  const [newEmployer, setNewEmployer] = useState({
    full_name: "",
    employee_number: "",
    employee_function: "",
    shift: "",
    company: "",
    license_number_ana: "",
    validity_ana: "",
    category_ana: "",
    civil_license_number: "",
    validity_civil: "",
    category_civil: "",
    formation: "",
    region: "",
    birth_date: "",
    contract_date: "",
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [availableEmployers, setAvailableEmployers] = useState([]);

  const [days, setDays] = useState(30);
  const [smsGroup, setSmsGroup] = useState("region");

  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  const [overview, setOverview] = useState(null);
  const [byDayState, setByDayState] = useState([]);
  const [levelBins, setLevelBins] = useState([]);
  const [rejectReasons, setRejectReasons] = useState([]);
  const [draftAging, setDraftAging] = useState(null);
  const [smsTop, setSmsTop] = useState([]);
  const [smsBy, setSmsBy] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsers, setEditedUsers] = useState({});
  const [usersReloadKey, setUsersReloadKey] = useState(0);
  const [focusedPasswordField, setFocusedPasswordField] = useState(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehiclesReloadKey, setVehiclesReloadKey] = useState(0);

  const tableNodesRef = React.useRef({});

  const registerTableNode = (id, node) => {
    if (node) tableNodesRef.current[id] = node;
  };

  // guarda os dados atuais de cada tabela por id (usersTable, employersTable, etc.)
  const tableDataRef = React.useRef({});

  const registerTableData = (id, payload) => {
    console.log("REGISTER", id, payload?.rows?.length, payload?.headers);
    tableDataRef.current[id] = payload;
  };

  // CSV download (WEB)
  const exportTableCsvWeb = (tableId, fileBaseName = "table_export") => {
    if (Platform.OS !== "web") {
      alert("Export CSV disponível apenas no Web.");
      return;
    }

    const pack = tableDataRef.current[tableId];
    console.log(
      "EXPORT",
      tableId,
      pack?.rows?.length,
      pack?.headers,
      pack?.rows?.[0],
    );
    if (!pack?.rows?.length) {
      alert("Sem dados para exportar.");
      return;
    }

    const { rows, headers, columnLabels } = pack;

    // Excel PT costuma preferir ';'
    // Usa vírgula apenas para Employers
    const SEP = tableId === "employersTable" ? "," : ";";

    const dateOnlyFields = [
      "validity_ana",
      "validity_civil",
      "birth_date",
      "contract_date",
    ];
    const dateTimeFields = [
      "created_at",
      "updated_at",
      "datetime",
      "validate_stamp",
    ];

    const pad = (n) => String(n).padStart(2, "0");
    const formatDate = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return String(iso);
      return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
    };
    const formatDateTime = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return String(iso);
      return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const escapeCell = (v) => {
      const s = String(v ?? "");
      // CSV: se tiver ;, " ou \n, envolve em aspas e duplica aspas
      if (
        s.includes(SEP) ||
        s.includes('"') ||
        s.includes("\n") ||
        s.includes("\r")
      ) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const getDisplayValue = (h, raw) => {
      if (h === "password_hash") return raw ? "••••••••••" : "";
      if (dateOnlyFields.includes(h)) return formatDate(raw);
      if (dateTimeFields.includes(h)) return formatDateTime(raw);
      return String(raw ?? "");
    };

    const headerRow = headers
      .map((h) => escapeCell(columnLabels?.[h] || h))
      .join(SEP);

    const bodyRows = rows.map((r) =>
      headers.map((h) => escapeCell(getDisplayValue(h, r?.[h]))).join(SEP),
    );

    const csv = "\ufeff" + [headerRow, ...bodyRows].join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileBaseName}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  const [newVehicle, setNewVehicle] = useState({
    falsec_number: "",
    plate_number: "",
    brand: "",
    vehicle_type: "",
    region: "",
  });

  const fetchJSON = async (path) => {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    if (activeSection !== "statistics") return;

    let alive = true;

    (async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const [ov, dState, bins, reasons, aging, top, by] = await Promise.all([
          fetchJSON(`/api/stats/overview?days=${days}`),
          fetchJSON(`/api/stats/reports/by-day-state?days=${days}`),
          fetchJSON(`/api/stats/reports/level-bins?days=${days}`),
          fetchJSON(
            `/api/stats/reports/rejection-reasons?days=${Math.min(
              180,
              days * 2,
            )}`,
          ),
          fetchJSON(`/api/stats/drafts/aging`),
          fetchJSON(`/api/stats/employers/sms/top?limit=10`),
          fetchJSON(
            `/api/stats/employers/sms/by?group=${encodeURIComponent(smsGroup)}`,
          ),
        ]);

        if (!alive) return;
        setOverview(ov);
        setByDayState(Array.isArray(dState) ? dState : []);
        setLevelBins(Array.isArray(bins) ? bins : []);
        setRejectReasons(Array.isArray(reasons) ? reasons : []);
        setDraftAging(aging || null);
        setSmsTop(Array.isArray(top) ? top : []);
        setSmsBy(Array.isArray(by) ? by : []);
      } catch (e) {
        if (alive) setStatsError(String(e?.message || e));
      } finally {
        if (alive) setStatsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeSection, days, smsGroup]);

  useEffect(() => {
    if (showUserForm) {
      fetch("http://localhost:3000/api/employers/unassigned")
        .then((res) => res.json())
        .then((data) => setAvailableEmployers(data))
        .catch((err) => {
          console.error("Erro ao buscar employers disponíveis:", err);
          alert("Erro ao carregar employers");
        });
    }
  }, [showUserForm]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    region: "",
    shift: "",
    employers_id: "",
  });

  useEffect(() => {
    // 1) se vier por prop, usa logo
    if (userName) {
      setDisplayName(userName);
      return;
    }

    // 2) tentar recuperar do storage (web)
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const rawUser =
          localStorage.getItem("auth_user") || localStorage.getItem("user");
        if (rawUser) {
          const obj = JSON.parse(rawUser);
          const name =
            obj?.name || obj?.full_name || obj?.username || obj?.email || "";
          if (name) {
            setDisplayName(name);
            return;
          }
        }

        // 3) opcional: pedir à API /auth/me se houver token
        const token =
          localStorage.getItem("token") || localStorage.getItem("access_token");
        if (token) {
          fetch("http://localhost:3000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((me) => {
              if (!me) return;
              const name =
                me?.name || me?.full_name || me?.username || me?.email || "";
              if (name) setDisplayName(name);
            })
            .catch(() => {});
        }
      } catch {
        // ignora erros do storage/JSON
      }
    }
  }, [userName]);

  const formatDate = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const Sidebar = useMemo(
    () => (
      <View style={styles.sidebar}>
        <Text style={styles.sidebarSectionLabel}>Menu</Text>
        <TouchableOpacity
          style={[
            styles.menuItem,
            activeSection === "statistics" && styles.menuItemActive,
          ]}
          onPress={() => setActiveSection("statistics")}
        >
          <Text style={styles.menuItemText}>Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuItem,
            activeSection === "users" && styles.menuItemActive,
          ]}
          onPress={() => setActiveSection("users")}
        >
          <Text style={styles.menuItemText}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuItem,
            activeSection === "employers" && styles.menuItemActive,
          ]}
          onPress={() => setActiveSection("employers")}
        >
          <Text style={styles.menuItemText}>Employers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuItem,
            activeSection === "reports" && styles.menuItemActive,
          ]}
          onPress={() => setActiveSection("reports")}
        >
          <Text style={styles.menuItemText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            activeSection === "vehicles" && styles.menuItemActive,
          ]}
          onPress={() => setActiveSection("vehicles")}
        >
          <Text style={styles.menuItemText}>Vehicles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => logout(navigation)}
        >
          <Text style={styles.menuItemText}>Log Off</Text>
        </TouchableOpacity>
      </View>
    ),
    [activeSection],
  );

  return (
    <>
      <SafeAreaView style={styles.safe}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            {/* Logo on the left */}
            <View style={styles.logoWrap}>
              <RNImage
                source={require("../assets/AccidentReportIcon.png")}
                style={styles.logoImg}
                resizeMode="cover"
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.topBarText}>
                Welcome, {displayName || "—"}
              </Text>
            </View>
          </View>

          {/* Right side actions (optional) */}
          <View style={styles.topRight}>
            {!isLargeScreen && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Abrir menu"
                onPress={() => setShowMenu(true)}
                style={styles.burgerBtn}
              >
                <View style={styles.burgerLine} />
                <View style={styles.burgerLine} />
                <View style={styles.burgerLine} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Fixed sidebar on large screens */}
          {isLargeScreen && Sidebar}

          {/* Content area */}
          <View style={styles.content}>
            <ScrollView
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {activeSection === "statistics" && (
                <>
                  <Text style={styles.h1}>Statistics</Text>

                  {/* filtros */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ minWidth: 180 }}>
                      <Text style={{ marginBottom: 6 }}>Período</Text>
                      <Picker
                        selectedValue={days}
                        onValueChange={(v) => setDays(Number(v))}
                        style={styles.modalInput}
                      >
                        <Picker.Item label="Últimos 30 dias" value={30} />
                        <Picker.Item label="Últimos 90 dias" value={90} />
                        <Picker.Item label="Últimos 180 dias" value={180} />
                      </Picker>
                    </View>

                    <View style={{ minWidth: 220 }}>
                      <Text style={{ marginBottom: 6 }}>
                        SMS Score (agrupar por)
                      </Text>
                      <Picker
                        selectedValue={smsGroup}
                        onValueChange={(v) => setSmsGroup(String(v))}
                        style={styles.modalInput}
                      >
                        <Picker.Item label="Region" value="region" />
                        <Picker.Item label="Company" value="company" />
                        <Picker.Item label="Shift" value="shift" />
                        <Picker.Item
                          label="Function"
                          value="employee_function"
                        />
                      </Picker>
                    </View>
                  </View>

                  {statsLoading && (
                    <Text style={styles.p}>A carregar estatísticas…</Text>
                  )}
                  {!!statsError && (
                    <Text style={styles.p}>Erro: {statsError}</Text>
                  )}

                  {/* cards */}
                  {!!overview && (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      {[
                        ["Reports", overview.reports_last_days],
                        ["Pending", overview.pending_now],
                        ["Critical Pending", overview.critical_pending_now],
                        [
                          "Approval rate",
                          overview.approval_rate_last_days != null
                            ? `${Math.round(
                                overview.approval_rate_last_days * 100,
                              )}%`
                            : "—",
                        ],
                        [
                          "Avg validate (h)",
                          overview.avg_validation_hours_last_days ?? "—",
                        ],
                      ].map(([label, value]) => (
                        <View
                          key={label}
                          style={{
                            backgroundColor: "white",
                            borderRadius: 12,
                            padding: 12,
                            minWidth: 180,
                            shadowColor: "#000",
                            shadowOpacity: 0.08,
                            shadowRadius: 8,
                          }}
                        >
                          <Text style={{ color: "#6b7280", fontSize: 12 }}>
                            {label}
                          </Text>
                          <Text
                            style={{
                              fontSize: 22,
                              fontWeight: "800",
                              marginTop: 6,
                            }}
                          >
                            {String(value ?? "—")}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* charts (só web) */}
                  {Platform.OS !== "web" ? (
                    <Text style={styles.p}>
                      Gráficos disponíveis apenas no Web (Recharts).
                    </Text>
                  ) : (
                    <ChartsBlock
                      byDayState={byDayState}
                      levelBins={levelBins}
                      rejectReasons={rejectReasons}
                      draftAging={draftAging}
                      smsTop={smsTop}
                      smsBy={smsBy}
                    />
                  )}
                </>
              )}

              {activeSection === "users" && (
                <>
                  <Text style={styles.h1}>Users</Text>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#2563eb",
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 12,
                      alignSelf: "flex-start",
                    }}
                    onPress={() => setShowUserForm(!showUserForm)}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      {showUserForm ? "Cancel" : "Add User"}
                    </Text>
                  </TouchableOpacity>

                  {Platform.OS === "web" && (
                    <TouchableOpacity
                      onPress={() =>
                        exportTableCsvWeb("usersTable", "users_table")
                      }
                      style={{
                        backgroundColor: "#111827",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        alignSelf: "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "800" }}>
                        Export Table
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Usa endpoint absoluto ou loader com axios */}
                  <DataTable
                    exportId="usersTable"
                    onRegisterExportData={registerTableData}
                    key={usersReloadKey} // ← força rerender ao mudar
                    endpoint="http://localhost:3000/api/users"
                    toggleBaseUrl="/api/users"
                    onAfterToggle={() => {
                      setEditedUsers({});
                      setUsersReloadKey((k) => k + 1);
                    }}
                    columnLabels={{
                      name: "Name",
                      email: "Email",
                      role: "Role",
                      region: "Region",
                      is_active: "State",
                      shift: "Shift",
                      password_hash: "Password",
                    }}
                    isEditing={isEditing}
                    editedUsers={editedUsers}
                    setEditedUsers={setEditedUsers}
                    focusedPasswordField={focusedPasswordField}
                    setFocusedPasswordField={setFocusedPasswordField}
                    setUsersReloadKey={setUsersReloadKey}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 16,
                      gap: 12,
                    }}
                  >
                    {!isEditing ? (
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#eab308",
                          paddingVertical: 10,
                          paddingHorizontal: 20,
                          borderRadius: 6,
                        }}
                        onPress={() => setIsEditing(true)}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#22c55e",
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 6,
                          }}
                          onPress={async () => {
                            try {
                              for (const [userId, updates] of Object.entries(
                                editedUsers,
                              )) {
                                const res = await fetch(
                                  `http://localhost:3000/api/users/${userId}`,
                                  {
                                    method: "PATCH",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(updates),
                                  },
                                );

                                if (!res.ok) {
                                  const body = await res
                                    .json()
                                    .catch(() => ({}));
                                  throw new Error(
                                    body?.error ||
                                      `Erro ao atualizar ${userId}`,
                                  );
                                }
                              }

                              alert("Alterações guardadas!");
                              setEditedUsers({});
                              setIsEditing(false);
                              setUsersReloadKey((k) => k + 1);
                            } catch (e) {
                              alert("Erro ao guardar: " + e.message);
                            }
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "bold" }}>
                            Save
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: "#ef4444",
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 6,
                          }}
                          onPress={() => {
                            setEditedUsers({});
                            setIsEditing(false);
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "bold" }}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </>
              )}

              {activeSection === "employers" && (
                <>
                  <Text style={styles.h1}>Employers</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#2563eb",
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 12,
                      alignSelf: "flex-start",
                    }}
                    onPress={() => setShowEmployerForm(!showEmployerForm)}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      {showEmployerForm ? "Cancel" : "Add Employer"}
                    </Text>
                  </TouchableOpacity>

                  {Platform.OS === "web" && (
                    <TouchableOpacity
                      onPress={() =>
                        exportTableCsvWeb("employersTable", "employers_table")
                      }
                      style={{
                        backgroundColor: "#111827",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        alignSelf: "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "800" }}>
                        Export Table
                      </Text>
                    </TouchableOpacity>
                  )}

                  <DataTable
                    exportId="employersTable"
                    onRegisterExportData={registerTableData}
                    endpoint="http://localhost:3000/api/employers"
                    columnLabels={{
                      employers_id: "ID",
                      full_name: "Name",
                      employee_number: "Employee Nº",
                      employee_function: "Function",
                      shift: "Shift",
                      license_number_ana: "ANA License",
                      validity_ana: "ANA Validity",
                      category_ana: "ANA Category",
                      civil_license_number: "Civil License",
                      validity_civil: "Civil Validity",
                      category_civil: "Civil Category",
                      formation: "Formation",
                      region: "Region",
                      company: "Company",
                      birth_date: "Birth Date",
                      contract_date: "Contract Date",
                      sms_score: "SMS Score",
                      sms_average: "SMS Average",
                      created_at: "Created At",
                      updated_at: "Update At",
                    }}
                  />
                </>
              )}
              {activeSection === "reports" && (
                <>
                  <Text style={styles.h1}>Reports</Text>

                  {Platform.OS === "web" && (
                    <TouchableOpacity
                      onPress={() =>
                        exportTableCsvWeb("reportsTable", "reports_table")
                      }
                      style={{
                        backgroundColor: "#111827",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        alignSelf: "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "800" }}>
                        Export Table
                      </Text>
                    </TouchableOpacity>
                  )}

                  <DataTable
                    exportId="reportsTable"
                    onRegisterExportData={registerTableData}
                    endpoint="http://localhost:3000/api/upload/list"
                    columnLabels={{
                      report_number: "Report Nº",
                      user: "User",
                      filename: "File (route)",
                      datetime: "Date/Time",
                      user_id: "User ID",
                      state: "State",
                      validate_by: "Validated By",
                      validate_stamp: "Validate Date", // ✅ sem espaços errados
                      level: "Level",
                      shift: "Shift", // ✅ minúsculo!
                      employers_id: "Employer ID",
                      employer_name: "Employer Name",
                      validator_name: "Validator",
                      rejected_why: "Rejected Why",
                    }}
                    onRowPress={(row) => {
                      const route = String(row.filename || ""); // ex: "12345/meu.zip"
                      const parts = route.split("/");
                      const reportNumber = parts[0];
                      const filename = parts.slice(1).join("/"); // normalmente só 1 parte

                      if (!reportNumber || !filename) return;

                      const url = `http://localhost:3000/api/upload/download/${encodeURIComponent(
                        reportNumber,
                      )}/${encodeURIComponent(filename)}`;

                      Linking.openURL(url);
                    }}
                  />
                </>
              )}

              {activeSection === "vehicles" && (
                <>
                  <Text style={styles.h1}>Vehicles</Text>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "#2563eb",
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 12,
                      alignSelf: "flex-start",
                    }}
                    onPress={() => setShowVehicleForm(!showVehicleForm)}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      {showVehicleForm ? "Cancel" : "Add Vehicle"}
                    </Text>
                  </TouchableOpacity>

                  {Platform.OS === "web" && (
                    <TouchableOpacity
                      onPress={() =>
                        exportTableCsvWeb("vehiclesTable", "vehicles_table")
                      }
                      style={{
                        backgroundColor: "#111827",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        alignSelf: "flex-start",
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "800" }}>
                        Export Table
                      </Text>
                    </TouchableOpacity>
                  )}

                  <DataTable
                    exportId="vehiclesTable"
                    onRegisterExportData={registerTableData}
                    key={vehiclesReloadKey}
                    endpoint="http://localhost:3000/api/vehicles"
                    toggleBaseUrl="/api/vehicles"
                    onAfterToggle={() => setVehiclesReloadKey((k) => k + 1)}
                    columnLabels={{
                      label: "Label",
                      id: "ID",
                      falsec_number: "Falsec",
                      plate_number: "Plate",
                      brand: "Brand",
                      vehicle_type: "Type",
                      region: "Region",
                      reports_count: "Reports",
                      created_at: "Created At",
                      is_active: "Status",
                    }}
                    columnWidths={{
                      label: 260,
                      id: 90,
                      falsec_number: 110,
                      plate_number: 140,
                      brand: 180,
                      vehicle_type: 160,
                      region: 140,
                      created_at: 200,
                      is_active: 220,
                    }}
                  />
                </>
              )}
            </ScrollView>
            {showUserForm && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ScrollView contentContainerStyle={styles.modalScrollContent}>
                    <Text style={styles.h1}>New User</Text>

                    {[
                      "name",
                      "email",
                      "password",
                      "role",
                      "region",
                      "shift",
                    ].map((field) => {
                      if (field === "name") {
                        return (
                          <View key={field} style={{ marginBottom: 12 }}>
                            <Text style={{ marginBottom: 4 }}>NAME</Text>
                            <Picker
                              selectedValue={newUser.employers_id}
                              onValueChange={(value) => {
                                const id = parseInt(value);
                                const selected = availableEmployers.find(
                                  (e) => e.employers_id === id,
                                );
                                setNewUser((prev) => ({
                                  ...prev,
                                  employers_id: id,
                                  name: selected?.full_name || "",
                                }));
                              }}
                              style={styles.modalInput}
                            >
                              <Picker.Item
                                label="Select..."
                                value=""
                                enabled={false}
                              />
                              {availableEmployers.map((emp) => (
                                <Picker.Item
                                  key={emp.employers_id}
                                  label={emp.full_name}
                                  value={emp.employers_id}
                                />
                              ))}
                            </Picker>
                          </View>
                        );
                      }

                      return (
                        <View key={field} style={{ marginBottom: 12 }}>
                          <Text style={{ marginBottom: 4 }}>
                            {field.toUpperCase()}
                          </Text>

                          {field === "role" ? (
                            <Picker
                              selectedValue={newUser[field]}
                              style={styles.modalInput}
                              onValueChange={(value) =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  [field]: value,
                                }))
                              }
                            >
                              <Picker.Item
                                label="Select..."
                                value=""
                                enabled={false}
                              />
                              <Picker.Item label="ADMIN" value="ADMIN" />
                              <Picker.Item label="SUP" value="SUP" />
                              <Picker.Item label="AERO" value="AERO" />
                            </Picker>
                          ) : field === "region" ? (
                            <Picker
                              selectedValue={newUser[field]}
                              style={styles.modalInput}
                              onValueChange={(value) =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  [field]: value,
                                }))
                              }
                            >
                              <Picker.Item
                                label="Select..."
                                value=""
                                enabled={false}
                              />
                              <Picker.Item label="LIS" value="LIS" />
                              <Picker.Item label="BYJ" value="BYJ" />
                              <Picker.Item label="OPO" value="OPO" />
                              <Picker.Item label="FAO" value="FAO" />
                            </Picker>
                          ) : field === "shift" ? (
                            <Picker
                              selectedValue={newUser[field]}
                              style={styles.modalInput}
                              onValueChange={(value) =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  [field]: value,
                                }))
                              }
                            >
                              <Picker.Item
                                label="Select..."
                                value=""
                                enabled={false}
                              />
                              <Picker.Item label="A" value="A" />
                              <Picker.Item label="B" value="B" />
                              <Picker.Item label="C" value="C" />
                            </Picker>
                          ) : (
                            <TextInput
                              style={styles.modalInput}
                              value={newUser[field]}
                              onChangeText={(text) =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  [field]: text,
                                }))
                              }
                              secureTextEntry={field === "password"}
                              autoCapitalize={
                                field === "email" ? "none" : "sentences"
                              }
                            />
                          )}
                        </View>
                      );
                    })}

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity onPress={() => setShowUserForm(false)}>
                        <Text style={styles.modalCancel}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={async () => {
                          try {
                            // endpoint de registo de utilizadores
                            // POST /api/auth/register  :contentReference[oaicite:2]{index=2}
                            const res = await fetch(
                              "http://localhost:3000/api/auth/register",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  name: newUser.name,
                                  email: newUser.email,
                                  password: newUser.password,
                                  role: newUser.role,
                                  region: newUser.region,
                                  shift: newUser.shift,
                                  employers_id: newUser.employers_id, // 👈 ESSENCIAL
                                }),
                              },
                            );

                            if (!res.ok) {
                              const body = await res.json().catch(() => ({}));
                              throw new Error(
                                body?.error ||
                                  `Erro ao criar user (HTTP ${res.status})`,
                              );
                            }

                            alert("User criado com sucesso!");

                            // limpa formulário
                            setNewUser({
                              name: "",
                              email: "",
                              password: "",
                              role: "",
                              region: "",
                              shift: "",
                              employers_id: "",
                            });
                            setShowUserForm(false);
                          } catch (err) {
                            alert("Erro ao criar user: " + err.message);
                          }
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Save
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}

            {showEmployerForm && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ScrollView contentContainerStyle={styles.modalScrollContent}>
                    <Text style={styles.h1}>New Employer</Text>

                    {Object.keys(newEmployer).map((field) => (
                      <View key={field} style={{ marginBottom: 12 }}>
                        <Text style={{ marginBottom: 4 }}>
                          {field.replace(/_/g, " ").toUpperCase()}
                        </Text>

                        {/* Campos de data com react-datepicker */}
                        {[
                          "birth_date",
                          "contract_date",
                          "validity_ana",
                          "validity_civil",
                        ].includes(field) ? (
                          <DatePicker
                            selected={
                              newEmployer[field]
                                ? new Date(newEmployer[field])
                                : null
                            }
                            onChange={(date) => {
                              setNewEmployer((prev) => ({
                                ...prev,
                                [field]: date.toISOString().slice(0, 10),
                              }));
                            }}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select date"
                            className="react-datepicker-input"
                            wrapperClassName="react-datepicker-wrapper"
                            popperPlacement="bottom"
                          />
                        ) : field === "shift" ? (
                          <Picker
                            selectedValue={newEmployer[field]}
                            onValueChange={(value) =>
                              setNewEmployer((prev) => ({
                                ...prev,
                                [field]: value,
                              }))
                            }
                            style={styles.modalInput}
                          >
                            <Picker.Item
                              label="Select..."
                              value=""
                              enabled={false}
                            />
                            <Picker.Item label="A" value="A" />
                            <Picker.Item label="B" value="B" />
                            <Picker.Item label="C" value="C" />
                          </Picker>
                        ) : field === "company" ? (
                          <Picker
                            selectedValue={newEmployer[field]}
                            onValueChange={(value) =>
                              setNewEmployer((prev) => ({
                                ...prev,
                                [field]: value,
                              }))
                            }
                            style={styles.modalInput}
                          >
                            <Picker.Item
                              label="Select..."
                              value=""
                              enabled={false}
                            />
                            <Picker.Item label="ASA" value="ASA" />
                            <Picker.Item label="ICD" value="ICD" />
                          </Picker>
                        ) : field === "formation" ? (
                          <Picker
                            selectedValue={newEmployer[field]}
                            onValueChange={(value) =>
                              setNewEmployer((prev) => ({
                                ...prev,
                                [field]: value,
                              }))
                            }
                            style={styles.modalInput}
                          >
                            <Picker.Item
                              label="Select..."
                              value=""
                              enabled={false}
                            />
                            <Picker.Item label="Validated" value="Validated" />
                            <Picker.Item
                              label="Not Validated"
                              value="Not Validated"
                            />
                          </Picker>
                        ) : field === "employee_function" ? (
                          <Picker
                            selectedValue={newEmployer[field]}
                            style={styles.modalInput}
                            onValueChange={(value) =>
                              setNewEmployer((prev) => ({
                                ...prev,
                                [field]: value,
                              }))
                            }
                          >
                            <Picker.Item
                              label="Select..."
                              value=""
                              enabled={false}
                            />
                            <Picker.Item label="AERO" value="AERO" />
                            <Picker.Item label="SUP" value="SUP" />
                            <Picker.Item label="ADMIN" value="ADMIN" />
                          </Picker>
                        ) : field === "region" ? (
                          <Picker
                            selectedValue={newEmployer[field]}
                            onValueChange={(value) =>
                              setNewEmployer((prev) => ({
                                ...prev,
                                [field]: value,
                              }))
                            }
                            style={styles.modalInput}
                          >
                            <Picker.Item
                              label="Select..."
                              value=""
                              enabled={false}
                            />
                            <Picker.Item label="LIS" value="LIS" />
                            <Picker.Item label="OPO" value="OPO" />
                            <Picker.Item label="FAO" value="FAO" />
                          </Picker>
                        ) : (
                          <TextInput
                            style={styles.modalInput}
                            value={newEmployer[field]}
                            onChangeText={(text) =>
                              setNewEmployer((prev) => ({
                                ...prev,
                                [field]: text,
                              }))
                            }
                          />
                        )}
                      </View>
                    ))}

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setShowEmployerForm(false)}
                      >
                        <Text style={styles.modalCancel}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={async () => {
                          try {
                            const toDateString = (date) =>
                              date instanceof Date
                                ? date.toISOString().slice(0, 10)
                                : date || "";

                            const preparedEmployer = {
                              ...newEmployer,
                              birth_date: toDateString(newEmployer.birth_date),
                              contract_date: toDateString(
                                newEmployer.contract_date,
                              ),
                              validity_ana: toDateString(
                                newEmployer.validity_ana,
                              ),
                              validity_civil: toDateString(
                                newEmployer.validity_civil,
                              ),
                            };

                            console.log("EMPLOYER A ENVIAR:", preparedEmployer); // útil para testes

                            const res = await fetch(
                              "http://localhost:3000/api/employers",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(preparedEmployer), // ✅ CORRIGIDO AQUI
                              },
                            );

                            if (!res.ok) throw new Error("Erro ao salvar");

                            alert("Employer criado com sucesso!");
                            setNewEmployer({
                              full_name: "",
                              employee_number: "",
                              employee_function: "",
                              shift: "",
                              company: "",
                              license_number_ana: "",
                              validity_ana: "",
                              category_ana: "",
                              civil_license_number: "",
                              validity_civil: "",
                              category_civil: "",
                              formation: "",
                              region: "",
                              birth_date: "",
                              contract_date: "",
                            });
                            setShowEmployerForm(false);
                          } catch (err) {
                            alert("Erro ao criar employer: " + err.message);
                          }
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Save
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}

            {showVehicleForm && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ScrollView contentContainerStyle={styles.modalScrollContent}>
                    <Text style={styles.h1}>New Vehicle</Text>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ marginBottom: 4 }}>FALSEC NUMBER</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={newVehicle.falsec_number}
                        onChangeText={(text) =>
                          setNewVehicle((prev) => ({
                            ...prev,
                            falsec_number: text,
                          }))
                        }
                      />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ marginBottom: 4 }}>PLATE NUMBER</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={newVehicle.plate_number}
                        onChangeText={(text) =>
                          setNewVehicle((prev) => ({
                            ...prev,
                            plate_number: text,
                          }))
                        }
                      />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ marginBottom: 4 }}>BRAND</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={newVehicle.brand}
                        onChangeText={(text) =>
                          setNewVehicle((prev) => ({ ...prev, brand: text }))
                        }
                      />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ marginBottom: 4 }}>REGION</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={newVehicle.region}
                          onValueChange={(val) =>
                            setNewVehicle((prev) => ({
                              ...prev,
                              region: val,
                            }))
                          }
                          style={styles.picker}
                        >
                          <Picker.Item label="Select Region" value="" />
                          <Picker.Item label="LIS" value="LIS" />
                          <Picker.Item label="BYJ" value="BYJ" />
                          <Picker.Item label="OPO" value="OPO" />
                          <Picker.Item label="FAO" value="FAO" />
                        </Picker>
                      </View>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ marginBottom: 4 }}>VEHICLE TYPE</Text>

                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={newVehicle.vehicle_type}
                          onValueChange={(val) =>
                            setNewVehicle((prev) => ({
                              ...prev,
                              vehicle_type: val,
                            }))
                          }
                          style={styles.picker}
                        >
                          <Picker.Item label="Select vehicle type" value="" />
                          <Picker.Item
                            label="Hidrant Servicer"
                            value="Hidrant Servicer"
                          />
                          <Picker.Item label="Refueler" value="Refueler" />
                        </Picker>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setShowVehicleForm(false)}
                      >
                        <Text style={styles.modalCancel}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalButton}
                        onPress={async () => {
                          try {
                            const payload = {
                              falsec_number: (newVehicle.falsec_number || "")
                                .trim()
                                .toUpperCase(),
                              plate_number: (newVehicle.plate_number || "")
                                .trim()
                                .toUpperCase(),
                              brand: (newVehicle.brand || "").trim(),
                              vehicle_type: (
                                newVehicle.vehicle_type || ""
                              ).trim(),
                              region: (newVehicle.region || "").trim(),
                            };

                            if (!payload.plate_number) {
                              alert("Plate number is required.");
                              return;
                            }

                            const res = await fetch(
                              "http://localhost:3000/api/vehicles",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                              },
                            );

                            if (!res.ok) {
                              const body = await res.json().catch(() => ({}));
                              throw new Error(
                                body?.error || `Erro (HTTP ${res.status})`,
                              );
                            }

                            alert("Vehicle criado com sucesso!");
                            setNewVehicle({
                              falsec_number: "",
                              plate_number: "",
                              brand: "",
                              vehicle_type: "",
                              region: "",
                            });

                            setShowVehicleForm(false);
                            setVehiclesReloadKey((k) => k + 1); // recarrega a tabela
                          } catch (err) {
                            alert("Erro ao criar veículo: " + err.message);
                          }
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "bold" }}>
                          Save
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Slide-over sidebar for small screens */}
        {!isLargeScreen && showMenu && (
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.backdrop}
              onPress={() => setShowMenu(false)}
            />
            <View style={styles.drawer}>{Sidebar}</View>
          </View>
        )}
      </SafeAreaView>
      <style>
        {`
    .react-datepicker-popper {
      z-index: 9999 !important;
    }

    .react-datepicker-wrapper {
      width: 100%;
      position: relative;
    }

    .react-datepicker__input-container input {
      width: 100%;
      height: 40px;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      background-color: #fff;
    }
  `}
      </style>
    </>
  );
};

// Simple table component to render users from API or custom loader
const DataTable = ({
  endpoint,
  load,
  reloadKey = 0,
  columnWidths = {},
  columnLabels = {},
  onRowPress,
  isEditing = false,
  editedUsers = {},
  setEditedUsers = () => {},
  focusedPasswordField,
  setFocusedPasswordField,
  setUsersReloadKey,
  setReloadKey,
  activeToggleEndpointBase = "/api/users",
  toggleBaseUrl, // ex: "/api/users" ou "/api/vehicles"
  onAfterToggle, // callback depois do toggle
  exportId,
  onRegisterExportNode,
  onRegisterExportData,
}) => {
  const { width: winW } = useWindowDimensions();
  const CONTENT_SIDE_PADDING = 32; // padding lateral do teu ScrollView de conteúdo
  const viewport = Math.max(320, Math.floor(winW - CONTENT_SIDE_PADDING * 2)); // área útil

  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const DEFAULT_COL = 160; // largura base por coluna (ajusta ao gosto)

  function formatDate(isoDate) {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const pad = (n) => String(n).padStart(2, "0");

    return `${pad(date.getDate())}-${pad(
      date.getMonth() + 1,
    )}-${date.getFullYear()}`;
  }

  function formatDateTime(isoDate) {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const pad = (n) => String(n).padStart(2, "0");

    return `${pad(date.getDate())}-${pad(
      date.getMonth() + 1,
    )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(
      date.getMinutes(),
    )}:${pad(date.getSeconds())}`;
  }

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = load
          ? await load()
          : await (async () => {
              const res = await fetch(endpoint, {
                headers: { Accept: "application/json" },
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })();

        const arr = Array.isArray(data) ? data : data?.items || [];

        if (mounted) setRows(arr);
      } catch (e) {
        if (mounted) setError(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [endpoint, load, reloadKey]);

  const headers =
    Object.keys(columnLabels || {}).length > 0
      ? Object.keys(columnLabels)
      : Object.keys(rows[0] || {});

  // ✅ este hook tem de ficar ANTES dos returns condicionais
  React.useEffect(() => {
    if (!exportId || !onRegisterExportData) return;
    if (!rows?.length) return;
    if (!headers?.length) return;

    onRegisterExportData(exportId, { rows, headers, columnLabels });
  }, [exportId, onRegisterExportData, rows, headers, columnLabels]);

  // ✅ só depois disto é que vêm os returns
  if (loading) return <Text style={styles.p}>A carregar…</Text>;
  if (error) return <Text style={styles.p}>Erro a carregar: {error}</Text>;
  if (!rows.length) return <Text style={styles.p}>Sem dados.</Text>;

  const baseW = (key) => columnWidths[key] ?? DEFAULT_COL;

  // soma das larguras base das colunas
  const totalBase = headers.reduce((sum, h) => sum + baseW(h), 0);

  // se couber, damos um "extra" para a última coluna preencher o espaço sobrante
  const lastExtra = Math.max(0, viewport - totalBase);

  // largura real da tabela (para o conteúdo rolável)
  const tableWidth = Math.max(totalBase, viewport);

  return (
    <View
      style={styles.tableWrapper}
      ref={(node) => {
        if (node && exportId && onRegisterExportNode) {
          onRegisterExportNode(exportId, node);
        }
      }}
      collapsable={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        style={{ width: "100%" }}
        contentContainerStyle={{ width: tableWidth }}
      >
        <View
          style={{ width: tableWidth }}
          ref={(node) => {
            // ✅ regista ESTE node (conteúdo total), não o wrapper
            if (node && exportId && onRegisterExportNode) {
              onRegisterExportNode(exportId, node);
            }
          }}
          collapsable={false}
        >
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            {headers.map((h, i) => {
              const isLast = i === headers.length - 1;
              const w = baseW(h) + (isLast ? lastExtra : 0);
              return (
                <Text
                  key={h}
                  style={[
                    styles.cell,
                    { width: w, minWidth: w, flexShrink: 0 },
                    !isLast && styles.cellRightBorder,
                    styles.headerCell,
                  ]}
                  numberOfLines={1}
                >
                  {columnLabels[h] || h}
                </Text>
              );
            })}
          </View>

          {/* Linhas */}
          {rows.map((r, idx) => {
            const Row = onRowPress ? TouchableOpacity : View;

            return (
              <Row
                key={idx}
                style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
                onPress={onRowPress ? () => onRowPress(r) : undefined}
                disabled={!onRowPress}
                activeOpacity={0.7}
              >
                {headers.map((h, i) => {
                  const isLast = i === headers.length - 1;
                  const w = baseW(h) + (isLast ? lastExtra : 0);

                  const v = r?.[h];
                  const userId = r.id ?? r.email ?? String(idx);
                  const currentValue = editedUsers?.[userId]?.[h] ?? v;

                  const updateField = (field, value) =>
                    setEditedUsers((prev) => ({
                      ...prev,
                      [userId]: { ...prev[userId], [field]: value },
                    }));

                  let cellContent = null;

                  if (
                    isEditing &&
                    ["role", "region", "shift", "password_hash"].includes(h)
                  ) {
                    if (h === "role") {
                      cellContent = (
                        <Picker
                          selectedValue={currentValue}
                          style={{ height: 40 }}
                          onValueChange={(val) => updateField("role", val)}
                        >
                          <Picker.Item label="ADMIN" value="ADMIN" />
                          <Picker.Item label="SUP" value="SUP" />
                          <Picker.Item label="AERO" value="AERO" />
                        </Picker>
                      );
                    } else if (h === "region") {
                      cellContent = (
                        <Picker
                          selectedValue={currentValue}
                          style={{ height: 40 }}
                          onValueChange={(val) => updateField("region", val)}
                        >
                          <Picker.Item label="LIS" value="LIS" />
                          <Picker.Item label="OPO" value="OPO" />
                          <Picker.Item label="FAO" value="FAO" />
                          <Picker.Item label="BYJ" value="BYJ" />
                        </Picker>
                      );
                    } else if (h === "shift") {
                      cellContent = (
                        <Picker
                          selectedValue={currentValue}
                          style={{ height: 40 }}
                          onValueChange={(val) => updateField("shift", val)}
                        >
                          <Picker.Item label="A" value="A" />
                          <Picker.Item label="B" value="B" />
                          <Picker.Item label="C" value="C" />
                        </Picker>
                      );
                    } else if (h === "password_hash") {
                      const editedPassword = editedUsers?.[userId]?.password;

                      cellContent = (
                        <TextInput
                          style={{
                            height: 40,
                            paddingHorizontal: 6,
                            borderWidth: 1,
                            borderColor: "#ccc",
                            borderRadius: 4,
                            backgroundColor: "white",
                          }}
                          secureTextEntry
                          placeholder={
                            focusedPasswordField === userId
                              ? "Nova password"
                              : "••••••••••"
                          }
                          onFocus={() => setFocusedPasswordField(userId)}
                          onBlur={() => setFocusedPasswordField(null)}
                          onChangeText={(val) => updateField("password", val)}
                        />
                      );
                    }
                  }

                  if (h === "is_active") {
                    const isActive = Number(v) === 1;
                    const rowId = r.id;
                    const base = toggleBaseUrl || activeToggleEndpointBase;

                    const toggleState = async () => {
                      try {
                        const res = await fetch(`${API_URL}${base}/${rowId}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ is_active: isActive ? 0 : 1 }),
                        });

                        if (!res.ok) {
                          const body = await res.json().catch(() => ({}));
                          throw new Error(body?.error || `HTTP ${res.status}`);
                        }

                        // ✅ SÓ aqui (depois do sucesso)
                        if (onAfterToggle) onAfterToggle();
                        else {
                          setEditedUsers?.({});
                          const bump = setReloadKey || setUsersReloadKey;
                          bump?.((k) => k + 1);
                        }
                      } catch (err) {
                        alert("Erro ao atualizar estado: " + err.message);
                      }
                    };

                    cellContent = (
                      <TouchableOpacity
                        onPress={toggleState}
                        style={{
                          backgroundColor: isActive ? "#ef4444" : "#22c55e",
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </Text>
                      </TouchableOpacity>
                    );
                  }

                  if (!cellContent) {
                    let displayValue = "";

                    const dateOnlyFields = [
                      "validity_ana",
                      "validity_civil",
                      "birth_date",
                      "contract_date",
                    ];

                    const dateTimeFields = [
                      "created_at",
                      "updated_at",
                      "datetime",
                      "validate_stamp",
                    ];

                    if (h === "password_hash") {
                      displayValue = v ? "••••••••••" : "";
                    } else if (dateOnlyFields.includes(h)) {
                      displayValue = formatDate(v);
                    } else if (dateTimeFields.includes(h)) {
                      displayValue = formatDateTime(v);
                    } else {
                      displayValue = String(v ?? "");
                    }
                    cellContent = (
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ color: "#111827" }}
                      >
                        {displayValue}
                      </Text>
                    );
                  }

                  return (
                    <View
                      key={h}
                      style={[
                        styles.cell,
                        { width: w, minWidth: w, flexShrink: 0 },
                        !isLast && styles.cellRightBorder,
                      ]}
                    >
                      {cellContent}
                    </View>
                  );
                })}
              </Row>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const ChartsBlock = ({
  byDayState,
  levelBins,
  rejectReasons,
  draftAging,
  smsTop,
  smsBy,
}) => {
  if (Platform.OS !== "web") return null;

  let R;
  try {
    R = require("recharts");
  } catch {
    return null;
  }

  const { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } =
    R;

  // Paleta consistente (melhora leitura)
  const COLORS = {
    pending: "#f59e0b",
    approved: "#10b981",
    rejected: "#ef4444",
    drafts: "#8b5cf6",
    totalSms: "#0ea5e9",
    avgSms: "#f97316",
    grid: "#e5e7eb",
    text: "#6b7280",
    title: "#111827",
    tooltipBg: "rgba(17,24,39,0.92)",
  };

  const palette10 = [
    "#60a5fa",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#a78bfa",
    "#22c55e",
    "#06b6d4",
    "#fb7185",
    "#f97316",
    "#14b8a6",
  ];

  const axisTick = { fill: COLORS.text, fontSize: 12 };
  const tooltipProps = {
    contentStyle: {
      backgroundColor: COLORS.tooltipBg,
      border: "none",
      borderRadius: 10,
      color: "white",
      fontSize: 12,
      boxShadow: "0 10px 30px rgba(0,0,0,.25)",
    },
    labelStyle: { color: "white", fontWeight: 700 },
    itemStyle: { color: "white" },
    cursor: { fill: "rgba(148,163,184,0.18)" },
  };

  const { width: winW } = useWindowDimensions();

  const [exportingAll, setExportingAll] = React.useState(false);

  // Guardar o DOM node de cada gráfico (1 gráfico = 1 página no ALL)
  const chartNodesRef = React.useRef({});

  const registerChartNode = (id, node) => {
    if (node) chartNodesRef.current[id] = node;
  };

  const getLibs = () => {
    const html2canvasModule = require("html2canvas");
    const html2canvas = html2canvasModule.default || html2canvasModule;

    const jspdfModule = require("jspdf");
    const jsPDF = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;

    return { html2canvas, jsPDF };
  };

  const pickLargestSvg = (root) => {
    const svgs = Array.from(root.querySelectorAll("svg"));
    if (!svgs.length) return null;

    const area = (svg) => {
      const r = svg.getBoundingClientRect();
      return (r.width || 0) * (r.height || 0);
    };

    return svgs.reduce((best, cur) => (area(cur) > area(best) ? cur : best));
  };

  const getSvgSize = (svg) => {
    // 1) tentar via layout
    const r = svg.getBoundingClientRect();
    let w = r?.width || 0;
    let h = r?.height || 0;

    // 2) se vier 0, tentar viewBox
    if (w < 2 || h < 2) {
      const vb = svg.viewBox?.baseVal;
      if (vb?.width && vb?.height) {
        w = vb.width;
        h = vb.height;
      }
    }

    // 3) se ainda 0, tentar atributos width/height
    if (w < 2 || h < 2) {
      const aw = parseFloat(svg.getAttribute("width"));
      const ah = parseFloat(svg.getAttribute("height"));
      if (Number.isFinite(aw) && aw > 0) w = aw;
      if (Number.isFinite(ah) && ah > 0) h = ah;
    }

    // 4) se ainda 0, tentar bbox (conteúdo)
    if (w < 2 || h < 2) {
      try {
        const bb = svg.getBBox();
        if (bb?.width && bb?.height) {
          w = bb.width;
          h = bb.height;
        }
      } catch {}
    }

    // fallback final
    if (w < 2 || h < 2) {
      w = 900;
      h = 320;
    }

    return { w, h };
  };

  const captureCanvas = async (element) => {
    // garante layout pronto
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );

    const svg = pickLargestSvg(element);
    if (!svg) throw new Error("SVG do gráfico não encontrado.");

    const { w, h } = getSvgSize(svg);
    const scale = 2;

    const cloned = svg.cloneNode(true);

    // namespaces (importante para render)
    if (!cloned.getAttribute("xmlns")) {
      cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
    if (!cloned.getAttribute("xmlns:xlink")) {
      cloned.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    }

    // força dimensões coerentes
    cloned.setAttribute("width", String(w));
    cloned.setAttribute("height", String(h));
    if (!cloned.getAttribute("viewBox")) {
      cloned.setAttribute("viewBox", `0 0 ${w} ${h}`);
    }

    const svgText = new XMLSerializer().serializeToString(cloned);
    const svgBlob = new Blob([svgText], {
      type: "image/svg+xml;charset=utf-8",
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(w * scale));
    canvas.height = Math.max(1, Math.ceil(h * scale));

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ✅ caminho mais estável (evita "brancos" em export ALL)
    let drawn = false;

    if (window.createImageBitmap) {
      try {
        const bitmap = await createImageBitmap(svgBlob);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        drawn = true;
      } catch (e) {
        // cai para fallback
      }
    }

    // fallback: Image() + blob URL
    if (!drawn) {
      const url = URL.createObjectURL(svgBlob);

      const img = new window.Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
    }

    return canvas;
  };

  // Encaixa a imagem na folha A4 sem cortar e mantendo proporção (fit)
  const addCanvasFitToPage = (pdf, canvas, marginMm = 8) => {
    if (!canvas || !canvas.width || !canvas.height) {
      throw new Error("Canvas inválido para exportação.");
    }

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const maxW = pageW - marginMm * 2;
    const maxH = pageH - marginMm * 2;

    const imgWpx = canvas.width;
    const imgHpx = canvas.height;

    if (imgWpx < 2 || imgHpx < 2) {
      throw new Error("Canvas com dimensões inválidas.");
    }

    const imgRatio = imgWpx / imgHpx;
    const pageRatio = maxW / maxH;

    let renderW, renderH;
    if (imgRatio > pageRatio) {
      renderW = maxW;
      renderH = maxW / imgRatio;
    } else {
      renderH = maxH;
      renderW = maxH * imgRatio;
    }

    // ✅ clamp final (jsPDF não aceita 0/NaN)
    if (![renderW, renderH].every((n) => Number.isFinite(n) && n > 0.1)) {
      throw new Error("Dimensões calculadas inválidas para PDF.");
    }

    const x = (pageW - renderW) / 2;
    const y = (pageH - renderH) / 2;

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", x, y, renderW, renderH);
  };

  const exportSingleChartPdf = async (element, fileBaseName) => {
    try {
      const canvas = await captureCanvas(element);
      const orientation =
        canvas.width > canvas.height ? "landscape" : "portrait";

      const { jsPDF } = getLibs();
      const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });

      addCanvasFitToPage(pdf, canvas, 8);
      pdf.save(`${fileBaseName}.pdf`);
    } catch (e) {
      alert("Falha ao exportar PDF: " + (e?.message || e));
    }
  };

  const exportAllChartsPdf = async (chartOrderIds, fileBaseName) => {
    try {
      setExportingAll(true);

      // espera 2 frames para garantir layout/refs atualizados
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );

      const { jsPDF } = getLibs();

      let pdf = null;

      for (let i = 0; i < chartOrderIds.length; i++) {
        const id = chartOrderIds[i];
        const node = chartNodesRef.current[id];
        if (!node) continue;

        const canvas = await captureCanvas(node);
        const orient = canvas.width > canvas.height ? "landscape" : "portrait";

        if (!pdf) {
          pdf = new jsPDF({ orientation: orient, unit: "mm", format: "a4" });
        } else {
          pdf.addPage("a4", orient === "landscape" ? "l" : "p");
        }

        addCanvasFitToPage(pdf, canvas, 8);
      }

      if (!pdf) return;

      pdf.save(`${fileBaseName}.pdf`);
    } catch (e) {
      alert("Falha ao exportar PDF: " + (e?.message || e));
    } finally {
      setExportingAll(false);
    }
  };

  // largura útil (ajusta ao teu sidebar)
  const chartW = Math.max(360, Math.min(winW - 340, 1100));
  const chartH = 320;

  const [vehicleStats, setVehicleStats] = React.useState({
    status: { ativos: 0, inativos: 0 },
    reports: [],
  });

  useEffect(() => {
    fetch(`${API_URL}/api/stats/vehicles/statistics`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setVehicleStats(data))
      .catch((err) =>
        console.error("Erro ao buscar estatísticas de veículos:", err),
      );
  }, []);

  const ExportCard = ({ id, title, fileName, children }) => {
    const captureRef = React.useRef(null);

    return (
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 14,
          padding: 14,
          marginBottom: 14,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 14,
        }}
      >
        <View
          data-export-id={id}
          ref={(node) => {
            captureRef.current = node;
            registerChartNode(id, node);
          }}
          collapsable={false}
        >
          <Text
            style={{ fontWeight: "800", marginBottom: 10, color: COLORS.title }}
          >
            {title}
          </Text>
          {children}
        </View>

        {!exportingAll && (
          <TouchableOpacity
            disabled={exportingAll}
            onPress={() =>
              captureRef.current &&
              exportSingleChartPdf(
                captureRef.current,
                fileName || title.replace(/\s+/g, "_"),
              )
            }
            style={{
              marginTop: 12,
              alignSelf: "flex-start",
              backgroundColor: exportingAll ? "#334155" : "#111827",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              opacity: exportingAll ? 0.6 : 1,
            }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>
              Export PDF
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const draftData = draftAging
    ? [
        { bucket: "0-7", total: draftAging.d0_7 ?? 0 },
        { bucket: "8-14", total: draftAging.d8_14 ?? 0 },
        { bucket: "15-30", total: draftAging.d15_30 ?? 0 },
        { bucket: "30+", total: draftAging.d30_plus ?? 0 },
      ]
    : [];

  return (
    <View>
      <ExportCard
        id="byDayState"
        title="Reports por dia (estado)"
        fileName="reports_por_dia_estado"
      >
        <BarChart width={chartW} height={chartH} data={byDayState}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 4" />
          <XAxis dataKey="day" tick={axisTick} />
          <YAxis allowDecimals={false} tick={axisTick} />
          <Tooltip {...tooltipProps} />
          <Legend wrapperStyle={{ fontSize: 12, color: COLORS.text }} />
          <Bar
            isAnimationActive={false}
            dataKey="pending"
            stackId="a"
            fill={COLORS.pending}
            radius={[6, 6, 0, 0]}
          />
          <Bar
            isAnimationActive={false}
            dataKey="approved"
            stackId="a"
            fill={COLORS.approved}
            radius={[6, 6, 0, 0]}
          />
          <Bar
            isAnimationActive={false}
            dataKey="rejected"
            stackId="a"
            fill={COLORS.rejected}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ExportCard>

      <ExportCard
        id="levelBins"
        title="Distribuição do Level (bins)"
        fileName="distribuicao_level_bins"
      >
        <BarChart width={chartW} height={chartH} data={levelBins}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 4" />
          <XAxis dataKey="level_bin" tick={axisTick} />
          <YAxis allowDecimals={false} tick={axisTick} />
          <Tooltip {...tooltipProps} />
          <Bar isAnimationActive={false} dataKey="total" radius={[8, 8, 0, 0]}>
            {levelBins.map((row, i) => {
              const bin = String(row.level_bin || "");
              const fill =
                bin === "1-5"
                  ? "#22c55e"
                  : bin === "6-10"
                    ? "#a3e635"
                    : bin === "11-15"
                      ? "#fbbf24"
                      : bin === "16-20"
                        ? "#fb7185"
                        : "#ef4444";
              return <Cell key={i} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ExportCard>

      <ExportCard
        id="rejectReasons"
        title="Top motivos de rejeição"
        fileName="top_motivos_rejeicao"
      >
        <BarChart
          width={chartW}
          height={chartH}
          data={rejectReasons}
          layout="vertical"
          margin={{ left: 80 }}
        >
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 4" />
          <XAxis type="number" allowDecimals={false} tick={axisTick} />
          <YAxis type="category" dataKey="reason" width={220} tick={axisTick} />
          <Tooltip {...tooltipProps} />
          <Bar isAnimationActive={false} dataKey="total" radius={[0, 8, 8, 0]}>
            {rejectReasons.map((_, i) => (
              <Cell key={i} fill={palette10[i % palette10.length]} />
            ))}
          </Bar>
        </BarChart>
      </ExportCard>

      <ExportCard
        id="draftsAging"
        title="Drafts (aging)"
        fileName="drafts_aging"
      >
        <BarChart width={chartW} height={chartH} data={draftData}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 4" />
          <XAxis dataKey="bucket" tick={axisTick} />
          <YAxis allowDecimals={false} tick={axisTick} />
          <Tooltip {...tooltipProps} />
          <Bar
            isAnimationActive={false}
            dataKey="total"
            fill={COLORS.drafts}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ExportCard>

      <ExportCard
        id="smsTop10"
        title="Top 10 Employers por SMS Score"
        fileName="top10_employers_sms"
      >
        <BarChart
          width={chartW}
          height={chartH}
          data={smsTop}
          layout="vertical"
          margin={{ left: 60 }}
        >
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 4" />
          <XAxis type="number" allowDecimals={false} tick={axisTick} />
          <YAxis
            type="category"
            dataKey="full_name"
            width={220}
            tick={axisTick}
          />
          <Tooltip {...tooltipProps} />
          <Bar
            isAnimationActive={false}
            dataKey="sms_score"
            radius={[0, 8, 8, 0]}
          >
            {smsTop.map((_, i) => (
              <Cell key={i} fill={palette10[i % palette10.length]} />
            ))}
          </Bar>
        </BarChart>
      </ExportCard>

      <ExportCard
        id="smsByGroup"
        title="SMS Score por agrupamento"
        fileName="sms_score_agrupamento"
      >
        <BarChart width={chartW} height={chartH} data={smsBy}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 4" />
          <XAxis dataKey="label" tick={axisTick} />
          <YAxis allowDecimals={false} tick={axisTick} />
          <Tooltip {...tooltipProps} />
          <Legend wrapperStyle={{ fontSize: 12, color: COLORS.text }} />
          <Bar
            isAnimationActive={false}
            dataKey="total_sms"
            fill={COLORS.totalSms}
            radius={[8, 8, 0, 0]}
          />
          <Bar
            isAnimationActive={false}
            dataKey="avg_sms"
            fill={COLORS.avgSms}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ExportCard>

      {vehicleStats?.status && (
        <ExportCard
          id="vehiclesByStatus"
          title="Veículos Ativos vs Inativos"
          fileName="veiculos_ativos_inativos"
        >
          <BarChart
            width={chartW}
            height={chartH}
            data={[
              { status: "Ativos", total: vehicleStats?.status?.ativos || 0 },
              {
                status: "Inativos",
                total: vehicleStats?.status?.inativos || 0,
              },
            ]}
          >
            <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 4" />
            <XAxis dataKey="status" tick={axisTick} />
            <YAxis allowDecimals={false} tick={axisTick} />
            <Tooltip {...tooltipProps} />
            <Bar
              isAnimationActive={false}
              dataKey="total"
              radius={[8, 8, 0, 0]}
            >
              <Cell fill="#10b981" />
              <Cell fill="#ef4444" />
            </Bar>
          </BarChart>
        </ExportCard>
      )}

      {vehicleStats?.reports?.length > 0 && (
        <ExportCard
          id="vehiclesByReports"
          title="Relatórios por Veículo"
          fileName="relatorios_por_veiculo"
        >
          <BarChart
            width={chartW}
            height={chartH}
            data={vehicleStats.reports}
            layout="vertical"
            margin={{ left: 80 }}
          >
            <CartesianGrid stroke={COLORS.grid} strokeDasharray="4 4" />
            <XAxis type="number" allowDecimals={false} tick={axisTick} />
            <YAxis
              type="category"
              dataKey="plate"
              width={220}
              tick={axisTick}
            />
            <Tooltip {...tooltipProps} />
            <Bar
              isAnimationActive={false}
              dataKey="reports"
              radius={[0, 8, 8, 0]}
            >
              {vehicleStats.reports.map((_, i) => (
                <Cell key={i} fill={palette10[i % palette10.length]} />
              ))}
            </Bar>
          </BarChart>
        </ExportCard>
      )}

      {/* Botão no final da página: exporta TODOS em várias páginas */}
      <TouchableOpacity
        onPress={() =>
          exportAllChartsPdf(
            [
              "byDayState",
              "levelBins",
              "rejectReasons",
              "draftsAging",
              "smsTop10",
              "smsByGroup",
              "vehiclesByStatus",
              "vehiclesByReports", // <- Certifique-se que estão aqui
            ],
            "ALL_GRAPHS_STATISTICS",
          )
        }
        style={{
          marginTop: 6,
          marginBottom: 18,
          alignSelf: "flex-start",
          backgroundColor: "#0f172a",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", fontWeight: "900" }}>
          {exportingAll ? "A exportar..." : "Exportar TODOS (PDF)"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: LIGHT,
  },
  topBar: {
    height: 64,
    backgroundColor: DARK,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 180,
    height: 48,
  },
  logoPlaceholder: {
    width: 180,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholderText: {
    color: "#e5e7eb",
    fontWeight: "600",
    letterSpacing: 1,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  burgerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  burgerLine: {
    width: 20,
    height: 2,
    backgroundColor: "#e5e7eb",
    marginVertical: 2,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 260,
    backgroundColor: DARK,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  sidebarSectionLabel: {
    color: "#9ca3af",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 1,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  menuItemText: {
    color: "#e5e7eb",
    fontSize: 16,
  },
  menuItemActive: {
    backgroundColor: "#374151",
  },
  content: {
    flex: 1,
    backgroundColor: LIGHT,
  },
  h1: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  p: {
    fontSize: 14,
    color: "#374151",
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
  },
  tableHeaderRow: {
    backgroundColor: "#f3f4f6",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#111827",
    flexShrink: 0, // não encolher abaixo do minWidth
  },
  headerCell: {
    fontWeight: "700",
  },

  cellRightBorder: {
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    width: 280,
    backgroundColor: DARK,
    paddingTop: 16,
  },
  infoRow: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  topBarText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  // Ensure logo has no visible square background by clipping to a circle
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: DARK,
    marginRight: 12,
  },
  logoImg: {
    width: "100%",
    height: "100%",
  },
  tableInner: {
    alignSelf: "flex-start", // <— tamanho = soma das colunas
  },

  modalOverlay: {
    position: "fixed", // ← garante cobertura total no navegador
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // sombra escura
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  /*modalContent: {
    width: 400,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)", // sombra suave
  },*/

  modalButton: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },

  modalCancel: {
    color: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalContent: {
    width: 500,
    maxHeight: "70%", // ✅ permite crescer conforme conteúdo
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    overflow: "visible", // ✅ permite o calendário sair da div
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  },

  modalScrollContent: {
    paddingBottom: 24,
  },

  modalInput: {
    width: "100%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 12,
  },
  pickerWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden", // importante para o radius no web
    backgroundColor: "#fff",
  },

  picker: {
    width: "100%",
    height: 40,
    // no web, isto ajuda a tirar um bocado do “look” default
    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none",
          // alguns browsers respeitam:
          // appearance: "none",
          // WebkitAppearance: "none",
        }
      : {}),
  },
});

export default AdminDashboard;
