import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GameType } from '@/types/game'
import { Puzzle, Heart, Star, Lightbulb } from 'lucide-react'

interface PuzzlePieceProps {
  gameType: GameType
  title: string
  isCompleted: boolean
  pieceNumber: number
  onClick: () => void
}

const PuzzlePiece = ({
  gameType,
  title,
  isCompleted,
  pieceNumber,
  onClick,
}: PuzzlePieceProps) => {
  const getIcon = () => {
    switch (gameType) {
    case 'top10':
      return <Star className="w-8 h-8" />
    case 'predict_future':
      return <Lightbulb className="w-8 h-8" />
    case 'drawful':
      return <Puzzle className="w-8 h-8" />
    case 'would_you_do':
      return <Heart className="w-8 h-8" />
    }
  }

  const getPuzzleShape = () => {
    // Different puzzle piece shapes based on position
    const shapes = [
      'clip-path-puzzle-1', // top-left
      'clip-path-puzzle-2', // top-right
      'clip-path-puzzle-3', // bottom-left
      'clip-path-puzzle-4', // bottom-right
    ]
    return shapes[pieceNumber - 1]
  }

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105`}
    >
      <Button
        onClick={onClick}
        className={`w-full h-40 flex flex-col items-center justify-center space-y-3 ${
          isCompleted
            ? 'bg-gradient-to-br from-puzzle-active to-accent text-white'
            : 'bg-puzzle-inactive text-muted-foreground hover:bg-muted'
        }`}
        variant="ghost"
      >
        {getIcon()}
        <span className="text-sm font-medium text-center px-2">{title}</span>
      </Button>
    </Card>
  )
}

export default PuzzlePiece
