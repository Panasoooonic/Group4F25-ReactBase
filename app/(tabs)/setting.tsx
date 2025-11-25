import { Link } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Dialog, Provider as PaperProvider, Portal, TextInput } from "react-native-paper";

export default function SettingScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  // moved inside component
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleConfirmPassword = () => {
    // TODO: replace with real validation / API call
    console.log("Old:", oldPassword);
    console.log("New:", newPassword);
    // clear fields (optional)
    setOldPassword("");
    setNewPassword("");
    setShowPasswordModal(false);
  };

  return (
    <PaperProvider>
      {/* Portal/Dialog must be inside Provider */}
      <Portal>
        <Dialog style= {{ backgroundColor: "#d6d6d6ff",}} visible={showPasswordModal} onDismiss={() => setShowPasswordModal(false)}>

           <Dialog.Title style={{ color: "#000" }}>Change Password</Dialog.Title>
            <Dialog.Content>
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
                  text: "#000",        // text color
                  placeholder: "#555"  // label color when not focused
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
                  text: "#000",        // text color
                  placeholder: "#555"  // label color when not focused
                },
              }}
              />
          </Dialog.Content>
          <Dialog.Actions>
            <Button textColor="#292929ff" onPress={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button textColor="#292929ff" onPress={handleConfirmPassword}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.header}>Settings</Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.item} onPress={() => setShowPasswordModal(true)}>
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
          <Link href="/">
            <TouchableOpacity style={[styles.buttonContainer, styles.logoutBtn]}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
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
});