import { GraduationCap } from "lucide-react";
import UploadPDF from "./UploadPDF";
import AskQuestion from "./AskQuestion";

export default function HomePage() {
    return (
        <section className="min-h-screen w-[100%] bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center">
            <div className="w-full mx-auto px-6 lg:px-8">

                {/* Hero */}
                <div className="text-center animate-fade-in">
                    <div className="flex justify-center mb-3">
                        <div className="p-4 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-lg">
                            <GraduationCap className="w-14 h-14 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                        Multi-Modal Syllabus AI
                    </h1>

                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        Upload your syllabus and instantly get accurate,
                        AI-powered answers with source references.
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                    <div className="animate-slide-in-left">
                        <UploadPDF />
                    </div>

                    <div className="animate-slide-in-right">
                        <AskQuestion />
                    </div>
                </div>

            </div>
        </section>
    );
}
