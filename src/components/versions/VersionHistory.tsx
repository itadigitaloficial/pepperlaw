import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  RestoreFromTrash as RestoreIcon,
  Compare as CompareIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DocumentVersion, versionService } from '../../services/versionService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VersionHistoryProps {
  documentId: string;
  onRestore: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  documentId,
  onRestore,
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareResult, setCompareResult] = useState<any[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewVersion, setViewVersion] = useState<DocumentVersion | null>(null);

  useEffect(() => {
    loadVersions();
  }, [documentId]);

  const loadVersions = async () => {
    try {
      const data = await versionService.getVersions(documentId);
      setVersions(data);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
    }
  };

  const handleRestore = async (versionId: string) => {
    try {
      await versionService.restoreVersion(documentId, versionId);
      onRestore();
      loadVersions();
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
    }
  };

  const handleCompare = async () => {
    if (selectedVersions.length !== 2) return;

    try {
      const result = await versionService.compareVersions(
        selectedVersions[0],
        selectedVersions[1]
      );
      setCompareResult(result);
      setCompareDialogOpen(true);
    } catch (error) {
      console.error('Erro ao comparar versões:', error);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length < 2) {
        return [...prev, versionId];
      }
      return [prev[1], versionId];
    });
  };

  const handleViewVersion = async (version: DocumentVersion) => {
    setViewVersion(version);
    setViewDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Histórico de Versões</Typography>
        {selectedVersions.length === 2 && (
          <Button
            startIcon={<CompareIcon />}
            variant="contained"
            onClick={handleCompare}
          >
            Comparar Versões
          </Button>
        )}
      </Box>

      <List>
        {versions.map((version) => (
          <ListItem
            key={version.id}
            sx={{
              bgcolor: selectedVersions.includes(version.id)
                ? 'action.selected'
                : 'background.paper',
            }}
            onClick={() => handleVersionSelect(version.id)}
          >
            <ListItemText
              primary={`Versão ${version.version_number}`}
              secondary={
                <>
                  {version.change_description}
                  <br />
                  {`Criado ${formatDistanceToNow(new Date(version.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}`}
                </>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title="Visualizar">
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewVersion(version);
                  }}
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Restaurar">
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(version.id);
                  }}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Diálogo de Comparação */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Comparação de Versões</DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            {compareResult.map((part, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: part.added
                    ? '#e6ffe6'
                    : part.removed
                    ? '#ffe6e6'
                    : 'transparent',
                }}
              >
                {part.value}
              </span>
            ))}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Visualização */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Versão {viewVersion?.version_number}
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {viewVersion?.content}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
          <Button
            color="primary"
            onClick={() => {
              if (viewVersion) {
                handleRestore(viewVersion.id);
                setViewDialogOpen(false);
              }
            }}
          >
            Restaurar Esta Versão
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
