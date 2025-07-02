import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { GameSession, UserName, GameProgress, GameType } from '@/types/game'

export const useGameSession = (userSelection: UserName | null) => {
  const [session, setSession] = useState<GameSession | null>(null)
  const [gameProgress, setGameProgress] = useState<GameProgress[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [bothConnected, setBothConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  const createOrJoinSession = async () => {
    if (!userSelection) return

    setLoading(true)
    try {
      // First, try to find an existing session
      const { data: existingSessions } = await supabase
        .from('game_sessions')
        .select('*')
        .or('guille_connected.eq.false,delfina_connected.eq.false')
        .limit(1)

      let currentSession: GameSession

      if (existingSessions && existingSessions.length > 0) {
        // Join existing session
        const sessionToJoin = existingSessions[0]
        const updateField =
          userSelection === 'Guille' ? 'guille_connected' : 'delfina_connected'

        const { data: updatedSession } = await supabase
          .from('game_sessions')
          .update({ [updateField]: true })
          .eq('id', sessionToJoin.id)
          .select()
          .single()

        currentSession = updatedSession
      } else {
        // Create new session
        const initialData = {
          guille_connected: userSelection === 'Guille',
          delfina_connected: userSelection === 'Delfina',
        }

        const { data: newSession } = await supabase
          .from('game_sessions')
          .insert(initialData)
          .select()
          .single()

        currentSession = newSession

        // Initialize game progress for all games
        const gameTypes: GameType[] = [
          'top10',
          'predict_future',
          'drawful',
          'would_you_do',
        ]
        await supabase.from('game_progress').insert(
          gameTypes.map((gameType) => ({
            session_id: currentSession.id,
            game_type: gameType,
            completed: false,
          }))
        )
      }

      setSession(currentSession)
      setIsConnected(true)
      setBothConnected(
        currentSession.guille_connected && currentSession.delfina_connected
      )
    } catch (error) {
      console.error('Error creating/joining session:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session) return

    // Subscribe to session updates
    const sessionChannel = supabase
      .channel('session-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          const updatedSession = payload.new as GameSession
          setSession(updatedSession)
          setBothConnected(
            updatedSession.guille_connected && updatedSession.delfina_connected
          )
        }
      )
      .subscribe()

    // Subscribe to game progress updates
    const progressChannel = supabase
      .channel('progress-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_progress',
          filter: `session_id=eq.${session.id}`,
        },
        () => {
          // Refetch game progress
          fetchGameProgress()
        }
      )
      .subscribe()

    // Initial fetch of game progress
    fetchGameProgress()

    return () => {
      supabase.removeChannel(sessionChannel)
      supabase.removeChannel(progressChannel)
    }
  }, [session])

  const fetchGameProgress = async () => {
    if (!session) return

    const { data } = await supabase
      .from('game_progress')
      .select('*')
      .eq('session_id', session.id)

    if (data) {
      setGameProgress(data)
    }
  }

  const markGameCompleted = async (gameType: GameType) => {
    if (!session) return

    await supabase
      .from('game_progress')
      .update({ completed: true })
      .eq('session_id', session.id)
      .eq('game_type', gameType)
  }

  return {
    session,
    gameProgress,
    isConnected,
    bothConnected,
    loading,
    createOrJoinSession,
    markGameCompleted,
  }
}
