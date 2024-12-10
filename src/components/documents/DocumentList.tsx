import React, { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Folder as FolderIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Document, Folder, documentService } from '../../services/documentService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShareDialog } from './ShareDialog';

export const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | undefined>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Document | Folder | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadContent();
  }, [currentFolder]);

  const loadContent = async () => {
    try {
      const [docsData, foldersData] = await Promise.all([
        documentService.listDocuments(currentFolder),
        documentService.listFolders(currentFolder),
      ]);
      setDocuments(docsData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleItemClick = (item: Document | Folder) => {
    if ('content' in item) {
      // It's a document
      navigate(`/editor/${item.id}`);
    } else {
      // It's a folder
      setCurrentFolder(item.id);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: Document | Folder) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleShare = async (userIds: string[], permission: string) => {
    if (selectedDocument) {
      try {
        await documentService.shareDocument(selectedDocument.id, userIds, permission);
        // Atualizar a lista de documentos após compartilhar
        loadContent();
      } catch (error) {
        console.error('Erro ao compartilhar documento:', error);
      }
    }
  };

  const handleShareClick = (document: Document) => {
    setSelectedDocument(document);
    setShareDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    // Implement delete logic here
    handleMenuClose();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            onClick={() => setCurrentFolder(undefined)}
            color="inherit"
          >
            Home
          </Link>
          {currentFolder && (
            <Typography color="text.primary">Current Folder</Typography>
          )}
        </Breadcrumbs>
        <IconButton color="primary" onClick={() => navigate('/editor/new')}>
          <AddIcon />
        </IconButton>
      </Box>

      <List>
        {folders.map((folder) => (
          <ListItem
            key={folder.id}
            component="div"
            onClick={() => handleItemClick(folder)}
            sx={{ cursor: 'pointer' }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={(e) => handleMenuOpen(e, folder)}
              >
                <MoreIcon />
              </IconButton>
            }
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText
              primary={folder.name}
              secondary={new Date(folder.created_at).toLocaleDateString()}
            />
          </ListItem>
        ))}

        {documents.map((doc) => (
          <ListItem
            key={doc.id}
            component="div"
            onClick={() => handleItemClick(doc)}
            sx={{ cursor: 'pointer' }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={(e) => handleMenuOpen(e, doc)}
              >
                <MoreIcon />
              </IconButton>
            }
          >
            <ListItemIcon>
              <DocumentIcon />
            </ListItemIcon>
            <ListItemText
              primary={doc.title}
              secondary={`Version ${doc.version} - ${new Date(
                doc.updated_at
              ).toLocaleDateString()}`}
            />
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedItem && 'content' in selectedItem && (
          <MenuItem onClick={() => handleShareClick(selectedItem)}>Compartilhar</MenuItem>
        )}
        <MenuItem onClick={handleDelete}>Excluir</MenuItem>
      </Menu>

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        document={selectedDocument}
        onShare={handleShare}
      />
    </Box>
  );
};
