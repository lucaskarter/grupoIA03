import { registrarTeclaMenu } from '../menu.js';
import { SnowEffect } from './efeitoNeve.js';
import { movimentacaoSophia, criarAnimacaoSophia, puloSophia, registrarControles, criarAnimacaoAsimov } from './movimentacao.js';
import caixasDialogo from './caixasDialogo.js';

export class sceneLBFuturo extends Phaser.Scene {
  constructor() {
    super("sceneLBFuturo");
  }

  // Carrega os assets usados na cutscene e no laboratório futuro.
  preload() {
    this.load.image("CFuturo", "assets/fases/sceneLBPassado/labDestruido.png");
    this.load.spritesheet("sophia", "assets/personagens/sophia.png", {frameWidth: 64, frameHeight: 64,});
    this.load.spritesheet("asimov", "assets/personagens/asimov.png", {frameWidth: 32, frameHeight: 32,});

    this.load.video(
      "cutscene2",
      "assets/Cutscene/CutScene2.mp4",
      "loadeddata",
      false,
      true
    );
    this.load.image("armarioD", "assets/objetos/sceneLBPassado/partTwo/armarioDestruido.png");
    this.load.image("alvoD", "assets/objetos/sceneLBPassado/partTwo/alvoDestruido.png");
    this.load.image("mesa1D", "assets/objetos/sceneLBPassado/partTwo/mesa1Destruida.png");
    this.load.image("mesa2D", "assets/objetos/sceneLBPassado/partTwo/mesa2Destruida.png");
    this.load.image("mesa3D", "assets/objetos/sceneLBPassado/partTwo/mesa3Destruida.png");
    this.load.image("piaD", "assets/objetos/sceneLBPassado/partTwo/piaDestruida.png");
    this.load.image("reservasCrioD", "assets/objetos/sceneLBPassado/partTwo/reservasCrioDestruidas.png");
    this.load.image("comptCimaD", "assets/objetos/sceneLBPassado/partTwo/comptCimaDestruido.png");
    this.load.image("comptBaixoD", "assets/objetos/sceneLBPassado/partTwo/comptBaixoDestruido.png");
    this.load.image("criogeniaD", "assets/objetos/sceneLBPassado/partTwo/criogeniaDestruida.png");
    this.load.image("camara", "assets/objetos/sceneLBPassado/partOne/camara.png");
  }

  // Prepara a cena e inicia a cutscene de abertura.
  create() {
    registrarTeclaMenu(this);
    
    // Instanciamos o nosso gerenciador de diálogos aqui!
    this.sistemaDialogo = new caixasDialogo(this);

    // Silencia o bgMusic nesta cena, mas não para permanentemente para não quebrar o retorno.
    const bgMusic = this.sound.get('bgMusic');
    if (bgMusic) {
      bgMusic.setMute(true);
      this.events.once('shutdown', () => {
        // ao sair desta cena, desmute para restaurar música nas próximas cenas.
        bgMusic.setMute(false);
      });
    }

    this.videoDaFase();
  }

  // Exibe o vídeo introdutório antes de liberar a exploração.
  videoDaFase() {
    this.cutscene = this.add.video(950, 550, "cutscene2");
    this.cutscene.setScale(1.05);
    this.cutscene.setDepth(999);
    this.cutscene.setMute(false);
    this.cutscene.play();

    this.cutscene.once("complete", () => {
      // Quando o vídeo terminar, restaura o som de fundo (bgMusic) para tocar novamente.
      const bgMusic = this.sound.get('bgMusic');
      if (bgMusic) {
        bgMusic.setMute(false);
      }

      this.cutscene.destroy();
      this.iniciarFase();
    });
  }

