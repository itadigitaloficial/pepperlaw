-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft' NOT NULL,
    shared_with UUID[] DEFAULT '{}'::UUID[]
);

-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
    ON documents FOR SELECT
    USING (
        auth.uid() = owner_id OR
        auth.uid() = ANY(shared_with)
    );

CREATE POLICY "Users can insert their own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own documents"
    ON documents FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own documents"
    ON documents FOR DELETE
    USING (auth.uid() = owner_id);

-- Create RLS policies for folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folders"
    ON folders FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own folders"
    ON folders FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own folders"
    ON folders FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own folders"
    ON folders FOR DELETE
    USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_owner ON folders(owner_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
