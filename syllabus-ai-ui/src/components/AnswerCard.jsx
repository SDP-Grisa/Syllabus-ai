import { CheckCircle, FileText, TrendingUp, Copy, Check } from "lucide-react";
import { useState } from "react";

/* ---------- Answer Formatting ---------- */
function formatAnswer(text) {
    console.log("check in");
    
    if (!text) return [];

    console.log("text : ",text);
    

    // Split by bullet points (•) or dashes followed by space
    const parts = text.split(/(?=•\s)|(?=-\s)/);

    return parts
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
            // Check if it's a bullet point
            if (part.startsWith("•") || part.startsWith("-")) {
                return {
                    type: "bullet",
                    value: part.replace(/^[•-]\s*/, "").trim()
                };
            }
            // Otherwise it's a paragraph
            return { type: "paragraph", value: part };
        });
}

/* ---------- Tailwind-safe confidence styles ---------- */
const CONFIDENCE_STYLES = {
    success: { text: "text-success-600", bar: "from-success-500 to-success-600", bg: "from-success-500 to-success-600" },
    warning: { text: "text-warning-600", bar: "from-warning-500 to-warning-600", bg: "from-warning-500 to-warning-600" },
    error: { text: "text-error-600", bar: "from-error-500 to-error-600", bg: "from-error-500 to-error-600" }
};

export default function AnswerCard({ data }) {
    console.log("check out");
    
    const [copied, setCopied] = useState(false);
    const formatted = formatAnswer(data?.answer || "");

    console.log("formatted : ",formatted);
    

    const confidence = data?.confidence ?? 0.75;
    const confidencePercentage = Math.round(confidence * 100);
    const confidenceColor = confidence >= 0.8 ? "success" : confidence >= 0.6 ? "warning" : "error";
    const confidenceLabel = confidence >= 0.8 ? "High" : confidence >= 0.6 ? "Medium" : "Low";
    const styles = CONFIDENCE_STYLES[confidenceColor];

    const handleCopy = () => {
        navigator.clipboard.writeText(data.answer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-primary-100 overflow-hidden animate-scale-in">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${styles.bg} p-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Answer</h3>
                            <p className="text-white/80 text-sm">From your syllabus</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-200 group"
                        title="Copy answer"
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-white" />
                        ) : (
                            <Copy className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                        )}
                    </button>
                </div>
            </div>

            {/* Answer Content */}
            <div className="p-6">
                <div className="relative">
                    {/* Decorative element */}
                    <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-primary-400 to-accent-400 rounded-full"></div>

                    <div className="pl-4">
                        <ul className="list-round">
                            {formatted.map((item, idx) => (
                                item.type === "bullet" ? (
                                    <li key={idx} className="mb-4 flex gap-3">
                                        <span className="text-primary-600 font-bold flex-shrink-0">•</span>
                                        <span className="text-gray-800 text-base leading-relaxed flex-1">
                                            {item.value}
                                        </span>
                                    </li>
                                ) : (
                                    <p key={idx} className="text-gray-800 text-base leading-relaxed mb-4">
                                        {item.value}
                                    </p>
                                )
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Metadata Section */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    {/* Confidence Score */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className={`w-4 h-4 ${styles.text}`} />
                                <span className="text-sm font-semibold text-gray-700">
                                    Confidence Score
                                </span>
                            </div>
                            <span className={`text-sm font-bold ${styles.text}`}>
                                {confidenceLabel} ({confidencePercentage}%)
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${styles.bar} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${confidencePercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Source Pages */}
                    {data?.sources && data.sources.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                    Source Pages
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {data.sources.map((source, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 rounded-lg border border-primary-200 transition-all duration-200 cursor-pointer"
                                    >
                                        <span className="text-xs font-medium text-primary-700">
                                            {source}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border border-primary-100">
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                        This answer was generated from your uploaded syllabus content
                    </p>
                </div>
            </div>

            {/* Bottom accent */}
            <div className="h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"></div>
        </div>
    );
}