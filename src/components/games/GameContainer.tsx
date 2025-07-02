import { GameType, UserName } from '@/types/game'
import Top10Game from './Top10Game'
import PredictFutureGame from './PredictFutureGame'
import DrawfulGame from './DrawfulGame'
import WouldYouDoGame from './WouldYouDoGame'

interface GameContainerProps {
  gameType: GameType
  userSelection: UserName
  sessionId: string
  onGameComplete: () => void
  onBack: () => void
}

const GameContainer = ({
  gameType,
  userSelection,
  sessionId,
  onGameComplete,
  onBack,
}: GameContainerProps) => {
  const renderGame = () => {
    switch (gameType) {
    case 'top10':
      return (
        <Top10Game
          userSelection={userSelection}
          sessionId={sessionId}
          onGameComplete={onGameComplete}
          onBack={onBack}
        />
      )
    case 'predict_future':
      return (
        <PredictFutureGame
          userSelection={userSelection}
          sessionId={sessionId}
          onGameComplete={onGameComplete}
          onBack={onBack}
        />
      )
    case 'drawful':
      return (
        <DrawfulGame
          userSelection={userSelection}
          sessionId={sessionId}
          onGameComplete={onGameComplete}
          onBack={onBack}
        />
      )
    case 'would_you_do':
      return (
        <WouldYouDoGame
          userSelection={userSelection}
          sessionId={sessionId}
          onGameComplete={onGameComplete}
          onBack={onBack}
        />
      )
    default:
      return <div>Game not found</div>
    }
  }

  return renderGame()
}

export default GameContainer
