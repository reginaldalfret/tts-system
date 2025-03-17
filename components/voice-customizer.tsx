"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useEffect } from "react"

interface VoiceCustomizerProps {
  settings: {
    voice: string
    rate: number
    pitch: number
    volume: number
    emotion: string
    style: string
  }
  onChange: (settings: Partial<VoiceCustomizerProps["settings"]>) => void
}

export function VoiceCustomizer({ settings, onChange }: VoiceCustomizerProps) {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  // Load available voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          setAvailableVoices(voices)
        }
      }

      // Load voices immediately
      loadVoices()

      // Some browsers need this event
      window.speechSynthesis.onvoiceschanged = loadVoices

      return () => {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="voice-select">Voice</Label>
        <Select value={settings.voice} onValueChange={(value) => onChange({ voice: value })}>
          <SelectTrigger id="voice-select">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {availableVoices.length > 0 ? (
              availableVoices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="default">Default Voice</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="rate-slider">Rate</Label>
            <span className="text-sm text-muted-foreground">{settings.rate.toFixed(1)}x</span>
          </div>
          <Slider
            id="rate-slider"
            min={0.5}
            max={2}
            step={0.1}
            value={[settings.rate]}
            onValueChange={([value]) => onChange({ rate: value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="pitch-slider">Pitch</Label>
            <span className="text-sm text-muted-foreground">{settings.pitch.toFixed(1)}</span>
          </div>
          <Slider
            id="pitch-slider"
            min={0.5}
            max={2}
            step={0.1}
            value={[settings.pitch]}
            onValueChange={([value]) => onChange({ pitch: value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="volume-slider">Volume</Label>
            <span className="text-sm text-muted-foreground">{settings.volume.toFixed(1)}</span>
          </div>
          <Slider
            id="volume-slider"
            min={0.1}
            max={1}
            step={0.1}
            value={[settings.volume]}
            onValueChange={([value]) => onChange({ volume: value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Emotion</Label>
        <RadioGroup
          value={settings.emotion}
          onValueChange={(value) => onChange({ emotion: value })}
          className="flex flex-wrap gap-2"
        >
          {["neutral", "happy", "sad", "angry", "excited"].map((emotion) => (
            <div key={emotion} className="flex items-center space-x-2">
              <RadioGroupItem value={emotion} id={`emotion-${emotion}`} />
              <Label htmlFor={`emotion-${emotion}`} className="capitalize">
                {emotion}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Speaking Style</Label>
        <RadioGroup
          value={settings.style}
          onValueChange={(value) => onChange({ style: value })}
          className="flex flex-wrap gap-2"
        >
          {["casual", "formal", "professional", "cheerful", "empathetic"].map((style) => (
            <div key={style} className="flex items-center space-x-2">
              <RadioGroupItem value={style} id={`style-${style}`} />
              <Label htmlFor={`style-${style}`} className="capitalize">
                {style}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
