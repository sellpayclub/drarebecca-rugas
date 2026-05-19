import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, RefreshCw, Shield, ChevronDown } from 'lucide-react';
import { cn } from './lib/utils';
import { transformImage } from './lib/fal';
import YogaSalesPage from './YogaSalesPage';

type Phase = 'landing' | 'capture' | 'analyzing' | 'sales';

// Color palette
const C = {
  bg: '#FBF7F4',
  bgCard: '#FFFFFF',
  rose: '#C4787E',
  roseLight: '#F5E1E4',
  roseMedium: '#E8B4BC',
  roseDark: '#9B4D56',
  roseDeep: '#7A3A42',
  textDark: '#2D1F21',
  textMedium: '#5A3D40',
  textLight: '#8A6B6E',
  border: '#F0E4E6',
};

function LoadingStep({ text, delay }: { text: string; delay: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={cn("flex items-center gap-4 transition-all duration-700 px-5 py-5 rounded-2xl border-2", show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}
      style={{ background: C.bgCard, borderColor: C.border }}>
      <div className="w-6 h-6 rounded-full border-[3px] animate-spin shrink-0" style={{ borderColor: C.roseMedium, borderTopColor: 'transparent' }} />
      <span className="text-[16px] font-bold" style={{ color: C.textDark }}>{text}</span>
    </div>
  );
}

export default function YogaFacialFunnel() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [agedImage, setAgedImage] = useState<string | null>(null);
  const [treatedImage, setTreatedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  // Load fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    // Load SmartPlayer
    const s = document.createElement('script');
    s.src = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js';
    s.async = true;
    document.head.appendChild(s);
    return () => { document.head.removeChild(link); document.head.removeChild(s); };
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  // Image compression
  const compressImage = (base64Str: string, maxW = 512, maxH = 512): Promise<string> =>
    new Promise((resolve) => {
      if (!base64Str?.startsWith('data:')) { resolve(base64Str); return; }
      const img = new Image();
      const timeout = setTimeout(() => resolve(base64Str), 15000);
      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
          const scale = Math.min(1, maxW / w, maxH / h);
          w = Math.round(w * scale); h = Math.round(h * scale);
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) { ctx.fillStyle = '#FFF'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL('image/jpeg', 0.75)); }
          else resolve(base64Str);
        } catch { resolve(base64Str); }
      };
      img.onerror = () => { clearTimeout(timeout); resolve(base64Str); };
      img.crossOrigin = 'anonymous'; img.src = base64Str;
    });

  const compressFile = (file: File, maxW = 512, maxH = 512): Promise<string> =>
    new Promise((resolve, reject) => {
      if (typeof createImageBitmap !== 'undefined') {
        createImageBitmap(file).then((bmp) => {
          const canvas = document.createElement('canvas');
          let w = bmp.width, h = bmp.height;
          const scale = Math.min(1, maxW / w, maxH / h);
          w = Math.round(w * scale); h = Math.round(h * scale);
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#FFF'; ctx.fillRect(0, 0, w, h); ctx.drawImage(bmp, 0, 0, w, h); bmp.close();
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        }).catch(() => {
          const reader = new FileReader();
          reader.onloadend = async () => resolve(await compressImage(reader.result as string, maxW, maxH));
          reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
          reader.readAsDataURL(file);
        });
      } else {
        const reader = new FileReader();
        reader.onloadend = async () => resolve(await compressImage(reader.result as string, maxW, maxH));
        reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
        reader.readAsDataURL(file);
      }
    });

  const captureFace = async () => {
    if (webcamRef.current) {
      try {
        await new Promise(r => setTimeout(r, 200));
        const src = webcamRef.current.getScreenshot();
        if (src) { setOriginalImage(await compressImage(src)); setCameraError(null); }
        else throw new Error('Falha na captura');
      } catch (err: any) { setApiError('Erro ao capturar foto: ' + (err.message || 'Tente novamente.')); }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setOriginalImage(await compressFile(file)); } 
    catch { setApiError('Erro ao carregar a foto. Tente outra.'); }
  };

  const startAnalysis = async () => {
    if (!originalImage || isProcessing) return;
    setIsProcessing(true); setApiError(null); setPhase('analyzing');
    const startTime = Date.now();
    try {
      // Generate BOTH photos in parallel
      const [agedResult, treatedResult] = await Promise.all([
        transformImage(originalImage, 'yoga_aging'),
        transformImage(originalImage, 'yoga_treatment'),
      ]);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 10000 - elapsed);
      setTimeout(() => {
        setAgedImage(agedResult.imageUrl);
        setTreatedImage(treatedResult.imageUrl);
        setPhase('sales');
        setIsProcessing(false);
      }, remaining);
    } catch (err: any) {
      setApiError(err.message || 'Erro ao processar. Tente novamente.');
      setPhase('capture'); setIsProcessing(false);
    }
  };

  const ff = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" };
  const ffTitle = { fontFamily: "'Playfair Display', serif" };

  // ─── SALES PAGE ───
  if (phase === 'sales' && agedImage && treatedImage) {
    return <YogaSalesPage agedImage={agedImage} treatedImage={treatedImage} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: C.bg, ...ff }}>
      <div className="w-full max-w-[520px] mx-auto min-h-[100dvh] flex flex-col relative" style={{ background: C.bg }}>
        <AnimatePresence mode="wait">

          {/* ═══ LANDING PAGE ═══ */}
          {phase === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col px-6 py-8">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img src="https://xyzgvsuttwrvbyyxdppq.supabase.co/storage/v1/object/public/imagens/logo%20yoga%20facial.png" alt="Yoga Facial" className="h-14 object-contain" />
              </div>

              {/* Headline */}
              <div className="text-center mb-8 space-y-4">
                <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-[1.3]" style={{ color: C.textDark }}>
                  Gere sua <span style={{ color: C.roseDark }}>rotina personalizada de exercícios faciais</span> baseada no SEU rosto
                </h1>
                <p className="text-[17px] leading-[1.6]" style={{ color: C.textMedium }}>
                  Nossa IA analisa as imperfeições do seu rosto e cria uma <strong style={{ color: C.textDark }}>rotina exclusiva de Yoga Facial</strong> para você — em menos de 60 segundos.
                </p>
              </div>

              {/* CTA 1 */}
              <div className="space-y-4 mb-8">
                <p className="text-center text-[16px] font-bold" style={{ color: C.textMedium }}>
                  👇 Tire uma foto e receba sua rotina personalizada
                </p>
                <button onClick={() => setPhase('capture')}
                  className="w-full py-5 rounded-2xl text-white font-extrabold text-[17px] uppercase tracking-wider shadow-lg transform transition-all active:scale-[0.97] hover:shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.roseDark})`, boxShadow: `0 8px 30px ${C.rose}44` }}>
                  GERAR MINHA ROTINA PERSONALIZADA
                </button>
              </div>

              {/* Info */}
              <div className="text-center space-y-3 mb-8 px-2">
                <p className="text-[15px] leading-[1.6]" style={{ color: C.textLight }}>
                  É gratuito. Leva menos de 1 minuto.<br />Basta tirar uma foto do rosto com boa iluminação.
                </p>
                <div className="flex flex-col gap-3 items-center">
                  <p className="text-[15px] font-bold" style={{ color: C.textDark }}>+12.000 rotinas personalizadas geradas em 2026.</p>
                  <p className="text-[15px] font-bold" style={{ color: C.roseDark }}>96% das mulheres viram resultados seguindo sua rotina personalizada.</p>
                </div>
              </div>

              {/* Trust badge */}
              <div className="rounded-2xl p-4 flex items-center gap-3 mb-8" style={{ background: C.roseLight, border: `1px solid ${C.border}` }}>
                <Shield className="w-5 h-5 shrink-0" style={{ color: C.roseDark }} />
                <p className="text-[14px] leading-[1.6]" style={{ color: C.textMedium }}>
                  🔒 Sua foto é processada pela IA e <strong>não é armazenada</strong>. 100% privado e seguro.
                </p>
              </div>

              {/* CTA 2 */}
              <div className="space-y-3">
                <p className="text-center text-[16px] font-bold" style={{ color: C.textMedium }}>
                  👇 Tire uma foto e receba sua rotina personalizada
                </p>
                <button onClick={() => setPhase('capture')}
                  className="w-full py-5 rounded-2xl text-white font-extrabold text-[17px] uppercase tracking-wider shadow-lg transform transition-all active:scale-[0.97] animate-pulse"
                  style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.roseDark})`, boxShadow: `0 8px 30px ${C.rose}44` }}>
                  GERAR MINHA ROTINA PERSONALIZADA
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ CAPTURE PAGE ═══ */}
          {phase === 'capture' && (
            <motion.div key="capture" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col px-6 py-8 space-y-5">
              <div className="text-center space-y-3">
                <h2 className="text-[26px] font-extrabold" style={{ color: C.textDark }}>Gerar Minha Rotina</h2>
                <p className="text-[16px]" style={{ color: C.textMedium }}>Tire uma foto do seu rosto para que a IA identifique suas imperfeições e gere sua rotina personalizada.</p>
              </div>

              <div className="flex-1 flex flex-col items-center gap-4">
                {!originalImage ? (
                  isCapturing ? (
                    <div className="w-full flex flex-col gap-4">
                      {cameraError !== 'permission_denied' && (
                        <div className="text-white text-[12px] font-bold py-3 px-5 rounded-xl" style={{ background: C.rose }}>
                          ⚠️ Clique em "PERMITIR" no aviso do navegador para ativar a câmera
                        </div>
                      )}
                      <div className="relative w-full overflow-hidden rounded-3xl border-2 shadow-xl" style={{ borderColor: C.roseMedium, background: '#000' }}>
                        {cameraError === 'permission_denied' ? (
                          <div className="p-6 flex flex-col items-center text-center space-y-4" style={{ background: C.bg }}>
                            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: C.roseLight }}>
                              <Camera className="w-8 h-8" style={{ color: C.roseDark }} />
                            </div>
                            <h3 className="text-lg font-bold" style={{ color: C.textDark }}>Acesso à Câmera Negado</h3>
                            <p className="text-[13px]" style={{ color: C.textMedium }}>Permita o acesso à câmera nas configurações do navegador e atualize a página.</p>
                            <button onClick={() => window.location.reload()} className="w-full py-3 rounded-xl text-white font-bold text-[14px]" style={{ background: C.roseDark }}>Atualizar Página</button>
                            <button onClick={() => setIsCapturing(false)} className="text-sm underline" style={{ color: C.textLight }}>Voltar</button>
                          </div>
                        ) : (
                          <>
                            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
                              onUserMediaError={() => setCameraError('permission_denied')}
                              videoConstraints={{ facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } }}
                              className="w-full h-full object-cover aspect-[3/4]" mirrored={true}
                              forceScreenshotSourceSize={false} imageSmoothing={true} screenshotQuality={0.8} />
                            <div className="absolute top-3 right-3 z-10">
                              <button onClick={() => setIsCapturing(false)} className="bg-black/50 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md">Cancelar</button>
                            </div>
                            <div className="absolute bottom-5 inset-x-0 flex flex-col items-center gap-2">
                              <button onClick={captureFace} className="w-18 h-18 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition shadow-2xl" style={{ width: 72, height: 72 }} />
                              <p className="text-white text-[13px] font-bold uppercase tracking-wider drop-shadow-lg">Toque para Tirar Foto</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full space-y-4">
                      <button onClick={() => setIsCapturing(true)}
                        className="w-full py-10 rounded-3xl border-2 border-dashed transition flex flex-col items-center justify-center gap-3 active:scale-[0.98]"
                        style={{ borderColor: C.roseMedium, background: C.bgCard }}>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: C.roseLight }}>
                          <Camera className="w-7 h-7" style={{ color: C.roseDark }} />
                        </div>
                        <span className="text-[18px] font-extrabold uppercase tracking-wider" style={{ color: C.textDark }}>TIRAR FOTO AGORA</span>
                        <span className="text-[14px]" style={{ color: C.textLight }}>Recomendado para melhor resultado</span>
                      </button>
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: C.border }} /></div>
                        <div className="relative flex justify-center text-[11px] font-bold uppercase tracking-widest"><span className="px-3" style={{ background: C.bg, color: C.textLight }}>Ou</span></div>
                      </div>
                      <label className="w-full py-5 rounded-2xl border-2 transition flex items-center justify-center gap-3 cursor-pointer text-[16px] font-bold active:opacity-80"
                        style={{ borderColor: C.border, background: C.bgCard, color: C.textMedium }}>
                        <Upload className="w-6 h-6" style={{ color: C.textLight }} />
                        <span>Escolher da Galeria...</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  )
                ) : (
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border-2" style={{ borderColor: C.roseMedium }}>
                    <img src={originalImage} alt="Sua foto" className="w-full h-auto object-cover aspect-[3/4]" />
                    <button onClick={() => setOriginalImage(null)}
                      className="absolute top-3 right-3 bg-black/60 text-white backdrop-blur-md px-4 py-2 rounded-xl text-[13px] font-bold active:bg-black/80 transition">
                      Refazer Foto
                    </button>
                  </div>
                )}
              </div>

              {/* Error */}
              {apiError && (
                <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <p className="text-sm font-medium" style={{ color: '#B91C1C' }}>{apiError}</p>
                  <button onClick={() => setApiError(null)} className="text-xs underline ml-auto" style={{ color: '#EF4444' }}>Fechar</button>
                </div>
              )}

              <button onClick={startAnalysis} disabled={!originalImage || isProcessing}
                className={cn("w-full py-5 font-extrabold uppercase tracking-wider text-[17px] rounded-2xl transition flex items-center justify-center gap-2",
                  (!originalImage || isProcessing) ? "cursor-not-allowed opacity-50" : "active:scale-[0.97] shadow-lg")}
                style={{ background: (!originalImage || isProcessing) ? '#E5D8DA' : `linear-gradient(135deg, ${C.rose}, ${C.roseDark})`,
                  color: (!originalImage || isProcessing) ? C.textLight : '#fff', boxShadow: originalImage && !isProcessing ? `0 8px 30px ${C.rose}44` : 'none' }}>
                {isProcessing ? 'GERANDO SUA ROTINA...' : 'GERAR MINHA ROTINA'}
              </button>
            </motion.div>
          )}

          {/* ═══ ANALYZING ═══ */}
          {phase === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12 space-y-8 min-h-[100dvh]">
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 shadow-xl" style={{ borderColor: C.roseMedium, boxShadow: `0 0 30px ${C.rose}30` }}>
                  <img src={originalImage!} alt="" className="w-full h-full object-cover" />
                  <motion.div initial={{ top: '-10%' }} animate={{ top: '110%' }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-1 z-10" style={{ background: C.rose, boxShadow: `0 0 15px ${C.rose}` }} />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full shadow-md border flex items-center gap-2"
                  style={{ background: C.bgCard, borderColor: C.border }}>
                  <RefreshCw className="w-3 h-3 animate-spin" style={{ color: C.rose }} />
                  <span className="text-[10px] font-bold uppercase tracking-tight" style={{ color: C.textMedium }}>Gerando</span>
                </div>
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-[24px] font-extrabold" style={{ color: C.textDark }}>Gerando sua rotina personalizada...</h3>
                <p className="text-[15px]" style={{ color: C.textLight }}>Nossa IA está analisando seu rosto e criando seus exercícios</p>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: C.roseLight }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: ['0%', '30%', '55%', '80%', '95%'] }}
                    transition={{ duration: 20, times: [0, 0.1, 0.3, 0.6, 1], ease: 'linear' }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${C.roseMedium}, ${C.rose})` }} />
                </div>
                <div className="space-y-3">
                  <LoadingStep text="Mapeando estrutura muscular do seu rosto..." delay={0} />
                  <LoadingStep text="Identificando áreas de flacidez e imperfeições..." delay={3} />
                  <LoadingStep text="Selecionando exercícios ideais para o seu caso..." delay={6} />
                  <LoadingStep text="Montando sua rotina completa personalizada..." delay={9} />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
