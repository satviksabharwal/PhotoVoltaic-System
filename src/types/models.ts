// Shared domain models, mirroring the backend API shapes (server/mappers.ts).

/** The authenticated user as stored in redux (subset returned by the auth API). */
export interface CurrentUser {
  email?: string;
  tokenId?: string;
  displayName?: string;
  photoURL?: string;
  [key: string]: unknown;
}

export type PanelOrientation = 'N' | 'E' | 'S' | 'W';

/** A project groups one or more PV products/panels. */
export interface Project {
  id: string;
  name: string;
  isReportGeneratd?: boolean;
  createdDate?: string;
  autoLocation?: string | null;
  active?: boolean;
  updatedAt?: string;
  sites?: number;
  capacity?: number;
}

export type ModuleType = 'mono' | 'poly' | 'thin';
export type MountingType = 'roof' | 'ground' | 'track';

/** A PV product = a panel array with physical + geographic configuration. */
export interface Product {
  id: string;
  name: string;
  orientation: PanelOrientation;
  inclination: number;
  area: number;
  module?: ModuleType;
  mounting?: MountingType;
  losses?: number;
  tariff?: number | null;
  kwp?: number | null;
  estAnnualKwh?: number | null;
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
