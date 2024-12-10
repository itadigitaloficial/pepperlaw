import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Template, TemplateField, templateService } from '../../services/templateService';

export const TemplateFill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    if (!id) return;

    try {
      const templateData = await templateService.getTemplate(id);
      setTemplate(templateData);
      setFields(templateData.fields);
      
      // Inicializar valores com defaults
      const initialValues: Record<string, any> = {};
      templateData.fields.forEach((field: TemplateField) => {
        initialValues[field.name] = field.default_value || '';
      });
      setValues(initialValues);
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      setError('Erro ao carregar o template. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    try {
      setLoading(true);
      const document = await templateService.createDocument(template.id, values);
      navigate(`/editor/${document.id}`);
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      setError('Erro ao criar o documento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!template) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Template não encontrado.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {template.name}
        </Typography>
        
        {template.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {template.description}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <Box key={field.id} sx={{ mb: 2 }}>
              {field.field_type === 'text' && (
                <TextField
                  fullWidth
                  label={field.label}
                  value={values[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              )}

              {field.field_type === 'number' && (
                <TextField
                  fullWidth
                  type="number"
                  label={field.label}
                  value={values[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}

              {field.field_type === 'date' && (
                <TextField
                  fullWidth
                  type="date"
                  label={field.label}
                  value={values[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                  InputLabelProps={{ shrink: true }}
                />
              )}

              {field.field_type === 'select' && (
                <FormControl fullWidth>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={values[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  >
                    {field.options?.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {field.field_type === 'boolean' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values[field.name] || false}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.checked)
                      }
                    />
                  }
                  label={field.label}
                />
              )}
            </Box>
          ))}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => navigate('/templates')}>Cancelar</Button>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
            >
              Criar Documento
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
