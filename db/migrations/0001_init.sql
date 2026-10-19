-- Newsletter subscribers (source of truth for the mailing list)
CREATE TABLE subscribers (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  email             TEXT NOT NULL UNIQUE COLLATE NOCASE,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'unsubscribed')),
  source            TEXT,                       -- e.g. 'landing', 'footer', 'import'
  confirm_token     TEXT UNIQUE,                -- double opt-in token, cleared once confirmed
  unsubscribe_token TEXT NOT NULL UNIQUE,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  confirmed_at      TEXT,
  unsubscribed_at   TEXT
);

CREATE INDEX idx_subscribers_status ON subscribers (status);

-- Demo, contact and booking form submissions (log kept alongside the email sent)
CREATE TABLE submissions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT NOT NULL CHECK (type IN ('demo', 'contact', 'booking')),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  payload     TEXT NOT NULL,                    -- JSON of the remaining form fields
  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'read', 'answered', 'archived')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_submissions_type_created ON submissions (type, created_at DESC);
