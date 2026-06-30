// @mui
import { alpha, styled, Theme } from '@mui/material/styles';
import { Card, Typography, CardProps, SxProps } from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const StyledIcon = styled('div')(({ theme }: { theme: Theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}));

// ----------------------------------------------------------------------

type PaletteColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

interface AppWidgetSummaryProps extends CardProps {
  title: string;
  total: number;
  icon?: string;
  color?: PaletteColor;
  sx?: SxProps<Theme>;
}

export default function AppWidgetSummary({
  title,
  total,
  icon,
  color = 'primary',
  sx,
  ...other
}: AppWidgetSummaryProps) {
  return (
    <Card
      sx={{
        py: 5,
        boxShadow: 0,
        textAlign: 'center',
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => theme.palette[color].lighter,
        ...sx,
      }}
      {...other}
    >
      <StyledIcon
        sx={{
          color: (theme) => theme.palette[color].dark,
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette[color].dark, 0)} 0%, ${alpha(
              theme.palette[color].dark,
              0.24
            )} 100%)`,
        }}
      >
        <Iconify icon={icon ?? ''} width={24} height={24} />
      </StyledIcon>

      <Typography variant="h3">{fShortenNumber(total)}</Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        {title}
      </Typography>
    </Card>
  );
}
