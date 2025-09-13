// types/geolocation.ts

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AddressData {
  address: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface GeocodeResult {
  success: boolean;
  data?: AddressData;
  error?: string;
}

export interface LocationResult {
  coordinates: Coordinates;
  geocoding: GeocodeResult;
}