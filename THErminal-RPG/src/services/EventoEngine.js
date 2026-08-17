const Utils = require('../utils/Utils');
const Combate = require('./Combate');
const Inimigo = require('../models/Inimigo');
const eventosData = require('../data/eventos.json');
const inimigosData = require('../data/inimigos.json');
const itensData = require('../data/itens.json');

class EventoEngine {
  static sortearEvento(area, eventosVistos = []) {
    const disponiveis = Object.values(eventosData).filter(e =>
      e.areas.includes(area) && !eventosVistos.includes(e.id)
    );
    if (disponiveis.length === 0) return null;

    const total = disponiveis.reduce((soma, e) => soma + (e.peso || 1), 0);
    let rand = Math.random() * total;
    for (const evento of disponiveis) {
      rand -= (evento.peso || 1);
      if (rand <= 0) return evento;
    }
    return disponiveis[disponiveis.length - 1];
  }

  static preencher(template, contexto) {
    return template.replace(/\{(\w+)\}/g, (match, chave) => {
      return contexto[chave] !== undefined ? String(contexto[chave]) : match;
    });
  }

  static construirContexto(personagem, estadoJogo, areaNome, inimigo = null) {
    const ctx = {
      nome: personagem.nome,
      classe: personagem.nomeClasse.toLowerCase(),
      area_nome: areaNome,
      dia: estadoJogo.dia
    };

    if (inimigo) {
      ctx.inimigo_nome = inimigo.nome.toLowerCase();
      ctx.inimigo_nome_cap = inimigo.nome;
      ctx.artigo_inimigo = inimigo.artigo;
      ctx.artigo_inimigo_cap = inimigo.artigo.charAt(0).toUpperCase() + inimigo.artigo.slice(1);
      ctx.arma_inimigo_nome = inimigo.arma_nome;
      ctx.artigo_arma = inimigo.artigo_arma;
      ctx.artigo_arma_cap = inimigo.artigo_arma.charAt(0).toUpperCase() + inimigo.artigo_arma.slice(1);
    }

    return ctx;
  }

  static executar(evento, personagem, estadoJogo, areaNome) {
    let inimigo = null;

    if (evento.tipo === 'combate' && evento.inimigo_id) {
      const dados = inimigosData[evento.inimigo_id];
      if (!dados) throw new Error('Inimigo "' + evento.inimigo_id + '" nao encontrado.');
      inimigo = new Inimigo(dados);
    }

    const contexto = EventoEngine.construirContexto(personagem, estadoJogo, areaNome, inimigo);
    const narrativa = EventoEngine.preencher(evento.template_narrativo, contexto);

    Utils.separador();
    Utils.digitar(narrativa);
    Utils.separador();
    Utils.enter();

    if (evento.tipo === 'combate') {
      return Combate.iniciar(personagem, inimigo);
    }

    if (evento.tipo === 'escolha') {
      return EventoEngine._executarEscolha(evento, personagem, estadoJogo);
    }

    return { resultado: 'continuar' };
  }

  static _executarEscolha(evento, personagem, estadoJogo) {
    const labels = evento.opcoes.map(o => o.texto);
    const escolha = Utils.menu('O que voce faz?', labels) - 1;
    const opcao = evento.opcoes[escolha];

    if (opcao.flag) estadoJogo.flags[opcao.flag] = true;

    switch (opcao.acao) {
      case 'continuar':
        console.log('\nVoce segue em frente.');
        break;

      case 'comprar_item': {
        if (personagem.moedas >= opcao.custo) {
          personagem.moedas -= opcao.custo;
          const item = itensData[opcao.item_id];
          personagem.adicionarItem(item);
          console.log('\nComprado: ' + item.nome + ' adicionado ao inventario.');
          console.log('Moedas restantes: ' + personagem.moedas);
        } else {
          console.log('\nMoedas insuficientes! Voce tem ' + personagem.moedas + ' moedas.');
        }
        break;
      }

      case 'curar_vida': {
        const curado = Math.min(opcao.valor, personagem.vidaMax - personagem.vidaAtual);
        personagem.vidaAtual += curado;
        console.log('\nVoce descansou e recuperou ' + curado + ' de vida.');
        console.log('Vida: ' + personagem.vidaAtual + '/' + personagem.vidaMax);
        break;
      }

      case 'ganhar_item': {
        const item = itensData[opcao.item_id];
        personagem.adicionarItem(item);
        console.log('\nVoce encontrou: ' + item.nome + '! — ' + item.descricao);
        break;
      }

      default:
        console.log('\nVoce segue em frente.');
    }

    return { resultado: 'continuar' };
  }
}

module.exports = EventoEngine;
