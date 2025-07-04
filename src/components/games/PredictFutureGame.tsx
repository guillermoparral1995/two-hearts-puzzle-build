import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { UserName } from '@/types/game'
import { supabase } from '@/integrations/supabase/client'
import { gameQuestions } from '@/lib/gameQuestions'
import RoundResults from './shared/RoundResults'

interface PredictFutureGameProps {
    userSelection: UserName
    sessionId: string
    onGameComplete: () => void
    onBack: () => void
}

const PredictFutureGame = ({
  userSelection,
  sessionId,
  onGameComplete,
  onBack,
}: PredictFutureGameProps) => {
  const [currentRound, setCurrentRound] = useState(1)
  const [answer, setAnswer] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [waitingForOther, setWaitingForOther] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = gameQuestions.predict_future[currentRound - 1]

  useEffect(() => {
    checkOtherPlayerProgress()
  }, [currentRound, sessionId])

  useEffect(() => {
    let intervalId
    if (waitingForOther) {
      // Check if both players have submitted
      intervalId = setInterval(async () => {
        const { data } = await supabase
          .from('game_responses')
          .select('user_name')
          .eq('session_id', sessionId)
          .eq('game_type', 'predict_future')
          .eq('round_number', currentRound)

        const uniqueUsers = new Set(data?.map((r) => r.user_name))

        if (uniqueUsers.size === 2) {
          // Both players submitted, show results
          setWaitingForOther(false)
          setShowResults(true)
        }
      }, 1000)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [waitingForOther])

  const checkOtherPlayerProgress = async () => {
    const otherUser = userSelection === 'Guille' ? 'Delfina' : 'Guille'

    const { data } = await supabase
      .from('game_responses')
      .select('*')
      .eq('session_id', sessionId)
      .eq('game_type', 'predict_future')
      .eq('user_name', otherUser)
      .eq('round_number', currentRound)

    if (data && data.length > 0) {
      setWaitingForOther(false)
    }
  }

  const handleSubmit = async () => {
    await supabase.from('game_responses').insert({
      session_id: sessionId,
      game_type: 'predict_future',
      user_name: userSelection,
      round_number: currentRound,
      question: currentQuestion,
      answer: answer,
    })

    setIsSubmitted(true)
    setWaitingForOther(true)
  }

  const handleNextRound = () => {
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1)
      setAnswer('')
      setIsSubmitted(false)
      setShowResults(false)
    } else {
      onGameComplete()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-accent p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">
                        Predecí el futuro
          </h1>
        </div>

        <Card className="p-8 shadow-xl">
          {showResults ? (
            <RoundResults
              sessionId={sessionId}
              gameType="predict_future"
              currentRound={currentRound}
              userSelection={userSelection}
              onNextRound={handleNextRound}
              maxRounds={3}
            />
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Ronda {currentRound} de 3
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {currentQuestion}
                </p>
              </div>

              {waitingForOther ? (
                <div className="text-center">
                  <div className="animate-pulse mb-4">
                    <div className="w-16 h-16 bg-primary rounded-full mx-auto opacity-60"></div>
                  </div>
                  <p className="text-lg">
                    {`Esperando a que ${userSelection === 'Delfina' ? 'Guillermo' : 'Delfina'} termine...`}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Escribí lo que pensás..."
                    disabled={isSubmitted}
                    className="min-h-32"
                  />

                  {!isSubmitted && (
                    <Button
                      onClick={handleSubmit}
                      disabled={answer.trim() === ''}
                      className="w-full"
                      size="lg"
                    >
                      Enviar respuesta
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default PredictFutureGame
