import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Modal, Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import AuthField, { SubmitButton } from '../sections/auth/AuthField';
import ProjectCard from '../sections/projects/ProjectCard';
import ProjectsEmptyState from '../sections/projects/ProjectsEmptyState';
import ProjectsErrorState from '../sections/projects/ProjectsErrorState';
import ProjectsLoadingState from '../sections/projects/ProjectsLoadingState';
import { solar, solarApp } from '../theme/solar';
import { Project } from '../types/models';

type StatusFilter = 'all' | 'active' | 'inactive';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

export default function ProjectPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const queryClient = useQueryClient();

  const { data, isPending, isError, isFetching, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get<Project[]>('/project');
      return response.data ?? [];
    },
  });

  const createProject = useMutation({
    mutationFn: (name: string) => api.post('/project/create', { name }),
    onSuccess: (response: { data: { message: string } }) => {
      toast.success(response.data.message);
      closeCreate();
      return queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? String(error);
      toast.error(message);
    },
  });

  const counts = useMemo(
    () => ({
      all: data?.length,
      active: data?.filter((project: Project) => project.active ?? true).length,
      inactive: data?.filter((project: Project) => !(project.active ?? true)).length,
    }),
    [data]
  );

  const visibleProjects = useMemo(
    () =>
      data?.filter((project: Project) => {
        if (filter === 'all') return true;
        return (project.active ?? true) === (filter === 'active');
      }),
    [data, filter]
  );

  const showError = isError && !isFetching;
  const showEmpty = !isError && !isPending && data?.length === 0;

  const closeCreate = () => {
    setCreateOpen(false);
    setName('');
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createProject.mutate(name);
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
                disabled={isPending || isError}
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
                  '&:disabled': { pointerEvents: 'none' },
                }}
              >
                {label}
                <Box
                  component="span"
                  sx={{ fontSize: '12px', fontWeight: 700, color: on ? solar.accent : solarApp.chipCount }}
                >
                  {isPending || isError ? '—' : counts[key]}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Card grid area — four modes per the design handoffs: error tile,
            no-data hero, or the grid (with skeletons while loading/retrying). */}
        {showError && <ProjectsErrorState error={error} onRetry={() => refetch()} />}
        {showEmpty && <ProjectsEmptyState onCreate={() => setCreateOpen(true)} />}
        {!showError && !showEmpty && (
          <Box
            aria-busy={isPending || isError}
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

            {(isPending || isError) && <ProjectsLoadingState />}

            {!isError &&
              visibleProjects?.map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={() => openProject(project)} />
              ))}

            {/* Projects exist, but none match the current filter */}
            {!isPending && !isError && visibleProjects?.length === 0 && (
              <Box
                sx={{
                  gridColumn: { xs: 'auto', sm: '2 / -1' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  gap: '5px',
                  p: '6px 4px',
                  minHeight: 180,
                }}
              >
                <Typography
                  component="h4"
                  sx={{ fontFamily: solar.fontDisplay, fontSize: '17px', fontWeight: 600, color: solar.ink, m: 0 }}
                >
                  No {filter} projects
                </Typography>
                <Typography sx={{ fontSize: '13.5px', color: solar.muted, m: 0 }}>
                  None of your projects are {filter} right now.
                </Typography>
                <Box
                  component="button"
                  type="button"
                  onClick={() => setFilter('all')}
                  sx={{
                    mt: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: solar.fontBody,
                    color: solar.accentDeep,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    p: 0,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  View all projects
                </Box>
              </Box>
            )}
          </Box>
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
            sx={{
              fontFamily: solar.fontDisplay,
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              m: 0,
              color: solar.ink,
            }}
          >
            Create new project
          </Typography>
          <Typography sx={{ fontSize: '14px', color: solar.sub, mt: '6px', mb: '22px' }}>
            Give it a name — the location fills in automatically from its sites.
          </Typography>
          <form onSubmit={handleCreate}>
            <AuthField
              label="Project name"
              name="projectName"
              placeholder="e.g. Kraków Fields"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <SubmitButton type="submit">Create project</SubmitButton>
          </form>
        </Box>
      </Modal>
    </>
  );
}
