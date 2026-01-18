import { useState } from "react";
import { MessageSquare, Send, Loader2, Sparkles, BookOpen, Image as ImageIcon } from "lucide-react";
import { askQuestion } from "../services/api";
import AnswerCard from "./AnswerCard";

export default function AskQuestion() {
    const [question, setQuestion] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    async function handleAsk() {
        if (!question.trim() && !image) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await askQuestion(question, image);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

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
                                <p className="text-primary-100 text-sm">
                                    Ask via text or upload an image from the PDF
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="p-6 space-y-4">

                        {/* Question */}
                        <textarea
                            rows="4"
                            placeholder="Ask anything about your syllabus..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={handleKeyPress}
                            disabled={loading}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                        />

                        {/* Image Upload */}
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-primary-600 font-medium">
                                <ImageIcon className="w-5 h-5" />
                                Upload Image (optional)
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            {preview && (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-16 h-16 rounded-lg object-cover border"
                                />
                            )}
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                Ctrl + Enter to submit
                            </span>

                            <button
                                onClick={handleAsk}
                                disabled={loading}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold hover:scale-105 transition"
                            >
                                {loading ? "Thinking..." : "Ask"}
                            </button>
                        </div>

                        {/* Result */}
                        {result && !loading && (
                            <div className="mt-6">
                                <AnswerCard data={result} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
