"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUserAnalyses, AnalysisHistory } from "@/lib/analysisService";
import DataVisualization from "@/components/DataVisualization";
import { ArrowLeft, FileText, Calendar, HardDrive, X, Loader2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";

export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      loadAnalyses();
    }
  }, [currentUser, authLoading, router]);

  const loadAnalyses = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError("");
    try {
      const userAnalyses = await getUserAnalyses(currentUser.uid);
      setAnalyses(userAnalyses);
    } catch (err: any) {
      setError(err.message || 'Failed to load analyses');
      console.error('Error loading analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | Timestamp) => {
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (selectedAnalysis) {
    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="flex items-center gap-2 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Profile
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-black transition-colors"
            >
              Home
            </Link>
          </div>

          <div className="bg-[#171717] rounded-2xl shadow-xl p-6 border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-display text-white mb-2">
                  {selectedAnalysis.fileName}
                </h2>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedAnalysis.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-4 h-4" />
                    {formatFileSize(selectedAnalysis.fileSize)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="p-2 hover:bg-[#252525] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <DataVisualization 
            data={selectedAnalysis.analysisData} 
            showSaveButton={false}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-black transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="bg-[#171717] rounded-2xl shadow-xl p-8 border border-white/10 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {currentUser?.displayName?.[0]?.toUpperCase() || 
               currentUser?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-display text-white mb-1">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-white/70">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#171717] rounded-2xl shadow-xl p-8 border border-white/10">
          <h2 className="text-2xl font-display text-white mb-6">Analysis History</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg mb-2">No analyses yet</p>
              <p className="text-white/50 mb-6">Upload and analyze files to see them here</p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Upload File
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {analyses.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => setSelectedAnalysis(analysis)}
                  className="text-left bg-[#252525] hover:bg-[#2a2a2a] rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-display text-white group-hover:text-blue-400 transition-colors">
                          {analysis.fileName}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-white/60 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(analysis.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-4 h-4" />
                          {formatFileSize(analysis.fileSize)}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          {analysis.fileType}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-white/40 group-hover:text-white/60 transition-colors">
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

