-- ==========================================
-- SkillSwap Database Schema
-- Run this in PostgreSQL or Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USERS TABLE
-- Stores all registered users
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_photo VARCHAR(500),         -- URL or filename
  location VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 0.00,   -- Average rating (0-5)
  rating_count INT DEFAULT 0,          -- Number of ratings received
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- SKILLS TABLE
-- Master list of all available skills
-- ==========================================
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50),               -- e.g., "Technology", "Art", "Music"
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- SKILL_OFFERS TABLE
-- Skills that users can TEACH
-- ==========================================
CREATE TABLE skill_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, expert
  description TEXT,                   -- Extra details about what they can teach
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, skill_id)           -- A user can only offer a skill once
);

-- ==========================================
-- SKILL_REQUESTS TABLE
-- Skills that users WANT to LEARN
-- ==========================================
CREATE TABLE skill_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  description TEXT,                   -- What they hope to achieve
  urgency VARCHAR(20) DEFAULT 'normal', -- low, normal, high
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- ==========================================
-- EXCHANGES TABLE
-- Tracks skill barter agreements between users
-- ==========================================
CREATE TABLE exchanges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,   -- Who sent the request
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,    -- Who received the request
  requester_skill_id UUID REFERENCES skills(id),              -- Skill requester offers
  provider_skill_id UUID REFERENCES skills(id),               -- Skill provider offers
  status VARCHAR(20) DEFAULT 'pending',  -- pending, accepted, rejected, completed, cancelled
  message TEXT,                           -- Initial message with request
  requester_rating INT,                   -- Rating given by requester (1-5)
  provider_rating INT,                    -- Rating given by provider (1-5)
  requester_review TEXT,
  provider_review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- MESSAGES TABLE
-- Chat messages between matched users
-- ==========================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exchange_id UUID REFERENCES exchanges(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- NOTIFICATIONS TABLE
-- System notifications for users
-- ==========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,          -- e.g., 'exchange_request', 'message', 'exchange_accepted'
  title VARCHAR(200) NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,                    -- ID of related exchange or message
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- INDEXES for better query performance
-- ==========================================
CREATE INDEX idx_skill_offers_user ON skill_offers(user_id);
CREATE INDEX idx_skill_offers_skill ON skill_offers(skill_id);
CREATE INDEX idx_skill_requests_user ON skill_requests(user_id);
CREATE INDEX idx_skill_requests_skill ON skill_requests(skill_id);
CREATE INDEX idx_exchanges_requester ON exchanges(requester_id);
CREATE INDEX idx_exchanges_provider ON exchanges(provider_id);
CREATE INDEX idx_messages_exchange ON messages(exchange_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- ==========================================
-- SEED DATA: Default skill categories
-- ==========================================
INSERT INTO skills (name, category) VALUES
  ('JavaScript', 'Technology'),
  ('Python', 'Technology'),
  ('React', 'Technology'),
  ('Node.js', 'Technology'),
  ('SQL', 'Technology'),
  ('UI/UX Design', 'Design'),
  ('Graphic Design', 'Design'),
  ('Photoshop', 'Design'),
  ('Illustrator', 'Design'),
  ('Video Editing', 'Media'),
  ('Photography', 'Media'),
  ('Piano', 'Music'),
  ('Guitar', 'Music'),
  ('Singing', 'Music'),
  ('Spanish', 'Language'),
  ('French', 'Language'),
  ('Mandarin', 'Language'),
  ('English Writing', 'Language'),
  ('Digital Marketing', 'Business'),
  ('SEO', 'Business'),
  ('Public Speaking', 'Business'),
  ('Yoga', 'Health & Fitness'),
  ('Cooking', 'Lifestyle'),
  ('Baking', 'Lifestyle'),
  ('Drawing', 'Art'),
  ('Watercolor Painting', 'Art'),
  ('3D Modeling', 'Technology'),
  ('Machine Learning', 'Technology'),
  ('Data Analysis', 'Technology'),
  ('Excel', 'Business');
