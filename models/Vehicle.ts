export interface Vehicle {
  vehicleId?: string; // maps to vehicle_id
  model: string; // e.g. "Toyota Corolla"
  make?: string;
  year?: number; // e.g. 2020
  plateNo: string; // license plate on car
  numberOfTrips?: number;
}
