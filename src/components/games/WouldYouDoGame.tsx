import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Heart, X } from 'lucide-react'
import { UserName } from '@/types/game'
import { supabase } from '@/integrations/supabase/client'
import { gameQuestions } from '@/lib/gameQuestions'
import RoundResults from './shared/RoundResults'

interface WouldYouDoGameProps {
  userSelection: UserName
  sessionId: string
  onGameComplete: () => void
  onBack: () => void
}

const WouldYouDoGame = ({
  userSelection,
  sessionId,
  onGameComplete,
  onBack,
}: WouldYouDoGameProps) => {
  const [currentRound, setCurrentRound] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [waitingForOther, setWaitingForOther] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = gameQuestions.would_you_do[currentRound - 1]

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
          .eq('game_type', 'would_you_do')
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
      .eq('game_type', 'would_you_do')
      .eq('user_name', otherUser)
      .eq('round_number', currentRound)

    if (data && data.length > 0) {
      setWaitingForOther(false)
    }
  }

  const handleAnswer = async (answer: 'Sí' | 'No') => {
    await supabase.from('game_responses').insert({
      session_id: sessionId,
      game_type: 'would_you_do',
      user_name: userSelection,
      round_number: currentRound,
      question: currentQuestion,
      answer: answer,
    })

    setIsSubmitted(true)
    setWaitingForOther(true)
  }

  const handleNextRound = () => {
    if (currentRound < 5) {
      setCurrentRound(currentRound + 1)
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
            Favores
          </h1>
        </div>

        <Card className="p-8 shadow-xl">
          {showResults ? (
            <RoundResults
              sessionId={sessionId}
              gameType="would_you_do"
              currentRound={currentRound}
              userSelection={userSelection}
              onNextRound={handleNextRound}
              maxRounds={5}
            />
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Pregunta {currentRound} de 5
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
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
                <div className="flex justify-center space-x-8">
                  <Button
                    onClick={() => handleAnswer('Sí')}
                    disabled={isSubmitted}
                    size="lg"
                    className="w-32 h-32 rounded-full bg-green-500 hover:bg-green-600 text-white flex flex-col items-center justify-center space-y-2"
                  >
                    <Heart className="w-8 h-8" />
                    <span className="text-lg font-bold">SI</span>
                  </Button>

                  <Button
                    onClick={() => handleAnswer('No')}
                    disabled={isSubmitted}
                    size="lg"
                    className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 text-white flex flex-col items-center justify-center space-y-2"
                  >
                    <X className="w-8 h-8" />
                    <span className="text-lg font-bold">NO</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default WouldYouDoGame
