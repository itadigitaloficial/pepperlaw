import { supabase } from './supabase';
import { diffChars } from 'diff';

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  version_number: number;
  created_at: string;
  created_by: string;
  change_description: string;
  metadata: Record<string, any>;
}

export interface DocumentChange {
  id: string;
  version_id: string;
  field_path: string;
  old_value: string | null;
  new_value: string | null;
  change_type: 'add' | 'modify' | 'delete';
}

class VersionService {
  async createVersion(documentId: string, content: string, description: string) {
    const { data: previousVersion } = await supabase
      .from('document_versions')
      .select('content, version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    // Criar nova versão
    const { data: newVersion, error: versionError } = await supabase
      .from('document_versions')
      .insert([
        {
          document_id: documentId,
          content,
          change_description: description,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select()
      .single();

    if (versionError) throw versionError;

    // Se houver versão anterior, calcular e registrar as mudanças
    if (previousVersion) {
      const changes = diffChars(previousVersion.content, content);
      const documentChanges = changes.map((change) => ({
        version_id: newVersion.id,
        field_path: 'content',
        old_value: change.removed ? change.value : null,
        new_value: change.added ? change.value : null,
        change_type: change.added ? 'add' : change.removed ? 'delete' : 'modify',
      }));

      if (documentChanges.length > 0) {
        const { error: changesError } = await supabase
          .from('document_changes')
          .insert(documentChanges);

        if (changesError) throw changesError;
      }
    }

    return newVersion;
  }

  async getVersions(documentId: string) {
    const { data, error } = await supabase
      .from('document_versions')
      .select(`
        *,
        created_by_user:created_by (
          email
        )
      `)
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getVersion(versionId: string) {
    const { data, error } = await supabase
      .from('document_versions')
      .select(`
        *,
        changes:document_changes(*)
      `)
      .eq('id', versionId)
      .single();

    if (error) throw error;
    return data;
  }

  async compareVersions(versionId1: string, versionId2: string) {
    const [version1, version2] = await Promise.all([
      this.getVersion(versionId1),
      this.getVersion(versionId2),
    ]);

    const differences = diffChars(version1.content, version2.content);
    return differences;
  }

  async restoreVersion(documentId: string, versionId: string) {
    const { data: version } = await this.getVersion(versionId);
    
    if (!version) throw new Error('Versão não encontrada');

    // Criar uma nova versão com o conteúdo da versão restaurada
    return this.createVersion(
      documentId,
      version.content,
      `Restaurado para versão ${version.version_number}`
    );
  }
}

export const versionService = new VersionService();
