// utils/logoutHelper.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function logout(navigation) {
  try {
    await AsyncStorage.clear(); // ou remove apenas os dados de login
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }], // substitui para a tela de login
    });
  } catch (err) {
    console.error("Erro ao fazer logout:", err);
  }
}
