-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT '{}'::TEXT[]
);

-- Create dynamic fields table
CREATE TABLE IF NOT EXISTS template_fields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    field_type TEXT CHECK (field_type IN ('text', 'number', 'date', 'select', 'boolean')) NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    default_value TEXT,
    options JSONB, -- Para campos do tipo select
    validation_rules JSONB,
    required BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    UNIQUE(template_id, name)
);

-- Create template categories table
CREATE TABLE IF NOT EXISTS template_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES template_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for templates
CREATE POLICY "Users can view public templates and their own templates"
    ON templates FOR SELECT
    USING (
        is_public = true OR
        created_by = auth.uid()
    );

CREATE POLICY "Users can create templates"
    ON templates FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
    );

CREATE POLICY "Users can update their own templates"
    ON templates FOR UPDATE
    USING (
        created_by = auth.uid()
    )
    WITH CHECK (
        created_by = auth.uid()
    );

CREATE POLICY "Users can delete their own templates"
    ON templates FOR DELETE
    USING (
        created_by = auth.uid()
    );

-- RLS policies for template fields
CREATE POLICY "Users can view template fields"
    ON template_fields FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM templates
            WHERE templates.id = template_fields.template_id
            AND (templates.is_public = true OR templates.created_by = auth.uid())
        )
    );

CREATE POLICY "Users can manage fields of their templates"
    ON template_fields FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM templates
            WHERE templates.id = template_fields.template_id
            AND templates.created_by = auth.uid()
        )
    );

-- RLS policies for template categories
CREATE POLICY "Everyone can view categories"
    ON template_categories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can manage categories"
    ON template_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_template_fields_template ON template_fields(template_id);
CREATE INDEX IF NOT EXISTS idx_template_fields_order ON template_fields(template_id, order_index);
CREATE INDEX IF NOT EXISTS idx_template_categories_parent ON template_categories(parent_id);
