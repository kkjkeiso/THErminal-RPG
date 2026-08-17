const Utils = require('../utils/Utils');
const EventoEngine = require('../services/EventoEngine');
const Combate = require('../services/Combate');
const Inimigo = require('../models/Inimigo');
const inimigosData = require('../data/inimigos.json');
const historia = require('../data/historia.json');

const AREA_ID   = 'floresta';
const AREA_NOME = 'Floresta das Almas';
const NUM_ENCONTROS = 3;

function executar(personagem, estadoJogo) {
  Utils.limparTela();
  Utils.cabecalho(AREA_NOME.toUpperCase());
  Utils.digitar(historia.intro_floresta);
  Utils.enter();

  const eventosVistos = [];

  for (let i = 0; i < NUM_ENCONTROS; i++) {
    estadoJogo.dia++;
    const evento = EventoEngine.sortearEvento(AREA_ID, eventosVistos);
    if (!evento) break;
    eventosVistos.push(evento.id);

    const resultado = EventoEngine.executar(evento, personagem, estadoJogo, AREA_NOME);
    if (resultado.resultado === 'derrota') return 'derrota';
    if (!personagem.estaVivo()) return 'derrota';
    Utils.enter();
  }

  Utils.limparTela();
  Utils.cabecalho('CHEFE DA FLORESTA');
  Utils.digitar(historia.boss_floresta);
  Utils.enter();

  const boss = new Inimigo(inimigosData['lorde_floresta']);
  const resultado = Combate.iniciar(personagem, boss);
  if (resultado.resultado === 'derrota') return 'derrota';

  Utils.separador('═');
  Utils.digitar(historia.vitoria_floresta);
  Utils.separador('═');
  Utils.enter();

  return 'vitoria';
}

module.exports = { executar };
