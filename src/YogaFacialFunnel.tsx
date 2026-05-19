import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Shield, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';
import YogaSalesPage from './YogaSalesPage';

type Phase = 'landing' | 'quiz' | 'analyzing' | 'sales';

const C = {
  bg: '#FBF7F4', bgCard: '#FFFFFF', rose: '#C4787E', roseLight: '#F5E1E4',
  roseMedium: '#E8B4BC', roseDark: '#9B4D56', roseDeep: '#7A3A42',
  textDark: '#2D1F21', textMedium: '#5A3D40', textLight: '#8A6B6E', border: '#F0E4E6',
};
const ff = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" };

interface QuizQuestion {
  id: string;
  question: string;
  logic: string;
  options: string[];
  multiple?: boolean;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'idade', question: 'Qual a sua faixa de idade?',
    logic: 'A idade determina o nível de enfraquecimento muscular facial',
    options: ['35 a 42 anos', '43 a 50 anos', '51 a 58 anos', '59 a 65 anos', 'Acima de 65 anos'],
  },
  {
    id: 'regiao', question: 'Qual dessas regiões te incomoda mais?',
    logic: 'Cada região corresponde a um grupo muscular específico',
    options: ['Bochechas caídas e rosto "derretendo"', 'Bigode chinês e sulcos profundos', 'Pálpebras pesadas e olhar cansado', 'Pescoço flácido e papada', 'Tudo igualmente'],
  },
  {
    id: 'manha', question: 'Quando você acorda de manhã, antes de lavar o rosto:',
    logic: 'Músculo fraco perde elasticidade de recuperação durante o sono',
    options: ['O rosto demora horas pra "desamassar" — muito mais que antes', 'Demora um pouco mas volta rápido', 'Não noto diferença'],
  },
  {
    id: 'tratamentos', question: 'Você já fez algum desses tratamentos?',
    logic: 'O histórico de tratamentos indica se o problema é superficial ou muscular',
    options: ['Botox ou preenchimento', 'Cremes e séruns caros', 'Colágeno em cápsula', 'Nenhum — nunca funcionou nada', 'Vários — resultados temporários'],
    multiple: true,
  },
  {
    id: 'alimentacao', question: 'Como está sua alimentação?',
    logic: 'Alimentação afeta a microbiota intestinal e a renovação celular da pele',
    options: ['Como bem e cuido da alimentação', 'Como razoavelmente', 'Não me preocupo muito com alimentação'],
  },
  {
    id: 'tempo', question: 'Quanto tempo você tem disponível para praticar os exercícios faciais?',
    logic: 'O plano de exercícios será gerado de acordo com sua disponibilidade!',
    options: ['5 a 10 minutos por dia', '10 a 15 minutos por dia', '15 a 30 minutos por dia', '+ de 30 minutos por dia'],
  },
  {
    id: 'sentimento', question: 'Como você se sente quando vê fotos suas sem filtro?',
    logic: 'Entender sua percepção ajuda a calibrar a intensidade do protocolo',
    options: ['Fico chocada — parece mais velha do que me sinto', 'Evito tirar foto ou sempre apago', 'Aceito bem — estou envelhecendo naturalmente', 'Me incomoda muito mas não sei o que fazer'],
  },
];

