// geolocation.ts

import type { GeocodeResult, LocationResult } from '../types/geolocation';

/**
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<GeocodeResult>} Address details object
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.address) {
      console.log("No address found");
      return {
        success: false,
        error: "No address found for the given coordinates"
      };
    }

    const { 
      city, 
      town, 
      village, 
      state, 
      postcode, 
      country,
      road,
      house_number,
      suburb,
      neighbourhood
    } = data.address;

    // Build a formatted address
    const addressParts = [];
    if (house_number) addressParts.push(house_number);
    if (road) addressParts.push(road);
    if (neighbourhood) addressParts.push(neighbourhood);
    if (suburb) addressParts.push(suburb);

    const formattedAddress = addressParts.length > 0 
      ? addressParts.join(', ')
      : data.display_name.split(',').slice(0, 2).join(', ');

    const result: GeocodeResult = {
      success: true,
      data: {
        address: formattedAddress,
        fullAddress: data.display_name,
        city: city || town || village || '',
        state: state || '',
        pincode: postcode || '',
        country: country || '',
        coordinates: {
          latitude: lat,
          longitude: lon
        }
      }
    };

    console.log('Reverse geocoding result:', result);
    return result;

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to get address details'
    };
  }
}

/**
 * Get user's current location and reverse geocode it
 * @returns {Promise<LocationResult>} Location and address details
 */
export function getCurrentLocationWithAddress(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          const geocodeResult = await reverseGeocode(latitude, longitude);
          
          resolve({
            coordinates: {
              latitude,
              longitude,
              accuracy
            },
            geocoding: geocodeResult
          });
        } catch (error) {
          resolve({
            coordinates: {
              latitude,
              longitude,
              accuracy
            },
            geocoding: {
              success: false,
              error: (error as Error).message
            }
          });
        }
      },
      (error) => {
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} Whether coordinates are valid
 */
export function validateCoordinates(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' && 
    typeof lon === 'number' &&
    lat >= -90 && lat <= 90 &&
    lon >= -180 && lon <= 180
  );
}