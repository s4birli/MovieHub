import { X } from 'lucide-react';

interface MovieTrailerProps {
    trailerUrl: string | null;
    showTrailer: boolean;
    onShowTrailer: () => void;
    onClose: () => void;
}

const MovieTrailer = ({ trailerUrl, showTrailer, onShowTrailer, onClose }: MovieTrailerProps) => {
    if (!trailerUrl) return null;

    const videoId = trailerUrl.split('v=')[1];

    return (
        <>
            <button
                onClick={onShowTrailer}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm4.146 10.854l-6 6a.5.5 0 01-.854-.354V3.5a.5.5 0 01.854-.354l6 6a.5.5 0 010 .708z" />
                </svg>
                Watch Trailer
            </button>

            {/* Modal */}
            {showTrailer && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                        </div>

                        {/* Modal content */}
                        <div className="relative inline-block w-full max-w-4xl overflow-hidden align-middle transition-all transform bg-black shadow-xl rounded-2xl">
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={onClose}
                                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="relative pt-[56.25%]">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                    title="Movie Trailer"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MovieTrailer; 