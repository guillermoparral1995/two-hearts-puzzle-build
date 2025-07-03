import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Palette, Eraser } from 'lucide-react'
import { UserName } from '@/types/game'
import { supabase } from '@/integrations/supabase/client'
import { gameQuestions } from '@/lib/gameQuestions'

interface DrawfulGameProps {
  userSelection: UserName
  sessionId: string
  onGameComplete: () => void
  onBack: () => void
}

const DrawfulGame = ({
  userSelection,
  sessionId,
  onGameComplete,
  onBack,
}: DrawfulGameProps) => {
  const [currentRound, setCurrentRound] = useState(1)
  const [isDrawing, setIsDrawing] = useState(true)
  const [guess, setGuess] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [drawingData, setDrawingData] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [waitingForOther, setWaitingForOther] = useState(false)
  const [showingPrompt, setShowingPrompt] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const channelRef = useRef(supabase.channel(`drawful-${sessionId}`))

  useEffect(() => {
    determineRoundType()
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted) {
      handleTimerEnd()
    }
  }, [currentRound, timeLeft, isSubmitted])

  useEffect(() => {
    const drawfulChannel = supabase.channel(`drawful-${sessionId}`)

    drawfulChannel
      .on('broadcast', { event: 'start-draw' }, ({ payload: { x, y } }) => {
        if (isDrawing) return // Don't apply remote drawing if we're the one drawing
        
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.beginPath()
        ctx.moveTo(x, y)
      })
      .on('broadcast', { event: 'draw' }, ({ payload: { x, y } }) => {
        if (isDrawing) return // Don't apply remote drawing if we're the one drawing
        
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.lineTo(x, y)
        ctx.stroke()
      })
      .on('broadcast', { event: 'stop-draw' }, () => {
        if (isDrawing) return // Don't apply remote drawing if we're the one drawing
        
        const canvas = canvasRef.current
        if (!canvas) return
        
        setDrawingData(canvas.toDataURL())
      })
      .on('broadcast', { event: 'clear' }, () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setDrawingData('')
      })
      .subscribe()

    return () => {
      supabase.removeChannel(drawfulChannel)
    }
  }, [sessionId, isDrawing])

  const determineRoundType = () => {
    // Guille draws on rounds 1,2,3 and guesses on 4,5,6
    // Delfina guesses on rounds 1,2,3 and draws on 4,5,6
    const guilleDraw = currentRound <= 3
    const shouldDraw = userSelection === 'Guille' ? guilleDraw : !guilleDraw
    setIsDrawing(shouldDraw)

    // Set prompt for both players so it can be shown during reveal
    const promptIndex = Math.floor((currentRound - 1) % 3)
    setCurrentPrompt(gameQuestions.drawful[promptIndex])

    setTimeLeft(120)
    setIsSubmitted(false)
    setWaitingForOther(false)
    setShowingPrompt(false)
    setIsLocked(false)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    channelRef.current.send({
      type: 'broadcast',
      event: 'start-draw',
      payload: { x, y },
    })
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
    channelRef.current.send({
      type: 'broadcast',
      event: 'draw',
      payload: { x, y },
    })
  }

  const stopDrawing = () => {
    isDrawingRef.current = false
    const canvas = canvasRef.current
    if (!canvas) return

    setDrawingData(canvas.toDataURL())
    channelRef.current.send({
      type: 'broadcast',
      event: 'stop-draw',
    })
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setDrawingData('')
    channelRef.current.send({
      type: 'broadcast',
      event: 'clear',
    })
  }

  const handleSubmit = async () => {
    // Only guessing player can submit
    if (isDrawing) return
    
    setIsSubmitted(true)
    setIsLocked(true)
    setShowingPrompt(true)

    // Save guess
    await supabase.from('game_responses').insert({
      session_id: sessionId,
      game_type: 'drawful',
      user_name: userSelection,
      round_number: currentRound,
      answer: guess,
    })

    // Show prompt for 3 seconds, then proceed to next round
    setTimeout(() => {
      proceedToNextRound()
    }, 3000)
  }

  const handleTimerEnd = () => {
    if (isSubmitted) return
    
    setIsSubmitted(true)
    setIsLocked(true)
    setShowingPrompt(true)

    // Show prompt for 3 seconds, then proceed to next round
    setTimeout(() => {
      proceedToNextRound()
    }, 3000)
  }

  const proceedToNextRound = () => {
    if (currentRound < 6) {
      setCurrentRound(currentRound + 1)
      setGuess('')
      clearCanvas()
    } else {
      onGameComplete()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
            <h2 className="text-2xl font-bold mb-2">
                            Round {currentRound} of 6
            </h2>
            <p className="text-lg font-semibold text-primary">
              {formatTime(timeLeft)}
            </p>
          </div>

          {showingPrompt ? (
            <div className="text-center">
              <div className="mb-6">
                <p className="text-2xl font-bold text-primary mb-4">The drawing was:</p>
                <p className="text-3xl font-bold">{currentPrompt}</p>
              </div>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className="border-2 border-border rounded-lg bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {isDrawing && (
                <div className="text-center">
                  <p className="text-lg mb-4">
                    Draw: <strong>{currentPrompt}</strong>
                  </p>
                </div>
              )}

              {!isDrawing && (
                <div className="text-center">
                  <p className="text-lg mb-4">
                    Watch the other player draw and guess what it is!
                  </p>
                </div>
              )}

              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className={`border-2 border-border rounded-lg bg-white ${
                    isDrawing && !isLocked ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onMouseDown={isDrawing && !isLocked ? startDrawing : undefined}
                  onMouseMove={isDrawing && !isLocked ? draw : undefined}
                  onMouseUp={isDrawing && !isLocked ? stopDrawing : undefined}
                  onMouseLeave={isDrawing && !isLocked ? stopDrawing : undefined}
                />
              </div>

              {isDrawing && !isLocked && (
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={clearCanvas}>
                    <Eraser className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              )}

              {!isDrawing && (
                <div className="space-y-4">
                  <Input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Enter your guess..."
                    disabled={isLocked}
                    className="text-center text-lg"
                  />

                  {!isLocked && (
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
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default DrawfulGame
