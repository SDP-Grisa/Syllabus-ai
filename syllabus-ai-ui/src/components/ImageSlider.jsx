import { ChevronLeft, ChevronRight, Image } from "lucide-react";
import { useState } from "react";

export default function ImageSlider({ images = [] }) {
    const [index, setIndex] = useState(0);

    if (!images.length) return null;

    return (
        <div className="relative bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-200 p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Image className="w-4 h-4 text-primary-600" />
                    Extracted Slides
                </h3>
                <span className="text-xs text-gray-500">
                    {index + 1} / {images.length}
                </span>
            </div>

            <div className="relative overflow-hidden rounded-lg">
                <img
                    src={images[index]}
                    alt="Extracted"
                    className="w-full h-[400px] object-contain bg-white"
                />

                {/* Controls */}
                <button
                    onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                    disabled={index === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow disabled:opacity-40"
                >
                    <ChevronLeft />
                </button>

                <button
                    onClick={() => setIndex((i) => Math.min(i + 1, images.length - 1))}
                    disabled={index === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow disabled:opacity-40"
                >
                    <ChevronRight />
                </button>
            </div>
        </div>
    );
}
