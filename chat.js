// DEMONSTRAÇÃO de assistente no site (baseado no assistente do site da Conde de Porto Alegre).
// Não usa IA de verdade: responde com textos do próprio site e monta o agendamento em etapas.
// Na versão contratada, o mesmo painel liga a um assistente real. Reaproveita CLINIC de script.js.

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const TREATMENTS = [
  ['Clínico geral', 'Clínico geral'], ['Limpeza', 'Limpeza'], ['Restaurações', 'Restaurações'], ['Clareamento', 'Clareamento'],
  ['Extração', 'Extração'], ['Prótese', 'Prótese'], ['Implantes', 'Implantes'], ['Ainda não sei', ''],
];

const CFG = {
  title: 'Assistente Dr. Alexandre',
  greeting: 'Oi! Sou o assistente virtual do Dr. Alexandre Almeida (demonstração). Posso tirar dúvidas sobre os tratamentos e o atendimento em casa e deixar sua consulta encaminhada. Como posso ajudar?',
  quick: [['Atende em casa?', 'homecare'], ['Quais tratamentos?', 'servicos'], ['Como é a 1ª consulta?', 'primeira'], ['Quanto custa?', 'custo'], ['Estou com dor agora', 'urgencia'], ['Como falar com ele', 'contato']],
  faq: [
    { id: 'homecare', words: ['casa', 'domicilio', 'home care', 'homecare', 'acamado', 'idoso', 'locomocao', 'nao consigo sair', 'vai ate', 'bairro', 'regiao'], booking: true, text: 'Sim! O Dr. Alexandre faz atendimento home care, a domicílio, com os mesmos cuidados de biossegurança do consultório. É ideal para idosos, acamados, pessoas com mobilidade reduzida ou quem prefere ser atendido em casa. Ao agendar, informe o seu bairro para ele confirmar a disponibilidade.' },
    { id: 'servicos', words: ['especialidade', 'trata', 'servico', 'fazem', 'faz o que', 'atende o que'], text: 'Clínico geral, restaurações, clareamento, extrações, prótese, limpeza e implantes. Ele é clínico geral e atua em implantodontia.' },
    { id: 'implante', words: ['implante', 'implantodontia', 'dente perdido', 'perdi dente', 'perdi um dente'], booking: true, text: 'Implantes trazem um sorriso completo e duradouro, repondo dentes perdidos. O Dr. Alexandre atua em implantodontia, e o planejamento começa por uma avaliação.' },
    { id: 'protese', words: ['protese', 'dentadura', 'chapa'], text: 'As próteses devolvem funcionalidade e autoestima para mastigar, falar e sorrir sem preocupação.' },
    { id: 'clareamento', words: ['clareamento', 'clarear', 'branco', 'branquear', 'amarelado'], text: 'O clareamento deixa o sorriso mais branco e confiante, com orientação em cada etapa.' },
    { id: 'restauracao', words: ['restauracao', 'carie', 'obturacao', 'buraco', 'quebrou um pedaco'], text: 'As restaurações devolvem a estética e a função do seu sorriso, com acabamento natural.' },
    { id: 'extracao', words: ['extracao', 'extrair', 'arrancar', 'tirar dente', 'siso'], text: 'As extrações são feitas com segurança e menos desconforto, sempre com planejamento.' },
    { id: 'limpeza', words: ['limpeza', 'tartaro', 'profilaxia', 'check', 'gengiva'], text: 'Prevenção é o melhor tratamento: a limpeza remove o tártaro e vem com orientação de higiene para o dia a dia.' },
    { id: 'custo', words: ['custa', 'preco', 'valor', 'caro', 'orcamento', 'quanto'], booking: true, text: 'O valor depende do tratamento e do planejamento de cada caso, por isso não passo preço pelo chat. A avaliação vem primeiro: você sai sabendo etapas, prazos e valores, sem compromisso.' },
    { id: 'pagamento', words: ['parcel', 'pagamento', 'cartao', 'pix', 'pagar', 'convenio', 'plano'], text: 'As opções de pagamento são apresentadas junto com o plano de tratamento. Se quiser saber antes, é só perguntar pelo WhatsApp (21) 97465-8280.' },
    { id: 'primeira', words: ['primeira consulta', 'como funciona', 'avaliacao', 'o que acontece'], text: 'Funciona em 4 passos: 1) mensagem, em que você conta o que precisa e escolhe consultório ou casa; 2) avaliação, com exame clínico cuidadoso; 3) plano claro, com etapas, prazos e valores; 4) você decide, e só começamos quando se sentir seguro.' },
    { id: 'medo', words: ['medo', 'receio', 'ansios', 'nervos', 'pavor'], text: 'Você pode contar isso logo no agendamento. A consulta começa com conversa, cada etapa é explicada antes e você pode pedir pausa a qualquer momento.' },
    { id: 'urgencia', words: ['urgencia', 'emergencia', 'dor forte', 'inchaco', 'inchado', 'quebrou', 'quebrado', 'sangr', 'dor agora', 'doendo', 'dor', 'sos'], cta: { label: 'Falar no WhatsApp agora', href: `https://wa.me/${CLINIC.whatsapp}`, external: true }, text: 'Sinto muito que esteja com dor. Mande uma mensagem para o Dr. Alexandre pelo WhatsApp contando o que está sentindo, que ele te orienta e encaixa o atendimento o quanto antes. Se houver inchaço forte no rosto, febre ou dificuldade para respirar ou engolir, procure um pronto-socorro.' },
    { id: 'contato', words: ['onde', 'endereco', 'fica', 'local', 'telefone', 'whatsapp', 'ligar', 'contato', 'instagram', 'horario', 'abre', 'sabado'], text: 'O agendamento é feito pelo WhatsApp (21) 97465-8280, tanto para o consultório quanto para o atendimento em casa. Dias, horários e local são combinados direto com ele. No Instagram, ele está como @dr.xand.' },
    { id: 'cro', words: ['cro', 'registro', 'formado', 'dentista mesmo', 'quem e'], text: 'O Dr. Alexandre Almeida é cirurgião-dentista registrado no CRO-RJ sob o nº 58064. É clínico geral e atua em implantodontia.' },
  ],
  steps: [
    { key: 'treatment', ask: 'Vamos deixar sua consulta encaminhada. Qual tratamento você procura?', options: () => TREATMENTS },
    { key: 'place', ask: 'Prefere ser atendido no consultório ou em casa?', options: () => [['No consultório', 'consultório'], ['Em casa (home care)', 'casa']] },
    { key: 'area', text: true, skip: 'Prefiro dizer depois', when: (d) => d.place === 'casa', ask: 'Em qual bairro você está?', clean: (t) => t.slice(0, 40) },
    { key: 'day', ask: 'Qual o melhor dia?', options: () => [['O quanto antes', 'O quanto antes'], ['Durante a semana', 'Durante a semana'], ['No sábado', 'No sábado']] },
    { key: 'period', ask: 'E o período?', options: () => [['Manhã', 'manhã'], ['Tarde', 'tarde']] },
    { key: 'name', text: true, ask: 'Qual o seu nome?', clean: (t) => t.split(/\s+/)[0].slice(0, 30) },
  ],
  message: (d) => {
    const lines = [`Olá, ${CLINIC.name}! Gostaria de agendar uma consulta.`];
    lines.push(d.treatment ? `Interesse: ${d.treatment}.` : 'Ainda não sei qual tratamento.');
    lines.push(d.place === 'casa' ? `Prefiro atendimento em casa (home care)${d.area ? `, no bairro ${d.area}` : ''}.` : 'Prefiro atendimento no consultório.');
    lines.push(`Quando: ${d.day}, de ${d.period}.`);
    if (d.name) lines.push(`Nome: ${d.name}.`);
    return lines;
  },
  summary: (d) => `${d.treatment || 'avaliação'}, ${d.place === 'casa' ? `em casa${d.area ? ` (${d.area})` : ''}` : 'no consultório'}, ${d.day}, de ${d.period}`,
};

