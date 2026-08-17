const fs = require('fs');
const path = require('path');

const SAVE_PATH = path.join(__dirname, '../../save.json');

class SalvarJogo {
  static existeSave() {
    return fs.existsSync(SAVE_PATH);
  }

  static salvar(personagem, estadoJogo) {
    const dados = {
      versao: '1.0',
      timestamp: new Date().toISOString(),
      personagemDados: personagem.serializar(),
      dia: estadoJogo.dia,
      area_atual: estadoJogo.area_atual,
      areas_concluidas: estadoJogo.areas_concluidas,
      flags: estadoJogo.flags
    };
    fs.writeFileSync(SAVE_PATH, JSON.stringify(dados, null, 2));
    console.log('\nJogo salvo!');
  }

  static carregar() {
    if (!SalvarJogo.existeSave()) return null;
    try {
      return JSON.parse(fs.readFileSync(SAVE_PATH, 'utf8'));
    } catch (e) {
      console.log('Erro ao ler o save. Iniciando novo jogo.');
      return null;
    }
  }

  static deletar() {
    if (fs.existsSync(SAVE_PATH)) fs.unlinkSync(SAVE_PATH);
  }
}

module.exports = SalvarJogo;
