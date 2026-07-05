import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import AuthField, { SubmitButton } from '../../auth/AuthField';
import { solar, solarApp } from '../../../theme/solar';
import { Product } from '../../../types/models';
import { optimalTilt } from '../../../utils/solarEstimate';
import InfoTip from './InfoTip';
import { SiteFormState } from './siteFormState';

interface AddSiteFormProps {
  projectId: string;
  locationName: string;
  onLocationNameChange: (value: string) => void;
  lat: string;
  lng: string;
  onLatChange: (value: string) => void;
  onLngChange: (value: string) => void;
  onUseMyLocation: () => void;
  form: SiteFormState;
  onFormChange: (patch: Partial<SiteFormState>) => void;
  editing: Product | null;
  onCancelEdit: () => void;
  onSaved: () => void;
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="label"
    sx={{
      fontSize: '13px',
      fontWeight: 600,
      color: solar.fieldLabel,
      letterSpacing: '0.01em',
      fontFamily: solar.fontBody,
    }}
  >
    {children}
  </Box>
);

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: '6px' }}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Box
            key={option.value}
            component="button"
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option.value)}
            sx={{
              height: 44,
              border: `1.5px solid ${on ? solar.accent : solar.line}`,
              borderRadius: '10px',
              background: on ? '#FFF3D0' : '#fff',
              fontFamily: solar.fontDisplay,
              fontSize: '14px',
              fontWeight: 600,
              color: on ? '#7A5B00' : solarApp.chipText,
              cursor: 'pointer',
              transition: 'all .13s',
              '&:hover': { borderColor: on ? solar.accent : '#D8D0BE' },
            }}
          >
            {option.label}
          </Box>
        );
      })}
    </Box>
  );
}

