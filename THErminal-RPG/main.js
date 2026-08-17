const Utils = require('./src/utils/Utils');
const SalvarJogo = require('./src/services/SalvarJogo');
const { criarPersonagem, carregarPersonagem } = require('./src/services/PersonagemFactory');
const historia = require('./src/data/historia.json');

const Intro          = require('./src/scenes/Intro');
const Aldeia         = require('./src/scenes/Aldeia');
const Floresta       = require('./src/scenes/Floresta');
const Ruinas         = require('./src/scenes/Ruinas');
const TorreDoVampiro = require('./src/scenes/TorreDoVampiro');

function iniciarJogo() {
  let personagem, estadoJogo;

  if (SalvarJogo.existeSave()) {
    Utils.limparTela();
    Utils.separador('═');
    console.log('  Save encontrado.');
    Utils.separador('─');
    const carregar = Utils.confirmar('Deseja continuar de onde parou?');
    if (carregar) {
      const dados = SalvarJogo.carregar();
      if (dados) {
        personagem = carregarPersonagem(dados.personagemDados);
        estadoJogo = {
          dia: dados.dia,
          area_atual: dados.area_atual,
          areas_concluidas: dados.areas_concluidas,
          flags: dados.flags
        };
        console.log('\nBem-vindo de volta, ' + personagem.nome + '!');
        Utils.sleep(600);
      } else {
        SalvarJogo.deletar();
        const resultado = _criarNovoPersonagem();
        personagem = resultado.personagem;
        estadoJogo = resultado.estadoJogo;
      }
    } else {
      SalvarJogo.deletar();
      const resultado = _criarNovoPersonagem();
      personagem = resultado.personagem;
      estadoJogo = resultado.estadoJogo;
    }
  } else {
    const resultado = _criarNovoPersonagem();
    personagem = resultado.personagem;
    estadoJogo = resultado.estadoJogo;
  }

  return { personagem, estadoJogo };
}

function _criarNovoPersonagem() {
  const personagem = Intro.executar();
  const estadoJogo = {
    dia: 1,
    area_atual: 'aldeia',
    areas_concluidas: [],
    flags: {}
  };
  return { personagem, estadoJogo };
}

function loopPrincipal(personagem, estadoJogo) {
  while (true) {
    if (!personagem.estaVivo()) {
      _gameOver(personagem, estadoJogo);
      break;
    }

    const destino = Aldeia.executar(personagem, estadoJogo);

    if (destino === 'fim') {
      _creditos();
      break;
    }

    let resultado;

    if (destino === 'floresta') {
      estadoJogo.area_atual = 'floresta';
      resultado = Floresta.executar(personagem, estadoJogo);
      if (resultado === 'vitoria') {
        estadoJogo.areas_concluidas.push('floresta');
        estadoJogo.area_atual = 'aldeia';
        estadoJogo.dia++;
      } else {
        _gameOver(personagem, estadoJogo);
        break;
      }
    }

    else if (destino === 'ruinas') {
      estadoJogo.area_atual = 'ruinas';
      resultado = Ruinas.executar(personagem, estadoJogo);
      if (resultado === 'vitoria') {
        estadoJogo.areas_concluidas.push('ruinas');
        estadoJogo.area_atual = 'aldeia';
        estadoJogo.dia++;
      } else {
        _gameOver(personagem, estadoJogo);
        break;
      }
    }

    else if (destino === 'torre') {
      estadoJogo.area_atual = 'torre';
      resultado = TorreDoVampiro.executar(personagem, estadoJogo);
      if (resultado === 'vitoria') {
        estadoJogo.areas_concluidas.push('torre');
        _creditos();
        break;
      } else {
        _gameOver(personagem, estadoJogo);
        break;
      }
    }
  }
}

function _gameOver(personagem, estadoJogo) {
  Utils.limparTela();
  Utils.cabecalho('FIM DE JOGO');

  if (estadoJogo.area_atual === 'torre') {
    Utils.digitar(historia.game_over_torre);
  } else {
    Utils.digitar(historia.game_over);
  }

  Utils.separador('─');
  console.log('  Dias sobrevividos: ' + estadoJogo.dia);
  console.log('  Nivel alcancado:   ' + personagem.nivel);
  console.log('  Areas conquistadas: ' + (estadoJogo.areas_concluidas.join(', ') || 'nenhuma'));
  Utils.separador('─');

  SalvarJogo.deletar();

  if (Utils.confirmar('\nTentar novamente?')) {
    Utils.limparTela();
    const { personagem: novoPersonagem, estadoJogo: novoEstado } = iniciarJogo();
    loopPrincipal(novoPersonagem, novoEstado);
  } else {
    console.log('\nAte a proxima. Que sua proxima jornada seja mais longa.\n');
  }
}

function _creditos() {
  Utils.limparTela();
  Utils.sleep(400);
  console.log(historia.creditos);
  Utils.separador('─');
  console.log('  Obrigado por jogar THErminal RPG!');
  Utils.separador('─');
  Utils.enter('\n[Enter para sair]');
}

const { personagem, estadoJogo } = iniciarJogo();
loopPrincipal(personagem, estadoJogo);
