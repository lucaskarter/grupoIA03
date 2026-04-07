import { registrarTeclaMenu } from '../menu.js';
import { SnowEffect } from './efeitoNeve.js';
import { movimentacaoSophia, criarAnimacaoSophia, criarAnimacaoAsimov, puloSophia, registrarControles } from './movimentacao.js';
import caixasDialogo from './caixasDialogo.js'; // Importação do componente de diálogo

export class sceneRestauracao extends Phaser.Scene {
  constructor() {
    super("sceneRestauracao");
  }

  preload() {
    this.load.video("cutscene2", "assets/Cutscene/CutScene2.mp4");
    this.load.image("cenarioNoite", "assets/fases/sceneLabCristal/labCristalEscuro.png");
    this.load.image("objetosLabEsc", "assets/objetos/sceneLabCristal/objetosLabCristal1.png");
    this.load.image("cenarioClaro", "assets/fases/sceneLabCristal/labCristalClaro.png");
    this.load.image("objLabClaro", "assets/objetos/sceneLabCristal/objetosLabCristal2.png");
    this.load.image("colisao", "assets/Fases/preFase4/mascaraPrefase4.png");
    this.load.spritesheet("sophia", "assets/personagens/sophia.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("asimov", "assets/personagens/asimov.png", { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    registrarTeclaMenu(this);
    this.scene.launch("bgMusic");
    this.cameras.main.fadeIn(800, 0, 0, 0);

    let gifElemento7 = document.createElement('img');
        gifElemento7.src = 'assets/TextosCenas/retornoHUB.gif';
    
        // Forçando estilos CSS para garantir que ele apareça
        gifElemento7.style.width = '1920px'; // Coloque a largura aproximada do seu GIF
        gifElemento7.style.height = '1080px';
        //gifElement.style.display = 'block';
        //gifElement.style.border = '2px solid red'; // Descomente para debugar: se a borda vermelha aparecer, o HTML está funcionando, mas o caminho do arquivo pode estar errado.
    
        let domElemento7 = this.add.dom( 1550, 0 , gifElemento7).setOrigin(0.8).setScrollFactor(0);
        const duracaoDoGif = 5000; 
        // O Phaser espera esse tempo passar e executa a função interna
        this.time.delayedCall(duracaoDoGif, () => {
            // Verifica se o elemento ainda existe na cena
            if (domElemento7 && domElemento7.active) {
                // Esconde o GIF para ele não aparecer rodando de novo
                domElemento7.setVisible(false); 
                domElemento7.destroy(); 
            }
        });

    // Instancia o sistema de diálogos
    this.sistemaDialogo = new caixasDialogo(this);

    this.lendoMensagem = false;
    this.podeInteragir = false;
    this.interagiu = false;
    this.temCristal = false;
    this.mapaRestaurado = false;
    this.scaleMapa = 2.8;

    const larguraJogo = this.cameras.main.width;
    const alturaJogo = this.cameras.main.height;
    const centroX = this.cameras.main.centerX;
    const centroY = this.cameras.main.centerY;
    const zoom = 1.8;
    //const larguraVista = larguraJogo / zoom;
    //const alturaVista = alturaJogo / zoom;

    this.pontoRestauracaoX = centroX;
    this.pontoRestauracaoY = centroY;

    this.background = this.add.image(centroX, centroY, "cenarioNoite").setScale(this.scaleMapa);
    this.objetos = this.add.image(centroX, centroY, "objetosLabEsc").setScale(this.scaleMapa);
    this.efeitoNeve = new SnowEffect(this, { count: 150, depth: -2, speed: 0.4, wind: 0.1 });

    // DEBUG: visualização do mapa de colisão — remova quando terminar os ajustes
    //this.debugColisao = this.add.image(centroX, centroY, "colisao").setScale(this.scaleMapa).setAlpha(0.5).setDepth(9999);

    try {
      this.collisionImage = this.textures.get("colisao").getSourceImage();
      this.collisionCanvas = document.createElement("canvas");
      this.collisionCanvas.width = this.collisionImage.width;
      this.collisionCanvas.height = this.collisionImage.height;
      this.collisionCtx = this.collisionCanvas.getContext("2d");
      this.collisionCtx.drawImage(this.collisionImage, 0, 0);
    } catch (e) {
      console.warn("Colisão: rode em servidor local para funcionar corretamente.", e);
    }

    const surgirX = this.background.x - 100;
    const surgirY = this.background.y + 50;

    this.Principal = this.physics.add.sprite(surgirX, surgirY, "sophia").setScale(2);
    this.Principal.body.setAllowGravity(false);
    this.cameras.main.startFollow(this.Principal).setZoom(zoom);

    // Asimov fixo
    this.asimov = this.physics.add.sprite(1200, 380, "asimov").setScale(2);
    this.asimov.body.setAllowGravity(false);
    this.asimov.body.setImmovable(true);
    this.asimov.body.setSize(16, 6);
    this.asimov.setOffset(8, 15);
    this.physics.add.collider(this.Principal, this.asimov);
    if (!this.anims.exists("asimov_front")) {
      this.anims.create({ key: "asimov_front", frames: this.anims.generateFrameNumbers("asimov", { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
    }
    this.asimov.play("asimov_front");

    // Ícone tecla E
    this.containerTecla = this.add.container(0, 0).setDepth(200);
    let largura = 140, altura = 40;
    let icone = this.add.graphics();
    icone.fillStyle(0xffffff, 1).lineStyle(2, 0x000000, 1);
    icone.fillRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);
    icone.strokeRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);
    let letraE = this.add.text(0, 0, "Aperte E", { fontSize: "20px", color: "#000000", fontStyle: "bold" }).setOrigin(0.5);
    this.containerTecla.add([icone, letraE]);
    this.containerTecla.setVisible(false);
    this.tweens.add({ targets: this.containerTecla, y: "+=5", duration: 800, yoyo: true, repeat: -1 });

    registrarControles(this);

    criarAnimacaoSophia(this);
    criarAnimacaoAsimov(this);

    // ------------------- CONFIGURAÇÃO DA CÂMERA DE UI (SEM ZOOM) -------------------
    this.uiCamera = this.cameras.add(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // O que a câmera de Interface (UI) DEVE IGNORAR (Cenário e personagens)
    let ignoreNaUI = [this.background, this.objetos, this.Principal, this.asimov, this.containerTecla];
    if (this.efeitoNeve && this.efeitoNeve.graphics) ignoreNaUI.push(this.efeitoNeve.graphics);
    this.uiCamera.ignore(ignoreNaUI);

    // O que a câmera Principal (com Zoom) DEVE IGNORAR (Textos e caixas)
    this.cameras.main.ignore([
        this.sistemaDialogo.caixaDialogo, 
        this.sistemaDialogo.textoDialogo, 
        this.sistemaDialogo.labelNome,
        this.sistemaDialogo.indicadorTeclaE.container
    ]);
  }

  colidiuComVerde(xMundo, yMundo) {
    if (!this.collisionCtx) return false;

    let origemX = this.cameras.main.centerX - (this.collisionImage.width * this.scaleMapa) / 2;
    let origemY = this.cameras.main.centerY - (this.collisionImage.height * this.scaleMapa) / 2;

    let xLocal = (xMundo - origemX) / this.scaleMapa;
    let yLocal = (yMundo - origemY) / this.scaleMapa;

    if (xLocal < 0 || yLocal < 0 || xLocal >= this.collisionImage.width || yLocal >= this.collisionImage.height)
      return false;

    let pixel = this.collisionCtx.getImageData(Math.floor(xLocal), Math.floor(yLocal), 1, 1).data;
    return pixel[3] > 0 && pixel[1] > 180 && pixel[0] > 80 && pixel[0] < 180 && pixel[2] < 120;
  }

  update() {
    if (this.lendoMensagem) {
      this.Principal.setVelocity(0, 0);
      this.Principal.anims.stop();
      if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
          this.sistemaDialogo.interagir();
      }
      return;
    }

    const colisaoFn = (x, y) => {
      if (this.colidiuComVerde(x, y + 40)) return true;
      const dist = Phaser.Math.Distance.Between(x, y, this.asimov.x, this.asimov.y);
      return dist < 20;
    };

    movimentacaoSophia(this, this.Principal, { left: "sophia_esquerda", right: "sophia_direita", front: "sophia_frente", back: "sophia_tras" }, colisaoFn);
    puloSophia(this, this.Principal, colisaoFn);

    this.Principal.setDepth(this.Principal.y);
    this.asimov.setDepth(this.asimov.y);

    let distAsimov = Phaser.Math.Distance.Between(this.Principal.x, this.Principal.y, this.asimov.x, this.asimov.y);
    let distCentro = Phaser.Math.Distance.Between(this.Principal.x, this.Principal.y, this.pontoRestauracaoX, this.pontoRestauracaoY);

    if (!this.interagiu && distAsimov < 120) {
      this.podeInteragir = true;
      this.containerTecla.setVisible(true).setPosition(this.asimov.x, this.asimov.y - 80);
    } else if (this.temCristal && !this.mapaRestaurado && distCentro < 150) {
      this.podeInteragir = "centro";
      this.containerTecla.setVisible(true).setPosition(this.pontoRestauracaoX, this.pontoRestauracaoY - 40);
    } else {
      this.podeInteragir = false;
      this.containerTecla.setVisible(false);
    }

    if (this.podeInteragir && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      if (!this.interagiu) {
        this.interagiu = true;
        this.temCristal = true;
        this.containerTecla.setVisible(false);
        this.lendoMensagem = true; // Trava a Sophia

        const falasRestauracao = [
            { nome: "Asimov", personagem: this.asimov, texto: "Voce acaba de coletar o cristal capaz de restaurar a energia do laboratorio. Va ate o centro do mapa e deposite ele." }
        ];

        this.sistemaDialogo.iniciarDialogo(falasRestauracao, () => {
            this.lendoMensagem = false; // Libera a Sophia após o texto acabar
        });
      } else if (this.podeInteragir === "centro") {
        this.restaurarMundo();
      }
    }
  }

  restaurarMundo() {
    this.mapaRestaurado = true;
    this.cameras.main.flash(1000, 255, 255, 255);

    this.background.setTexture("cenarioClaro").setScale(1.85);
    this.objetos.setTexture("objLabClaro").setScale(this.scaleMapa);

    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("faseCinco");
      });
    });
  }
}
