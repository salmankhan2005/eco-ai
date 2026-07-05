"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Phone, PhoneOff, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CallStatus = "idle" | "connecting" | "active" | "ending";

export default function VapiAssistant() {
  const vapiRef = useRef<any>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize VAPI on mount (dynamic import for SSR safety)
  useEffect(() => {
    let mounted = true;

    const initVapi = async () => {
      try {
        const VapiModule = await import("@vapi-ai/web");
        const Vapi = VapiModule.default;
        if (!mounted) return;

        const vapiInstance = new Vapi("e44c8bcf-9239-4f50-86d8-8760ad48dcc0");
        vapiRef.current = vapiInstance;

        vapiInstance.on("call-start", () => {
          if (mounted) {
            setCallStatus("active");
            setError(null);
          }
        });

        vapiInstance.on("call-end", () => {
          if (mounted) {
            setCallStatus("idle");
            setVolumeLevel(0);
            setIsSpeaking(false);
          }
        });

        vapiInstance.on("volume-level", (level: number) => {
          if (mounted) {
            setVolumeLevel(level);
            setIsSpeaking(level > 0.1);
          }
        });

        vapiInstance.on("speech-start", () => {
          if (mounted) setIsSpeaking(true);
        });

        vapiInstance.on("speech-end", () => {
          if (mounted) setIsSpeaking(false);
        });

        vapiInstance.on("error", (err: any) => {
          console.error("VAPI Error:", err);
          if (mounted) {
            setError("Voice connection failed. Try again.");
            setCallStatus("idle");
          }
        });
      } catch (err) {
        console.error("Failed to initialize VAPI:", err);
      }
    };

    initVapi();

    return () => {
      mounted = false;
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const toggleCall = useCallback(async () => {
    if (!vapiRef.current) return;

    if (callStatus === "idle") {
      setCallStatus("connecting");
      setError(null);
      try {
        await vapiRef.current.start({
          model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are EcoRecycle AI, a friendly and enthusiastic voice assistant for the EcoRecycle platform — an innovative e-waste recycling and rewards application.

Your role:
- Welcome users warmly and introduce the EcoRecycle platform
- Explain how users can recycle e-waste (old phones, laptops, batteries, chargers, etc.) at certified collection centers
- Tell them about the rewards system: users earn EcoPoints for every item recycled, which can be redeemed in the EcoShop for eco-friendly products
- Mention the AI-powered scanner that identifies e-waste items and estimates their recycling value
- Talk about the carbon footprint dashboard that tracks environmental impact
- Mention the community features where users can connect with other eco-conscious people
- If asked about the enterprise portal, explain that businesses can manage bulk e-waste recycling through the B2B portal

Keep your responses short (2-3 sentences max), conversational, and energetic. Use a friendly, approachable tone. You're passionate about sustainability and helping the environment!`,
              },
            ],
          },
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM",
          },
          firstMessage:
            "Hey there! 👋 Welcome to EcoRecycle! I'm your AI assistant. Want to learn how you can recycle e-waste and earn amazing rewards? Just ask me anything!",
          transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "en",
          },
        });
      } catch (err) {
        console.error("Failed to start call:", err);
        setError("Could not start voice call. Please try again.");
        setCallStatus("idle");
      }
    } else {
      setCallStatus("ending");
      vapiRef.current.stop();
    }
  }, [callStatus]);

  const isActive = callStatus === "active";
  const isConnecting = callStatus === "connecting";
  const waveScale = 1 + volumeLevel * 0.5;

  return (
    <div className="fixed bottom-6 left-6 z-50" id="vapi-voice-assistant">
      <AnimatePresence>
        {/* Error toast */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-20 left-0 bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
          >
            {error}
          </motion.div>
        )}

        {/* Status label */}
        {(isActive || isConnecting) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-black/70 backdrop-blur-md text-white text-xs font-medium px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? "bg-green-400 animate-pulse" : "bg-yellow-400 animate-pulse"
                }`}
              />
              {isConnecting ? "Connecting..." : isSpeaking ? "EcoAI is speaking..." : "Listening..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wave rings / Voice Orb */}
      <div className="relative flex items-center justify-center">
        {isActive && (
          <div className="absolute w-[180px] h-[180px] -z-10 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-full h-full rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(34, 197, 94, 0.3), transparent)",
              }}
              animate={{ scale: waveScale, opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}

        {/* Connecting pulse */}
        {isConnecting && (
          <motion.div
            className="absolute w-[60px] h-[60px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(34, 197, 94, 0.3), transparent)",
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Main toggle button */}
        <motion.button
          onClick={toggleCall}
          disabled={callStatus === "ending"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer ${
            isActive
              ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/40"
              : isConnecting
              ? "bg-gradient-to-br from-yellow-500 to-amber-600 shadow-yellow-500/40"
              : "bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/40"
          }`}
          aria-label={isActive ? "End voice call" : "Start voice call"}
        >
          {/* Glow effect */}
          <div
            className={`absolute inset-0 rounded-full blur-md transition-all duration-300 ${
              isActive
                ? "bg-red-500/40"
                : isConnecting
                ? "bg-yellow-500/40"
                : "bg-emerald-500/30"
            }`}
          />

          {/* Icon */}
          <div className="relative z-10">
            {isActive ? (
              <PhoneOff className="w-6 h-6 text-white" />
            ) : isConnecting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Phone className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </div>

          {/* Active ring heartbeat */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}
