/*Esta cena consiste em um momento de transição entre fases, no qual o jogador sai do minigame de plataformas(fase3), sai da sala das 
portas e vem para o HUB do cristal e agora precisa fabricar o cristal, mas para isso ele precisa treinar uma IA generativa e o 
minigame consiste na limpeza dos ruídos*/

import { registrarTeclaMenu } from '../menu.js';
import { SnowEffect } from './efeitoNeve.js';
import { movimentacaoSophia, criarAnimacaoSophia, puloSophia, registrarControles, criarAnimacaoAsimov } from './movimentacao.js';
import caixasDialogo from './caixasDialogo.js'; // Importação do sistema de diálogos

export class scenePreFase4 extends Phaser.Scene {
  constructor() {
    super("scenePreFase4");
  }

  // -------------------------------- aqui são carregadas as imagens dessa cena do jogo --------------------------------
  preload() {
    this.load.image("labEscuro2", "assets/Fases/sceneLabCristal/labCristalEscuro.png");
    this.load.spritesheet("objetosLab1", "assets/Fases/preFase4/objetosLabCristal1.png", {frameWidth: 320, frameHeight: 213});
    this.load.image("mascaraPrefase4", "assets/Fases/preFase4/mascaraPrefase4.png");
    this.load.spritesheet("sophia", "assets/personagens/sophia.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("asimov", "assets/personagens/asimov.png", { frameWidth: 32, frameHeight: 32 });
    this.load.image("doc1", "assets/Fases/preFase4/doc1.png");
    this.load.image("doc2", "assets/Fases/preFase4/doc2.png");
    this.load.image("doc3", "assets/Fases/preFase4/doc3.png");
  }

    // -------------------------------- aqui são criadas as imagens carregadas, as animações, variáveis de uso --------------------------------
  create() {
    registrarTeclaMenu(this);
    this.scene.launch("bgMusic");
    this.cameras.main.fadeIn(800, 0, 0, 0);

    let gifElemento6 = document.createElement('img');
        gifElemento6.src = 'assets/TextosCenas/hubCristal.gif';
    
        // Forçando estilos CSS para garantir que ele apareça
        gifElemento6.style.width = '1920px'; // Coloque a largura aproximada do seu GIF
        gifElemento6.style.height = '1080px';
        //gifElement.style.display = 'block';
        //gifElement.style.border = '2px solid red'; // Descomente para debugar: se a borda vermelha aparecer, o HTML está funcionando, mas o caminho do arquivo pode estar errado.
    
        let domElemento6 = this.add.dom( 1550, 0 , gifElemento6).setOrigin(0.8).setScrollFactor(0);
        const duracaoDoGif = 5000; 
        // O Phaser espera esse tempo passar e executa a função interna
        this.time.delayedCall(duracaoDoGif, () => {
            // Verifica se o elemento ainda existe na cena
            if (domElemento6 && domElemento6.active) {
                // Esconde o GIF para ele não aparecer rodando de novo
                domElemento6.setVisible(false); 
                domElemento6.destroy(); 
            }
        });

    const centroX = this.cameras.main.centerX;
    const centroY = this.cameras.main.centerY;
    const zoom = 1.8;

    this.lendoMensagem = false;
    this.scaleMapa = 2.8; //define a escala de zoom do mapa, essa variável é importante, porque é usada para aplicar o mesmo valor, nos objetos, no fundo, entre outros

    this.mapa = this.add.image(centroX, centroY, "labEscuro2").setScale(this.scaleMapa);
    this.efeitoNeve = new SnowEffect(this, { count: 150, depth: -2, speed: 0.4, wind: 0.1 });

    // Objeto do lab — fica parado no frame 0 ate a interacao com o Asimov
    this.objetosLab1 = this.add.sprite(centroX, centroY, "objetosLab1", 0).setScale(this.scaleMapa).setDepth(1);

    //os objetos da cena toda recebem a animação para que dê a impressão de que o papel está se movendo na máquina, mas não é aparente que tudo está mudando
    this.anims.create({
      key: "objetosLab1_anim",
      frames: this.anims.generateFrameNumbers("objetosLab1", { start: 0, end: 18 }),
      frameRate: 12,
      repeat: 3
    });

    //------------------------------- SISTEMA DE COLISÃO POR MEIO DE MÁSCARA INVISIVEL NO CANVAS ------------------------------
    // Adiciona a imagem de colisão na cena do Phaser, mas a deixa totalmente transparente 
    //this.add.image(centroX, centroY, "mascaraPrefase4").setScale(this.scaleMapa).setDepth(0).setAlpha(0);
    try {
      //Extrai o HTML puro da imagem de dentro do gerenciador do Phaser
      this.collisionImage = this.textures.get("mascaraPrefase4").getSourceImage();
      //cria um quadro em branco invisivel chamado Canvas
      this.collisionCanvas = document.createElement("canvas");
      this.collisionCanvas.width = this.collisionImage.width;
      this.collisionCanvas.height = this.collisionImage.height;
      this.collisionCtx = this.collisionCanvas.getContext("2d");
      //Desenha a imagem de colisão dentro desse canvas invisível
      this.collisionCtx.drawImage(this.collisionImage, 0, 0);
    } catch (e) {
      console.warn("Colisão: rode em servidor local para funcionar corretamente.", e); //não é usado nesse código, mas por prevenção é bom colocar
    }
    //-------------------------------------------------------------------------------------------------------------

    // ---------------SOPHIA (jogável)---------------
    this.Principal = this.physics.add.sprite(centroX, centroY, "sophia").setScale(2).setCollideWorldBounds(true);
    this.Principal.body.setAllowGravity(false);
    this.Principal.setSize(30, 20);
    this.Principal.setOffset(17, 100);
    this.cameras.main.startFollow(this.Principal).setZoom(zoom);
    //this.Principal.setOffset(15, 30);
    // Animações Sophia
    criarAnimacaoSophia(this);
    //----------------------------------------------

    // ------------------ASIMOV (NPC)------------------
    this.asimov = this.physics.add.sprite(1200, 380, "asimov").setScale(2);
    this.asimov.body.setAllowGravity(false);
    this.asimov.body.setSize(16, 6);
    //this.asimov.setOffset(8, 15);
    this.asimov.setImmovable(true);
    this.physics.add.collider(this.Principal, this.asimov);
    // Animações Asimov
    criarAnimacaoAsimov(this);
    this.asimov.play("asimov_front");
    //------------------------------------------------

    // -------------- Ícone tecla E (Asimov) --------------
    this.podeInteragirAsimov = false;
    this.containerTeclaAsimov = this.add.container(0, 0).setDepth(200);
    let largura = 140, altura = 40;
    let icone = this.add.graphics();
    icone.fillStyle(0xffffff, 1).lineStyle(2, 0x000000, 1);
    icone.fillRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);
    icone.strokeRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);
    let letraE = this.add.text(0, 0, "Aperte E", { fontSize: "20px", color: "#000000", fontStyle: "bold" }).setOrigin(0.5);
    this.containerTeclaAsimov.add([icone, letraE]);
    this.containerTeclaAsimov.setVisible(false);
    this.tweens.add({ targets: this.containerTeclaAsimov, y: "+=5", duration: 800, yoyo: true, repeat: -1 });
    //-----------------------------------------------------
    
