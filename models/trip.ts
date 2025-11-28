export interface Trip {
  tripId: number;
  vehicleId: number;
  vehicle?: Object;
  startTs: Date;
  endTs: Date;
  distanceKm: number;
  durationSec: number;
  averageSpeedKph: number;
  scoreTotal?: number;
  status: string;
}
