import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_URL } from "@/constants/api";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<"success" | "error">("error");

  const registerOnPress = async () => {
    setToastMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL + "/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:8081",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        // Success notification
        setToastColor("success");
        setToastMessage("Account created successfully!");

        setTimeout(() => {
          setToastMessage(null);
          router.replace("/"); // back to login page
        }, 1500);
      } else {
        // Error notification
        setToastColor("error");
        setToastMessage(data?.message || "Registration failed.");

        setTimeout(() => {
          setToastMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error("Register error:", err);

      setToastColor("error");
      setToastMessage("Unable to reach server. Please try again.");

      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* FIRST NAME */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{ uri: "https://img.icons8.com/ios-filled/512/user.png" }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      {/* LAST NAME */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{ uri: "https://img.icons8.com/ios-filled/512/user.png" }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      {/* EMAIL */}
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
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* PASSWORD */}
      <View style={styles.inputContainer}>
        <Image
          style={[styles.icon, styles.inputIcon]}
          source={{ uri: "https://img.icons8.com/ios-glyphs/512/key.png" }}
        />
        <TextInput
          style={styles.inputs}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* REGISTER BUTTON */}
      <TouchableOpacity
        style={[styles.buttonContainer, styles.loginButton]}
        onPress={registerOnPress}
      >
        <Text style={styles.loginText}>
          {isLoading ? "Registering..." : "Register"}
        </Text>
      </TouchableOpacity>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <View
          style={[
            styles.toast,
            toastColor === "success" ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
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
  },
  loginButton: {
    backgroundColor: "#3498db",
  },
  loginText: {
    color: "white",
  },

  /* Toast Notification */
  toast: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toastText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  toastSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.95)", // green
  },
  toastError: {
    backgroundColor: "rgba(239, 68, 68, 0.95)", // red
  },
});
