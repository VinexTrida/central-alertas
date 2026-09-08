'use strict';

const abasPagina = Array.from(document.querySelectorAll('[role="tab"]'));
const paineisPagina = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const seletorPagina = document.querySelector('.view-tabs');
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

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
