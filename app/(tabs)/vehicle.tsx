// app/(tabs)/vehicle.tsx
import { getUser } from "@/models/user";
import { Vehicle } from "@/models/vehicle";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FormMode = "create" | "edit";

const emptyForm = {
  id: "",
  model: "",
  make: "",
  year: "",
  plateNo: "",
};

export default function VehicleScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(
    null
  );

  const [form, setForm] = useState({
    ...emptyForm,
  });

  // 1. Fetch User and Vehicles on Load
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const user = await getUser();
      if (user && user.userId) {
        setCurrentUserId(user.userId);
        await fetchVehicles(user.userId);
      } else {
        Alert.alert("Error", "User not found. Please log in.");
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // API: Get Vehicles
  const fetchVehicles = async (userId: string | number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/vehicle/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        // Assuming the API returns the list directly or inside a property
        // Adjust 'data' or 'data.result' based on your exact server response structure
        setVehicles(Array.isArray(data.vehicles) ? data.vehicles : []);
      } else {
        console.error("Failed to fetch vehicles");
      }
    } catch (error) {
      console.error("Network error fetching vehicles:", error);
    }
  };

  // Validation: Check if all fields have text
  const isFormValid =
    form.make.trim().length > 0 &&
    form.model.trim().length > 0 &&
    form.year.trim().length > 0 &&
    form.plateNo.trim().length > 0;

  const openCreateModal = () => {
    setMode("create");
    setForm({ ...emptyForm });
    setModalVisible(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setMode("edit");
    setForm({
      id: String(vehicle.vehicleId),
      model: vehicle.model,
      year: String(vehicle.year),
      plateNo: vehicle.plateNo,
      make: String(vehicle.make), // Ensure make exists in your Vehicle model
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // API: Create or Update
  const handleSubmit = async () => {
    if (!currentUserId) return;

    setIsLoading(true);

    try {
      if (mode === "create") {
        // --- CREATE ---
        const response = await fetch("http://localhost:3000/api/vehicle/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            make: form.make,
            model: form.model,
            year: Number(form.year),
            plateNo: form.plateNo,
          }),
        });

        if (response.ok) {
          Alert.alert("Success", "Vehicle added successfully");
          closeModal();
          fetchVehicles(currentUserId); // Refresh list
        } else {
          Alert.alert("Error", "Failed to add vehicle");
        }
      } else {
        // --- UPDATE ---
        const response = await fetch(
          `http://localhost:3000/api/vehicle/update/${form.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              make: form.make,
              model: form.model,
              year: Number(form.year),
              plateNo: form.plateNo,
            }),
          }
        );

        if (response.ok) {
          Alert.alert("Success", "Vehicle updated successfully");
          closeModal();
          fetchVehicles(currentUserId); // Refresh list
        } else {
          Alert.alert("Error", "Failed to update vehicle");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // API: Delete
  const handleDelete = async () => {
    // console.log(form.id, currentUserId)
    if (!form.id || !currentUserId) return;

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await fetch(
                `http://localhost:3000/api/vehicle/delete/${form.id}`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok) {
                Alert.alert("Deleted", "Vehicle removed successfully");
                closeModal();
                fetchVehicles(currentUserId); // Refresh list
              } else {
                Alert.alert("Error", "Failed to delete vehicle");
              }
            } catch (error) {
              Alert.alert("Error", "Network error occurred");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      onPress={() => openEditModal(item)}
      style={styles.card}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.model}</Text>
        <Text style={styles.cardYear}>{item.year}</Text>
      </View>

      <View style={styles.cardBodyRow}>
        <Text style={styles.cardLabel}>Plate:</Text>
        <Text style={styles.cardValue}>{item.plateNo}</Text>
      </View>
      <View style={styles.cardBodyRow}>
        <Text style={styles.cardLabel}>Make:</Text>
        <Text style={styles.cardValue}>{item.make}</Text>
      </View>
      <View style={styles.cardBodyRow}>
        <Text style={styles.cardLabel}>Model:</Text>
        <Text style={styles.cardValue}>{item.model}</Text>
      </View>
      <View style={styles.cardBodyRow}>
        <Text style={styles.cardLabel}>Trips:</Text>
        {/* Optional chaining in case numberOfTrips is undefined from API */}
        <Text style={styles.cardValue}>{item.numberOfTrips || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Vehicles</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openCreateModal}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* Loading State or List */}
        {isLoading && !modalVisible ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              You have no vehicles yet. Tap + to create one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => String(item.vehicleId)}
            renderItem={renderVehicleCard}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Create / Update Vehicle Modal */}
        <Modal
          transparent
          animationType="slide"
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {mode === "create" ? "Create new vehicle" : "Update vehicle"}
                </Text>
              </View>

              <View style={styles.form}>
                <FormInput
                  label="Make"
                  placeholder="e.g. Toyota"
                  value={form.make}
                  onChangeText={(v) => handleChange("make", v)}
                />
                <FormInput
                  label="Model"
                  placeholder="e.g. Corolla"
                  value={form.model}
                  onChangeText={(v) => handleChange("model", v)}
                />
                <FormInput
                  label="Year"
                  placeholder="e.g. 2022"
                  keyboardType="numeric"
                  value={form.year}
                  onChangeText={(v) => handleChange("year", v)}
                />
                <FormInput
                  label="Plate Number"
                  placeholder="e.g. ABC-123"
                  value={form.plateNo}
                  onChangeText={(v) => handleChange("plateNo", v)}
                />
              </View>

              <View style={styles.modalFooter}>
                {/* Cancel Button */}
                <Pressable
                  style={[styles.footerButton, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={styles.footerButtonText}>Cancel</Text>
                </Pressable>

                {/* Delete Button (Only in Edit Mode) */}
                {mode === "edit" && (
                  <Pressable
                    style={[styles.footerButton, styles.deleteButton]}
                    onPress={handleDelete}
                  >
                    <Text style={[styles.footerButtonText, { color: "white" }]}>
                      Delete
                    </Text>
                  </Pressable>
                )}

                {/* Submit Button */}
                <Pressable
                  style={[
                    styles.footerButton,
                    styles.submitButton,
                    !isFormValid && styles.disabledButton, // Apply disabled style
                  ]}
                  onPress={handleSubmit}
                  disabled={!isFormValid || isLoading} // Disable logic
                >
                  <Text style={styles.submitButtonText}>
                    {mode === "create" ? "Create" : "Update"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

type FormInputProps = {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  onChangeText: (value: string) => void;
};

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  placeholder,
  keyboardType = "default",
  onChangeText,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholderTextColor="#9ca3af"
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: -2,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  cardYear: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  cardBodyRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  cardLabel: {
    fontSize: 13,
    color: "#6b7280",
    width: 90,
  },
  cardValue: {
    fontSize: 13,
    color: "#111827",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalHeader: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  form: {
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 4,
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  footerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 8,
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  deleteButton: {
    backgroundColor: "#ef4444", // Red color for delete
  },
  submitButton: {
    backgroundColor: "#2563eb",
  },
  disabledButton: {
    backgroundColor: "#93c5fd", // Light blue for disabled state
  },
  footerButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
