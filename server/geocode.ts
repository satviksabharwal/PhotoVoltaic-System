import axios from 'axios';

// Nominatim's usage policy requires an identifying User-Agent.
const USER_AGENT = 'SolarSense/1.0 (github.com/satviksabharwal/PhotoVoltaic-System)';

const REQUEST_TIMEOUT_MS = 10_000;

export interface GeoParts {
  city: string | null;
  state: string | null;
  country: string | null;
}

interface NominatimReverseResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Resolves coordinates to city/state/country. Best-effort: returns null when
 * Nominatim is unreachable or has nothing for the spot (e.g. open sea).
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeoParts | null> {
  try {
    const response = await axios.get<NominatimReverseResponse>('https://nominatim.openstreetmap.org/reverse', {
      timeout: REQUEST_TIMEOUT_MS,
      headers: { 'User-Agent': USER_AGENT },
      // accept-language keeps names in English ("Munich", not "München"),
      // matching the app's UI language.
      params: { format: 'json', lat: latitude, lon: longitude, zoom: 10, addressdetails: 1, 'accept-language': 'en' },
    });
    const { address } = response.data;
    if (!address) return null;
    return {
      city: address.city ?? address.town ?? address.village ?? address.municipality ?? address.county ?? null,
      state: address.state ?? null,
      country: address.country ?? null,
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error instanceof Error ? error.message : error);
    return null;
  }
}
