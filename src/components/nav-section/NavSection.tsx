import { ReactNode } from 'react';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Box, List, ListItemText, BoxProps } from '@mui/material';
//
import { StyledNavItem, StyledNavItemIcon } from './styles';

// ----------------------------------------------------------------------

export interface NavItem {
  title: string;
  path: string;
  icon?: ReactNode;
  info?: ReactNode;
}

interface NavSectionProps extends BoxProps {
  data?: NavItem[];
}

export default function NavSection({ data = [], ...other }: NavSectionProps) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

interface NavItemProps {
  item: NavItem;
}

function NavItem({ item }: NavItemProps) {
  const { title, path, icon, info } = item;

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        '&.active': {
          color: 'text.primary',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
        },
      }}
    >
      <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />

      {info && info}
    </StyledNavItem>
  );
}
