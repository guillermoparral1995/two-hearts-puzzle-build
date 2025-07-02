export type UserName = 'Guille' | 'Delfina';

export type GameType = 'top10' | 'predict_future' | 'drawful' | 'would_you_do';

export interface GameSession {
  id: string;
  session_code: string;
  guille_connected: boolean;
  delfina_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameProgress {
  id: string;
  session_id: string;
  game_type: GameType;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameResponse {
  id: string;
  session_id: string;
  game_type: GameType;
  user_name: UserName;
  round_number: number;
  question: string | null;
  answer: string | null;
  drawing_data: string | null;
  created_at: string;
}

export interface CurrentGameState {
  id: string;
  session_id: string;
  current_game: GameType | null;
  current_round: number;
  current_turn: UserName | null;
  waiting_for_players: boolean;
  game_data: any;
  updated_at: string;
}

export interface GameQuestions {
  top10: string[];
  predict_future: string[];
  would_you_do: string[];
  drawful: string[];
}