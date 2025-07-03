import { Card } from '@/components/ui/card'
import { UserName } from '@/types/game'

interface WaitingRoomProps {
  userSelection: UserName
}

const WaitingRoom = ({ userSelection }: WaitingRoomProps) => {
  const otherUser = userSelection === 'Guille' ? 'Delfina' : 'Guille'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-accent p-4">
      <Card className="w-full max-w-md p-8 text-center shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-primary">
          Hola {userSelection}! 😁
        </h1>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 opacity-60"></div>
          </div>
          <p className="text-lg text-muted-foreground">
            Esperando a que {otherUser} se conecte...
          </p>
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default WaitingRoom
