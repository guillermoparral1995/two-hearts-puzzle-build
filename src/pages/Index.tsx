import { useState } from 'react';
import { UserName, GameType } from '@/types/game';
import { useGameSession } from '@/hooks/useGameSession';
import UserSelection from './UserSelection';
import WaitingRoom from './WaitingRoom';
import MainGame from './MainGame';

const Index = () => {
  const [userSelection, setUserSelection] = useState<UserName | null>(null);
  const { 
    session, 
    gameProgress, 
    isConnected, 
    bothConnected, 
    loading, 
    createOrJoinSession, 
    markGameCompleted 
  } = useGameSession(userSelection);

  const handleUserSelect = (user: UserName) => {
    setUserSelection(user);
    createOrJoinSession();
  };

  const handleGameComplete = (gameType: GameType) => {
    markGameCompleted(gameType);
  };

  if (!userSelection || loading) {
    return <UserSelection onUserSelect={handleUserSelect} />;
  }

  if (isConnected && !bothConnected) {
    return <WaitingRoom userSelection={userSelection} />;
  }

  if (bothConnected && session) {
    return (
      <MainGame
        userSelection={userSelection}
        sessionId={session.id}
        gameProgress={gameProgress}
        onGameComplete={handleGameComplete}
      />
    );
  }

  return <UserSelection onUserSelect={handleUserSelect} />;
};

export default Index;
