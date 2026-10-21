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

## Jogos: Mais Provável

"Quem é mais provável de…?" para duas pessoas.
- Sala online com código de 4 letras, ou jogo no mesmo celular (passando o aparelho).
- Interface e cartas em português, espanhol e inglês; cada um vê a carta no seu idioma e, embaixo, no idioma da outra pessoa.
- Climas: engraçado, apocalipse, romântico, absurdo, profundo.
- Baralho fixo de 20 cartas, mais cartas geradas por IA.
- Placar de *sintonia*: quantas vezes os dois apontaram para a mesma pessoa.

## Como funciona

Tudo em HTML, CSS e JavaScript puro, sem build. Os dados compartilhados (pessoas, gratidões, plano, histórico), a sincronia em tempo real (timer e jogo) e as sugestões com IA usam os recursos de runtime dos Artifacts do Claude (`window.claude`: `db`, `room`, `user`, `sample`).

Fora do Claude (por exemplo, abrindo o `index.html` direto ou pelo GitHub Pages), a página carrega mas mostra um aviso de que os dados compartilhados não estão disponíveis. O jogo continua funcionando no modo "mesmo celular". Para hospedar de forma independente, seria preciso trocar essas chamadas por um backend próprio (por exemplo, Firebase ou Supabase).

Tema claro e escuro automáticos, layout pensado para celular.