  // Monta o mapa, personagens, colisões e interface de diálogo.
  iniciarFase() {
    this.scaleMapa = 3;
    this.progressoHistoria = 0;
    this.lendoMensagem = false;
    this.animacaoSaidaAtiva = false;

    let gifElemento2 = document.createElement('img');
    gifElemento2.src = 'assets/TextosCenas/Laboratorio2098.gif';

    // Forçando estilos CSS para garantir que ele apareça
    gifElemento2.style.width = '1920px'; // Coloque a largura aproximada do seu GIF
    gifElemento2.style.height = '1080px';
    //gifElement.style.display = 'block';
    //gifElement.style.border = '2px solid red'; // Descomente para debugar: se a borda vermelha aparecer, o HTML está funcionando, mas o caminho do arquivo pode estar errado.

    let domElemento2 = this.add.dom( 1550, 0 , gifElemento2).setOrigin(0.8).setScrollFactor(0);
    const duracaoDoGif = 5000; 
    // O Phaser espera esse tempo passar e executa a função interna
    this.time.delayedCall(duracaoDoGif, () => {
        // Verifica se o elemento ainda existe na cena
        if (domElemento2 && domElemento2.active) {
            // Esconde o GIF para ele não aparecer rodando de novo
            domElemento2.setVisible(false); 
            domElemento2.destroy(); 
        }
    });

    // Adiciona a imagem de fundo principal da cena.
    // MAPA FUTURO
    this.mapa = this.add.image(600, 400, "CFuturo").setScale(this.scaleMapa).setDepth(-1);
    new SnowEffect(this, { count: 150, depth: -2, speed: 0.4, wind: 0.1 });

    // Cria limites invisíveis para a área jogável.
    // paredes
    let larguraParede = this.mapa.displayWidth;
    let alturaParede = 720;
    let centroX = this.mapa.x;
    let centroY = 283;
    let espessura = 30;
    this.paredes = this.physics.add.staticGroup();
    this.objetosColisao = this.physics.add.staticGroup();

    let paredeCima = this.add.rectangle(centroX, centroY - alturaParede / 2 + espessura / 2, larguraParede, espessura, 0xff0000, 0);
    this.physics.add.existing(paredeCima, true);
    this.paredes.add(paredeCima);

    let paredeBaixo = this.add.rectangle(centroX, centroY + alturaParede / 2 - espessura / 2, larguraParede, espessura, 0xff0000, 0);
    this.physics.add.existing(paredeBaixo, true);
    this.paredes.add(paredeBaixo);

    let paredeEsquerda = this.add.rectangle(centroX - larguraParede / 2 + espessura / 2, centroY, espessura, alturaParede, 0xff0000, 0);
    this.physics.add.existing(paredeEsquerda, true);
    this.paredes.add(paredeEsquerda);

    let paredeDireita = this.add.rectangle(centroX + larguraParede / 2 - espessura / 2, centroY, espessura, alturaParede, 0xff0000, 0);
    this.physics.add.existing(paredeDireita, true);
    this.paredes.add(paredeDireita);

    // Posiciona os elementos visuais do cenário.
    // adicionando os objetos
    this.armarioD = this.add.image(220, 10, "armarioD").setScale(3.25);
    this.armarioD2 = this.add.image(980, 10, "armarioD").setScale(3.25);
    this.alvoD = this.add.image(215, 275, "alvoD").setScale(3);
    this.alvoD2 = this.add.image(965, 375, "alvoD").setScale(3.1);
    this.criogeniaD = this.add.image(600, 6, "criogeniaD").setScale(3);
    this.mesa1D = this.add.image(190, 140, "mesa1D").setScale(3);
    this.mesa1Db = this.add.image(993, 518, "mesa1D").setScale(3);
    this.mesa2D = this.add.image(343, 20, "mesa2D").setScale(3);
    this.mesa3D = this.add.image(858, 18, "mesa3D").setScale(3);
    this.piaD = this.add.image(203, 470, "piaD").setScale(3);
    this.reservasCrioD = this.add.image(1023, 165, "reservasCrioD").setScale(3);
    this.comutador1Dprt1 = this.add.image(385, 220, "comptCimaD").setScale(3);
    this.comutador1Dprt2 = this.add.image(385, 260, "comptBaixoD").setScale(3);
    this.comutador2Dprt1 = this.add.image(812, 220, "comptCimaD").setScale(3);
    this.comutador2Dprt2 = this.add.image(812, 260, "comptBaixoD").setScale(3);
    this.comutador3Dprt1 = this.add.image(385, 410, "comptCimaD").setScale(3);
    this.comutador3Dprt2 = this.add.image(385, 450, "comptBaixoD").setScale(3);
    this.comutador4Dprt1 = this.add.image(812, 410, "comptCimaD").setScale(3);
    this.comutador4Dprt2 = this.add.image(812, 450, "comptBaixoD").setScale(3);
    this.camara = this.physics.add.staticImage(600, 20, "camara").setScale(0.25).refreshBody();

    // Ativa colisão nos objetos que devem bloquear passagem.
    // colisoes dos objetos
    this.criarColisao(this.armarioD);
    this.criarColisao(this.armarioD2);
    this.criarColisao(this.mesa1D);
    this.criarColisao(this.mesa1Db);
    this.criarColisao(this.mesa2D);
    this.criarColisao(this.mesa3D);
    this.criarColisao(this.piaD);
    this.criarColisao(this.reservasCrioD);
    this.criarColisao(this.alvoD);
    this.criarColisao(this.alvoD2);
    this.criarColisao(this.criogeniaD);
    this.criarColisao(this.comutador1Dprt2);
    this.criarColisao(this.comutador2Dprt2);
    this.criarColisao(this.comutador3Dprt2);
    this.criarColisao(this.comutador4Dprt2);
    this.criarColisao(this.camara);

    // Ajusta a profundidade dos objetos com base na posição vertical.
    // depth sorting por Y
    [
      this.armarioD, this.armarioD2,
      this.alvoD, this.alvoD2,
      this.criogeniaD,
      this.mesa1D, this.mesa1Db,
      this.mesa2D, this.mesa3D,
      this.piaD, this.reservasCrioD,
      this.comutador1Dprt1, this.comutador1Dprt2,
      this.comutador2Dprt1, this.comutador2Dprt2,
      this.comutador3Dprt1, this.comutador3Dprt2,
      this.comutador4Dprt1, this.comutador4Dprt2,
    ].forEach(obj => {
      obj.setDepth(obj.y);
    });

    // Cria a personagem controlada pelo jogador.
    // PLAYER
    this.sophia = this.physics.add
      .sprite(600, 100, "sophia")
      .setScale(2)
      .setCollideWorldBounds(true);
    this.sophia.body.setAllowGravity(false);
    this.sophia.setSize(30, 25);
    this.sophia.setOffset(15, 30);
    this.physics.add.collider(this.sophia, this.camara);
    this.physics.add.collider(this.sophia, this.paredes);
    this.physics.add.collider(this.sophia, this.objetosColisao);

    // Cria o NPC principal da cena.
    // ASIMOV (NPC)
    this.asimov = this.physics.add
      .sprite(600, 300, "asimov")
      .setScale(3);
    this.asimov.body.setAllowGravity(false);
    this.asimov.setSize(15, 12);
    this.asimov.setOffset(8, 16);
    this.asimov.setImmovable(true);
    this.physics.add.collider(this.sophia, this.asimov);

    // animacoes do Asimov NPC
    criarAnimacaoAsimov(this);

    this.asimov.play("asimov_frente");

    // Inicializa os estados usados durante a interação com o NPC.
    // variaveis de interacao
    this.podeInteragirAsimov = false;
    this.dialogoAsimovJaIniciado = false;

    // Monta o indicador visual de interação com a tecla E.
    // icone da tecla E (asimov)
    this.containerTeclaAsimov = this.add.container(0, 0).setDepth(200);

    let largura = 140;
    let altura = 40;

    let iconeTeclaAsimov = this.add.graphics();
    iconeTeclaAsimov.fillStyle(0xffffff, 1);
    iconeTeclaAsimov.lineStyle(2, 0x000000, 1);
    iconeTeclaAsimov.fillRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);
    iconeTeclaAsimov.strokeRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);

    let letraAsimov = this.add
      .text(0, 0, "Aperte E", {
        fontSize: "20px",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.containerTeclaAsimov.add([iconeTeclaAsimov, letraAsimov]);
    this.containerTeclaAsimov.setVisible(false);

    this.tweens.add({
      targets: this.containerTeclaAsimov,
      y: "+=5",
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // NOTA: O bloco inteiro de criação da "Caixa de Diálogo" foi removido daqui!

    // Ativa animações, controles e câmera principal.
    criarAnimacaoSophia(this);
    registrarControles(this);

    this.cameras.main.startFollow(this.sophia);
    this.cameras.main.fadeIn(1000);
  }

  // Atualiza movimento, interação e estado da cena a cada frame.
  update() {
    if (!this.sophia) return;

    // Enquanto o diálogo está aberto, a Sophia fica parada.
    if (this.lendoMensagem) {
      this.sophia.setVelocity(0, 0);
      this.sophia.anims.stop();
      
      // Permite que o jogador avance as falas tanto clicando quanto apertando 'E'
      if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
        this.sistemaDialogo.interagir();
      }
      return;
    }

    // Durante a saída final, mantém só o depth dos personagens.
    if (this.animacaoSaidaAtiva) {
      this.sophia.setDepth(this.sophia.y);
      this.asimov.setDepth(this.asimov.y);
      return;
    }

    // Aplica movimentação livre da Sophia.
    movimentacaoSophia(this, this.sophia, { left: "sophia_esquerda", right: "sophia_direita", front: "sophia_frente", back: "sophia_tras" });
    puloSophia(this, this.sophia);

    this.sophia.setDepth(this.sophia.y);
    this.asimov.setDepth(this.asimov.y);

    // Mede a distância até o Asimov para decidir se mostra a interação.
    let distanciaAsimov = Phaser.Math.Distance.Between(
      this.sophia.x,
      this.sophia.y,
      this.asimov.x,
      this.asimov.y,
    );

    // Mostra ou esconde o aviso de interação.
    if (!this.dialogoAsimovJaIniciado && distanciaAsimov < 120) {
      this.podeInteragirAsimov = true;
      this.containerTeclaAsimov.setVisible(true);
      this.containerTeclaAsimov.setPosition(this.asimov.x, this.asimov.y - 80);
    } else {
      this.podeInteragirAsimov = false;
      this.containerTeclaAsimov.setVisible(false);
    }

    // Inicia o diálogo quando o jogador confirma a interação (Aperta E perto do Asimov).
    if (this.podeInteragirAsimov && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.dialogoAsimovJaIniciado = true;
      this.containerTeclaAsimov.setVisible(false);
      this.tweens.killTweensOf(this.containerTeclaAsimov);
      
      this.lendoMensagem = true; // Congela a movimentação

      // array com as falas
      const dialogosFase = [
        { nome: "Sophia", personagem: this.sophia, texto: "Olá? Quem é você?" },
        { nome: "Asimov", personagem: this.asimov, texto: "Olá, Sophia. Tenho satisfação em lhe conhecer." },
        { nome: "Asimov", personagem: this.asimov, texto: "Me chamo Asimov, fui criado por Watson e nossa equipe para abrir a câmara e lhe ajudar quando fosse necessário." },
        { nome: "Sophia", personagem: this.sophia, texto: "O que aconteceu com o mundo? Como posso ajudar?" },
        { nome: "Asimov", personagem: this.asimov, texto: "Muitas coisas mudaram nos últimos tempos, estamos em 2098, muitas tecnologias foram criadas e desenvolvidas. \nEntretanto, o que Watson temia, aconteceu." },
        { nome: "Asimov", personagem: this.asimov, texto: "Uma das tecnologias que mais se desenvolveram com a humanidade se chama Inteligência Artificial." },
        { nome: "Asimov", personagem: this.asimov, texto: "A IA se refere à capacidade de uma máquina de aprender a partir de padrões e utilizá-los para prever comportamentos." },
        { nome: "Asimov", personagem: this.asimov, texto: "Porém, ao invés de ser usada apenas como uma ferramenta para auxiliar tarefas, a humanidade se tornou dependente: criando assistentes robôs que realizam tudo, e o conhecimento está apenas nos bancos de dados dessas máquinas." },
        { nome: "Sophia", personagem: this.sophia, texto: "Nossa, eu pensava que haveria problemas mas não que seria assim… Mas com o que precisa da minha ajuda?" },
        { nome: "Asimov", personagem: this.asimov, texto: "Houve um problema geral nos bancos de dados e o conhecimento foi corrompido. Precisamos criar um cristal capaz de restaurar a energia e os arquivos. A humanidade atual tentou, mas não tem o conhecimento necessário." },
        { nome: "Asimov", personagem: this.asimov, texto: "Eu perdi dados necessários, mas posso ajudar você a aprender mais sobre a IA para resolver esse problema." },
        { nome: "Sophia", personagem: this.sophia, texto: "Então, vamos!" },
        { nome: "Asimov", personagem: this.asimov, texto: "Ah, Sophia, antes de tudo, meu sistema de movimentação está com falhas. Sendo uma máquina, tenho uma habilidade chamada Aprendizagem de Máquina." },
        { nome: "Asimov", personagem: this.asimov, texto: "Utilizo algoritmos (instruções sequenciais) para aprender. Para eu te acompanhar, precisarei de ajuda para reaprender alguns movimentos." },
        { nome: "Sophia", personagem: this.sophia, texto: "Claro que posso, mas como farei isso?"},
        { nome: "Asimov", personagem: this.asimov, texto: "Você pode me guiar através de um corredor para que eu possa exercitar diferentes ações."},
        { nome: "Sophia", personagem: this.sophia, texto: "Ok, vamos lá. Não há tempo a perder."}
      ];
      
      // 2. Chama o seu Gerenciador!
      this.sistemaDialogo.iniciarDialogo(dialogosFase, () => {
         // O que acontece quando o diálogo acaba:
         this.lendoMensagem = false;
         this.iniciarAnimacaoFinal();
      });
    }
  }

  // Método antigo que move apenas o Asimov ao fim da cena.
  animacaoFinalAsimov() {
      this.asimov.play("asimov_frente", true);
      this.asimov.setVelocityY(50);

      this.time.delayedCall(5000, () => {
        this.asimov.setVelocity(0);
        this.scene.start("faseUm");
      });
    }

  // Método antigo que move apenas a Sophia ao fim da cena.
  animacaoFinalSophia() {
      this.sophia.play("sophia_frente", true);
      this.sophia.setVelocityY(50);

      this.time.delayedCall(5000, () => {
        this.sophia.setVelocity(0);
        this.scene.start("faseUm");
      });
    }

  // Executa a saída atual com Sophia e Asimov andando juntos.
  iniciarAnimacaoFinal() {
      this.animacaoSaidaAtiva = true;
      this.asimov.play("asimov_frente", true);
      this.sophia.play("sophia_frente", true);
      this.asimov.setVelocity(0, 50);
      this.sophia.setVelocity(0, 50);

      // Após a animação, encerra a cena e abre a próxima fase.
      this.time.delayedCall(5000, () => {
        this.asimov.setVelocity(0, 0);
        this.sophia.setVelocity(0, 0);
        this.scene.start("faseUm");
      });
    }

  // Cria e ajusta a hitbox de colisão de um objeto do cenário.
  criarColisao(objeto, reduzirAltura = 1) {
    this.physics.add.existing(objeto, true);

    let alturaOriginal = objeto.displayHeight;

    objeto.body.setSize(
      objeto.displayWidth,
      alturaOriginal * reduzirAltura,
    );

    objeto.body.setOffset(
      0,
      alturaOriginal * (1 - reduzirAltura),
    );

    this.objetosColisao.add(objeto);
  }
}
