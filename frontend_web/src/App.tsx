import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, Link, AlertTriangle, CheckCircle, Loader2, ScanLine, Terminal } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface AnalysisResult {
  verdict: 'REAL' | 'FAKE' | 'ERROR';
  confidence_score: string;
  analysis: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [url, setUrl] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- 1. HANDLE IMAGE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const selectedFile = files[0];

    // Reset UI
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post<AnalysisResult>('http://127.0.0.1:8000/scan-image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("SERVER ERROR: Ensure 'main.py' is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE VIDEO LINK ---
  const handleVideoScan = async () => {
    if (!url) return;
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post<AnalysisResult>('http://127.0.0.1:8000/scan-video/', { url });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("AGENT ERROR: Could not fetch video. Check URL or Backend.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. FORENSIC LOG FORMATTER (The "CSI" Magic) ---
  const formatAnalysisLine = (line: string, index: number) => {
    // Remove backend bullet points so we can style it ourselves
    const cleanLine = line.replace('•', '').trim();
    if (!cleanLine) return null;

    // Smart color coding based on keywords
    let colorClass = "text-gray-300"; // Default
    if (cleanLine.includes("CRITICAL") || cleanLine.includes("⚠️")) {
      colorClass = "text-red-400 font-semibold";
    } else if (cleanLine.includes("CLEAN")) {
      colorClass = "text-green-400 font-semibold";
    } else if (cleanLine.includes("Metadata")) {
      colorClass = "text-blue-300";
    } else if (cleanLine.includes("Geometry")) {
      colorClass = "text-purple-300";
    } else if (cleanLine.includes("FORENSIC FLAG")) {
      colorClass = "text-orange-400";
    }

    return (
      <motion.div 
        key={index}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.15 + 0.2 }} // Staggered terminal effect
        className={`flex items-start text-sm font-mono mb-2 ${colorClass}`}
      >
        <span className="text-cyber-neon mr-3 shrink-0 mt-0.5">{'>'}</span>
        <span className="leading-relaxed">{cleanLine}</span>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white p-8 font-mono flex flex-col items-center relative overflow-hidden">
      
      {/* BACKGROUND GRID EFFECT */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-2">
          <Shield className="w-12 h-12 text-cyber-neon animate-pulse-fast" />
          <h1 className="text-5xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon via-white to-purple-500 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            DEEPFAKE DETECTIVE
          </h1>
        </div>
        <div className="flex items-center justify-center gap-2 text-cyber-neon/60 text-sm tracking-[0.3em]">
          <Terminal size={14} />
          <span>SYSTEM ONLINE // AGENT V2.0</span>
        </div>
      </motion.div>

      {/* MAIN INTERFACE CARD */}
      <div className="w-full max-w-3xl bg-cyber-dark/80 border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-cyber-neon/5 backdrop-blur-md z-10 relative">
        
        {/* TABS SWITCHER */}
        <div className="flex gap-4 mb-8 bg-cyber-black p-2 rounded-xl border border-gray-800">
          <button 
            onClick={() => { setActiveTab('image'); setResult(null); setError(null); }}
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${activeTab === 'image' ? 'bg-cyber-neon text-black font-bold shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Upload size={20} /> IMAGE ANALYSIS
          </button>
          <button 
            onClick={() => { setActiveTab('video'); setResult(null); setError(null); }}
            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${activeTab === 'video' ? 'bg-cyber-neon text-black font-bold shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Link size={20} /> VIDEO LINK AGENT
          </button>
        </div>

        {/* INPUT ZONE */}
        <div className="min-h-[250px] flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl bg-black/40 relative overflow-hidden transition-colors hover:border-cyber-neon/50 group">
          
          {loading && (
            <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
              <Loader2 className="w-16 h-16 text-cyber-neon animate-spin mb-6" />
              <p className="text-cyber-neon font-bold tracking-widest animate-pulse">EXTRACTING FORENSICS...</p>
              <p className="text-xs text-gray-500 mt-2">Running ELA & Metadata Scans...</p>
            </div>
          )}

          {activeTab === 'image' ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              {preview ? (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="relative group w-full flex justify-center">
                    <img src={preview} alt="Upload" className="max-h-64 rounded-lg shadow-lg border border-gray-600 group-hover:border-cyber-neon transition-all" />
                    <div className="absolute bottom-4 bg-black/70 px-4 py-1 rounded-full text-xs text-white backdrop-blur-md border border-white/10">PREVIEW</div>
                  </div>
                  <button
                    onClick={() => {
                      setPreview(null);
                      setResult(null);
                      setError(null);
                    }}
                    className="px-6 py-2 bg-gray-800 hover:bg-cyber-neon hover:text-black text-white rounded-lg border border-gray-600 font-bold tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2"
                  >
                    <Upload size={16} /> UPLOAD ANOTHER IMAGE
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center group-hover:scale-105 transition-transform duration-300">
                  <div className="w-20 h-20 bg-cyber-gray rounded-full flex items-center justify-center mb-6 group-hover:bg-cyber-neon/20 transition-colors">
                    <Upload className="w-10 h-10 text-gray-400 group-hover:text-cyber-neon" />
                  </div>
                  <span className="text-gray-300 text-lg font-medium">Click to Upload Evidence</span>
                  <span className="text-gray-600 text-sm mt-2">Supports JPG, PNG, WEBP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          ) : (
            <div className="w-full p-12 flex flex-col gap-6">
              <div className="relative">
                <Link className="absolute left-4 top-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Paste YouTube / Instagram / TikTok Link..." 
                  className="w-full bg-cyber-black border border-gray-700 pl-12 pr-4 py-4 rounded-xl focus:border-cyber-neon focus:ring-1 focus:ring-cyber-neon focus:outline-none text-white placeholder-gray-600 transition-all"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button 
                onClick={handleVideoScan}
                disabled={!url}
                className="w-full bg-cyber-gray hover:bg-cyber-neon hover:text-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white py-4 rounded-xl border border-gray-600 font-bold tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-lg"
              >
                <ScanLine size={20} /> INITIALIZE AGENT SCAN
              </button>
            </div>
          )}
        </div>

        {/* ERROR MESSAGE */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3"
            >
              <AlertTriangle className="shrink-0" /> 
              <span className="font-mono text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULT SECTION */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-8 overflow-hidden rounded-2xl border-2 ${result.verdict === 'FAKE' ? 'bg-red-950/30 border-cyber-danger shadow-[0_0_30px_rgba(255,0,60,0.2)]' : 'bg-green-950/30 border-cyber-safe shadow-[0_0_30px_rgba(0,255,159,0.2)]'}`}
            >
              {/* Result Header */}
              <div className={`p-6 flex items-center justify-between ${result.verdict === 'FAKE' ? 'bg-cyber-danger/10' : 'bg-cyber-safe/10'}`}>
                <div className="flex items-center gap-4">
                  {result.verdict === 'FAKE' ? <AlertTriangle className="text-cyber-danger w-10 h-10" /> : <CheckCircle className="text-cyber-safe w-10 h-10" />}
                  <div>
                    <h2 className={`text-3xl font-bold tracking-tighter ${result.verdict === 'FAKE' ? 'text-cyber-danger' : 'text-cyber-safe'}`}>
                      {result.verdict === 'FAKE' ? 'DETECTED: DEEPFAKE' : 'VERIFIED: REAL'}
                    </h2>
                    <p className="text-white/60 text-xs tracking-widest uppercase">Forensic Analysis Complete</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/50 mb-1">CONFIDENCE SCORE</div>
                  <div className={`text-4xl font-mono font-bold ${result.verdict === 'FAKE' ? 'text-cyber-danger' : 'text-cyber-safe'}`}>{result.confidence_score}</div>
                </div>
              </div>
              
              {/* NEW FORENSIC TERMINAL LOG */}
              <div className="bg-black/60 p-6 border-t border-white/5">
                <div className="flex gap-2 mb-4 text-cyber-neon/80 text-xs font-bold tracking-widest uppercase border-b border-white/10 pb-2">
                  <Terminal size={14} /> FORENSIC DIAGNOSTICS LOG
                </div>
                
                {/* Parse and render the multi-line backend string */}
                <div className="flex flex-col">
                  {result.analysis.split('\n').map((line, idx) => formatAnalysisLine(line, idx))}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* FOOTER */}
      <div className="mt-12 text-gray-600 text-xs font-mono">
        SECURE CONNECTION // ENCRYPTED // PORT 8000
      </div>
    </div>
  );
}

export default App;