export interface Vehicle {
  id: string; // maps to vehicle_id
  model: string; // e.g. "Toyota Corolla"
  label?: string;
  year?: number; // e.g. 2020
  plateNo: string; // license plate on car
  licenseNo: string; // internal / registration ID
  numberOfTrips?: number;
}
