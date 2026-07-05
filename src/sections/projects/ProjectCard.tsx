import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { solar, solarApp } from '../../theme/solar';
import { Project } from '../../types/models';

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
  renaming: boolean;
  onRenameStart: () => void;
  onRenameCommit: (name: string) => void;
  onRenameCancel: () => void;
  deleting: boolean;
  onDeleteStart: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  statusConfirm: boolean;
  onStatusStart: () => void;
  onStatusCancel: () => void;
  onStatusConfirm: () => void;
}

const statusStyles = {
  active: {
    iconBg: '#FFF3D0',
    disc: solar.accent,
    discRing: 'rgba(255,193,7,.22)',
    pillBg: '#FBEFC2',
    pillText: '#8A6A00',
    pillDot: '#E0A400',
    name: solar.ink,
    statNumber: solar.ink,
    cardBg: '#fff',
  },
  inactive: {
    iconBg: '#EFEDE6',
    disc: '#C6C0B0',
    discRing: 'rgba(198,192,176,.25)',
    pillBg: '#EDEAE1',
    pillText: '#8A8270',
    pillDot: '#B6AE9C',
    name: '#5B5648',
    statNumber: '#6B6455',
    cardBg: '#FAF8F3',
  },
} as const;

const menuItemSx = {
  display: 'flex',
  alignItems: 'center',
  gap: '11px',
  width: '100%',
  p: '9px 10px',
  border: 'none',
  background: 'transparent',
  borderRadius: '8px',
  fontFamily: solar.fontBody,
  fontSize: '14px',
  fontWeight: 500,
  color: solar.ink,
  cursor: 'pointer',
  textAlign: 'left',
  '&:hover': { background: '#F7F3EA' },
} as const;

