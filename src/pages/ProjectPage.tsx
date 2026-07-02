import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Modal, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// components
import api from '../utils/api';
import AuthField, { SubmitButton } from '../sections/auth/AuthField';
import ProjectCard from '../sections/projects/ProjectCard';
import { solar, solarApp } from '../theme/solar';
import { Project } from '../types/models';

// ----------------------------------------------------------------------
// SolarSense Projects page: header + filter chips + card grid (create tile
// first), per the PROJECTS_PAGE design handoff.
// ----------------------------------------------------------------------

type StatusFilter = 'all' | 'active' | 'inactive';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

export default function ProjectPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const fetchProjects = async () => {
    try {
      const response = await api.get<Project[]>('/project');
      setProjects(response.data ?? []);
    } catch (error) {
      toast.error('Could not load projects');
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(
    () => ({
      all: projects.length,
      active: projects.filter((project) => project.active ?? true).length,
      inactive: projects.filter((project) => !(project.active ?? true)).length,
    }),
    [projects]
  );

  const visibleProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (filter === 'all') return true;
        return (project.active ?? true) === (filter === 'active');
      }),
    [projects, filter]
  );

  const closeCreate = () => {
    setCreateOpen(false);
    setName('');
    setLocation('');
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await api.post('/project/create', {
        name,
        ...(location.trim() ? { location: location.trim() } : {}),
      });
      toast.success(response.data.message);
      closeCreate();
      fetchProjects();
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? String(error);
      toast.error(message);
    }
  };

  const openProject = (project: Project) => {
    navigate(`/projects/${project.id}`, { state: project.name });
  };

  return (
    <>
      <Helmet>
        <title> Projects | SolarSense </title>
      </Helmet>
      <ToastContainer />

      <Box sx={{ maxWidth: 1180, mx: 'auto', fontFamily: solar.fontBody }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', mb: '24px' }}>
          <Box>
            <Typography
              component="h1"
              sx={{ fontFamily: solar.fontDisplay, fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', m: 0 }}
            >
              Projects
            </Typography>
            <Typography sx={{ fontSize: '15px', color: solarApp.subtitle, mt: '6px' }}>
              Group your solar sites by location and track their output.
            </Typography>
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => setCreateOpen(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              height: 48,
              px: '22px',
              border: 'none',
              borderRadius: '12px',
              background: solar.accent,
              color: solar.ink,
              fontFamily: solar.fontDisplay,
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(255,193,7,.35)',
              transition: 'filter .15s, transform .1s',
              flexShrink: 0,
              '&:hover': { filter: 'brightness(.96)' },
              '&:active': { transform: 'translateY(1px)' },
            }}
          >
            <Box component="span" sx={{ fontSize: '19px', lineHeight: 1, mt: '-1px' }}>
              ＋
            </Box>
            New project
          </Box>
        </Box>

        {/* Filter chips */}
        <Box sx={{ display: 'flex', gap: '10px', mb: '26px' }}>
          {FILTERS.map(({ key, label }) => {
            const on = filter === key;
            return (
              <Box
                key={key}
                component="button"
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(key)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: 38,
                  px: '16px',
                  borderRadius: '999px',
                  border: `1px solid ${on ? solar.ink : solarApp.chipBorder}`,
                  background: on ? solar.ink : '#fff',
                  fontFamily: solar.fontBody,
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: on ? '#fff' : solarApp.chipText,
                  cursor: 'pointer',
                  transition: 'all .14s',
                  '&:hover': { borderColor: on ? solar.ink : '#D8D0BE' },
                }}
              >
                {label}
                <Box component="span" sx={{ fontSize: '12px', fontWeight: 700, color: on ? solar.accent : solarApp.chipCount }}>
                  {counts[key]}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Card grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: '22px',
          }}
        >
          {/* Create tile */}
          <Box
            role="button"
            tabIndex={0}
            onClick={() => setCreateOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setCreateOpen(true);
              }
            }}
            sx={{
              border: '2px dashed #E0D8C4',
              borderRadius: '18px',
              minHeight: 238,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all .16s',
              '&:hover, &:focus-visible': { borderColor: solar.accent, background: '#FFFCF3' },
              '&:hover .create-icon, &:focus-visible .create-icon': { background: '#FFF3D0' },
              '&:focus-visible': { outline: `2px solid ${solar.accent}`, outlineOffset: 2 },
            }}
          >
            <Box
              className="create-icon"
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                background: '#F4EFE2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                color: solar.accentDeep,
                transition: 'background .16s',
              }}
            >
              ＋
            </Box>
            <Box sx={{ fontFamily: solar.fontDisplay, fontSize: '15px', fontWeight: 600, color: solarApp.chipText }}>
              Create new project
            </Box>
            <Box sx={{ fontSize: '12.5px', color: solarApp.label, mt: '-6px' }}>Start tracking a new location</Box>
          </Box>

          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={() => openProject(project)} />
          ))}
        </Box>

        {/* Empty state for the current filter */}
        {visibleProjects.length === 0 && (
          <Typography sx={{ mt: '22px', fontSize: '14.5px', color: solarApp.label, textAlign: 'center' }}>
            {projects.length === 0
              ? 'No projects yet — create your first one to start tracking solar output.'
              : `No ${filter} projects.`}
          </Typography>
        )}
      </Box>

      {/* Create project modal */}
      <Modal open={createOpen} onClose={closeCreate} aria-labelledby="create-project-title">
        <Box
          sx={{
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
          }}
        >
          <Typography
            id="create-project-title"
            component="h2"
            sx={{ fontFamily: solar.fontDisplay, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', m: 0, color: solar.ink }}
          >
            Create new project
          </Typography>
          <Typography sx={{ fontSize: '14px', color: solar.sub, mt: '6px', mb: '22px' }}>
            Give it a name and, optionally, the location it covers.
          </Typography>
          <form onSubmit={handleCreate}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <AuthField
                label="Project name"
                name="projectName"
                placeholder="e.g. Kraków Fields"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <AuthField
                label="Location (optional)"
                name="projectLocation"
                placeholder="e.g. Poland · Kraków"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </Box>
            <SubmitButton type="submit">Create project</SubmitButton>
          </form>
        </Box>
      </Modal>
    </>
  );
}
