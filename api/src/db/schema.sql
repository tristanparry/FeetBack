SET TIMEZONE TO 'UTC';

CREATE TABLE "User" (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  profile_pic_uri TEXT,
  name VARCHAR(254) NOT NULL,
  language VARCHAR(2) NOT NULL CHECK (language IN ('en','fr','es','de','it','pt','ru','zh','ja','ko','hi')) DEFAULT 'en',
  temp_unit CHAR(1) NOT NULL CHECK (temp_unit IN ('C','F')) DEFAULT 'C'
);

CREATE TABLE "Insole" (
  insole_id VARCHAR(256) PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
  foot CHAR(1) NOT NULL CHECK (foot IN ('L','R')),
  UNIQUE(user_id, foot)
);

CREATE TABLE "SensorReading" (
  user_id INT NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
  insole_id VARCHAR(256) NOT NULL REFERENCES "Insole"(insole_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_temperature INT,
  avg_alignment INT,
  temperature_series JSONB DEFAULT '[]'::jsonb,
  temperature_counts JSONB DEFAULT '[]'::jsonb,
  alignment_series JSONB DEFAULT '[]'::jsonb,
  alignment_counts JSONB DEFAULT '[]'::jsonb,
  force_sensors JSONB DEFAULT '[]'::jsonb,
  force_sensors_count INT DEFAULT 0,
  PRIMARY KEY (user_id, insole_id, date)
);

CREATE TABLE "RefreshToken" (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_daily_sensor_reading ON "SensorReading"(insole_id, date);

CREATE INDEX idx_refresh_token_user_id ON "RefreshToken"(user_id);
