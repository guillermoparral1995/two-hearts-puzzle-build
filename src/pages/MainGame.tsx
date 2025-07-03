import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { GameProgress, GameType, UserName } from '@/types/game'
import PuzzlePiece from '@/components/PuzzlePiece'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import GameContainer from '@/components/games/GameContainer'

interface MainGameProps {
  userSelection: UserName
  sessionId: string
  gameProgress: GameProgress[]
  onGameComplete: (gameType: GameType) => void
}

const MainGame = ({
  userSelection,
  sessionId,
  gameProgress,
  onGameComplete,
}: MainGameProps) => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null)

  const gameTypes: GameType[] = [
    'top10',
    'predict_future',
    'drawful',
    'would_you_do',
  ]
  const allCompleted =
    gameProgress.length === 4 && gameProgress.every((g) => g.completed)

  const getGameTitle = (gameType: GameType) => {
    switch (gameType) {
    case 'top10':
      return 'Top 10'
    case 'predict_future':
      return 'Predecí el futuro'
    case 'drawful':
      return 'Pictionary'
    case 'would_you_do':
      return 'Favores'
    }
  }

  const isGameCompleted = (gameType: GameType) => {
    return (
      gameProgress.find((g) => g.game_type === gameType)?.completed || false
    )
  }

  if (selectedGame) {
    return (
      <GameContainer
        gameType={selectedGame}
        userSelection={userSelection}
        sessionId={sessionId}
        onGameComplete={() => {
          onGameComplete(selectedGame)
          setSelectedGame(null)
        }}
        onBack={() => setSelectedGame(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-accent p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 mb-8 text-center shadow-xl">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            Miau miau te amo hermoso bebito 😸❤️
          </h1>
          <p className="text-lg text-muted-foreground">
            Completá los minijuegos para una sorpresa!
          </p>
        </Card>

        {allCompleted ? (
          <QRCodeDisplay />
        ) : (
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {gameTypes.map((gameType, index) => (
              <PuzzlePiece
                key={gameType}
                gameType={gameType}
                title={getGameTitle(gameType)}
                isCompleted={isGameCompleted(gameType)}
                pieceNumber={index + 1}
                onClick={() => setSelectedGame(gameType)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MainGame