    this.sistemaDialogo = new caixasDialogo(this);
    registrarControles(this);

    // ------------------- CONFIGURAÇÃO DA CÂMERA DE UI (SEM ZOOM) -------------------
    this.uiCamera = this.cameras.add(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // O que a câmera de Interface DEVE IGNORAR (Cenário e personagens)
    let ignoreNaUI = [this.mapa, this.objetosLab1, this.Principal, this.asimov, this.containerTeclaAsimov];
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
  
  // ----------------aqui é atualizado a todo o momento a física, o sistema de colisão, a interação, o movimento do personagem --------------------------------
  update() {
    if (!this.Principal) return;

    //IF para quando o jogador estiver lendo uma caixa de diálogo
    if (this.lendoMensagem) {
      this.Principal.setVelocity(0, 0);
      this.Principal.anims.stop();
      if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
          this.sistemaDialogo.interagir();
      }
      return;
    }

    //IF para quando o jogador estiver lendo o documento
    if (this.aguardandoLeitura && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.notificacaoLeitura.destroy();
      this.aguardandoLeitura = false;
      this.exibirCutscenes();
      return;
    }

    //quando estiver lendo o documento sobre IA generativa, este IF vai se encaminhar de resolver seu desencadeamento 
    if (this.emCutscene) {
      if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
        this.cutsceneIndex++;
        if (this.cutsceneIndex < this.sequenciaCutscene.length) {
          this.imgCutscene.setTexture(this.sequenciaCutscene[this.cutsceneIndex]);
        } else {
          this.imgCutscene.destroy();
          if (this.filtroEscuro) this.filtroEscuro.destroy();
          this.emCutscene = false;
          this.transicaoParaFase4();
        }
      }
      return;
    }

    const colisaoFn = (x, y) => {
      if (this.colidiuComVerde(x, y + 40)) return true;
      const dist = Phaser.Math.Distance.Between(x, y, this.asimov.x, this.asimov.y);
      return dist < 40;
    };

    movimentacaoSophia(this, this.Principal,{ left: "sophia_esquerda", right: "sophia_direita", front: "sophia_frente", back: "sophia_tras" }, colisaoFn);
    puloSophia(this, this.Principal, colisaoFn);

    this.Principal.setDepth(this.Principal.y); //define qual é a camada da Sophia igual a sua posição y. Ficando acima de objetos caso seu Y seja maior
    this.asimov.setDepth(this.asimov.y); //define qual é a camada do asimov igual a sua posição y. Ficando acima de objetos caso seu Y seja maior

    //----------------- Definição de quando a Sophia pode interagir com Asimov de acordo a sua distância --------------

