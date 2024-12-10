import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Description as DocumentIcon,
  LibraryBooks as TemplateIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      handleClose();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}
        >
          PepperLaw
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              startIcon={<DocumentIcon />}
            >
              Documentos
            </Button>

            <Button
              component={RouterLink}
              to="/templates"
              color="inherit"
              startIcon={<TemplateIcon />}
            >
              Templates
            </Button>

            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </Box>
        )}

        {!user && (
          <Box>
            <Button
              component={RouterLink}
              to="/login"
              color="inherit"
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              color="inherit"
            >
              Cadastro
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
