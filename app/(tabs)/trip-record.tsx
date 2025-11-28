import { Trip } from "@/models/trip";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TripRecordScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState<number | string | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  // Helper: Format Date
  const formatDate = (dateString: Date | string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper: Format Duration (seconds to min:sec)
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      // 1. Get User ID
      const jsonValue = await AsyncStorage.getItem("user");
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (user && user.id) {
        // 2. Call API
        const response = await fetch(
          `http://localhost:3000/api/summary/user/${user.id}`
        );

        if (response.ok) {
          const data = await response.json();
          // Handle case where API returns array directly or inside { result: [] }
          const tripList = Array.isArray(data) ? data : data.result || [];

          // Optional: Sort by newest first
          // tripList.sort((a: Trip, b: Trip) => new Date(b.startTs).getTime() - new Date(a.startTs).getTime());

          setTrips(tripList);
        } else {
          console.error("Failed to fetch trips");
        }
      }
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const toggleExpand = (id: number | string) => {
    // If clicking the same ID, close it (null). Otherwise, set it as active.
    setExpandedTripId((prev) => (prev === id ? null : id));
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    const isExpanded = expandedTripId === item.tripId;

    return (
      <View style={styles.cardContainer}>
        {/* Header (Always Visible) */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.tripId)}
          activeOpacity={0.7}
        >
          <View>
            <Text style={styles.tripTitle}>Trip #{item.tripId}</Text>
            <Text style={styles.tripDate}>{formatDate(item.startTs)}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{item.totalScore}</Text>
          </View>
        </TouchableOpacity>

        {/* Details (Visible on Expand) */}
        {isExpanded && (
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>
                {formatDuration(item.duration)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distance:</Text>
              <Text style={styles.detailValue}>{item.distanceKm} km</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Avg Speed:</Text>
              <Text style={styles.detailValue}>
                {item.averageSpeedKph} km/h
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>{item.status}</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>
                Start: {formatDate(item.startTs)}
              </Text>
              <Text style={styles.timeText}>End: {formatDate(item.endTs)}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Trip Record</Text>

      {isLoading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#2563eb"
          style={{ marginTop: 20 }}
        />
      ) : trips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No trip history found.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.tripId)}
          renderItem={renderTripItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
    color: "#111827",
  },
  listContent: {
    paddingBottom: 20,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  tripDate: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  scoreBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 10,
    color: "#2563eb",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563eb",
  },
  cardDetails: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  timeRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  timeText: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    marginBottom: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});
