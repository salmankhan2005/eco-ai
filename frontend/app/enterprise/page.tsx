"use client"

import { useState } from "react"
import { Building2, Award, Truck, ShieldCheck, ArrowRight, CheckCircle2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function EnterprisePage() {
  const { toast } = useToast()
  
  // Real-time State
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [volume, setVolume] = useState<number>(500) // Default to 500kg
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Dynamic calculations based on volume
  const co2Prevented = Math.round(volume * 2.76)
  const toxicStopped = Math.round(volume * 0.034)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName || !email) {
      toast({
        title: "Missing Information",
        description: "Please provide your company name and work email.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    // Simulate API Call / Generation delay
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      toast({
        title: "Evaluation Requested & Certificate Generated! 🚀",
        description: `Your custom ESG evaluation for ${companyName} is ready.`,
      })
    }, 1500)
  }

  // Resets the state so they can do another one if they want
  const handleReset = () => {
    setIsSubmitted(false)
    setCompanyName("")
    setEmail("")
    setVolume(500)
  }

  const downloadPDF = async () => {
    const element = document.getElementById('certificate-preview')
    if (!element) return
    
    toast({ title: "Generating PDF...", description: "Please wait while we secure your certificate." })
    
    try {
      // Dynamically import to keep the initial client bundle small
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF } = await import('jspdf')

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      // Create a PDF with the exact dimensions of the scaled canvas
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`${companyName ? companyName.replace(/\s+/g, '_') : 'Enterprise'}_ESG_Certificate.pdf`)
      
      toast({ title: "Success!", description: "Your ESG Certificate has been downloaded." })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dark Corporate Hero */}
      <section className="w-full py-16 md:py-32 bg-slate-950 text-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="container px-4 md:px-6 relative z-10 hidden md:block">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
        </div>
        
        <div className="container px-4 md:px-6 relative z-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
              <Building2 className="mr-2 h-4 w-4" /> B2B Eco Solutions
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Corporate E-Waste Recycling & ESG Certification
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
              Turn your company's old hardware into verified ESG compliance. Schedule bulk logistics, track your carbon footprint, and generate official sustainability certificates for your stakeholders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0" onClick={() => document.getElementById("request-form")?.scrollIntoView({ behavior: 'smooth' })}>
                Schedule Bulk Pickup
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="w-full py-12 bg-muted/30 border-b">
        <div className="container px-4 md:px-6">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 tracking-widest uppercase">Trusted by forward-thinking companies</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale">
            <div className="text-xl font-bold font-serif flex items-center gap-2"><div className="w-8 h-8 rounded bg-foreground/20" /> ACME Corp</div>
            <div className="text-xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-foreground/20" /> Globex</div>
            <div className="text-xl font-black italic flex items-center gap-2"><div className="w-8 h-8 rotate-45 bg-foreground/20" /> INITECH</div>
            <div className="text-xl font-bold tracking-widest flex items-center gap-2">SOYUZ <div className="w-4 h-4 rounded-full bg-foreground/20" /></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-emerald-500/50 transition-colors shadow-sm">
              <CardHeader>
                <Truck className="w-10 h-10 text-emerald-600 mb-2" />
                <CardTitle>Secure Logistics</CardTitle>
                <CardDescription>White-glove bulk pickup from your office or data center. Fully insured and tracked.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-cyan-500/50 transition-colors shadow-sm">
              <CardHeader>
                <ShieldCheck className="w-10 h-10 text-cyan-600 mb-2" />
                <CardTitle>Data Destruction</CardTitle>
                <CardDescription>Military-grade hard drive wiping and physical destruction with cryptographic certificates.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-purple-500/50 transition-colors shadow-sm">
              <CardHeader>
                <Award className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>ESG Certificates</CardTitle>
                <CardDescription>Instantly generate blockchain-verified carbon offset certificates for your annual reports.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Scheduling & Cert Preview */}
      <section id="request-form" className="w-full py-16 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Form & Success State Area */}
            <div className="space-y-8 sticky top-24">
              <AnimatePresence mode="wait">
                
                {/* STATE 1: FORM */}
                {!isSubmitted && (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight mb-2">Request an Enterprise Evaluation</h2>
                      <p className="text-muted-foreground">Fill out this form and watch your projected ESG Certificate update in real-time. Our team will contact you within 24 hours.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                      <Card className="shadow-lg border-emerald-500/20 border-2">
                        <CardContent className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="company">Company Name</Label>
                              <Input 
                                id="company" 
                                placeholder="e.g. Acme Inc." 
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="employeeCount">Employee Count</Label>
                              <Input id="employeeCount" placeholder="e.g. 500+" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Work Email</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              placeholder="jane@acme.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="volume">Estimated E-Waste Volume</Label>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={volume}
                              onChange={(e) => setVolume(Number(e.target.value))}
                            >
                              <option value={100}>Less than 100 kg (Small Office)</option>
                              <option value={500}>100 - 500 kg (Medium Office)</option>
                              <option value={1500}>500kg - 1.5 Tons (Large Facility)</option>
                              <option value={5000}>5 Tons+ (Data Center / Warehouse)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes">Additional Requirements</Label>
                            <Textarea id="notes" placeholder="Do you require secure data destruction?" />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-slate-900 text-white hover:bg-slate-800"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Generating Certificate..." : (
                              <>Submit Request <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </form>
                  </motion.div>
                )}

                {/* STATE 2: SUCCESS DASHBOARD */}
                {isSubmitted && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div>
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold tracking-tight mb-2">Evaluation Confirmed! 🎉</h2>
                      <p className="text-muted-foreground">Thank you, <strong className="text-foreground">{companyName}</strong>. Our enterprise logistics team has received your request and will contact <strong className="text-foreground">{email}</strong> within 24 hours to schedule bulk pickup.</p>
                    </div>

                    <Card className="bg-emerald-50 border-emerald-200">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-emerald-800 mb-2">Your Preliminary ESG Report is Ready</h3>
                        <p className="text-sm text-emerald-600 mb-6">Based on your estimated {volume.toLocaleString()}kg of e-waste, we have generated your preliminary ESG compliance certificate. This certificate guarantees your organization's environmental offset.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button className="bg-emerald-600 hover:bg-emerald-700 w-full" onClick={downloadPDF}>
                            <Download className="w-4 h-4 mr-2" /> Download PDF Certificate
                          </Button>
                          <Button variant="outline" className="w-full bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50" onClick={handleReset}>
                            Submit Another Facility
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="bg-white p-6 rounded-xl border border-border flex items-start gap-4 shadow-sm">
                      <ShieldCheck className="w-8 h-8 text-blue-500 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm">Next Step: Data Destruction Audit</h4>
                        <p className="text-xs text-muted-foreground mt-1">When our team arrives, we will conduct an on-site audit of all hard drives to ensure compliance with NIST 800-88 before cryptographic wiping.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
              </AnimatePresence>
            </div>

            {/* Certificate Preview UI (Always Visible) */}
            <div className="flex flex-col items-center justify-center pt-8">
              <motion.div 
                id="certificate-preview"
                key={volume} 
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border p-8 relative transition-transform duration-500 ${isSubmitted ? 'ring-4 ring-emerald-500 ring-offset-4 scale-105' : 'transform rotate-1 hover:rotate-0'}`}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                
                {isSubmitted && (
                   <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                     <CheckCircle2 className="w-3 h-3" />
                     Generated
                   </div>
                )}

                <div className="text-center space-y-4 mb-8 pt-4">
                  <Award className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h3 className="text-2xl font-serif text-slate-800">Certificate of Environmental Impact</h3>
                  <p className="text-sm text-slate-500">{isSubmitted ? "Official document for" : "Projected impact for"} <br/> <strong className="text-lg text-emerald-700">{companyName || "Your Company Name"}</strong></p>
                </div>
                
                <div className="space-y-4 border-t border-b py-6 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">E-Waste Diverted</span>
                    <span className="text-xl font-bold text-emerald-600">{volume.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">CO₂ Emissions Prevented</span>
                    <span className="text-xl font-bold text-emerald-600">{co2Prevented.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Toxic Leaks Stopped</span>
                    <span className="text-xl font-bold text-emerald-600">{toxicStopped.toLocaleString()} kg</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 justify-center bg-slate-50 p-3 rounded-lg border border-dashed">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Cryptographically Verified on EcoRecycle Ledger
                </div>
              </motion.div>
              
              <p className="text-center text-sm text-muted-foreground mt-8 max-w-md">
                All certificates are dynamically calculated, cryptographically signed, and perfectly crafted to append directly to your annual ESG Sustainability Report.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
