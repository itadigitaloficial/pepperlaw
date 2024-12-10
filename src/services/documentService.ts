import { supabase } from './supabase';

export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  folder_id?: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  shared_with: string[];
}

export interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  owner_id: string;
  created_at: string;
}

export interface DocumentPermission {
  user_id: string;
  document_id: string;
  permission: 'viewer' | 'editor';
  created_at: string;
}

class DocumentService {
  async createDocument(document: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          ...document,
          version: 1,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  }

  async updateDocument(id: string, updates: Partial<Document>) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        version: updates.version ? updates.version + 1 : undefined,
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }

  async getDocument(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async listDocuments(folderId?: string) {
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createFolder(folder: Partial<Folder>) {
    const { data, error } = await supabase
      .from('folders')
      .insert([
        {
          ...folder,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  }

  async listFolders(parentId?: string) {
    let query = supabase
      .from('folders')
      .select('*')
      .order('name', { ascending: true });

    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async shareDocument(documentId: string, userIds: string[], permission: string) {
    const permissions = userIds.map(userId => ({
      document_id: documentId,
      user_id: userId,
      permission,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('document_permissions')
      .upsert(permissions)
      .select();

    if (error) throw error;
    return data;
  }

  async getDocumentPermissions(documentId: string) {
    const { data, error } = await supabase
      .from('document_permissions')
      .select(`
        *,
        user:user_id (
          email
        )
      `)
      .eq('document_id', documentId);

    if (error) throw error;
    return data;
  }

  async removeDocumentPermission(documentId: string, userId: string) {
    const { error } = await supabase
      .from('document_permissions')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}

export const documentService = new DocumentService();
