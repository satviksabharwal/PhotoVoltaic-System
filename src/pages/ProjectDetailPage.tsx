import { Helmet } from 'react-helmet-async';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
// @mui
import { Box, Modal, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// components
import api from '../utils/api';
import AuthField, { SubmitButton } from '../sections/auth/AuthField';
import MapCard, { MapFocus } from '../sections/projects/detail/MapCard';
import AddSiteForm from '../sections/projects/detail/AddSiteForm';
import InstantEstimateCard from '../sections/projects/detail/InstantEstimateCard';
import { DEFAULT_SITE_FORM, SiteFormState, siteFormFromProduct } from '../sections/projects/detail/siteFormState';
import SitesTable, { siteCapacityKwp } from '../sections/projects/detail/SitesTable';
import { solar, solarApp } from '../theme/solar';
import { Product, Project } from '../types/models';

// ----------------------------------------------------------------------
// SolarSense Project Detail page: breadcrumb + project header (rename,
// delete, status toggle, report), map + add-site form grid, sites table.
// ----------------------------------------------------------------------

const modalCardSx = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: 'calc(100% - 40px)', sm: 420 },
  background: solar.paper,
  borderRadius: '20px',
  boxShadow: '0 30px 80px rgba(10,8,2,.45)',
  p: '32px 32px 28px',
  fontFamily: solar.fontBody,
} as const;

const headerIconButtonSx = {
  width: 38,
  height: 38,
  border: `1px solid ${solarApp.chipBorder}`,
  borderRadius: '10px',
  background: '#fff',
  color: solar.muted,
  fontSize: '15px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all .14s',
  '&:hover': { background: solarApp.chipHover, color: solar.ink },
} as const;

