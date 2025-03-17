"use client"

import { useState } from "react"
import { TTSPlayer } from "@/components/tts-player"
import { VoiceCustomizer } from "@/components/voice-customizer"
import { EmotionDetector } from "@/components/emotion-detector"
import { GestureController } from "@/components/gesture-controller"
import { NoiseDetector } from "@/components/noise-detector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Mic, Wand2, Gauge, Hand } from "lucide-react"

export default function Home() {
  const [voiceSettings, setVoiceSettings] = useState({
    voice: "en-US-Neural2-F",
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    emotion: "neutral",
    style: "casual",
  })

  const [environmentSettings, setEnvironmentSettings] = useState({
    noiseLevel: "normal",
    adaptToNoise: true,
  })

  const [gestureEnabled, setGestureEnabled] = useState(false)

  const handleVoiceSettingsChange = (newSettings: Partial<typeof voiceSettings>) => {
    setVoiceSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleEnvironmentChange = (newSettings: Partial<typeof environmentSettings>) => {
    setEnvironmentSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleEmotionDetected = (emotion: string) => {
    setVoiceSettings((prev) => ({ ...prev, emotion }))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
            Advanced TTS System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the next generation of text-to-speech with real-time interaction, emotion detection, and
            environmental adaptation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-50 z-0"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>TTS Player</CardTitle>
                  <CardDescription>Play text with advanced interruption support</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <TTSPlayer voiceSettings={voiceSettings} environmentSettings={environmentSettings} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 opacity-50 z-0"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Voice Customization</CardTitle>
                  <CardDescription>Personalize your TTS experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <VoiceCustomizer settings={voiceSettings} onChange={handleVoiceSettingsChange} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 opacity-50 z-0"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <Gauge className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Environmental Adaptation</CardTitle>
                  <CardDescription>Adapt to your surroundings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <NoiseDetector settings={environmentSettings} onChange={handleEnvironmentChange} />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="emotion" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
            <TabsTrigger
              value="emotion"
              className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              Emotion Detection
            </TabsTrigger>
            <TabsTrigger
              value="gesture"
              className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              Gesture Control
            </TabsTrigger>
          </TabsList>
          <TabsContent value="emotion">
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mt-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 opacity-50 z-0"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-600 dark:text-amber-400"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                  </div>
                  <div>
                    <CardTitle>Emotion Detection</CardTitle>
                    <CardDescription>Adapt voice based on detected emotions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <EmotionDetector onEmotionDetected={handleEmotionDetected} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gesture">
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mt-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 opacity-50 z-0"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-full">
                    <Hand className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle>Gesture Control</CardTitle>
                    <CardDescription>Control TTS with hand gestures</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <GestureController
                  enabled={gestureEnabled}
                  onToggle={() => setGestureEnabled((prev) => !prev)}
                  onGestureDetected={(gesture) => {
                    // Handle different gestures
                    if (gesture === "volume-up") {
                      setVoiceSettings((prev) => ({ ...prev, volume: Math.min(2.0, prev.volume + 0.1) }))
                    } else if (gesture === "volume-down") {
                      setVoiceSettings((prev) => ({ ...prev, volume: Math.max(0.1, prev.volume - 0.1) }))
                    } else if (gesture === "speed-up") {
                      setVoiceSettings((prev) => ({ ...prev, rate: Math.min(2.0, prev.rate + 0.1) }))
                    } else if (gesture === "speed-down") {
                      setVoiceSettings((prev) => ({ ...prev, rate: Math.max(0.5, prev.rate - 0.1) }))
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Advanced TTS System — Next Generation Voice Technology</p>
          <div className="flex justify-center gap-4 mt-2">
            <a
              href="#"
              className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Terms
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
