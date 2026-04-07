import { registrarTeclaMenu } from "../menu.js";

export class faseUm extends Phaser.Scene {
  constructor() {
    super("faseUm");
  }

  preload() {
    //carregamento das imagens e sprites usados durante a fase1
    this.load.image("fundo", "../assets/fases/faseUm/fundofaseUm.png");
    this.load.spritesheet("asimov", "../assets/personagens/asimov.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    //this.load.image('pedra', '../assets/objetos/faseUm/obstaculosPedra.png');
    this.load.image(
      "obstaculos",
      "../assets/Objetos/faseUm/obstaculosfaseUm.png",
    );
    this.load.spritesheet(
      "barra",
      "../assets/objetos/faseUm/barraProgresso.png",
      { frameWidth: 256, frameHeight: 128 },
    );
    this.load.spritesheet("bauAnimado", "../assets/objetos/faseUm/bau.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet(
      "envelope",
      "../assets/objetos/faseUm/envelopes.png",
      { frameWidth: 320, frameHeight: 320 },
    );
    this.load.spritesheet("pergaminho", "../assets/objetos/faseUm/perga.png", {
      frameWidth: 437.5,
      frameHeight: 438,
    });
    this.load.video("videofaseUm", "../assets/Fases/faseUm/videofaseUm.mp4");
    this.load.image(
      "caixaDeTextoInicial",
      "../assets/Fases/faseUm/caixaDeTextoInicial.png",
    );
    this.load.audio("colisao", "assets/colision_sound.wav");

    // Carrega a música específica dessa fase
    this.load.audio("bg-music-fases", "assets/bg-music-fases.mp3");
  }

  create() {
    registrarTeclaMenu(this);

    // Inicia a música específica das fases
    this.musicFases = this.sound.add("bg-music-fases");
    this.musicFases.play({ loop: true });

    //variáveis ao longo do código vão sendo explicados
    this.progressoHistoria = 0;
    this.lendoMensagem = false;
    this.podeInteragir = false;
    this.cliquesEnvelope = 0;
    this.frameEnvelope = 0;
    this.pergaminhoAberto = false;
    this.pergaminhoEsperandoE = false;
    this.faseIniciada = false;

    const { width, height } = this.sys.game.config;
    this.velocidade = 5;
    this.velocidadeAsimov = 100;
    this.finalizarJogo = false;

    this.mapa = this.add
      .image(0, height / 2, "fundo")
      .setScale(4.0)
      .setOrigin(0, 0.5); //cração do fundo onde o Asimov anda

    this.physics.world.setBounds(0, 0, this.mapa.displayWidth, height);
    this.cameras.main.setBounds(0, 0, this.mapa.displayWidth, height);
    this.cameraSeguindo = false; //a câmera começa parada então seu parâmetro é falso
    this.meioTela = width / 2;

    this.cameraBalanco = 0;
    this.cameraBalancoAlvo = 0;

    this.obstaculosJuntos = this.add
      .image(0, height / 2, "obstaculos")
      .setScale(3.7)
      .setOrigin(0, 0.5); //adiciona a imagem dos obstáculos e define onde eles estarão localizados
    this.bau = this.add
      .sprite(this.mapa.displayWidth - 100, height / 2 - 50, "bauAnimado", 0)
      .setScale(1.5); //bau está localizado 100 pixels da esquerda do tamanho da imagem do fundo
    this.bauAberto = false; //fechado até que o jogador interaja com ele

    // Balão de fala — tecla E baú
    this.containerTeclaBau = this.add.container(0, 0).setDepth(200);
    let larguraBal = 140,
      alturaBal = 40;
    let iconeBau = this.add.graphics();
    iconeBau.fillStyle(0xffffff, 1);
    iconeBau.lineStyle(2, 0x000000, 1);
    iconeBau.fillRoundedRect(
      -larguraBal / 2,
      -alturaBal / 2,
      larguraBal,
      alturaBal,
      10,
    );
    iconeBau.strokeRoundedRect(
      -larguraBal / 2,
      -alturaBal / 2,
      larguraBal,
      alturaBal,
      10,
    );
    let letraBau = this.add
      .text(0, 0, "Aperte E", {
        fontSize: "20px",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.containerTeclaBau.add([iconeBau, letraBau]);
    this.containerTeclaBau.setVisible(false);
    this.tweens.add({
      targets: this.containerTeclaBau,
      y: "+=5",
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    //o setScollFactor(0), faz com que ele não fique para traz com o movimento da câmera. o Deph define o quão em cima das outras camadas ele ficará
    this.overlay = this.add
      .rectangle(0, 0, width * 3, height, 0x000000)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(100); //retangulo grande e preto para escurecer a tela no momento de abertura do baú
    this.overlay.alpha = 0; //transparência total
    this.envelope = this.add
      .sprite(width / 2, height + 200, "envelope", 0)
      .setScale(1.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setVisible(false)
      .setInteractive(); //o setInteractive ativa a detecção de entrada(cliques)
    this.pergaminho = this.add
      .sprite(width - 500, height / 2, "pergaminho", 0)
      .setScale(2)
      .setScrollFactor(0)
      .setDepth(102)
      .setVisible(false);

    //============================================================================ PRECISA CORRIGIR
    this.obstaculosCaixaColisao = null;
    try {
      const imgObstaculos = this.textures.get("obstaculos").getSourceImage(); //precisa da imagem HTML nativa para desenhá-la em um canvas e ler seus pixels.
      const canvasObstaculos = document.createElement("canvas"); //cria um elemento canvas HTML invisivel na memória
      canvasObstaculos.width = imgObstaculos.width;
      canvasObstaculos.height = imgObstaculos.height;
      this.obstaculosCaixaColisao = canvasObstaculos.getContext("2d"); //cria um contexto 2D
      this.obstaculosCaixaColisao.drawImage(imgObstaculos, 0, 0); //desenha a imagem no canvas invisivel
    } catch (e) {
      console.warn("Problema no sistema Canvas", e);
    }
    this.obstaculosScale = 3.7;
    //==========================================================================

    this.barra = this.add
      .sprite(width / 2, 150, "barra")
      .setScale(3)
      .setScrollFactor(0)
      .setDepth(50); //barra de progresso da fase

    this.textoBarra = this.add
      .text(
        width / 2,
        30,
        "Asimov em treinamento de padrões de obstáculos...",
        {
          //texto acima da barra
          fontFamily: "fantasy",
          fontSize: "25px",
          fill: "#d9d9d9",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);

    this.barraAnimando = false; //começa com sprite 0 da barra estatico
    this.asimov = this.physics.add
      .sprite(width / 10, 480, "asimov")
      .setScale(5)
      .setCollideWorldBounds(true); //sprite Asimov
    this.faixaAtual = 1; //existem 3 faixas horizontais onde o personagem pode se deslocar. Ele começa na do meio
    this.pulando = false; //pulo
    this.faixaY = [300, 480, 650]; //lista com onde o personagem fica no eixo Y das faixas

    this.obstaculos = this.physics.add.group(); //todos os obstaculos dentro compartilham das mesmas propriedades físicas
    this.physics.add.collider(
      this.asimov,
      this.obstaculos,
      this.baterObstaculos,
      null,
      this,
    ); //adiciona colisão no asimov, nos obstaculos e adiciona a função para executar quando a colisão acontece. Null é um filtro adicional de colisão e this fala sobre a cena atual.

    //teclas pressionadas encaixadas em variáveis
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      S: Phaser.Input.Keyboard.KeyCodes.S,
    });
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    registrarTeclaMenu(this);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keySpace = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    this.anims.create({
      //da inicio aos frames da barra de progresso
      key: "barraProgresso",
      frames: this.anims.generateFrameNumbers("barra", { start: 0, end: 66 }),
      frameRate: 1.9,
      repeat: 0,
    });

    //movimentação e localização de todos os frames para cada lado do robô Asimov
    if (!this.anims.exists("asimov_left")) {
      this.anims.create({
        key: "asimov_right",
        frames: this.anims.generateFrameNumbers("asimov", {
          start: 28,
          end: 35,
        }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: "asimov_left",
        frames: this.anims.generateFrameNumbers("asimov", {
          start: 21,
          end: 27,
        }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: "asimov_back",
        frames: this.anims.generateFrameNumbers("asimov", {
          start: 14,
          end: 16,
        }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: "asimov_front",
        frames: this.anims.generateFrameNumbers("asimov", { start: 7, end: 9 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    this.asimov.play("asimov_right"); //o jogador não precisa mover o robô para frente, ele ja faz isso naturalmente

    const caixaIntro = this.add
      .image(width / 2, height / 2, "caixaDeTextoInicial")
      .setScrollFactor(0)
      .setDepth(2000)
      .setScale(0.9);
    this.caixaIntro = caixaIntro;

    //animação de leve aumento e diminuição da caixa de texto para chamar atenção
    this.tweens.add({
      targets: this.caixaIntro,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.input.once("pointerdown", () => {
      if (!this.faseIniciada) {
        this.faseIniciada = true;
        this.caixaIntro.destroy();
      }
    });

    // Aviso fixo na tela
    this.retanguloAviso = this.add.graphics();
    this.retanguloAviso.fillStyle(0x000000, 0.8);
    this.retanguloAviso.fillRect(700, 990, 500, 30, 15);
    this.retanguloAviso.setScrollFactor(0).setDepth(2000).setVisible(false);

    this.textoAviso = this.add
      .text(950, 1000, "", {
        fontSize: "18px",
        fill: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2001)
      .setVisible(false);

    this.somColisao = this.sound.add("colisao");
  }

  update() {
    if (!this.faseIniciada) {
      return;
    }

    if (this.pergaminhoEsperandoE) {
      if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
        this.pergaminhoEsperandoE = false;
        const { width, height } = this.sys.game.config;
        const video = this.add
          .video(width / 2, height / 2, "videofaseUm")
          .setScale(2.0)
          .setScrollFactor(0)
          .setDepth(103);
        video.play();
        let gifElemento8 = document.createElement('img');
        gifElemento8.src = 'assets/TextosCenas/aprendizado.gif';
    
        // Forçando estilos CSS para garantir que ele apareça
        gifElemento8.style.width = '1920px'; // Coloque a largura aproximada do seu GIF
        gifElemento8.style.height = '1080px';
        //gifElement.style.display = 'block';
        //gifElement.style.border = '2px solid red'; // Descomente para debugar: se a borda vermelha aparecer, o HTML está funcionando, mas o caminho do arquivo pode estar errado.
    
        let domElemento8 = this.add.dom( 1550, 0 , gifElemento8).setOrigin(0.8).setScrollFactor(0);
        const duracaoDoGif = 5000; 
        // O Phaser espera esse tempo passar e executa a função interna
        this.time.delayedCall(duracaoDoGif, () => {
            // Verifica se o elemento ainda existe na cena
            if (domElemento8 && domElemento8.active) {
                // Esconde o GIF para ele não aparecer rodando de novo
                domElemento8.setVisible(false); 
                domElemento8.destroy(); 
            }
        });
        video.on("complete", () => {
          this.scene.start("transicao1para2");
        });
      }
      return;
    }

    const gravidadeOriginal = 0; //sem gravidade
    //no moento do pulo
    if (this.pulando) {
      this.physics.world.gravity.y = 600; //gravidade faz o robô ser puxado para baixo
      if (
        this.asimov.body.velocity.y > 0 &&
        this.asimov.y >= this.faixaY[this.faixaAtual]
      ) {
        //se o movimento do pulo estiver descendente e maior ou igual ao eixo Y da sua faixa
        this.asimov.y = this.faixaY[this.faixaAtual]; //fixa o Asimov na faixa em que ele tem que andar já determinada pelo valor na lista
        this.physics.world.gravity.y = gravidadeOriginal; //volta a zero
        this.pulando = false; //acaba o movimento do pulo
        this.ajustarFramerateBarra(false); //volta framerate da barra ao normal
      }
    } else {
      //pulo, abertura de baú e velocidades eixo X e Y
      this.physics.world.gravity.y = gravidadeOriginal;

      if (this.asimov.x >= this.mapa.displayWidth - 200) {
        //quando o robô cegar a 200 pixels da esquerda do final da imagem do fundo para a alimação dele andando e seu movimento
        this.asimov.setVelocityX(0);
        this.asimov.anims.stop();

        this.containerTeclaBau.setPosition(this.bau.x, this.bau.y - 120);
        if (!this.bauAberto) this.containerTeclaBau.setVisible(true);

        if (Phaser.Input.Keyboard.JustDown(this.teclaE) && !this.bauAberto) {
          //se apertar E o baú se abre
          this.bauAberto = true;
          this.containerTeclaBau.setVisible(false);
          this.bau.setFrame(1);
          this.abrirBau();
        }
      } else {
        this.containerTeclaBau.setVisible(false);
        this.asimov.setVelocityX(this.velocidadeAsimov); //se ele não chegou ao final do mapa, então mantém a velocidade X determinada no início do código
      }
      this.asimov.setVelocityY(0); //velocidade Y é sempre 0
      if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
        //movimento de subida do pulo com o aperto do SPACE
        this.pulando = true;
        this.asimov.setVelocity(350, -280); //personagem movimenta 280px para frente e 280 para cima
        this.ajustarFramerateBarra(true); //aumenta framerate da barra durante o pulo
      }
    }
    if (this.asimov.x < this.mapa.displayWidth - 200) {
      //faz com que o sprite do robô sempre retorne a animação de andando para a direita
      this.asimov.anims.play("asimov_right", true);
    }
    if (!this.barraAnimando) {
      //dá play na animação da barra de progresso
      this.barraAnimando = true;
      this.barra.play("barraProgresso");
    }

    let movimentacao = false;

    if (
      !this.pulando &&
      (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.keys.W))
    ) {
      //caso o jogador não esteja pulando e apertar seta para cima ou W
      if (this.faixaAtual === 2) {
        this.faixaAtual = 1;
        this.asimov.y = 480;
      } //se for a ultima faixa, vai para o meio
      else if (this.faixaAtual === 1) {
        this.faixaAtual = 0;
        this.asimov.y = 300;
      } //se for a do meio vai para a primeira
      if (!movimentacao) this.asimov.anims.play("asimov_back", true);
      this.cameraBalancoAlvo = -3; //faz com que haja um balanço na câmera
    } else if (
      !this.pulando &&
      (Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
        Phaser.Input.Keyboard.JustDown(this.keys.S))
    ) {
      //caso o jogador não esteja pulando e apertar seta para baixo ou S
      if (this.faixaAtual === 0) {
        this.faixaAtual = 1;
        this.asimov.y = 480;
      } //se ele estiver na faixa de cima, muda para baixo
      else if (this.faixaAtual === 1) {
        this.faixaAtual = 2;
        this.asimov.y = 650;
      } //se estiver na faixa do meio, vai para baixo
      if (!movimentacao) this.asimov.anims.play("asimov_front", true);
      //movimentacao = true;
      this.cameraBalancoAlvo = 3;
    }

    if (!this.pulando)
      this.asimov.y = Phaser.Math.Clamp(this.asimov.y, 300, 650); //limita o valor do minimo e máximo
    if (!this.cameraSeguindo && this.asimov.x >= this.meioTela) {
      //caso a câmera ainda não esteja seguindo e o eixo x do asimov estiver no meio, a câmera passa a seguir
      this.cameraSeguindo = true;
      this.cameras.main.startFollow(this.asimov, true, 0.1, 0.1); //a câmera segue o jogador e define a velocidade desse movimento
    }

    //movimento da câmera configs
    this.cameraBalanco += (this.cameraBalancoAlvo - this.cameraBalanco) * 0.15; //se o balanço é 3, então: (3-0)*0,15 = 0,45 graus
    if (Math.abs(this.cameraBalanco) > 0.1) {
      this.cameraBalancoAlvo += (0 - this.cameraBalancoAlvo) * 0.08; //se o balanço for maior que 0,1 a camera retorna para a posição
    } else {
      //move a câmera para a posição 0
      this.cameraBalanco = 0;
      this.cameraBalancoAlvo = 0;
    }
    this.cameras.main.setRotation(this.cameraBalanco * 0.01); //movimenta no angulo de rotação

    //define pontos em todos os lados do personagem para colisão. Matriz de colisão x e y e pontos de colisão
    if (!this.finalizarJogo) {
      const raio = 40;
      const pontos = [
        [this.asimov.x, this.asimov.y],
        [this.asimov.x + raio, this.asimov.y],
        [this.asimov.x - raio, this.asimov.y],
        [this.asimov.x, this.asimov.y + raio],
        [this.asimov.x, this.asimov.y - raio],
      ];
      for (const [px, py] of pontos) {
        const tipo = this.sobrepoeObstaculo(px, py);
        // branco especial: sempre colide (mesmo no pulo)
        /*if (tipo === 'branco') { //definido abaixo no código
                    this.baterObstaculos(this.asimov, this.obstaculosJuntos); //aciona função de sobreposição
                    break;
                }*/
        // cor específica #39197e (bloqueia também durante o pulo)
        if (tipo === "verdePulo" /*&& this.pulando*/) {
          this.baterObstaculos(this.asimov, this.obstaculosJuntos);
          break;
        }
        // outras áreas sólidas: só colidem se não estiver pulando
        if (tipo === "marromPulo" && !this.pulando) {
          this.baterObstaculos(this.asimov, this.obstaculosJuntos);
          break;
        }
      }
    }
  }

  //ajusta o framerate da barra de progresso durante o pulo
  ajustarFramerateBarra(pulando) {
    if (!this.barra.anims.isPlaying) return;
    if (pulando == true) {
      this.barra.anims.msPerFrame = 1000 / 7.3; //esse msPerFrame autera o frameRate da animação da barra
    } else {
      this.barra.anims.msPerFrame = 1000 / 1.9;
    }
  }

  //função que recebe a coordenada x e y e verifica a cor do pixel de contato
  sobrepoeObstaculo(xMundo, yMundo) {
    if (!this.obstaculosCaixaColisao) return false; //proteção contra crash

    const { height } = this.sys.game.config; //acessa a propriedade de altura da configuração do game
    const img = this.textures.get("obstaculos").getSourceImage(); //permite ler os pixels da imagem para colisão pixel a pixel
    const scale = this.obstaculosScale;
    const topLeftY = height / 2 - (img.height * scale) / 2;

    const texX = (xMundo - 0) / scale; //pega a coordenada do asimov no eixo x
    const texY = (yMundo - topLeftY) / scale; //pega a coordenada do asimov no eixo y

    if (texX < 0 || texY < 0 || texX >= img.width || texY >= img.height)
      return false; //se as coordenadas estiverem fora da imagem ou menores que zero retorna falso que é sem colisão

    const pixel = this.obstaculosCaixaColisao.getImageData(
      Math.floor(texX),
      Math.floor(texY),
      1,
      1,
    ).data; //variável que recebe método que extrai dados de pixels de uma região e retorna um array com 4 valores R, G, B, A
    const [r, g, b, a] = pixel; //recebe o array de cores do pixel
    if (a <= 80) return false; //se o pixel for transparente, não há colisão

    // Cor especial #27c3a7: bloqueia também durante o pulo
    const corPuloPedra =
      Math.abs(r - 39) < 5 && Math.abs(g - 195) < 5 && Math.abs(b - 167) < 5;
    if (corPuloPedra) return "verdePulo";

    const corPuloArmario =
      Math.abs(r - 83) < 5 && Math.abs(g - 53) < 5 && Math.abs(b - 19) < 5;
    if (corPuloArmario) return "marromPulo";
  }

  //o que acontece quando bater no obstaculo, fenômeno não físico
  baterObstaculos(asimov, obstacle) {
    if (this.finalizarJogo) return; //se estiver true, então sai dessa condição

    this.finalizarJogo = true;
    const { width } = this.sys.game.config;

    //reseta posição do jogador
    asimov.x = width / 10;
    asimov.y = 480;
    this.faixaAtual = 1; //retorna para posição do meio

    //reseta câmera
    this.cameraSeguindo = false;
    this.cameras.main.stopFollow(); //câmera para de seguir o personagem
    this.cameras.main.scrollX = 0; //Câmera retorna para o ínicio, começo do mapa de fundo dessa fase

    //reseta barra de progresso para o ínicio
    this.barraAnimando = false;
    this.barra.stop();
    this.barra.setFrame(0);

    //efeito de piscar por 3 segundos
    this.tweens.add({
      targets: asimov,
      alpha: 0,
      duration: 150,
      yoyo: true,
      repeat: 6, //6 piscadas
      onComplete: () => {
        asimov.alpha = 1;
        this.finalizarJogo = false;
      },
    });
  }

  //função para quando abrir o bau
  abrirBau() {
    const { width, height } = this.sys.game.config; //recebe altura e largura das configs
    this.tweens.add({
      //animação do retangulo preto para escurecer a tela
      targets: this.overlay,
      alpha: 0.8,
      duration: 1000,
      ease: "Power2",
    });

    this.envelope.setVisible(true); //envelope aparece e faz animação de giro
    this.tweens.add({
      targets: this.envelope,
      y: height / 2,
      angle: 360,
      duration: 1000,
      ease: "Back.easeOut",
    });

    this.envelope.on("pointerdown", () => this.clicarEnvelope());
    this.exibirAviso("Baú aberto! Clique no envelope para continuar.");

    // Para música de fases e volta para padrão
    if (this.musicFases) {
      this.musicFases.stop();
    }
    this.scene.launch("bgMusic");
  }

  //função para animação de quando abrie envelope
  clicarEnvelope() {
    this.cliquesEnvelope++;
    const { width, height } = this.sys.game.config;
    const escalaAtual = this.envelope.scale;
    if (this.cliquesEnvelope === 9) {
      //movimenta o envelope para a esquerda
      this.tweens.add({
        targets: this.envelope,
        x: width * 0.2,
        duration: 500,
        ease: "Power2",
      });
      this.mostrarPergaminho();
      return;
    }
    if (this.cliquesEnvelope < 9) {
      //animação de angulo e escala ao clicar no envelope
      this.tweens.add({
        targets: this.envelope,
        angle:
          this.envelope.angle + (this.cliquesEnvelope % 2 === 0 ? 15 : -15),
        scaleX: escalaAtual + 0.1,
        scaleY: escalaAtual + 0.1,
        duration: 200,
        yoyo: true,
        ease: "Sine.easeInOut",
      });
    }
    if (this.cliquesEnvelope > 5 && this.cliquesEnvelope < 9) {
      //mudança de frames no sprite
      this.envelope.setFrame(this.frameEnvelope++);
    }
  }

  //pergaminho aparece após abrir envelopes
  mostrarPergaminho() {
    this.pergaminhoAberto = true;
    this.pergaminho.setVisible(true);
    if (!this.anims.exists("pergaminhoAnim")) {
      this.anims.create({
        key: "pergaminhoAnim",
        frames: this.anims.generateFrameNumbers("pergaminho", {
          start: 0,
          end: 11,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }
    this.pergaminho.play("pergaminhoAnim");

    this.pergaminho.on("animationcomplete", () => {
      this.pergaminhoEsperandoE = true;
      this.exibirAviso("Aperte E para continuar.");
    });
  }

  exibirAviso(frase) {
    this.texto;
    this.textoAviso.setText(frase);
    this.retanguloAviso.setVisible(true);
    this.textoAviso.setVisible(true);

    this.time.delayedCall(7000, () => {
      this.retanguloAviso.setVisible(false);
      this.textoAviso.setVisible(false);
    });
  }
}
