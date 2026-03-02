"use client"

interface PresentationVideoProps {
    videoUrl: string | null
}

export function PresentationVideo({ videoUrl }: PresentationVideoProps) {
    if (!videoUrl) return null

    const getEmbedUrl = (url: string | null) => {
        if (!url) return null;
        try {
            if (url.includes('youtube.com/watch')) {
                const urlObj = new URL(url);
                const videoId = urlObj.searchParams.get('v');
                return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
            }
            if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1].split('?')[0];
                return `https://www.youtube.com/embed/${videoId}`;
            }
            if (url.includes('vimeo.com/')) {
                const videoId = url.split('vimeo.com/')[1].split('?')[0];
                return `https://player.vimeo.com/video/${videoId}`;
            }
        } catch (e) { /* ignore */ }
        return url;
    }

    const embedUrl = getEmbedUrl(videoUrl)

    return (
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Apresentação</h2>
            <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                <iframe
                    src={embedUrl || ''}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </section>
    )
}
