export type Station = {
  id: string
  name: string
  latitude: number
  longitude: number
}

// Placeholder values to be replaced by api call
export const placeholderStations: Station[] = [
  { id: 'dl1', name: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { id: 'mum1', name: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { id: 'bl1', name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946 },
  { id: 'chn1', name: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { id: 'kol1', name: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { id: 'hyd1', name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867 },
  { id: 'ahm1', name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
  { id: 'pune1', name: 'Pune', latitude: 18.5204, longitude: 73.8567 },
  { id: 'jaip1', name: 'Jaipur', latitude: 26.9124, longitude: 75.7873 },
  { id: 'luc1', name: 'Lucknow', latitude: 26.8467, longitude: 80.9462 },
  { id: 'kan1', name: 'Kanpur', latitude: 26.4499, longitude: 80.3319 },
  { id: 'nag1', name: 'Nagpur', latitude: 21.1458, longitude: 79.0882 },
  { id: 'ind1', name: 'Indore', latitude: 22.7196, longitude: 75.8577 },
  { id: 'bpl1', name: 'Bhopal', latitude: 23.2599, longitude: 77.4126 },
  { id: 'pat1', name: 'Patna', latitude: 25.5941, longitude: 85.1376 },
  { id: 'srn1', name: 'Srinagar', latitude: 34.0837, longitude: 74.7973 },
  { id: 'chn2', name: 'Coimbatore', latitude: 11.0168, longitude: 76.9558 },
  { id: 'trv1', name: 'Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366 },
  { id: 'goa1', name: 'Panaji', latitude: 15.4909, longitude: 73.8278 },
  { id: 'raj1', name: 'Rajkot', latitude: 22.3039, longitude: 70.8022 },
  { id: 'sur1', name: 'Surat', latitude: 21.1702, longitude: 72.8311 },
  { id: 'bhv1', name: 'Bhavnagar', latitude: 21.7645, longitude: 72.1519 },
  { id: 'guw1', name: 'Guwahati', latitude: 26.1445, longitude: 91.7362 },
  { id: 'agrt1', name: 'Agartala', latitude: 23.8315, longitude: 91.2868 },
  { id: 'rnc1', name: 'Ranchi', latitude: 23.3441, longitude: 85.3096 },
  { id: 'jpr2', name: 'Jodhpur', latitude: 26.2389, longitude: 73.0243 },
  { id: 'amr1', name: 'Amritsar', latitude: 31.6340, longitude: 74.8723 },
  { id: 'chd1', name: 'Chandigarh', latitude: 30.7333, longitude: 76.7794 },
  { id: 'dbg1', name: 'Dibrugarh', latitude: 27.4728, longitude: 94.9110 },
  { id: 'ptn2', name: 'Puducherry', latitude: 11.9416, longitude: 79.8083 },
]

export function haversineDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(bLat - aLat)
  const dLon = toRad(bLng - aLng)
  const lat1 = toRad(aLat)
  const lat2 = toRad(bLat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

