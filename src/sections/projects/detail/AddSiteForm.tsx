import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import AuthField, { SubmitButton } from '../../auth/AuthField';
import { solar, solarApp } from '../../../theme/solar';
import { ModuleType, MountingType, PanelOrientation, Product } from '../../../types/models';
import { estimateOutput, optimalTilt } from '../../../utils/solarEstimate';

// ----------------------------------------------------------------------
// "Add a site" form card: location + coordinates, orientation segments,
// tilt slider, area, collapsible advanced options and the live instant
// estimate. Doubles as the edit form when `editing` is set.
// ----------------------------------------------------------------------

interface AddSiteFormProps {
  projectId: string;
  locationName: string;
  onLocationNameChange: (value: string) => void;
  lat: string;
  lng: string;
  onLatChange: (value: string) => void;
  onLngChange: (value: string) => void;
  onUseMyLocation: () => void;
  editing: Product | null;
  onCancelEdit: () => void;
  onSaved: () => void;
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="label"
    sx={{ fontSize: '13px', fontWeight: 600, color: solar.fieldLabel, letterSpacing: '0.01em', fontFamily: solar.fontBody }}
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
  editing,
  onCancelEdit,
  onSaved,
}: AddSiteFormProps) {
  const [orientation, setOrientation] = useState<PanelOrientation>('S');
  const [tilt, setTilt] = useState<number>(35);
  const [area, setArea] = useState<string>('');
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);
  const [module, setModule] = useState<ModuleType>('mono');
  const [mounting, setMounting] = useState<MountingType>('roof');
  const [losses, setLosses] = useState<string>('14');
  const [tariff, setTariff] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Populate panel settings when a site is opened for editing (the parent
  // sets location/lat/lng).
  useEffect(() => {
    if (editing) {
      setOrientation(editing.orientation);
      setTilt(editing.inclination);
      setArea(String(editing.area));
      setModule(editing.module ?? 'mono');
      setMounting(editing.mounting ?? 'roof');
      setLosses(String(editing.losses ?? 14));
      setTariff(editing.tariff != null ? String(editing.tariff) : '');
    }
  }, [editing]);

  const resetForm = () => {
    setOrientation('S');
    setTilt(35);
    setArea('');
    setModule('mono');
    setMounting('roof');
    setLosses('14');
    setTariff('');
  };

  const latNumber = parseFloat(lat);
  const estimate = estimateOutput({
    area: parseFloat(area) || 0,
    lat: Number.isNaN(latNumber) ? undefined : latNumber,
    orientation,
    tilt,
    module,
    mounting,
    losses: parseFloat(losses) || 0,
    tariff: tariff.trim() ? parseFloat(tariff) : null,
  });

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
        orientation,
        inclination: tilt,
        area: parseFloat(area),
        latitude,
        longitude,
        module,
        mounting,
        losses: parseFloat(losses) || 0,
        ...(tariff.trim() ? { tariff: parseFloat(tariff) } : {}),
      };
      const response = editing
        ? await api.put(`/product/update/${editing.id}`, payload)
        : await api.post('/product/create', { ...payload, project: projectId });
      toast.success(response.data.message);
      resetForm();
      onSaved();
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? String(error);
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
              value={orientation}
              onChange={setOrientation}
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
                {tilt}°
              </Box>
            </Box>
            <Box
              component="input"
              type="range"
              min={0}
              max={90}
              value={tilt}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTilt(+event.target.value)}
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
            value={area}
            onChange={(event) => setArea(event.target.value)}
          />
        </Box>

        {/* Advanced options */}
        <Box
          component="button"
          type="button"
          onClick={() => setAdvancedOpen((prev) => !prev)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            background: 'none',
            border: 'none',
            borderTop: '1px solid #F1ECDF',
            p: '16px 0 4px',
            mt: '22px',
            cursor: 'pointer',
            fontFamily: solar.fontDisplay,
            fontSize: '14px',
            fontWeight: 600,
            color: solar.ink,
          }}
        >
          <span>Advanced options</span>
          <Box
            component="span"
            sx={{ color: solarApp.label, transition: 'transform .18s', transform: advancedOpen ? 'rotate(180deg)' : 'none' }}
          >
            ⌄
          </Box>
        </Box>
        {advancedOpen && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', pt: '6px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <FieldLabel>Module type</FieldLabel>
              <Segmented
                options={[
                  { value: 'mono', label: 'Mono' },
                  { value: 'poly', label: 'Poly' },
                  { value: 'thin', label: 'Thin-film' },
                ]}
                value={module}
                onChange={setModule}
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
                value={mounting}
                onChange={setMounting}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <AuthField
                label="System losses (%)"
                name="losses"
                type="number"
                placeholder="14"
                min={0}
                max={99}
                step="any"
                value={losses}
                onChange={(event) => setLosses(event.target.value)}
              />
              <AuthField
                label="Tariff (€/kWh)"
                name="tariff"
                type="number"
                placeholder="0.30"
                min={0}
                step="any"
                value={tariff}
                onChange={(event) => setTariff(event.target.value)}
              />
            </Box>
          </Box>
        )}

        {/* Instant estimate */}
        <Box
          sx={{
            background: estimate ? 'linear-gradient(135deg, #FFF6DC, #FFFDF7)' : '#FAF8F3',
            border: `1px ${estimate ? 'solid #F4E4A6' : `dashed ${solarApp.cardBorder}`}`,
            borderRadius: '14px',
            p: '18px',
            mt: '18px',
          }}
        >
          {estimate ? (
            <>
              <Typography
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: solar.accentDeep,
                  m: '0 0 12px',
                }}
              >
                ⚡ Instant estimate
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { value: estimate.kwp.toFixed(1), unit: 'kWp', label: 'System size' },
                  { value: Math.round(estimate.annualKwh).toLocaleString('en-US'), unit: 'kWh/yr', label: 'Est. output' },
                  ...(estimate.savings != null
                    ? [{ value: `€${Math.round(estimate.savings).toLocaleString('en-US')}`, unit: '', label: 'Yearly savings' }]
                    : []),
                  { value: estimate.co2Tonnes.toFixed(1), unit: 't', label: 'CO₂ avoided / yr' },
                ].map((cell) => (
                  <Box key={cell.label}>
                    <Box sx={{ fontFamily: solar.fontDisplay, fontSize: '24px', fontWeight: 700, color: solar.ink, lineHeight: 1.05 }}>
                      {cell.value}{' '}
                      {cell.unit && (
                        <Box component="small" sx={{ fontSize: '13px', fontWeight: 600, color: solar.muted }}>
                          {cell.unit}
                        </Box>
                      )}
                    </Box>
                    <Box
                      sx={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        color: solarApp.label,
                        mt: '3px',
                      }}
                    >
                      {cell.label}
                    </Box>
                  </Box>
                ))}
              </Box>
              <Typography sx={{ fontSize: '11.5px', color: '#B0A88F', m: '12px 0 0', lineHeight: 1.4 }}>
                Rough estimate from location, tilt & orientation. Submit to run the full hourly simulation.
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: '13.5px', color: solarApp.chipCount, lineHeight: 1.5, m: 0 }}>
              Enter an <b>area</b> and pin a location to see an instant output estimate here — before you even submit.
            </Typography>
          )}
        </Box>

        <SubmitButton type="submit" disabled={saving} style={saving ? { opacity: 0.7, cursor: 'wait' } : undefined}>
          {saving ? 'Saving…' : editing ? 'Save changes' : '＋ Add site to project'}
        </SubmitButton>
        {editing && (
          <Box
            component="button"
            type="button"
            onClick={() => {
              resetForm();
              onCancelEdit();
            }}
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
