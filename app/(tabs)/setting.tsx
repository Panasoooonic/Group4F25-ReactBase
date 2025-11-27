import { getUser } from "@/models/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"; // Removed Alert import
import {
  Button,
  Dialog,
  Provider as PaperProvider,
  Portal,
  TextInput,
} from "react-native-paper";

// Define the type for the toast color
type ToastColor = "success" | "error" | null;

export default function SettingScreen() {
  // Navigation hook
  const router = useRouter();

  // State for Switch (not modified)
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Toast State for bottom notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<ToastColor>(null);

  // Function to display the toast message and hide it after 3 seconds
  const showToast = (message: string, color: ToastColor = "error") => {
    setToastMessage(message);
    setToastColor(color);
    setTimeout(() => {
      setToastMessage(null);
      setToastColor(null);
    }, 3000);
  };

  // Function to close the modal and reset password states
  const resetAndCloseModal = () => {
    setOldPassword("");
    setNewPassword("");
    setShowPasswordModal(false);
  };

  // Fetch user email from AsyncStorage on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        // NOTE: Assuming getUser is a function that retrieves and parses user data
        const user = await getUser();
        if (user != null) {
          setUserEmail(user.email);
        }
      } catch (e) {
        console.error("Failed to load user email for settings:", e);
      }
    };
    fetchUserEmail();
  }, []); // Run only once on mount

  // Validation Check: True if both fields are non-empty
  const isFormValid = oldPassword.length > 0 && newPassword.length > 0;

  const handleChangePassword = async () => {
    if (!userEmail) {
      showToast("User session email not found. Please log in again.", "error");
      return;
    }

    if (!isFormValid) {
      // Show validation error using toast instead of Alert
      showToast("Please fill in both old and new password fields.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/updatepassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // NOTE: If your API requires a Bearer Token for authentication,
          // you would need to fetch and include it here (e.g., 'Authorization: Bearer <token>')
        },
        body: JSON.stringify({
          email: userEmail,
          oldPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        // Password changed successfully
        showToast("Your password has been changed successfully.", "success");

        // Clear fields and close modal
        resetAndCloseModal();
      } else {
        // Handle server-side errors (e.g., wrong old password)
        const errorBody = await response
          .json()
          .catch(() => ({ message: "Unknown error occurred." }));
        // Show server error using toast instead of Alert
        showToast(errorBody.message || "Could not change password.", "error");
      }
    } catch (err) {
      console.error("Change password network error:", err);
      // Show network error using toast instead of Alert
      showToast("Unable to reach the server. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    // Clear user data from storage upon logout
    try {
      await AsyncStorage.removeItem("user");
      console.log("User data cleared.");
    } catch (e) {
      console.error("Error clearing user data on logout:", e);
    }
    // Navigate back to the login screen (root path)
    router.replace("/");
  };

  return (
    <PaperProvider>
      {/* Portal/Dialog must be inside Provider */}
      <Portal>
        <Dialog
          style={{ backgroundColor: "#d6d6d6ff" }}
          visible={showPasswordModal}
          // Change 1: Remove onDismiss to prevent closing when clicking outside
          // onDismiss={() => setShowPasswordModal(false)}
        >
          <Dialog.Title style={{ color: "#000" }}>Change Password</Dialog.Title>
          {/* Status/Loading Indicator */}
          <Dialog.Content>
            {isLoading && (
              <Text
                style={{
                  color: "#1e90ff",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                Processing...
              </Text>
            )}

            <TextInput
              label="Old Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              style={styles.input}
              textColor="#000"
              theme={{
                colors: {
                  primary: "#1e90ff", // label and underline color when focused
                  text: "#000", // text color
                  placeholder: "#555", // label color when not focused
                },
              }}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              textColor="#000"
              theme={{
                colors: {
                  primary: "#1e90ff", // label and underline color when focused
                  text: "#000", // text color
                  placeholder: "#555", // label color when not focused
                },
              }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              textColor="#292929ff"
              onPress={resetAndCloseModal} // Use helper function to close modal
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              textColor={isFormValid && !isLoading ? "#1e90ff" : "#888"}
              onPress={handleChangePassword}
              // Disable button if form is invalid OR request is loading
              disabled={!isFormValid || isLoading}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <Text style={styles.header}>Settings</Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.item}
            onPress={() => setShowPasswordModal(true)}
          >
            <Text style={styles.itemText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemText}>Help & FAQ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container2}>
          {/* Footer */}
          <TouchableOpacity
            style={[styles.buttonContainer, styles.logoutBtn]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change 2: Toast Notification */}
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
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  // ... (Existing styles)
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  container2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    opacity: 0.7,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  itemText: {
    fontSize: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },

  buttonContainer: {
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: 200,
    borderRadius: 60,
    textAlign: "center",
  },

  logoutBtn: {
    backgroundColor: "#d3490dff",
  },
  logoutText: {
    color: "white",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },

  // --- New Toast Styles ---
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24, // Positioned slightly above the bottom edge
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 1000, // Ensure it sits on top of other elements
  },
  toastText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  toastSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.95)", // Green for success
  },
  toastError: {
    backgroundColor: "rgba(239, 68, 68, 0.95)", // Red for error
  },
});
