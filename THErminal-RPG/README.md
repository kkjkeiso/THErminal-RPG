# THErminal RPG

```
████████╗██╗  ██╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗
╚══██╔══╝██║  ██║██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║
   ██║   ███████║█████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║
   ██║   ██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║
   ██║   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
```

> RPG de terminal desenvolvido em JavaScript com orientação a objetos.  
> Você acorda no seu quarto. Há um vampiro encostado na parede. A jornada começa agora.

---

## Sobre o projeto

THErminal RPG é um jogo de RPG rodando inteiramente no terminal, desenvolvido como projeto acadêmico aplicando conceitos de **Programação Orientada a Objetos** em JavaScript.

A proposta é simular a experiência de jogos como Elden Ring dentro de um terminal: classes com atributos, sistema de scaling de armas, combate por turnos, progressão por nível, inimigos com habilidades especiais e uma narrativa linear com escolhas que afetam o final.

O projeto foi construído com uma arquitetura de **eventos genéricos baseados em templates de variáveis**, pensado para futura integração com uma IA generativa (Groq) que substituirá a narração fixa por textos gerados dinamicamente a partir do contexto da partida.

---

## Como jogar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v16 ou superior

### Instalação

```bash
git clone https://github.com/kkjkeiso/THErminal-RPG.git
cd THErminal-RPG
npm install
```

### Executar

```bash
npm start
# ou
node main.js
```

---

## Funcionalidades

- **3 classes jogáveis** com atributos, armas e habilidades únicas
- **Sistema de scaling de atributos** — o dano da arma escala com o atributo correto da classe
- **Habilidade especial** por classe com custo de mana
- **Combate por turnos** com opções de atacar, usar habilidade, usar item e fugir
- **Crítico** — Bola de Fogo do Mago tem 30% de chance de causar 1,5× de dano
- **Level up** com escolha manual de atributo para aumentar
- **Inventário e loja** na aldeia hub
- **Eventos com narrativa em template** prontos para integração futura com IA
- **Sistema de save/load** em arquivo JSON local
- **2 finais** diferentes dependendo de escolhas feitas durante a jornada
- **Sem fuga possível** no confronto final contra o Vampiro Ancestral

---

## Classes

| Classe    | VIG | FOR | INT | Arma Inicial       | Habilidade          |
|-----------|-----|-----|-----|--------------------|---------------------|
| Guerreiro | 14  | 16  | 7   | Espada de Ferro    | Golpe Devastador    |
| Mago      | 9   | 8   | 16  | Cajado Comum       | Bola de Fogo (crit) |
| Vagabundo | 10  | 11  | 10  | Faca Enferrujada   | Sorte do Mendigo    |

---

## Estrutura do projeto

```
THErminal-RPG/
├── main.js                        # Ponto de entrada e loop principal do jogo
│
├── src/
│   ├── data/                      # Dados do jogo em JSON (configuração pura)
│   │   ├── classes.json           # Atributos, arma inicial e habilidade de cada classe
│   │   ├── armas.json             # Todas as armas com dano base e atributo de scaling
│   │   ├── inimigos.json          # Bestiário completo com drops, EXP e habilidades especiais
│   │   ├── itens.json             # Itens consumíveis (poções) com efeitos e preços
│   │   ├── eventos.json           # Eventos genéricos com templates de variáveis {nome}, {area}, etc.
│   │   └── historia.json          # Textos narrativos de cada cena e boss
│   │
│   ├── models/                    # Classes de domínio (POO)
│   │   ├── Personagem.js          # Jogador: atributos, combate, habilidade, inventário, level up
│   │   └── Inimigo.js             # Inimigo: IA de combate, drops, habilidades de boss
│   │
│   ├── services/                  # Lógica de negócio
│   │   ├── PersonagemFactory.js   # Cria e reconstrói personagens (incluindo carregamento de save)
│   │   ├── Combate.js             # Motor de combate por turnos com menu de ações
│   │   ├── EventoEngine.js        # Sorteia eventos, preenche templates e executa consequências
│   │   └── SalvarJogo.js          # Serialização e deserialização do estado em save.json
│   │
│   ├── scenes/                    # Cenas do jogo (cada área é uma função executar())
│   │   ├── Intro.js               # Tela de título, narrativa de abertura e seleção de classe
│   │   ├── Aldeia.js              # Hub: descanso, loja, status, salvar e escolha de área
│   │   ├── Floresta.js            # Área 1: encontros aleatórios + boss Lorde da Floresta
│   │   ├── Ruinas.js              # Área 2: encontros aleatórios + boss Guardião das Ruínas
│   │   └── TorreDoVampiro.js      # Área final: encontros + Vampiro Ancestral (sem fuga)
│   │
│   └── utils/
│       └── Utils.js               # Input, sleep síncrono, typewriter, barras de progresso, menus
│
├── package.json
└── save.json                      # Gerado automaticamente ao salvar (não versionado)
```

---

## Sistema de Eventos (preparado para IA)

Os eventos do jogo usam **templates com variáveis** entre chaves:

```json
{
  "template_narrativo": "No {dia}o dia, enquanto {nome} avancava pela {area_nome}, um {artigo_inimigo} {inimigo_nome} empunhando {artigo_arma} {arma_inimigo_nome} bloqueou o caminho."
}
```

O `EventoEngine` substitui as variáveis pelo contexto atual da partida (nome do personagem, classe, área, dia, inimigo sorteado, arma do inimigo etc.).

Quando a integração com IA for implementada, basta substituir o método `EventoEngine.preencher()` por uma chamada à API do Groq passando o template + contexto. **O resto do jogo não muda nada.**

---

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.
