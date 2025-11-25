export interface Trip {
  tripId: number;
  vehicleId: number;
  vehicle?: Object;
  startTs: Date;
  endTs: Date;
  distanceKm: number;
  duration: number;
  averageSpeedKph: number;
  totalScore: number;
  status: string;
}