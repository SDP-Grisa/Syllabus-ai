import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { uploadPDF } from "../services/api";
import ImageSlider from "./ImageSlider";


// Simulated API call - replace with your actual import
// const uploadPDF = async (file) => {
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     return { status: "success" };
// };

export default function UploadPDF() {
    const [status, setStatus] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [images, setImages] = useState()

    async function handleUpload(file) {
        if (!file || file.type !== "application/pdf") {
            setStatus("Please select a valid PDF file");
            return;
        }

        setFileName(file.name);
        setStatus("Uploading & processing...");
        setIsUploading(true);
        setUploadSuccess(false);

        try {
            const res = await uploadPDF(file);
            console.log(res);
            
            setStatus(res.status || "Uploaded successfully");
            setImages(res.images)
            setUploadSuccess(true);
            setIsUploading(false);
        } catch (error) {
            setStatus("Upload failed. Please try again.");
            setIsUploading(false);
            setUploadSuccess(false);
        }
    }

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) handleUpload(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <div className="bg-white rounded-2xl shadow-xl border border-primary-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-6 text-white">
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8" />
                            <div>
                                <h2 className="text-2xl font-bold">Upload Syllabus</h2>
                                <p className="text-primary-100 text-sm">Upload your PDF file to get started</p>
                            </div>
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div className="p-6">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${isDragging
                                    ? "border-primary-500 bg-primary-50 scale-105"
                                    : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
                                }`}
                        >
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileInput}
                                disabled={isUploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                id="pdf-upload"
                            />

                            <div className="flex flex-col items-center justify-center text-center space-y-4">
                                <div className={`p-4 rounded-full transition-all duration-300 ${isDragging ? "bg-primary-100" : "bg-gray-100"
                                    }`}>
                                    <Upload className={`w-12 h-12 transition-colors duration-300 ${isDragging ? "text-primary-600" : "text-gray-400"
                                        }`} />
                                </div>

                                <div>
                                    <p className="text-lg font-semibold text-gray-700">
                                        {isDragging ? "Drop your PDF here" : "Drag & drop your PDF"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        or{" "}
                                        <label htmlFor="pdf-upload" className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer underline">
                                            browse files
                                        </label>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <FileText className="w-4 h-4" />
                                    <span>PDF files only</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {status && (
                            <div className={`mt-6 p-4 rounded-lg border transition-all duration-500 ${isUploading
                                    ? "bg-blue-50 border-blue-200"
                                    : uploadSuccess
                                        ? "bg-success-50 border-success-200"
                                        : "bg-error-50 border-error-200"
                                }`}>
                                <div className="flex items-center gap-3">
                                    {isUploading && (
                                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                    )}
                                    {uploadSuccess && (
                                        <CheckCircle className="w-5 h-5 text-success-600" />
                                    )}
                                    {!isUploading && !uploadSuccess && status.includes("failed") && (
                                        <AlertCircle className="w-5 h-5 text-error-600" />
                                    )}

                                    <div className="flex-1">
                                        <p className={`font-medium ${isUploading
                                                ? "text-blue-800"
                                                : uploadSuccess
                                                    ? "text-success-800"
                                                    : "text-error-800"
                                            }`}>
                                            {status}
                                        </p>
                                        {fileName && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                File: {fileName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {uploadSuccess && images.length > 0 && (
                                    <ImageSlider images={images} />
                                )}


                                {/* Progress bar for uploading */}
                                {isUploading && (
                                    <div className="mt-3 w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                        <div className="h-full bg-blue-600 animate-pulse" style={{ width: "70%" }}></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border border-primary-100">
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                                Supported Format
                            </h3>
                            <p className="text-sm text-gray-600">
                                Upload your syllabus in PDF format. The file will be processed automatically to extract key information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}