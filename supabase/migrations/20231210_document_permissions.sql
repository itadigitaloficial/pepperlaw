-- Create document permissions table
CREATE TABLE IF NOT EXISTS document_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    permission TEXT CHECK (permission IN ('viewer', 'editor')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(document_id, user_id)
);

-- Create RLS policies for document permissions
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;

-- Users can view permissions for documents they own or have access to
CREATE POLICY "Users can view document permissions"
    ON document_permissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_permissions.document_id
            AND (
                documents.owner_id = auth.uid()
                OR document_permissions.user_id = auth.uid()
            )
        )
    );

-- Only document owners can insert permissions
CREATE POLICY "Document owners can insert permissions"
    ON document_permissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_permissions.document_id
            AND documents.owner_id = auth.uid()
        )
    );

-- Only document owners can update permissions
CREATE POLICY "Document owners can update permissions"
    ON document_permissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_permissions.document_id
            AND documents.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_permissions.document_id
            AND documents.owner_id = auth.uid()
        )
    );

-- Only document owners can delete permissions
CREATE POLICY "Document owners can delete permissions"
    ON document_permissions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE documents.id = document_permissions.document_id
            AND documents.owner_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_permissions_document ON document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_permissions_user ON document_permissions(user_id);
