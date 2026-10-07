// Dados do dentista: troque aqui na versão de cada cliente
const CLINIC = {
  name: 'Dr. Alexandre Almeida',
  whatsapp: '5521974658280',
};

// Animação de entrada
const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('has-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => io.observe(item));
}
document.querySelector('#year').textContent = new Date().getFullYear();

// Agende sua consulta
const form = document.querySelector('#booking-form');
const preview = document.querySelector('#booking-preview');
const nameInput = document.querySelector('#booking-name');
const pain = document.querySelector('#pain');
const anxious = document.querySelector('#anxious');
const placeArea = document.querySelector('#place-area');
const state = { treatment: 'Clínico geral', place: 'No consultório', day: 'O quanto antes', period: 'tarde' };

const buildMessage = () => {
  const lines = [`Olá, ${CLINIC.name}! Gostaria de agendar uma consulta.`];
  lines.push(state.treatment ? `Interesse: ${state.treatment}.` : 'Ainda não sei qual tratamento.');
  if (state.place.startsWith('Em casa')) {
    const area = placeArea.value.trim();
    lines.push(`Prefiro atendimento em casa (home care)${area ? `, no bairro ${area}` : ''}.`);
  } else {
    lines.push('Prefiro atendimento no consultório.');
  }
  lines.push(`Quando: ${state.day}, de ${state.period}.`);
  if (pain.checked) lines.push('Estou com dor ou incômodo.');
  if (anxious.checked) lines.push('Tenho receio de dentista — prefiro um atendimento com calma.');
  const name = nameInput.value.trim();
  if (name) lines.push(`Nome: ${name}.`);
  return lines.join('\n');
};
const render = () => { preview.textContent = buildMessage(); };

const selectChip = (chip) => {
  const group = chip.parentElement;
  group.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
  state[group.dataset.group] = chip.dataset.value;
  if (group.dataset.group === 'place') placeArea.hidden = !chip.dataset.value.startsWith('Em casa');
  render();
};
form.querySelectorAll('.chip').forEach((chip) => chip.addEventListener('click', () => selectChip(chip)));
[pain, anxious].forEach((el) => el.addEventListener('change', render));
nameInput.addEventListener('input', render);
placeArea.addEventListener('input', render);

// Cards de tratamento e o botão do home care já preenchem o formulário
const prefill = (group, value) => {
  const chip = form.querySelector(`[data-group="${group}"] [data-value="${value}"]`);
  if (chip) selectChip(chip);
  document.querySelector('#agendar').scrollIntoView({ behavior: 'smooth' });
};
document.querySelectorAll('[data-treatment]').forEach((button) => {
  button.addEventListener('click', () => prefill('treatment', button.dataset.treatment));
});
document.querySelectorAll('[data-place]').forEach((button) => {
  button.addEventListener('click', () => prefill('place', button.dataset.place));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  window.open(`https://api.whatsapp.com/send?phone=${CLINIC.whatsapp}&text=${encodeURIComponent(buildMessage())}`, '_blank', 'noopener');
});
render();

// Botão flutuante
const floatButton = document.querySelector('.whatsapp-float');
const bookingSection = document.querySelector('#agendar');
if (floatButton && bookingSection && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => floatButton.classList.toggle('is-hidden', entry.isIntersecting), { threshold: 0.1 })
    .observe(bookingSection);
}

// Dúvidas: abrir e fechar com animação suave da altura
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.faq-list details').forEach((details) => {
  const summary = details.querySelector('summary');
  const answer = details.querySelector('p');
  let animation = null;

  const finish = (open) => {
    details.open = open;
    details.style.height = '';
    details.classList.remove('is-closing');
    animation = null;
  };

  summary.addEventListener('click', (event) => {
    if (reduceMotion || !details.animate) return;
    event.preventDefault();
    const closing = details.open && !details.classList.contains('is-closing');
    const startHeight = `${details.offsetHeight}px`;
    animation?.cancel();

    if (closing) {
      details.classList.add('is-closing');
      animation = details.animate({ height: [startHeight, `${summary.offsetHeight}px`] }, { duration: 320, easing: 'cubic-bezier(.4, 0, .2, 1)' });
      animation.onfinish = () => finish(false);
    } else {
      details.classList.remove('is-closing');
      details.style.height = startHeight;
      details.open = true;
      const endHeight = `${summary.offsetHeight + answer.offsetHeight + parseFloat(getComputedStyle(answer).marginBottom) + parseFloat(getComputedStyle(answer).marginTop)}px`;
      animation = details.animate({ height: [startHeight, endHeight] }, { duration: 380, easing: 'cubic-bezier(.2, .7, .3, 1)' });
      answer.animate({ opacity: [0, 1], transform: ['translateY(-6px)', 'none'] }, { duration: 380, delay: 60, easing: 'ease-out', fill: 'backwards' });
      animation.onfinish = () => finish(true);
    }
  });
});
