import { Vehicle } from "@/models/vehicle";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MOCK_VEHICLES: Vehicle[] = [
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

export default function Dashboard() {
  const [isTracking, setIsTracking] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    MOCK_VEHICLES[0]?.id ?? ""
  );

  // Placeholder telemetry values for now.
  // Later WE can replace these with real sensor data (GPS + accelerometer).
  const [speedKmh] = useState<number>(0);
  const [accelMps2] = useState<number>(0);
  const [location] = useState<{ lat?: number; lon?: number }>({});

  const handleToggleTracking = () => {
    // Plug in start/stop telemetry logic here
    setIsTracking((prev) => !prev);
  };

  const selectedVehicle = MOCK_VEHICLES.find((v) => v.id === selectedVehicleId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greetingText}>Hello John</Text>
          <Text style={styles.subtitleText}>Start a new trip now</Text>
        </View>

        {/* Vehicle selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select vehicle</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedVehicleId}
              onValueChange={(itemValue) => setSelectedVehicleId(itemValue)}
              style={styles.picker}
            >
              {MOCK_VEHICLES.map((vehicle) => (
                <Picker.Item
                  key={vehicle.id}
                  label={vehicle.model}
                  value={vehicle.id}
                />
              ))}
            </Picker>
          </View>
          {selectedVehicle && (
            <Text style={styles.selectedVehicleText}>
              Current vehicle:{" "}
              <Text style={styles.selectedVehicleName}>
                {selectedVehicle.model}
              </Text>
            </Text>
          )}
        </View>

        {/* Big Start / Stop button */}
        <View style={styles.centerSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleTracking}
            style={[
              styles.mainButton,
              isTracking ? styles.stopButton : styles.startButton,
            ]}
          >
            <Text style={styles.mainButtonText}>
              {isTracking ? "Stop Trip" : "Start Trip"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Telemetry display */}
        <View style={styles.telemetrySection}>
          <Text style={styles.telemetryTitle}>Live Trip Data</Text>
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryCard}>
              <Text style={styles.telemetryLabel}>Speed</Text>
              <Text style={styles.telemetryValue}>
                {speedKmh.toFixed(1)} km/h
              </Text>
            </View>

            <View style={styles.telemetryCard}>
              <Text style={styles.telemetryLabel}>Acceleration</Text>
              <Text style={styles.telemetryValue}>
                {accelMps2.toFixed(2)} m/s²
              </Text>
            </View>
          </View>

          <View style={styles.telemetryCardFull}>
            <Text style={styles.telemetryLabel}>Location</Text>
            {location.lat != null && location.lon != null ? (
              <Text style={styles.telemetryValue}>
                {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
              </Text>
            ) : (
              <Text style={styles.telemetryPlaceholder}>
                Waiting for GPS signal…
              </Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
    marginTop: 8,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitleText: {
    marginTop: 4,
    fontSize: 16,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#4b5563",
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  picker: {
    height: 48,
  },
  selectedVehicleText: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  selectedVehicleName: {
    fontWeight: "600",
    color: "#111827",
  },
  centerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  startButton: {
    backgroundColor: "#22c55e",
  },
  stopButton: {
    backgroundColor: "#ef4444",
  },
  mainButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  telemetrySection: {
    flex: 1,
  },
  telemetryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  telemetryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  telemetryCard: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  telemetryCardFull: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  telemetryLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  telemetryValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  telemetryPlaceholder: {
    fontSize: 14,
    color: "#9ca3af",
  },
});
