import React, { useState } from 'react';

import { ScrollView, TouchableOpacity, View } from "react-native";



import { Trip } from '@/models/trip';
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";

const SettingScreen = () => {
  const [open, setOpen] = useState(false);

   const tripList: Trip[] = [
    {
      tripId: 1,
      vehicleId: 1,
      averageSpeedKph: 50,
      distanceKm: 100,
      duration: 5000,
      startTs: new Date(),
      endTs: new Date(),
      totalScore: 100,
      status: "Driving",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.header}>Trip Record</Text>

      {/* Section 1 */}
      <TouchableOpacity>
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            {tripList.map((trip) => (
                <>
                  <Text style={styles.sectionTitle}>{`Trip #${trip.tripId}`}</Text>
                  <View style={styles.section}>
                    <Text style={styles.sectionDate}>{trip.startTs.toLocaleString()}-</Text>
                    <Text style={styles.sectionDate}>{trip.endTs.toLocaleString()}</Text>
                  </View>
                </>    
              ))}
          </View>

          <TouchableOpacity 
            style={styles.header2}
            onPress={() => setOpen(!open)}
          >
            <Text style={[styles.headerText, open && { opacity: 0.3 }]}>
              Trip details
            </Text>
            <Text style={styles.arrow}>{open ? "▲" : "▼"}</Text>
          </TouchableOpacity>
        </View>
       {open && (
        <View style={styles.content2}>

            {tripList.map((trip) => (
              <View style={styles.section2}>
                <>
                  <Text style={styles.scoreText}>Total Score: {trip.totalScore}</Text>
                  
                  <Text style={styles.section}>Duration: {trip.duration} sec</Text>
                  <Text style={styles.section}>Avg Speed: {trip.averageSpeedKph} kph</Text> 
                  <Text style={styles.section}>Distance Traveled: {trip.distanceKm} Km</Text> 
                </> 
              </View> 
            ))}
          </View>
        )}
{/*
  <SafeAreaProvider>
      <ThemedText type="title">Trip Records</ThemedText>

      {tripList.map((trip) => (
        <SafeAreaView>
          <Card>
            <Card.Title
              title={Trip #${trip.tripId}}
              subtitle={Distance: ${trip.distanceKm}km}
            />

            <Card.Content>
              <Text variant="bodyMedium">{Duration: ${trip.duration}}</Text>
              <Text variant="bodyMedium">{Start at: ${moment(
                trip.startTs
              ).format("YYYY-MM-DD HH:mm")}}</Text>
              <Text variant="bodyMedium">{End at: ${moment(
                trip.startTs
              ).format("YYYY-MM-DD HH:mm")}}</Text>
              <Text variant="bodyMedium">{Average speed: ${trip.averageSpeedKph}kph}</Text>
              <Text variant="bodyMedium">{Total score: ${trip.totalScore}}</Text>
            </Card.Content>
            {/* <Card.Cover source={{ uri: "https://picsum.photos/700" }} /> /}
            {/ <Card.Actions>
              <Button>Cancel</Button>
              <Button>Ok</Button>
            </Card.Actions> 
          </Card>
        </SafeAreaView>
      ))}
    </SafeAreaProvider>
*/}



      </TouchableOpacity>
     
   </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

 header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },

  header2: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
  },
  section: {
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  section2: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    opacity: 0.7,
  },

  sectionDate: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.4,
  },

  headerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  arrow: {
    fontSize: 16,
    opacity: 0.6,
  },
  content: {
    padding: 15,
    backgroundColor: "#fafafa",
  },

  content2: {
    padding: 5,
    backgroundColor: "#fafafa",
  },

  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },

  scoreText: {
    paddingBottom: 5,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  }
});



export default SettingScreen;