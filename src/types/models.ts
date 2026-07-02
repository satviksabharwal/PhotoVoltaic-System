// Shared domain models, mirroring the backend API shapes (server/mappers.ts).
// ----------------------------------------------------------------------

/** The authenticated user as stored in redux (subset returned by the auth API). */
export interface CurrentUser {
  email?: string;
  tokenId?: string;
  displayName?: string;
  photoURL?: string;
  /** Allow additional fields returned by the API without losing type-safety on the known ones. */
  [key: string]: unknown;
}

export type PanelOrientation = 'N' | 'E' | 'S' | 'W';

/** A project groups one or more PV products/panels. */
export interface Project {
  id: string;
  name: string;
  isReportGeneratd?: boolean;
  createdDate?: string;
  /** Free-text place label, e.g. "Poland · Kraków". */
  location?: string | null;
  active?: boolean;
  updatedAt?: string;
  /** Card aggregates computed by the list endpoint. */
  sites?: number;
  capacity?: number;
}

/** A PV product = a panel array with physical + geographic configuration. */
export interface Product {
  id: string;
  name: string;
  orientation: PanelOrientation;
  inclination: number;
  area: number;
  longitude: number;
  latitude: number;
  project: string;
  powerPeak?: number;
  pvValue?: number;
  isReportGeneratdProduct?: boolean;
}

/** A single hourly data point in PvDetails.hourWiseData. */
export interface PvDataPoint {
  dateAndTime: string;
  pvValue: number;
  powerPeak: number;
  area: number;
  inclination: number;
  solarRad: number;
}

/** Time-series production record for a product. */
export interface PvDetails {
  id: string;
  product: string;
  project: string;
  user: string;
  hourWiseData: PvDataPoint[];
}
