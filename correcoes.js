'use strict';

import {
    db,
    collection,
    addDoc,
    serverTimestamp
} from "./firebase.js";

import { obterUsuarioAtual } from "./auth.js";


// ======================================================
// ELEMENTOS DA INTERFACE
// ======================================================

const dialogCorrecao = document.getElementById('dialog-correcao');
const formCorrecao = document.getElementById('form-correcao');
const textoCorrecao = document.getElementById('correcao-texto');
const toastCorrecao = document.getElementById('correcao-toast');
const botaoFecharCorrecao = document.getElementById('fechar-correcao');

let noticiaEmCorrecao = null;
let origemCorrecao = null;
let temporizadorCorrecao;


// ======================================================
// ABRIR FORMULÁRIO
// ======================================================

function abrirCorrecaoNoticia(noticia, botaoOrigem) {

    noticiaEmCorrecao = noticia;
    origemCorrecao = botaoOrigem;

    formCorrecao.reset();
    textoCorrecao.setCustomValidity('');

    document.getElementById('correcao-noticia').textContent =
        noticia.titulo || 'Notícia selecionada';

    dialogCorrecao.showModal();

    textoCorrecao.focus();
}


// ======================================================
// FECHAR FORMULÁRIO
// ======================================================

botaoFecharCorrecao.addEventListener(
    'click',
    () => dialogCorrecao.close()
);


// O dialog nativo também permite fechar com Escape
// e contém o foco do teclado.
dialogCorrecao.addEventListener('close', () => {

    formCorrecao.reset();

    noticiaEmCorrecao = null;

    if (
        origemCorrecao &&
        origemCorrecao.isConnected
    ) {
        origemCorrecao.focus();
    }
});


textoCorrecao.addEventListener(
    'input',
    () => textoCorrecao.setCustomValidity('')
);


// ======================================================
// MOSTRAR MENSAGEM DE SUCESSO
// ======================================================

function mostrarToastSucesso() {

    clearTimeout(temporizadorCorrecao);

    toastCorrecao.textContent =
        'Obrigado por nos ajudar a melhorar!';

    toastCorrecao.classList.add('is-visible');

    temporizadorCorrecao = setTimeout(() => {

        toastCorrecao.classList.remove('is-visible');
        toastCorrecao.textContent = '';

    }, 3000);
}


// ======================================================
// ENVIO DA CORREÇÃO
// ======================================================

formCorrecao.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();


        // --------------------------------------------------
        // VALIDAÇÃO
        // --------------------------------------------------

        const descricao =
            textoCorrecao.value.trim();


        if (!descricao) {

            textoCorrecao.setCustomValidity(
                'Descreva o erro encontrado na notícia.'
            );

            textoCorrecao.reportValidity();

            return;
        }


        if (!noticiaEmCorrecao?.id) {

            console.error(
                'Não foi possível identificar a notícia.'
            );

            return;
        }


        // --------------------------------------------------
        // DESABILITA BOTÃO DURANTE ENVIO
        // --------------------------------------------------

        const botaoEnviar =
            formCorrecao.querySelector(
                'button[type="submit"]'
            );


        const textoOriginalBotao =
            botaoEnviar?.textContent;


        if (botaoEnviar) {

            botaoEnviar.disabled = true;

            botaoEnviar.textContent =
                'Enviando...';
        }


        try {

            // ----------------------------------------------
            // IDENTIFICA USUÁRIO ANÔNIMO
            // ----------------------------------------------

            const usuario =
                await obterUsuarioAtual();


            // ----------------------------------------------
            // SALVA NO FIRESTORE
            // ----------------------------------------------

            await addDoc(
                collection(db, 'correcoes'),
                {
                    noticiaId:
                        String(noticiaEmCorrecao.id),

                    descricao,

                    usuarioId:
                        usuario.uid,

                    criadoEm:
                        serverTimestamp(),

                    status:
                        'pendente'
                }
            );


            // ----------------------------------------------
            // FECHA SOMENTE DEPOIS QUE O FIREBASE CONFIRMAR
            // ----------------------------------------------

            dialogCorrecao.close();

            mostrarToastSucesso();


        } catch (erro) {

            console.error(
                'Erro ao enviar correção:',
                erro
            );


            // Mantém o texto preenchido para nova tentativa

            textoCorrecao.setCustomValidity(
                'Não foi possível enviar a correção. Tente novamente.'
            );

            textoCorrecao.reportValidity();


        } finally {

            // ----------------------------------------------
            // REATIVA BOTÃO
            // ----------------------------------------------

            if (botaoEnviar) {

                botaoEnviar.disabled = false;

                botaoEnviar.textContent =
                    textoOriginalBotao;
            }
        }
    }
);


// ======================================================
// EXPORTAÇÃO
// ======================================================
//
// Essa função provavelmente é chamada pelo script que
// cria os cards das notícias.
//

export {
    abrirCorrecaoNoticia
};