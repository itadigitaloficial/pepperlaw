-- Create document versions table
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create document changes table for detailed change tracking
CREATE TABLE IF NOT EXISTS document_changes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    version_id UUID REFERENCES document_versions(id) ON DELETE CASCADE NOT NULL,
    field_path TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT CHECK (change_type IN ('add', 'modify', 'delete')) NOT NULL
);

-- Enable RLS
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_changes ENABLE ROW LEVEL SECURITY;

-- RLS policies for document versions
CREATE POLICY "Users can view versions of accessible documents"
    ON document_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents
            LEFT JOIN document_permissions ON documents.id = document_permissions.document_id
            WHERE documents.id = document_versions.document_id
            AND (
                documents.owner_id = auth.uid()
                OR document_permissions.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create versions of editable documents"
    ON document_versions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            LEFT JOIN document_permissions ON documents.id = document_permissions.document_id
            WHERE documents.id = document_versions.document_id
            AND (
                documents.owner_id = auth.uid()
                OR (
                    document_permissions.user_id = auth.uid()
                    AND document_permissions.permission = 'editor'
                )
            )
        )
    );

-- RLS policies for document changes
CREATE POLICY "Users can view changes of accessible documents"
    ON document_changes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM document_versions
            JOIN documents ON documents.id = document_versions.document_id
            LEFT JOIN document_permissions ON documents.id = document_permissions.document_id
            WHERE document_versions.id = document_changes.version_id
            AND (
                documents.owner_id = auth.uid()
                OR document_permissions.user_id = auth.uid()
            )
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_number ON document_versions(document_id, version_number);
CREATE INDEX IF NOT EXISTS idx_document_changes_version ON document_changes(version_id);

-- Function to automatically increment version number
CREATE OR REPLACE FUNCTION fn_auto_version_number()
RETURNS TRIGGER AS $$
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO NEW.version_number
    FROM document_versions
    WHERE document_id = NEW.document_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-incrementing version number
CREATE TRIGGER tr_auto_version_number
    BEFORE INSERT ON document_versions
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_version_number();