(() => {
  const root = document.createElement('div');
  root.className = 'chat';
  root.innerHTML = `
    <button type="button" class="chat-launcher" aria-label="Abrir assistente virtual" aria-expanded="false" aria-controls="chat-panel">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>
      <span>Tire suas dúvidas</span>
    </button>
    <section class="chat-panel" id="chat-panel" role="dialog" aria-label="${CFG.title}" hidden>
      <header class="chat-head">
        <div>
          <strong>${CFG.title}</strong>
          <small>Demonstração · respostas baseadas neste site</small>
        </div>
        <button type="button" class="chat-close" aria-label="Fechar">×</button>
      </header>
      <div class="chat-log" role="log" aria-live="polite"></div>
      <div class="chat-quick"></div>
      <form class="chat-form" autocomplete="off">
        <input type="text" class="chat-input" placeholder="Digite sua dúvida..." aria-label="Digite sua dúvida" />
        <button type="submit" class="chat-send" aria-label="Enviar">→</button>
      </form>
      <p class="chat-note">O assistente não dá diagnóstico nem passa preço. O Dr. Alexandre confirma tudo.</p>
    </section>`;
  document.body.append(root);

  const launcher = root.querySelector('.chat-launcher');
  const panel = root.querySelector('.chat-panel');
  const log = root.querySelector('.chat-log');
  const quick = root.querySelector('.chat-quick');
  const form = root.querySelector('.chat-form');
  const input = root.querySelector('.chat-input');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let flow = null;
  let greeted = false;

  const scroll = () => { log.scrollTop = log.scrollHeight; };
  const addMsg = (who, text) => {
    const el = document.createElement('p');
    el.className = `chat-msg chat-${who}`;
    el.textContent = text;
    log.append(el);
    scroll();
    return el;
  };
  const addLink = (label, href, external = true) => {
    const a = document.createElement('a');
    a.className = 'chat-cta';
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    a.textContent = label;
    log.append(a);
    scroll();
  };
  const setQuick = (items) => {
    quick.replaceChildren();
    items.forEach(([label, fn]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat-chip';
      b.textContent = label;
      b.addEventListener('click', () => { addMsg('user', label); fn(); });
      quick.append(b);
    });
  };
  const bot = (text, after) => {
    const typing = addMsg('bot', '…');
    typing.classList.add('is-typing');
    setTimeout(() => {
      typing.classList.remove('is-typing');
      typing.textContent = text;
      scroll();
      after?.();
    }, reduce ? 0 : 650);
  };

  const answer = (id) => {
    const item = CFG.faq.find((f) => f.id === id);
    const text = typeof item.text === 'function' ? item.text() : item.text;
    bot(text, () => {
      if (item.cta) addLink(item.cta.label, item.cta.href, !!item.cta.external);
      menu(item.booking);
    });
  };
  const menu = (withBooking) => setQuick([
    ...CFG.quick.map(([label, id]) => [label, () => answer(id)]),
    ['Quero agendar', startFlow],
  ]);

  // Fluxo de agendamento (pré-agendamento: o Dr. Alexandre confirma)
  const cancel = () => { flow = null; bot('Claro! Qual é a sua dúvida?', menu); };
  const startFlow = () => { flow = { i: -1, data: {}, text: null }; nextStep(); };
  const nextStep = () => {
    do { flow.i += 1; } while (flow.i < CFG.steps.length && CFG.steps[flow.i].when && !CFG.steps[flow.i].when(flow.data));
    if (flow.i >= CFG.steps.length) { finish(); return; }
    const step = CFG.steps[flow.i];
    if (step.text) {
      flow.text = step;
      bot(step.ask, () => { setQuick(step.skip ? [[step.skip, () => { flow.text = null; nextStep(); }]] : []); input.focus(); });
      return;
    }
    const opts = step.options(flow.data);
    bot(step.ask, () => setQuick([
      ...opts.map(([label, value]) => [label, () => { flow.data[step.key] = value; nextStep(); }]),
      ['Outra dúvida', cancel],
    ]));
  };
  const finish = () => {
    const d = flow.data;
    const lines = [...CFG.message(d), '(Pedido feito pelo assistente do site)'];
    const summary = CFG.summary(d);
    flow = null;
    bot(`Pronto${d.name ? `, ${d.name}` : ''}! Deixei seu pedido montado: ${summary}. Toque abaixo para enviar ao Dr. Alexandre, que confirma a disponibilidade com você.`, () => {
      addLink('Enviar no WhatsApp →', `https://api.whatsapp.com/send?phone=${CLINIC.whatsapp}&text=${encodeURIComponent(lines.join('\n'))}`);
      menu();
    });
  };

  const interpret = (text) => {
    const q = norm(text);
    if (/(agendar|marcar|reservar|quero ir)/.test(q) || (/(consulta|avaliacao)/.test(q) && !/(primeira|como funciona)/.test(q))) return 'agendar';
    let best = null; let bestScore = 0;
    CFG.faq.forEach((f) => {
      const score = f.words.reduce((n, w) => n + (q.includes(norm(w)) ? 1 : 0), 0);
      if (score > bestScore) { best = f.id; bestScore = score; }
    });
    return best;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMsg('user', text);
    if (flow && flow.text) {
      const step = flow.text;
      flow.data[step.key] = step.clean ? step.clean(text) : text;
      flow.text = null;
      nextStep();
      return;
    }
    if (flow) { bot('Para continuar o agendamento, escolha uma das opções acima. Se preferir, toque em "Outra dúvida".'); return; }
    const found = interpret(text);
    if (found === 'agendar') { startFlow(); return; }
    if (found) { answer(found); return; }
    bot('Não tenho essa informação com segurança. Posso deixar seu pedido encaminhado para o Dr. Alexandre, que responde direitinho. Quer agendar uma consulta?', () => setQuick([['Quero agendar', startFlow], ['Outra dúvida', cancel]]));
  });

  const open = () => {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    root.classList.add('is-open');
    if (!greeted) { greeted = true; addMsg('bot', CFG.greeting); menu(); }
    input.focus();
  };
  const close = () => {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-open');
    launcher.focus();
  };
  launcher.addEventListener('click', () => (panel.hidden ? open() : close()));
  root.querySelector('.chat-close').addEventListener('click', close);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !panel.hidden) close(); });
})();
