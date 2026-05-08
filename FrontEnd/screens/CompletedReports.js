import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuTopBar from "../components/MenuTopBar";
import { useRoute } from "@react-navigation/native";
import { loadDraftFromBackend } from "../utils/draftService";
import { setReportData } from "../data/reportData";
import { Alert } from "react-native";

// URL da sua API
const API_URL = "http://localhost:3000";

const CompletedReports = ({ navigation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [documents, setDocuments] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shift, setShift] = useState("");
  const [busyId, setBusyId] = useState(null); // report_number ou id a processar
  const [rejectText, setRejectText] = useState("");
  const [rejectDoc, setRejectDoc] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const route = useRoute();
  const params = route.params || {};
  const scope = params.scope || "mine"; // 'mine' | 'team'
  const status = params.status || "completed"; // 'completed' | 'uncompleted' | 'all'
  const paramShift = typeof params.shift === "string" ? params.shift : "";

  const STATE = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  };

  useEffect(() => {
    // carrega user e shift selecionado
    (async () => {
      const [name, savedShift] = await Promise.all([
        AsyncStorage.getItem("userName"),
        AsyncStorage.getItem("selectedShift"),
      ]);
      if (name) setUserName(name);
      // prioridade ao shift vindo por parâmetro; senão, usa o guardado
      setShift(paramShift || savedShift || "");
    })();

    const fetchReports = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");
        if (!name) throw new Error("Usuário não logado");

        setUserName(name);

        if (status === "uncompleted") {
          // ===== INCOMPLETOS (rascunhos do utilizador) =====
          const res = await fetch(
            `${API_URL}/api/reports/drafts?user=${encodeURIComponent(name)}`,
          );
          if (!res.ok) throw new Error("Erro ao buscar rascunhos");
          const data = await res.json(); // [{report_number, user, updated_at, ...}]
          setDrafts(data);
          setDocuments([]);
        } else {
          // ===== COMPLETOS / ALL =====
          const res = await fetch(`${API_URL}/api/upload/list`);
          if (!res.ok) throw new Error("Erro ao buscar documentos");
          const data = await res.json();

          // 1) Filtra por scope (meus vs equipa)
          let scoped = data;
          if (scope === "mine") {
            scoped = data.filter(
              (doc) => doc.user?.toLowerCase() === name.toLowerCase(),
            );
          }

          // 2) Filtra por status (completed/all)
          const isCompleted = (doc) =>
            typeof doc.completed === "boolean" ? doc.completed : true;

          // 3) Se for 'all', filtra pelo SHIFT selecionado
          const matchesShift = (doc, s) => {
            if (!s) return true; // sem shift selecionado => não filtra
            const S = String(s).toLowerCase().trim();
            // o campo correto vindo da API é 'Shift'
            const value = doc?.Shift; // pode vir "Dia", "Noite", ids, etc.
            if (value === undefined || value === null) return false;
            return String(value).toLowerCase().trim() === S;
          };

          // é crítico se está PENDING e nível entre 15 e 25
          const isCritical = (doc) =>
            isPending(doc) && getLevel(doc) >= 15 && getLevel(doc) <= 25;

          // novo: "pendente" = state === "PENDING" vindo de reports_list
          const isPending = (doc) =>
            String(doc?.state || "").toUpperCase() === "PENDING";

          const isApproved = (doc) =>
            String(doc?.state || "").toUpperCase() === "APPROVED";

          // 3) Montagem final
          let finalList = scoped;
          if (status === "pending") {
            finalList = scoped
              .filter(isPending)
              .filter((d) => matchesShift(d, shift));
          } else if (status === "approved") {
            finalList = scoped
              .filter(isApproved)
              .filter((d) => matchesShift(d, shift));
          } else if (status === "critical") {
            // <<< NOVO: Critical Alerts
            // Só PENDING com level 15..25 (sem restringir por shift, a menos que queiras)
            finalList = scoped
              .filter(isCritical)
              .filter((d) => matchesShift(d, shift));
            // se quiseres também respeitar o shift selecionado, usa:
          } else if (status === "completed") {
            finalList = scoped.filter(isCompleted);
          } else if (status === "all") {
            finalList = scoped.filter((d) => matchesShift(d, shift));
          }

          setDocuments(finalList);
          setDrafts([]);
        }
      } catch (err) {
        console.error("Erro ao carregar relatórios:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [scope, status, paramShift, shift]);

  // nível do doc como número seguro
  const getLevel = (doc) => {
    const n = Number(doc?.level);
    return Number.isFinite(n) ? n : 0;
  };

  const levelBg = (n) => {
    if (n >= 15) return "#ff1500ff"; // muito crítico
    if (n >= 10) return "#ff8a80"; // muito crítico
    if (n >= 5) return "#ffd180"; // crítico
    if (n >= 1) return "#2afc00ff"; // leve >0
    return "#eee"; // sem nível
  };

  const badgeBgFor = (s) => {
    const v = String(s || "").toUpperCase();
    if (v === "APPROVED") return "#c8f7c5";
    if (v === "REJECTED") return "#ffcdd2";
    return "#ffe8a1"; // PENDING (ou desconhecido)
  };

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      // local — se preferir UTC troque por: timeZone: "UTC"
      const fmt = new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return fmt.format(d).replace(",", ""); // tira a vírgula entre data e hora
    } catch {
      return iso;
    }
  };

  const handleApproveReject = async (doc, nextState, reason) => {
    try {
      setBusyId(doc.report_number || doc.id);

      // 1) obter o ID do utilizador atual
      let userId = null;
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId !== null && storedUserId !== undefined) {
        const n = Number(storedUserId);
        userId = Number.isNaN(n) ? null : n;
      }
      // fallback: ler do objeto "user" se ainda não existir "userId"
      if (userId === null) {
        const rawUser = await AsyncStorage.getItem("user");
        if (rawUser) {
          try {
            const obj = JSON.parse(rawUser);
            const n = Number(obj?.id);
            if (!Number.isNaN(n)) userId = n;
          } catch {}
        }
      }
      // (opcional) debug:
      // console.log("validate_by que vou enviar:", userId);
      await updateReportState({
        report_number: doc.report_number,
        state: nextState,
        rejected_why: reason, // só na rejeição
        validate_by: userId, // id de quem aprovou/rejeitou
      });

      // Se estás na vista "Pending", remove da lista (já não é PENDING)
      if (status === "pending") {
        setDocuments((prev) =>
          prev.filter(
            (d) => (d.report_number || d.id) !== (doc.report_number || doc.id),
          ),
        );
      } else {
        // Noutros modos, só reflete o novo state
        setDocuments((prev) =>
          prev.map((d) =>
            (d.report_number || d.id) === (doc.report_number || doc.id)
              ? { ...d, state: nextState }
              : d,
          ),
        );
      }
    } catch (err) {
      alert(`Falha ao atualizar estado: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  // chama o backend para atualizar o estado do report
  async function updateReportState({
    report_number,
    state,
    rejected_why,
    validate_by,
  }) {
    const payload = {
      report_number,
      state,
      ...(rejected_why ? { rejected_why } : {}),
      ...(validate_by !== undefined && validate_by !== null
        ? { validate_by }
        : {}),
    };
    // Tenta post
    let res = await fetch(`${API_URL}/api/upload/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!res || !res.ok) {
      const msg = res
        ? await res.text().catch(() => "Update failed")
        : "Network error";
      throw new Error(msg);
    }
    return res.json().catch(() => ({}));
  }

  const toggleMenu = () => setShowMenu((prev) => !prev);

  // ===== Abrir rascunho (como em UncompletedReports) =====
  const resumeDraft = async (reportNumber) => {
    try {
      await AsyncStorage.setItem("nextReportNumber", String(reportNumber));
      const draft = await loadDraftFromBackend(reportNumber);
      const payload =
        typeof draft?.data === "string" ? JSON.parse(draft.data) : draft?.data;
      await setReportData(payload, { merge: false, keepLocalFiles: true });
      navigation.navigate("CheckListVehicle", { fromDraft: true });
    } catch (err) {
      console.error("Erro ao abrir rascunho:", err);
      Alert.alert("Erro", "Não foi possível abrir o rascunho.");
    }
  };

  const openDocument = (reportNumber, filename) => {
    const cleanFilename = filename.replace(`${reportNumber}/`, "");
    const encodedFile = encodeURIComponent(cleanFilename);
    const url = `${API_URL}/api/upload/download/${reportNumber}/${encodedFile}`;
    Linking.openURL(url).catch((err) =>
      console.error("Erro ao abrir documento", err),
    );
  };

  const openRejectModal = (doc) => {
    setRejectDoc(doc);
    setRejectText("");
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    const reason = (rejectText || "").trim();
    if (!reason) {
      Alert.alert(
        "Required justification",
        "Write the reason for rejection (up to 120 characters).",
      );
      return;
    }
    if (reason.length > 120) {
      Alert.alert("Text too long", "Limit to 120 characters, please.");
      return;
    }
    setRejectModalVisible(false);
    await handleApproveReject(rejectDoc, STATE.REJECTED, reason);
  };

  return (
    <View style={styles.container}>
      <MenuTopBar
        showMenu={showMenu}
        toggleMenu={() => setShowMenu((prev) => !prev)}
        navigation={navigation}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {status === "uncompleted"
            ? "My Uncompleted Reports"
            : scope === "team"
              ? status === "all"
                ? `Team Reports${shift ? ` — ${shift}` : ""}`
                : status === "approved"
                  ? `Team Approved Reports${shift ? ` — ${shift}` : ""}`
                  : status === "pending"
                    ? `Team Pending Approvals${shift ? ` — ${shift}` : ""}`
                    : status === "critical"
                      ? "Critical Alerts" // <<< NOVO
                      : "Team Completed Reports"
              : status === "completed"
                ? "My Completed Reports"
                : `My Reports${shift ? ` — ${shift}` : ""}`}
        </Text>
      </View>

      {loading && (
        <Text style={styles.statusText}>Carregando documentos...</Text>
      )}
      {error && (
        <Text style={[styles.statusText, styles.errorText]}>{error}</Text>
      )}

      {!loading && !error && status !== "uncompleted" && (
        // ===== LISTA DE COMPLETOS / ALL =====
        <ScrollView contentContainerStyle={styles.list}>
          {documents.length === 0 && (
            <Text style={styles.statusText}>Sem relatórios para mostrar.</Text>
          )}
          {documents.map((doc) => (
            <TouchableOpacity
              key={doc.filename}
              style={[
                styles.card,
                status === "critical" && { backgroundColor: "#ffecec" },
              ]}
              activeOpacity={0.7}
              onPress={() => openDocument(doc.report_number, doc.filename)}
            >
              <View style={styles.left}>
                <Text style={styles.number}>{doc.filename}</Text>
                <Text style={styles.label}>Report Number</Text>
                <Text style={styles.value}>{doc.report_number || "—"}</Text>

                {status === "pending" && (
                  <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      accessibilityLabel="Approve report"
                      onPress={() => handleApproveReject(doc, STATE.APPROVED)}
                      disabled={busyId === (doc.report_number || doc.id)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: "#e8f5e9",
                        opacity:
                          busyId === (doc.report_number || doc.id) ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ fontWeight: "600" }}>
                        {busyId === (doc.report_number || doc.id)
                          ? "Aproving..."
                          : "Approve"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      accessibilityLabel="Reject report"
                      onPress={() => openRejectModal(doc)}
                      disabled={busyId === (doc.report_number || doc.id)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: "#ffebee",
                        opacity:
                          busyId === (doc.report_number || doc.id) ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ fontWeight: "600" }}>
                        {busyId === (doc.report_number || doc.id)
                          ? "Rejecting..."
                          : "Reject"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.right}>
                {/* badge de estado (já existia) */}
                {scope === "mine" && status === "completed" && !!doc.state && (
                  <Text
                    style={[
                      styles.badge,
                      {
                        alignSelf: "flex-end",
                        backgroundColor: badgeBgFor(doc.state),
                      },
                    ]}
                  >
                    {String(doc.state).toUpperCase()}
                  </Text>
                )}

                {/* badge único de LEVEL (team + critical) */}
                {(scope === "team" || status === "critical") &&
                  getLevel(doc) > 0 && (
                    <Text
                      style={[
                        styles.badge,
                        {
                          alignSelf: "flex-end",
                          backgroundColor:
                            status === "critical"
                              ? "#ff8a80"
                              : levelBg(getLevel(doc)),
                          marginTop: 4,
                        },
                      ]}
                    >
                      {`LEVEL ${getLevel(doc)}`}
                    </Text>
                  )}

                {scope === "mine" &&
                  status === "completed" &&
                  (doc.validate_by != null || !!doc.validator_name) && (
                    <View style={{ marginTop: 6, marginBottom: 6 }}>
                      <Text style={[styles.labelSmall]}>Validated by</Text>
                      <Text style={styles.valueSmall}>
                        {doc.validator_name
                          ? doc.validator_name
                          : `#${doc.validate_by}`}
                      </Text>
                      <Text style={styles.labelSmall}>Referenced</Text>
                      <Text style={styles.valueSmall}>
                        {doc.employer_name || "—"}
                      </Text>
                    </View>
                  )}

                {/* Team Approved → quem aprovou */}
                {scope === "team" &&
                  status === "approved" &&
                  (doc.validate_by != null || !!doc.validator_name) && (
                    <View style={{ marginTop: 6, marginBottom: 6 }}>
                      <Text style={styles.labelSmall}>Validated by</Text>
                      <Text style={styles.valueSmall}>
                        {doc.validator_name
                          ? doc.validator_name
                          : `#${doc.validate_by}`}
                      </Text>
                    </View>
                  )}
                {/* Se foi REJECTED, mostrar motivo */}
                {scope === "mine" &&
                  status === "completed" &&
                  String(doc.state).toUpperCase() === "REJECTED" &&
                  !!doc.rejected_why && (
                    <View style={{ marginBottom: 6, maxWidth: 220 }}>
                      <Text style={styles.labelSmall}>Reason</Text>
                      <Text style={styles.valueSmall} numberOfLines={3}>
                        {doc.rejected_why}
                      </Text>
                    </View>
                  )}
                <Text style={[styles.labelSmall]}>Reported by</Text>
                <Text style={styles.valueSmall}>
                  {doc.user ? doc.user : `#${doc.validate_by}`}
                </Text>
                {!(scope === "mine" && status === "completed") && (
                  <>
                    <Text style={styles.labelSmall}>Referenced</Text>
                    <Text style={styles.valueSmall}>
                      {doc.employer_name || "—"}
                    </Text>
                  </>
                )}
                <Text style={[styles.labelSmall, { marginTop: 8 }]}>
                  Date/Time
                </Text>
                <Text style={styles.valueSmall}>
                  {formatDateTime(
                    scope === "mine" && status === "completed"
                      ? doc.validate_stamp || doc.datetime
                      : doc.datetime,
                  )}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {!loading && !error && status === "uncompleted" && (
        // ===== LISTA DE RASCUNHOS (MEUS INCOMPLETOS) =====
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
      {rejectModalVisible && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
              Reason for rejection
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{ color: "#888", fontSize: 12, marginBottom: 4 }}
              >{`${rejectText.length}/120`}</Text>
              <TextInput
                placeholder="Briefly describe why it was rejected…"
                value={rejectText}
                onChangeText={setRejectText}
                maxLength={120}
                multiline
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                  <Text style={{ fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmReject}>
                  <Text style={{ fontWeight: "700", color: "#b00020" }}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
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
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    marginBottom: 12,
    padding: 12,
    alignItems: "flex-start",
  },
  left: { flex: 2 },
  right: { flex: 1, alignItems: "flex-end" },
  number: { fontSize: 20, fontWeight: "600", color: "#333" },
  label: { fontSize: 12, marginTop: 4, color: "#555" },
  value: { fontSize: 14, fontWeight: "500", color: "#222" },
  labelSmall: { fontSize: 12, color: "#555", textAlign: "right" },
  valueSmall: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222",
    textAlign: "right",
  },
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

export default CompletedReports;
