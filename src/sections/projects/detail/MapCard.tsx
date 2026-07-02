import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { solar, solarApp } from '../../../theme/solar';
import { Product } from '../../../types/models';

// Bundlers rewrite leaflet's default icon asset paths; point them at the
// imported files so markers render. Deleting _getIconUrl disables Leaflet's
// CSS-based path auto-detection, which under Vite prepends a broken prefix
// to these URLs.
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface MapFocus {
  lat: number;
  lng: number;
  zoom: number;
  /** Monotonic counter so repeated focuses on the same spot still fly. */
  seq: number;
}

interface MapCardProps {
  sites: Product[];
  pin: { lat: number; lng: number } | null;
  onPin: (lat: number, lng: number) => void;
  focus: MapFocus | null;
  onGeocoded: (name: string, lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [50.8282, 12.9209];

function ClickToPin({ onPin }: { onPin: MapCardProps['onPin'] }) {
  useMapEvents({
    click: (event: LeafletMouseEvent) => onPin(event.latlng.lat, event.latlng.lng),
  });
  return null;
}

function FlyTo({ focus }: { focus: MapFocus | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lng], focus.zoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.seq]);
  return null;
}

export default function MapCard({ sites, pin, onPin, focus, onGeocoded }: MapCardProps) {
  const [search, setSearch] = useState<string>('');

  const runSearch = async () => {
    const query = search.trim();
    if (!query) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { Accept: 'application/json' } }
      );
      const results = (await response.json()) as { lat: string; lon: string; display_name?: string }[];
      if (results?.[0]) {
        const name = (results[0].display_name ?? '').split(',').slice(0, 2).join(',');
        onGeocoded(name, +results[0].lat, +results[0].lon);
      }
    } catch (error) {
      // Geocoding is best-effort; a failed lookup should not break the page.
      console.error('Geocoding failed:', error);
    }
  };

  return (
    <Box
      sx={{
        background: '#fff',
        border: `1px solid ${solarApp.cardBorder}`,
        borderRadius: '18px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          p: '16px 18px',
          borderBottom: '1px solid #F1ECDF',
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ fontFamily: solar.fontDisplay, fontSize: '15px', fontWeight: 600, color: solar.ink, m: 0 }}>
            Pin your site
          </Typography>
          <Typography sx={{ fontSize: '12.5px', color: solarApp.chipCount, mt: '2px' }}>
            Search a place or click anywhere on the map
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', width: { xs: '100%', sm: 290 } }}>
          <Box
            component="span"
            sx={{
              position: 'absolute',
              left: 13,
              top: '50%',
              transform: 'translateY(-50%)',
              color: solarApp.label,
              fontSize: '14px',
              pointerEvents: 'none',
            }}
          >
            🔍
          </Box>
          <Box
            component="input"
            type="text"
            placeholder="Search city or address…"
            value={search}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                runSearch();
              }
            }}
            sx={{
              width: '100%',
              boxSizing: 'border-box',
              height: 42,
              border: `1.5px solid ${solar.line}`,
              borderRadius: '10px',
              background: '#FCFAF4',
              p: '0 14px 0 36px',
              fontSize: '14px',
              fontFamily: solar.fontBody,
              color: solar.ink,
              outline: 'none',
              '&:focus': {
                borderColor: solar.accent,
                background: '#fff',
                boxShadow: '0 0 0 3px rgba(255,193,7,.18)',
              },
            }}
          />
        </Box>
      </Box>

      <MapContainer center={DEFAULT_CENTER} zoom={6} style={{ height: 520, width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sites.map((site) => (
          <Marker position={[site.latitude, site.longitude]} key={site.id}>
            <Popup>
              <strong>{site.name}</strong>
            </Popup>
          </Marker>
        ))}
        {pin && <Marker position={[pin.lat, pin.lng]} />}
        <ClickToPin onPin={onPin} />
        <FlyTo focus={focus} />
      </MapContainer>

      <Box
        sx={{
          position: 'absolute',
          left: 18,
          bottom: 16,
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(29,26,20,.86)',
          color: '#fff',
          fontSize: '12.5px',
          fontWeight: 500,
          p: '8px 13px',
          borderRadius: '9px',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none',
        }}
      >
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: solar.accent }} />
        {pin ? `Pinned at ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}` : 'Click the map to drop a pin'}
      </Box>
    </Box>
  );
}