function formatUpdated(updatedAt?: string): string {
  if (!updatedAt) return '—';
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

export default function ProjectCard({
  project,
  onOpen,
  menuOpen,
  onMenuToggle,
  renaming,
  onRenameStart,
  onRenameCommit,
  onRenameCancel,
  deleting,
  onDeleteStart,
  onDeleteCancel,
  onDeleteConfirm,
  statusConfirm,
  onStatusStart,
  onStatusCancel,
  onStatusConfirm,
}: ProjectCardProps) {
  const active = project.active ?? true;
  const styles = active ? statusStyles.active : statusStyles.inactive;

  const [draft, setDraft] = useState<string>(project.name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const statusCancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (renaming) {
      setDraft(project.name);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming, project.name]);

  useEffect(() => {
    if (deleting) cancelRef.current?.focus();
  }, [deleting]);

  useEffect(() => {
    if (statusConfirm) statusCancelRef.current?.focus();
  }, [statusConfirm]);

  const siteCount = project.sites ?? 0;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`${project.name} — ${active ? 'Active' : 'Inactive'} project`}
      onClick={() => {
        // Card-open is inert while any card-level action is in progress.
        if (renaming || deleting || statusConfirm || menuOpen) return;
        onOpen();
      }}
      onKeyDown={(event) => {
        if (renaming || deleting || statusConfirm || menuOpen) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      sx={{
        position: 'relative',
        background: styles.cardBg,
        border: `1px solid ${solarApp.cardBorder}`,
        borderRadius: '18px',
        p: '22px 22px 20px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform .16s, box-shadow .16s, border-color .16s',
        '&:hover, &:focus-visible': {
          transform: 'translateY(-3px)',
          boxShadow: '0 18px 40px rgba(29,26,20,.12)',
          borderColor: solarApp.cardBorderHover,
        },
        '&:hover .open-link, &:focus-visible .open-link': { opacity: 1, transform: 'translateX(0)' },
        '&:hover .kebab': { color: '#8A8270' },
        '&:focus-visible': { outline: `2px solid ${solar.accent}`, outlineOffset: 2 },
        // Left status accent bar.
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: active ? `linear-gradient(180deg, ${solar.accent}, #FFD54F)` : 'transparent',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '16px' }}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '14px',
            background: styles.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: styles.disc,
              boxShadow: `0 0 0 4px ${styles.discRing}`,
            }}
          />
        </Box>

        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              height: 28,
              px: '12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              fontFamily: solar.fontBody,
              background: styles.pillBg,
              color: styles.pillText,
            }}
          >
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: styles.pillDot }} />
            {active ? 'Active' : 'Inactive'}
          </Box>

          <Box
            component="button"
            type="button"
            className="kebab"
            title="More options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(event) => {
              event.stopPropagation();
              onMenuToggle();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && menuOpen) {
                event.stopPropagation();
                onMenuToggle();
              }
            }}
            sx={{
              width: 30,
              height: 30,
              border: '1px solid transparent',
              borderRadius: '8px',
              background: 'transparent',
              color: '#B4AB94',
              fontSize: '18px',
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .14s, color .14s, border-color .14s',
              flexShrink: 0,
              '&:hover': { background: '#F5F0E4', color: solar.ink, borderColor: '#EAE3D2' },
            }}
          >
            ⋯
          </Box>

          <Box
            role="menu"
            aria-hidden={!menuOpen}
            sx={{
              position: 'absolute',
              top: 38,
              right: 0,
              zIndex: 20,
              minWidth: 170,
              background: '#fff',
              border: '1px solid #ECE5D6',
              borderRadius: '12px',
              boxShadow: '0 16px 38px rgba(29,26,20,.16)',
              p: '6px',
              transformOrigin: 'top right',
              transition: 'opacity .14s, transform .14s',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(.98)',
              pointerEvents: menuOpen ? 'auto' : 'none',
            }}
          >
            <Box
              component="button"
              type="button"
              role="menuitem"
              tabIndex={menuOpen ? 0 : -1}
              onClick={(event) => {
                event.stopPropagation();
                onRenameStart();
              }}
              sx={menuItemSx}
            >
              <Box
                component="span"
                sx={{ width: 16, textAlign: 'center', fontSize: '13px', color: '#8A8270', flexShrink: 0 }}
              >
                ✎
              </Box>
              Rename
            </Box>
            <Box
              component="button"
              type="button"
              role="menuitem"
              tabIndex={menuOpen ? 0 : -1}
              onClick={(event) => {
                event.stopPropagation();
                onStatusStart();
              }}
              sx={menuItemSx}
            >
              <Box component="span" sx={{ width: 16, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <Box
                  component="span"
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: active ? '#B6AE9C' : '#E0A400',
                  }}
                />
              </Box>
              {active ? 'Set inactive' : 'Set active'}
            </Box>
            <Box
              component="button"
              type="button"
              role="menuitem"
              tabIndex={menuOpen ? 0 : -1}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteStart();
              }}
              sx={{
                ...menuItemSx,
                color: '#C0392B',
                '&:hover': { background: '#FDECEA' },
              }}
            >
              <Box
                component="span"
                sx={{ width: 16, textAlign: 'center', fontSize: '13px', color: '#C0392B', flexShrink: 0 }}
              >
                🗑
              </Box>
              Delete
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Name: inline editor while renaming, static heading otherwise */}
      {renaming ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Box
            component="input"
            ref={inputRef}
            value={draft}
            maxLength={60}
            aria-label="Project name"
            onClick={(event: React.MouseEvent) => event.stopPropagation()}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              event.stopPropagation();
              if (event.key === 'Enter') onRenameCommit(draft);
              if (event.key === 'Escape') onRenameCancel();
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              fontFamily: solar.fontDisplay,
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: solar.ink,
              border: `1.5px solid ${solar.accent}`,
              borderRadius: '9px',
              p: '5px 9px',
              background: '#FFFDF6',
              outline: 'none',
            }}
          />
          <Box
            component="button"
            type="button"
            title="Save name"
            onClick={(event) => {
              event.stopPropagation();
              onRenameCommit(draft);
            }}
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${solar.ink}`,
              background: solar.ink,
              color: '#fff',
              '&:hover': { filter: 'brightness(1.25)' },
            }}
          >
            ✓
          </Box>
          <Box
            component="button"
            type="button"
            title="Cancel rename"
            onClick={(event) => {
              event.stopPropagation();
              onRenameCancel();
            }}
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #EAE3D2',
              background: '#fff',
              color: '#8A8270',
              '&:hover': { background: '#F7F3EA', color: solar.ink },
            }}
          >
            ✕
          </Box>
        </Box>
      ) : (
        <Typography
          component="h3"
          sx={{
            fontFamily: solar.fontDisplay,
            fontSize: '19px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            m: 0,
            color: styles.name,
          }}
        >
          {project.name}
        </Typography>
      )}

      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: solar.muted, mt: '6px' }}
      >
        <Box
          sx={{
            width: 11,
            height: 11,
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            border: '2px solid #C2BAA6',
            flexShrink: 0,
          }}
        />
        {project.autoLocation || 'No location yet'}
      </Box>

      <Box sx={{ height: '1px', background: solarApp.topBarBorder, m: '18px 0 14px' }} />

      <Box sx={{ display: 'flex', gap: '28px' }}>
        {[
          { value: project.sites ?? 0, label: 'Sites' },
          { value: project.capacity ?? 0, label: 'kWp' },
        ].map((stat) => (
          <Box key={stat.label} sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Box
              sx={{
                fontFamily: solar.fontDisplay,
                fontSize: '20px',
                fontWeight: 700,
                color: styles.statNumber,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </Box>
            <Box
              sx={{
                fontSize: '11.5px',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: solarApp.label,
              }}
            >
              {stat.label}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '18px' }}>
        <Box sx={{ fontSize: '12.5px', color: solarApp.label }}>Updated {formatUpdated(project.updatedAt)}</Box>
        <Box
          className="open-link"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontFamily: solar.fontDisplay,
            fontSize: '13px',
            fontWeight: 700,
            color: active ? solar.accentDeep : solar.muted,
            opacity: 0,
            transform: 'translateX(-4px)',
            transition: 'all .16s',
          }}
        >
          Open →
        </Box>
      </Box>

      {/* Delete confirm overlay — covers this card only */}
      {deleting && (
        <Box
          role="alertdialog"
          aria-label={`Delete ${project.name}?`}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: 'rgba(255,253,248,.95)',
            borderRadius: '18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: '22px',
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 46,
              height: 46,
              borderRadius: '13px',
              background: '#FDECEA',
              color: '#C0392B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '21px',
              mb: '13px',
            }}
          >
            🗑
          </Box>
          <Typography
            component="h4"
            sx={{ fontFamily: solar.fontDisplay, fontSize: '16px', fontWeight: 700, color: solar.ink, m: 0 }}
          >
            Delete &ldquo;{project.name}&rdquo;?
          </Typography>
          <Typography sx={{ fontSize: '13px', lineHeight: 1.5, color: '#8A8270', m: '7px 0 0', maxWidth: 236 }}>
            This project and its {siteCount} {siteCount === 1 ? 'site' : 'sites'} will be removed. This can&apos;t be
            undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: '10px', mt: '18px' }}>
            <Box
              component="button"
              type="button"
              ref={cancelRef}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteCancel();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onDeleteCancel();
              }}
              sx={{
                height: 40,
                px: '18px',
                borderRadius: '10px',
                fontFamily: solar.fontDisplay,
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid #E4DDCB',
                background: '#fff',
                color: '#6B6455',
                '&:hover': { background: '#F7F3EA', color: solar.ink },
              }}
            >
              Cancel
            </Box>
            <Box
              component="button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteConfirm();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onDeleteCancel();
              }}
              sx={{
                height: 40,
                px: '18px',
                borderRadius: '10px',
                fontFamily: solar.fontDisplay,
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: '#C0392B',
                color: '#fff',
                '&:hover': { filter: 'brightness(1.08)' },
              }}
            >
              Delete
            </Box>
          </Box>
        </Box>
      )}

      {/* Status-change confirm overlay — same pattern as delete, but
          non-destructive: colors preview the target state. */}
      {statusConfirm && (
        <Box
          role="alertdialog"
          aria-label={`Set ${project.name} ${active ? 'inactive' : 'active'}?`}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: 'rgba(255,253,248,.95)',
            borderRadius: '18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: '22px',
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 46,
              height: 46,
              borderRadius: '13px',
              background: active ? '#EDEAE1' : '#FFF3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: '13px',
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: active ? '#B6AE9C' : '#E0A400',
                boxShadow: `0 0 0 4px ${active ? 'rgba(182,174,156,.25)' : 'rgba(224,164,0,.25)'}`,
              }}
            />
          </Box>
          <Typography
            component="h4"
            sx={{ fontFamily: solar.fontDisplay, fontSize: '16px', fontWeight: 700, color: solar.ink, m: 0 }}
          >
            Set &ldquo;{project.name}&rdquo; {active ? 'inactive' : 'active'}?
          </Typography>
          <Typography sx={{ fontSize: '13px', lineHeight: 1.5, color: '#8A8270', m: '7px 0 0', maxWidth: 236 }}>
            {active
              ? 'It moves to the Inactive filter — sites and data stay untouched, and you can switch it back anytime.'
              : 'It will show under the Active filter again. You can switch it back anytime.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: '10px', mt: '18px' }}>
            <Box
              component="button"
              type="button"
              ref={statusCancelRef}
              onClick={(event) => {
                event.stopPropagation();
                onStatusCancel();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onStatusCancel();
              }}
              sx={{
                height: 40,
                px: '18px',
                borderRadius: '10px',
                fontFamily: solar.fontDisplay,
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid #E4DDCB',
                background: '#fff',
                color: '#6B6455',
                '&:hover': { background: '#F7F3EA', color: solar.ink },
              }}
            >
              Cancel
            </Box>
            <Box
              component="button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onStatusConfirm();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onStatusCancel();
              }}
              sx={{
                height: 40,
                px: '18px',
                borderRadius: '10px',
                fontFamily: solar.fontDisplay,
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: solar.ink,
                color: '#fff',
                '&:hover': { filter: 'brightness(1.25)' },
              }}
            >
              {active ? 'Set inactive' : 'Set active'}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
