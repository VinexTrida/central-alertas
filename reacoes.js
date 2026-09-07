'use strict';

import {
    db,
    doc,
    getDoc,
    runTransaction,
    serverTimestamp
} from "./firebase.js";

import { obterUsuarioAtual } from "./auth.js";
const PAGINA_ID = "central-de-alertas";

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

                if (reacaoAnterior === "like") {
                    likes -= 1;
                }

                if (reacaoAnterior === "dislike") {
                    dislikes -= 1;
                }

                if (minhaReacao === "like") {
                    likes += 1;
                }

                if (minhaReacao === "dislike") {
                    dislikes += 1;
                }

                likes = Math.max(0, likes);
                dislikes = Math.max(0, dislikes);

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

let estadoReacoes = {
    likes: 0,
    dislikes: 0,
    minhaReacao: null
};


let salvandoReacao = false;

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

function definirEstadoCarregando(carregando) {

    salvandoReacao = carregando;


    if (botaoLike) {
        botaoLike.disabled = carregando;
    }


    if (botaoDislike) {
        botaoDislike.disabled = carregando;
    }
}

async function processarReacao(tipo) {

    if (salvandoReacao) {
        return;
    }

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

    } catch (erro) {

        console.error(
            "Erro ao salvar reação:",
            erro
        );

        estadoReacoes = estadoAnterior;

        atualizarInterface();

    } finally {

        definirEstadoCarregando(false);
    }
}

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

export {
    repositorioReacoes
};
