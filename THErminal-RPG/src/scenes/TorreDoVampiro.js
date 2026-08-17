const Utils = require('../utils/Utils');
const EventoEngine = require('../services/EventoEngine');
const Combate = require('../services/Combate');
const Inimigo = require('../models/Inimigo');
const inimigosData = require('../data/inimigos.json');
const historia = require('../data/historia.json');

const AREA_ID   = 'torre';
const AREA_NOME = 'Torre do Sangue';
const NUM_ENCONTROS = 3;

function executar(personagem, estadoJogo) {
  Utils.limparTela();
  Utils.cabecalho(AREA_NOME.toUpperCase());
  Utils.digitar(historia.intro_torre);
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
  Utils.cabecalho('O VAMPIRO ANCESTRAL');
  Utils.digitar(historia.boss_vampiro);
  Utils.enter();

  const boss = new Inimigo(inimigosData['vampiro_ancestral']);
  const resultado = Combate.iniciar(personagem, boss, { semFuga: true });
  if (resultado.resultado === 'derrota') return 'derrota';

  Utils.separador('═');
  if (estadoJogo.flags.fingiu_aceitar) {
    Utils.digitar(historia.vitoria_vampiro_astuto);
  } else {
    Utils.digitar(historia.vitoria_vampiro_padrao);
  }
  Utils.separador('═');
  Utils.enter();

  return 'vitoria';
}

module.exports = { executar };
