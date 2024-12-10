import { supabase } from './supabase';

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_public: boolean;
  metadata: Record<string, any>;
  tags: string[];
}

export interface TemplateField {
  id: string;
  template_id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  label: string;
  placeholder?: string;
  default_value?: string;
  options?: any[];
  validation_rules?: Record<string, any>;
  required: boolean;
  order_index: number;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
}

class TemplateService {
  async createTemplate(template: Partial<Template>, fields: Partial<TemplateField>[]) {
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .insert([
        {
          ...template,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (templateError) throw templateError;

    if (fields.length > 0) {
      const fieldsWithTemplate = fields.map((field, index) => ({
        ...field,
        template_id: templateData.id,
        order_index: index,
      }));

      const { error: fieldsError } = await supabase
        .from('template_fields')
        .insert(fieldsWithTemplate);

      if (fieldsError) throw fieldsError;
    }

    return templateData;
  }

  async updateTemplate(
    templateId: string,
    template: Partial<Template>,
    fields?: Partial<TemplateField>[]
  ) {
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .update({
        ...template,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .select()
      .single();

    if (templateError) throw templateError;

    if (fields) {
      // Remover campos existentes
      const { error: deleteError } = await supabase
        .from('template_fields')
        .delete()
        .eq('template_id', templateId);

      if (deleteError) throw deleteError;

      // Inserir novos campos
      if (fields.length > 0) {
        const fieldsWithTemplate = fields.map((field, index) => ({
          ...field,
          template_id: templateId,
          order_index: index,
        }));

        const { error: fieldsError } = await supabase
          .from('template_fields')
          .insert(fieldsWithTemplate);

        if (fieldsError) throw fieldsError;
      }
    }

    return templateData;
  }

  async getTemplate(templateId: string) {
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    const { data: fields, error: fieldsError } = await supabase
      .from('template_fields')
      .select('*')
      .eq('template_id', templateId)
      .order('order_index');

    if (fieldsError) throw fieldsError;

    return {
      ...template,
      fields: fields || [],
    };
  }

  async listTemplates(category?: string) {
    let query = supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async listCategories(parentId?: string) {
    let query = supabase
      .from('template_categories')
      .select('*')
      .order('name');

    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createDocument(templateId: string, fieldValues: Record<string, any>) {
    const template = await this.getTemplate(templateId);
    
    // Substituir campos dinâmicos no conteúdo do template
    let content = template.content;
    template.fields.forEach((field) => {
      const value = fieldValues[field.name] || field.default_value || '';
      content = content.replace(new RegExp(`{{${field.name}}}`, 'g'), value);
    });

    // Criar novo documento usando o conteúdo processado
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          title: `${template.name} - ${new Date().toLocaleDateString()}`,
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: (await supabase.auth.getUser()).data.user?.id,
          metadata: {
            template_id: templateId,
            field_values: fieldValues,
          },
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTemplate(templateId: string) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  }

  async duplicateTemplate(templateId: string) {
    // Obter o template original
    const original = await this.getTemplate(templateId);
    
    // Criar uma cópia do template
    const { data: newTemplate, error: templateError } = await supabase
      .from('templates')
      .insert([
        {
          name: `${original.name} (Cópia)`,
          description: original.description,
          content: original.content,
          category: original.category,
          is_public: false, // A cópia sempre começa como privada
          created_by: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: original.metadata,
          tags: original.tags,
        },
      ])
      .select()
      .single();

    if (templateError) throw templateError;

    // Copiar os campos do template
    if (original.fields && original.fields.length > 0) {
      const fieldsWithNewTemplate = original.fields.map((field) => ({
        ...field,
        id: undefined, // Remover ID para criar novos registros
        template_id: newTemplate.id,
      }));

      const { error: fieldsError } = await supabase
        .from('template_fields')
        .insert(fieldsWithNewTemplate);

      if (fieldsError) throw fieldsError;
    }

    return newTemplate;
  }

  async searchTemplates(query: string) {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export const templateService = new TemplateService();
