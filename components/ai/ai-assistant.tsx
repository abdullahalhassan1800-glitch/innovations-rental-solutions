"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Headset,
  Loader2,
  Mic,
  MicOff,
  Scale,
  Send,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { detectLanguage } from "@/lib/ai/intent";
import type { AssistantResponse, ChatCard } from "@/lib/ai/types";

type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; data?: AssistantResponse };

type SpeechAlternative = { transcript: string; confidence?: number; isFinal?: boolean };
type SpeechRecognitionResultLike = ArrayLike<SpeechAlternative> & { isFinal?: boolean };
type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
  resultIndex?: number;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type VoiceLanguage = "auto" | "en-IN" | "hi-IN";

type SendOptions = { speak?: boolean; handsFree?: boolean };

/**
 * Spoken replies are on by default and remembered across visits. Only an
 * explicit tap on the speaker icon turns them off.
 */
const SPEAK_PREF_KEY = "innovations.ai.speakReplies";

/** Chrome sometimes reports results with `isFinal` on the result rather than the alternative. */
function isFinalResult(result: SpeechRecognitionResultLike, alternative: SpeechAlternative) {
  return result.isFinal === true || alternative.isFinal === true;
}

function pickVoice(voices: SpeechSynthesisVoice[], language: string) {
  const exact = language === "hi" ? "hi-IN" : "en-IN";
  const prefix = language === "hi" ? "hi" : "en";
  const normalise = (value: string) => value.replace("_", "-").toLowerCase();
  const nameNormalise = (value: string) => value.toLowerCase();

  // Female-sounding voices first, then natural/microsoft/google/azure names.
  const femaleNames = ["female", "woman", "girl", "samantha", "ava", "aria", "sana", "kavya", "lekha"];
  const naturalNames = ["natural", "google", "azure", "microsoft"];

  const findVoice = (pred: (v: SpeechSynthesisVoice) => boolean) =>
    voices.find(pred) ?? null;

  const exactFemale = () =>
    findVoice((v) => normalise(v.lang) === exact.toLowerCase() && femaleNames.some((p) => nameNormalise(v.name).includes(p)));
  const exactNatural = () =>
    findVoice((v) => normalise(v.lang) === exact.toLowerCase() && naturalNames.some((p) => nameNormalise(v.name).includes(p)));
  const exactAny = () => findVoice((v) => normalise(v.lang) === exact.toLowerCase());
  const prefixFemale = () =>
    findVoice((v) => normalise(v.lang).startsWith(prefix) && femaleNames.some((p) => nameNormalise(v.name).includes(p)));
  const prefixNatural = () =>
    findVoice((v) => normalise(v.lang).startsWith(prefix) && naturalNames.some((p) => nameNormalise(v.name).includes(p)));
  const prefixAny = () => findVoice((v) => normalise(v.lang).startsWith(prefix));
  const defaultVoice = () => findVoice((v) => v.default);

  return (
    exactFemale() ??
    exactNatural() ??
    exactAny() ??
    prefixFemale() ??
    prefixNatural() ??
    prefixAny() ??
    defaultVoice() ??
    null
  );
}

/** Keep speech synthesis chunks short: Chrome can truncate long utterances. */
function splitSpeech(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]?/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && `${current} ${sentence}`.trim().length > 180) {
      chunks.push(current.trim());
      current = "";
    }
    current = `${current} ${sentence}`.trim();
  }
  if (current) chunks.push(current);
  return chunks.filter(Boolean).slice(0, 8);
}

function voiceErrorMessage(code?: string) {
  switch (code) {
    case "not-allowed":
      return "Microphone access is blocked for this site. Open the site directly in Chrome or Edge, click the microphone or lock icon in the address bar, choose Allow, then tap the mic again — or type your question.";
    case "service-not-allowed":
      return "Your browser blocked its speech service. Try Chrome or Edge, allow microphone access, or type your question instead.";
    case "no-speech":
      return "I didn't catch that. Tap the microphone, speak a little closer, or type your question instead.";
    case "audio-capture":
      return "No working microphone was found. Check that one is connected and allowed, then try again — or type your question.";
    case "network":
      return "Speech recognition needs an internet connection to your browser's speech service. Check your connection, try Chrome or Edge, or type your question.";
    default:
      return "Voice input is unavailable right now. Try Chrome or Edge, or type your question instead.";
  }
}

