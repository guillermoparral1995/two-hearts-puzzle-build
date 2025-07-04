import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { UserName } from '@/types/game'
import { supabase } from '@/integrations/supabase/client'
import { gameQuestions } from '@/lib/gameQuestions'
import RoundResults from './shared/RoundResults'

interface Top10GameProps {
  userSelection: UserName
  sessionId: string
  onGameComplete: () => void
  onBack: () => void
}

const Top10Game = ({
  userSelection,
  sessionId,
  onGameComplete,
  onBack,
}: Top10GameProps) => {
  const [currentRound, setCurrentRound] = useState(1)
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''))
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [waitingForOther, setWaitingForOther] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = gameQuestions.top10[currentRound - 1]

  useEffect(() => {
    // Check if other player has submitted this round
    checkOtherPlayerProgress()
  }, [currentRound, sessionId])

  const checkOtherPlayerProgress = async () => {
    const otherUser = userSelection === 'Guille' ? 'Delfina' : 'Guille'

    const { data } = await supabase
      .from('game_responses')
      .select('*')
      .eq('session_id', sessionId)
      .eq('game_type', 'top10')
      .eq('user_name', otherUser)
      .eq('round_number', currentRound)

    if (data && data.length > 0) {
      // Other player has submitted, we can proceed
      setWaitingForOther(false)
    }
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  useEffect(() => {
    let intervalId
    if (waitingForOther) {
      // Check if both players have submitted
      intervalId = setInterval(async () => {
        const { data } = await supabase
          .from('game_responses')
          .select('user_name')
          .eq('session_id', sessionId)
          .eq('game_type', 'top10')
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

  const handleSubmit = async () => {
    // Save all answers for this round
    const responses = answers.map((answer, index) => ({
      session_id: sessionId,
      game_type: 'top10' as const,
      user_name: userSelection,
      round_number: currentRound,
      question: `${currentQuestion} - Item ${index + 1}`,
      answer: answer,
    }))

    await supabase.from('game_responses').insert(responses)

    setIsSubmitted(true)
    setWaitingForOther(true)
  }

  const handleNextRound = () => {
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1)
      setAnswers(Array(10).fill(''))
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
          <h1 className="text-3xl font-bold text-primary">Top 10</h1>
        </div>

        <Card className="p-8 shadow-xl">
          {showResults ? (
            <RoundResults
              sessionId={sessionId}
              gameType="top10"
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
                <div className="space-y-4">
                  {Array.from({ length: 10 }, (_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <span className="text-lg font-medium w-8">{index + 1}.</span>
                      <Textarea
                        value={answers[index]}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                        disabled={isSubmitted}
                        className="flex-1"
                      />
                    </div>
                  ))}

                  {!isSubmitted && (
                    <Button
                      onClick={handleSubmit}
                      disabled={answers.some((a) => a.trim() === '')}
                      className="w-full mt-6"
                      size="lg"
                    >
                      Enviar ronda {currentRound}
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

export default Top10Game
