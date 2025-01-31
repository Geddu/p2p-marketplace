-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create invite handling function
CREATE OR REPLACE FUNCTION process_invite_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Update invites_left count for inviter
    UPDATE profiles 
    SET invites_left = invites_left - 1
    WHERE id = NEW.inviter_id;
    
    -- Set accepted_at timestamp
    NEW.accepted_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create review handling function
CREATE OR REPLACE FUNCTION process_review_impact()
RETURNS TRIGGER AS $$
DECLARE
  weight DECIMAL(4,2) := 0.2; -- Impact weight for connected users
  reviewed_user profiles%ROWTYPE;
  inviter_id UUID;
  impact DECIMAL(4,2);
BEGIN
  -- Calculate the impact
  impact := (NEW.rating - 5) * weight;
  
  -- Get the reviewed user's data
  SELECT * INTO reviewed_user FROM profiles WHERE id = NEW.reviewed_id;
  
  -- Update the directly reviewed user
  UPDATE profiles 
  SET reputation_score = LEAST(5, GREATEST(0, reputation_score + (NEW.rating - 5)))
  WHERE id = NEW.reviewed_id;
  
  -- If affects_inviter is true and user was invited by someone
  IF NEW.affects_inviter = true AND reviewed_user.invited_by_id IS NOT NULL THEN
    UPDATE profiles 
    SET reputation_score = LEAST(5, GREATEST(0, reputation_score + impact))
    WHERE id = reviewed_user.invited_by_id;
  END IF;
  
  -- If affects_invitees is true, update reputation of users invited by the reviewed user
  IF NEW.affects_invitees = true THEN
    UPDATE profiles 
    SET reputation_score = LEAST(5, GREATEST(0, reputation_score + impact))
    WHERE invited_by_id = NEW.reviewed_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for invite processing
CREATE TRIGGER process_invite_acceptance_trigger
  BEFORE UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION process_invite_acceptance();

-- Create trigger for review processing
CREATE TRIGGER process_review_impact_trigger
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION process_review_impact(); 