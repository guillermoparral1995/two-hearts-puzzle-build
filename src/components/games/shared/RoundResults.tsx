import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserName, GameType } from '@/types/game'
import { supabase } from '@/integrations/supabase/client'

interface GameResponse {
  user_name: UserName
  question: string
  answer: string
}

interface RoundResultsProps {
  sessionId: string
  gameType: GameType
  currentRound: number
  userSelection: UserName
  onNextRound: () => void
  maxRounds: number
}

const RoundResults = ({
  sessionId,
  gameType,
  currentRound,
  userSelection,
  onNextRound,
  maxRounds,
}: RoundResultsProps) => {
  const [responses, setResponses] = useState<GameResponse[]>([])
  const [waitingForOther, setWaitingForOther] = useState(false)
  const [hasClickedNext, setHasClickedNext] = useState(false)

  useEffect(() => {
    fetchRoundResponses()
  }, [])

  useEffect(() => {
    if (hasClickedNext) {
      // Check if both players have clicked next
      const interval = setInterval(async () => {
        const { data } = await supabase
          .from('game_responses')
          .select('user_name')
          .eq('session_id', sessionId)
          .eq('game_type', gameType)
          .eq('round_number', currentRound + 100)

        const uniqueUsers = new Set(data?.map((r) => r.user_name))
        if (uniqueUsers.size === 2) {
          // Clean up the next round markers
          await supabase
            .from('game_responses')
            .delete()
            .eq('session_id', sessionId)
            .eq('game_type', gameType)
            .eq('round_number', currentRound + 100)

          onNextRound()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [hasClickedNext])

  const fetchRoundResponses = async () => {
    const { data } = await supabase
      .from('game_responses')
      .select('user_name, question, answer')
      .eq('session_id', sessionId)
      .eq('game_type', gameType)
      .eq('round_number', currentRound)
      .order('user_name')

    if (data) {
      setResponses(data)
    }
  }

  const handleNextRound = async () => {
    // Mark this player as ready for next round
    await supabase.from('game_responses').insert({
      session_id: sessionId,
      game_type: gameType,
      user_name: userSelection,
      round_number: currentRound + 100, // Use offset to mark as "next round ready"
      question: 'next_round_marker',
      answer: 'ready',
    })

    setHasClickedNext(true)
    setWaitingForOther(true)
  }

  const guilleResponses = responses.filter(r => r.user_name === 'Guille')
  const delfinaResponses = responses.filter(r => r.user_name === 'Delfina')

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Resultados Ronda {currentRound}
        </h2>
        <p className="text-muted-foreground">
          Mirá las respuestas de ambos jugadores
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Guillermo</h3>
          <div className="space-y-3">
            {guilleResponses.map((response, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                {gameType === 'top10' ? (
                  <p className="text-sm font-medium">{response.question.split(' - ')[1]}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-1">{response.question}</p>
                )}
                <p className="text-lg">{response.answer}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Delfina</h3>
          <div className="space-y-3">
            {delfinaResponses.map((response, index) => (
              <div key={index} className="border-l-4 border-secondary pl-4">
                {gameType === 'top10' ? (
                  <p className="text-sm font-medium">{response.question.split(' - ')[1]}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-1">{response.question}</p>
                )}
                <p className="text-lg">{response.answer}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {waitingForOther ? (
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto opacity-60"></div>
          </div>
          <p className="text-lg">
            {`Esperando a que ${userSelection === 'Delfina' ? 'Guillermo' : 'Delfina'} presione siguiente...`}
          </p>
        </div>
      ) : (
        <div className="text-center">
          <Button
            onClick={handleNextRound}
            size="lg"
            className="px-8"
          >
            {currentRound < maxRounds ? 'Siguiente ronda' : 'Terminar juego'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default RoundResults