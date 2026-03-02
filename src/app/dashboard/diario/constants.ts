"use client"

import {
    Heart, Zap, Cloud, Smile, Frown, Meh, Sparkles, TrendingUp
} from "lucide-react"

export const MOODS = [
    { emoji: "😢", label: "Muito triste", value: 1, activeClass: "bg-red-50 border-red-300 text-red-700 shadow-red-100 shadow-sm" },
    { emoji: "😕", label: "Triste", value: 2, activeClass: "bg-orange-50 border-orange-300 text-orange-700 shadow-orange-100 shadow-sm" },
    { emoji: "😐", label: "Neutro", value: 3, activeClass: "bg-yellow-50 border-yellow-300 text-yellow-700 shadow-yellow-100 shadow-sm" },
    { emoji: "🙂", label: "Bem", value: 4, activeClass: "bg-lime-50 border-lime-300 text-lime-700 shadow-lime-100 shadow-sm" },
    { emoji: "😄", label: "Muito bem", value: 5, activeClass: "bg-green-50 border-green-300 text-green-700 shadow-green-100 shadow-sm" },
]

export const EMOTIONS = [
    { icon: Heart, label: "Amor", activeClass: "bg-pink-50 border-pink-300 text-pink-700" },
    { icon: Zap, label: "Ansiedade", activeClass: "bg-amber-50 border-amber-300 text-amber-700" },
    { icon: Cloud, label: "Calma", activeClass: "bg-sky-50 border-sky-300 text-sky-700" },
    { icon: Smile, label: "Alegria", activeClass: "bg-emerald-50 border-emerald-300 text-emerald-700" },
    { icon: Frown, label: "Tristeza", activeClass: "bg-slate-100 border-slate-300 text-slate-700" },
    { icon: Meh, label: "Tédio", activeClass: "bg-violet-50 border-violet-300 text-violet-700" },
    { icon: Sparkles, label: "Gratidão", activeClass: "bg-yellow-50 border-yellow-300 text-yellow-700" },
    { icon: TrendingUp, label: "Motivação", activeClass: "bg-blue-50 border-blue-300 text-blue-700" },
]
