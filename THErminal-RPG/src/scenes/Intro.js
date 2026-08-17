const Utils = require('../utils/Utils');
const { criarPersonagem } = require('../services/PersonagemFactory');
const classes = require('../data/classes.json');
const historia = require('../data/historia.json');

const TITULO =
  "████████╗██╗  ██╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     \n" +
  "╚══██╔══╝██║  ██║██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     \n" +
  "   ██║   ███████║█████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     \n" +
  "   ██║   ██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     \n" +
  "   ██║   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗\n" +
  "   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝\n";

function executar() {
  Utils.limparTela();
  console.log(TITULO);
  Utils.separador('═');
  Utils.sleep(400);

  Utils.digitar(historia.abertura);
  Utils.enter();

  Utils.limparTela();
  console.log(TITULO);
  Utils.separador('─');
  Utils.digitar(historia.intro_classe);
  console.log('');

  const nome = Utils.texto('Qual e o seu nome?');
  console.log('');

  const idsClasses = Object.keys(classes);
  const labels = idsClasses.map(id => {
    const c = classes[id];
    return c.nome + '  —  ' + c.descricao;
  });

  const escolha = Utils.menu('Escolha sua origem:', labels) - 1;
  const classeId = idsClasses[escolha];
  const classe = classes[classeId];

  console.log('');
  Utils.separador('─');
  console.log('  Classe:     ' + classe.nome);
  console.log('  Arma:       ' + classe.armaInicial.replace(/_/g, ' '));
  console.log('  Habilidade: ' + classe.habilidade.nome + ' — ' + classe.habilidade.descricao);
  Utils.separador('─');
  Utils.enter('\nSua jornada comeca. [Enter]');

  return criarPersonagem(classeId, nome);
}

module.exports = { executar };
