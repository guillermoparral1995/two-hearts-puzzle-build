-- Create enum for game types
CREATE TYPE game_type AS ENUM ('top10', 'predict_future', 'drawful', 'would_you_do');

-- Create enum for user names
CREATE TYPE user_name AS ENUM ('Guille', 'Delfina');

-- Create game sessions table
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_code TEXT NOT NULL UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  guille_connected BOOLEAN DEFAULT FALSE,
  delfina_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game progress table
CREATE TABLE public.game_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  game_type game_type NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, game_type)
);

-- Create game responses table for storing answers
CREATE TABLE public.game_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  game_type game_type NOT NULL,
  user_name user_name NOT NULL,
  round_number INTEGER NOT NULL,
  question TEXT,
  answer TEXT,
  drawing_data TEXT, -- for drawful game
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create current game state table for real-time coordination
CREATE TABLE public.current_game_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE UNIQUE,
  current_game game_type,
  current_round INTEGER DEFAULT 1,
  current_turn user_name, -- for drawful game
  waiting_for_players BOOLEAN DEFAULT FALSE,
  game_data JSONB, -- flexible data for game-specific state
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_game_state ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for this anniversary app)
CREATE POLICY "Allow all operations on game_sessions" ON public.game_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on game_progress" ON public.game_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on game_responses" ON public.game_responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on current_game_state" ON public.current_game_state FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_progress_updated_at
  BEFORE UPDATE ON public.game_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_current_game_state_updated_at
  BEFORE UPDATE ON public.current_game_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.game_progress REPLICA IDENTITY FULL;
ALTER TABLE public.game_responses REPLICA IDENTITY FULL;
ALTER TABLE public.current_game_state REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.current_game_state;