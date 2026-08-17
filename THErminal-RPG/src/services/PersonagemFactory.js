const classes = require('../data/classes.json');
const armas = require('../data/armas.json');
const Personagem = require('../models/Personagem');

function criarPersonagem(classeId, nome) {
  const classe = classes[classeId];
  if (!classe) throw new Error('Classe "' + classeId + '" nao existe em classes.json');

  const personagem = new Personagem(nome, classe);
  const armaInicial = armas[classe.armaInicial];
  if (armaInicial) personagem.equiparArma(armaInicial);

  return personagem;
}

function carregarPersonagem(dados) {
  const classeBase = classes[dados.classeId];
  if (!classeBase) throw new Error('Classe "' + dados.classeId + '" nao encontrada no save.');

  const personagem = new Personagem(dados.nome, classeBase);

  personagem.nivel = dados.nivel;
  personagem.atributos = Object.assign({}, dados.atributos);
  personagem.vidaMax = dados.vidaMax;
  personagem.vidaAtual = dados.vidaAtual;
  personagem.manaMax = dados.manaMax;
  personagem.manaAtual = dados.manaAtual;
  personagem.inventario = dados.inventario.map(i => Object.assign({}, i));
  personagem.armaEquipada = dados.armaEquipada ? Object.assign({}, dados.armaEquipada) : null;
  personagem.habilidade = Object.assign({}, dados.habilidade);
  personagem.exp = dados.exp;
  personagem.expParaNivel = dados.expParaNivel;
  personagem.moedas = dados.moedas;

  return personagem;
}

module.exports = { criarPersonagem, carregarPersonagem };