function LoadingStep({ text, delay }: { text: string; delay: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay * 1000); return () => clearTimeout(t); }, [delay]);
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
  const [firstName, setFirstName] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [multiSelected, setMultiSelected] = useState<string[]>([]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet'; document.head.appendChild(link);
    const s = document.createElement('script');
    s.src = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js';
    s.async = true; document.head.appendChild(s);
    return () => { document.head.removeChild(link); document.head.removeChild(s); };
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [phase, currentQ]);

  const progress = phase === 'quiz' ? ((currentQ + 1) / QUESTIONS.length) * 100 : 0;
  const q = QUESTIONS[currentQ];

  const handleSingleSelect = (option: string) => {
    const newAnswers = { ...answers, [q.id]: option };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) { setCurrentQ(currentQ + 1); }
      else { startAnalysis(newAnswers); }
    }, 400);
  };

  const handleMultiToggle = (option: string) => {
    setMultiSelected(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };

  const handleMultiConfirm = () => {
    if (multiSelected.length === 0) return;
    const newAnswers = { ...answers, [q.id]: multiSelected };
    setAnswers(newAnswers);
    setMultiSelected([]);
    if (currentQ < QUESTIONS.length - 1) { setCurrentQ(currentQ + 1); }
    else { startAnalysis(newAnswers); }
  };

  const startAnalysis = (finalAnswers: Record<string, string | string[]>) => {
    setPhase('analyzing');
    // Facebook Pixel event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'FotoGerada', { funnel: 'yoga_facial' });
    }
    setTimeout(() => setPhase('sales'), 12000);
  };

  // ─── SALES PAGE ───
  if (phase === 'sales') {
    return <YogaSalesPage firstName={firstName} answers={answers} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: C.bg, ...ff }}>
      <div className="w-full max-w-[520px] mx-auto min-h-[100dvh] flex flex-col relative" style={{ background: C.bg }}>
        <AnimatePresence mode="wait">

          {/* ═══ LANDING PAGE ═══ */}
          {phase === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col px-6 py-8">
              <div className="flex justify-center mb-6">
                <img src="https://xyzgvsuttwrvbyyxdppq.supabase.co/storage/v1/object/public/imagens/logo%20yoga%20facial.png" alt="Yoga Facial" className="h-14 object-contain" />
              </div>

              <div className="text-center mb-8 space-y-4">
                <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-[1.3]" style={{ color: C.textDark }}>
                  Receba sua <span style={{ color: C.roseDark }}>rotina personalizada de exercícios faciais</span> em 2 minutos
                </h1>
                <p className="text-[17px] leading-[1.6]" style={{ color: C.textMedium }}>
                  Responda 7 perguntas rápidas e nossa IA vai gerar um <strong style={{ color: C.textDark }}>protocolo exclusivo de Yoga Facial</strong> baseado no seu perfil.
                </p>
              </div>

              {/* Name input */}
              <div className="mb-6">
                <label className="block text-[16px] font-bold mb-2" style={{ color: C.textDark }}>Qual seu primeiro nome?</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="Ex: Maria" maxLength={30}
                  className="w-full py-4 px-5 rounded-2xl border-2 text-[17px] font-medium outline-none transition-all focus:shadow-lg"
                  style={{ borderColor: firstName ? C.roseMedium : C.border, background: C.bgCard, color: C.textDark }}
                />
              </div>

              <div className="space-y-4 mb-8">
                <button onClick={() => { if (firstName.trim()) setPhase('quiz'); }}
                  disabled={!firstName.trim()}
                  className={cn("w-full py-5 rounded-2xl text-white font-extrabold text-[17px] uppercase tracking-wider shadow-lg transform transition-all",
                    firstName.trim() ? "active:scale-[0.97] hover:shadow-xl" : "opacity-50 cursor-not-allowed")}
                  style={{ background: firstName.trim() ? `linear-gradient(135deg, ${C.rose}, ${C.roseDark})` : '#E5D8DA',
                    boxShadow: firstName.trim() ? `0 8px 30px ${C.rose}44` : 'none' }}>
                  INICIAR MINHA AVALIAÇÃO GRATUITA
                </button>
              </div>

              <div className="text-center space-y-3 mb-8 px-2">
                <p className="text-[15px] leading-[1.6]" style={{ color: C.textLight }}>
                  É gratuito. Leva menos de 2 minutos.<br/>7 perguntas rápidas e receba seu protocolo.
                </p>
                <div className="flex flex-col gap-3 items-center">
                  <p className="text-[15px] font-bold" style={{ color: C.textDark }}>+12.000 rotinas personalizadas geradas em 2026.</p>
                  <p className="text-[15px] font-bold" style={{ color: C.roseDark }}>96% das mulheres viram resultados seguindo sua rotina.</p>
                </div>
              </div>

              <div className="rounded-2xl p-4 flex items-center gap-3 mb-8" style={{ background: C.roseLight, border: `1px solid ${C.border}` }}>
                <Shield className="w-5 h-5 shrink-0" style={{ color: C.roseDark }} />
                <p className="text-[14px] leading-[1.6]" style={{ color: C.textMedium }}>
                  🔒 Suas respostas são <strong>100% privadas</strong> e usadas apenas para gerar sua rotina personalizada.
                </p>
              </div>

              <div className="space-y-3">
                <button onClick={() => { if (firstName.trim()) setPhase('quiz'); }}
                  disabled={!firstName.trim()}
                  className={cn("w-full py-5 rounded-2xl text-white font-extrabold text-[17px] uppercase tracking-wider shadow-lg transform transition-all animate-pulse",
                    firstName.trim() ? "active:scale-[0.97]" : "opacity-50 cursor-not-allowed")}
                  style={{ background: firstName.trim() ? `linear-gradient(135deg, ${C.rose}, ${C.roseDark})` : '#E5D8DA',
                    boxShadow: firstName.trim() ? `0 8px 30px ${C.rose}44` : 'none' }}>
                  INICIAR MINHA AVALIAÇÃO GRATUITA
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ QUIZ ═══ */}
          {phase === 'quiz' && q && (
            <motion.div key={`quiz-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }} className="flex-1 flex flex-col px-6 py-8">

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold" style={{ color: C.textLight }}>Pergunta {currentQ + 1} de {QUESTIONS.length}</span>
                  <span className="text-[13px] font-bold" style={{ color: C.roseDark }}>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: C.roseLight }}>
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${C.roseMedium}, ${C.rose})` }} />
                </div>
              </div>

              {/* Personalized greeting */}
              <p className="text-[14px] font-medium mb-2" style={{ color: C.roseDark }}>
                {firstName}, responda com sinceridade 💕
              </p>

              {/* Question */}
              <h2 className="text-[22px] font-extrabold leading-[1.3] mb-3" style={{ color: C.textDark }}>
                {q.question}
              </h2>

              {/* Logic hint */}
              <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl" style={{ background: C.roseLight }}>
                <span className="text-[13px]">🧬</span>
                <p className="text-[13px] font-medium italic" style={{ color: C.roseDark }}>{q.logic}</p>
              </div>

              {/* Options */}
              <div className="space-y-3 flex-1">
                {q.options.map((option, i) => {
                  const isSelected = q.multiple
                    ? multiSelected.includes(option)
                    : answers[q.id] === option;

                  return (
                    <button key={i}
                      onClick={() => q.multiple ? handleMultiToggle(option) : handleSingleSelect(option)}
                      className={cn("w-full text-left p-5 rounded-2xl border-2 transition-all active:scale-[0.98] flex items-center gap-3",
                        isSelected ? "shadow-md" : "")}
                      style={{
                        borderColor: isSelected ? C.rose : C.border,
                        background: isSelected ? C.roseLight : C.bgCard,
                      }}>
                      <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: isSelected ? C.rose : C.border, background: isSelected ? C.rose : 'transparent' }}>
                        {isSelected && <span className="text-white text-[12px] font-black">✓</span>}
                      </div>
                      <span className="text-[16px] font-semibold" style={{ color: C.textDark }}>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Multi-select confirm button */}
              {q.multiple && (
                <button onClick={handleMultiConfirm}
                  disabled={multiSelected.length === 0}
                  className={cn("w-full mt-6 py-5 rounded-2xl font-extrabold text-[17px] uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                    multiSelected.length > 0 ? "text-white active:scale-[0.97] shadow-lg" : "opacity-50 cursor-not-allowed")}
                  style={{ background: multiSelected.length > 0 ? `linear-gradient(135deg, ${C.rose}, ${C.roseDark})` : '#E5D8DA',
                    color: multiSelected.length > 0 ? '#fff' : C.textLight }}>
                  CONTINUAR <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          )}

          {/* ═══ ANALYZING ═══ */}
          {phase === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12 space-y-8 min-h-[100dvh]">
              <div className="relative">
                <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-xl" style={{ background: C.roseLight, boxShadow: `0 0 30px ${C.rose}30` }}>
                  <span className="text-5xl">🧘‍♀️</span>
                  <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-4 border-transparent" style={{ borderTopColor: C.rose }} />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full shadow-md border flex items-center gap-2"
                  style={{ background: C.bgCard, borderColor: C.border }}>
                  <RefreshCw className="w-3 h-3 animate-spin" style={{ color: C.rose }} />
                  <span className="text-[10px] font-bold uppercase tracking-tight" style={{ color: C.textMedium }}>Gerando</span>
                </div>
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-[24px] font-extrabold" style={{ color: C.textDark }}>
                  {firstName}, gerando sua rotina...
                </h3>
                <p className="text-[15px]" style={{ color: C.textLight }}>
                  Analisando suas respostas e montando seu protocolo exclusivo
                </p>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: C.roseLight }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: ['0%', '30%', '55%', '80%', '95%'] }}
                    transition={{ duration: 12, times: [0, 0.1, 0.3, 0.6, 1], ease: 'linear' }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${C.roseMedium}, ${C.rose})` }} />
                </div>
                <div className="space-y-3">
                  <LoadingStep text="Analisando seu perfil muscular facial..." delay={0} />
                  <LoadingStep text="Identificando os músculos mais enfraquecidos..." delay={2.5} />
                  <LoadingStep text="Selecionando exercícios ideais para o seu caso..." delay={5} />
                  <LoadingStep text="Calculando frequência e intensidade..." delay={7.5} />
                  <LoadingStep text="Montando sua rotina completa personalizada..." delay={10} />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
