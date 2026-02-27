"use client"

import { CoreHeartIcon, CoreVideoIcon, CoreShieldIcon } from "@/components/ui/exclusive-icons"
import { motion, Variants } from "framer-motion"

const fadeIn: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

export function Features() {
    return (
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white to-[#FFFAF3] relative overflow-hidden">
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-8 lg:grid-cols-3"
                >
                    <motion.div variants={fadeIn} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                            <CoreHeartIcon className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Conexão Genuína</h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Ajudamos você a encontrar o profissional certo não apenas através de técnicas, mas por afinidade e verdadeiro respeito à sua história.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeIn} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                            <CoreVideoIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Sessões Humanizadas</h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Vídeo-chamadas de altíssima qualidade direto do seu navegador, construídas para que você sinta o calor do acolhimento mesmo à distância.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeIn} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300">
                            <CoreShieldIcon className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Seu Espaço Seguro</h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Respeito absoluto à sua intimidade. Criptografia de ponta a ponta e anonimato garantido para você falar sobre o que realmente importa.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
