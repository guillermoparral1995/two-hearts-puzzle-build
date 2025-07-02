import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Palette, Eraser } from 'lucide-react';
import { UserName } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { gameQuestions } from '@/lib/gameQuestions';

interface DrawfulGameProps {
  userSelection: UserName;
  sessionId: string;
  onGameComplete: () => void;
  onBack: () => void;
}

const DrawfulGame = ({ userSelection, sessionId, onGameComplete, onBack }: DrawfulGameProps) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [isDrawing, setIsDrawing] = useState(true);
  const [guess, setGuess] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [drawingData, setDrawingData] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [waitingForOther, setWaitingForOther] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    determineRoundType();
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [currentRound, timeLeft, isSubmitted]);

  const determineRoundType = () => {
    // Guille draws on rounds 1,2,3 and guesses on 4,5,6
    // Delfina guesses on rounds 1,2,3 and draws on 4,5,6
    const guilleDraw = currentRound <= 3;
    setIsDrawing(userSelection === 'Guille' ? guilleDraw : !guilleDraw);
    
    if (isDrawing) {
      const promptIndex = Math.floor((currentRound - 1) % 3);
      setCurrentPrompt(gameQuestions.drawful[promptIndex]);
    }
    
    setTimeLeft(120);
    setIsSubmitted(false);
    setWaitingForOther(false);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setDrawingData(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawingData('');
  };

  const handleSubmit = async () => {
    if (isDrawing) {
      await supabase
        .from('game_responses')
        .insert({
          session_id: sessionId,
          game_type: 'drawful',
          user_name: userSelection,
          round_number: currentRound,
          question: currentPrompt,
          drawing_data: drawingData
        });
    } else {
      await supabase
        .from('game_responses')
        .insert({
          session_id: sessionId,
          game_type: 'drawful',
          user_name: userSelection,
          round_number: currentRound,
          answer: guess
        });
    }

    setIsSubmitted(true);
    setWaitingForOther(true);

    // Check if both players have submitted
    setTimeout(async () => {
      const { data } = await supabase
        .from('game_responses')
        .select('user_name')
        .eq('session_id', sessionId)
        .eq('game_type', 'drawful')
        .eq('round_number', currentRound);

      const uniqueUsers = new Set(data?.map(r => r.user_name));
      
      if (uniqueUsers.size === 2) {
        if (currentRound < 6) {
          setCurrentRound(currentRound + 1);
          setGuess('');
          clearCanvas();
        } else {
          onGameComplete();
        }
      }
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-accent p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">Drawful</h1>
        </div>

        <Card className="p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Round {currentRound} of 6</h2>
            <p className="text-lg font-semibold text-primary">{formatTime(timeLeft)}</p>
          </div>

          {waitingForOther ? (
            <div className="text-center">
              <div className="animate-pulse mb-4">
                <div className="w-16 h-16 bg-primary rounded-full mx-auto opacity-60"></div>
              </div>
              <p className="text-lg">Waiting for the other player...</p>
            </div>
          ) : isDrawing ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-lg mb-4">Draw: <strong>{currentPrompt}</strong></p>
              </div>
              
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className="border-2 border-border rounded-lg bg-white cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={clearCanvas}>
                  <Eraser className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                {!isSubmitted && (
                  <Button onClick={handleSubmit}>
                    <Palette className="w-4 h-4 mr-2" />
                    Submit Drawing
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-lg mb-4">What do you think the other person drew?</p>
              </div>
              
              <Input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess..."
                disabled={isSubmitted}
                className="text-center text-lg"
              />
              
              {!isSubmitted && (
                <Button 
                  onClick={handleSubmit}
                  disabled={guess.trim() === ''}
                  className="w-full"
                  size="lg"
                >
                  Submit Guess
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DrawfulGame;