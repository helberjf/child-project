# Caça aos Monstrinhos

![Preview do jogo](assets/images/game-preview.svg)

Jogo infantil educativo feito com HTML, CSS e JavaScript puro para criancas de aproximadamente 8 anos.

A crianca captura monstrinhos, protege o monstro amigo de cada fase, cria combos e pode recuperar vidas respondendo um desafio rapido de ingles.

## Como executar

Use um servidor local na pasta do projeto:

```bash
npm start
```

Depois abra:

```text
http://127.0.0.1:4173/
```

Abrir o `index.html` direto pelo explorador pode nao funcionar corretamente, porque o navegador bloqueia alguns imports de modulos JavaScript quando a pagina roda como arquivo local.

## Testes

```bash
npm test
```

Nao e preciso instalar bibliotecas externas.

## Recursos

- Menu com jogar, personagens, recordes, medalhas, palavras, configuracoes e como jogar.
- Aviso antes de cada fase mostrando qual monstrinho e amigo.
- Countdown `3, 2, 1, VAI!` antes da acao comecar.
- Vidas, pontuacao, cronometro e combo no HUD.
- Monstros amigos, normais, dourados, rapidos e chefao final.
- Mundos com fundos diferentes: floresta, gelo, vulcao, espaco, castelo e chefao.
- Desafio de ingles para recuperar uma vida.
- Banco com aproximadamente 200 palavras infantis em `data/palavras.js`.
- Palavras aprendidas salvas no `localStorage`.
- Sons centralizados em `js/sounds.js`.
- Movimento com `requestAnimationFrame`, sem Canvas e sem bibliotecas externas.

## Estrutura

```text
child-project
├── index.html
├── css
│   └── style.css
├── js
│   ├── game.js
│   ├── monster.js
│   ├── levels.js
│   ├── player.js
│   ├── ui.js
│   ├── sounds.js
│   ├── english.js
│   └── storage.js
├── data
│   └── palavras.js
├── assets
│   ├── images
│   ├── sounds
│   ├── cursors
│   └── backgrounds
├── aulas
└── tests
```

## Ideia educativa

O codigo foi separado para mostrar conceitos simples:

- arrays para listas de monstros e palavras;
- objetos para guardar vida, pontos e posicao;
- funcoes para criar perguntas e fases;
- `if` para decidir acerto, amigo, chefao ou recuperacao;
- `localStorage` para salvar recordes e aprendizado.
