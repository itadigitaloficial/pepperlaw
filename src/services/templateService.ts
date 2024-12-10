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
  id?: string;
  template_id: string;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  default_value?: string;
  options?: string[];
  order: number;
  field_type: 'text' | 'number' | 'date' | 'select' | 'boolean';
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
        order: index,
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
          order: index,
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
      .order('order');

    if (fieldsError) throw fieldsError;

    return {
      ...template,
      fields: fields || [],
    };
  }

  async getTemplateFields(templateId: string) {
    const { data: fields, error: fieldsError } = await supabase
      .from('template_fields')
      .select('*')
      .eq('template_id', templateId)
      .order('order');

    if (fieldsError) throw fieldsError;

    return fields as TemplateField[];
  }

  async addTemplateField(templateId: string, field: Partial<TemplateField>) {
    const { data, error } = await supabase
      .from('template_fields')
      .insert([
        {
          ...field,
          template_id: templateId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as TemplateField;
  }

  async updateTemplateField(templateId: string, fieldId: string, field: Partial<TemplateField>) {
    const { data, error } = await supabase
      .from('template_fields')
      .update(field)
      .eq('id', fieldId)
      .eq('template_id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data as TemplateField;
  }

  async deleteTemplateField(templateId: string, fieldId: string) {
    const { error } = await supabase
      .from('template_fields')
      .delete()
      .eq('id', fieldId)
      .eq('template_id', templateId);

    if (error) throw error;
  }

  async reorderTemplateFields(templateId: string, fields: TemplateField[]) {
    const updates = fields.map((field, index) => ({
      id: field.id,
      order: index,
    }));

    const { error } = await supabase
      .from('template_fields')
      .upsert(updates);

    if (error) throw error;
  }

  async listTemplates(category?: string) {
    let query = supabase
      .from('templates')
      .select('*, fields:template_fields(*)');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((template: Template & { fields: TemplateField[] }) => ({
      ...template,
      fields: template.fields || [],
    })) as Template[];
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
    return data as TemplateCategory[];
  }

  async createDocument(templateId: string, fieldValues: Record<string, string>) {
    const template = await this.getTemplate(templateId);
    const fields = await this.getTemplateFields(templateId);

    let content = template.content;
    fields.forEach((field: TemplateField) => {
      const value = fieldValues[field.name] || field.default_value || '';
      content = content.replace(`{{${field.name}}}`, value);
    });

    const { data: document, error } = await supabase
      .from('documents')
      .insert([
        {
          name: template.name,
          content: content,
          template_id: templateId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return document;
  }

  async deleteTemplate(templateId: string) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  }

  async duplicateTemplate(templateId: string) {
    // Obter o template original e seus campos
    const original = await this.getTemplate(templateId);
    const originalFields = await this.getTemplateFields(templateId);
    
    // Criar uma cópia do template
    const { data: newTemplate, error: templateError } = await supabase
      .from('templates')
      .insert([
        {
          name: `${original.name} (Cópia)`,
          description: original.description,
          content: original.content,
          category: original.category,
          is_public: false,
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
    if (originalFields.length > 0) {
      const fieldsWithNewTemplate = originalFields.map((field: TemplateField) => ({
        ...field,
        id: undefined,
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
      .select('*, fields:template_fields(*)')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((template: Template & { fields: TemplateField[] }) => ({
      ...template,
      fields: template.fields || [],
    })) as Template[];
  }
}

export const templateService = new TemplateService();
