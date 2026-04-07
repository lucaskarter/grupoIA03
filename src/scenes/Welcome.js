// Cena principal de menu inicial do jogo.
// Controla: fundo, personagem animado, botões e música.
export class welcomeScene extends Phaser.Scene {
  
  // Resolução lógica usada como referência para posicionamento
  alturaJogo = 1080;
  larguraJogo = 1920;

  constructor() {
    // Nome interno da cena (usado pelo Phaser para gerenciamento)
    super("welcomeScene");
  }

  preload() {
    // Tudo que será usado na cena deve ser carregado aqui antes do create()

    // Imagem de fundo do menu
    this.load.image("cenario", "assets/Menu/fundo_menu.png");

    // Botões
    this.load.image("play", "assets/Menu/start_button.png");
    this.load.image("options", "assets/Menu/options_button.png");

    // Logo
    this.load.image("logo", "assets/Menu/logo.png");

    // Spritesheet do personagem
    this.load.spritesheet("asimov", "assets/Personagens/asimov.png", {
      frameWidth: 32,   // largura de cada frame
      frameHeight: 32,  // altura de cada frame
    });
  }

  create() {

    // Adiciona o background centralizado na tela
    this.add
      .image(this.larguraJogo / 2, this.alturaJogo / 2, "cenario")
      .setScale(0.62); // reduz tamanho da imagem

    // Grupo estático = objetos que não sofrem física (não se movem)
    this.chao = this.physics.add.staticGroup();

    // Cria um "chão invisível" para o asimov andar
    this.chao
      .create(this.larguraJogo / 2, this.alturaJogo - 50)
      .setDisplaySize(this.larguraJogo, 483) // ajusta tamanho real
      .setVisible(false) // invisível, só serve para colisão
      .refreshBody(); // atualiza o corpo físico após mudanças

    // Logo
    this.add.image(this.larguraJogo / 2, 350, "logo").setScale(0.7);

    // Variável que determina a direção de asimov
    // -1 = esquerda ou 1 = direita
    this.direcao = -1; 

    // Animações
    // Define animação de caminhada
    this.anims.create({
      key: "andar",
      frames: this.anims.generateFrameNumbers("asimov", { start: 21, end: 27 }),
      frameRate: 8,     // frames por segundo
      repeat: -1,       // loop infinito
    });

    // Define animação parado (idle)
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("asimov", { start: 0, end: 1 }), 
      frameRate: 1,
    });

    // === PERSONAGEM ===
    // Cria sprite com física (gravidade, colisão, etc.)
    this.asimov = this.physics.add.sprite(1800, 710, "asimov");

    // Aumenta tamanho visual
    this.asimov.setScale(5);

    // Impede que saia da tela
    this.asimov.setCollideWorldBounds(true);

    // Aplica colisão com o chão
    this.physics.add.collider(this.asimov, this.chao);

    // Variável de controle de estado
    // "andando" ou "parado"
    this.estado = "andando";

    // Tempo (em ms) para próxima troca de estado
    this.tempoTroca = 0;

    // Inicia andando
    this.asimov.play("andar");

    // Velocidade horizontal inicial
    this.asimov.setVelocityX(150 * this.direcao); 

    // Botão Play
    this.play = this.add
      .image(this.larguraJogo / 2, 610, "play")
      .setScale(0.65)
      .setInteractive(); // habilita eventos de mouse

    // Botão Options
    this.options = this.add
      .image(950, 770, "options")
      .setScale(0.65)
      .setInteractive();

    // Eventos do botão play
    this.play.on("pointerover", () => {
      // Cursor vira "mãozinha"
      this.input.setDefaultCursor("pointer");
    });

    this.play.on("pointerout", () => {
      // Volta ao cursor padrão
      this.input.setDefaultCursor("default");
    });

    this.play.on("pointerdown", () => {
      // Troca para a cena inicial do jogo
      this.scene.start("sceneInicial");
    });

    // === EVENTOS DO BOTÃO OPTIONS ===
    this.options.on("pointerdown", () => {
      // Abre menu de opções sem fechar a cena atual
      this.scene.launch("menu", { origem: this.scene.key });
    });

    this.options.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    this.options.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    // Inicia cena separada responsável pela música de fundo
    this.scene.launch("bgMusic");
  }

  update(time) {
    // Ida e volta do asimov na tela

    // Limite esquerdo
    if (this.asimov.x < 100) {
      this.direcao = 1; // vai para direita

      // Flip horizontal: sprite olha para direita
      this.asimov.setFlipX(true);

      this.asimov.setVelocityX(150 * this.direcao); 
    }

    // Limite direito
    if (this.asimov.x > 1820) {
      this.direcao = -1; // vai para esquerda

      // Sprite olha para esquerda
      this.asimov.setFlipX(false);

      this.asimov.setVelocityX(150 * this.direcao); 
    }

    // Alterna entre andar e parar automaticamente
    if (time > this.tempoTroca) {

      // Estado atual: andando
      if (this.estado === "andando") {

        // Transição: andando -> parado
        this.estado = "parado";

        // Para movimento
        this.asimov.setVelocityX(0);

        // Troca animação
        this.asimov.play("idle");

        // Define próximo tempo de troca (1–3 segundos)
        this.tempoTroca = time + Phaser.Math.Between(1000, 3000);

      } else {

        // Transição: parado -> andando
        this.estado = "andando";

        // Retoma movimento na direção atual
        this.asimov.setVelocityX(150 * this.direcao);

        // Troca animação
        this.asimov.play("andar");

        // Define próximo tempo de troca (2–5 segundos)
        this.tempoTroca = time + Phaser.Math.Between(2000, 5000);
      }
    }
  }
}
