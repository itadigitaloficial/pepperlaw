import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { Document } from '../../services/documentService';
import { supabase } from '../../services/supabase';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
  onShare: (userIds: string[], permission: string) => Promise<void>;
}

interface User {
  id: string;
  email: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  document,
  onShare,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [permission, setPermission] = useState('viewer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && searchTerm) {
      searchUsers();
    }
  }, [searchTerm, open]);

  const searchUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', `%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      setUsers(users || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setUsers([]);
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      await onShare(
        selectedUsers.map(u => u.id),
        permission
      );
      onClose();
    } catch (error) {
      console.error('Erro ao compartilhar documento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Compartilhar Documento</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {document?.title}
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Buscar usuários por email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        {users.length > 0 && (
          <List>
            {users.map((user) => (
              <ListItem
                key={user.id}
                component="div"
                onClick={() => handleUserSelect(user)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText primary={user.email} />
              </ListItem>
            ))}
          </List>
        )}

        <Box sx={{ mb: 2 }}>
          {selectedUsers.map((user) => (
            <Chip
              key={user.id}
              label={user.email}
              onDelete={() => handleUserRemove(user.id)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>

        <FormControl fullWidth>
          <InputLabel>Permissão</InputLabel>
          <Select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
          >
            <MenuItem value="viewer">Visualizador</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleShare}
          color="primary"
          disabled={selectedUsers.length === 0 || loading}
        >
          Compartilhar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
