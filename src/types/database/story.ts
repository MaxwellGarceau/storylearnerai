import type { DifficultyLevel } from '../llm/prompts';

// Story management types
export interface DatabaseStory {
  id: string;
  title: string;
  content: string;
  language: string;
  difficulty_level: DifficultyLevel;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DatabaseStoryInsert {
  id?: string;
  title: string;
  content: string;
  language: string;
  difficulty_level: DifficultyLevel;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface DatabaseStoryUpdate {
  id?: string;
  title?: string;
  content?: string;
  language?: string;
  difficulty_level?: DifficultyLevel;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
} 