export default function ProjectDetailPage() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Product[]>([]);
  const [sitesLoaded, setSitesLoaded] = useState<boolean>(false);
  // Coordinates + location label are shared between the map and the form.
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  // Panel configuration is page state (not form state) so the Instant
  // Estimate card in the left column renders live from the same values.
  const [siteForm, setSiteForm] = useState<SiteFormState>(DEFAULT_SITE_FORM);
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [renameOpen, setRenameOpen] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>('');
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const fetchProject = useCallback(async () => {
    try {
      const response = await api.get<Project | null>(`/project?projectId=${projectId}`);
      setProject(response.data);
    } catch (error) {
      toast.error('Could not load the project');
    }
  }, [projectId]);

  const fetchSites = useCallback(async () => {
    try {
      const response = await api.get<Product[]>(`/product?projectId=${projectId}`);
      setSites(response.data ?? []);
      setSitesLoaded(true);
    } catch (error) {
      toast.error('Could not load sites');
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
    fetchSites();
  }, [fetchProject, fetchSites]);

  const focusMap = (latitude: number, longitude: number, zoom = 11) => {
    setMapFocus((previous) => ({ lat: latitude, lng: longitude, zoom, seq: (previous?.seq ?? 0) + 1 }));
  };

  const setCoords = (latitude: number, longitude: number) => {
    setLat(latitude.toFixed(4));
    setLng(longitude.toFixed(4));
  };

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const pin =
    !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng) ? { lat: parsedLat, lng: parsedLng } : null;

  const handleGeocoded = (name: string, latitude: number, longitude: number) => {
    setCoords(latitude, longitude);
    if (name && !editing) setLocationName(name);
    focusMap(latitude, longitude);
  };

  const handleUseMyLocation = () => {
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
  };

  const patchSiteForm = (patch: Partial<SiteFormState>) => {
    setSiteForm((previous) => ({ ...previous, ...patch }));
  };

  const startEdit = (site: Product) => {
    setEditing(site);
    setLocationName(site.name);
    setSiteForm(siteFormFromProduct(site));
    setCoords(site.latitude, site.longitude);
    focusMap(site.latitude, site.longitude);
  };

  const clearSiteForm = () => {
    setEditing(null);
    setLocationName('');
    setLat('');
    setLng('');
    setSiteForm(DEFAULT_SITE_FORM);
  };

  const handleSiteSaved = async () => {
    // Per the design: a project activates once it has its first site.
    if (sites.length === 0 && project && !(project.active ?? true)) {
      try {
        await api.put(`/project/update/${projectId}`, { active: true });
      } catch (error) {
        // Non-critical; the user can still toggle the status manually.
      }
    }
    clearSiteForm();
    fetchSites();
    fetchProject();
  };

  const focusAddSiteForm = () => {
    // AuthField renders its input with id `field-${name}`.
    const input = document.getElementById('field-siteLocation');
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  };

  const handleDeleteSite = async (site: Product) => {
    try {
      const response = await api.delete(`/product/delete/${site.id}`);
      toast.success(response.data.message);
      if (editing?.id === site.id) clearSiteForm();
      fetchSites();
    } catch (error) {
      toast.error('Could not delete the site');
    }
  };

  const handleOpenSite = (site: Product) => {
    navigate(`/projects/${projectId}/${site.id}`, { state: site.name });
  };

  const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await api.put(`/project/update/${projectId}`, { name: renameValue });
      toast.success(response.data.message);
      setRenameOpen(false);
      fetchProject();
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? String(error);
      toast.error(message);
    }
  };

  const handleToggleStatus = async () => {
    if (!project) return;
    const nextActive = !(project.active ?? true);
    try {
      await api.put(`/project/update/${projectId}`, { active: nextActive });
      setProject({ ...project, active: nextActive });
    } catch (error) {
      toast.error('Could not update the project status');
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await api.delete(`/project/delete/${projectId}`);
      toast.success(response.data.message);
      navigate('/');
    } catch (error) {
      toast.error('Could not delete the project');
    }
  };

  const totals = useMemo(
    () => ({
      count: sites.length,
      kwp: Math.round(sites.reduce((sum, site) => sum + siteCapacityKwp(site), 0) * 10) / 10,
    }),
    [sites]
  );

  const active = project?.active ?? true;

  return (
    <>
      <Helmet>
        <title>{`${project?.name ?? 'Project'} | SolarSense`}</title>
      </Helmet>
      <ToastContainer />

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
            {project?.name ?? '…'}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Typography
              component="h1"
              sx={{ fontFamily: solar.fontDisplay, fontSize: '30px', fontWeight: 700, letterSpacing: '-0.02em', m: 0 }}
            >
              {project?.name ?? '…'}
            </Typography>
            <Box
              component="button"
              type="button"
              title="Rename project"
              onClick={() => {
                setRenameValue(project?.name ?? '');
                setRenameOpen(true);
              }}
              sx={headerIconButtonSx}
            >
              ✎
            </Box>
            <Box
              component="button"
              type="button"
              title="Delete project"
              onClick={() => setDeleteOpen(true)}
              sx={{
                ...headerIconButtonSx,
                '&:hover': { background: '#FDECEA', color: '#C0392B', borderColor: '#F3C9C2' },
              }}
            >
              🗑
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box
              component="button"
              type="button"
              onClick={handleToggleStatus}
              title="Toggle project status"
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
                cursor: 'pointer',
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
        {sitesLoaded && sites.length === 0 && (
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
              <Typography sx={{ fontFamily: solar.fontDisplay, fontSize: '16px', fontWeight: 700, color: solar.ink, m: 0 }}>
                Let&apos;s add your first site
              </Typography>
              <Typography sx={{ fontSize: '13.5px', color: solar.sub, mt: '2px' }}>
                Pin a location on the map and set your panel details — your project activates once it has a site.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Map + estimate | form grid. Stretch lets the left column match the
            form's height, with the estimate card absorbing the difference. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.55fr 1fr' },
            gap: '22px',
            alignItems: 'stretch',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '22px', minWidth: 0 }}>
            <MapCard sites={sites} pin={pin} onPin={setCoords} focus={mapFocus} onGeocoded={handleGeocoded} />
            <InstantEstimateCard lat={lat} lng={lng} form={siteForm} />
          </Box>
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
          sites={sites}
          onEdit={startEdit}
          onDelete={handleDeleteSite}
          onOpen={handleOpenSite}
          onAddFirst={focusAddSiteForm}
          onUseMyLocation={handleUseMyLocation}
        />
      </Box>

      {/* Rename modal */}
      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} aria-labelledby="rename-project-title">
        <Box sx={modalCardSx}>
          <Typography
            id="rename-project-title"
            component="h2"
            sx={{ fontFamily: solar.fontDisplay, fontSize: '22px', fontWeight: 700, m: '0 0 22px', color: solar.ink }}
          >
            Rename project
          </Typography>
          <form onSubmit={handleRename}>
            <AuthField
              label="Project name"
              name="projectName"
              required
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
            />
            <SubmitButton type="submit">Save name</SubmitButton>
          </form>
        </Box>
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} aria-labelledby="delete-project-title">
        <Box sx={modalCardSx}>
          <Typography
            id="delete-project-title"
            component="h2"
            sx={{ fontFamily: solar.fontDisplay, fontSize: '22px', fontWeight: 700, m: 0, color: solar.ink }}
          >
            Delete this project?
          </Typography>
          <Typography sx={{ fontSize: '14px', color: solar.sub, mt: '8px', mb: '22px' }}>
            This permanently removes <b>{project?.name}</b> and all of its sites and readings.
          </Typography>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            <Box
              component="button"
              type="button"
              onClick={() => setDeleteOpen(false)}
              sx={{
                flex: 1,
                height: 48,
                border: `1.5px solid ${solar.line}`,
                borderRadius: '12px',
                background: '#fff',
                color: solar.fieldLabel,
                fontFamily: solar.fontDisplay,
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { background: solarApp.chipHover },
              }}
            >
              Cancel
            </Box>
            <Box
              component="button"
              type="button"
              onClick={handleDeleteProject}
              sx={{
                flex: 1,
                height: 48,
                border: 'none',
                borderRadius: '12px',
                background: '#C0392B',
                color: '#fff',
                fontFamily: solar.fontDisplay,
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                '&:hover': { filter: 'brightness(.94)' },
              }}
            >
              Delete project
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
