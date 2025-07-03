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

type TouchEvent = React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>

const isMouseEvent = (e: TouchEvent): e is React.MouseEvent<HTMLCanvasElement> => {
  return 'clientX' in e
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
  const [showingPrompt, setShowingPrompt] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const channelRef = useRef(supabase.channel(`drawful-${sessionId}`))

  useEffect(() => {
    determineRoundType()
  }, [currentRound])

  useEffect(() => {
    const drawfulChannel = supabase.channel(`drawful-${sessionId}`)
    channelRef.current = drawfulChannel

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
        
      })
      .on('broadcast', { event: 'clear' }, () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
      })
      .on('broadcast', { event: 'submit' }, ({ payload: { round } }) => {
        // Only process if this is for the current round and we're the drawing player
        if (round === currentRound && isDrawing) {
          setIsLocked(true)
          setShowingPrompt(true)
          setTimeout(() => {
            proceedToNextRound()
          }, 3000)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(drawfulChannel)
    }
  }, [sessionId, isDrawing, currentRound])

  const determineRoundType = () => {
    const shouldGuilleDrawThisRound = currentRound % 2 === 0
    const shouldDraw = userSelection === 'Guille' ? shouldGuilleDrawThisRound : !shouldGuilleDrawThisRound
    setIsDrawing(shouldDraw)

    // Set prompt for the current round
    const promptIndex = currentRound - 1
    setCurrentPrompt(gameQuestions.drawful[promptIndex])
    setShowingPrompt(false)
    setIsLocked(false)
  }

  const startDrawing = (e: TouchEvent) => {
    isDrawingRef.current = true
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clientX = isMouseEvent(e) ? e.clientX : e.targetTouches.item(0).clientX
    const clientY = isMouseEvent(e) ? e.clientY : e.targetTouches.item(0).clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

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

  const draw = (e: TouchEvent) => {
    if (!isDrawingRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clientX = isMouseEvent(e) ? e.clientX : e.targetTouches.item(0).clientX
    const clientY = isMouseEvent(e) ? e.clientY : e.targetTouches.item(0).clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

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
    channelRef.current.send({
      type: 'broadcast',
      event: 'clear',
    })
  }

  const handleSubmit = async () => {
    // Only guessing player can submit
    if (isDrawing) return
    
    setIsLocked(true)
    setShowingPrompt(true)

    // Save guess
    try {
      await supabase.from('game_responses').insert({
        session_id: sessionId,
        game_type: 'drawful',
        user_name: userSelection,
        round_number: currentRound,
        answer: guess,
      })
      
      // Send broadcast with current round info
      channelRef.current.send({
        type: 'broadcast',
        event: 'submit',
        payload: { round: currentRound }
      })
    } catch (error) {
      console.error('Error saving guess:', error)
    }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-accent p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-primary">Pictionary</h1>
        </div>

        <Card className="p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
                            Ronda {currentRound} de 6
            </h2>
          </div>

          {showingPrompt ? (
            <div className="text-center">
              <div className="mb-6">
                <p className="text-2xl font-bold text-primary mb-4">El dibujo era:</p>
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
                    Dibujá: <strong>{currentPrompt}</strong>
                  </p>
                </div>
              )}

              {!isDrawing && (
                <div className="text-center">
                  <p className="text-lg mb-4">
                    Tratá de adivinar!
                  </p>
                </div>
              )}

              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className={`border-2 border-border rounded-lg bg-white touch-none ${
                    isDrawing && !isLocked ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onTouchStart={isDrawing && !isLocked ? startDrawing : undefined}
                  onMouseDown={isDrawing && !isLocked ? startDrawing : undefined}
                  onTouchMove={isDrawing && !isLocked ? draw : undefined}
                  onMouseMove={isDrawing && !isLocked ? draw : undefined}
                  onTouchEnd={isDrawing && !isLocked ? stopDrawing : undefined}
                  onMouseUp={isDrawing && !isLocked ? stopDrawing : undefined}
                  onMouseLeave={isDrawing && !isLocked ? stopDrawing : undefined}
                />
              </div>

              {isDrawing && !isLocked && (
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={clearCanvas}>
                    <Eraser className="w-4 h-4 mr-2" />
                    Borrar
                  </Button>
                </div>
              )}

              {!isDrawing && (
                <div className="space-y-4">
                  <Input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Tu respuesta"
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
                      Enviar
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
