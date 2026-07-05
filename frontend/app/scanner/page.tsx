"use client"

import { useState, useRef } from "react"
import { Upload, X, Camera, RefreshCcw, Loader2 } from "lucide-react"
import { analyzeEWasteImageWithGroqVision } from "@/lib/groq"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function ScannerPage() {
  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      setImage(base64String)
      setError(null)
      setAnalysisResult(null)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!image) return

    try {
      setIsAnalyzing(true)
      setError(null)
      
      const result = await analyzeEWasteImageWithGroqVision(image)
      setAnalysisResult(result)
      
    } catch (err) {
      console.error(err)
      setError("Failed to analyze image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setImage(null)
    setAnalysisResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="container py-8 md:py-12 max-w-4xl mx-auto min-h-screen">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          AI E-Waste Scanner
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Instantly identify electronic waste and get an estimated reward point value using our powerful Groq Vision AI.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Column */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className=" flex items-center gap-2">
              <Camera className="w-5 h-5" /> 
              Upload Photo
            </CardTitle>
            <CardDescription>Take a picture or upload an image of the item.</CardDescription>
          </CardHeader>
          <CardContent>
            {!image ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors group"
              >
                <Upload className="w-12 h-12 text-gray-400 group-hover:text-primary transition-colors mb-4" />
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP (Max 5MB)</p>
              </div>
            ) : (
              <div className="relative w-full aspect-square md:aspect-auto md:h-64 rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
                <img src={image} alt="E-waste preview" className="object-contain w-full h-full" />
                
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-md" onClick={handleClear}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />

            <div className="mt-6">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:opacity-90 transition-opacity" 
                size="lg"
                disabled={!image || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing with Groq Llama 3.2 Vision...
                  </>
                ) : (
                  "Scan Item Now"
                )}
              </Button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Column */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className=" flex items-center gap-2">
              <RefreshCcw className="w-5 h-5" /> 
              Analysis Result
            </CardTitle>
            <CardDescription>What the AI found inside your device.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] overflow-y-auto">
            {!analysisResult && !isAnalyzing && (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="p-4 rounded-full bg-muted">
                  <RefreshCcw className="w-8 h-8 opacity-50" />
                </div>
                <p>Upload an image and run the scanner to see results.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse" />
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 relative z-10" />
                </div>
                <p className="text-sm font-medium animate-pulse">Groq Vision is scanning...</p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
              >
                {/* Simple markdown-like rendering for the result */}
                {analysisResult.split('\n').map((line, i) => {
                  if (line.startsWith('##')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-primary">{line.replace('##', '').trim()}</h3>
                  if (line.startsWith('**') || line.includes(':')) {
                    const [bold, rest] = line.split(':');
                    if (rest) return <p key={i} className="mb-2"><strong className="text-foreground">{bold.replace(/\*\*/g, '')}:</strong> {rest}</p>
                  }
                  return <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>
                })}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
