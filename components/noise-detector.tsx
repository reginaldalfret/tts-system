"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Mic, Volume, Volume1, Volume2 } from "lucide-react"

interface NoiseDetectorProps {
  settings: {
    noiseLevel: string
    adaptToNoise: boolean
  }
  onChange: (settings: Partial<NoiseDetectorProps["settings"]>) => void
}

export function NoiseDetector({ settings, onChange }: NoiseDetectorProps) {
  const [isListening, setIsListening] = useState(false)
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "pending">("pending")
  const [noiseValue, setNoiseValue] = useState(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      // Create analyser
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      setMicPermission("granted")
      setIsListening(true)

      // Start analyzing
      analyzeAudio()
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setMicPermission("denied")
    }
  }

  const stopListening = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop())
      micStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setIsListening(false)
  }

  const analyzeAudio = () => {
    if (!analyserRef.current) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const updateAnalysis = () => {
      if (!analyserRef.current) return

      analyser.getByteFrequencyData(dataArray)

      // Calculate average volume
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength

      // Normalize to 0-100
      const normalizedValue = Math.min(100, Math.max(0, average * 1.5))
      setNoiseValue(normalizedValue)

      // Determine noise level
      let noiseLevel = "normal"
      if (normalizedValue < 20) {
        noiseLevel = "low"
      } else if (normalizedValue > 60) {
        noiseLevel = "high"
      }

      // Update settings if changed
      if (noiseLevel !== settings.noiseLevel) {
        onChange({ noiseLevel })
      }

      animationFrameRef.current = requestAnimationFrame(updateAnalysis)
    }

    updateAnalysis()
  }

  // Toggle adaptation
  const toggleAdaptation = () => {
    onChange({ adaptToNoise: !settings.adaptToNoise })
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="adapt-to-noise" checked={settings.adaptToNoise} onCheckedChange={toggleAdaptation} />
          <Label htmlFor="adapt-to-noise">Adapt to noise level</Label>
        </div>

        <Button
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? "default" : "outline"}
          size="sm"
          className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
        >
          <Mic className="mr-2 h-4 w-4" />
          {isListening ? "Stop" : "Start"} listening
        </Button>
      </div>

      {micPermission === "denied" && (
        <div className="text-sm text-red-500">
          Microphone access denied. Please allow microphone access to use this feature.
        </div>
      )}

      {isListening && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {noiseValue < 20 ? (
                <Volume className="h-4 w-4 text-muted-foreground" />
              ) : noiseValue < 60 ? (
                <Volume1 className="h-4 w-4 text-primary" />
              ) : (
                <Volume2 className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                {noiseValue < 20 ? "Low" : noiseValue < 60 ? "Normal" : "High"} noise level
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{Math.round(noiseValue)}%</span>
          </div>

          <Progress
            value={noiseValue}
            className="h-2"
            style={{
              background: "linear-gradient(to right, #10b981, #f59e0b, #ef4444)",
            }}
          />

          <div className="text-xs text-muted-foreground">
            {settings.adaptToNoise ? (
              <p>
                TTS will automatically{" "}
                {noiseValue > 60 ? "increase volume" : noiseValue < 20 ? "decrease volume" : "use normal volume"} based
                on current noise level.
              </p>
            ) : (
              <p>Enable adaptation to automatically adjust TTS volume based on noise level.</p>
            )}
          </div>
        </div>
      )}

      {!isListening && (
        <div className="bg-muted p-4 rounded-lg text-center text-sm text-muted-foreground">
          Start listening to detect ambient noise levels
        </div>
      )}
    </div>
  )
}
