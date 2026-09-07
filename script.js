'use strict';

import { db, collection, getDocs } from "./firebase.js";
import { obterUsuarioAtual } from "./auth.js";
import { abrirCorrecaoNoticia } from "./correcoes.js";

async function obterNoticias() {
    const snapshot = await getDocs(collection(db, "noticias"));

    const noticias = snapshot.docs.map((documento) => {
        return {
            id: documento.id,
            ...documento.data()
        };
    });

    return noticias;
}

const feed = document.getElementById('noticias');
const statusNoticias = document.getElementById('status');
const formatadorData = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });
const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let sequenciaCard = 0;

function temValor(valor) {
  return valor !== null && valor !== undefined && (typeof valor === 'number' ? Number.isFinite(valor) : String(valor).trim() !== '');
}
function elemento(tag, classe, texto) {
  const node = document.createElement(tag);
  if (classe) node.className = classe;
  if (temValor(texto)) node.textContent = String(texto);
  return node;
}
function formatarData(valor) {
  if (!temValor(valor)) return '';
  // Datas sem horário não sofrem deslocamento de fuso.
  const texto = String(valor);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return '';
  const data = new Date(texto + 'T00:00:00Z');
  return Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== texto ? '' : formatadorData.format(data);
}
function formatarMoeda(valor) {
  return temValor(valor) && Number.isFinite(Number(valor)) ? formatadorMoeda.format(Number(valor)) : '';
}
function urlSegura(valor) {
  try { const url = new URL(valor); return ['https:', 'http:'].includes(url.protocol) ? url : null; } catch (_) { return null; }
}
function criarPreviewMateria(materia) {
  if (!materia || typeof materia !== 'object') return null;
  const url = urlSegura(materia.url);
  const preview = elemento(url ? 'a' : 'div', 'source-preview');
  if (url) {
    preview.href = url.href;
    preview.target = '_blank';
    preview.rel = 'noopener noreferrer';
    preview.setAttribute('aria-label', `${materia.titulo || materia.fonte || 'Matéria original'} (abre em nova aba)`);
  }
  const icon = elemento('span', 'source-icon', '▤');
  icon.setAttribute('aria-hidden', 'true');
  const copy = elemento('div', 'source-copy');
  if (temValor(materia.fonte)) copy.append(elemento('span', 'source-name', materia.fonte));
  if (temValor(materia.titulo)) copy.append(elemento('span', 'source-title', materia.titulo));
  if (url) copy.append(elemento('span', 'source-domain', url.hostname));
  preview.append(icon, copy);
  if (url) { const arrow = elemento('span', 'external-icon', '↗'); arrow.setAttribute('aria-hidden', 'true'); preview.append(arrow); }
  return preview;
}
function criarInformacoesOcorrido(ocorrido = {}) {
  const campos = [
    ['Idade da vítima', ocorrido.idadeVitima, v => `${v} anos`],
    ['Cidade', ocorrido.cidade], ['Estado', ocorrido.estado],
    ['Data do ocorrido', ocorrido.data, formatarData], ['Sexo da vítima', ocorrido.sexo],
    ['Valor perdido', ocorrido.valorPerdido, formatarMoeda], ['Tipo de ataque', ocorrido.tipoAtaque],
    ['Instituição mencionada', ocorrido.instituicao], ['Canal utilizado', ocorrido.canal], ['Categoria', ocorrido.categoria]
  ];
  const lista = elemento('dl');
  for (const [nome, valor, formatar] of campos) {
    if (!temValor(valor)) continue;
    const texto = formatar ? formatar(valor) : valor;
    if (!temValor(texto)) continue;
    const item = elemento('div');
    item.append(elemento('dt', '', nome), elemento('dd', '', texto));
    lista.append(item);
  }
  const conteudo = elemento('div', 'details-content');
  conteudo.append(elemento('h4', '', 'Informações do ocorrido'));
  conteudo.append(lista.childElementCount ? lista : elemento('p', '', 'Esta notícia não possui detalhes adicionais.'));
  return conteudo;
}
function criarCardNoticia(noticia) {
  const card = elemento('article', 'card');
  const ocorrido = noticia.ocorrido || {};
  if (temValor(ocorrido.categoria)) card.append(elemento('span', 'card-category', ocorrido.categoria));
  if (temValor(noticia.titulo)) card.append(elemento('h3', '', noticia.titulo));
  if (temValor(noticia.resumo)) card.append(elemento('p', 'summary', noticia.resumo));
  if (temValor(noticia.boaPratica)) {
    const pratica = elemento('div', 'practice');
    pratica.append(elemento('strong', '', 'Boa prática para evitar o ataque:'), elemento('p', '', noticia.boaPratica));
    card.append(pratica);
  }
  const preview = criarPreviewMateria(noticia.materia);
  if (preview) card.append(preview);
  const footer = elemento('footer', 'card-footer');
  const data = formatarData(noticia.dataPublicacao);
  const dataElemento = elemento(data ? 'time' : 'span', '', data);
  if (data) { dataElemento.dateTime = noticia.dataPublicacao; dataElemento.setAttribute('aria-label', `Publicado em ${data}`); }
  const botao = elemento('button', 'icon-button details-button', '⋯');
  botao.type = 'button';
  botao.setAttribute('aria-label', 'Mostrar mais informações');
  botao.setAttribute('aria-expanded', 'false');
  const detalhes = elemento('div', 'details');
  detalhes.id = `ocorrido-${++sequenciaCard}`;
  detalhes.setAttribute('aria-hidden', 'true');
  detalhes.inert = true;
  botao.setAttribute('aria-controls', detalhes.id);
  const inner = elemento('div', 'details-inner');
  inner.append(criarInformacoesOcorrido(ocorrido));
  const acoesCorrecao = elemento('div', 'report-actions');
  const informarErro = elemento('button', 'report-error', 'Informar erro na notícia');
  informarErro.type = 'button';
  informarErro.addEventListener('click', () => abrirCorrecaoNoticia(noticia, informarErro));
  acoesCorrecao.append(informarErro);
  inner.append(acoesCorrecao);
  detalhes.append(inner);
  botao.addEventListener('click', () => {
    const aberto = card.classList.toggle('is-expanded');
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Ocultar informações' : 'Mostrar mais informações');
    botao.textContent = aberto ? '×' : '⋯';
    detalhes.setAttribute('aria-hidden', String(!aberto));
    detalhes.inert = !aberto;
  });
  footer.append(dataElemento, botao);
  card.append(footer, detalhes);
  return card;
}
function renderizarNoticias(noticias) {
  if (!Array.isArray(noticias) || noticias.some(n => !n || typeof n !== 'object' || Array.isArray(n))) throw new TypeError('Esperado um array de notícias');
  feed.replaceChildren();
  feed.setAttribute('aria-busy', 'false');
  if (!noticias.length) {
    feed.append(elemento('div', 'state', 'Nenhuma notícia encontrada no momento.'));
    statusNoticias.textContent = 'Nenhuma notícia encontrada no momento.';
    return;
  }
  const fragmento = document.createDocumentFragment();
  noticias.forEach(n => fragmento.append(criarCardNoticia(n)));
  feed.append(fragmento);
  statusNoticias.textContent = `${noticias.length} notícias carregadas.`;
}
function mostrarCarregamento() {
  feed.replaceChildren();
  feed.setAttribute('aria-busy', 'true');
  statusNoticias.textContent = 'Carregando notícias…';
  for (let i = 0; i < 3; i++) {
    const card = elemento('div', 'card');
    card.setAttribute('aria-hidden', 'true');
    for (let j = 0; j < 4; j++) card.append(elemento('div', 'skeleton-line'));
    feed.append(card);
  }
}
function mostrarErro() {
  feed.setAttribute('aria-busy', 'false');
  const estado = elemento('div', 'state');
  estado.append(elemento('p', '', 'Não foi possível carregar as notícias.'));
  const tentar = elemento('button', 'retry', 'Tentar novamente');
  tentar.type = 'button';
  tentar.addEventListener('click', carregarNoticias);
  estado.append(tentar);
  feed.replaceChildren(estado);
  statusNoticias.textContent = 'Não foi possível carregar as notícias.';
}
async function carregarNoticias() {
  mostrarCarregamento();
  try { renderizarNoticias(await obterNoticias()); } catch (_) { mostrarErro(); }
}
function iniciarTema() {
  const botao = document.getElementById('tema');
  function atualizarBotao() {
    const escuro = document.documentElement.dataset.theme === 'dark';
    botao.firstElementChild.textContent = escuro ? '☼' : '☾';
    const descricao = escuro ? 'Ativar tema claro' : 'Ativar tema escuro';
    botao.setAttribute('aria-label', descricao);
    botao.title = descricao;
  }
  botao.addEventListener('click', () => {
    const tema = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = tema;
    try { localStorage.setItem('central-alertas-tema', tema); } catch (_) { /* Preferência apenas nesta sessão quando bloqueado. */ }
    atualizarBotao();
  });
  atualizarBotao();
}
iniciarTema();
carregarNoticias();
