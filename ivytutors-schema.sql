CREATE TABLE users (
  email TEXT PRIMARY KEY CHECK (position('@' IN email) > 1),
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  bio TEXT,
  university TEXT,
  image_url TEXT,
  zoom_link TEXT,
  stripe_id TEXT,
  avgReview NUMERIC,
  is_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  is_tutor BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- CREATE TABLE students (
--   email TEXT PRIMARY KEY CHECK (position('@' IN email) > 1),
--   full_name TEXT NOT NULL,
--   password TEXT NOT NULL
-- );

CREATE TABLE availability (
  tutor TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
  time TIMESTAMP NOT NULL,
  PRIMARY KEY (tutor, time)
);

CREATE TABLE lesson_types (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  credits INTEGER NOT NULL
);

CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  tutor TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
  student TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
  time TIMESTAMP NOT NULL,
  lesson_code TEXT NOT NULL REFERENCES lesson_types ON DELETE CASCADE,
  review INTEGER,
  completed BOOLEAN DEFAULT FALSE
);


