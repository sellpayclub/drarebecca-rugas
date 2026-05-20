import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ChevronRight, AlertCircle, Sparkles, Play, RefreshCw, Upload } from 'lucide-react';
import { cn } from './lib/utils';
import { transformImage } from './lib/fal';

type FunnelPhase = 
  | 'video_intro' 
  | 'capture' 
  | 'analyzing' 
  | 'aged_result' 
  | 'processing_treatment' 
  | 'treated_result' 
  | 'final_comparison';

const FACING_MODES = {
  USER: "user",
  ENVIRONMENT: "environment"
};

// VSL Player Component memoized to prevent restarts on parent state changes (button appearing)
const VSLPlayer = React.memo(() => (
  <div className="w-full">
    <div dangerouslySetInnerHTML={{ __html: `
      <div id="ifr_6a089158b6147a0d495dfff8_wrapper" style="margin: 0 auto; width: 100%; ">
        <div style="position: relative; padding: 56.25% 0 0 0;" id="ifr_6a089158b6147a0d495dfff8_aspect">
          <iframe frameborder="0" allowfullscreen src="about:blank" id="ifr_6a089158b6147a0d495dfff8" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" referrerpolicy="origin" onload="this.onload=null, this.src='https://scripts.converteai.net/ceaefeeb-feef-4b52-8911-9ec9de0d5b6b/players/6a089158b6147a0d495dfff8/v4/embed.html' +(location.search||'?') +'&vl=' +encodeURIComponent(location.href)"></iframe>
        </div>
      </div>
    `}} />
  </div>
));

// Final VSL Player Component for the result page
const FinalVSLPlayer = React.memo(() => (
  <div className="w-full">
    <div dangerouslySetInnerHTML={{ __html: `
      <div id="ifr_6a0df0a7af60d3892ccac112_wrapper" style="margin: 0 auto; width: 100%; ">
        <div style="position: relative; padding: 56.25% 0 0 0;" id="ifr_6a0df0a7af60d3892ccac112_aspect">
          <iframe frameborder="0" allowfullscreen src="about:blank" id="ifr_6a0df0a7af60d3892ccac112" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" referrerpolicy="origin" onload="this.onload=null, this.src='https://scripts.converteai.net/ceaefeeb-feef-4b52-8911-9ec9de0d5b6b/players/6a0df0a7af60d3892ccac112/v4/embed.html' +(location.search||'?') +'&vl=' +encodeURIComponent(location.href)"></iframe>
        </div>
      </div>
    `}} />
  </div>
));

