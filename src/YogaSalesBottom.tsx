import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Colors {
  bg: string; bgCard: string; rose: string; roseLight: string; roseMedium: string;
  roseDark: string; roseDeep: string; textDark: string; textMedium: string; textLight: string; border: string;
}

function FAQ({ q, a, colors: C }: { q: string; a: string; colors: Colors }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border-2" style={{ borderColor: C.border, background: C.bgCard }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="text-[17px] font-bold pr-4" style={{ color: C.textDark }}>{q}</span>
        <ChevronDown className={`w-6 h-6 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: C.textLight }} />
      </button>
      {open && <div className="px-5 pb-5"><p className="text-[16px] leading-[1.7]" style={{ color: C.textMedium }}>{a}</p></div>}
    </div>
  );
}

export default function YogaSalesBottom({ checkoutUrl, colors: C }: { checkoutUrl: string; colors: Colors }) {
  return (
    <>
      {/* Solution Section */}
      <div className="px-5 py-10" style={{ background: C.bg }}>
        <div className="text-center space-y-3 mb-8">
          <p className="text-[15px] font-bold uppercase tracking-widest" style={{ color: C.textLight }}>A Solução Definitiva</p>
          <p className="text-[17px]" style={{ color: C.textMedium }}>Foi por isso que criamos a…</p>
          <p className="text-4xl">🧘‍♀️</p>
          <h2 className="text-[30px] font-black" style={{ color: C.textDark }}>YOGA FACIAL!</h2>
        </div>
        <p className="text-[17px] leading-[1.7] text-center mb-10" style={{ color: C.textMedium }}>
          Um método estruturado de exercícios faciais protocolados, onde a Michele cria uma rotina específica para <strong style={{ color: C.textDark }}>fortalecer, tonificar e levantar</strong> os músculos do seu rosto.
        </p>

        {/* How it works */}
        <div className="space-y-3 mb-10">
          <h3 className="text-[20px] font-extrabold text-center mb-5" style={{ color: C.textDark }}>Funciona assim:</h3>
          {[
            ['💪', 'Você fortalece os músculos faciais'],
            ['🔝', 'Os músculos sustentam melhor a pele'],
            ['✨', 'A pele fica mais firme e esticada'],
            ['🌸', 'As rugas suavizam naturalmente'],
          ].map(([icon, text], i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-xl" style={{ background: C.bgCard, border: `2px solid ${C.border}` }}>
              <span className="text-2xl shrink-0">{icon}</span>
              <span className="text-[17px] font-bold" style={{ color: C.textDark }}>{text}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-[18px] italic mb-8" style={{ color: C.textMedium }}>
          "É literalmente yoga… só que para o seu rosto."
        </p>

        <div className="flex flex-col items-center gap-3 mb-10">
          {['Sem agulhas.', 'Sem procedimentos invasivos.', 'Sem depender de produtos caros.'].map((t, i) => (
            <span key={i} className="px-6 py-3 rounded-full text-[15px] font-bold" style={{ background: C.roseLight, color: C.roseDark }}>{t}</span>
          ))}
        </div>

        {/* For you */}
        <div className="rounded-2xl p-6 mb-10" style={{ background: C.bgCard, border: `2px solid ${C.border}` }}>
          <h3 className="text-[20px] font-extrabold text-center mb-5" style={{ color: C.textDark }}>O YOGA FACIAL! é para você que:</h3>
          <div className="space-y-3">
            {[
              'Está incomodada com rugas e flacidez',
              'Sente que o rosto está "derretendo"',
              'Não quer fazer botox ou procedimentos invasivos',
              'Já gastou com cosméticos e não viu resultado',
              'Quer uma solução natural e acessível',
              'Quer recuperar firmeza, definição e autoestima',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <span className="text-[16px] shrink-0 mt-0.5" style={{ color: '#059669' }}>✅</span>
                <span className="text-[16px] font-medium" style={{ color: C.textDark }}>{t}</span>
              </div>
            ))}
          </div>
          <p className="text-[16px] italic mt-5 text-center font-medium" style={{ color: C.textMedium }}>Se você quer um método natural e inteligente, isso é pra você.</p>
        </div>

        {/* Imagine */}
        <div className="text-center mb-10">
          <h3 className="text-[22px] font-extrabold mb-6" style={{ color: C.textDark }}>Imagine:</h3>
          <div className="space-y-4">
            {[
              'Olhar no espelho e ver um rosto mais firme',
              'Linha do maxilar mais definida',
              'Bochechas mais levantadas',
              'Rugas suavizadas',
              'Maquiagem assentando melhor',
              'Autoestima renovada',
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3 justify-center">
                <span className="text-xl">✨</span>
                <span className="text-[17px] font-semibold" style={{ color: C.textDark }}>{t}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            <p className="text-[18px] font-bold" style={{ color: C.textDark }}>Você não vai apenas melhorar sua aparência…</p>
            <p className="text-[17px]" style={{ color: C.textMedium }}>Você vai recuperar a sensação de juventude, segurança e confiança.</p>
            <p className="text-[17px] font-bold" style={{ color: C.roseDark }}>E o melhor: sabendo que conquistou isso naturalmente.</p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-5 py-10" style={{ background: C.bgCard }}>
        <div className="text-center mb-6">
          <p className="text-[15px] font-bold uppercase tracking-widest mb-2" style={{ color: C.roseDark }}>Resultados Reais</p>
          <h3 className="text-[24px] font-extrabold mb-3" style={{ color: C.textDark }}>Transformações que inspiram</h3>
          <p className="text-[16px]" style={{ color: C.textMedium }}>Veja o que acontece quando você exercita os músculos do seu rosto com constância e o método certo.</p>
        </div>

        <div className="rounded-2xl overflow-hidden mb-6 shadow-lg" style={{ border: `2px solid ${C.border}` }}>
          <div dangerouslySetInnerHTML={{ __html: `
            <div id="ifr_6a0b168d4b6ee00cb91f42a5_wrapper" style="margin: 0 auto; width: 100%;">
              <div style="position: relative; padding: 56.25% 0 0 0;" id="ifr_6a0b168d4b6ee00cb91f42a5_aspect">
                <iframe frameborder="0" allowfullscreen src="about:blank" id="ifr_6a0b168d4b6ee00cb91f42a5" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" referrerpolicy="origin" onload="this.onload=null, this.src='https://scripts.converteai.net/ceaefeeb-feef-4b52-8911-9ec9de0d5b6b/players/6a0b168d4b6ee00cb91f42a5/v4/embed.html' +(location.search||'?') +'&vl=' +encodeURIComponent(location.href)"></iframe>
              </div>
            </div>
          `}} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ['🎯', 'Rosto Mais Firme'],
            ['📐', 'Papada Reduzida'],
            ['👁️', 'Olhar Levantado'],
            ['✨', 'Pele Radiante'],
          ].map(([icon, text], i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: C.roseLight }}>
              <span className="text-xl">{icon}</span>
              <span className="text-[15px] font-bold" style={{ color: C.roseDark }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus */}
      <div className="px-5 py-10" style={{ background: C.bg }}>
        <h3 className="text-[20px] font-extrabold text-center mb-6" style={{ color: C.textDark }}>No plano completo você ainda recebe:</h3>
        <div className="space-y-4">
          {[
            ['👥', 'Grupo exclusivo de alunas', 'Você não estará sozinha.'],
            ['🎥', 'Aulas ao vivo com a Michele', 'Tire suas dúvidas em tempo real.'],
            ['🔄', 'Atualizações constantes', 'Protocolos de exercícios sempre atualizados.'],
          ].map(([icon, title, desc], i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-xl" style={{ background: C.bgCard, border: `2px solid ${C.border}` }}>
              <span className="text-2xl shrink-0">{icon}</span>
              <div>
                <p className="text-[17px] font-bold" style={{ color: C.textDark }}>{title}</p>
                <p className="text-[15px] mt-1" style={{ color: C.textMedium }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[16px] italic text-center mt-5 font-medium" style={{ color: C.textMedium }}>"Existe uma comunidade inteira evoluindo junto com você."</p>
      </div>

      {/* Pricing */}
      <div id="yoga-pricing" className="px-5 py-10" style={{ background: C.bgCard }}>
        <div className="text-center mb-6">
          <span className="inline-block text-[14px] font-bold uppercase tracking-wider px-5 py-2 rounded-full" style={{ background: C.roseLight, color: C.roseDark }}>Melhor Custo-Benefício</span>
        </div>

        <div className="rounded-2xl p-5 mb-5 text-center" style={{ background: '#FEF2F2', border: '2px solid #FECACA' }}>
          <p className="text-[15px] line-through mb-1" style={{ color: '#9CA3AF' }}>Qualquer creme que não funciona</p>
          <p className="text-[20px] font-bold" style={{ color: '#B91C1C' }}>R$ 150+ todos os meses</p>
        </div>

        <div className="rounded-3xl p-7 text-center shadow-xl mb-8" style={{ background: `linear-gradient(135deg, ${C.roseLight}, ${C.bgCard})`, border: `3px solid ${C.roseMedium}` }}>
          <p className="text-[16px] font-bold uppercase tracking-wider mb-3" style={{ color: C.roseDark }}>Yoga Facial — Plano Completo</p>
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-[20px] font-bold" style={{ color: C.textMedium }}>R$</span>
            <span className="text-[56px] font-black leading-none" style={{ color: C.roseDark }}>37</span>
            <span className="text-[18px] font-bold" style={{ color: C.textMedium }}>,00</span>
          </div>
          <p className="text-[15px] mb-6" style={{ color: C.textMedium }}>Por menos do que um único creme anti-idade.</p>
          <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
            className="block w-full py-5 rounded-2xl text-white font-extrabold text-[18px] uppercase tracking-wider shadow-lg active:scale-[0.97] transition-transform"
            style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.roseDark})`, boxShadow: `0 8px 30px ${C.rose}44` }}>
            QUERO COMEÇAR AGORA
          </a>
          <div className="mt-6 space-y-3 text-left">
            {['Programa completo de exercícios', 'Dicas exclusivas', 'Grupo fechado de alunas', 'Aulas ao vivo com a Professora', 'Suporte', 'Atualizações constantes dos exercícios'].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[16px]" style={{ color: '#059669' }}>✅</span>
                <span className="text-[16px] font-medium" style={{ color: C.textDark }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guarantee */}
      <div className="px-5 py-10" style={{ background: C.bg }}>
        <div className="rounded-2xl p-7 text-center" style={{ background: C.bgCard, border: `3px solid ${C.roseMedium}` }}>
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-[22px] font-extrabold mb-4" style={{ color: C.textDark }}>GARANTIA INCONDICIONAL DE 90 DIAS</h3>
          <p className="text-[16px] leading-[1.7] mb-5" style={{ color: C.textMedium }}>
            Teste o YOGA FACIAL! por 90 dias. Se você não gostar, se achar que não é pra você, ou se não sentir que valeu a pena… <strong style={{ color: C.textDark }}>Basta cancelar.</strong>
          </p>
          <div className="flex flex-col items-center gap-2">
            {['Sem burocracia', 'Sem risco', 'Reembolso total'].map((t, i) => (
              <span key={i} className="px-5 py-2 rounded-full text-[14px] font-bold" style={{ background: C.roseLight, color: C.roseDark }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher */}
      <div className="px-5 py-10" style={{ background: C.bgCard }}>
        <div className="text-center mb-5">
          <p className="text-[15px] font-bold uppercase tracking-widest mb-2" style={{ color: C.textLight }}>Sua Professora</p>
          <h3 className="text-[26px] font-extrabold" style={{ color: C.textDark }}>Michele Negrini</h3>
        </div>
        <div className="flex justify-center mb-5">
          <img src="https://xyzgvsuttwrvbyyxdppq.supabase.co/storage/v1/object/public/imagens/michele.png"
            alt="Michele Negrini" className="w-36 h-36 rounded-full object-cover shadow-lg" style={{ border: `4px solid ${C.roseMedium}` }} />
        </div>
        <p className="text-[16px] leading-[1.7] text-center mb-5" style={{ color: C.textMedium }}>
          Especialista em beleza natural e rejuvenescimento facial. Michele desenvolveu um método único que combina fisiologia muscular com estética, ajudando <strong style={{ color: C.textDark }}>milhares de mulheres</strong> a recuperarem a autoestima sem intervenções cirúrgicas.
        </p>
        <div className="rounded-xl p-5 mb-4" style={{ background: C.roseLight }}>
          <p className="text-[16px] italic text-center leading-[1.6]" style={{ color: C.textDark }}>
            "Meu objetivo é te mostrar que a beleza natural é a mais poderosa que existe. Seu rosto tem um potencial incrível que só precisa do estímulo certo."
          </p>
        </div>
        <p className="text-center text-[16px] font-bold" style={{ color: C.roseDark }}>@michelenegrini</p>
      </div>

      {/* FAQ */}
      <div className="px-5 py-10" style={{ background: C.bg }}>
        <div className="text-center mb-6">
          <h3 className="text-[24px] font-extrabold" style={{ color: C.textDark }}>Dúvidas Frequentes</h3>
          <p className="text-[16px] mt-2" style={{ color: C.textMedium }}>Tudo o que você precisa saber antes de começar.</p>
        </div>
        <div className="space-y-3">
          <FAQ q="Em quanto tempo vejo resultados?" a="A maioria das alunas relata mudanças perceptíveis entre 2 a 4 semanas de prática constante. Resultados mais expressivos aparecem após 60 dias." colors={C} />
          <FAQ q="Preciso usar algum produto junto?" a="Não! O método funciona apenas com exercícios faciais. Nenhum creme, sérum ou aparelho é necessário." colors={C} />
          <FAQ q="Quanto tempo por dia preciso?" a="Apenas 10 a 15 minutos por dia são suficientes para ver resultados reais." colors={C} />
          <FAQ q="É para qualquer idade?" a="Sim! O método funciona para mulheres de todas as idades. Quanto antes começar, melhores e mais rápidos os resultados." colors={C} />
          <FAQ q="Posso cancelar?" a="Sim! Você tem 90 dias de garantia incondicional. Se não gostar, basta cancelar e recebe 100% do reembolso." colors={C} />
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-5 py-10 text-center" style={{ background: C.bgCard }}>
        <p className="text-[18px] font-medium mb-5" style={{ color: C.textMedium }}>Ainda com dúvidas? Comece hoje e comprove os resultados.</p>
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
          className="block w-full py-5 rounded-2xl text-white font-extrabold text-[18px] uppercase tracking-wider shadow-lg active:scale-[0.97] transition-transform mb-8"
          style={{ background: `linear-gradient(135deg, ${C.rose}, ${C.roseDark})`, boxShadow: `0 8px 30px ${C.rose}44` }}>
          QUERO COMEÇAR AGORA
        </a>
      </div>

      {/* Footer */}
      <footer className="px-5 py-8 text-center space-y-3" style={{ background: C.bg, borderTop: `1px solid ${C.border}` }}>
        <span className="text-3xl block">💆‍♀️</span>
        <p className="text-[18px] font-bold" style={{ color: C.textDark }}>YOGA FACIAL!</p>
        <p className="text-[15px]" style={{ color: C.textMedium }}>Seu rosto mais firme começa aqui.</p>
        <p className="text-[13px]" style={{ color: C.textLight }}>© 2026 Yoga Facial!. Todos os direitos reservados.</p>
      </footer>
    </>
  );
}
