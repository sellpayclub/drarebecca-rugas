import React, { useEffect } from 'react';

// VSL Player for Video 02 - NEW video embed
const VSLPlayer02 = React.memo(() => (
  <div className="w-full">
    <div dangerouslySetInnerHTML={{ __html: `
      <div id="ifr_6a0a1868dca0bf66780dbe8f_wrapper" style="margin: 0 auto; width: 100%; ">
        <div style="position: relative; padding: 56.25% 0 0 0;" id="ifr_6a0a1868dca0bf66780dbe8f_aspect">
          <iframe frameborder="0" allowfullscreen src="about:blank" id="ifr_6a0a1868dca0bf66780dbe8f" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" referrerpolicy="origin" onload="this.onload=null, this.src='https://scripts.converteai.net/ceaefeeb-feef-4b52-8911-9ec9de0d5b6b/players/6a0a1868dca0bf66780dbe8f/v4/embed.html' +(location.search||'?') +'&vl=' +encodeURIComponent(location.href)"></iframe>
        </div>
      </div>
    `}} />
  </div>
));

export default function Video02Page() {
  // Load SmartPlayer script
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
    s.async = true;
    document.head.appendChild(s);
    return () => {
      document.head.removeChild(s);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-emerald-100 flex flex-col items-center">
      {/* 100% Mobile App Container Constraint */}
      <div className="w-full max-w-[440px] mx-auto bg-slate-50 min-h-[100dvh] flex flex-col relative shadow-2xl shadow-slate-300">
        
        {/* HEADER SITE DE NOTÍCIAS - GLOBO NEWS STYLE */}
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

        <main className="flex-1 w-full px-6 py-8 flex flex-col relative overflow-y-auto">
          <div className="flex-1 flex flex-col">
            <div className="mb-6 space-y-3 px-1">
              <h1 className="text-[22px] sm:text-[26px] font-black text-slate-900 leading-snug text-center text-balance">
                Especialista revela <span className="text-red-600">verdadeiro motivo escondido na pele</span>, que está causando <span className="underline decoration-red-500 decoration-[3px] underline-offset-4">envelhecimento precoce</span>, e revela como se livrar das bactérias para <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg">parecer até 5 anos mais jovem</span> usando vinagre de maçã!
              </h1>
            </div>

            <div className="relative w-full rounded-3xl overflow-hidden shadow-xl shadow-slate-200 border border-slate-200 bg-black min-h-[200px] flex items-center justify-center">
              <VSLPlayer02 />
            </div>


          </div>
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
