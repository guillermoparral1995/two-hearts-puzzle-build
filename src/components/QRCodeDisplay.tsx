import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

const QRCodeDisplay = () => {
  const spotifyPlaylistUrl =
    'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' // Example playlist

  const handleOpenSpotify = () => {
    window.open(spotifyPlaylistUrl, '_blank')
  }

  return (
    <Card className="max-w-md mx-auto p-8 text-center shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-primary">
        Congratulations! 🎉
      </h2>
      <p className="text-lg text-muted-foreground mb-6">
        You've completed all the mini-games! Here's your special anniversary
        playlist:
      </p>

      {/* QR Code placeholder - in a real app, this would be generated */}
      <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-primary to-accent flex items-center justify-center rounded-lg">
        <div className="w-40 h-40 bg-white rounded grid grid-cols-8 gap-1 p-2">
          {Array.from({ length: 64 }, (_, i) => (
            <div
              key={i}
              className={`w-full h-full ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Scan the QR code or click below to open your playlist
      </p>

      <Button
        onClick={handleOpenSpotify}
        className="w-full bg-green-500 hover:bg-green-600 text-white"
        size="lg"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open Spotify Playlist
      </Button>
    </Card>
  )
}

export default QRCodeDisplay
