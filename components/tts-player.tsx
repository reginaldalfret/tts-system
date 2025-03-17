"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Play, Pause, Square, Volume2, VolumeX, Mic, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface TTSPlayerProps {
  voiceSettings: {
    voice: string
    rate: number
    pitch: number
    volume: number
    emotion: string
    style: string
  }
  environmentSettings: {
    noiseLevel: string
    adaptToNoise: boolean
  }
}

export function TTSPlayer({ voiceSettings, environmentSettings }: TTSPlayerProps) {
  const [text, setText] = useState(
    "Hello! This is an advanced TTS system with real-time interaction capabilities. Try interrupting me by clicking the microphone button while I'm speaking.",
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interruptionDetected, setInterruptionDetected] = useState(false)

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate speech synthesis with our advanced features
  const speak = () => {
    if (!window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text)

    // Apply voice settings
    utterance.rate = voiceSettings.rate
    utterance.pitch = voiceSettings.pitch
    utterance.volume = isMuted ? 0 : voiceSettings.volume

    // Find the selected voice
    const voices = window.speechSynthesis.getVoices()
    const selectedVoice = voices.find((v) => v.name === voiceSettings.voice) || voices[0]
    if (selectedVoice) utterance.voice = selectedVoice

    // Apply environmental adaptations
    if (environmentSettings.adaptToNoise && environmentSettings.noiseLevel === "high") {
      utterance.volume = Math.min(1, utterance.volume * 1.5) // Increase volume in noisy environments
    }

    // Apply emotion and style (simulated)
    // In a real implementation, this would use SSML or a more advanced API
    console.log(`Speaking with emotion: ${voiceSettings.emotion}, style: ${voiceSettings.style}`)

    // Set up event handlers
    utterance.onstart = () => {
      setIsPlaying(true)
      setProgress(0)

      // Start progress tracking
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      const duration = (text.length / utterance.rate) * 50 // Rough estimate
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 100 / duration
          return newProgress > 100 ? 100 : newProgress
        })
      }, 50)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setProgress(100)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }

    // Store reference for interruption
    speechSynthRef.current = utterance

    // Start speaking
    window.speechSynthesis.speak(utterance)
  }

  const pause = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }

  const resume = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume()
      setIsPlaying(true)

      // Resume progress tracking
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      const remainingProgress = 100 - progress
      const roughDuration = (remainingProgress / 100) * ((text.length / voiceSettings.rate) * 50)

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 100 / roughDuration
          return newProgress > 100 ? 100 : newProgress
        })
      }, 50)
    }
  }

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setProgress(0)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (window.speechSynthesis && speechSynthRef.current) {
      speechSynthRef.current.volume = !isMuted ? 0 : voiceSettings.volume
    }
  }

  // Simulate interruption detection
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    setIsListening(true)

    // Simulate detecting an interruption after 2 seconds if speech is playing
    if (isPlaying) {
      setTimeout(() => {
        if (isPlaying) {
          // Pause the current speech
          pause()
          setInterruptionDetected(true)

          // Simulate processing the interruption
          setTimeout(() => {
            setInterruptionDetected(false)
            setIsListening(false)

            // In a real implementation, we would process the user's interruption
            // and potentially change our response
            setText((prev) => prev + " I noticed you wanted to interrupt. How can I help?")
          }, 1500)
        }
        setIsListening(false)
      }, 2000)
    }
  }

  // Load voices when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Force voice loading in some browsers
      window.speechSynthesis.getVoices()
    }

    return () => {
      // Clean up
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (window.speechSynthesis) window.speechSynthesis.cancel()
    }
  }, [])

  // Update volume when mute state or volume changes
  useEffect(() => {
    if (speechSynthRef.current) {
      speechSynthRef.current.volume = isMuted ? 0 : voiceSettings.volume
    }
  }, [isMuted, voiceSettings.volume])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to speak..."
          className="min-h-[120px] border-2 border-blue-100 dark:border-blue-900/50 focus:border-blue-300 dark:focus:border-blue-700 rounded-xl shadow-sm"
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
          >
            {voiceSettings.emotion} • {voiceSettings.style}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isPlaying ? (
          <Button
            onClick={speak}
            disabled={!text.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-4"
          >
            <Play className="mr-2 h-4 w-4" />
            Speak
          </Button>
        ) : (
          <Button
            onClick={pause}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full px-4"
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
        )}

        {!isPlaying && progress > 0 && progress < 100 && (
          <Button
            onClick={resume}
            variant="outline"
            className="rounded-full border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
          >
            Resume
          </Button>
        )}

        <Button
          onClick={stop}
          variant="outline"
          disabled={!isPlaying && progress === 0}
          className="rounded-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
        >
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>

        <Button onClick={toggleMute} variant="ghost" size="icon" className="rounded-full h-9 w-9">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <Button
          onClick={toggleListening}
          variant={isListening ? "default" : "outline"}
          size="icon"
          className={`rounded-full h-9 w-9 ${isListening ? "bg-red-500 hover:bg-red-600" : "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"}`}
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>

      {interruptionDetected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800/30 p-3 flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-amber-800 dark:text-amber-300 font-medium">Interruption detected! Processing...</span>
        </motion.div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
          {isPlaying && (
            <div className="absolute top-0 left-0 h-full w-full">
              <div className="h-full w-3 bg-white/30 animate-[progress-pulse_2s_ease-in-out_infinite] rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
        <p>
          Current settings: {voiceSettings.voice}, Rate: {voiceSettings.rate.toFixed(1)}, Emotion:{" "}
          {voiceSettings.emotion}, Style: {voiceSettings.style}
        </p>
        <p>
          Environment: {environmentSettings.noiseLevel} noise level, adaptation{" "}
          {environmentSettings.adaptToNoise ? "enabled" : "disabled"}
        </p>
      </div>
    </div>
  )
}
