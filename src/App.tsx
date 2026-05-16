import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ChevronRight, AlertCircle, Sparkles, Play, RefreshCw, Upload } from 'lucide-react';
import { cn } from './lib/utils';

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

export default function App() {
  const [phase, setPhase] = useState<FunnelPhase>('video_intro');
  const [showFaceButton, setShowFaceButton] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [agedImage, setAgedImage] = useState<string | null>(null);
  const [treatedImage, setTreatedImage] = useState<string | null>(null);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Video phase logic popup
  useEffect(() => {
    if (phase === 'video_intro') {
      const timer = setTimeout(() => {
        setShowFaceButton(true);
      }, 5000); // button pops up after 5 seconds of the video playing
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const captureFace = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setOriginalImage(imageSrc);
        setIsCapturing(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setIsCapturing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitForAnalysis = async () => {
    if (!firstName || !ageRange || !originalImage) {
      alert("Preencha todos os campos e tire a foto para continuar.");
      return;
    }
    
    setPhase('analyzing');
    
    try {
      const res = await fetch('/api/transformar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: originalImage,
          type: 'aging'
        })
      });
      
      const data = await res.json();
      
      if (data.imagemTransformada) {
        setAgedImage(data.imagemTransformada);
        setPhase('aged_result');
      } else {
        throw new Error(data.error || "Failed to analyze image");
      }
    } catch (err) {
      console.error(err);
      alert("Houve um pequeno problema de conexão. Tente novamente.");
      setPhase('capture');
    }
  };

  const applyTreatment = async () => {
    setPhase('processing_treatment');
    
    try {
      const res = await fetch('/api/transformar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: originalImage,
          type: 'treatment'
        })
      });
      
      const data = await res.json();
      
      if (data.imagemTransformada) {
        setTreatedImage(data.imagemTransformada);
        setPhase('treated_result');
      } else {
        throw new Error(data.error || "Failed to process image");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao aplicar tratamento. Tente novamente.");
      setPhase('aged_result');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col items-center">
      {/* 100% Mobile App Container Constraint */}
      <div className="w-full max-w-[440px] mx-auto bg-slate-50 min-h-[100dvh] flex flex-col relative shadow-2xl shadow-slate-300">
        
        <main className="flex-1 w-full px-6 py-8 flex flex-col relative overflow-y-auto">
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
                  <h1 className="text-[22px] sm:text-[26px] font-black text-slate-900 leading-snug text-center text-balance">
                    Especialista revela <span className="text-red-600">verdadeiro motivo escondido na pele</span>, que está causando <span className="underline decoration-red-500 decoration-[3px] underline-offset-4">envelhecimento precoce</span>, e revela como se livrar das bactérias para <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-lg">parecer até 5 anos mais jovem</span> usando vinagre de maçã!
                  </h1>
                </div>

                <div className="relative aspect-[9/16] bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-200 border border-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1512496015851-a1fbbfc6d445?auto=format&fit=crop&q=80&w=600&h=1000" 
                    className="w-full h-full object-cover opacity-70 mix-blend-overlay" 
                    alt="Video thumbnail"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>

                  <AnimatePresence>
                    {showFaceButton && (
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 left-6 right-6"
                      >
                        <button
                          onClick={() => setPhase('capture')}
                          className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-[15px] font-black uppercase tracking-wide rounded-2xl shadow-lg shadow-indigo-600/20 transform transition flex items-center justify-center gap-2"
                        >
                          <Camera className="w-5 h-5 flex-shrink-0" />
                          Acessar Análise Facial
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                      className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-lg font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] uppercase font-bold text-slate-600 mb-1 block tracking-wider">Sua Idade</label>
                    <select 
                      value={ageRange}
                      onChange={e => setAgeRange(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-lg font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all appearance-none"
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
                      <div className="relative w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-300">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{ facingMode: FACING_MODES.USER }}
                          className="w-full h-full object-cover aspect-[3/4]"
                        />
                        <div className="absolute bottom-6 inset-x-0 flex justify-center flex-col items-center gap-3">
                          <button 
                            onClick={captureFace}
                            className="w-20 h-20 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 active:scale-95 transition"
                          />
                          <p className="text-white text-[14px] uppercase font-black tracking-widest drop-shadow-lg">Tirar Foto</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full space-y-4">
                        <button 
                          onClick={() => setIsCapturing(true)}
                          className="w-full py-8 rounded-3xl border-2 border-dashed border-slate-300 active:border-indigo-500 active:bg-indigo-50 transition flex flex-col items-center justify-center gap-3 text-slate-600 active:text-indigo-600 bg-white shadow-sm"
                        >
                          <Camera className="w-10 h-10 opacity-70" />
                          <span className="text-[15px] font-black uppercase tracking-wider">Tirar Foto na Hora</span>
                        </button>

                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                          <div className="relative flex justify-center text-[12px] font-black uppercase tracking-widest"><span className="bg-slate-50 px-4 text-slate-500">Ou</span></div>
                        </div>

                        <label className="w-full py-4 rounded-2xl border border-slate-200 bg-white active:bg-slate-100 transition flex items-center justify-center gap-3 cursor-pointer text-slate-700 text-[15px] font-bold shadow-sm">
                          <Upload className="w-5 h-5 text-slate-500" />
                          <span>Procurar na Galeria...</span>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
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

                <div className="mt-8 shrink-0 pb-8">
                  <button
                    onClick={submitForAnalysis}
                    disabled={!originalImage || !firstName || !ageRange}
                    className={cn(
                      "w-full py-5 font-black uppercase tracking-wider text-[16px] rounded-2xl transform transition flex items-center justify-center gap-2",
                      (!originalImage || !firstName || !ageRange) 
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                        : "bg-indigo-600 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:-translate-y-1"
                    )}
                  >
                    Iniciar Varredura
                    <ChevronRight className="w-6 h-6" />
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
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-slate-200 opacity-60 blur-[1px]">
                    <img src={originalImage!} alt="" className="w-full h-full object-cover grayscale" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <RefreshCw className="w-12 h-12 animate-spin" />
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Analisando derme...</h3>
                  <p className="text-[16px] text-slate-600 font-medium max-w-sm px-6 leading-relaxed">
                    Mapeando áreas de deficiência de colágeno e nível de regeneração celular.
                  </p>
                </div>

                <div className="w-full max-w-sm space-y-4">
                  <LoadingStep text="Investigando a pele..." delay={0} />
                  <LoadingStep text="Medindo deficiência de colágeno..." delay={1.5} />
                  <LoadingStep text="Projetando danos estruturais..." delay={3} />
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
                  className="w-full py-5 bg-indigo-600 active:bg-indigo-700 text-white font-black uppercase tracking-widest text-[15px] rounded-2xl shadow-xl shadow-indigo-600/30 transform transition active:scale-95"
                >
                  Ver Projeção com Tratamento
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
                  <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-indigo-100 shadow-2xl">
                    <img src={agedImage!} alt="" className="w-full h-full object-cover blur-[2px] opacity-80" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <Sparkles className="w-14 h-14 text-indigo-600 animate-pulse drop-shadow-lg" />
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black text-slate-900">Aplicando Protocolo...</h3>
                  <p className="text-[16px] font-medium text-slate-600 max-w-sm px-4 leading-relaxed">
                    Reativando as bactérias boas para <strong className="text-indigo-600">rejuvenescer</strong> o seu rosto.
                  </p>
                </div>

                <div className="w-full max-w-sm space-y-4">
                  <LoadingStep text="Limpando bactérias ruins..." delay={0} icon={<div className="w-4 h-4 bg-indigo-600 rounded-sm shrink-0" />} />
                  <LoadingStep text="Estimulando colágeno fresco..." delay={2} icon={<div className="w-4 h-4 bg-indigo-600 rounded-sm shrink-0" />} />
                  <LoadingStep text="Renovando pele em 100%..." delay={4} icon={<div className="w-4 h-4 bg-indigo-600 rounded-sm shrink-0" />} />
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
                  <p className="text-[15px] uppercase font-black tracking-widest text-indigo-600">Com o tratamento correto!</p>
                </div>

                <div className="relative aspect-[3/4] mb-8 group">
                  <div className="absolute inset-0 bg-indigo-50 border-[6px] border-indigo-400 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-600/20">
                    <img src={treatedImage!} alt="Simulação Tratamento" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-5 left-5 bg-indigo-600 text-white text-[13px] font-black px-4 py-2 rounded-lg uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/30">
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
                         <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[14px] font-black shrink-0">
                           {i + 1}
                         </div>
                         <p className="text-[15px] leading-snug text-slate-800 font-bold">{item}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="p-6 bg-indigo-50 rounded-2xl border-2 border-indigo-100 mt-4 shadow-sm">
                     <p className="text-[16px] font-bold text-indigo-900 leading-relaxed text-center">
                       Sua pele mais firme, lisa e hidratada.<br/>Uma aparência de <strong>5 a 20 anos mais jovem!</strong>
                     </p>
                  </div>
                </section>

                <button
                  onClick={() => setPhase('final_comparison')}
                  className="w-full py-5 bg-slate-900 active:bg-slate-800 text-white text-[15px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 transform transition active:scale-95 flex items-center justify-center gap-3"
                >
                  Eu quero este tratamento!
                  <ChevronRight className="w-5 h-5 text-slate-400" />
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
                  <span className="text-[13px] font-black text-indigo-600 uppercase tracking-widest block bg-indigo-50 inline-block px-4 py-1.5 rounded-full">Recuperação Comprovada</span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">Veja o Tratamento Ideal para Você</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 w-full bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <div className="absolute top-2 left-2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 flex items-center rounded uppercase tracking-widest z-10">
                      Sem Tratam.
                    </div>
                    <img src={agedImage!} alt="Aged" className="w-full aspect-[3/4] object-cover" />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-300 bg-indigo-50">
                    <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded uppercase flex items-center tracking-widest z-10">
                      Com Tratam.
                    </div>
                    <img src={treatedImage!} alt="Treated" className="w-full aspect-[3/4] object-cover" />
                  </div>
                </div>

                {/* VSL Final Video Placeholder */}
                <div className="relative w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800&h=450" 
                      className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
                      alt="Video thumbnail"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <button className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center active:scale-95 transition-transform shadow-2xl shadow-white/20 ring-8 ring-white/20 mb-4">
                        <Play className="w-8 h-8 text-indigo-600 ml-2" />
                      </button>
                      <p className="text-white text-[14px] font-black uppercase tracking-widest drop-shadow-md">Aperte o Play no Vídeo</p>
                    </div>
                </div>
                
                <button className="mt-10 w-full py-6 text-[16px] bg-indigo-600 active:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-transform uppercase tracking-widest">
                  Comprar o Tratamento
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
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
        <div className="w-6 h-6 rounded-full border-[3px] border-indigo-600 border-t-transparent animate-spin shrink-0" />
      )}
      <span className="text-[15px] font-bold tracking-wide text-slate-800">{text}</span>
    </div>
  );
}
