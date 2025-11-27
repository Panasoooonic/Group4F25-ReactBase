import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Link, useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginOnPress = async () => {
    // Clear any previous error
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        // (Optional) read body if you need token/user info
        // const data = await response.json();

        router.replace("/(tabs)/dashboard");
      } else {
        // Non-200 response → show error notification
        let serverMessage = "Login failed. Please check your credentials.";

        try {
          const errorBody = await response.json();
          if (errorBody?.message) {
            serverMessage = errorBody.message;
          }
        } catch {
          // ignore JSON parse errors and use default message
        }

        setErrorMessage(serverMessage);

        // Hide notification after 5 seconds
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Unable to reach server. Please try again.");

      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Email input */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{
            uri: "https://img.icons8.com/ios-filled/512/circled-envelope.png",
          }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password input */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{ uri: "https://img.icons8.com/ios-glyphs/512/key.png" }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Password"
          secureTextEntry
          underlineColorAndroid="transparent"
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Login button */}
      <TouchableOpacity
        style={[styles.buttonContainer, styles.loginButton]}
        onPress={loginOnPress}
        disabled={isLoading}
      >
        <Text style={styles.loginText}>
          {isLoading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Register link */}
      <Link href="/signup" style={styles.buttonContainer}>
        <Text>Register</Text>
      </Link>

      {/* Error toast */}
      {errorMessage && (
        <View style={styles.errorToast}>
          <Text style={styles.errorToastText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B0E0E6",
  },
  inputContainer: {
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 250,
    height: 45,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: "#FFFFFF",
    flex: 1,
  },
  icon: {
    width: 30,
    height: 30,
  },
  inputIcon: {
    marginLeft: 15,
    justifyContent: "center",
  },
  buttonContainer: {
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#3498db",
  },
  loginText: {
    color: "white",
  },
  errorToast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(239, 68, 68, 0.95)",
    borderRadius: 8,
  },
  errorToastText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});
