import { API_URL } from "@/constants/api";
import { TripSummary } from "@/models/trip-summary";
import { getUser, User } from "@/models/user";
import { Vehicle } from "@/models/vehicle";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router"; // Added useFocusEffect
import { Accelerometer } from "expo-sensors";
import React, { useCallback, useEffect, useRef, useState } from "react"; // Added useCallback
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ToastColor = "success" | "error";

export default function Dashboard() {
  // --- State: User & Vehicles ---
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // --- State: Custom Picker Logic ---
  const [isVehiclePickerVisible, setVehiclePickerVisible] = useState(false);

  // --- State: Trip Logic ---
  const [isTracking, setIsTracking] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- State: Telemetry ---
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [accelMps2, setAccel] = useState<number>(0);
  const [location, setLocation] = useState<{ lat?: number; lon?: number }>({});

  const latestAccel = useRef<number>(0);

  // --- State: UI (Modal & Toast) ---
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [tripSummary, setTripSummary] = useState<TripSummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<ToastColor>("error");

  const showToast = (message: string, color: ToastColor = "error") => {
    setToastMessage(message);
    setToastColor(color);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- 1. Init: Permissions (Run Once) ---
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          showToast("Permission to access location was denied", "error");
        }
      } catch (e) {
        console.warn("Location permissions not supported on this platform");
      }
    })();
  }, []);

  // --- 2. Focus Effect: Load User & Vehicles (Run on Focus) ---
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const userData = await getUser();
          setUser(userData);

          if (userData?.userId) {
            // We call fetchVehicles directly here to refresh the list
            fetchVehicles(userData.userId);
          }
        } catch (e) {
          console.error("Init error:", e);
        }
      };

      loadData();
    }, [])
  );

  const fetchVehicles = async (userId: number) => {
    // Only show loading spinner if we don't have vehicles yet (better UX)
    if (vehicles.length === 0) setIsLoadingVehicles(true);

    try {
      const response = await fetch(`${API_URL}/vehicle/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : data.result || data.vehicles || [];

        setVehicles(list);

        // If no vehicle selected yet, select the first one
        if (list.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(list[0].id || list[0].vehicleId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  // --- 3. Sensor Listeners ---
  useEffect(() => {
    let accelSubscription: any = null;

    const startAccelerometer = async () => {
      try {
        const isAvailable = await Accelerometer.isAvailableAsync();
        if (isAvailable) {
          Accelerometer.setUpdateInterval(500);
          accelSubscription = Accelerometer.addListener((data) => {
            const totalAccel = Math.sqrt(
              data.x ** 2 + data.y ** 2 + data.z ** 2
            );
            setAccel(totalAccel);
            latestAccel.current = totalAccel;
          });
        }
      } catch (error) {
        console.warn("Error initializing Accelerometer:", error);
      }
    };

    startAccelerometer();

    return () => {
      accelSubscription && accelSubscription.remove();
    };
  }, []);

  // Location Watcher
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          showToast("Location permission required!", "error");
          return;
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 0,
          },
          async (loc) => {
            const lat = loc.coords.latitude;
            const lon = loc.coords.longitude;
            const spd = loc.coords.speed || 0;

            const validSpeed = spd < 0 ? 0 : spd;
            const spdKmh = validSpeed * 3.6;

            setLocation({ lat, lon });
            setSpeedKmh(spdKmh);

            if (isTracking && currentTripId) {
              sendTelemetryPoint(
                currentTripId,
                lat,
                lon,
                Number(spdKmh) || 0,
                Number(latestAccel.current) || 0
              );
            }
          }
        );
      } catch (e) {
        console.warn("GPS tracking failed:", e);
        showToast("GPS Start Error", "error");
      }
    };

    if (isTracking) {
      startLocationTracking();
    } else {
      if (locationSubscription) {
        (locationSubscription as any).remove();
      }
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isTracking, currentTripId]);

  // --- 4. API Actions ---
  const sendTelemetryPoint = async (
    tripId: number,
    lat: number,
    lon: number,
    speed: number,
    accel: number
  ) => {
    try {
      await fetch(`${API_URL}/trip/${tripId}/point`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          speed: speed,
          acceleration: accel,
        }),
      });
    } catch (err) {
      console.error("Telemetry error", err);
    }
  };

  const handleStartTrip = async () => {
    if (!selectedVehicleId) return;
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/trip/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.userId,
          vehicleId: selectedVehicleId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTripId = data.tripId || data.result?.tripId;

        if (newTripId) {
          setCurrentTripId(newTripId);
          setIsTracking(true);
          showToast("Trip started!", "success");
        } else {
          showToast("Failed to retrieve trip ID");
        }
      } else {
        showToast("Server failed to start trip");
      }
    } catch (err) {
      showToast("Network error starting trip");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopTrip = async () => {
    if (!currentTripId) return;
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/trip/${currentTripId}/end`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsTracking(false);
        setCurrentTripId(null);
        setTripSummary(data.result || data);
        setSummaryModalVisible(true);
      } else {
        showToast("Failed to end trip properly");
        setIsTracking(false);
      }
    } catch (err) {
      showToast("Network error ending trip");
      setIsTracking(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTracking = () => {
    if (isTracking) {
      handleStopTrip();
    } else {
      handleStartTrip();
    }
  };

  const currentVehicleObj = vehicles.find(
    (v) => v.vehicleId == selectedVehicleId
  );
  const hasVehicles = vehicles.length > 0;

  const renderVehicleItem = ({ item }: { item: Vehicle }) => {
    const isSelected = item.vehicleId == selectedVehicleId;
    return (
      <TouchableOpacity
        style={[styles.modalItem, isSelected && styles.modalItemSelected]}
        onPress={() => {
          setSelectedVehicleId(item.vehicleId || "");
          setVehiclePickerVisible(false);
        }}
      >
        <Text
          style={[
            styles.modalItemText,
            isSelected && styles.modalItemTextSelected,
          ]}
        >
          {item.model}
        </Text>
        <Text style={styles.modalItemSub}>{item.plateNo}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greetingText}>
            Hello {user ? `${user.firstName} ${user.lastName}` : "Driver"}
          </Text>
          <Text style={styles.subtitleText}>
            {isTracking ? "Drive safely!" : "Start a new trip now"}
          </Text>
        </View>

        {/* --- CUSTOM SELECT COMPONENT --- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select vehicle</Text>

          {isLoadingVehicles && vehicles.length === 0 ? (
            <ActivityIndicator color="#2563eb" />
          ) : !hasVehicles ? (
            <Text style={styles.errorText}>
              Please create a vehicle in the Vehicles tab to start a trip.
            </Text>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.pickerTrigger,
                  isTracking && styles.pickerDisabled,
                ]}
                onPress={() => !isTracking && setVehiclePickerVisible(true)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.pickerTriggerLabel}>
                    Current Vehicle:
                  </Text>
                  <Text style={styles.pickerTriggerValue}>
                    {currentVehicleObj?.model || "Select a vehicle"}
                  </Text>
                </View>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>

              {currentVehicleObj && (
                <Text style={styles.selectedVehicleText}>
                  Plate: {currentVehicleObj.plateNo}
                </Text>
              )}
            </>
          )}
        </View>

        {/* --- VEHICLE SELECTION MODAL --- */}
        <Modal
          visible={isVehiclePickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setVehiclePickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose a Vehicle</Text>
              <View style={{ maxHeight: 300 }}>
                <FlatList
                  data={vehicles}
                  keyExtractor={(item) => String(item.vehicleId)}
                  renderItem={renderVehicleItem}
                />
              </View>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setVehiclePickerVisible(false)}
              >
                <Text style={styles.closeModalText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Big Start / Stop Button */}
        <View style={styles.centerSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleTracking}
            disabled={!hasVehicles || isProcessing}
            style={[
              styles.mainButton,
              !hasVehicles
                ? styles.disabledButton
                : isTracking
                ? styles.stopButton
                : styles.startButton,
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.mainButtonText}>
                {isTracking ? "Stop Trip" : "Start Trip"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Telemetry Display */}
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
                Waiting for GPS signal...
              </Text>
            )}
          </View>
        </View>

        {/* Trip Summary Modal */}
        <Modal
          visible={summaryModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSummaryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Trip Summary</Text>

              {tripSummary && (
                <ScrollView style={styles.summaryList}>
                  <SummaryRow
                    label="Distance"
                    value={`${tripSummary.distanceKm?.toFixed(2) || 0} km`}
                  />
                  <SummaryRow
                    label="Duration"
                    value={`${Math.floor(
                      (tripSummary.durationSec || 0) / 60
                    )} min`}
                  />
                  <SummaryRow
                    label="Avg Speed"
                    value={`${
                      tripSummary.averageSpeedKph?.toFixed(1) || 0
                    } km/h`}
                  />
                  <SummaryRow
                    label="Max Speed"
                    value={`${tripSummary.maxSpeed?.toFixed(1) || 0} km/h`}
                  />
                  <View style={styles.divider} />
                  <SummaryRow
                    label="Harsh Braking"
                    value={tripSummary.harshBrakingCount}
                  />
                  <SummaryRow
                    label="Rapid Accel"
                    value={tripSummary.rapidAccelCount}
                  />
                  <View style={styles.divider} />
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Total Score</Text>
                    <Text style={styles.scoreValue}>
                      {tripSummary.scoreTotal || 0}
                    </Text>
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setSummaryModalVisible(false)}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Toast Notification */}
        {toastMessage && (
          <View
            style={[
              styles.toast,
              toastColor === "success"
                ? styles.toastSuccess
                : styles.toastError,
            ]}
          >
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
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

  // --- New Picker Styles ---
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerDisabled: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    opacity: 0.7,
  },
  pickerTriggerLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  pickerTriggerValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  pickerArrow: {
    fontSize: 14,
    color: "#6b7280",
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  modalItemSelected: {
    backgroundColor: "#eff6ff",
  },
  modalItemText: {
    fontSize: 16,
    color: "#374151",
  },
  modalItemTextSelected: {
    fontWeight: "700",
    color: "#2563eb",
  },
  modalItemSub: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  // -------------------------

  selectedVehicleText: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "500",
  },
  centerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
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
  disabledButton: {
    backgroundColor: "#9ca3af",
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
    elevation: 1,
  },
  telemetryCardFull: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    elevation: 1,
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
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  toastText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  toastSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.95)",
  },
  toastError: {
    backgroundColor: "rgba(239, 68, 68, 0.95)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    maxHeight: "80%", // Giới hạn chiều cao modal nếu nội dung quá dài
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#111827",
  },
  summaryList: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#4b5563",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#d1d5db",
    marginVertical: 10,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  closeModalButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeModalText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
