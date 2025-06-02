-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
-- Allow users to view their own contacts
CREATE POLICY "Allow individual user SELECT access on contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own contacts
CREATE POLICY "Allow individual user INSERT access on contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own contacts
CREATE POLICY "Allow individual user UPDATE access on contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own contacts
CREATE POLICY "Allow individual user DELETE access on contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);


-- Create policies for deals
-- Allow users to view their own deals
CREATE POLICY "Allow individual user SELECT access on deals" ON deals
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own deals
CREATE POLICY "Allow individual user INSERT access on deals" ON deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own deals
CREATE POLICY "Allow individual user UPDATE access on deals" ON deals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own deals
CREATE POLICY "Allow individual user DELETE access on deals" ON deals
  FOR DELETE USING (auth.uid() = user_id);
