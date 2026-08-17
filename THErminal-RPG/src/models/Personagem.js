class Personagem {
  constructor(nome, classe) {
    this.nome = nome;
    this.classeId = classe.id;
    this.nomeClasse = classe.nome;
    this.nivel = classe.nivelInicial;
    this.atributos = Object.assign({}, classe.atributos);
    this.vidaMax = classe.vidaBase;
    this.vidaAtual = this.vidaMax;
    this.manaMax = classe.manaBase;
    this.manaAtual = this.manaMax;
    this.inventario = [];
    this.armaEquipada = null;
    this.habilidade = Object.assign({}, classe.habilidade);
    this.exp = 0;
    this.expParaNivel = 100;
    this.moedas = 25;
  }

  equiparArma(arma) {
    this.armaEquipada = arma;
    const idx = this.inventario.findIndex(i => i.id === arma.id);
    if (idx === -1) this.inventario.push(arma);
  }

  calcularAtaque() {
    if (!this.armaEquipada) return 2;
    const escala = this.atributos[this.armaEquipada.scaling] || 0;
    return this.armaEquipada.dano + Math.floor(escala * 0.5);
  }

  atacar(alvo) {
    const dano = Math.max(this.calcularAtaque() - (alvo.defesa || 0), 1);
    alvo.receberDano(dano);
    return dano;
  }

  receberDano(dano) {
    this.vidaAtual = Math.max(this.vidaAtual - dano, 0);
  }

  estaVivo() {
    return this.vidaAtual > 0;
  }

  usarHabilidade(alvo) {
    const hab = this.habilidade;
    if (this.manaAtual < hab.custo_mana) {
      return { sucesso: false, motivo: 'mana_insuficiente' };
    }
    this.manaAtual -= hab.custo_mana;

    if (hab.tipo === 'ataque_especial') {
      const danoBase = this.calcularAtaque() + hab.bonus_dano;
      const defesaReduzida = Math.max((alvo.defesa || 0) - (hab.ignorar_defesa || 0), 0);
      const dano = Math.max(danoBase - defesaReduzida, 1);
      alvo.receberDano(dano);
      return { sucesso: true, dano };
    }

    if (hab.tipo === 'magia_dano') {
      const escala = this.atributos[hab.scaling] || 0;
      let dano = Math.floor(hab.bonus_dano + escala * 0.7);
      let critico = false;
      if (hab.critico_chance && Math.random() < hab.critico_chance) {
        dano = Math.floor(dano * 1.5);
        critico = true;
      }
      alvo.receberDano(dano);
      return { sucesso: true, dano, critico };
    }

    if (hab.tipo === 'sorte') {
      if (Math.random() < 0.5) {
        const curado = Math.min(hab.cura, this.vidaMax - this.vidaAtual);
        this.vidaAtual += curado;
        return { sucesso: true, cura: curado };
      } else {
        const dano = Math.max(hab.bonus_dano - (alvo.defesa || 0), 1);
        alvo.receberDano(dano);
        return { sucesso: true, dano, critico: true };
      }
    }

    return { sucesso: false, motivo: 'tipo_desconhecido' };
  }

  adicionarItem(itemData) {
    this.inventario.push(Object.assign({}, itemData));
  }

  usarItem(itemId) {
    const idx = this.inventario.findIndex(i => i.id === itemId && i.tipo === 'consumivel');
    if (idx === -1) return false;
    const item = this.inventario[idx];

    if (item.efeito === 'curar_vida') {
      this.vidaAtual = Math.min(this.vidaAtual + item.valor, this.vidaMax);
    } else if (item.efeito === 'curar_mana') {
      this.manaAtual = Math.min(this.manaAtual + item.valor, this.manaMax);
    } else if (item.efeito === 'curar_vida_total') {
      this.vidaAtual = this.vidaMax;
    }

    this.inventario.splice(idx, 1);
    return true;
  }

  ganharExp(quantidade) {
    this.exp += quantidade;
    return this.exp >= this.expParaNivel;
  }

  levelUp() {
    this.nivel++;
    this.exp -= this.expParaNivel;
    this.expParaNivel = this.nivel * 100;
    this.vidaMax += 10;
    this.vidaAtual = Math.min(this.vidaAtual + 10, this.vidaMax);
    this.manaMax += 5;
    this.manaAtual = Math.min(this.manaAtual + 5, this.manaMax);
  }

  aumentarAtributo(nomeAtributo) {
    if (this.atributos[nomeAtributo] !== undefined) {
      this.atributos[nomeAtributo] += 2;
      return true;
    }
    return false;
  }

  status() {
    const Utils = require('../utils/Utils');
    const armaInfo = this.armaEquipada
      ? this.armaEquipada.nome + ' [+' + this.calcularAtaque() + ' dano]'
      : 'Sem arma';
    const consumiveis = this.inventario.filter(i => i.tipo === 'consumivel');
    const inventarioStr = consumiveis.length === 0
      ? 'Vazio'
      : consumiveis.map(i => i.nome).join(', ');

    return [
      '',
      this.nome + '  [Lv.' + this.nivel + ' ' + this.nomeClasse + ']',
      Utils.separador('─', 56),
      '  Vida  ' + Utils.barraProgresso(this.vidaAtual, this.vidaMax),
      '  Mana  ' + Utils.barraProgresso(this.manaAtual, this.manaMax),
      '  EXP   ' + Utils.barraProgresso(this.exp, this.expParaNivel) + '  (Nv.' + (this.nivel + 1) + ')',
      '  Moedas: ' + this.moedas,
      Utils.separador('─', 56),
      '  VIG ' + this.atributos.vigor +
        '  MEN ' + this.atributos.mente +
        '  VIT ' + this.atributos.vitalidade +
        '  FOR ' + this.atributos.forca +
        '  DES ' + this.atributos.destreza,
      '  INT ' + this.atributos.inteligencia +
        '  FE  ' + this.atributos.fe +
        '  ARC ' + this.atributos.arcano,
      Utils.separador('─', 56),
      '  Arma:       ' + armaInfo,
      '  Hab:        ' + this.habilidade.nome + ' [' + this.habilidade.custo_mana + ' mana]',
      '  Inventario: ' + inventarioStr,
      ''
    ].join('\n');
  }

  serializar() {
    return {
      nome: this.nome,
      classeId: this.classeId,
      nomeClasse: this.nomeClasse,
      nivel: this.nivel,
      atributos: Object.assign({}, this.atributos),
      vidaMax: this.vidaMax,
      vidaAtual: this.vidaAtual,
      manaMax: this.manaMax,
      manaAtual: this.manaAtual,
      inventario: this.inventario.map(i => Object.assign({}, i)),
      armaEquipada: this.armaEquipada ? Object.assign({}, this.armaEquipada) : null,
      habilidade: Object.assign({}, this.habilidade),
      exp: this.exp,
      expParaNivel: this.expParaNivel,
      moedas: this.moedas
    };
  }
}

module.exports = Personagem;
