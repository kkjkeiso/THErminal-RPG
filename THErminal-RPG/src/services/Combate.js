const Utils = require('../utils/Utils');
const armasData = require('../data/armas.json');
const itensData = require('../data/itens.json');

class Combate {
  static iniciar(personagem, inimigo, opts = {}) {
    const semFuga = opts.semFuga || false;
    Utils.cabecalho('COMBATE  —  ' + personagem.nome + ' vs ' + inimigo.nome);
    Utils.sleep(500);

    let turno = 1;

    let fugiu = false;

    while (personagem.estaVivo() && inimigo.estaVivo()) {
      console.log('\n[Turno ' + turno + ']');
      Combate._mostrarStatus(personagem, inimigo);

      const acao = Combate._menuAcao(personagem, semFuga);
      console.log('');

      if (acao === 'atacar') {
        const dano = personagem.atacar(inimigo);
        console.log('  >> Voce atacou ' + inimigo.nome + ' com ' + personagem.armaEquipada.nome + '!');
        console.log('     Causou ' + dano + ' de dano!');

      } else if (acao === 'habilidade') {
        const resultado = personagem.usarHabilidade(inimigo);
        if (!resultado.sucesso) {
          console.log('  >> Mana insuficiente! Atacando normalmente...');
          const dano = personagem.atacar(inimigo);
          console.log('     Ataque normal: ' + dano + ' de dano!');
        } else {
          if (resultado.dano && resultado.critico) {
            console.log('  >> CRITICO! ' + personagem.habilidade.nome + '!');
            console.log('     Causou ' + resultado.dano + ' de dano!');
          } else if (resultado.dano) {
            console.log('  >> ' + personagem.habilidade.nome + '!');
            console.log('     Causou ' + resultado.dano + ' de dano!');
          } else if (resultado.cura) {
            console.log('  >> ' + personagem.habilidade.nome + '!');
            console.log('     Recuperou ' + resultado.cura + ' de vida!');
          }
        }

      } else if (acao === 'fugir') {
        if (Math.random() < 0.6) {
          console.log('  >> Voce conseguiu fugir!');
          fugiu = true;
          break;
        } else {
          console.log('  >> Voce nao conseguiu escapar!');
        }
      }

      if (fugiu) break;

      Utils.sleep(600);
      if (!inimigo.estaVivo()) break;

      console.log('\n  -- ' + inimigo.nome + ' age...');
      Utils.sleep(500);

      let usouEspecial = false;
      if (inimigo.habilidade_especial && turno % 3 === 0) {
        const res = inimigo.usarHabilidadeEspecial(personagem);
        if (res) {
          console.log('  << ' + inimigo.nome + ' drenou sua forca!');
          console.log('     Voce perdeu ' + res.dano + ' de vida. ' + inimigo.nome + ' recuperou ' + res.cura + '!');
          usouEspecial = true;
        }
      }

      if (!usouEspecial) {
        const defesaJogador = Math.floor((personagem.atributos.vitalidade || 0) * 0.3);
        const danoBase = inimigo.calcularDano();
        const danoReal = Math.max(danoBase - defesaJogador, 1);
        personagem.receberDano(danoReal);
        console.log('  << ' + inimigo.nome + ' atacou com ' + inimigo.arma_nome + '!');
        console.log('     Voce perdeu ' + danoReal + ' de vida!');
      }

      Utils.sleep(400);
      turno++;
    }

    if (fugiu) return { resultado: 'fuga' };
    return Combate._encerrar(personagem, inimigo);
  }

  static _encerrar(personagem, inimigo) {
    if (personagem.estaVivo()) {
      Utils.separador('═');
      console.log('  VITORIA!  ' + inimigo.nome + ' foi derrotado!');
      Utils.separador('═');

      const moedas = inimigo.gerarMoedas();
      personagem.moedas += moedas;
      console.log('  EXP: +' + inimigo.exp + '   |   Moedas: +' + moedas);

      Combate._processarExp(personagem, inimigo.exp);

      const dropId = inimigo.tentarDrop();
      if (dropId) Combate._processarDrop(personagem, dropId, inimigo.drop_item_tipo);

      Utils.sleep(400);
      return { resultado: 'vitoria', exp: inimigo.exp, moedas };
    } else {
      Utils.separador('═');
      console.log('  VOCE FOI DERROTADO...');
      Utils.separador('═');
      return { resultado: 'derrota' };
    }
  }

