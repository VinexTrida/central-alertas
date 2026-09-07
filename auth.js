import {
  auth,
  signInAnonymously,
  onAuthStateChanged
} from "./firebase.js";

export function obterUsuarioAtual() {
  return new Promise((resolve, reject) => {
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
          reject(erro);
        }
      },
      reject
    );
  });
}