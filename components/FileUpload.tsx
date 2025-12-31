"use client";

import { useState, useCallback } from "react";
import { Upload, File, X, Loader2 } from "lucide-react";
import AnalyzingLoader from "./AnalyzingLoader";

interface FileUploadProps {
  onAnalysisComplete: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function FileUpload({ onAnalysisComplete, isLoading, setIsLoading }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    const validTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload a valid file (PDF, CSV, Excel, Word, or Text)');
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
  };

  const uploadAndAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      onAnalysisComplete(data);
    } catch (error: any) {
      console.error('Error analyzing file:', error);
      const errorMessage = error.message || 'Failed to analyze file. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {isLoading ? (
        // Show animated loader when analyzing
        <div className="relative border-2 border-dashed rounded-xl p-12 bg-[#171717] border-white/20">
          <div className="flex items-center justify-center min-h-[300px]">
            <AnalyzingLoader />
          </div>
        </div>
      ) : (
        <>
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 transition-colors ${
              dragActive
                ? 'border-white/40 bg-[#252525]'
                : 'border-white/20 bg-[#171717]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf,.csv,.xlsx,.xls,.txt,.doc,.docx"
              disabled={isLoading}
            />
            
            {!file ? (
              <div className="text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-white/60" />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-block"
                >
                  <span className="text-lg font-display font-semibold text-white hover:text-white/80 tracking-tight">
                    Click to upload
                  </span>
                  <span className="text-white/70 font-body"> or drag and drop</span>
                </label>
                <p className="mt-2 text-sm text-white/50 font-body">
                  PDF, CSV, Excel, Word, or Text files
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <File className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={uploadAndAnalyze}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Analyze & Visualize
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

