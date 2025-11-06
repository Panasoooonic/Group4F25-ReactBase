import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function VehicleScreen() {
  return (
    <ThemedView>
      <ThemedText type="title">Vehicles</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({});
