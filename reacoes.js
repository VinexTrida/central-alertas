'use strict';

import {
    db,
    doc,
    getDoc,
    runTransaction,
    serverTimestamp
} from "./firebase.js";

import { obterUsuarioAtual } from "./auth.js";


// ======================================================
// CONFIGURAÇÃO
// ======================================================

const PAGINA_ID = "central-de-alertas";


// ======================================================
// LOCALIZA OS ELEMENTOS DA INTERFACE
// ======================================================
//
// Foram colocadas várias alternativas de seletores para facilitar
// a compatibilidade com o HTML que já foi criado pelo Codex.
//

function encontrarElemento(seletores) {
    for (const seletor of seletores) {
        const elemento = document.querySelector(seletor);

        if (elemento) {
            return elemento;
        }
    }

    return null;
}


const botaoLike = encontrarElemento([
  "#like"
]);


const botaoDislike = encontrarElemento([
  "#dislike",
]);


const contadorLikes = encontrarElemento([
  "#like-count"
]);


const popupLike = encontrarElemento([
  "#dialog-like"
]);


const botaoFecharPopupLike = encontrarElemento([
  "#fechar-like-popup"
]);


const linkComentario = encontrarElemento([
  "#link-comentario"
]);


// ======================================================
// REPOSITÓRIO FIREBASE
// ======================================================

const repositorioReacoes = {

    async carregar() {

        const usuario = await obterUsuarioAtual();


        const paginaRef = doc(
            db,
            "paginas",
            PAGINA_ID
        );


        const reacaoRef = doc(
            db,
            "paginas",
            PAGINA_ID,
            "reacoes",
            usuario.uid
        );


        const [
            paginaSnapshot,
            reacaoSnapshot
        ] = await Promise.all([
            getDoc(paginaRef),
            getDoc(reacaoRef)
        ]);


        const dadosPagina = paginaSnapshot.exists()
            ? paginaSnapshot.data()
            : {};


        const minhaReacao = reacaoSnapshot.exists()
            ? reacaoSnapshot.data().tipo
            : null;


        return {
            likes: Number(dadosPagina.likes ?? 0),
            dislikes: Number(dadosPagina.dislikes ?? 0),
            minhaReacao
        };
    },


    async salvar(minhaReacao) {

        if (
            minhaReacao !== "like" &&
            minhaReacao !== "dislike" &&
            minhaReacao !== null
        ) {
            throw new Error("Reação inválida.");
        }


        const usuario = await obterUsuarioAtual();


        const paginaRef = doc(
            db,
            "paginas",
            PAGINA_ID
        );


        const reacaoRef = doc(
            db,
            "paginas",
            PAGINA_ID,
            "reacoes",
            usuario.uid
        );


        const estadoAtualizado = await runTransaction(
            db,
            async (transaction) => {

                // IMPORTANTE:
                // todas as leituras são feitas antes das gravações.

                const paginaSnapshot =
                    await transaction.get(paginaRef);

                const reacaoSnapshot =
                    await transaction.get(reacaoRef);


                const dadosPagina =
                    paginaSnapshot.exists()
                        ? paginaSnapshot.data()
                        : {};


                let likes =
                    Number(dadosPagina.likes ?? 0);

                let dislikes =
                    Number(dadosPagina.dislikes ?? 0);


                const reacaoAnterior =
                    reacaoSnapshot.exists()
                        ? reacaoSnapshot.data().tipo
                        : null;


                // --------------------------------------------------
                // REMOVE A REAÇÃO ANTERIOR DOS TOTAIS
                // --------------------------------------------------

                if (reacaoAnterior === "like") {
                    likes -= 1;
                }

                if (reacaoAnterior === "dislike") {
                    dislikes -= 1;
                }


                // --------------------------------------------------
                // ADICIONA A NOVA REAÇÃO
                // --------------------------------------------------

                if (minhaReacao === "like") {
                    likes += 1;
                }

                if (minhaReacao === "dislike") {
                    dislikes += 1;
                }


                // Segurança adicional
                likes = Math.max(0, likes);
                dislikes = Math.max(0, dislikes);


                // --------------------------------------------------
                // ATUALIZA OS TOTAIS DA PÁGINA
                // --------------------------------------------------

                transaction.set(
                    paginaRef,
                    {
                        likes,
                        dislikes
                    },
                    {
                        merge: true
                    }
                );


                // --------------------------------------------------
                // SALVA OU REMOVE O VOTO DO USUÁRIO
                // --------------------------------------------------

                if (minhaReacao === null) {

                    if (reacaoSnapshot.exists()) {
                        transaction.delete(reacaoRef);
                    }

                } else {

                    transaction.set(
                        reacaoRef,
                        {
                            tipo: minhaReacao,
                            atualizadoEm: serverTimestamp()
                        }
                    );
                }


                return {
                    likes,
                    dislikes,
                    minhaReacao
                };
            }
        );


        return estadoAtualizado;
    }
};


