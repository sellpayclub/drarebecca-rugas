import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import YogaSalesBottom from './YogaSalesBottom';

const C = {
  bg: '#FBF7F4', bgCard: '#FFFFFF', rose: '#C4787E', roseLight: '#F5E1E4',
  roseMedium: '#E8B4BC', roseDark: '#9B4D56', roseDeep: '#7A3A42',
  textDark: '#2D1F21', textMedium: '#5A3D40', textLight: '#8A6B6E', border: '#F0E4E6',
};
const ff = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" };
const CHECKOUT = 'https://seguro.vitago-suplements.shop/r/FI42VC9BQ8';

// Map answers to diagnosis
function buildDiagnosis(answers: Record<string, string | string[]>) {
  const age = answers.idade as string || '';
  const region = answers.regiao as string || '';
  const morning = answers.manha as string || '';
  const treatments = answers.tratamentos || [];
  const diet = answers.alimentacao as string || '';
  const time = answers.tempo as string || '';
  const feeling = answers.sentimento as string || '';

  // Severity score
  let severity = 0;
  if (age.includes('51') || age.includes('59')) severity += 2;
  if (age.includes('65')) severity += 3;
  if (age.includes('43')) severity += 1;
  if (morning.includes('horas')) severity += 2;
  if (morning.includes('pouco')) severity += 1;
  if (region.includes('Tudo')) severity += 2;
  if (feeling.includes('chocada') || feeling.includes('Evito')) severity += 2;
  if (Array.isArray(treatments) && treatments.some(t => typeof t === 'string' && t.includes('Vários'))) severity += 2;

  const level = severity >= 5 ? 'avançado' : severity >= 3 ? 'moderado' : 'inicial';
  const levelColor = severity >= 5 ? '#DC2626' : severity >= 3 ? '#D97706' : '#059669';
  const levelEmoji = severity >= 5 ? '🔴' : severity >= 3 ? '🟡' : '🟢';

  // Problem areas
  const problems: { muscle: string; issue: string; exercise: string }[] = [];
  if (region.includes('Bochechas') || region.includes('Tudo')) {
    problems.push({ muscle: 'Músculo Zigomático', issue: 'Bochecha caindo por falta de sustentação', exercise: 'Elevação de maçãs do rosto (3x ao dia)' });
  }
  if (region.includes('Bigode') || region.includes('Tudo')) {
    problems.push({ muscle: 'Músculo Orbicular da Boca', issue: 'Sulcos nasogenianos aprofundando', exercise: 'Resistência labial circular (2x ao dia)' });
  }
  if (region.includes('Pálpebras') || region.includes('Tudo')) {
    problems.push({ muscle: 'Músculo Orbicular do Olho', issue: 'Pálpebra cedendo e olhar pesado', exercise: 'Abertura ocular com resistência (3x ao dia)' });
  }
  if (region.includes('Pescoço') || region.includes('Tudo')) {
    problems.push({ muscle: 'Músculo Platisma', issue: 'Pescoço flácido e papada formando', exercise: 'Extensão cervical com tensão (2x ao dia)' });
  }
  if (problems.length === 0) {
    problems.push({ muscle: 'Músculos Faciais Gerais', issue: 'Perda de tônus geral', exercise: 'Protocolo completo de fortalecimento facial' });
  }

  // Routine time
  let routineMinutes = '10';
  if (time.includes('5 a 10')) routineMinutes = '8';
  else if (time.includes('10 a 15')) routineMinutes = '12';
  else if (time.includes('15 a 30')) routineMinutes = '20';
  else if (time.includes('30')) routineMinutes = '25';

  return { level, levelColor, levelEmoji, problems, routineMinutes, severity, age, diet, feeling };
}

interface Props {
  firstName: string;
  answers: Record<string, string | string[]>;
}

