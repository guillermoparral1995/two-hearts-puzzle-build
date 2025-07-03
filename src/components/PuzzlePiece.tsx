import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GameType } from '@/types/game'
import { Puzzle, Heart, Star, Lightbulb } from 'lucide-react'

interface PuzzlePieceProps {
  gameType: GameType
  title: string
  isCompleted: boolean
  onClick: () => void
}

const PuzzlePiece = ({
  gameType,
  title,
  isCompleted,
  onClick,
}: PuzzlePieceProps) => {
  const getIcon = () => {
    switch (gameType) {
    case 'top10':
      return <Star className="w-8 h-8 text-white" />
    case 'predict_future':
      return <Lightbulb className="w-8 h-8 text-white" />
    case 'drawful':
      return <Puzzle className="w-8 h-8 text-white" />
    case 'would_you_do':
      return <Heart className="w-8 h-8 text-white" />
    }
  }

  const getImage = () => {
    switch (gameType) {
    case 'top10':
      return '/images/brownie.png'
    case 'predict_future':
      return '/images/olivia.png'
    case 'drawful':
      return '/images/oni.png'
    case 'would_you_do':
      return '/images/delfi.png'
    }
  }

  return (
    <Card
      style={{ backgroundImage: `url(${getImage()})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPositionY: '-30px' }}
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105`}
    >
      <Button
        onClick={onClick}
        className={`w-full h-40 flex flex-col items-center justify-center space-y-3 border-4 border-gray-400 ${
          isCompleted
            ? ''
            : 'bg-puzzle-inactive text-muted-foreground hover:bg-muted'
        }`}
        variant="ghost"
      >
        {getIcon()}
        <span className="text-sm font-medium text-center px-2 text-white">{title}</span>
      </Button>
    </Card>
  )
}

export default PuzzlePiece
