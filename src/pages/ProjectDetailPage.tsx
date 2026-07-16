import { Helmet } from 'react-helmet-async';
import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
// @mui
import { Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';
// components
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import MapCard, { MapFocus } from '../sections/projects/detail/MapCard';
import AddSiteForm from '../sections/projects/detail/AddSiteForm';
import InstantEstimateCard from '../sections/projects/detail/InstantEstimateCard';
import { DEFAULT_SITE_FORM, SiteFormState, siteFormFromProduct } from '../sections/projects/detail/siteFormState';
import SitesTable, { siteCapacityKwp } from '../sections/projects/detail/SitesTable';
import { solar, solarApp } from '../theme/solar';
import { Product, Project } from '../types/models';

export default function ProjectDetailPage() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [siteForm, setSiteForm] = useState<SiteFormState>(DEFAULT_SITE_FORM);
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async ({ signal }) => {
      const response = await api.get<Project | null>(`/project?projectId=${projectId}`, { signal });
      return response.data;
    },
  });

  const { data: sitesData, isLoading: isSitesLoading } = useQuery({
    queryKey: ['product', projectId],
    queryFn: async ({ signal }) => {
      const response = await api.get<Product[]>(`/product?projectId=${projectId}`, { signal });
      return response.data;
    },
  });

  // Handlers passed to the memoized MapCard / SitesTable are useCallback-
  // stable (and `pin` is memoized) so form keystrokes — which re-render this
  // page — don't re-reconcile those heavy subtrees.
  const focusMap = useCallback((latitude: number, longitude: number, zoom = 11) => {
    setMapFocus((previous) => ({ lat: latitude, lng: longitude, zoom, seq: (previous?.seq ?? 0) + 1 }));
  }, []);

  const setCoords = useCallback((latitude: number, longitude: number) => {
    setLat(latitude.toFixed(4));
    setLng(longitude.toFixed(4));
  }, []);

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const pin = useMemo(
    () => (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng) ? { lat: parsedLat, lng: parsedLng } : null),
    [parsedLat, parsedLng]
  );

  const handleGeocoded = useCallback(
    (name: string, latitude: number, longitude: number) => {
      setCoords(latitude, longitude);
      if (name && !editing) setLocationName(name);
      focusMap(latitude, longitude);
    },
    [editing, setCoords, focusMap]
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not available in this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords(position.coords.latitude, position.coords.longitude);
        focusMap(position.coords.latitude, position.coords.longitude);
      },
      () => toast.error('Could not determine your location')
    );
  }, [setCoords, focusMap]);

  const patchSiteForm = (patch: Partial<SiteFormState>) => {
    setSiteForm((previous) => ({ ...previous, ...patch }));
  };

  const focusAddSiteForm = useCallback(() => {
    const input = document.getElementById('field-siteLocation');
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  }, []);

  const startEdit = useCallback(
    (site: Product) => {
      setEditing(site);
      setLocationName(site.name);
      setSiteForm(siteFormFromProduct(site));
      setCoords(site.latitude, site.longitude);
      focusMap(site.latitude, site.longitude);
      focusAddSiteForm();
    },
    [setCoords, focusMap, focusAddSiteForm]
  );

  const clearSiteForm = () => {
    setEditing(null);
    setLocationName('');
    setLat('');
    setLng('');
    setSiteForm(DEFAULT_SITE_FORM);
  };

  const activateProject = useMutation({
    mutationFn: () => api.put(`/project/update/${projectId}`, { active: true }),
  });

  const handleSiteSaved = () => {
    if (sitesData?.length === 0 && projectData && !(projectData.active ?? true)) {
      activateProject.mutate();
    }

    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['product', projectId] });
    queryClient.invalidateQueries({ queryKey: ['site'] });
    clearSiteForm();
  };

  const deleteSite = useMutation({
    mutationFn: (siteId: string) => api.delete(`/product/delete/${siteId}`),
    onSuccess: (response, siteId) => {
      toast.success(response.data.message);
      if (editing?.id === siteId) clearSiteForm();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['product', projectId] });
      queryClient.removeQueries({ queryKey: ['site', siteId] });
      queryClient.removeQueries({ queryKey: ['readings', siteId] });
    },
    onError: () => toast.error('Could not delete the site'),
  });

  // mutateAsync has a stable identity (the mutation result object doesn't).
  const { mutateAsync: deleteSiteAsync } = deleteSite;
  const handleDeleteSite = useCallback((site: Product) => deleteSiteAsync(site.id), [deleteSiteAsync]);

  const handleOpenSite = useCallback(
    (site: Product) => {
      navigate(`/projects/${projectId}/${site.id}`, {
        state: { projectName: state ?? projectData?.name, productName: site.name },
      });
    },
    [navigate, projectId, state, projectData?.name]
  );

  const totals = useMemo(() => {
    const totalKwp = (sitesData ?? []).reduce((sum, site) => sum + siteCapacityKwp(site), 0);
    return {
      count: sitesData?.length ?? 0,
      kwp: Math.round(totalKwp * 10) / 10,
    };
  }, [sitesData]);

  const active = projectData?.active ?? true;

  return (
    <>
      <Helmet>
        <title>{`${state ?? projectData?.name} | SolarSense`}</title>
      </Helmet>

      <Box sx={{ maxWidth: 1240, mx: 'auto', fontFamily: solar.fontBody }}>
        {/* Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, mb: '14px' }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{ color: solarApp.chipCount, textDecoration: 'none', '&:hover': { color: solar.accentDeep } }}
          >
            Projects
          </Box>
          <Box component="span" sx={{ color: '#CFC7B4' }}>
            /
          </Box>
          <Box component="span" sx={{ color: solar.ink }}>
            {state ?? projectData?.name ?? '…'}
          </Box>
        </Box>

        {/* Project header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            mb: '22px',
            flexWrap: 'wrap',
          }}
        >
          <Typography
            component="h1"
            sx={{ fontFamily: solar.fontDisplay, fontSize: '30px', fontWeight: 700, letterSpacing: '-0.02em', m: 0 }}
          >
            {state ?? projectData?.name ?? '…'}
          </Typography>

          {/* Read-only status banner — changing status lives on the project
              card's menu (Projects page). */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                height: 44,
                px: '18px',
                borderRadius: '12px',
                border: `1px solid ${active ? '#F0DFA0' : solarApp.chipBorder}`,
                background: active ? '#FBEFC2' : '#EDEAE1',
                color: active ? '#8A6A00' : solar.muted,
                fontFamily: solar.fontDisplay,
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: active ? '#E0A400' : '#B6AE9C',
                  boxShadow: `0 0 0 3px ${active ? 'rgba(224,164,0,.25)' : 'rgba(182,174,156,.25)'}`,
                }}
              />
              {active ? 'Active' : 'Inactive'}
            </Box>
          </Box>
        </Box>

        {/* First-time intro banner (brand-new / emptied project) */}
        {!isSitesLoading && sitesData?.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'linear-gradient(135deg, #FFF6DC, #FFFDF7)',
              border: '1px solid #F4E4A6',
              borderRadius: '14px',
              p: '16px 18px',
              mb: '22px',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: '#FFF3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              ☀
            </Box>
            <Box>
              <Typography
                sx={{ fontFamily: solar.fontDisplay, fontSize: '16px', fontWeight: 700, color: solar.ink, m: 0 }}
              >
                Let&apos;s add your first site
              </Typography>
              <Typography sx={{ fontSize: '13.5px', color: solar.sub, mt: '2px' }}>
                Pin a location on the map and set your panel details — your project activates once it has a site.
              </Typography>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: '22px',
            gridTemplateColumns: { xs: '1fr', md: '1.55fr 1fr' },
            gridTemplateAreas: {
              xs: '"map" "form" "estimate"',
              md: '"map form" "estimate form"',
            },
            gridTemplateRows: { md: 'auto 1fr' },
            alignItems: 'stretch',
          }}
        >
          <Box sx={{ gridArea: 'map', minWidth: 0 }}>
            <MapCard sites={sitesData ?? []} pin={pin} onPin={setCoords} focus={mapFocus} onGeocoded={handleGeocoded} />
          </Box>
          <Box sx={{ gridArea: 'estimate', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <InstantEstimateCard lat={lat} lng={lng} form={siteForm} />
          </Box>
          <Box sx={{ gridArea: 'form', minWidth: 0 }}>
            <AddSiteForm
              projectId={projectId}
              locationName={locationName}
              onLocationNameChange={setLocationName}
              lat={lat}
              lng={lng}
              onLatChange={setLat}
              onLngChange={setLng}
              onUseMyLocation={handleUseMyLocation}
              form={siteForm}
              onFormChange={patchSiteForm}
              editing={editing}
              onCancelEdit={clearSiteForm}
              onSaved={handleSiteSaved}
            />
          </Box>
        </Box>

        {/* Sites table */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', m: '34px 0 14px' }}>
          <Typography sx={{ fontFamily: solar.fontDisplay, fontSize: '20px', fontWeight: 700, m: 0 }}>
            Sites in this project
          </Typography>
          <Typography sx={{ fontSize: '13px', color: solarApp.chipCount }}>
            {totals.count === 0
              ? 'No sites yet'
              : `${totals.count} ${totals.count === 1 ? 'site' : 'sites'} · ${totals.kwp} kWp total`}
          </Typography>
        </Box>
        <SitesTable
          sites={sitesData ?? []}
          onEdit={startEdit}
          onDelete={handleDeleteSite}
          onOpen={handleOpenSite}
          onAddFirst={focusAddSiteForm}
          onUseMyLocation={handleUseMyLocation}
        />
      </Box>
    </>
  );
}