export default function YogaSalesPage({ firstName, answers }: Props) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const diagnosis = useMemo(() => buildDiagnosis(answers), [answers]);

  const scrollToCheckout = () => {
    const el = document.getElementById('yoga-pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: C.bg, ...ff }}>
      <div className="w-full max-w-[520px] mx-auto flex flex-col relative" style={{ background: C.bg }}>

        {/* ═══ PERSONALIZED DIAGNOSIS ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-8 pb-4">
          <div className="text-center mb-6">
            <span className="inline-block text-[14px] font-bold uppercase tracking-wider px-5 py-2 rounded-full"
              style={{ background: C.roseLight, color: C.roseDark }}>Diagnóstico Completo</span>
          </div>

          <h2 className="text-[26px] font-extrabold text-center leading-[1.3] mb-2" style={{ color: C.textDark }}>
            {firstName}, seu resultado ficou pronto! ✨
          </h2>
          <p className="text-[16px] text-center mb-8" style={{ color: C.textMedium }}>
            Baseado nas suas respostas, identificamos seu perfil de envelhecimento facial:
          </p>

          {/* Severity Level Card */}
          <div className="rounded-2xl p-6 mb-8 text-center" style={{ background: C.bgCard, border: `3px solid ${diagnosis.levelColor}30` }}>
            <span className="text-4xl block mb-3">{diagnosis.levelEmoji}</span>
            <p className="text-[14px] font-bold uppercase tracking-wider mb-2" style={{ color: C.textLight }}>Nível de Enfraquecimento Muscular</p>
            <p className="text-[28px] font-black uppercase" style={{ color: diagnosis.levelColor }}>{diagnosis.level}</p>
            <p className="text-[15px] mt-3 leading-[1.6]" style={{ color: C.textMedium }}>
              {diagnosis.level === 'avançado'
                ? `${firstName}, seus músculos faciais precisam de atenção urgente. Mas a boa notícia é que músculos podem ser reativados em qualquer idade.`
                : diagnosis.level === 'moderado'
                ? `${firstName}, seu rosto já mostra sinais claros de enfraquecimento muscular. Agir agora pode reverter grande parte dos efeitos.`
                : `${firstName}, seu nível está inicial, mas sem ação os músculos vão enfraquecer rapidamente. É o momento ideal para começar.`
              }
            </p>
          </div>

          {/* Problem Areas */}
          <h3 className="text-[20px] font-extrabold mb-5" style={{ color: C.textDark }}>
            🔍 Áreas que precisam de atenção:
          </h3>
          <div className="space-y-4 mb-8">
            {diagnosis.problems.map((p, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `2px solid ${C.border}` }}>
                <div className="p-5" style={{ background: '#FEF2F2' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-black text-white" style={{ background: '#DC2626' }}>{i+1}</span>
                    <p className="text-[17px] font-bold" style={{ color: '#991B1B' }}>{p.muscle}</p>
                  </div>
                  <p className="text-[15px] ml-11" style={{ color: '#7F1D1D' }}>⚠️ {p.issue}</p>
                </div>
                <div className="p-5" style={{ background: '#F0FDF4' }}>
                  <p className="text-[15px] font-bold" style={{ color: '#065F46' }}>✅ Exercício recomendado:</p>
                  <p className="text-[16px] font-semibold mt-1" style={{ color: '#047857' }}>{p.exercise}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Personalized Routine Summary */}
          <div className="rounded-2xl p-6 mb-8" style={{ background: C.bgCard, border: `2px solid ${C.roseMedium}` }}>
            <h3 className="text-[18px] font-extrabold mb-4" style={{ color: C.textDark }}>📋 Sua Rotina Personalizada:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-2">
                <span className="text-xl">⏱️</span>
                <span className="text-[16px] font-bold" style={{ color: C.textDark }}>Tempo: {diagnosis.routineMinutes} minutos por dia</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <span className="text-xl">🎯</span>
                <span className="text-[16px] font-bold" style={{ color: C.textDark }}>Foco: {diagnosis.problems.length} grupo{diagnosis.problems.length > 1 ? 's' : ''} muscular{diagnosis.problems.length > 1 ? 'es' : ''} prioritário{diagnosis.problems.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <span className="text-xl">📅</span>
                <span className="text-[16px] font-bold" style={{ color: C.textDark }}>Resultado esperado: 30 a 60 dias</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <span className="text-xl">💪</span>
                <span className="text-[16px] font-bold" style={{ color: C.textDark }}>Nível: {diagnosis.level === 'avançado' ? 'Intensivo' : diagnosis.level === 'moderado' ? 'Intermediário' : 'Suave'}</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-2xl p-6 mb-8" style={{ background: C.bgCard, border: `2px solid ${C.border}` }}>
            <p className="text-[17px] leading-[1.7]" style={{ color: C.textDark }}>
              {firstName}, o seu envelhecimento é <strong style={{ color: C.roseDark }}>predominantemente muscular</strong> — não da pele.
            </p>
            <p className="text-[17px] leading-[1.7] mt-3" style={{ color: C.textDark }}>
              Isso significa que cremes e séruns <strong>nunca vão resolver</strong>.
            </p>
            <p className="text-[17px] leading-[1.7] mt-3" style={{ color: C.textDark }}>
              Mas também significa que <strong style={{ color: '#059669' }}>tem solução</strong>: músculo fraco pode ser reativado. E quando ele volta a sustentar, <strong>a pele volta junto.</strong>
            </p>
          </div>

          {/* YOGA FACIAL INTRO */}
          <div className="text-center space-y-4 mb-8">
            <span className="text-4xl block">💆‍♀️</span>
            <h2 className="text-[30px] font-black" style={{ color: C.textDark }}>YOGA FACIAL!</h2>
            <p className="text-[19px] font-bold" style={{ color: '#B91C1C' }}>❌ {firstName}, suas rugas não são falta de creme…</p>
            <p className="text-[19px] font-bold" style={{ color: C.roseDark }}>👉 São músculos faciais fracos!</p>
          </div>

          {/* Video + description */}
          <div className="text-center space-y-5 mb-8">
            <div className="rounded-2xl overflow-hidden shadow-lg mb-2" style={{ border: `2px solid ${C.border}` }}>
              <div dangerouslySetInnerHTML={{ __html: `
                <div id="ifr_6a0c55feef36953d22529ee1_wrapper" style="margin: 0 auto; width: 100%; max-width: 400px;">
                  <div style="position: relative; padding: 177.77777777777777% 0 0 0;" id="ifr_6a0c55feef36953d22529ee1_aspect">
                    <iframe frameborder="0" allowfullscreen src="about:blank" id="ifr_6a0c55feef36953d22529ee1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" referrerpolicy="origin" onload="this.onload=null, this.src='https://scripts.converteai.net/ceaefeeb-feef-4b52-8911-9ec9de0d5b6b/players/6a0c55feef36953d22529ee1/v4/embed.html' +(location.search||'?') +'&vl=' +encodeURIComponent(location.href)"></iframe>
                  </div>
                </div>
              `}} />
            </div>
            <p className="text-[17px] leading-[1.7]" style={{ color: C.textMedium }}>
              {firstName}, participe do melhor método de Yoga Facial do Brasil e descubra o método simples de exercícios faciais que <strong style={{ color: C.textDark }}>fortalece, levanta e redefine</strong> seu rosto naturalmente.
            </p>
            <button onClick={scrollToCheckout}
              className="w-full py-5 rounded-2xl text-white font-extrabold text-[17px] uppercase tracking-wider shadow-lg active:scale-[0.97] transition-transform"
              style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.roseDark})`, boxShadow: `0 8px 30px ${C.rose}44` }}>
              QUERO MINHA ROTINA COMPLETA
            </button>
          </div>
        </motion.div>

        {/* Problem Section */}
        <div className="px-5 py-8" style={{ background: C.bgCard }}>
          <h3 className="text-[22px] font-extrabold text-center mb-6" style={{ color: C.textDark }}>{firstName}, você já comprou:</h3>
          <div className="space-y-3 mb-8">
            {['Cremes anti-idade','Séruns caros','Tratamentos estéticos','Máscaras milagrosas','Aparelhos faciais'].map((item,i) => (
              <div key={i} className="flex items-center gap-4 py-4 px-5 rounded-xl" style={{ background: C.roseLight }}>
                <span className="text-[18px]">❌</span>
                <span className="text-[17px] font-bold" style={{ color: C.textDark }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="text-center space-y-5 mb-8">
            <p className="text-[18px] font-bold leading-relaxed" style={{ color: C.textDark }}>
              E mesmo assim...<br/>As rugas continuam ali. A flacidez aumenta.<br/>O rosto parece mais "caído" a cada ano.
            </p>
            <p className="text-[22px] font-extrabold" style={{ color: C.roseDark }}>Sabe por quê?</p>
            <p className="text-[17px] leading-[1.7]" style={{ color: C.textMedium }}>
              Porque te ensinaram a tratar a pele, quando o verdadeiro problema está <strong style={{ color: C.textDark }}>embaixo</strong> dela.
            </p>
          </div>
          <div className="rounded-2xl p-6 space-y-4" style={{ background: C.bg, border: `2px solid ${C.border}` }}>
            <p className="text-[18px] font-bold" style={{ color: C.roseDark }}>👉 O problema NÃO é superficial.</p>
            <p className="text-[18px] font-bold" style={{ color: C.roseDark }}>👉 O problema está nos MÚSCULOS FACIAIS enfraquecidos.</p>
            <p className="text-[16px] leading-[1.7] mt-2" style={{ color: C.textMedium }}>
              Assim como o corpo fica flácido quando você não treina, o rosto também perde sustentação quando os músculos não são estimulados.
            </p>
            <p className="text-[17px] font-bold mt-2" style={{ color: C.textDark }}>
              Nenhum creme consegue fortalecer músculo.<br/>É por isso que você não vê resultado real.
            </p>
          </div>
        </div>

        <YogaSalesBottom checkoutUrl={CHECKOUT} colors={C} />
      </div>
    </div>
  );
}
