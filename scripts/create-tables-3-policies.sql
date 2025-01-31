-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and gadgets'),
  ('Furniture', 'Home and office furniture'),
  ('Clothing', 'Clothes, shoes, and accessories'),
  ('Books', 'Books, textbooks, and literature'),
  ('Sports', 'Sports equipment and gear'),
  ('Vehicles', 'Cars, bikes, and other vehicles'),
  ('Tools', 'Tools and equipment'),
  ('Other', 'Miscellaneous items')
ON CONFLICT (name) DO NOTHING;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile with valid invite"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      is_admin = true OR 
      EXISTS (
        SELECT 1 FROM invites 
        WHERE status = 'pending' 
        AND email = (SELECT email FROM auth.users WHERE auth.users.id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Invites policies
CREATE POLICY "Users can view their sent invites"
  ON invites FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = inviter_id));

CREATE POLICY "Users can create invites if they have invites left"
  ON invites FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM profiles 
      WHERE id = inviter_id 
      AND invites_left > 0
    )
  );

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Items policies
CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id));

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id));

CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id));

-- Views policies
CREATE POLICY "Users can view all views"
  ON views FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own views"
  ON views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id));

-- Favorites policies
CREATE POLICY "Users can view all favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id));

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id));

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = buyer_id
      UNION
      SELECT user_id FROM profiles WHERE id = seller_id
    )
  );

CREATE POLICY "Users can insert conversations as buyers"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = buyer_id));

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = buyer_id
      UNION
      SELECT user_id FROM profiles WHERE id = seller_id
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM conversations c
      JOIN profiles p ON p.id IN (c.buyer_id, c.seller_id)
      WHERE c.id = conversation_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM conversations c
      JOIN profiles p ON p.id IN (c.buyer_id, c.seller_id)
      WHERE c.id = conversation_id
      AND p.user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their conversations"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM conversations c
      JOIN profiles p ON p.id IN (c.buyer_id, c.seller_id)
      WHERE c.id = conversation_id
      AND p.user_id = auth.uid()
    )
  ); 