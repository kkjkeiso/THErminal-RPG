const readline = require('readline-sync');

class Utils {
  static perguntar(mensagem) {
    return readline.question(mensagem + '\n> ');
  }

  static enter(mensagem = '\n[Enter para continuar...]') {
    readline.question(mensagem);
  }

  static texto(mensagem) {
    let entrada;
    do {
      entrada = readline.question(mensagem + '\n> ').trim();
      if (entrada === '') console.log('Isso nao pode ficar em branco. Tente novamente.');
    } while (entrada === '');
    return entrada;
  }

  static numero(mensagem, min, max) {
    while (true) {
      const entrada = readline.question(mensagem + '\n> ').trim();
      const valor = Number(entrada);
      if (entrada === '' || isNaN(valor)) { console.log('Digite um numero valido.'); continue; }
      if (valor < min || valor > max) { console.log('Escolha entre ' + min + ' e ' + max + '.'); continue; }
      return valor;
    }
  }

  static confirmar(mensagem) {
    while (true) {
      const entrada = readline.question(mensagem + ' (s/n)\n> ').trim().toLowerCase();
      if (entrada === 's') return true;
      if (entrada === 'n') return false;
      console.log('Responda com s ou n.');
    }
  }

  static menu(titulo, opcoes) {
    console.log('\n' + titulo);
    opcoes.forEach((op, i) => console.log('  [' + (i + 1) + '] ' + op));
    return Utils.numero('', 1, opcoes.length);
  }

  static sleep(ms) {
    const buf = new SharedArrayBuffer(4);
    Atomics.wait(new Int32Array(buf), 0, 0, ms);
  }

  static digitar(texto, velocidadeMs = 18) {
    for (const char of texto) {
      process.stdout.write(char);
      if (velocidadeMs > 0) Utils.sleep(velocidadeMs);
    }
    process.stdout.write('\n');
  }

  static limparTela() {
    process.stdout.write('\x1B[2J\x1B[0f');
  }

  static separador(char = '─', largura = 56) {
    console.log(char.repeat(largura));
  }

  static barraProgresso(atual, max, largura = 18) {
    const pct = Math.max(0, Math.min(1, atual / max));
    const cheias = Math.round(pct * largura);
    return '[' + '█'.repeat(cheias) + '░'.repeat(largura - cheias) + '] ' + atual + '/' + max;
  }

  static cabecalho(texto) {
    Utils.separador('═');
    const pad = Math.max(0, Math.floor((56 - texto.length) / 2));
    console.log(' '.repeat(pad) + texto);
    Utils.separador('═');
  }
}

module.exports = Utils;
