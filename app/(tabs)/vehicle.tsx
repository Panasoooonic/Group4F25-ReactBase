// app/(tabs)/vehicle.tsx
import { Vehicle } from "@/models/vehicle";
import React, { useState } from "react";
import {
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

export const mockVehicles: Vehicle[] = [
  {
    id: "v-1",
    model: "Toyota Corolla SE",
    label: "Toyota Corolla SE",
    year: 2020,
    plateNo: "ABC-123",
    licenseNo: "ON-1234567",
    numberOfTrips: 18,
  },
  {
    id: "v-2",
    model: "Honda Civic Sport",
    label: "Honda Civic Sport",
    year: 2022,
    plateNo: "CIV-987",
    licenseNo: "ON-5432109",
    numberOfTrips: 7,
  },
  {
    id: "v-3",
    model: "Ford F-150 XLT",
    label: "Ford F-150 XLT",
    year: 2019,
    plateNo: "TRK-555",
    licenseNo: "ON-7773331",
    numberOfTrips: 25,
  },
];

const emptyForm = {
  id: "",
  model: "",
  label: "",
  year: "",
  plateNo: "",
  licenseNo: "",
};

export default function VehicleScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [form, setForm] = useState({
    ...emptyForm,
  });

  const openCreateModal = () => {
    setMode("create");
    setForm({ ...emptyForm });
    setModalVisible(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setMode("edit");
    setForm({
      id: vehicle.id,
      model: vehicle.model,
      label: String(vehicle.label),
      year: String(vehicle.year),
      plateNo: vehicle.plateNo,
      licenseNo: vehicle.licenseNo,
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Structure data the way backend expects
    const payload: Vehicle = {
      id: form.id || `v-${Date.now()}`,
      model: form.model.trim(),
      label: form.label.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      plateNo: form.plateNo.trim(),
      licenseNo: form.licenseNo.trim(),
    };

    // For now: just log data as requested
    console.log(`[${mode.toUpperCase()} VEHICLE]`, payload);

    // Optional: update local state so UI feels real
    if (mode === "create") {
      setVehicles((prev) => [...prev, payload]);
    } else {
      setVehicles((prev) =>
        prev.map((v) => (v.id === payload.id ? payload : v))
      );
    }

    closeModal();
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
        <Text style={styles.cardLabel}>License #:</Text>
        <Text style={styles.cardValue}>{item.licenseNo}</Text>
      </View>
      <View style={styles.cardBodyRow}>
        <Text style={styles.cardLabel}>Trips:</Text>
        <Text style={styles.cardValue}>{item.numberOfTrips}</Text>
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

        {/* Vehicle list */}
        {vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              You have no vehicles yet. Tap + to create one.
            </Text>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
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
                  label="Label"
                  placeholder="e.g. Car A"
                  value={form.label}
                  onChangeText={(v) => handleChange("label", v)}
                />
                <FormInput
                  label="Model"
                  placeholder="e.g. Toyota Corolla SE"
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
                <FormInput
                  label="License Number"
                  placeholder="e.g. ON-1234567"
                  value={form.licenseNo}
                  onChangeText={(v) => handleChange("licenseNo", v)}
                />
              </View>

              <View style={styles.modalFooter}>
                <Pressable
                  style={[styles.footerButton, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={styles.footerButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.footerButton, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.footerButtonText}>
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
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  submitButton: {
    backgroundColor: "#2563eb",
  },
  footerButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
});
