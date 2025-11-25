import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function DashboardScreen() {
  return (
    <ThemedView>
      <ThemedText type="title">Dashboard</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({});

