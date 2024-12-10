import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Template, TemplateField, templateService } from '../../services/templateService';

interface TemplateFormProps {
  template?: Template | null;
  onSave: (template: Template) => Promise<void>;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Template>>({
    name: '',
    description: '',
    content: '',
    category: '',
    is_public: false,
    tags: [],
    ...template,
  });

  const [fields, setFields] = useState<Partial<TemplateField>[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      loadFields();
    }
  }, [template]);

  const loadFields = async () => {
    if (template) {
      try {
        const templateData = await templateService.getTemplate(template.id);
        setFields(templateData.fields);
      } catch (error) {
        console.error('Erro ao carregar campos:', error);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      {
        name: '',
        field_type: 'text',
        label: '',
        required: false,
        order_index: prev.length,
      },
    ]);
  };

  const handleFieldChange = (index: number, field: Partial<TemplateField>) => {
    setFields((prev) => {
      const newFields = [...prev];
      newFields[index] = { ...newFields[index], ...field };
      return newFields;
    });
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFields(
      items.map((item, index) => ({ ...item, order_index: index }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (template) {
        await templateService.updateTemplate(template.id, formData, fields);
      } else {
        await templateService.createTemplate(formData, fields);
      }
      await onSave(formData as Template);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      category: event.target.value,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome do Template"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
            >
              <MenuItem value="">Sem categoria</MenuItem>
              <MenuItem value="contratos">Contratos</MenuItem>
              <MenuItem value="documentos">Documentos</MenuItem>
              <MenuItem value="formularios">Formulários</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_public}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_public: e.target.checked,
                  }))
                }
              />
            }
            label="Template Público"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Adicionar Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              size="small"
            />
            <IconButton onClick={handleAddTag}>
              <AddIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.tags?.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Conteúdo do Template"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            multiline
            rows={10}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">Campos Dinâmicos</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddField}
              sx={{ ml: 2 }}
            >
              Adicionar Campo
            </Button>
          </Box>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {fields.map((field, index) => (
                    <Draggable
                      key={index}
                      draggableId={`field-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{ p: 2, mb: 2 }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item>
                              <div {...provided.dragHandleProps}>
                                <DragHandleIcon />
                              </div>
                            </Grid>
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                label="Nome do Campo"
                                value={field.name}
                                onChange={(e) =>
                                  handleFieldChange(index, {
                                    name: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                  value={field.field_type}
                                  onChange={(e) =>
                                    handleFieldChange(index, {
                                      field_type: e.target.value as any,
                                    })
                                  }
                                >
                                  <MenuItem value="text">Texto</MenuItem>
                                  <MenuItem value="number">Número</MenuItem>
                                  <MenuItem value="date">Data</MenuItem>
                                  <MenuItem value="select">Seleção</MenuItem>
                                  <MenuItem value="boolean">Sim/Não</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                label="Rótulo"
                                value={field.label}
                                onChange={(e) =>
                                  handleFieldChange(index, {
                                    label: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={field.required}
                                    onChange={(e) =>
                                      handleFieldChange(index, {
                                        required: e.target.checked,
                                      })
                                    }
                                    size="small"
                                  />
                                }
                                label="Obrigatório"
                              />
                            </Grid>
                            <Grid item>
                              <IconButton
                                onClick={() => handleRemoveField(index)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Paper>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="contained" type="submit" disabled={loading}>
              {template ? 'Atualizar' : 'Criar'} Template
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
