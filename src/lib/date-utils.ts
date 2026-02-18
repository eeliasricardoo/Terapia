
export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

/**
 * Formata uma data para exibição no fuso horário especificado.
 * Usa Intl.DateTimeFormat.
 */
export function formatInTimeZone(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
    try {
        return new Intl.DateTimeFormat('pt-BR', {
            timeZone,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch (error) {
        console.error(`Error formatting date in timezone ${timeZone}:`, error);
        return date.toLocaleString('pt-BR');
    }
}

/**
 * Retorna o offset do fuso horário (ex: GMT-03:00)
 */
export function getTimeZoneLabel(timeZone: string = DEFAULT_TIMEZONE): string {
    try {
        const date = new Date();
        // Obtém o nome curto ou offset, ex: "Brasilia Standard Time" ou "GMT-3"
        // Opcionalmente podemos pegar apenas o offset
        return new Intl.DateTimeFormat('pt-BR', {
            timeZone,
            timeZoneName: 'longOffset'
        }).formatToParts(date).find(p => p.type === 'timeZoneName')?.value || timeZone;
    } catch (e) {
        return timeZone;
    }
}
