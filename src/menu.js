//esse arquivo configura toda a mecânica de menu que pode ser usada durante todo o jogo, por meio de heranças nas classes do jogo.

export function registrarTeclaMenu(cena) {
  cena.input.keyboard.on("keydown-M", () => {
    if (cena.scene.isActive("menu")) return;
    //
    cena.scene.pause();
    cena.scene.launch("menu", { origem: cena.scene.key });
  });
}

export class menu extends Phaser.Scene {
  //herança do arquivo do Phaser, para conseguir utilizar suas funções.
  constructor() {
    super({ key: "menu", active: false }); //para conseguir ter acesso ao menu se tem a chave e como é o seu estado. No caso False, porque não fica aparecendo continuamente
  }

  //aqui são carregados todas as imagens e sprites do menu, antes de serem criadas, é ficado na memória do computador ou nuvem
  preload() {
    this.load.spritesheet("objetosMenu", "assets/Menu/infoMenu.png", {
      frameWidth: 320,
      frameHeight: 320,
    });
    this.load.image("controleBtn", "assets/Menu/controle.png");
    this.load.image("voltarBtn", "assets/Menu/voltar.png");
    this.load.image("sairBotao", "assets/Menu/sair.png");
  }

  //aqui são criadas todas as imagens que vão aparecer na tela e todas as suas configurações
  create() {
    const { width, height } = this.sys.game.config; //aramazenamento do tamanho da tela que está nas configurações da main

    // Inicia a cena de música de fundo (bgMusic): áudio em loop ao abrir o menu.
    this.scene.launch("bgMusic");

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setDepth(9)
      .setInteractive();

    //criação da imagem que esta dentro de um sprite de todas as imagens do menu. Frame 0, porque é o primeiro frame
    this.fundoMenu = this.add
      .sprite(width / 2, height / 2, "objetosMenu")
      .setFrame(0)
      .setScale(5.0)
      .setDepth(10);
    //este é o último frame do sprite que é representado quando o usuário deseja acessar as instruções
    this.instrucao = this.add
      .sprite(width / 2, height / 2, "objetosMenu")
      .setFrame(6)
      .setScale(5.0)
      .setDepth(11)
      .setVisible(false);

    //estas 3 imagens eram sprites, mas tive que transformar em imagens, pois a parte transparente do sprite estava fazendo com que quando clicava em um botão fazia outra função, pois se sobresaia em relação ao outro frame
    this.controle = this.add
      .image(width / 2, height / 2 - 180, "controleBtn")
      .setScale(5.0)
      .setDepth(12)
      .setInteractive();
    this.voltar = this.add
      .image(width / 2, height / 2 + 180, "voltarBtn")
      .setScale(5.0)
      .setDepth(12)
      .setInteractive();
    this.sair = this.add
      .image(width / 2 + 300, height / 2 - 320, "sairBotao")
      .setScale(4.0)
      .setDepth(12)
      .setInteractive();

    this.controle.on("pointerdown", () => {
      //quando apertar em controle com o botão esquerdo do mouse
      this.fundoMenu.setVisible(false);
      this.controle.setVisible(false);
      this.voltar.setVisible(false);
      this.instrucao.setVisible(true);
    });

    this.voltar.on("pointerdown", () => this.fecharMenu(true)); //quando apertar em botão com o botão esquerdo do mouse
    this.sair.on("pointerdown", () => this.fecharMenu(false)); //quando apertar em sair com o botão esquerdo do mouse
    this.input.keyboard.once("keydown-M", () => this.fecharMenu(false)); //quando apertar M, fecha tudo
  }

  fecharMenu(irParaWelcome) {
    //método para fechar o menu e todas as opções que existem
    let origem;
    if (this.scene.settings.data && this.scene.settings.data.origem) {
      origem = this.scene.settings.data.origem;
    } else {
      origem = "valor_padrao";
    }
    this.scene.stop();
    if (irParaWelcome) {
      if (origem) this.scene.stop(origem);
      this.scene.start("welcomeScene");
    } else {
      if (origem) this.scene.resume(origem);
    }
  }
}
