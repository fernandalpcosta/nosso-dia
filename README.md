# Nosso Dia

Um cantinho compartilhado para casais que moram em países diferentes. A ideia é manter a conexão do dia a dia com rituais curtos e leves, e ter sempre algo divertido para fazer juntos por videochamada.

O app é uma única página (`index.html`) com duas abas.

## Hoje: três rituais

**Todo dia: "Uma coisa que eu valorizo em você"**
Cada pessoa escreve uma gratidão sobre a outra. A resposta do parceiro só aparece depois que você escreve a sua. Os dias anteriores ficam guardados no *cofre de gratidão*, para reler nos dias difíceis (só aparecem os dias em que você também escreveu).

**No fim do dia: 5 minutos de escuta**
Uma pergunta do dia (rotaciona entre 14 sugestões), um timer de 3 ou 5 minutos para cada um e a regra: quem ouve só ouve, sem conselho, sem interromper, sem mudar de assunto. O timer é sincronizado entre os dois aparelhos e avisa a hora de trocar de vez.

**Regra 2-2-2: o que vem por aí**
- Um encontro só dos dois a cada 2 semanas
- Uma escapada de fim de semana a cada 2 meses
- Uma viagem grande a cada 2 anos

Cada item mostra a contagem regressiva. Ao marcar "Fizemos!", o momento entra na *nossa história* e a próxima data já é sugerida. Para o encontro quinzenal há um botão de ideias com IA (encontros virtuais sem falar de rotina ou trabalho).

No topo, dois relógios mostram a hora "aqui" e "aí", usando o fuso horário de cada aparelho.

## Jogos

A aba tem três jogos; o último escolhido fica lembrado no aparelho.

### Mais Provável

"Quem é mais provável de…?" para duas pessoas.
- Sala online com código de 4 letras, ou jogo no mesmo celular (passando o aparelho).
- Interface e cartas em português, espanhol e inglês; cada um vê a carta no seu idioma e, embaixo, no idioma da outra pessoa.
- Climas: engraçado, apocalipse, romântico, absurdo, profundo.
- Baralho fixo de 20 cartas, mais cartas geradas por IA.
- Placar de *sintonia*: quantas vezes os dois apontaram para a mesma pessoa.

### Quebra-cabeça

Um quebra-cabeça montado a quatro mãos, em tempo real.
- Imagem: uma das ilustrações prontas (pôr do sol, estrelas, mar) ou uma foto de vocês.
- Tamanhos de 9, 16 ou 25 peças.
- Cada peça encaixada aparece na hora para a outra pessoa, com barra de progresso.
- Começar um novo quebra-cabeça apaga o progresso do atual.

### Verdade ou desafio

Uma pessoa por vez; a carta aparece para as duas ao mesmo tempo.
- Níveis: fofo, divertido e picante.
- Baralho fixo mais cartas geradas por IA, com desafios que dá para cumprir por videochamada ou mensagem.
- Botões "Respondi" / "Cumpri" passam a vez para a outra pessoa.

## Como funciona

Tudo em HTML, CSS e JavaScript puro, sem build. O app conversa com o "backend" por uma única interface, `window.claude.use(...)`, com quatro peças: `db` (dados), `room` (tempo real), `user` (quem é você) e `sample` (IA).

- **Dentro do Claude** (como Artifact), essas peças vêm do próprio Claude.
- **Fora do Claude** (GitHub Pages ou qualquer hospedagem), o `backend.js` cria a mesma interface usando o Firebase:
  - `db`: Cloud Firestore. Tudo de um casal fica em `casais/{código}/…`.
  - `user`: login anônimo do Firebase (cada aparelho/navegador tem um id).
  - `room`: salas em tempo real feitas no Firestore (eventos + presença), usadas pelo timer de escuta e pelas salas do Mais Provável.
  - `sample`: opcional. Quem quiser IA cola uma chave da API da Anthropic em **Ajustes**; ela fica só naquele aparelho.

### O código do casal

Na primeira vez, quem começa toca em **Criar nosso espaço** e ganha um código de 10 letras e números. Em **Ajustes do nosso espaço** (no fim da página) dá para copiar um link com o código e mandar para a outra pessoa; ao abrir o link, ela já entra no mesmo espaço. Quem tem o código vê os dados, então ele deve ficar só entre vocês.

Se alguém limpar os dados do navegador ou trocar de celular, o app passa a ver essa pessoa como alguém novo. Nesse caso é só entrar de novo com o mesmo código.

## Como publicar fora do Claude

### 1. Firebase (gratuito, plano Spark)

1. Em [console.firebase.google.com](https://console.firebase.google.com), crie um projeto (o Google Analytics pode ficar desligado).
2. **Authentication → Começar → Método de login → Anônimo → Ativar.**
3. **Firestore Database → Criar banco de dados** → modo de produção, qualquer região próxima.
4. Na aba **Regras** do Firestore, cole o conteúdo de [`firestore.rules`](firestore.rules) e publique.
5. **Configurações do projeto → Seus apps → ícone `</>` (Web)** → registre o app (sem Hosting) e copie o objeto `firebaseConfig`.
6. Cole esses valores em [`firebase-config.js`](firebase-config.js), no lugar de `null`.
7. **Authentication → Configurações → Domínios autorizados → Adicionar domínio:** `fernandalpcosta.github.io`.

Os valores do `firebaseConfig` podem ficar públicos; quem protege os dados são as regras e o código do casal.

### 2. GitHub Pages

1. O Pages gratuito só funciona com repositório público: **Settings → General → Danger Zone → Change visibility → Public**. O repositório não tem senhas nem dados de vocês (os dados ficam no Firebase).
2. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.**
3. Em 1 a 2 minutos o app fica em `https://fernandalpcosta.github.io/nosso-dia/`.

Sem o `firebase-config.js` preenchido, a página abre normalmente, mas sem salvar nem sincronizar nada (o Mais Provável no modo "mesmo celular" funciona).

Tema claro e escuro automáticos, layout pensado para celular.
