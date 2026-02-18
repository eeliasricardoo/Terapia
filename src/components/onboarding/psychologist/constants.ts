
import {
    Brain,
    GraduationCap,
    Scale,
    Smile,
    Users,
    Briefcase,
    Heart,
    Baby,
    Globe,
    Clock,
    Sparkles,
} from "lucide-react"

export const SPECIALTIES = [
    { id: "anxiety", label: "Ansiedade", icon: Brain },
    { id: "depression", label: "Depressão", icon: CloudRain },
    { id: "relationships", label: "Relacionamentos", icon: Heart },
    { id: "career", label: "Carreira", icon: Briefcase },
    { id: "self_esteem", label: "Autoestima", icon: Sparkles },
    { id: "trauma", label: "Trauma", icon: ShieldCheck }, // Changed from ShieldAlert to ShieldCheck as it is more positive
    { id: "grief", label: "Luto", icon: Feather },
    { id: "family", label: "Família", icon: Users },
    { id: "eating_disorders", label: "Transtornos Alimentares", icon: Utensils },
    { id: "addiction", label: "Dependência Química", icon: CigaretteOff }, // Keeping it direct but professional
    { id: "sexual_health", label: "Sexualidade", icon: Flame },
    { id: "child_adolescent", label: "Infância e Adolescência", icon: Baby },
]

// Helper function to import icons that might not be available in lucide-react direct import above
// Or we can just use generic icons. Let's stick to available ones for safety.
import {
    CloudRain,
    ShieldCheck,
    Feather,
    Utensils,
    CigaretteOff,
    Flame,
} from "lucide-react"


export const APPROACHES = [
    { id: "tcc", label: "Terapia Cognitivo-Comportamental (TCC)", description: "Foco em mudar padrões de pensamento e comportamento." },
    { id: "psychoanalysis", label: "Psicanálise", description: "Exploração do inconsciente e experiências passadas." },
    { id: "humanist", label: "Humanista", description: "Foco no potencial humano e autodescoberta." },
    { id: "gestalt", label: "Gestalt-terapia", description: "Ênfase na responsabilidade pessoal e foco no presente." },
    { id: "systemic", label: "Sistêmica", description: "Entende o indivíduo como parte de sistemas (família, trabalho)." },
    { id: "jungian", label: "Analítica (Junguiama)", description: "Integração dos aspectos conscientes e inconscientes." },
    { id: "acp", label: "Abordagem Centrada na Pessoa", description: "Ambiente de apoio para o crescimento pessoal." },
]
