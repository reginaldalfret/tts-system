"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Camera, Hand, VolumeX, Volume2, FastForward, Rewind } from "lucide-react"

interface GestureControllerProps {
  enabled: boolean
  onToggle: () => void
  onGestureDetected: (gesture: string) => void
}

export function GestureController({ enabled, onToggle, onGestureDetected }: GestureControllerProps) {
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "pending">("pending")
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null)
  const [gestureConfidence, setGestureConfidence] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Gesture detection simulation
  const gestures = [
    { name: "volume-up", icon: <Volume2 className="h-5 w-5" />, description: "Raise hand with palm up" },
    { name: "volume-down", icon: <VolumeX className="h-5 w-5" />, description: "Lower hand with palm down" },
    { name: "speed-up", icon: <FastForward className="h-5 w-5" />, description: "Swipe right" },
    { name: "speed-down", icon: <Rewind className="h-5 w-5" />, description: "Swipe left" },
  ]

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraPermission("granted")

        if (enabled) {
          startGestureDetection()
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraPermission("denied")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  const startGestureDetection = () => {
    if (!enabled || !videoRef.current || !canvasRef.current) return

    const detectGestures = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const ctx = canvasRef.current.getContext("2d")
        if (ctx) {
          canvasRef.current.width = videoRef.current.videoWidth
          canvasRef.current.height = videoRef.current.videoHeight
          ctx.drawImage(videoRef.current, 0, 0)

          // Simulate gesture detection
          // In a real implementation, this would use a hand tracking and gesture recognition model
          simulateGestureDetection()
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectGestures)
    }

    detectGestures()
  }

  const stopGestureDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setDetectedGesture(null)
    setGestureConfidence(0)
  }

  const simulateGestureDetection = () => {
    // Only detect gestures occasionally to make it more realistic
    if (Math.random() > 0.05) return

    // Simulate random gesture detection
    // In a real implementation, this would be the output of an ML model
    const randomGesture = gestures[Math.floor(Math.random() * gestures.length)]
    const confidence = Math.random() * 0.3 + 0.7 // Random confidence between 70-100%

    setDetectedGesture(randomGesture.name)
    setGestureConfidence(Math.round(confidence * 100))

    // Notify parent component
    onGestureDetected(randomGesture.name)

    // Clear the gesture after a short delay
    setTimeout(() => {
      setDetectedGesture(null)
      setGestureConfidence(0)
    }, 1500)
  }

  // Handle toggle
  useEffect(() => {
    if (enabled) {
      if (cameraPermission === "pending") {
        startCamera()
      } else if (cameraPermission === "granted") {
        startGestureDetection()
      }
    } else {
      stopGestureDetection()
    }
  }, [enabled, cameraPermission])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch id="gesture-control" checked={enabled} onCheckedChange={onToggle} />
          <Label htmlFor="gesture-control">Enable Gesture Control</Label>
        </div>

        {cameraPermission === "pending" && (
          <Button onClick={startCamera} variant="outline" size="sm">
            <Camera className="mr-2 h-4 w-4" />
            Setup Camera
          </Button>
        )}
      </div>

      {cameraPermission === "granted" && (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {enabled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                {detectedGesture ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-primary text-lg font-bold">Gesture Detected!</div>
                    <div className="text-3xl">{gestures.find((g) => g.name === detectedGesture)?.icon}</div>
                    <div className="text-sm font-medium capitalize">{detectedGesture.replace("-", " ")}</div>
                    <div className="text-xs text-muted-foreground">Confidence: {gestureConfidence}%</div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Hand className="h-5 w-5 text-muted-foreground animate-pulse" />
                    <span className="text-sm">Waiting for gestures...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {gestures.map((gesture) => (
          <div key={gesture.name} className="flex items-center space-x-2 p-2 border rounded-md">
            <div className="bg-muted p-2 rounded-full">{gesture.icon}</div>
            <div>
              <div className="font-medium capitalize">{gesture.name.replace("-", " ")}</div>
              <div className="text-xs text-muted-foreground">{gesture.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
