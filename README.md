# Nosso Dia

📣 **[Veja as novidades](NOVIDADES.md)**

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

### Lembra quando…?

A cada 3 dias aparece uma lembrança do casal, a mesma para as duas: um encontro do "Fizemos!", uma gratidão antiga (só de dias em que as duas escreveram) ou uma lembrança que vocês guardaram ("Lembra quando… a gente se conheceu"). Cada uma conta um detalhe que a outra talvez tenha esquecido; os dois detalhes aparecem quando as duas escreverem, com a sugestão de recontar a história juntas na próxima chamada. Cada história revivida pendura um coração na árvore das lembranças, no mundinho.

A ideia vem da pesquisa sobre casais que saboreiam juntos as memórias boas ("joint savoring" e reminiscência), associado a mais satisfação e proximidade.

## Jogos

A aba tem três jogos; o último escolhido fica lembrado no aparelho.

### Mais Provável

"Quem é mais provável de…?" para duas pessoas.
- "Jogar juntas" entra direto na sala do casal (sem código: o app é só de vocês duas), ou jogo no mesmo celular (passando o aparelho).
- Interface e cartas em português, espanhol e inglês; cada um vê a carta no seu idioma e, embaixo, no idioma da outra pessoa.
- Climas: engraçado, apocalipse, romântico, absurdo, profundo.
- Baralho fixo de 20 cartas, mais cartas geradas por IA.
- Placar de *sintonia*: quantas vezes os dois apontaram para a mesma pessoa.

### Quebra-cabeça

Um quebra-cabeça montado a quatro mãos, em tempo real.
- Imagem: uma das ilustrações prontas (pôr do sol, estrelas, mar), uma foto de vocês ou uma ilustração **criada pela IA** a partir de uma descrição, em quatro estilos (fofo, paisagem, papel recortado, cartão-postal). A IA desenha em SVG, que vira imagem no próprio aparelho: é um desenho, não uma foto. Precisa da chave da API em Ajustes.
- Tamanhos de 9, 16, 25, 36, 49 ou 64 peças.
- Cada peça encaixada aparece na hora para a outra pessoa, com barra de progresso.
- Começar um novo quebra-cabeça apaga o progresso do atual.

### Verdade ou desafio

Uma pessoa por vez; a carta aparece para as duas ao mesmo tempo.
- Níveis: fofo, divertido e picante.
- Baralho fixo mais cartas geradas por IA, com desafios que dá para cumprir por videochamada ou mensagem.
- Botões "Respondi" / "Cumpri" passam a vez para a outra pessoa.

### Sudoku a dois

O mesmo sudoku nos dois celulares, resolvido em equipe (sem disputa e sem relógio na tela).
- Três dificuldades (fácil, médio, difícil); todo jogo é gerado na hora e tem uma única solução.
- Cada número aparece com a cor de quem colocou, e a casa que a outra está olhando fica marcada em coral.
- Anotações (rascunho) são de cada uma e ficam só no próprio aparelho.
- "Mostrar erros" (pode desligar), "Dica" e, no computador, teclado (números, setas, apagar e N para anotar).

## Mundo: nosso mundinho

Uma florestinha que cresce com o que vocês fazem no app. As duas veem o mesmo mundo, e uma miniatura dele fica no topo da aba Hoje.

| Atividade | O que nasce |
|---|---|
| Cada gratidão escrita | 🌸 uma flor |
| 5 minutos de escuta completos (as duas falaram) | 🌳 uma árvore |
| Encontro marcado como "Fizemos!" | 🦊 um animal (coelho, raposa, capivara, veado…) |
| Quebra-cabeça completo | 🍄 um cantinho especial (cogumelos, banco, balanço, fogueira…) |
| Verdade ou desafio cumprido | 🦋 borboletas (vaga-lumes à noite) |
| Sintonia no Mais Provável | 🐦 um passarinho |
| Sudoku resolvido juntas | 🐞 uma joaninha |
| "Lembra quando…?" revivido pelas duas | 💞 um coração na árvore das lembranças |

Com o total de atividades aparecem surpresas: riacho (5), ponte (12), cachoeira (20), lago com patos (35), arco-íris (50), cabana (75) e a árvore da vida (100). O céu segue o horário de quem está olhando (dia, entardecer e noite estrelada).

Como funciona: o mundo não é salvo como imagem; o `mundo.js` redesenha tudo a partir das gratidões e encontros já salvos e de "sementes" na coleção `mundo` (escuta, quebra-cabeça, verdade ou desafio, sintonia, sudoku). Cada semente tem um id fixo, então nada conta em dobro, e as posições vêm de sorteios com semente fixa, por isso o mundo é igual nos dois celulares. O histórico antigo de vocês já conta: o mundo nasce crescido.

## A ciência por trás

Cada atividade tem um botão **Por que isso?** que explica a ideia, o que a pesquisa diz e os limites. Resumo:

