import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  FileCopy as CopyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Template, templateService } from '../../services/templateService';
import { TemplateForm } from './TemplateForm';

export const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    try {
      const data = await templateService.listTemplates(selectedCategory);
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await templateService.listCategories();
      setCategories(data.map(cat => cat.name));
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setFormOpen(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setFormOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este template?')) {
      try {
        await templateService.deleteTemplate(templateId);
        loadTemplates();
      } catch (error) {
        console.error('Erro ao excluir template:', error);
      }
    }
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      // Redirecionar para o formulário de preenchimento do template
      window.location.href = `/template/${template.id}/fill`;
    } catch (error) {
      console.error('Erro ao usar template:', error);
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      await templateService.duplicateTemplate(template.id);
      loadTemplates();
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: Template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Biblioteca de Templates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
        >
          Novo Template
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Buscar templates"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {template.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {template.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" display="block">
                  Categoria: {template.category || 'Sem categoria'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleUseTemplate(template)}
                >
                  Usar
                </Button>
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicar">
                  <IconButton
                    size="small"
                    onClick={(event) => handleMenuOpen(event, template)}
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDuplicateTemplate(selectedTemplate as Template)}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          Duplicar
        </MenuItem>
        <MenuItem onClick={() => handleDeleteTemplate((selectedTemplate as Template).id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Excluir
        </MenuItem>
      </Menu>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate ? 'Editar Template' : 'Novo Template'}
        </DialogTitle>
        <DialogContent>
          <TemplateForm
            template={selectedTemplate}
            onSave={async (template) => {
              await loadTemplates();
              setFormOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
