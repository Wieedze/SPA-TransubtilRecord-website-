-- Releases already announced to the newsletter (scripts/newsletter/releases.ts)
CREATE TABLE announced_releases (
  bandcamp_id   TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  broadcast_id  TEXT NOT NULL,                  -- Resend broadcast id, or 'baseline' / 'skipped'
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- The catalogue online before this feature: never announced
INSERT INTO announced_releases (bandcamp_id, title, broadcast_id) VALUES
  ('1276691280', 'V.A Nightmare Cage', 'baseline'),
  ('4158104841', 'Anchronorium - Paradoxal Ep', 'baseline'),
  ('2775504586', 'Anchronorium - Dissonus', 'baseline'),
  ('155406373', 'V.A Chaos Simulator', 'baseline'),
  ('3369648476', 'Creepy Deep & Karev - Tongue Twister', 'baseline'),
  ('452095018', 'Kanaloa - Obsidian', 'baseline'),
  ('3676051951', 'Best of 7 years', 'baseline'),
  ('307314221', 'Opsuruus - No Humans', 'baseline'),
  ('3402257404', 'V.A Ultra Heaven', 'baseline'),
  ('1106676205', 'Ingenious Brain - Brain Terms', 'baseline'),
  ('2879833548', 'Zeo - Whispers Of Chaos', 'baseline'),
  ('120594099', 'Xipe Totecs - Party Games', 'baseline'),
  ('3318037261', 'Opsuruus - Surreal Contrast', 'baseline'),
  ('3401677597', 'Warp Drive - Jungle Worms', 'baseline'),
  ('2293845675', 'Ingenious Brain - Dirty Experiments 2.0', 'baseline'),
  ('1823970644', 'The Horrids - BioHackers', 'baseline'),
  ('1760532212', 'Ingenious Brain - Dirty Experiments', 'baseline'),
  ('6011190', 'Dr Fractal - Red Spicy', 'baseline'),
  ('3468402328', 'Strange Creatures Collective', 'baseline'),
  ('2123996018', 'V.A Divergent Polarity', 'baseline'),
  ('1918549876', 'Precisely Nowhere', 'baseline'),
  ('1576423401', 'V.A Ta-Na-tsiic', 'baseline'),
  ('3535232346', 'Xipe Totecs - Evil in the shell - EP', 'baseline'),
  ('2062036570', 'Dr Fractal - Into Matter', 'baseline'),
  ('1863032189', 'V.A Freaky Riders', 'baseline'),
  ('3482061100', 'Veheme - Subtil Cruizer', 'baseline'),
  ('832945600', 'Dr Fractal - Smooth Lobotomy', 'baseline'),
  ('3496769874', 'Paranoid Ep', 'baseline'),
  ('3965082094', 'V.A New Wave Killer', 'baseline'),
  ('3420337027', 'Unsinkable Ep', 'baseline'),
  ('17496551', 'Don Piano', 'baseline'),
  ('1913421101', 'Galaktic Garbage Ep', 'baseline'),
  ('1085913171', 'Andromed - In Loading Ep', 'baseline'),
  ('985067329', 'Transsiberian', 'baseline'),
  ('1502904550', 'Midnight snacks', 'baseline'),
  ('3624884228', 'South Syndicate', 'baseline'),
  ('4078066189', 'Shrezonant', 'baseline');