function recognitionStartError(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "InvalidStateError") return "Voice input is already active. Wait a moment and tap the mic again.";
  if (name === "NotAllowedError" || name === "SecurityError") return voiceErrorMessage("not-allowed");
  return voiceErrorMessage("audio-capture");
}

const STARTERS = [
  "2 BHK in Noida under ₹75 lakh",
  "Ready-to-move projects in Noida Extension",
  "Commercial office space in Greater Noida",
];

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm Innovations AI. Tell me a location, budget, BHK or property type in English, Hindi or Hinglish — I'll search our live project database and show real matches. I never invent projects or prices.",
};

export function AIAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Start hidden on the homepage hero so the launcher never flashes over the
  // stats before the observer below runs.
  const [heroInView, setHeroInView] = useState(pathname === "/");
  // Project detail pages carry a mobile-only sticky enquiry bar along the
  // bottom edge. Lift the launcher above it so it never covers the price or
  // the "Book a visit" button.
  const aboveMobileBar = /^\/projects\/[^/]+\/?$/.test(pathname ?? "");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>("auto");
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [voiceOptions, setVoiceOptions] = useState<{ name: string; lang: string }[]>([]);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [voiceBlockedReason, setVoiceBlockedReason] = useState("");
  const [secureContext, setSecureContext] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(STARTERS);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechTokenRef = useRef(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const autoSendRef = useRef(false);
  const gotSpeechRef = useRef(false);
  const voiceFinalRef = useRef("");
  const voiceDraftRef = useRef("");
  const userMutedRef = useRef(false);
  const handsFreeRef = useRef(false);
  const loadingRef = useRef(false);
  const speakingRef = useRef(false);
  const openRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const noSpeechRetriesRef = useRef(0);
  const beginTurnRef = useRef<(() => void) | null>(null);
  const qualificationStateRef = useRef<{ step: string; collected: Record<string, unknown> } | null>(null);
  const sendRef = useRef<
    ((text: string, contextIds?: string[], options?: SendOptions) => Promise<void>) | null
  >(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supported = Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
    );
    const hasSpeechSynthesis = "speechSynthesis" in window;

    setVoiceSupported(supported);
    setTtsSupported(hasSpeechSynthesis);
    setSecureContext(window.isSecureContext);

    if (!supported) {
      setVoiceBlockedReason("Voice input works in Chrome and Edge. You can still type your question below.");
    } else if (!window.isSecureContext) {
      setVoiceBlockedReason(
        "Microphone access needs HTTPS or localhost. Open this site on an https:// address (or localhost) to speak — typing still works.",
      );
    } else {
      setVoiceBlockedReason("");
    }

    function loadVoices() {
      if (!("speechSynthesis" in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) voicesRef.current = voices;
      setVoiceOptions(
        voices.map((v) => ({ name: v.name, lang: v.lang })).filter((v, i, a) => a.findIndex((x) => x.name === v.name) === i),
      );
    }

    loadVoices();
    if (hasSpeechSynthesis) window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      if (hasSpeechSynthesis) window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Restore the saved spoken-replies preference. Spoken replies stay on unless
  // the visitor explicitly muted them.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SPEAK_PREF_KEY);
      if (stored === "off") {
        setSpeakReplies(false);
        userMutedRef.current = true;
      } else {
        setSpeakReplies(true);
        userMutedRef.current = false;
      }
    } catch {
      // Storage can be blocked in private modes; the in-memory default stands.
    }
  }, []);

  /**
   * On pages with a marked hero (the homepage), keep the launcher off the
   * hero's bottom stats. It slides back in as soon as the hero scrolls away.
   */
  useEffect(() => {
    const hero = document.querySelector("[data-ai-avoid]");
    if (!hero) {
      setHeroInView(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry?.isIntersecting ?? false),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, loading, open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        openRef.current = false;
        setOpen(false);
        stopConversation();
      }
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stopSpeaking = useCallback(() => {
    speechTokenRef.current += 1;
    speakingRef.current = false;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  /**
   * Unlock speech synthesis inside the user's tap. Chrome can silently ignore
   * utterances that originate after an async request without a prior gesture.
   */
  const primeSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const synth = window.speechSynthesis;
      synth.resume();
      voicesRef.current = synth.getVoices();
      const unlock = new SpeechSynthesisUtterance(" ");
      unlock.volume = 0;
      unlock.rate = 1;
      synth.speak(unlock);
    } catch {
      // Speech synthesis is best-effort; the written answer is always shown.
    }
  }, []);

  function speak(text: string, language: string, onDone?: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Spoken replies are not available in this browser. The full answer is shown above.");
      onDone?.();
      return;
    }

    const synth = window.speechSynthesis;
    const token = speechTokenRef.current + 1;
    speechTokenRef.current = token;
    synth.cancel();
    synth.resume();

    const lang = language === "hi" ? "hi-IN" : "en-IN";
    const liveVoices = synth.getVoices();
    if (liveVoices.length) voicesRef.current = liveVoices;
    const preferredVoice = pickVoice(voicesRef.current, language);
    const chunks = splitSpeech(text);
    if (!chunks.length) {
      onDone?.();
      return;
    }

    let remaining = chunks.length;
    let started = false;
    let completed = false;
    let safetyTimer = 0;

    const complete = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(safetyTimer);
      if (speechTokenRef.current !== token) return;
      speakingRef.current = false;
      setSpeaking(false);
      onDone?.();
    };

    // Some Windows/Chrome voice drivers never fire `onend`. Re-arm this after
    // every finished chunk so a stalled voice cannot hold the microphone shut.
    const armSafety = (delay: number) => {
      window.clearTimeout(safetyTimer);
      safetyTimer = window.setTimeout(complete, delay);
    };

    speakingRef.current = true;
    setSpeaking(true);
    armSafety(Math.max(12_000, text.length * 90 + 4_000));

    // Give Chrome a moment to finish cancelling any previous (or priming)
    // utterance. Speaking immediately after cancel is a known no-op race.
    window.setTimeout(() => {
      if (speechTokenRef.current !== token) return;
      chunks.forEach((chunk) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = lang;
        // Slightly slower than default for a calmer, less robotic delivery.
        utterance.rate = language === "hi" ? 0.9 : 0.96;
        utterance.pitch = 1;
        utterance.volume = 1;
        const chosenVoice = selectedVoice
          ? voicesRef.current.find((v) => v.name === selectedVoice)
          : preferredVoice;
        if (chosenVoice) utterance.voice = chosenVoice;
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          if (speechTokenRef.current !== token) return;
          remaining -= 1;
          if (remaining <= 0) complete();
          else armSafety(6_000);
        };
        utterance.onstart = () => {
          started = true;
        };
        utterance.onend = finish;
        utterance.onerror = (event) => {
          finish();
          if (!started && (event.error === "not-allowed" || event.error === "audio-busy")) {
            setError("Your browser blocked spoken replies. Tap the speaker icon again, then send again. The written answer is above.");
          }
        };
        synth.speak(utterance);
      });
    }, 40);
  }

  const stopListening = useCallback((submit = false) => {
    autoSendRef.current = submit;
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        try {
          recognition.abort();
        } catch {
          // Already stopped.
        }
      }
    }
    setListening(false);
  }, []);

  const clearRestart = useCallback(() => {
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  /** Re-open the mic after the assistant has finished answering. */
  const resumeListening = useCallback(
    (delay = 350) => {
      if (!handsFreeRef.current || !openRef.current) return;
      clearRestart();
      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null;
        if (!handsFreeRef.current || !openRef.current) return;
        if (document.hidden || loadingRef.current || speakingRef.current) return;
        if (recognitionRef.current) return;
        beginTurnRef.current?.();
      }, delay);
    },
    [clearRestart],
  );

  const stopConversation = useCallback(
    (message?: string) => {
      handsFreeRef.current = false;
      setHandsFree(false);
      noSpeechRetriesRef.current = 0;
      clearRestart();
      stopSpeaking();
      autoSendRef.current = false;
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          // Already stopped.
        }
      }
      setListening(false);
      if (message) setError(message);
    },
    [clearRestart, stopSpeaking],
  );

  /** Runs one listening turn. Hands-free mode restarts it automatically. */
  function beginVoiceTurn() {
    if (!handsFreeRef.current || !openRef.current) return;
    if (document.hidden || loadingRef.current || speakingRef.current) return;
    if (recognitionRef.current) return;

    if (!voiceSupported) {
      stopConversation(voiceBlockedReason || "Voice input is unavailable in this browser. Type your question instead.");
      return;
    }
    if (!window.isSecureContext) {
      stopConversation(
        "Microphone access needs HTTPS or localhost. Open this site on an https:// address (or localhost) to speak — typing still works.",
      );
      return;
    }

    const Recognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!Recognition) {
      stopConversation("Voice input is unavailable in this browser. Type your question instead.");
      return;
    }

    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
    const detected = detectLanguage(input.trim() || lastUserMessage) === "hi";
    const autoLanguage =
      detected || navigator.language?.toLowerCase().startsWith("hi") ? "hi-IN" : "en-IN";

    const recognition = new Recognition();
    recognition.lang = voiceLanguage === "auto" ? autoLanguage : voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    voiceFinalRef.current = "";
    voiceDraftRef.current = "";
    gotSpeechRef.current = false;
    autoSendRef.current = true;

    recognition.onresult = (event) => {
      const finalParts: string[] = [];
      const interimParts: string[] = [];
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result?.[0];
        if (!alternative?.transcript) continue;
        if (isFinalResult(result, alternative)) finalParts.push(alternative.transcript.trim());
        else interimParts.push(alternative.transcript.trim());
      }

      const finalText = finalParts.filter(Boolean).join(" ").trim();
      const interimText = interimParts.filter(Boolean).join(" ").trim();
      const transcript = `${finalText} ${interimText}`.trim();
      if (finalText) voiceFinalRef.current = finalText;
      voiceDraftRef.current = transcript;
      if (transcript) {
        gotSpeechRef.current = true;
        noSpeechRetriesRef.current = 0;
        setInput(transcript);
      }
    };

    recognition.onerror = (event) => {
      autoSendRef.current = false;
      setListening(false);
      const code = event.error;
      // `no-speech` / `aborted` are handled by onend so hands-free can retry.
      if (!code || code === "no-speech" || code === "aborted") return;
      if (code === "not-allowed" || code === "service-not-allowed" || code === "audio-capture") {
        stopConversation(voiceErrorMessage(code));
        return;
      }
      if (code === "network" && handsFreeRef.current && noSpeechRetriesRef.current < 1) {
        noSpeechRetriesRef.current += 1;
        return;
      }
      stopConversation(voiceErrorMessage(code));
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setListening(false);

      const shouldSend = autoSendRef.current;
      autoSendRef.current = false;
      const transcript = (voiceFinalRef.current || voiceDraftRef.current).trim();

      if (shouldSend && transcript) {
        noSpeechRetriesRef.current = 0;
        void sendRef.current?.(transcript, undefined, { speak: true, handsFree: true });
        return;
      }

      if (!handsFreeRef.current) {
        if (shouldSend && !gotSpeechRef.current) setError(voiceErrorMessage("no-speech"));
        return;
      }

      if (!openRef.current || loadingRef.current || speakingRef.current) return;

      noSpeechRetriesRef.current += 1;
      if (noSpeechRetriesRef.current > 3) {
        stopConversation(
          "I couldn't hear anything for a while, so hands-free mode is paused. Tap the mic to start again — or type your question.",
        );
        return;
      }
      resumeListening(600);
    };

    recognitionRef.current = recognition;
    setListening(true);
    try {
      recognition.start();
    } catch (startError) {
      recognitionRef.current = null;
      autoSendRef.current = false;
      setListening(false);
      stopConversation(recognitionStartError(startError));
    }
  }

  function startConversation() {
    if (handsFreeRef.current) {
      stopConversation();
      return;
    }
    if (loadingRef.current) {
      setError("Please wait for the current answer before starting a conversation.");
      return;
    }
    if (!voiceSupported) {
      setError(voiceBlockedReason || "Voice input is unavailable in this browser. Type your question instead.");
      return;
    }
    if (!window.isSecureContext) {
      setError(
        "Microphone access needs HTTPS or localhost. Open this site on an https:// address (or localhost) to speak — typing still works.",
      );
      return;
    }

    setError("");
    // Keep the assistant's own voice out of the microphone, and unlock audio
    // inside this tap so spoken replies are not blocked later.
    stopSpeaking();
    if (!userMutedRef.current) setSpeakReplies(true);
    primeSpeech();

    handsFreeRef.current = true;
    setHandsFree(true);
    noSpeechRetriesRef.current = 0;
    beginVoiceTurn();
  }

  useEffect(() => {
    beginTurnRef.current = beginVoiceTurn;
  });

  useEffect(() => {
    openRef.current = open;
    if (!open) stopConversation();
  }, [open, stopConversation]);

  // Pause the microphone while the tab is hidden; resume when it returns.
  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) {
        clearRestart();
        if (handsFreeRef.current) stopListening();
      } else if (handsFreeRef.current && openRef.current) {
        resumeListening(600);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [clearRestart, resumeListening, stopListening]);

  // Navigating away ends hands-free mode.
  useEffect(() => {
    stopConversation();
  }, [pathname, stopConversation]);

  // Never leave the microphone open after unmounting.
  useEffect(() => {
    return () => {
      handsFreeRef.current = false;
      clearRestart();
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          // Already stopped.
        }
      }
    };
  }, [clearRestart]);

  async function send(text: string, contextIds?: string[], options?: SendOptions) {
    const trimmed = text.trim();
    if (!trimmed || loadingRef.current) return;
    stopListening();
    stopSpeaking();
    setInput("");
    setError("");
    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    loadingRef.current = true;
    setLoading(true);

    const continuingHandsFree = options?.handsFree ?? handsFreeRef.current;
    const stillInConversation = () => !continuingHandsFree || handsFreeRef.current;
    const afterAnswer = () => {
      if (continuingHandsFree) resumeListening(400);
    };

    const history = messages
      .filter((message) => message.id !== "welcome")
      .slice(-8)
      .map((message) => ({ role: message.role, content: message.content }));

    // Keep the previous answer's projects as context so follow-up questions such
    // as "iski possession kab hai?" can answer without repeating the project name.
    const lastAnswerProjects = [...messages]
      .reverse()
      .flatMap((message) => (message.role === "assistant" ? (message.data?.projects ?? []) : []))
      .slice(0, 3)
      .map((project) => project.id);
    const context = contextIds ?? (selected.length ? selected : lastAnswerProjects);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          contextProjectIds: context,
          qualificationState: qualificationStateRef.current ?? undefined,
        }),
      });
      const data = (await response.json()) as AssistantResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "The assistant could not respond");
      if (data.qualificationState) {
        qualificationStateRef.current = data.qualificationState;
      } else {
        qualificationStateRef.current = null;
      }
      setMessages((current) => [
        ...current,
        { id: `a-${Date.now()}`, role: "assistant", content: data.reply, data },
      ]);
      if (data.suggestions?.length) setSuggestions(data.suggestions);
      if ((options?.speak ?? speakReplies) && stillInConversation()) {
        speak(data.speech || data.reply, data.language, afterAnswer);
      } else {
        afterAnswer();
      }
    } catch (err) {
      // Keep the question so the user can retry or edit it, especially after a
      // voice transcript was submitted automatically.
      setInput(trimmed);
      setError(err instanceof Error ? err.message : "The assistant is unavailable. Please try again.");
      // A failed answer would otherwise loop straight back into listening.
      if (continuingHandsFree) stopConversation();
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  // Voice recognition ends inside an event handler, so keep a stable reference
  // to the latest send() closure for automatic voice submission.
  useEffect(() => {
    sendRef.current = send;
  });

  function toggleSelected(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  function compareSelected() {
    if (selected.length < 2) return;
    void send("Compare these projects side by side", selected);
  }

  function onCardAction(card: ChatCard, action: "visit" | "details") {
    if (action === "details") return;
    openRef.current = false;
    setOpen(false);
    stopConversation();
    window.location.href = `/projects/${card.slug}#site-visit`;
  }

  function closeAssistant() {
    openRef.current = false;
    setOpen(false);
    stopConversation();
    stopSpeaking();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          openRef.current = true;
          setOpen(true);
          setSuggestions(STARTERS);
          // Unlock speech synthesis inside this tap so typed questions can be
          // answered out loud without a second interaction.
          if (speakReplies) primeSpeech();
        }}
        className={cn(
          "fixed right-4 z-[70] flex size-12 items-center justify-center rounded-full border border-brass/40 bg-night text-paper shadow-float transition duration-300 hover:-translate-y-0.5 hover:bg-forest-deep sm:right-6",
          aboveMobileBar ? "bottom-24 md:bottom-5" : "bottom-5",
          heroInView && !open ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100",
        )}
        aria-label="Ask Innovations AI"
        title="Ask Innovations AI"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-hidden={heroInView && !open ? true : undefined}
        tabIndex={heroInView && !open ? -1 : undefined}
      >
        <Headset className="size-5 text-brass-soft" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-end bg-night/30 p-0 backdrop-blur-sm sm:p-5" onMouseDown={closeAssistant}>
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Innovations AI assistant"
            onMouseDown={(event) => event.stopPropagation()}
            className="flex h-[92vh] w-full max-w-lg flex-col overflow-hidden border border-line bg-cream shadow-float sm:h-[min(720px,90vh)] sm:rounded-[20px]"
          >
            <header className="flex items-center justify-between gap-4 border-b border-line bg-night px-5 py-4 text-paper">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-brass text-night">
                  <Headset className="size-5" />
                </span>
                <div>
                  <p className="font-display text-lg leading-tight">Innovations AI</p>
                  <p className="text-[0.62rem] uppercase tracking-[0.14em] text-paper/50">Database-grounded · EN · हिंदी · Hinglish</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = !speakReplies;
                    setSpeakReplies(next);
                    userMutedRef.current = !next;
                    try {
                      window.localStorage.setItem(SPEAK_PREF_KEY, next ? "on" : "off");
                    } catch {
                      // Storage can be blocked in private modes.
                    }
                    if (!next) {
                      stopSpeaking();
                      if (handsFreeRef.current) resumeListening(350);
                    } else {
                      primeSpeech();
                    }
                  }}
                  disabled={!ttsSupported}
                  aria-label={speakReplies ? "Disable spoken replies" : "Enable spoken replies"}
                  aria-pressed={speakReplies}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border transition",
                    speakReplies ? "border-brass/60 bg-brass/20 text-brass-soft" : "border-paper/15 text-paper/60 hover:text-paper",
                    !ttsSupported && "cursor-not-allowed opacity-40",
                  )}
                  title={
                    ttsSupported
                      ? speakReplies
                        ? "Spoken replies on — tap to mute"
                        : "Spoken replies off — tap to hear answers"
                      : "Spoken replies are not available in this browser"
                  }
                >
                  {speakReplies ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={closeAssistant}
                  aria-label="Close assistant"
                  className="flex size-8 items-center justify-center rounded-full border border-paper/15 text-paper/60 transition hover:text-paper"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[92%]", message.role === "user" && "max-w-[85%]")}>
                    <div
                      className={cn(
                        "animate-chat-in rounded-lg px-4 py-3 text-sm leading-relaxed",
                        message.role === "user"
                          ? "rounded-br-sm bg-forest text-night"
                          : "rounded-bl-sm border border-line bg-surface text-ink-soft",
                      )}
                    >
                      {message.content}
                    </div>

                    {message.role === "assistant" && message.data?.projects?.length ? (
                      <div className="mt-3 space-y-2">
                        {message.data.projects.map((card) => {
                          const isSelected = selected.includes(card.id);
                          return (
                            <div key={card.id} className={cn("overflow-hidden rounded-[14px] border bg-surface transition", isSelected ? "border-brass ring-1 ring-brass/25" : "border-line")}>
                              <div className="flex gap-3 p-2.5">
                                <Link href={`/projects/${card.slug}`} className="relative h-20 w-24 shrink-0 overflow-hidden rounded bg-sand">
                                  {card.image ? (
                                    <Image src={card.image} alt={card.name} fill sizes="96px" className="object-cover" />
                                  ) : (
                                    <span className="flex h-full items-center justify-center text-[0.6rem] text-ink-muted">No image</span>
                                  )}
                                </Link>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[0.6rem] uppercase tracking-[0.1em] text-ink-muted">{card.developer}</p>
                                  <Link href={`/projects/${card.slug}`} className="block truncate font-display text-[1rem] leading-tight hover:text-forest">
                                    {card.name}
                                  </Link>
                                  <p className="mt-0.5 truncate text-[0.7rem] text-ink-muted">{card.location} · {card.configLabel}</p>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    <span className="text-[0.78rem] font-semibold text-forest">{card.priceLabel}</span>
                                    <span className="rounded-full bg-cream px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.08em] text-ink-muted">{card.statusLabel}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2 border-t border-line bg-cream/50 px-2.5 py-1.5">
                                <button
                                  type="button"
                                  onClick={() => toggleSelected(card.id)}
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded px-1.5 py-1 text-[0.65rem] font-semibold transition",
                                    isSelected ? "text-forest" : "text-ink-muted hover:text-forest",
                                  )}
                                  aria-pressed={isSelected}
                                >
                                  {isSelected ? <Check className="size-3" /> : <Scale className="size-3" />}
                                  {isSelected ? "Selected" : "Compare"}
                                </button>
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => onCardAction(card, "visit")} className="text-[0.65rem] font-semibold text-ink-muted hover:text-forest">
                                    Site visit
                                  </button>
                                  <Link href={`/projects/${card.slug}`} className="inline-flex items-center gap-0.5 text-[0.65rem] font-semibold text-forest hover:text-brass">
                                    View <ArrowUpRight className="size-3" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {message.data.comparison && (
                          <div className="overflow-x-auto rounded-[14px] border border-line bg-surface">
                            <table className="w-full min-w-[420px] text-left text-[0.72rem]">
                              <thead>
                                <tr>
                                  <th className="border-b border-line bg-cream/60 px-2.5 py-2 text-[0.6rem] uppercase tracking-[0.08em] text-ink-muted">Compare</th>
                                  {message.data.comparison.projects.map((project) => (
                                    <th key={project.id} className="border-b border-line px-2.5 py-2 font-display text-[0.82rem]">
                                      <Link href={`/projects/${project.slug}`} className="hover:text-forest">{project.name}</Link>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {message.data.comparison.rows.map((row) => (
                                  <tr key={row.label}>
                                    <td className="border-b border-line/70 px-2.5 py-2 font-medium text-ink-muted">{row.label}</td>
                                    {row.values.map((value, index) => (
                                      <td key={index} className="border-b border-line/70 px-2.5 py-2">{value}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {selected.length >= 2 && (
                          <button
                            type="button"
                            onClick={compareSelected}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-forest bg-forest px-3 py-2 text-[0.72rem] font-semibold text-night hover:bg-forest-deep"
                          >
                            <Scale className="size-3.5" /> Compare {selected.length} selected
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-[0.72rem] text-ink-muted">
                  <Loader2 className="size-3.5 animate-spin" /> Searching the project database…
                </div>
              )}

              {error && (
                <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-[0.75rem] text-rust">{error}</p>
              )}
            </div>

            <div className="border-t border-line bg-surface px-4 pb-3 pt-3">
              {suggestions.length > 0 && (
                <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
                  {suggestions.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void send(suggestion)}
                      className="shrink-0 rounded-full border border-line bg-cream px-2.5 py-1 text-[0.65rem] text-ink-soft transition hover:border-brass/50 hover:text-brass"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {handsFree && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-full border border-brass/30 bg-brass/10 px-3 py-1.5 text-[0.65rem] text-brass-soft">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Headset className="size-3 shrink-0" />
                    <span className="truncate">Hands-free conversation</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => stopConversation()}
                    className="shrink-0 font-semibold text-brass-soft hover:text-paper"
                  >
                    End
                  </button>
                </div>
              )}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send(input);
                }}
                className="flex items-end gap-2"
              >
                <label htmlFor="ai-input" className="sr-only">Message the assistant</label>
                <textarea
                  id="ai-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send(input);
                    }
                  }}
                  rows={1}
                  maxLength={600}
                  placeholder={listening ? "Listening… speak now" : handsFree ? "Conversation on — just speak" : "Ask in English, Hindi or Hinglish…"}
                  className="field max-h-28 min-h-10 flex-1 resize-none py-2.5 text-[0.82rem]"
                />
                <button
                  type="button"
                  onClick={() => (handsFree ? stopConversation() : startConversation())}
                  disabled={!voiceSupported}
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full border transition",
                    handsFree
                      ? "border-rust bg-rust text-paper"
                      : "border-line bg-cream text-ink-soft hover:border-forest hover:text-forest",
                    handsFree && listening && "listening-pulse",
                    !voiceSupported && "cursor-not-allowed opacity-40",
                  )}
                  aria-label={handsFree ? "End hands-free conversation" : "Start hands-free conversation"}
                  aria-pressed={handsFree}
                  title={
                    !voiceSupported
                      ? "Voice input is not supported in this browser"
                      : handsFree
                        ? "End conversation"
                        : "Tap once, then just talk — I'll reply and keep listening"
                  }
                >
                  {handsFree ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest text-night transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between gap-2 text-[0.6rem] text-ink-muted">
                <span>Demo data. No invented listings or prices.</span>
                <div className="flex items-center gap-2">
                  {voiceSupported && (
                    <>
                      <label htmlFor="ai-voice-language" className="sr-only">
                        Voice language
                      </label>
                      <select
                        id="ai-voice-language"
                        value={voiceLanguage}
                        onChange={(event) => setVoiceLanguage(event.target.value as VoiceLanguage)}
                        className="rounded-full border border-line bg-cream px-2 py-0.5 text-[0.6rem] text-ink-soft"
                        title="Language for microphone input"
                      >
                        <option value="auto">Auto</option>
                        <option value="en-IN">English</option>
                        <option value="hi-IN">हिंदी</option>
                      </select>
                    </>
                  )}
                  {voiceSupported && voiceOptions.length > 0 && (
                    <>
                      <label htmlFor="ai-voice-select" className="sr-only">
                        Voice
                      </label>
                      <select
                        id="ai-voice-select"
                        value={selectedVoice ?? ""}
                        onChange={(event) => setSelectedVoice(event.target.value || null)}
                        className="rounded-full border border-line bg-cream px-2 py-0.5 text-[0.6rem] text-ink-soft"
                      >
                        <option value="">Default voice</option>
                        {voiceOptions.map((v) => (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {handsFree ? (
                    <span className="inline-flex items-center gap-1 text-rust">
                      {listening ? (
                        <>
                          <Mic className="size-2.5" /> Listening…
                        </>
                      ) : loading ? (
                        <>
                          <Loader2 className="size-2.5 animate-spin" /> Thinking…
                        </>
                      ) : speaking ? (
                        <>
                          <Volume2 className="size-2.5" /> Speaking…
                        </>
                      ) : (
                        <>
                          <Headset className="size-2.5" /> Conversation on
                        </>
                      )}
                    </span>
                  ) : speaking ? (
                    <button type="button" onClick={stopSpeaking} className="inline-flex items-center gap-1 font-semibold text-rust">
                      <Square className="size-2.5 fill-current" /> Stop speaking
                    </button>
                  ) : listening ? (
                    <span className="inline-flex items-center gap-1 text-rust">
                      <Mic className="size-2.5" /> Listening…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Mic className="size-2.5" />
                      {voiceSupported ? (secureContext ? "Voice ready" : "HTTPS needed") : "Text only"}
                    </span>
                  )}
                </div>
              </div>

              {voiceBlockedReason && (
                <p className="mt-2 rounded border border-line bg-cream/60 px-2.5 py-1.5 text-[0.65rem] leading-relaxed text-ink-muted">
                  {voiceBlockedReason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
