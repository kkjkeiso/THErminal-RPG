const Utils = require('../utils/Utils');
const SalvarJogo = require('../services/SalvarJogo');
const historia = require('../data/historia.json');
const itensData = require('../data/itens.json');

const ITENS_LOJA = [
  { id: 'pocao_vida',       preco: 15 },
  { id: 'pocao_mana',       preco: 12 },
  { id: 'pocao_vida_maior', preco: 30 }
];

function executar(personagem, estadoJogo) {
  if (!estadoJogo.flags.visitou_aldeia) {
    Utils.limparTela();
    Utils.cabecalho('CRESTMOOR — A Aldeia das Sombras');
    Utils.digitar(historia.crestmoor_primeiro_dia);
    Utils.enter();
    estadoJogo.flags.visitou_aldeia = true;
  }

  while (true) {
    Utils.limparTela();
    Utils.cabecalho('CRESTMOOR  —  Dia ' + estadoJogo.dia);
    console.log('  ' + personagem.nome + '  [Lv.' + personagem.nivel + ' ' + personagem.nomeClasse + ']');
    console.log('  Vida: ' + personagem.vidaAtual + '/' + personagem.vidaMax +
                '  |  Mana: ' + personagem.manaAtual + '/' + personagem.manaMax +
                '  |  Moedas: ' + personagem.moedas);
    Utils.separador('─');

    const opcoes = [];
    const acoes  = [];

    if (!estadoJogo.areas_concluidas.includes('floresta')) {
      opcoes.push('Explorar  ->  Floresta das Almas  [norte]');
      acoes.push('floresta');
    } else if (!estadoJogo.areas_concluidas.includes('ruinas')) {
      opcoes.push('Explorar  ->  Ruinas de Ardenmoor  [leste]');
      acoes.push('ruinas');
    } else if (!estadoJogo.areas_concluidas.includes('torre')) {
      opcoes.push('Explorar  ->  Torre do Sangue  [MISSAO FINAL]');
      acoes.push('torre');
    } else {
      opcoes.push('[A aventura chegou ao fim]');
      acoes.push('fim');
    }

    opcoes.push('Descansar  (recupera toda vida e mana, passa um dia)');
    acoes.push('descansar');
    opcoes.push('Loja do Mercador Velho');
    acoes.push('loja');
    opcoes.push('Ver status completo do personagem');
    acoes.push('status');
    opcoes.push('Salvar jogo');
    acoes.push('salvar');

    const escolha = Utils.menu('O que voce faz em Crestmoor?', opcoes) - 1;
    const acao = acoes[escolha];

    if (acao === 'descansar') {
      personagem.vidaAtual = personagem.vidaMax;
      personagem.manaAtual = personagem.manaMax;
      estadoJogo.dia++;
      console.log('\nVoce descansou. Vida e mana restauradas. Um dia passou...');
      Utils.enter();

    } else if (acao === 'loja') {
      _executarLoja(personagem);

    } else if (acao === 'status') {
      console.log(personagem.status());
      Utils.enter();

    } else if (acao === 'salvar') {
      SalvarJogo.salvar(personagem, estadoJogo);
      Utils.enter();

    } else {
      return acao;
    }
  }
}

function _executarLoja(personagem) {
  while (true) {
    Utils.limparTela();
    Utils.cabecalho('LOJA DO MERCADOR VELHO');
    console.log('  Suas moedas: ' + personagem.moedas);
    Utils.separador('─');

    const labels = ITENS_LOJA.map(entrada => {
      const item = itensData[entrada.id];
      return item.nome + '  (' + entrada.preco + ' moedas)  —  ' + item.descricao;
    });
    labels.push('Sair da loja');

    const escolha = Utils.menu('Itens disponiveis:', labels) - 1;
    if (escolha === ITENS_LOJA.length) break;

    const entrada = ITENS_LOJA[escolha];
    const item = itensData[entrada.id];

    if (personagem.moedas >= entrada.preco) {
      personagem.moedas -= entrada.preco;
      personagem.adicionarItem(item);
      console.log('\nComprado: ' + item.nome + '! Moedas restantes: ' + personagem.moedas);
    } else {
      console.log('\nMoedas insuficientes. Voce tem ' + personagem.moedas + ' moedas.');
    }
    Utils.enter();
  }
}

module.exports = { executar };
