class Inimigo {
  constructor(dados) {
    this.id = dados.id;
    this.nome = dados.nome;
    this.artigo = dados.artigo;
    this.vidaMax = dados.vida;
    this.vidaAtual = dados.vida;
    this.defesa = dados.defesa;
    this.dano_base = dados.dano_base;
    this.arma_nome = dados.arma_nome;
    this.artigo_arma = dados.artigo_arma;
    this.exp = dados.exp;
    this.moedas_min = dados.moedas_min;
    this.moedas_max = dados.moedas_max;
    this.drop_item = dados.drop_item || null;
    this.drop_item_tipo = dados.drop_item_tipo || 'consumivel';
    this.drop_chance = dados.drop_chance || 0;
    this.habilidade_especial = dados.habilidade_especial || null;
    this.dano_drenar = dados.dano_drenar || 0;
    this.cura_drenar = dados.cura_drenar || 0;
    this.e_boss = dados.e_boss || false;
  }

  estaVivo() {
    return this.vidaAtual > 0;
  }

  receberDano(dano) {
    this.vidaAtual = Math.max(this.vidaAtual - dano, 0);
  }

  calcularDano() {
    const variacao = Math.floor(Math.random() * 5) - 2;
    return Math.max(this.dano_base + variacao, 1);
  }

  usarHabilidadeEspecial(alvo) {
    if (!this.habilidade_especial) return null;
    if (
      this.habilidade_especial === 'drenar_vida' ||
      this.habilidade_especial === 'drenar_alma'
    ) {
      alvo.receberDano(this.dano_drenar);
      this.vidaAtual = Math.min(this.vidaAtual + this.cura_drenar, this.vidaMax);
      return { tipo: 'drenar', dano: this.dano_drenar, cura: this.cura_drenar };
    }
    return null;
  }

  gerarMoedas() {
    const intervalo = this.moedas_max - this.moedas_min;
    return this.moedas_min + Math.floor(Math.random() * (intervalo + 1));
  }

  tentarDrop() {
    if (!this.drop_item) return null;
    return Math.random() * 100 < this.drop_chance ? this.drop_item : null;
  }

  barraVida(largura = 18) {
    const pct = Math.max(0, Math.min(1, this.vidaAtual / this.vidaMax));
    const cheias = Math.round(pct * largura);
    return '[' + '█'.repeat(cheias) + '░'.repeat(largura - cheias) + '] ' + this.vidaAtual + '/' + this.vidaMax;
  }
}

module.exports = Inimigo;
