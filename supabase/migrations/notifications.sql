-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('label_submission', 'studio_request', 'booking')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to notify admins of new label submissions
CREATE OR REPLACE FUNCTION notify_admins_label_submission()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Loop through all admins and create a notification for each
  FOR admin_record IN
    SELECT id FROM profiles WHERE role = 'admin'
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      admin_record.id,
      'label_submission',
      'New Label Demo Submission',
      'A new demo has been submitted for review',
      '/admin/submissions'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify admins of new studio requests
CREATE OR REPLACE FUNCTION notify_admins_studio_request()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Loop through all admins and create a notification for each
  FOR admin_record IN
    SELECT id FROM profiles WHERE role = 'admin'
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      admin_record.id,
      'studio_request',
      'New Studio Request',
      'A new studio service request has been submitted',
      '/admin/studio-requests'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create notification when new label submission is created
DROP TRIGGER IF EXISTS trigger_label_submission_notification ON label_submissions;
CREATE TRIGGER trigger_label_submission_notification
  AFTER INSERT ON label_submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_label_submission();

-- Trigger: Create notification when new studio request is created
DROP TRIGGER IF EXISTS trigger_studio_request_notification ON studio_requests;
CREATE TRIGGER trigger_studio_request_notification
  AFTER INSERT ON studio_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_studio_request();
