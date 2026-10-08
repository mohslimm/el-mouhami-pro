import { memo, useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AudioPlayerProps {
  src: string
  className?: string
  title?: string
}

export const AudioPlayer = memo(({ src, className, title }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration || 0)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const seek = (seconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-[var(--border-gold)] bg-[var(--bg-elevated)] p-3.5 shadow-md',
        className
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && <span className="text-xs font-semibold text-[var(--gold-400)]">{title}</span>}

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-gold)] bg-[var(--gold-glow)] text-[var(--gold-400)] transition-transform hover:scale-105"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        {/* Seek Backward 10s */}
        <button
          type="button"
          onClick={() => seek(-10)}
          className="text-white/60 hover:text-[var(--gold-400)] transition-colors"
          title="-10s"
        >
          <RotateCcw size={14} />
        </button>

        {/* Seek Forward 10s */}
        <button
          type="button"
          onClick={() => seek(10)}
          className="text-white/60 hover:text-[var(--gold-400)] transition-colors"
          title="+10s"
        >
          <RotateCw size={14} />
        </button>

        {/* Current Time / Duration */}
        <span className="font-mono text-xs text-[var(--text-muted)]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Progress Bar Track */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleProgressChange}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--gold-400)]"
        />

        {/* Mute Button */}
        <button
          type="button"
          onClick={toggleMute}
          className="text-white/60 hover:text-[var(--gold-400)] transition-colors"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  )
})

AudioPlayer.displayName = 'AudioPlayer'
