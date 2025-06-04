// screens/HomeScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accident Report</Text>
        <Text style={styles.subtitle}>Choose one option</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            /* Navegar para outra tela ou ação */
          }}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/airplane.png")} // Altere para o caminho da sua imagem
              style={styles.buttonImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CheckListVehicle")}
        >
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/car.png")} // Altere para o caminho da sua imagem
              style={styles.buttonImageCar}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  buttonsContainer: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#e0e0e0",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 8,
    marginBottom: 20,
    width: Platform.OS === "web" ? "50%" : "80%",
    height: Platform.OS === "web" ? 150 : 120, // Slightly taller on web
    overflow: "hidden",
    alignSelf: "center", // Ensures proper centering
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  buttonImage: {
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  buttonImageCar: {
    width: "80%",
    height: "80%",
    maxWidth: "80%",
    maxHeight: "80%",
  },
});

export default HomeScreen;