    let distAsimov = Phaser.Math.Distance.Between(this.Principal.x, this.Principal.y, this.asimov.x, this.asimov.y);
    // Verifica se a Sophia ainda NÃO interagiu com o Asimov E se ela está a menos de 120px
    if (!this.interagiu && distAsimov < 120) {
      this.podeInteragirAsimov = true; //torna o balão de interação visivel
      this.containerTeclaAsimov.setVisible(true).setPosition(this.asimov.x, this.asimov.y - 80);
    } else {
      this.podeInteragirAsimov = false;
      this.containerTeclaAsimov.setVisible(false);
    }

    //quando o jogador está perto do Asimov e aperto a tecla E - DEFINIÇÃO DE ESTADO DAS VARIÁVEIS
    if (this.podeInteragirAsimov && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.containerTeclaAsimov.setVisible(false);
      this.tweens.killTweensOf(this.containerTeclaAsimov); //remove o balão de interação
      this.podeInteragirAsimov = false;
      this.interagiu = true;
      this.lendoMensagem = true; // Trava a Sophia
      
      const dialogos = [
        { nome: "Asimov", personagem: this.asimov, texto: "Sophia, preciso iniciar a fabricação do cristal. Mas há um erro crítico." },
        { nome: "Sophia", personagem: this.Principal, texto: "O que houve, Asimov?" },
        { nome: "Asimov", personagem: this.asimov, texto: "Você precisa limpar os dados ruidosos do meu sistema antes." },
        { nome: "Sophia", personagem: this.Principal, texto: "Por que isso afeta o cristal?" },
        { nome: "Asimov", personagem: this.asimov, texto: "Leia os documentos sobre IA Generativa naquela bancada. Você vai entender." },
      ];

      this.sistemaDialogo.iniciarDialogo(dialogos, () => {
         this.lendoMensagem = false;

         //Quando acabam as falas, encerra a conversa e toca a animação dos objetos no laboratório
         this.objetosLab1.play("objetosLab1_anim");

         //Prepara a próxima interação: Assim que a animação da bancada termina, mostra o aviso na tela para o jogador
         this.objetosLab1.once("animationcomplete", () => {
           const larguraJogo = this.cameras.main.width;
           const alturaJogo = this.cameras.main.height;
           
           this.notificacaoLeitura = this.add.text(
             larguraJogo / 2, alturaJogo - 250,
             "Aperte E para acessar os documentos",
             { fontSize: "16px", fontFamily: "'Courier New', Courier, monospace", color: "#ffffff",
               backgroundColor: "#000000", padding: { left: 10, right: 10, top: 6, bottom: 6 } }
           ).setScrollFactor(0).setDepth(9999).setOrigin(0.5, 1);
           
           this.tweens.add({ targets: this.notificacaoLeitura, alpha: 0, duration: 600, yoyo: true, repeat: -1 });
           
           // A câmera principal deve ignorar a notificação para que o texto não sofra zoom
           this.cameras.main.ignore(this.notificacaoLeitura);
           
           this.aguardandoLeitura = true;
         });
      });
    }
  }
  //------------------------------------^^-------------------------------^^----------------------------------------------

  //------------------------ Função para exibição dos documentos do jogador ----------------------
  exibirCutscenes() {
    this.Principal.setVelocity(0, 0);
    this.Principal.anims.stop();
    const sequencia = ["doc3", "doc1", "doc2"];
    this.cutsceneIndex = 0;
    this.emCutscene = true;

    const larguraJogo = this.cameras.main.width;
    const alturaJogo = this.cameras.main.height;
    const posX = larguraJogo / 2;
    const posY = alturaJogo / 2 +20;
    const escala = 0.6;

    this.filtroEscuro = this.add.rectangle(posX, posY, larguraJogo, alturaJogo, 0x000000, 0.6).setDepth(495).setScrollFactor(0);

    this.imgCutscene = this.add.image(posX, posY, sequencia[0]).setScrollFactor(0).setDepth(2000).setScale(escala);
    this.sequenciaCutscene = sequencia;

    // A câmera principal deve ignorar os documentos da cutscene para exibição nítida
    this.cameras.main.ignore([this.filtroEscuro, this.imgCutscene]);
  }
  //---------------^^--------------------------------^^-------------------------^^------------------------

  // ------------------- função para transição entre cenas -------------------
  transicaoParaFase4() {
    this.Principal.setVelocity(0);
    this.Principal.anims.stop();
    this.cameras.main.stopFollow();

    // Para de seguir a Sophia e move a câmera lentamente até a cabeça do Asimov com zoom
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: this.asimov.x - this.cameras.main.width / 2,
      scrollY: this.asimov.y - this.cameras.main.height / 2,
      zoom: 20,
      duration: 5000,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.cameras.main.fadeOut(800);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("faseQuatro");
        });
      }
    });
  }
  // -------------------------------------------------------------------------

  //-------------------------- Função de colisão com a mascara verde invisivel ----------------------------
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
}
//---------------------------------------------------------------------------------------------------------
