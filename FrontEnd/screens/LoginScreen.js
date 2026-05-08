// screens/LoginScreen.js

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { login } from "../src/services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const colors = {
  primary: "#2e86de",
  secondary: "#ff7b00",
  white: "#FFFFFF",
  black: "#212121",
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  console.log("[LoginScreen] render", { email, password, loading });

  async function handleLogin() {
    Alert.alert("Debug", "handleLogin foi acionado!");
    console.log("[LoginScreen] handleLogin called", { email, password });

    if (!email || !password) {
      Alert.alert("Atenção", "Por favor, preencha e-mail e Password.");
      return;
    }

    try {
      setLoading(true);
      const user = await login({ email, password });
      console.log("[LoginScreen] login response user:", user);

      // mapeia role de forma robusta
      const roleFromApi = (user?.role || (user?.is_admin ? "ADMIN" : "AERO"))
        .toString()
        .toUpperCase();

      const userToStore = {
        id: user?.id,
        name: user?.name || user?.email || "",
        email: user?.email,
        role: roleFromApi,
        region: user?.region ?? user?.Region ?? "", // <<=== IMPORTANTE
      };

      console.log("[LoginScreen] userToStore", userToStore);

      await AsyncStorage.setItem("user", JSON.stringify(userToStore)); // <<=== GRAVA

      // role pode vir da resposta do login; usas o que já salvaste em userToStore
      const role = (userToStore?.role || "").toUpperCase();

      // ADMIN vai para AdminDashboard; os restantes continuam no fluxo atual
      const nextRoute = role === "ADMIN" ? "AdminDashboard" : "ChangeVehicle";

      navigation.reset({ index: 0, routes: [{ name: nextRoute }] });
    } catch (err) {
      console.error(
        "[LoginScreen] login error",
        err.response?.data || err.message,
      );
      const errorMessage = err?.response?.data?.error || err.message || "";

      const error = err.response?.data?.error || "Falha ao autenticar.";
      setErrorMessage(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Image
          source={require("../assets/AccidentReportIcon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            editable={!loading}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage(""); // limpa erro
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            editable={!loading}
            onChangeText={(text) => {
              setPassword(text);
              setErrorMessage(""); // limpa erro
            }}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        {errorMessage !== "" && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate("SignUp")}
          disabled={loading}
        >
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 24,
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  linkContainer: {
    marginTop: 16,
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#dc2626", // vermelho
    marginTop: 12,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
