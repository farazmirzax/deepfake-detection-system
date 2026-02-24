import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle2 } from 'lucide-react';

// --- SCAN PIPELINE STEPS ---
const SCAN_STEPS = [
  { id: 0, label: "INITIALIZING PRISM ENGINE",       duration: 1200, color: "#00f3ff" },
  { id: 1, label: "VIGILANTE-V2: FACE SWAP SCAN",    duration: 1800, color: "#facc15" },
  { id: 2, label: "SENTINEL-X: AI GENERATION SCAN",  duration: 1800, color: "#c084fc" },
  { id: 3, label: "PRISM: METADATA EXTRACTION",      duration: 1000, color: "#93c5fd" },
  { id: 4, label: "PRISM: ERROR LEVEL ANALYSIS",     duration: 1200, color: "#fb923c" },
  { id: 5, label: "PRISM: FACE GEOMETRY MAPPING",    duration: 1000, color: "#f472b6" },
  { id: 6, label: "COMPILING FORENSIC VERDICT",      duration: 800,  color: "#00f3ff" },
];

interface ForensicScannerProps {
  imageUrl: string | null;
}

export default function ForensicScanner({ imageUrl }: ForensicScannerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);

  // --- STEP PROGRESSION ---
  useEffect(() => {
    if (currentStep >= SCAN_STEPS.length) return;
    const step = SCAN_STEPS[currentStep];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, step.duration);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // --- SMOOTH PROGRESS BAR ---
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent(prev => {
        const target = ((completedSteps.length + 0.5) / SCAN_STEPS.length) * 100;
        if (prev >= 95) return 95;
        return Math.min(prev + 0.8, target);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [completedSteps]);

  const activeStep = currentStep < SCAN_STEPS.length ? SCAN_STEPS[currentStep] : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">

      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,243,255,0.08)_25%,rgba(0,243,255,0.08)_26%,transparent_27%,transparent_74%,rgba(0,243,255,0.08)_75%,rgba(0,243,255,0.08)_76%,transparent_77%)] bg-[length:60px_60px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(0,243,255,0.08)_25%,rgba(0,243,255,0.08)_26%,transparent_27%,transparent_74%,rgba(0,243,255,0.08)_75%,rgba(0,243,255,0.08)_76%,transparent_77%)] bg-[length:60px_60px]" />
      </div>

      {/* LAYOUT: Image Left, Steps Right */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-6 max-w-5xl w-full">

        {/* === LEFT SIDE: IMAGE BEING SCANNED === */}
        <div className="relative flex-shrink-0">
          
          {/* Image Container with scanning effects */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80">
            
            {/* The actual uploaded image */}
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Scanning" 
                className="w-full h-full object-cover rounded-lg"
                style={{ filter: 'grayscale(30%) contrast(1.1)' }}
              />
            )}

            {/* SCAN LINE sweeping vertically over the image */}
            <motion.div
              className="absolute left-0 right-0 h-1 z-20"
              style={{
                background: 'linear-gradient(180deg, transparent, rgba(0,243,255,0.8), rgba(0,243,255,0.3), transparent)',
                boxShadow: '0 0 30px 10px rgba(0,243,255,0.3)',
              }}
              animate={{ top: ['-4px', '100%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />

            {/* Corner brackets - Top Left */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-neon z-10" />
            {/* Top Right */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-neon z-10" />
            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-neon z-10" />
            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-neon z-10" />

            {/* Pulsing border glow */}
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-cyber-neon/50 z-10 pointer-events-none"
              animate={{ 
                borderColor: ['rgba(0,243,255,0.3)', 'rgba(0,243,255,0.7)', 'rgba(0,243,255,0.3)'],
                boxShadow: [
                  '0 0 10px rgba(0,243,255,0.1)', 
                  '0 0 25px rgba(0,243,255,0.3)', 
                  '0 0 10px rgba(0,243,255,0.1)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Dark overlay that pulses */}
            <motion.div
              className="absolute inset-0 bg-black/40 rounded-lg z-[5] pointer-events-none"
              animate={{ opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Active step label on the image */}
            {activeStep && (
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-3 left-3 right-3 z-30 bg-black/80 backdrop-blur-sm rounded-md px-3 py-2 border border-gray-700"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activeStep.color }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <span className="text-[11px] font-mono tracking-wider" style={{ color: activeStep.color }}>
                    {activeStep.label}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* SUBJECT ID below image */}
          <div className="mt-3 text-center">
            <span className="text-[10px] font-mono text-gray-600 tracking-[0.3em]">SUBJECT // IMAGE-001</span>
          </div>
        </div>

        {/* === RIGHT SIDE: PROGRESS + TERMINAL === */}
        <div className="flex-1 w-full max-w-sm">

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-5"
          >
            <h3 className="text-cyber-neon font-bold text-lg tracking-[0.2em] mb-1 font-mono">DEEP FORENSIC SCAN</h3>
            <p className="text-gray-600 text-[11px] tracking-widest font-mono">MULTI-LAYER ANALYSIS IN PROGRESS</p>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-900 rounded-full h-1.5 mb-5 border border-gray-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #00f3ff, #a855f7, #00f3ff)',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step List */}
          <div className="space-y-1 mb-5">
            {SCAN_STEPS.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === step.id;
              const isPending = !isCompleted && !isActive;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.id * 0.06 }}
                  className={`flex items-center gap-2.5 px-2 py-1 rounded font-mono transition-all duration-300 ${
                    isActive ? 'bg-white/[0.03]' : ''
                  } ${isPending ? 'opacity-25' : ''}`}
                >
                  {/* Icon */}
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    {isCompleted ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                        <CheckCircle2 size={13} className="text-cyber-safe" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: step.color }}
                        animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`tracking-wider text-[11px] ${
                    isCompleted ? 'text-gray-500 line-through' : 
                    isActive ? 'font-semibold' : 'text-gray-700'
                  }`} style={isActive ? { color: step.color } : {}}>
                    {step.label}
                  </span>

                  {isActive && (
                    <motion.span
                      className="ml-auto text-[10px]"
                      style={{ color: step.color }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ●●●
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Mini Terminal */}
          <div className="bg-black/60 border border-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-[9px] text-gray-600 tracking-widest mb-2 uppercase font-mono">
              <Terminal size={9} /> Live Output
            </div>
            <div className="space-y-0.5">
              <AnimatePresence>
                {completedSteps.map((stepId) => (
                  <motion.div
                    key={`done-${stepId}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-mono text-gray-600"
                  >
                    <span className="text-cyber-safe/60">✓</span> {SCAN_STEPS[stepId].label}
                  </motion.div>
                ))}
              </AnimatePresence>
              {activeStep && (
                <motion.div
                  key={`active-${activeStep.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-mono"
                  style={{ color: activeStep.color }}
                >
                  {'>'} {activeStep.label}...
                </motion.div>
              )}
            </div>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-cyber-neon text-[10px] font-mono"
            >
              █
            </motion.span>
          </div>

        </div>
      </div>
    </div>
  );
}
