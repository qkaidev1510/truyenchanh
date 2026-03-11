-- Initial database setup for Manga Platform
-- This runs once when the PostgreSQL container is first created.

-- Ensure the database exists (already created via POSTGRES_DB env var)
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE manga_db TO manga;
