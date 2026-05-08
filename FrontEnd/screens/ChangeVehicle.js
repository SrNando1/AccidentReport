import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuTopBar from "../components/MenuTopBar";
import API from "../src/services/api";
import eventBus from "../utils/eventBus";

const ChangeVehicle = ({ navigation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPlate, setSelectedPlate] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedShift, setSelectedShift] = useState(""); // ⬅️ novo
  const [role, setRole] = useState(""); // ⬅️ novo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRegion, setUserRegion] = useState("");

  // calcula SUP em cada render
  const normalizedRole = (role || "").toString().trim().toUpperCase();
  const isSUP = normalizedRole === "SUP";

  const handleSelectVehicle = async (vehicle) => {
    await AsyncStorage.setItem("selectedVehicle", String(vehicle.id));
    await AsyncStorage.setItem("selectedPlate", vehicle.plate_number ?? "");
    setSelectedId(String(vehicle.id));
    setSelectedPlate(vehicle.plate_number ?? "");
    eventBus.emit("vehicleChanged", vehicle.plate_number ?? vehicle.id);
    navigation.navigate("CheckListVehicle", {
      selectedVehicle: String(vehicle.id),
      selectedPlate: vehicle.plate_number ?? "",
      refresh: Date.now(), // força re-render na próxima screen se precisares
    });
  };

  const handleSelectShift = async (shift) => {
    await AsyncStorage.setItem("selectedShift", shift);
    setSelectedShift(shift);
    eventBus.emit("shiftChanged", shift);
    navigation.navigate("CheckListVehicle", {
      selectedShift: shift,
      refresh: Date.now(),
    });
  };

  const renderItem = ({ item }) => {
    const isSelected = String(item.id) === String(selectedId);
    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.selectedRow]}
        onPress={() => handleSelectVehicle(item)}
      >
        <Text style={[styles.leftText, isSelected && styles.selectedText]}>
          {item.plate_number ?? item.id}
        </Text>
        <Text style={[styles.rightText, isSelected && styles.selectedText]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderShiftItem = ({ item }) => {
    const isSelected = item === selectedShift;
    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.selectedRow]}
        onPress={() => handleSelectShift(item)}
      >
        <Text style={[styles.leftText, isSelected && styles.selectedText]}>
          {`Shift ${item}`}
        </Text>
        <Text style={[styles.rightText, isSelected && styles.selectedText]}>
          {isSelected ? "Selected" : "Select"}
        </Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    (async () => {
      try {
        // 1) ler user (onde está o role) + restantes chaves
        const [rawUser, nameLegacy, savedShift, savedId, savedPlate] =
          await Promise.all([
            AsyncStorage.getItem("user"),
            AsyncStorage.getItem("userName"),
            AsyncStorage.getItem("selectedShift"),
            AsyncStorage.getItem("selectedVehicle"),
            AsyncStorage.getItem("selectedPlate"),
          ]);

        if (rawUser) {
          try {
            const u = JSON.parse(rawUser);
            if (u?.role) setRole(u.role); // ⬅️ AQUI ESTÁ O ROLE
            if (u?.name) setUserName(u.name);
            if (u?.region) setUserRegion(String(u.region));
          } catch (e) {
            console.warn("user JSON parse error:", e);
          }
        }
        if (nameLegacy && !userName) setUserName(nameLegacy);
        if (savedShift) setSelectedShift(savedShift);
        if (savedId) setSelectedId(savedId);
        if (savedPlate) setSelectedPlate(savedPlate);

        // 2) carregar vehicles apenas se NÃO for SUP
        const roleNow = (JSON.parse(rawUser || "{}")?.role || "").toUpperCase();
        if (roleNow !== "SUP") {
          const regionNow = String(
            JSON.parse(rawUser || "{}")?.region || "",
          ).trim();

          const qs = new URLSearchParams();
          qs.set("activeOnly", "1");
          if (regionNow) qs.set("region", regionNow);
          console.log("USER region:", JSON.parse(rawUser || "{}")?.region);

          const { data } = await API.get(`/vehicles?${qs.toString()}`);

          setVehicles(
            (Array.isArray(data) ? data : []).map((v) => ({
              ...v,
              id: String(v.id),
            })),
          );

          // region do user (normalizada)
          const uRegion = String(JSON.parse(rawUser || "{}")?.region || "")
            .trim()
            .toLowerCase();

          const list = (Array.isArray(data) ? data : [])
            .filter((v) => {
              // se o user não tiver region, não filtra
              if (!uRegion) return true;
              return (
                String(v?.region || "")
                  .trim()
                  .toLowerCase() === uRegion
              );
            })
            .map((v) => ({ ...v, id: String(v.id) }));

          setVehicles(list);
        }
      } catch (e) {
        console.error(e);
        setError("Falha a carregar dados");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <>
        <MenuTopBar
          showMenu={showMenu}
          toggleMenu={() => setShowMenu((p) => !p)}
          navigation={navigation}
        />
        <View style={[styles.container, { paddingVertical: 24 }]}>
          <Text>A carregar…</Text>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MenuTopBar
          showMenu={showMenu}
          toggleMenu={() => setShowMenu((p) => !p)}
          navigation={navigation}
        />
        <View style={[styles.container, { paddingVertical: 24 }]}>
          <Text>{error}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <MenuTopBar
        showMenu={showMenu}
        toggleMenu={() => setShowMenu((p) => !p)}
        navigation={navigation}
      />

      <ScrollView style={styles.container}>
        <FlatList
          data={isSUP ? ["A", "B", "C"] : vehicles}
          renderItem={isSUP ? renderShiftItem : renderItem}
          keyExtractor={(item) => (isSUP ? item : item.id)}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedRow: { backgroundColor: "#5e5e5eff" },
  leftText: { fontSize: 16, fontWeight: "bold" },
  rightText: { fontSize: 16, color: "#5e5e5eff" },
  selectedText: { color: "#ffffffff" },
});

export default ChangeVehicle;
