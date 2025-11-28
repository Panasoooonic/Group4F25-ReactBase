export interface TripSummary {
  tripId: number;
  startTs: string;
  endTs: string;
  distanceKm: number;
  durationSec: number;
  averageSpeedKph: number;
  eventsCount: number;
  harshBrakingCount: number;
  rapidAccelCount: number;
  maxSpeed: number;
  scoreTotal: number;
}
