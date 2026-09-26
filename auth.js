import {
  auth,
  signInAnonymously,
  onAuthStateChanged
} from "./firebase.js";

let promessaUsuarioAtual = null;

export function obterUsuarioAtual() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  if (promessaUsuarioAtual) {
    return promessaUsuarioAtual;
  }

  promessaUsuarioAtual = new Promise((resolve, reject) => {
    const cancelarObservador = onAuthStateChanged(
      auth,
      async (usuario) => {
        cancelarObservador();

        if (usuario) {
          resolve(usuario);
          return;
        }

        try {
          const credencial = await signInAnonymously(auth);
          resolve(credencial.user);
        } catch (erro) {
          promessaUsuarioAtual = null;
          reject(erro);
        }
      },
      erro => {
        promessaUsuarioAtual = null;
        reject(erro);
      }
    );
  });

  return promessaUsuarioAtual;
}