// ======================================================
// ESTADO LOCAL DA INTERFACE
// ======================================================

let estadoReacoes = {
    likes: 0,
    dislikes: 0,
    minhaReacao: null
};


let salvandoReacao = false;


// ======================================================
// ATUALIZA A INTERFACE
// ======================================================

function atualizarInterface() {

    if (contadorLikes) {
        contadorLikes.textContent =
            String(estadoReacoes.likes);
    }


    if (botaoLike) {

        const selecionado =
            estadoReacoes.minhaReacao === "like";


        botaoLike.classList.toggle(
            "ativo",
            selecionado
        );


        botaoLike.classList.toggle(
            "selecionado",
            selecionado
        );


        botaoLike.classList.toggle(
            "is-active",
            selecionado
        );


        botaoLike.setAttribute(
            "aria-pressed",
            String(selecionado)
        );
    }


    if (botaoDislike) {

        const selecionado =
            estadoReacoes.minhaReacao === "dislike";


        botaoDislike.classList.toggle(
            "ativo",
            selecionado
        );


        botaoDislike.classList.toggle(
            "selecionado",
            selecionado
        );


        botaoDislike.classList.toggle(
            "is-active",
            selecionado
        );


        botaoDislike.setAttribute(
            "aria-pressed",
            String(selecionado)
        );
    }
}


// ======================================================
// BLOQUEIA OS BOTÕES DURANTE A GRAVAÇÃO
// ======================================================

function definirEstadoCarregando(carregando) {

    salvandoReacao = carregando;


    if (botaoLike) {
        botaoLike.disabled = carregando;
    }


    if (botaoDislike) {
        botaoDislike.disabled = carregando;
    }
}


// ======================================================
// POPUP DE AGRADECIMENTO
// ======================================================

function abrirPopupLike() {

    if (popupLike && !popupLike.open) {
        popupLike.showModal();
    }
}


if (botaoFecharPopupLike && popupLike) {
    botaoFecharPopupLike.addEventListener(
        "click",
        () => popupLike.close()
    );
}


if (linkComentario && popupLike) {
    linkComentario.addEventListener(
        "click",
        () => popupLike.close()
    );
}


// ======================================================
// PROCESSA CLIQUE EM UMA REAÇÃO
// ======================================================

async function processarReacao(tipo) {

    if (salvandoReacao) {
        return;
    }


    // Se clicar novamente na reação atual,
    // ela é removida.

    const novaReacao =
        estadoReacoes.minhaReacao === tipo
            ? null
            : tipo;


    const estadoAnterior = {
        ...estadoReacoes
    };


    definirEstadoCarregando(true);


    try {

        const novoEstado =
            await repositorioReacoes.salvar(
                novaReacao
            );


        estadoReacoes = novoEstado;

        atualizarInterface();


        // Exibe o convite somente quando uma nova curtida
        // foi confirmada pelo Firebase.

        if (novaReacao === "like") {
            abrirPopupLike();
        }

    } catch (erro) {

        console.error(
            "Erro ao salvar reação:",
            erro
        );


        // Volta para o estado anterior caso
        // a gravação falhe.

        estadoReacoes = estadoAnterior;

        atualizarInterface();

    } finally {

        definirEstadoCarregando(false);
    }
}


// ======================================================
// EVENTOS
// ======================================================

if (botaoLike) {

    botaoLike.addEventListener(
        "click",
        () => {
            processarReacao("like");
        }
    );
}


if (botaoDislike) {

    botaoDislike.addEventListener(
        "click",
        () => {
            processarReacao("dislike");
        }
    );
}


// ======================================================
// CARREGA AS REAÇÕES AO ABRIR A PÁGINA
// ======================================================

async function inicializarReacoes() {

    try {

        definirEstadoCarregando(true);


        estadoReacoes =
            await repositorioReacoes.carregar();


        atualizarInterface();

    } catch (erro) {

        console.error(
            "Erro ao carregar reações:",
            erro
        );

    } finally {

        definirEstadoCarregando(false);
    }
}


inicializarReacoes();


// ======================================================
// EXPORTAÇÃO
// ======================================================
//
// Mantemos o repositório exportado caso futuramente
// outras partes do site precisem utilizá-lo.
//

export {
    repositorioReacoes
};
