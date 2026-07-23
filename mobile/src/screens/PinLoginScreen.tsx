import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function PinLoginScreen() {
  const { shopName, login } = useAuth();
  const [pin, setPin] = useState("");

  async function handleLogin() {
    if (pin.length !== 4) {
      Alert.alert("Fehler", "PIN muss 4 Ziffern sein.");
      return;
    }
    const ok = await login(pin);
    if (!ok) {
      Alert.alert("Falsche PIN", "Bitte erneut versuchen.");
      setPin("");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.shopName}>{shopName}</Text>
      <Text style={styles.title}>PIN eingeben</Text>

      <TextInput
        style={styles.pinInput}
        placeholder="••••"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
        autoFocus
        onSubmitEditing={handleLogin}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entsperren</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f766e",
    padding: 24,
  },
  shopName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: "#ccfbf1",
    marginBottom: 32,
  },
  pinInput: {
    width: 200,
    borderWidth: 2,
    borderColor: "#5eead4",
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#115e59",
    letterSpacing: 8,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#0f766e",
    fontSize: 18,
    fontWeight: "bold",
  },
});