  static _processarExp(personagem, quantidade) {
    const subiu = personagem.ganharExp(quantidade);
    if (!subiu) return;

    personagem.levelUp();
    Utils.separador('═');
    console.log('  LEVEL UP!  Voce alcancou o nivel ' + personagem.nivel + '!');
    console.log('  Vida maxima: ' + personagem.vidaMax + '  |  Mana maxima: ' + personagem.manaMax);
    Utils.separador('─');

    const nomes = Object.keys(personagem.atributos);
    const labels = nomes.map(a => a.charAt(0).toUpperCase() + a.slice(1) + ' [atual: ' + personagem.atributos[a] + ']');
    const escolha = Utils.menu('Escolha um atributo para aumentar em 2 pontos:', labels) - 1;
    const atrib = nomes[escolha];
    personagem.aumentarAtributo(atrib);
    console.log('  ' + atrib + ' aumentou para ' + personagem.atributos[atrib] + '!');
    Utils.separador('═');
  }

  static _processarDrop(personagem, dropId, tipo) {
    if (tipo === 'arma') {
      const arma = armasData[dropId];
      if (!arma) return;
      console.log('\n  Item encontrado: ' + arma.nome + '!');
      console.log('  ' + arma.descricao);
      if (personagem.armaEquipada) {
        console.log('  Arma atual: ' + personagem.armaEquipada.nome + ' [' + personagem.calcularAtaque() + ' dano]');
      }
      if (Utils.confirmar('  Deseja equipar ' + arma.nome + '?')) {
        personagem.equiparArma(arma);
        console.log('  ' + arma.nome + ' equipado!');
      } else {
        personagem.adicionarItem(arma);
        console.log('  ' + arma.nome + ' guardado no inventario.');
      }
    } else {
      const item = itensData[dropId];
      if (!item) return;
      console.log('\n  Item encontrado: ' + item.nome + '!');
      personagem.adicionarItem(item);
    }
  }

  static _mostrarStatus(personagem, inimigo) {
    Utils.separador('─');
    console.log('  ' + personagem.nome + '  [Lv.' + personagem.nivel + ' ' + personagem.nomeClasse + ']');
    console.log('  Vida  ' + Utils.barraProgresso(personagem.vidaAtual, personagem.vidaMax));
    console.log('  Mana  ' + Utils.barraProgresso(personagem.manaAtual, personagem.manaMax));
    Utils.separador('─');
    console.log('  ' + inimigo.nome);
    console.log('  Vida  ' + inimigo.barraVida());
    Utils.separador('─');
  }

  static _menuAcao(personagem, semFuga = false) {
    while (true) {
      const ataque = personagem.calcularAtaque();
      const hab = personagem.habilidade;
      const consumiveis = personagem.inventario.filter(i => i.tipo === 'consumivel');

      const opcoes = [
        'Atacar           [dano: ~' + ataque + ']',
        hab.nome + '  [mana: ' + hab.custo_mana + ' | voce tem: ' + personagem.manaAtual + ']',
        'Usar Item        [' + consumiveis.length + ' disponivel(is)]'
      ];
      if (!semFuga) opcoes.push('Fugir            [60% de chance]');

      const escolha = Utils.menu('--- SUA ACAO ---', opcoes);

      if (escolha === 1) return 'atacar';
      if (escolha === 2) return 'habilidade';
      if (semFuga && escolha === 4) return 'atacar';

      if (escolha === 3) {
        if (consumiveis.length === 0) {
          console.log('\n  Sem itens para usar!');
          continue;
        }
        const labels = consumiveis.map(i => i.nome + '  — ' + i.descricao);
        labels.push('<- Voltar');
        const escolhaItem = Utils.menu('Qual item usar?', labels);
        if (escolhaItem === labels.length) continue;

        const item = consumiveis[escolhaItem - 1];
        const vidaAntes = personagem.vidaAtual;
        const manaAntes = personagem.manaAtual;
        personagem.usarItem(item.id);

        console.log('\n  Voce usou ' + item.nome + '!');
        if (personagem.vidaAtual > vidaAntes)
          console.log('  Vida: ' + personagem.vidaAtual + '/' + personagem.vidaMax);
        if (personagem.manaAtual > manaAntes)
          console.log('  Mana: ' + personagem.manaAtual + '/' + personagem.manaMax);

        return 'item_usado';
      }

      if (!semFuga && escolha === 4) return 'fugir';
    }
  }
}

module.exports = Combate;