| Atividade | Base |
|---|---|
| Uma coisa que eu valorizo em você | Algoe, Gable e Maisel (2010); Algoe (2012) |
| 5 minutos de escuta | Reis e Shaver (1988); Laurenceau, Barrett e Pietromonaco (1998); Markman, Stanley e Blumberg (2010); Jiang e Hancock (2013) |
| Regra 2-2-2 | Não vem de pesquisa (post do Reddit, ~2015); o princípio se apoia em Aron et al. (2000) e Stafford e Merolla (2007) |
| Lembra quando…? | Osgarby e Halford (2013); Kurtz e Algoe (2015); estudos de "joint savoring" |
| Mais Provável | Kurtz e Algoe (2015); Proyer (2014) |
| Quebra-cabeça a quatro mãos | Aron et al. (2000); Proyer (2014) |
| Verdade ou desafio | Aron et al. (1997); Reis e Shaver (1988); Jiang e Hancock (2013); Aron et al. (2000) |
| Sudoku a dois | Aron et al. (2000); Johnson, Zabriskie e Hill (2006) |
| Nosso mundo | Sem pesquisa direta: escolha de design (o mundo só cresce, nunca murcha) |

### Referências

- Algoe, S. B. (2012). Find, remind, and bind: The functions of gratitude in everyday relationships. Social and Personality Psychology Compass, 6(6), 455–469.
- Algoe, S. B., Gable, S. L., & Maisel, N. C. (2010). It's the little things: Everyday gratitude as a booster shot for romantic relationships. Personal Relationships, 17, 217–233. [Link](https://labs.psych.ucsb.edu/gable/shelly/publications/414)
- Aron, A., Melinat, E., Aron, E. N., Vallone, R. D., & Bator, R. J. (1997). The experimental generation of interpersonal closeness. Personality and Social Psychology Bulletin, 23(4), 363–377. [Link](https://ggia.berkeley.edu/practice/practice_as_pdf/36_questions_for_increasing_closeness)
- Aron, A., Norman, C. C., Aron, E. N., McKenna, C., & Heyman, R. E. (2000). Couples' shared participation in novel and arousing activities and experienced relationship quality. Journal of Personality and Social Psychology, 78(2), 273–284.
- Jiang, L. C., & Hancock, J. T. (2013). Absence makes the communication grow fonder: Geographic separation, interpersonal media, and intimacy in dating relationships. Journal of Communication, 63(3), 556–577. [Link](https://academic.oup.com/joc/article/63/3/556/4085877)
- Johnson, H. A., Zabriskie, R. B., & Hill, B. (2006). The contribution of couple leisure involvement, leisure time, and leisure satisfaction to marital satisfaction. Marriage & Family Review, 40(1), 69–91.
- Kurtz, L. E., & Algoe, S. B. (2015). Putting laughter in context: Shared laughter as behavioral indicator of relationship well-being. Personal Relationships, 22(4), 573–590. [Link](https://pubmed.ncbi.nlm.nih.gov/26957946/)
- Laurenceau, J.-P., Barrett, L. F., & Pietromonaco, P. R. (1998). Intimacy as an interpersonal process: The importance of self-disclosure, partner disclosure, and perceived partner responsiveness in interpersonal exchanges. Journal of Personality and Social Psychology, 74(5), 1238–1251. [Link](https://www.affective-science.org/pubs/1998/LaurenFBPl1998.pdf)
- Markman, H. J., Stanley, S. M., & Blumberg, S. L. (2010). Fighting for your marriage (ed. rev.). Jossey-Bass.
- Osgarby, S. M., & Halford, W. K. (2013). Couple relationship distress and observed expression of intimacy during reminiscence about positive relationship events. Behavior Therapy, 44(4), 686–700.
- Proyer, R. T. (2014). To love and play: Testing the association of adult playfulness with the relationship personality and relationship satisfaction. Current Psychology.
- Reis, H. T., & Shaver, P. (1988). Intimacy as an interpersonal process. In S. Duck (Ed.), Handbook of personal relationships (pp. 367–389). Wiley.
- Society for Personality and Social Psychology (resumo): Proyer e Brauer sobre brincadeira em relacionamentos. [Link](https://www.spsp.org/news-center/blog/proyer-brauer-playfulness)
- Stafford, L., & Merolla, A. J. (2007). Idealization, reunions, and stability in long-distance dating relationships. Journal of Social and Personal Relationships, 24(1), 37–54. doi:10.1177/0265407507072578 [Link](https://doi.org/10.1177/0265407507072578)
- Universidade de Illinois (notícia): Savoring pleasurable moments strengthens couples' bonds. [Link](https://news.illinois.edu/savoring-pleasurable-moments-strengthens-couples-bonds/)

Os estudos citados são, em sua maioria, correlacionais ou de laboratório, com amostras pequenas: mostram tendências, não garantias.

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

### Vários aparelhos

Cada uma pode usar o app no celular e no computador. Quando um aparelho novo entra com o código do casal, o app pergunta **"Quem é você neste aparelho?"** e liga aquele aparelho à pessoa escolhida (fica em `aparelhos/{id do aparelho}`). Se uma versão antiga tiver criado uma pessoa duplicada, escolher o nome certo junta a duplicata à pessoa original, levando as gratidões e lembranças. Em **Ajustes** dá para ver de quem é o aparelho e trocar, se alguém escolher errado.

### 2. GitHub Pages

1. O Pages gratuito só funciona com repositório público: **Settings → General → Danger Zone → Change visibility → Public**. O repositório não tem senhas nem dados de vocês (os dados ficam no Firebase).
2. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.**
3. Em 1 a 2 minutos o app fica em `https://fernandalpcosta.github.io/nosso-dia/`.

Sem o `firebase-config.js` preenchido, a página abre normalmente, mas sem salvar nem sincronizar nada (o Mais Provável no modo "mesmo celular" funciona).

Tema claro e escuro automáticos, layout pensado para celular.
