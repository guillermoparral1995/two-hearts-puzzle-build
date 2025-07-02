import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserName } from '@/types/game'

interface UserSelectionProps {
  onUserSelect: (user: UserName) => void
}

const UserSelection = ({ onUserSelect }: UserSelectionProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-accent p-4">
      <Card className="w-full max-w-md p-8 text-center shadow-xl">
        <h1 className="text-4xl font-bold mb-8 text-primary">Who are you?</h1>
        <div className="space-y-4">
          <Button
            onClick={() => onUserSelect('Guille')}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform"
          >
            Guille
          </Button>
          <Button
            onClick={() => onUserSelect('Delfina')}
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform"
          >
            Delfina
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default UserSelection
