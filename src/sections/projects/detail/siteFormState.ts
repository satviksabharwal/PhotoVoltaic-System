import { ModuleType, MountingType, PanelOrientation, Product } from '../../../types/models';

// ----------------------------------------------------------------------
// Panel-configuration state for the add/edit-site form. It lives on
// ProjectDetailPage (not inside the form) because the Instant Estimate card
// in the left column renders from the same values.
// ----------------------------------------------------------------------

export interface SiteFormState {
  orientation: PanelOrientation;
  tilt: number;
  /** Numeric inputs are kept as strings so partially-typed values don't jump. */
  area: string;
  module: ModuleType;
  mounting: MountingType;
  losses: string;
  tariff: string;
}

export const DEFAULT_SITE_FORM: SiteFormState = {
  orientation: 'S',
  tilt: 35,
  area: '',
  module: 'mono',
  mounting: 'roof',
  losses: '14',
  tariff: '',
};

/** Pre-fills the form from an existing site when editing. */
export function siteFormFromProduct(site: Product): SiteFormState {
  return {
    orientation: site.orientation,
    tilt: site.inclination,
    area: String(site.area),
    module: site.module ?? 'mono',
    mounting: site.mounting ?? 'roof',
    losses: String(site.losses ?? 14),
    tariff: site.tariff != null ? String(site.tariff) : '',
  };
}
