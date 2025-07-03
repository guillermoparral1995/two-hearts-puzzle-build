import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

const QRCodeDisplay = () => {
  const spotifyPlaylistUrl =
    'https://open.spotify.com/playlist/3Svi65wPakRbiuqTkoLG4d?si=WUpnZcm3RLCQ9dp2fq2DwA&pi=grvvgT7OTMmk9'

  const handleOpenSpotify = () => {
    window.open(spotifyPlaylistUrl, '_blank')
  }

  return (
    <Card className="max-w-md mx-auto p-8 text-center shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-primary">
        Felicidades! 🎉
      </h2>
      <p className="text-lg text-muted-foreground mb-6">
        Completaste todos los minijuegos, acá está tu recompensa:
      </p>

      {/* QR Code placeholder - in a real app, this would be generated */}
      <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-primary to-accent flex items-center justify-center rounded-lg">
        <img src="../../public/frame.png"/>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Escaneá el código QR o hacé click para recibir tu sorpresa
      </p>

      <Button
        onClick={handleOpenSpotify}
        className="w-full bg-green-500 hover:bg-green-600 text-white"
        size="lg"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Abrir
      </Button>
    </Card>
  )
}

export default QRCodeDisplay