export default function AddSiteForm({
  projectId,
  locationName,
  onLocationNameChange,
  lat,
  lng,
  onLatChange,
  onLngChange,
  onUseMyLocation,
  form,
  onFormChange,
  editing,
  onCancelEdit,
  onSaved,
}: AddSiteFormProps) {
  const [saving, setSaving] = useState<boolean>(false);

  const latNumber = parseFloat(lat);
  const tiltHelper = !Number.isNaN(latNumber)
    ? `Optimal for this latitude is about ${optimalTilt(latNumber)}°`
    : 'Set a location for a tilt recommendation';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      toast.error('Pin a location on the map or enter valid coordinates.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: locationName,
        orientation: form.orientation,
        inclination: form.tilt,
        area: parseFloat(form.area),
        latitude,
        longitude,
        module: form.module,
        mounting: form.mounting,
        losses: parseFloat(form.losses) || 0,
        ...(form.tariff.trim() ? { tariff: parseFloat(form.tariff) } : {}),
      };
      const response = editing
        ? await api.put(`/product/update/${editing.id}`, payload)
        : await api.post('/product/create', { ...payload, project: projectId });
      toast.success(response.data.message);
      onSaved();
    } catch (error) {
      const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? String(error);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ background: '#fff', border: `1px solid ${solarApp.cardBorder}`, borderRadius: '18px', p: '24px' }}>
      <Typography sx={{ fontFamily: solar.fontDisplay, fontSize: '18px', fontWeight: 600, m: 0 }}>
        {editing ? `Edit site: ${editing.name}` : 'Add a site'}
      </Typography>
      <Typography sx={{ fontSize: '13px', color: solar.muted, m: '4px 0 20px' }}>
        {editing
          ? 'Adjust the location or panel details, then save your changes.'
          : 'Set the location and panel details to estimate its solar output.'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Box>
            <AuthField
              label="Location"
              name="siteLocation"
              placeholder="e.g. Kraków, Poland"
              required
              value={locationName}
              onChange={(event) => onLocationNameChange(event.target.value)}
            />
            <Box
              component="button"
              type="button"
              onClick={onUseMyLocation}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                fontFamily: solar.fontBody,
                color: solar.accentDeep,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                p: 0,
                mt: '8px',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              ◎ Use my current location
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <AuthField
              label="Latitude"
              name="latitude"
              placeholder="50.0619"
              required
              value={lat}
              onChange={(event) => onLatChange(event.target.value)}
            />
            <AuthField
              label="Longitude"
              name="longitude"
              placeholder="19.9368"
              required
              value={lng}
              onChange={(event) => onLngChange(event.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <FieldLabel>Orientation (azimuth)</FieldLabel>
            <Segmented
              options={[
                { value: 'N', label: 'N' },
                { value: 'E', label: 'E' },
                { value: 'S', label: 'S' },
                { value: 'W', label: 'W' },
              ]}
              value={form.orientation}
              onChange={(orientation) => onFormChange({ orientation })}
            />
            <Typography sx={{ fontSize: '12px', color: solarApp.label, mt: '4px' }}>
              Tip:{' '}
              <Box component="b" sx={{ color: solar.accentDeep, fontWeight: 600 }}>
                South
              </Box>{' '}
              gives the highest yield in the northern hemisphere.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <FieldLabel>Tilt / inclination</FieldLabel>
              <Box sx={{ fontFamily: solar.fontDisplay, fontSize: '15px', fontWeight: 700, color: solar.ink }}>
                {form.tilt}°
              </Box>
            </Box>
            <Box
              component="input"
              type="range"
              min={0}
              max={90}
              value={form.tilt}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => onFormChange({ tilt: +event.target.value })}
              sx={{ width: '100%', accentColor: solar.accent, m: '8px 0 2px', cursor: 'pointer' }}
            />
            <Typography sx={{ fontSize: '12px', color: solarApp.label }}>{tiltHelper}</Typography>
          </Box>

          <AuthField
            label="Roof / array area (m²)"
            name="area"
            type="number"
            placeholder="90"
            required
            min={1}
            step="any"
            value={form.area}
            onChange={(event) => onFormChange({ area: event.target.value })}
          />
        </Box>

        {/* Former "advanced options" — always open now; a thin divider keeps
            the visual rhythm where the toggle used to sit. */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderTop: '1px solid #F1ECDF',
            mt: '18px',
            pt: '18px',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <FieldLabel>Module type</FieldLabel>
            <Segmented
              options={[
                { value: 'mono', label: 'Mono' },
                { value: 'poly', label: 'Poly' },
                { value: 'thin', label: 'Thin-film' },
              ]}
              value={form.module}
              onChange={(module) => onFormChange({ module })}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <FieldLabel>Mounting</FieldLabel>
            <Segmented
              options={[
                { value: 'roof', label: 'Rooftop' },
                { value: 'ground', label: 'Ground' },
                { value: 'track', label: 'Tracker' },
              ]}
              value={form.mounting}
              onChange={(mounting) => onFormChange({ mounting })}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <AuthField
              label={
                <>
                  System losses (%)
                  <InfoTip
                    ariaLabel="What are system losses?"
                    tip={
                      <>
                        All the real-world losses between sunlight and usable power — heat, inverter, wiring, soiling,
                        and mismatch. <b>14%</b> is a typical default; lower it for a clean, well-ventilated install.
                      </>
                    }
                  />
                </>
              }
              name="losses"
              type="number"
              placeholder="14"
              min={0}
              max={99}
              step="any"
              value={form.losses}
              onChange={(event) => onFormChange({ losses: event.target.value })}
            />
            <AuthField
              label="Tariff (€/kWh)"
              name="tariff"
              type="number"
              placeholder="0.30"
              min={0}
              step="any"
              value={form.tariff}
              onChange={(event) => onFormChange({ tariff: event.target.value })}
            />
          </Box>
        </Box>

        <SubmitButton type="submit" disabled={saving} style={saving ? { opacity: 0.7, cursor: 'wait' } : undefined}>
          {saving ? 'Saving…' : editing ? 'Save changes' : '＋ Add site to project'}
        </SubmitButton>
        {editing && (
          <Box
            component="button"
            type="button"
            onClick={onCancelEdit}
            sx={{
              width: '100%',
              height: 46,
              mt: '10px',
              border: `1.5px solid ${solar.line}`,
              borderRadius: '12px',
              background: '#fff',
              color: solar.fieldLabel,
              fontFamily: solar.fontDisplay,
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { background: solarApp.chipHover },
            }}
          >
            Cancel edit
          </Box>
        )}
      </form>
    </Box>
  );
}
