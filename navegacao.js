'use strict';

const abasPagina = Array.from(document.querySelectorAll('[role="tab"]'));
const paineisPagina = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const seletorPagina = document.querySelector('.view-tabs');
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
const abaSobre = document.getElementById('tab-sobre');
const chaveSobreVisto = 'central-alertas-sobre-visto';
const eventoReacoesCarregadas = 'central-alertas:reacoes-carregadas';
let notificacaoSobreExibida = false;

function sobreJaFoiVisto() {
  try {
    return localStorage.getItem(chaveSobreVisto) === 'true';
  } catch (_) {
    return false;
  }
}

function marcarSobreComoVisto() {
  seletorPagina.classList.remove('attention-swing');

  if (abaSobre.classList.contains('has-notification')) {
    if (reduzirMovimento.matches) {
      abaSobre.classList.remove('has-notification', 'notification-leaving');
    } else {
      abaSobre.classList.add('notification-leaving');
    }
  }

  try {
    localStorage.setItem(chaveSobreVisto, 'true');
  } catch (_) {
    /* A notificação ainda funciona durante a sessão. */
  }
}

function prepararNotificacaoSobre() {
  if (notificacaoSobreExibida || sobreJaFoiVisto()) return;
  if (abaSobre.getAttribute('aria-selected') === 'true') return;

  notificacaoSobreExibida = true;
  abaSobre.classList.add('has-notification');
  if (!reduzirMovimento.matches) {
    seletorPagina.classList.add('attention-swing');
  }
}

function selecionarAba(aba, moverFoco = false) {
  const indiceAnterior = abasPagina.findIndex(item => item.getAttribute('aria-selected') === 'true');
  const indiceDestino = abasPagina.indexOf(aba);
  const mudouDeAba = indiceDestino !== indiceAnterior;

  abasPagina.forEach(item => {
    const ativa = item === aba;
    item.classList.toggle('is-active', ativa);
    item.setAttribute('aria-selected', String(ativa));
    item.tabIndex = ativa ? 0 : -1;
  });
  paineisPagina.forEach(painel => {
    painel.hidden = painel.id !== aba.getAttribute('aria-controls');
  });
  seletorPagina.classList.toggle('is-about', indiceDestino === 1);
  if (indiceDestino === 1) marcarSobreComoVisto();

  const painelAtivo = paineisPagina.find(painel => !painel.hidden);
  if (mudouDeAba && painelAtivo && !reduzirMovimento.matches && typeof painelAtivo.animate === 'function') {
    const direcao = indiceDestino > indiceAnterior ? 1 : -1;
    painelAtivo.animate(
      [
        { opacity: 0, transform: `translateX(${direcao * 34}px)` },
        { opacity: 1, transform: 'translateX(0)' }
      ],
      { duration: 320, easing: 'cubic-bezier(.22, 1, .36, 1)' }
    );
  }
  if (moverFoco) aba.focus();
}

abasPagina.forEach((aba, indice) => {
  aba.addEventListener('click', () => selecionarAba(aba));
  aba.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let destino = indice;
    if (event.key === 'ArrowLeft') destino = (indice - 1 + abasPagina.length) % abasPagina.length;
    if (event.key === 'ArrowRight') destino = (indice + 1) % abasPagina.length;
    if (event.key === 'Home') destino = 0;
    if (event.key === 'End') destino = abasPagina.length - 1;
    selecionarAba(abasPagina[destino], true);
  });
});

seletorPagina.addEventListener('animationend', event => {
  if (event.animationName === 'sobre-attention') {
    seletorPagina.classList.remove('attention-swing');
  }
});

abaSobre.addEventListener('animationend', event => {
  if (event.animationName === 'sobre-notification-out') {
    abaSobre.classList.remove('has-notification', 'notification-leaving');
  }
});

document.addEventListener(eventoReacoesCarregadas, prepararNotificacaoSobre, { once: true });

// Garante o funcionamento mesmo se o Firebase responder antes deste módulo iniciar.
if (document.documentElement.dataset.reacoesCarregadas === 'true') {
  prepararNotificacaoSobre();
}