export default function App() {
  const [phase, setPhase] = useState<FunnelPhase>('video_intro');
  const [showFaceButton, setShowFaceButton] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [agedImage, setAgedImage] = useState<string | null>(null);
  const [treatedImage, setTreatedImage] = useState<string | null>(null);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Prevents double-click
  const [apiError, setApiError] = useState<string | null>(null); // Inline error messages
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Image compression utility - handles HEIC, large mobile photos, EXIF orientation
  const compressImage = (base64Str: string, maxWidth = 512, maxHeight = 512): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64Str || !base64Str.startsWith('data:')) {
        resolve(base64Str);
        return;
      }
      
      const img = new Image();
      const timeoutId = setTimeout(() => {
        console.warn('Image load timeout, using original');
        resolve(base64Str);
      }, 15000);

      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          // Scale down proportionally
          const scale = Math.min(1, maxWidth / width, maxHeight / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // White background to handle transparent PNGs
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium';
            ctx.drawImage(img, 0, 0, width, height);
            // Always output as JPEG (handles HEIC, WEBP, PNG from mobile)
            // Quality 0.75 balances size vs quality - keeps payload small for mobile
            const result = canvas.toDataURL('image/jpeg', 0.75);
            console.log(`Compressed: ${width}x${height}, size: ${Math.round(result.length / 1024)}KB`);
            resolve(result);
          } else {
            resolve(base64Str);
          }
        } catch (err) {
          console.error('Compression error:', err);
          resolve(base64Str);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        console.error('Image load error during compression');
        resolve(base64Str);
      };

      // Required for cross-origin images (some mobile browsers)
      img.crossOrigin = 'anonymous';
      img.src = base64Str;
    });
  };

  // Compress from File object directly (for gallery uploads - avoids HEIC issues)
  const compressFile = (file: File, maxWidth = 512, maxHeight = 512): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Use createImageBitmap when available (handles EXIF orientation automatically)
      if (typeof createImageBitmap !== 'undefined') {
        createImageBitmap(file)
          .then((bitmap) => {
            const canvas = document.createElement('canvas');
            let width = bitmap.width;
            let height = bitmap.height;
            const scale = Math.min(1, maxWidth / width, maxHeight / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(bitmap, 0, 0, width, height);
            bitmap.close();
            const result = canvas.toDataURL('image/jpeg', 0.75);
            console.log(`File compressed (bitmap): ${width}x${height}, size: ${Math.round(result.length / 1024)}KB`);
            resolve(result);
          })
          .catch(() => {
            // Fallback to FileReader approach
            const reader = new FileReader();
            reader.onloadend = async () => {
              const compressed = await compressImage(reader.result as string, maxWidth, maxHeight);
              resolve(compressed);
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });
      } else {
        // Fallback for older browsers
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressed = await compressImage(reader.result as string, maxWidth, maxHeight);
          resolve(compressed);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      }
    });
  };

  // Routing & Initialization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    if (params.get('p') === 'capture' || path === '/analise') {
      setPhase('capture');
    }

    // Load SmartPlayer script
    const s = document.createElement("script");
    s.src = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
    s.async = true;
    document.head.appendChild(s);
    return () => {
      document.head.removeChild(s);
    };
  }, []);

  // Scroll to top on phase change
  useEffect(() => {
    // Immediate scroll
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);

    // Delayed scroll to account for AnimatePresence transitions
    const timer = setTimeout(() => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }, 100);

    // Reset camera error when starting again
    if (phase === 'capture') {
      setCameraError(null);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  const handleUserMediaError = (error: string | DOMException) => {
    console.error("Camera error:", error);
    setCameraError("permission_denied");
  };

  const captureFace = async () => {
    if (webcamRef.current) {
      try {
        setIsCapturing(true); // Show local loading
        // Small delay for mobile camera frame readiness
        await new Promise(r => setTimeout(r, 200));
        
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const compressed = await compressImage(imageSrc);
          setOriginalImage(compressed);
          setIsCapturing(false);
          // Reset errors on success
          setCameraError(null);
        } else {
          throw new Error("Não foi possível capturar a imagem da câmera.");
        }
      } catch (err: any) {
        console.error("Capture failure:", err);
        setApiError("Erro ao capturar foto: " + (err.message || "Tente novamente."));
        setIsCapturing(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      console.log(`File selected: ${file.name}, type: ${file.type}, size: ${Math.round(file.size / 1024)}KB`);
      // Use compressFile which handles HEIC, EXIF orientation via createImageBitmap
      const compressed = await compressFile(file);
      setOriginalImage(compressed);
      setIsCapturing(false);
    } catch (err: any) {
      console.error('File upload error:', err);
      setApiError('Erro ao carregar a foto. Tente outra foto ou use a câmera.');
    }
  };

  const submitForAnalysis = async () => {
    if (!firstName || !ageRange || !originalImage) {
      setApiError("Preencha todos os campos e tire a foto para continuar.");
      return;
    }
    if (isProcessing) return; // Block double-clicks
    
    setIsProcessing(true);
    setApiError(null);
    setPhase('analyzing');
    const startTime = Date.now();
    
    try {
      const result = await transformImage(originalImage, 'aging');
      
      const elapsed = Date.now() - startTime;
      const minWait = 7500;
      const remaining = Math.max(0, minWait - elapsed);
      
      setTimeout(() => {
        setAgedImage(result.imageUrl);
        setPhase('aged_result');
        setIsProcessing(false);
        // Facebook Pixel: Custom conversion - foto aging gerada
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('trackCustom', 'FotoGerada', { funnel: 'principal', tipo: 'aging' });
          console.log('[FB Pixel] FotoGerada event fired (principal/aging)');
        }
      }, remaining);
    } catch (err: any) {
      console.error('[Aging] Failed:', err.message || err);
      setApiError(err.message || 'Erro ao processar. Tente novamente.');
      setPhase('capture');
      setIsProcessing(false);
    }
  };

  const applyTreatment = async () => {
    if (isProcessing) return; // Block double-clicks
    
    setIsProcessing(true);
    setApiError(null);
    setPhase('processing_treatment');
    const startTime = Date.now();
    
    try {
      const result = await transformImage(originalImage!, 'treatment');
      
      const elapsed = Date.now() - startTime;
      const minWait = 8500;
      const remaining = Math.max(0, minWait - elapsed);

      setTimeout(() => {
        setTreatedImage(result.imageUrl);
        setPhase('treated_result');
        setIsProcessing(false);
        // Facebook Pixel: Custom conversion - foto treatment gerada
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('trackCustom', 'FotoGerada', { funnel: 'principal', tipo: 'treatment' });
          console.log('[FB Pixel] FotoGerada event fired (principal/treatment)');
        }
      }, remaining);
    } catch (err: any) {
      console.error('[Treatment] Failed:', err.message || err);
      setApiError(err.message || 'Erro ao processar. Tente novamente.');
      setPhase('aged_result');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-emerald-100 flex flex-col items-center">
      {/* 100% Mobile App Container Constraint */}
      <div className="w-full max-w-[440px] mx-auto bg-slate-50 min-h-[100dvh] flex flex-col relative shadow-2xl shadow-slate-300">
        
        {/* NEW HEADER SITE DE NOTÍCIAS - GLOBO NEWS STYLE - ONLY ON FIRST PAGE */}
        {phase === 'video_intro' && (
          <header className="bg-red-700 py-3 px-6 flex flex-col gap-1 shrink-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500 opacity-50"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-white text-red-700 px-1.5 py-0.5 rounded-sm font-black text-xs">S+40</div>
                <span className="font-black text-[18px] tracking-tighter text-white uppercase italic">SAÚDE +40</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[10px] font-bold text-red-100 uppercase tracking-widest opacity-80">
                programa de hoje com: <span className="text-white font-black italic">Rebecca Trajano</span>
              </div>
              <div className="text-[9px] font-black text-white bg-red-800 px-2 py-0.5 rounded uppercase tracking-tighter">
                Disponível até {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </header>
        )}

        <main ref={mainContentRef} className="flex-1 w-full px-6 py-8 flex flex-col relative overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* PHASE 1: VIDEO INTRO */}
            {phase === 'video_intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-6 space-y-3 px-1">
                  <h1 
                    onClick={() => setShowFaceButton(true)}
                    className="text-[22px] sm:text-[26px] font-black text-slate-900 leading-snug text-center text-balance cursor-default active:opacity-80 transition-opacity"
                  >
                    Especialista revela <span className="text-red-600">verdadeiro motivo escondido na pele</span>, que está causando <span className="underline decoration-red-500 decoration-[3px] underline-offset-4">envelhecimento precoce</span>, e revela como se livrar das bactérias para <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg">parecer até 5 anos mais jovem</span> usando vinagre de maçã!
                  </h1>
                </div>

                <div className="relative w-full rounded-3xl overflow-hidden shadow-xl shadow-slate-200 border border-slate-200 bg-black min-h-[200px] flex items-center justify-center">
                  <VSLPlayer />
                </div>



                {showFaceButton && (
                  <button 
                    onClick={() => setPhase('capture')}
                    className="mt-10 w-full py-6 bg-emerald-600 text-white font-black rounded-2xl shadow-2xl uppercase tracking-[0.1em] text-[15px] animate-bounce"
                  >
                    INICIAR ANÁLISE FACIAL AGORA!
                  </button>
                )}
              </motion.div>
            )}

            {/* PHASE 2: CAPTURE & INFO */}
            {phase === 'capture' && (
              <motion.div
                key="capture"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col space-y-6"
              >
                <div className="space-y-3 text-center mb-2">
                  <h2 className="text-[28px] sm:text-3xl font-black text-slate-900 leading-tight">Análise Especializada</h2>
                  <p className="text-[16px] leading-relaxed text-slate-600 px-2">
                    Preencha seus dados reais e adicione uma foto de rosto bem iluminada para iniciarmos.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 shrink-0 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[13px] uppercase font-bold text-slate-600 mb-1 block tracking-wider">Seu Primeiro Nome</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Ex: Maria"
                      className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-lg font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] uppercase font-bold text-slate-600 mb-1 block tracking-wider">Sua Idade</label>
                    <select 
                      value={ageRange}
                      onChange={e => setAgeRange(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-lg font-medium focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>Selecione sua idade</option>
                      <option value="41-50">41 a 50 anos</option>
                      <option value="51-60">51 a 60 anos</option>
                      <option value="60+">Mais de 60 anos</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center gap-4">
                  {!originalImage ? (
                    isCapturing ? (
                      <div className="w-full flex flex-col gap-4">
                        {cameraError !== 'permission_denied' && (
                          <div className="bg-emerald-600 text-white text-[12px] font-black py-4 px-6 rounded-2xl shadow-lg border border-emerald-400/30 uppercase tracking-tighter leading-tight animate-bounce">
                            ⚠️ Clique em "PERMITIR" no aviso que apareceu no seu navegador para ligar sua câmera
                          </div>
                        )}
                        
                        <div className="relative w-full overflow-hidden rounded-3xl bg-slate-100 border-2 border-slate-200 shadow-xl">
                          {cameraError === 'permission_denied' ? (
                            <div className="p-8 flex flex-col items-center text-center space-y-6">
                              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                <Camera className="w-10 h-10 text-red-500" />
                              </div>
                              <div className="space-y-3">
                                <h3 className="text-xl font-black text-slate-900">Acesso Negado</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                  Para tirar a foto, você precisa autorizar o uso da câmera. 
                                </p>
                              </div>
                              
                              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left w-full space-y-4 shadow-sm">
                                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Como autorizar:</h4>
                                <ol className="space-y-4">
                                  <li className="flex gap-4 items-start">
                                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                                    <p className="text-[14px] text-slate-700 leading-snug">Clique no <strong>ícone de cadeado</strong> ou <strong>configurações</strong> lá no topo perto do endereço do site.</p>
                                  </li>
                                  <li className="flex gap-4 items-start">
                                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                                    <p className="text-[14px] text-slate-700 leading-snug">Procure a opção "Câmera" e mude para <strong>"Permitir"</strong>.</p>
                                  </li>
                                  <li className="flex gap-4 items-start">
                                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                                    <p className="text-[14px] text-slate-700 leading-snug">Depois disso, atualize esta página.</p>
                                  </li>
                                </ol>
                              </div>

                              <button 
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-[14px]"
                              >
                                Atualizar Página
                              </button>
                              
                              <button 
                                onClick={() => setIsCapturing(false)}
                                className="text-slate-500 font-bold text-sm underline underline-offset-4"
                              >
                                Voltar
                              </button>
                            </div>
                          ) : (
                            <>
                              <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                onUserMediaError={handleUserMediaError}
                                videoConstraints={{ 
                                  facingMode: FACING_MODES.USER,
                                  width: { ideal: 720 },
                                  height: { ideal: 1280 }
                                }}
                                className="w-full h-full object-cover aspect-[3/4]"
                                mirrored={true}
                                forceScreenshotSourceSize={false}
                                imageSmoothing={true}
                                disablePictureInPicture={true}
                                screenshotQuality={0.8}
                                onUserMedia={() => {}}
                              />
                              <div className="absolute top-4 right-4 z-10">
                                <button 
                                  onClick={() => setIsCapturing(false)}
                                  className="bg-black/50 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md"
                                >
                                  Cancelar
                                </button>
                              </div>
                              <div className="absolute bottom-6 inset-x-0 flex justify-center flex-col items-center gap-3">
                                <button 
                                  onClick={captureFace}
                                  className="w-20 h-20 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 active:scale-95 transition shadow-2xl"
                                />
                                <p className="text-white text-[14px] font-black uppercase tracking-widest drop-shadow-lg">Toque para Tirar a Foto</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full space-y-4">
                        <button 
                          onClick={() => setIsCapturing(true)}
                          className="w-full py-10 rounded-3xl border-2 border-dashed border-slate-300 active:border-emerald-500 active:bg-emerald-50 transition flex flex-col items-center justify-center gap-4 text-slate-600 active:text-emerald-600 bg-white shadow-sm"
                        >
                          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div className="text-center space-y-1">
                            <span className="text-[17px] font-black uppercase tracking-wider block">CLIQUE AQUI PARA TIRAR FOTO!</span>
                            <span className="text-[13px] text-slate-400 font-medium lowercase">Recomendado para melhor resultado</span>
                          </div>
                        </button>

                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                          <div className="relative flex justify-center text-[12px] font-black uppercase tracking-widest"><span className="bg-slate-50 px-4 text-slate-500">Ou</span></div>
                        </div>

                        <label className="w-full py-4 rounded-2xl border border-slate-200 bg-white active:bg-slate-100 transition flex items-center justify-center gap-3 cursor-pointer text-slate-700 text-[15px] font-bold shadow-sm">
                          <Upload className="w-5 h-5 text-slate-500" />
                          <span>Procurar na Galeria...</span>
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                    )
                  ) : (
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200">
                      <img src={originalImage} alt="Sua foto" className="w-full h-auto object-cover aspect-[3/4]" />
                      <button 
                        onClick={() => setOriginalImage(null)}
                        className="absolute top-4 right-4 bg-slate-900/70 text-white backdrop-blur-md px-5 py-3 rounded-xl text-[14px] uppercase tracking-wider font-black active:bg-slate-900 transition"
                      >
                        Refazer Foto
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-8 shrink-0 pb-8 space-y-3">
                  {/* Inline error message - replaces alert() for better mobile UX */}
                  {apiError && phase === 'capture' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-red-700 font-medium">{apiError}</p>
                        <button 
                          onClick={() => setApiError(null)}
                          className="text-xs text-red-500 underline mt-1"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={submitForAnalysis}
                    disabled={!originalImage || !firstName || !ageRange || isProcessing}
                    className={cn(
                      "w-full py-5 font-black uppercase tracking-wider text-[16px] rounded-2xl transform transition flex items-center justify-center gap-2",
                      (!originalImage || !firstName || !ageRange || isProcessing) 
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                        : "bg-emerald-600 active:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:-translate-y-1"
                    )}
                  >
                    {isProcessing ? 'PROCESSANDO...' : 'INICIAR ANÁLISE FACIAL!'}
                    {!isProcessing && <ChevronRight className="w-6 h-6" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* PHASE 3: ANALYZING */}
            {phase === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <img src={originalImage!} alt="" className="w-full h-full object-cover" />
                    <motion.div 
                      initial={{ top: "-10%" }}
                      animate={{ top: "110%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] z-10"
                    />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border border-slate-200 flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">Escaneando Rosto</span>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Analisando sua derme...</h3>
                  <p className="text-[14px] text-slate-500 font-medium max-w-sm px-6 leading-relaxed">
                    Identificando colônias de bactérias e falhas estruturais.
                  </p>
                </div>

                <div className="w-full max-w-sm space-y-4 pt-4">
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-300/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: ["0%", "40%", "70%", "95%"] }}
                      transition={{ duration: 15, times: [0, 0.1, 0.4, 1], ease: "linear" }}
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                  <div className="space-y-3">
                    <LoadingStep text="Investigando a pele..." delay={0} />
                    <LoadingStep text="Medindo deficiência de colágeno..." delay={2} />
                    <LoadingStep text="Projetando danos estruturais..." delay={4.5} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* PHASE 4: AGED RESULT */}
            {phase === 'aged_result' && (
              <motion.div
                key="aged"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col pb-8 pt-4"
              >
                <div className="bg-red-50 text-red-800 p-5 rounded-2xl flex gap-4 mb-6 items-start border-l-4 border-red-500 shadow-sm">
                  <AlertCircle className="w-8 h-8 shrink-0 text-red-600" />
                  <div>
                    <h3 className="text-[17px] font-black uppercase tracking-wider text-red-700">Atenção Crônica!</h3>
                    <p className="text-[15px] leading-relaxed mt-2 font-medium text-red-900">
                      <strong>{firstName}</strong>, sua pele está sendo atacada por bactérias ruins. Se você não agir agora, <strong className="underline">este será o seu rosto</strong> em poucos anos.
                    </p>
                  </div>
                </div>

                <div className="relative aspect-[3/4] mb-8 group">
                  <div className="absolute inset-0 bg-slate-200 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                    <img src={agedImage!} alt="Simulação Envelhecimento" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-5 left-5 bg-red-600 text-white text-[13px] font-black px-4 py-2 rounded-lg uppercase tracking-widest shadow-md">
                    S/ Tratamento
                  </div>
                </div>

                <section className="flex flex-col gap-5 mb-8">
                  <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-widest leading-normal">
                    Como as bactérias danificam a pele:
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Travam a renovação das células.",
                      "Impedem a produção de colágeno.",
                      "Acumulam células mortas e envelhecidas.",
                      "Aceleram as marcas de velhice."
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[14px] font-black shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-[15px] leading-snug text-slate-800 font-bold">{item}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl mt-4">
                     <p className="text-[13px] uppercase font-black text-slate-400 mb-2 tracking-widest">O Resultado</p>
                     <p className="text-[17px] font-medium leading-relaxed">Rugas profundas, flacidez severa, linhas de expressão enraizadas e envelhecimento avançado.</p>
                  </div>
                </section>

                <button
                  onClick={applyTreatment}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-5 font-black uppercase tracking-widest text-[15px] rounded-2xl shadow-xl transform transition active:scale-95",
                    isProcessing
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-emerald-600 active:bg-emerald-700 text-white shadow-emerald-600/30"
                  )}
                >
                  {isProcessing ? 'PROCESSANDO...' : 'CONTINUAR!'}
                </button>
              </motion.div>
            )}

            {/* PHASE 5: PROCESSING TREATMENT */}
            {phase === 'processing_treatment' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-emerald-100 shadow-2xl relative">
                    <img src={agedImage!} alt="" className="w-full h-full object-cover" />
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-emerald-400"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 italic">Aplicando Protocolo...</h3>
                  <p className="text-[14px] font-medium text-slate-500 max-w-sm px-4 leading-relaxed">
                    Reativando renovação celular e restaurando colágeno fresco.
                  </p>
                </div>

                <div className="w-full max-w-sm space-y-4 pt-4">
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-300/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: ["0%", "30%", "60%", "95%"] }}
                      transition={{ duration: 16, times: [0, 0.1, 0.5, 1], ease: "linear" }}
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                  <div className="space-y-3">
                    <LoadingStep text="Limpando bactérias ruins..." delay={0} />
                    <LoadingStep text="Estimulando colágeno fresco..." delay={2.5} />
                    <LoadingStep text="Renovando pele em 100%..." delay={5.5} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* PHASE 6: TREATED RESULT */}
            {phase === 'treated_result' && (
              <motion.div
                key="treated"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col pb-8 pt-4"
              >
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">
                    Você Rejuvenescida
                  </h2>
                  <p className="text-[15px] uppercase font-black tracking-widest text-emerald-600">Com o tratamento correto!</p>
                </div>

                <div className="relative aspect-[3/4] mb-8 group">
                  <div className="absolute inset-0 bg-emerald-50 border-[6px] border-emerald-400 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-600/20">
                    <img src={treatedImage!} alt="Simulação Tratamento" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-5 left-5 bg-emerald-600 text-white text-[13px] font-black px-4 py-2 rounded-lg uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/30">
                    <Sparkles className="w-4 h-4" />
                    Com Tratamento
                  </div>
                </div>

                <section className="flex flex-col gap-5 mb-8">
                  <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-widest">O que acontece no seu rosto:</h3>
                  <ul className="space-y-4">
                    {[
                      "Bactérias ruins são eliminadas.",
                      "Bactérias boas voltam a trabalhar.",
                      "Renovação celular é acelerada.",
                      "Células novas e cheias de colágeno substituem as rugas."
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                         <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[14px] font-black shrink-0">
                           {i + 1}
                         </div>
                         <p className="text-[15px] leading-snug text-slate-800 font-bold">{item}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-100 mt-4 shadow-sm">
                     <p className="text-[16px] font-bold text-emerald-900 leading-relaxed text-center">
                       Sua pele mais firme, lisa e hidratada.<br/>Uma aparência de <strong>5 a 20 anos mais jovem!</strong>
                     </p>
                  </div>
                </section>

                <button
                  onClick={() => setPhase('final_comparison')}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-[15px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 transform transition active:scale-95 flex items-center justify-center gap-3"
                >
                  Eu quero este tratamento!
                  <ChevronRight className="w-5 h-5 text-emerald-200" />
                </button>
              </motion.div>
            )}

            {/* PHASE 7: FINAL PAGE */}
            {phase === 'final_comparison' && (
              <motion.div
                key="final"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col pb-12 w-full pt-4"
              >
                <div className="text-center mb-8 space-y-3">
                  <span className="text-[13px] font-black text-emerald-600 uppercase tracking-widest block bg-emerald-50 inline-block px-4 py-1.5 rounded-full">Recuperação Comprovada</span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">Veja o Tratamento Ideal para Você</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 w-full bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <div className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 flex items-center rounded uppercase tracking-widest z-10">
                      Sem Tratam.
                    </div>
                    <img src={agedImage!} alt="Aged" className="w-full aspect-[3/4] object-cover" />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-emerald-50">
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded uppercase flex items-center tracking-widest z-10">
                      Com Tratam.
                    </div>
                    <img src={treatedImage!} alt="Treated" className="w-full aspect-[3/4] object-cover" />
                  </div>
                </div>

                {/* VSL Final Video */}
                <div className="relative w-full rounded-3xl overflow-hidden shadow-xl shadow-slate-200 border border-slate-200 bg-black min-h-[200px] flex items-center justify-center">
                    <FinalVSLPlayer />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* FOOTER */}
        <footer className="px-6 py-8 bg-slate-100 border-t border-slate-200 text-center space-y-6">
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Este vídeo não se destina a diagnosticar, tratar, curar ou prevenir qualquer doença. Os resultados podem variar de pessoa para pessoa. Este site não é afiliado ao Facebook, Google, YouTube ou a qualquer de suas entidades. Depois que você sair do Facebook, Google ou YouTube, a responsabilidade não é deles e sim do nosso site.
          </p>
          <div className="space-y-1">
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
              Gp Negocios Digitais LTDA - CNPJ: 40.170.238/0001-80
            </p>
            <p className="text-[10px] text-slate-500">
              Rua Jose Maria Barbosa 31, Jardim Portal da Colina, Sorocaba SP, 18047-380
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Helper Component
function LoadingStep({ text, delay, icon }: { text: string, delay: number, icon?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={cn(
      "flex items-center gap-4 transition-opacity duration-500 bg-white px-6 py-5 rounded-2xl border border-slate-200 shadow-sm",
      show ? "opacity-100" : "opacity-0"
    )}>
      {icon ? icon : (
        <div className="w-6 h-6 rounded-full border-[3px] border-emerald-600 border-t-transparent animate-spin shrink-0" />
      )}
      <span className="text-[15px] font-bold tracking-wide text-slate-800">{text}</span>
    </div>
  );
}
