import { useState } from "react";
import { MessageSquare, Send, Loader2, Sparkles, BookOpen } from "lucide-react";
import { askQuestion } from "../services/api";
import ImageSlider from "./ImageSlider";
import AnswerCard from "./AnswerCard";


// Simulated API call - replace with your actual import
// const askQuestion = async (question) => {
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     return {
//         answer: "This is a sample answer to your question. The actual response will come from your API.",
//         sources: ["Page 3", "Page 7"],
//         confidence: 0.95
//     };
// };

// Simulated AnswerCard - replace with your actual component
// const AnswerCard = ({ data }) => (
//     <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 border border-primary-100 animate-fade-in">
//         <div className="flex items-start gap-3 mb-4">
//             <div className="p-2 bg-primary-100 rounded-lg">
//                 <Sparkles className="w-5 h-5 text-primary-600" />
//             </div>
//             <div>
//                 <h3 className="font-semibold text-gray-800 mb-1">Answer</h3>
//                 <p className="text-sm text-gray-600">Based on your syllabus</p>
//             </div>
//         </div>

//         <p className="text-gray-700 leading-relaxed mb-4">{data.answer}</p>

//         {data.sources && data.sources.length > 0 && (
//             <div className="flex flex-wrap gap-2 pt-4 border-t border-primary-200">
//                 <span className="text-sm text-gray-600 font-medium">Sources:</span>
//                 {data.sources.map((source, idx) => (
//                     <span
//                         key={idx}
//                         className="px-3 py-1 bg-white rounded-full text-sm text-primary-700 border border-primary-200"
//                     >
//                         {source}
//                     </span>
//                 ))}
//             </div>
//         )}
//     </div>
// );

export default function AskQuestion() {
    const [question, setQuestion] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    async function handleAsk() {
        if (!question.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await askQuestion(question);
            setResult(res);
        } catch (error) {
            console.error(error);
            setResult({
                answer: "Failed to fetch answer from server.",
                confidence: 0,
                sources: [],
            });
        } finally {
            setLoading(false);
        }
    }


    const handleKeyPress = (e) => {
        if (e.key === "Enter" && e.ctrlKey) {
            handleAsk();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <div className="bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-6 text-white">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-8 h-8" />
                            <div>
                                <h2 className="text-2xl font-bold">Ask a Question</h2>
                                <p className="text-primary-100 text-sm">Get instant answers from your syllabus</p>
                            </div>
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="p-6">
                        <div className={`relative transition-all duration-300 ${isFocused ? "transform scale-[1.01]" : ""
                            }`}>
                            <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl opacity-0 blur transition-opacity duration-300 ${isFocused ? "opacity-30" : ""
                                }`}></div>

                            <div className="relative">
                                <textarea
                                    rows="4"
                                    placeholder="Ask anything about your syllabus..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    onKeyDown={handleKeyPress}
                                    disabled={loading}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none text-gray-800 placeholder-gray-400 transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                />

                                {/* Character count */}
                                <div className="absolute bottom-3 left-4 text-xs text-gray-400">
                                    {question.length} characters
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <BookOpen className="w-4 h-4" />
                                <span>Press Ctrl+Enter to ask</span>
                            </div>

                            <button
                                onClick={handleAsk}
                                disabled={!question.trim() || loading}
                                className={`group relative px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${loading
                                        ? "bg-gray-400"
                                        : "bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 hover:shadow-lg hover:scale-105 active:scale-95"
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Thinking...
                                        </>
                                    ) : (
                                        <>
                                            <span>Ask</span>
                                            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>

                        {/* Suggestions */}
                        {!result && !loading && question.length === 0 && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary-600" />
                                    Try asking:
                                </h3>
                                <div className="space-y-2">
                                    {[
                                        "What are the main topics covered in this course?",
                                        "Explain the grading criteria",
                                        "What are the prerequisite requirements?",
                                    ].map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setQuestion(suggestion)}
                                            className="w-full text-left px-4 py-2 bg-white hover:bg-primary-50 rounded-lg text-sm text-gray-700 hover:text-primary-700 transition-all duration-200 border border-transparent hover:border-primary-200"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="mt-6 p-8 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-100">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
                                        <div className="w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                                    </div>
                                    <p className="text-gray-600 font-medium">Analyzing your question...</p>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Result */}
                        {result && !loading && (
                            <div className="mt-6 animate-slide-up">
                                <AnswerCard data={result} />
                            </div>
                        )}

                        {/* {result?.images?.length > 0 && (
                            <div className="mt-6">
                                <ImageSlider images={result.images} />
                            </div>
                        )} */}
                    </div>
                </div>

                {/* Info Footer */}
                <div className="mt-4 text-center text-sm text-gray-500">
                    Powered by AI • Answers generated from your syllabus
                </div>
            </div>
        </div>
    );
}