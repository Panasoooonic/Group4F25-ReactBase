import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function TripRecordScreen() {
  return (
    <ThemedView>
      <ThemedText type="title">TripRecords</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({});
