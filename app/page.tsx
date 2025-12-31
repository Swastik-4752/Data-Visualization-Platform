"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import DataVisualization from "@/components/DataVisualization";
import CursorParticles from "@/components/CursorParticles";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { saveAnalysis } from "@/lib/analysisService";
import { Upload, BarChart3, FileText, LogIn, LogOut, User } from "lucide-react";

export default function Home() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { currentUser, signOut } = useAuth();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleAnalysisComplete = async (data: any) => {
    setAnalysisData(data);
    // Don't auto-save anymore - let user decide with Save button
  };

  const handleSave = async () => {
    if (!currentUser || !analysisData?.fileInfo) {
      alert('Please log in to save analyses');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await saveAnalysis(
        currentUser.uid,
        analysisData.fileInfo.name || 'Unknown',
        analysisData.fileInfo.type || 'unknown',
        analysisData.fileInfo.size || 0,
        analysisData
      );
      setSaveMessage('Analysis saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving analysis:', error);
      setSaveMessage('Failed to save analysis. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <main className="min-h-screen bg-black relative">
      <CursorParticles />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Navigation */}
        <div className="flex justify-end items-center gap-3 mb-4">
          {currentUser ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-black transition-all cursor-pointer"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-lg hover:bg-[#b91c1c] transition-all shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-black transition-all shadow-lg hover:shadow-xl"
            >
              <LogIn className="w-5 h-5" />
              <span className="hidden sm:inline">Login / Sign Up</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-12 h-12 text-white" />
            <h1 className="text-5xl md:text-6xl font-display text-white tracking-tight">
              Data Visualization Platform
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-body leading-relaxed">
            Upload PDFs, documents, or datasets to generate comprehensive data analysis and visualizations
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {!analysisData ? (
            <div className="bg-[#171717] rounded-2xl shadow-xl p-8 border border-white/10">
              <FileUpload 
                onAnalysisComplete={handleAnalysisComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#171717] rounded-2xl shadow-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-display text-white tracking-tight">
                    Analysis Results
                  </h2>
                  <button
                    onClick={() => setAnalysisData(null)}
                    className="px-4 py-2 bg-[#252525] text-white rounded-lg hover:bg-black transition-colors"
                  >
                    Upload New File
                  </button>
                </div>
              </div>
              <DataVisualization 
                data={analysisData} 
                onSave={handleSave}
                showSaveButton={!!currentUser}
              />
              {saveMessage && (
                <div className={`mt-4 text-center px-4 py-3 rounded-lg ${
                  saveMessage.includes('success') 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                  {saveMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features Section */}
        {!analysisData && (
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-[#171717] p-6 rounded-xl shadow-lg border border-white/10 hover:scale-105 transition-transform">
              <Upload className="w-10 h-10 text-white mb-4" />
              <h3 className="text-xl font-display mb-2 text-white tracking-tight">
                Multiple Formats
              </h3>
              <p className="text-[#d3d3d3] font-body leading-relaxed">
                Support for PDF, CSV, Excel, and text documents
              </p>
            </div>
            <div className="bg-[#171717] p-6 rounded-xl shadow-lg border border-white/10 hover:scale-105 transition-transform">
              <BarChart3 className="w-10 h-10 text-white mb-4" />
              <h3 className="text-xl font-display mb-2 text-white tracking-tight">
                Rich Visualizations
              </h3>
              <p className="text-[#d3d3d3] font-body leading-relaxed">
                Interactive charts, graphs, and data tables
              </p>
            </div>
            <div className="bg-[#171717] p-6 rounded-xl shadow-lg border border-white/10 hover:scale-105 transition-transform">
              <FileText className="w-10 h-10 text-white mb-4" />
              <h3 className="text-xl font-display mb-2 text-white tracking-tight">
                Smart Analysis
              </h3>
              <p className="text-[#d3d3d3] font-body leading-relaxed">
                Automatic data extraction and statistical insights
              </p>
            </div>
          </div>
        )}
      </div>
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </main>
  );
}

