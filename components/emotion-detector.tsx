"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Camera, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface EmotionDetectorProps {
  onEmotionDetected: (emotion: string) => void
}

export function EmotionDetector({ onEmotionDetected }: EmotionDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState("neutral")
  const [emotionConfidence, setEmotionConfidence] = useState(0)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "pending">("pending")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Simulated emotions with probabilities
  const emotions = {
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    neutral: 0,
  }

  // Emotion colors for visual feedback
  const emotionColors = {
    happy: "bg-yellow-500",
    sad: "bg-blue-500",
    angry: "bg-red-500",
    surprised: "bg-purple-500",
    neutral: "bg-gray-500",
  }

  const startDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraPermission("granted")
        setIsDetecting(true)

        // Start the emotion detection simulation
        detectEmotions()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraPermission("denied")
    }
  }

  const stopDetection = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsDetecting(false)
  }

  // Simulate emotion detection
  const detectEmotions = () => {
    if (!isDetecting) return

    // Capture video frame to canvas for "analysis"
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0)

        // Simulate emotion detection
        // In a real implementation, this would use a face detection and emotion recognition model
        simulateEmotionDetection()
      }
    }

    // Continue detection loop
    requestAnimationFrame(detectEmotions)
  }

  const simulateEmotionDetection = () => {
    // Reset emotions
    Object.keys(emotions).forEach((key) => {
      emotions[key as keyof typeof emotions] = 0
    })

    // Simulate random emotion detection
    // In a real implementation, this would be the output of an ML model
    const dominantEmotion = Object.keys(emotions)[
      Math.floor(Math.random() * Object.keys(emotions).length)
    ] as keyof typeof emotions
    const confidence = Math.random() * 0.5 + 0.5 // Random confidence between 50-100%

    emotions[dominantEmotion] = confidence

    // Add some random values to other emotions
    Object.keys(emotions).forEach((key) => {
      if (key !== dominantEmotion) {
        emotions[key as keyof typeof emotions] = Math.random() * (1 - confidence)
      }
    })

    // Update state with detected emotion
    setCurrentEmotion(dominantEmotion)
    setEmotionConfidence(Math.round(confidence * 100))

    // Notify parent component
    onEmotionDetected(dominantEmotion)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-1">
        <div className="aspect-video rounded-lg overflow-hidden relative">
          {cameraPermission === "granted" ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />

              {isDetecting && (
                <>
                  {/* Animated face tracking overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <motion.rect
                        x="30"
                        y="20"
                        width="40"
                        height="50"
                        rx="5"
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="0.5"
                        strokeDasharray="5,5"
                        initial={{ scale: 0.9 }}
                        animate={{
                          scale: [0.9, 1.1, 0.9],
                          x: [30, 28, 32, 30],
                          y: [20, 22, 19, 20],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        }}
                      />
                    </svg>
                  </div>

                  {/* Emotion indicator */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${emotionColors[currentEmotion as keyof typeof emotionColors]} animate-pulse`}
                        ></div>
                        <span className="font-medium capitalize">{currentEmotion}</span>
                      </div>
                      <Badge variant="outline" className="bg-white/10 backdrop-blur-sm">
                        {emotionConfidence}% confidence
                      </Badge>
                    </div>
                    <Progress
                      value={emotionConfidence}
                      className="h-1 mt-2"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                      }}
                    />
                  </div>

                  {/* Processing indicator */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Analyzing emotions
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              <div className="text-center p-6 max-w-md">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Camera Access Required</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Enable your camera to detect emotions and enhance your TTS experience.
                </p>
                <Button
                  onClick={startDetection}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Enable Camera
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isDetecting && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Detected Emotion</h3>
              <p className="text-3xl font-bold capitalize bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                {currentEmotion}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={stopDetection} className="rounded-full h-10 w-10">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confidence</span>
              <span>{emotionConfidence}%</span>
            </div>
            <Progress value={emotionConfidence} className="h-2 bg-gray-100 dark:bg-gray-700" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(emotions).map(([emotion, value]) => (
              <Card
                key={emotion}
                className={`border-0 overflow-hidden transition-all duration-300 ${
                  emotion === currentEmotion
                    ? "shadow-md ring-2 ring-purple-500 dark:ring-purple-400"
                    : "shadow-sm hover:shadow"
                }`}
              >
                <div className={`h-1 ${emotionColors[emotion as keyof typeof emotionColors]}`}></div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">{emotion}</span>
                    <span className="text-sm font-medium">{Math.round(value * 100)}%</span>
                  </div>
                  <Progress value={value * 100} className="h-1 mt-2 bg-gray-100 dark:bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
            <p>Your TTS voice will automatically adapt to match your detected emotion.</p>
          </div>
        </div>
      )}
    </div>
  )
}
