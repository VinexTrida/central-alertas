/* Dados inteiramente fictícios. example.com é um domínio de exemplo:
   os links demonstram a interação e não apontam para reportagens reais.
   O quinto registro contém apenas cidade, estado e data no ocorrido. */
const noticiasMock = [
  {
    id: 1, titulo: 'Uma ligação do “banco”. Um prejuízo de R$ 15 mil.',
    resumo: 'Um morador de Campinas recebeu uma ligação de um suposto funcionário do banco. Com a justificativa de bloquear uma compra suspeita, o criminoso convenceu a vítima a transferir dinheiro para uma “conta segura”.',
    boaPratica: 'Desligue e procure o banco pelos canais oficiais. Nunca compartilhe senhas ou códigos de autenticação e desconfie de pedidos para transferir dinheiro durante uma ligação.',
    materia: { titulo: 'Falso funcionário convence vítima a fazer transferências bancárias', fonte: 'Jornal Horizonte · fictício', url: 'https://example.com/?materia=falso-funcionario', dominio: 'example.com', imagem: null },
    dataPublicacao: '2026-09-04',
    ocorrido: { idadeVitima: 62, cidade: 'Campinas', estado: 'São Paulo', data: '2026-09-02', sexo: 'Masculino', valorPerdido: 15000, tipoAtaque: 'Engenharia social', instituicao: 'Banco fictício', canal: 'Ligação telefônica', categoria: 'Golpe bancário' }
  },
  {
    id: 2, titulo: 'E-mail de entrega esconde uma página falsa de pagamento',
    resumo: 'Uma mensagem sobre uma encomenda retida levou uma moradora de Curitiba a um site que imitava uma transportadora. Ao pagar uma suposta taxa de liberação, ela forneceu os dados do cartão aos golpistas.',
    boaPratica: 'Confira o status da entrega diretamente no site ou aplicativo da transportadora. Evite links de mensagens inesperadas e verifique o domínio antes de informar dados.',
    materia: { titulo: 'Taxa de entrega falsa é usada para capturar dados de cartão', fonte: 'Diário Digital · fictício', url: 'https://example.com/?materia=phishing', dominio: 'example.com', imagem: null },
    dataPublicacao: '2026-09-04',
    ocorrido: { cidade: 'Curitiba', estado: 'Paraná', data: '2026-09-03', valorPerdido: 2400, tipoAtaque: 'Phishing', canal: 'E-mail', categoria: 'Phishing' }
  },
  {
    id: 3, titulo: '“Mãe, troquei de número”: o pedido de ajuda era um golpe',
    resumo: 'Usando a foto de um familiar, um perfil desconhecido pediu dinheiro com urgência a uma moradora de Recife. Ela desconfiou da mudança de número e confirmou com o filho antes de realizar qualquer transferência.',
    boaPratica: 'Antes de enviar dinheiro, fale com a pessoa pelo número que você já conhece. Foto e nome de perfil não confirmam a identidade de quem está conversando.',
    materia: { titulo: 'Moradora identifica falsa mensagem de familiar e evita transferência', fonte: 'Notícias em Rede · fictício', url: 'https://example.com/?materia=whatsapp', dominio: 'example.com', imagem: null },
    dataPublicacao: '2026-09-03',
    ocorrido: { idadeVitima: 54, cidade: 'Recife', estado: 'Pernambuco', data: '2026-09-02', tipoAtaque: 'Falsa identidade', canal: 'WhatsApp', categoria: 'Golpe do WhatsApp' }
  },
  {
    id: 4, titulo: 'Falsa central de atendimento pede acesso remoto ao celular',
    resumo: 'Um morador de Belo Horizonte foi orientado a instalar um aplicativo de acesso remoto para resolver um suposto bloqueio de conta. O programa permitiu que criminosos acompanhassem a tela e movimentassem seu dinheiro.',
    boaPratica: 'Não instale aplicativos nem compartilhe sua tela a pedido de contatos inesperados. Encerre o atendimento e confirme a solicitação em um canal oficial.',
    materia: { titulo: 'Golpistas usam suporte falso para acessar celular de vítima', fonte: 'Panorama Local · fictício', url: 'https://example.com/?materia=falsa-central', dominio: 'example.com', imagem: null },
    dataPublicacao: '2026-09-02',
    ocorrido: { idadeVitima: 43, cidade: 'Belo Horizonte', estado: 'Minas Gerais', data: '2026-09-01', valorPerdido: 7800, tipoAtaque: 'Acesso remoto indevido', canal: 'Ligação telefônica', categoria: 'Falsa central' }
  },
  {
    id: 5, titulo: 'Arquivos bloqueados interrompem a rotina de uma empresa',
    resumo: 'Uma pequena empresa de Porto Alegre teve documentos bloqueados após a abertura de um anexo malicioso. A equipe isolou os equipamentos afetados e iniciou a recuperação dos arquivos a partir de cópias de segurança.',
    boaPratica: 'Mantenha sistemas atualizados e cópias de segurança isoladas, com restauração testada. Confira a origem de anexos e evite executar arquivos recebidos de remetentes desconhecidos.',
    materia: { titulo: 'Empresa recupera arquivos após incidente com ransomware', fonte: 'Observador Tech · fictício', url: 'https://example.com/?materia=ransomware', dominio: 'example.com', imagem: null },
    dataPublicacao: '2026-09-01',
    ocorrido: { cidade: 'Porto Alegre', estado: 'Rio Grande do Sul', data: '2026-08-31' }
  }
];
