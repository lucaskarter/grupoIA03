import { registrarTeclaMenu } from '../menu.js';
import { SnowEffect } from './efeitoNeve.js';
import caixasDialogo from './caixasDialogo.js';
import { registrarControles, movimentacaoSophia, puloSophia, criarAnimacaoSophia } from '../scenes/movimentacao.js';

export class sceneLBPassado extends Phaser.Scene {
  constructor() {
    super("sceneLBPassado");
  } 

  //aqui são carregados as imagens e sprites de dentro da cena
  preload() {
    this.load.image("labB", "assets/fases/sceneLBPassado/labBranco.png");
    this.load.image("camara", "assets/objetos/sceneLBPassado/partOne/camara.png");
    this.load.spritesheet("sophia", "assets/personagens/sophia.png", { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet("watson", "assets/personagens/watson.png", { frameWidth: 64, frameHeight: 64 });
    this.load.image("armario", "assets/objetos/sceneLBPassado/partOne/armario.png");
    this.load.image("alvo", "assets/objetos/sceneLBPassado/partOne/alvo.png");
    this.load.image("criogenia", "assets/objetos/sceneLBPassado/partOne/criogenia.png");
    this.load.image("mesa1", "assets/objetos/sceneLBPassado/partOne/mesa1.png");
    this.load.image("mesa2", "assets/objetos/sceneLBPassado/partOne/mesa2.png");
    this.load.image("mesa3", "assets/objetos/sceneLBPassado/partOne/mesa3.png");
    this.load.image("pia1", "assets/objetos/sceneLBPassado/partOne/pia1.png");
    this.load.image("reservasCrio", "assets/objetos/sceneLBPassado/partOne/reservasCrio.png");
    this.load.image("comptBaixo", "assets/objetos/sceneLBPassado/partOne/comptBaixo.png");
    this.load.image("comptCima", "assets/objetos/sceneLBPassado/partOne/comptCima.png");
    this.load.spritesheet("npc1", "assets/Personagens/npc1.png", { frameWidth: 30, frameHeight: 50 });
    this.load.spritesheet("npc2", "assets/Personagens/npc2.png", { frameWidth: 25, frameHeight: 48 });
    this.load.spritesheet("npc3", "assets/Personagens/npc3.png", { frameWidth: 29, frameHeight: 49 });
    this.load.image("npc4", "assets/Personagens/npc4.png");
    this.load.image("npc4", "assets/Personagens/npc4.png");

  }

  //neste método do Phaser, organizamos a criação de cada objeto que ja foi carregado e como eles irão se comportar na cena
  create() {
    this.sistemaDialogo = new caixasDialogo(this);
    let gifElemento = document.createElement('img');
    gifElemento.src = 'assets/TextosCenas/Laboratorio202.gif';

    // Forçando estilos CSS para garantir que ele apareça
    gifElemento.style.width = '1920px'; // Coloque a largura aproximada do seu GIF
    gifElemento.style.height = '1080px';
    //gifElement.style.display = 'block';
    //gifElement.style.border = '2px solid red'; // Descomente para debugar: se a borda vermelha aparecer, o HTML está funcionando, mas o caminho do arquivo pode estar errado.

    let domElemento = this.add.dom( 1550, 0 , gifElemento).setOrigin(0.8).setScrollFactor(0);
    const duracaoDoGif = 5000; 
    // O Phaser espera esse tempo passar e executa a função interna
    this.time.delayedCall(duracaoDoGif, () => {
        // Verifica se o elemento ainda existe na cena
        if (domElemento && domElemento.active) {
            // Esconde o GIF para ele não aparecer rodando de novo
            domElemento.setVisible(false); 
            domElemento.destroy(); 
        }
    });
    
    // Registrando a tecla E para interação geral da cena
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    
    console.log("Cena criada");
    //Aqui, registramos o menu na fase
    registrarTeclaMenu(this);

    //Aqui, fazemos a música tocar na cena
    this.scene.launch("bgMusic");

    //Aqui, chamamos todos os métodos que criam a cena do mapa
    this.estadosDaCena();
    this.createMapa();
    this.paredesDeColisao();
    this.createObjetos();
    this.createPlayer();
    this.createNPCs();
    this.createWatson();
    this.createHUD();

    //Aqui, registramos os controles e as animações
    registrarControles(this);
    criarAnimacaoSophia(this);

    //Aqui, configuramos a câmera, para seguir o personagem
    this.cameras.main.startFollow(this.Principal);
    this.cameras.main.setZoom(1.2);

    this.exibirAviso("Pressione a tecla M para acessar o menu.");
    
    // Configura a câmera de UI para corrigir o problema de zoom no texto
    this.configurarCameraUI();

    let gifElement = document.createElement('img');
    gifElement.src = 'assets/TextosCenas/textoLaboratorio2022.gif';
    // Adiciona esse elemento ao Phaser na posição x: 400, y: 300
    let domElement = this.add.dom(400, 300, gifElement);
    // Opcional: ajustar a origem e outras propriedades visuais
    domElement.setOrigin(0.5);
    domElement.setScrollFactor(0);
  }

  //Aqui, iniciamos e organizamos os estados de cena, importante para o controle lógico da cena
  estadosDaCena() {
    this.entrarNaCamara = false;
    this.lendoMensagem = false;
    this.podeInteragir = false;
    this.podeInteragirWatson = false;
    this.scaleMapa = 3;
  }

  //Aqui, criamos o mapa e o efeito de neve que fica atrás do fundo
  createMapa() {
    this.mapa = this.add.image(600, 400, "labB").setScale(this.scaleMapa).setDepth(-1);
    this.snow = new SnowEffect(this, { count: 150, depth: -2, speed: 0.4, wind: 0.1 });
  }

  //Aqui, criamos o grupo de colisão para as paredes
  paredesDeColisao() {
    this.paredes = this.physics.add.staticGroup();
    
    const larguraParede = this.mapa.displayWidth;
    const alturaParede = 720;
    const centroX = this.mapa.x;
    const centroY = 283;
    const espessura = 30;

    const criarParede = (x, y, w, h) => {
      let p = this.add.rectangle(x, y, w, h, 0xff0000, 0);
      this.physics.add.existing(p, true);
      this.paredes.add(p);
    };

    //Aqui, criamos as 4 paredes que delimitam o mapa
    criarParede(centroX, centroY - alturaParede / 2 + espessura / 2, larguraParede, espessura);
    criarParede(centroX, centroY + alturaParede / 2 - espessura / 2, larguraParede, espessura);
    criarParede(centroX - larguraParede / 2 + espessura / 2, centroY, espessura, alturaParede);
    criarParede(centroX + larguraParede / 2 - espessura / 2, centroY, espessura, alturaParede);
  }

  //Aqui, adicionamos cada objeto do cenário em seu devido lugar
  createObjetos() {
    this.objetosColisao = this.physics.add.staticGroup();
    // objetos — depth definido após criarColisao
    this.armario = this.add.image(220, 10, "armario").setScale(3.25);
    this.armario2 = this.add.image(980, 10, "armario").setScale(3.25);
    this.alvo = this.add.image(215, 275, "alvo").setScale(3);
    this.alvo2 = this.add.image(965, 375, "alvo").setScale(3.1);
    this.criogenia = this.add.image(600, 6, "criogenia").setScale(3);
    this.mesa1 = this.add.image(190, 140, "mesa1").setScale(3);
    this.mesa1b = this.add.image(993, 518, "mesa1").setScale(3);
    this.mesa2 = this.add.image(343, 20, "mesa2").setScale(3);
    this.mesa3 = this.add.image(858, 18, "mesa3").setScale(3);
    this.pia1 = this.add.image(203, 470, "pia1").setScale(3);
    this.reservasCrio = this.add.image(1023, 165, "reservasCrio").setScale(3);
    this.comutador1prt1 = this.add.image(385, 220, "comptCima").setScale(3);
    this.comutador1prt2 = this.add.image(385, 260, "comptBaixo").setScale(3);
    this.comutador2prt1 = this.add.image(812, 220, "comptCima").setScale(3);
    this.comutador2prt2 = this.add.image(812, 260, "comptBaixo").setScale(3);
    this.comutador3prt1 = this.add.image(385, 410, "comptCima").setScale(3);
    this.comutador3prt2 = this.add.image(385, 450, "comptBaixo").setScale(3);
    this.comutador4prt1 = this.add.image(812, 410, "comptCima").setScale(3);
    this.comutador4prt2 = this.add.image(812, 450, "comptBaixo").setScale(3);
    this.camara = this.physics.add.staticImage(600, 20, "camara").setScale(0.25).refreshBody();
    
    //Aqui, usamos a posição Y para definir quem fica na frente ou atrás, para todos os objetos da cena.”
    [
      this.armario, this.armario2,
      this.alvo, this.alvo2,
      this.criogenia,
      this.mesa1, this.mesa1b,
      this.mesa2, this.mesa3,
      this.pia1, this.reservasCrio,
      this.comutador1prt1, this.comutador1prt2,
      this.comutador2prt1, this.comutador2prt2,
      this.comutador3prt1, this.comutador3prt2,
      this.comutador4prt1, this.comutador4prt2,
    ].forEach(obj => {
      this.criarColisao(obj);
      obj.setDepth(obj.y);
    });
  }

// Aqui, iniciamos todas as funções, que estão separadas para melhor organização 

  //Aqui, criamos a personagem principal na fase
  createPlayer() {
    this.Principal = this.physics.add.sprite(400, 300, "sophia").setScale(2).setCollideWorldBounds(true);
    this.Principal.body.setAllowGravity(false);
    this.Principal.setSize(30, 25);
    this.Principal.setOffset(15, 30);
    //Aqui, criamos a colisão dos itens com o personagem principal
    this.physics.add.collider(this.Principal, this.camara);
    this.physics.add.collider(this.Principal, this.paredes);
    this.physics.add.collider(this.Principal, this.objetosColisao);
  }

  // Aqui, criamos os NPCs decorativos
  createNPC(x, y, sprite, animKey = null) {
  let npc;

  if (animKey) {
    npc = this.physics.add.sprite(x, y, sprite);
    npc.play(animKey);
  } else {
    npc = this.physics.add.image(x, y, sprite);
  }

  npc.setScale(2);
  npc.body.setAllowGravity(false);
  npc.setImmovable(true);

  this.physics.add.collider(this.Principal, npc);

  return npc;
}

  //Aqui, fazemos uma função criadora para gerar NPC's com animação, física e colisão
  createNPCs() {
    this.anims.create({ key: "npc1_idle", frames: this.anims.generateFrameNumbers("npc1", { start: 0, end: 8 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: "npc2_idle", frames: this.anims.generateFrameNumbers("npc2", { start: 0, end: 16 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: "npc3_idle", frames: this.anims.generateFrameNumbers("npc3", { start: 0, end: 20 }), frameRate: 6, repeat: -1 });
    
    this.npc1 = this.createNPC(290, 330, "npc1", "npc1_idle");
    this.npc2 = this.createNPC(350, 50, "npc2", "npc2_idle");
    this.npc3 = this.createNPC(820, 270, "npc3", "npc3_idle");
    this.npc4 = this.createNPC(800, 455, "npc4");
  }

  //Aqui, criamos as configurações de Watson, o NPC principal
  createWatson() {
  this.watson = this.physics.add.sprite(830, 80, "watson")
    .setScale(2.3)
    .setImmovable(true);
  this.watson.body.setAllowGravity(false);
  this.watson.setSize(30, 25);
  this.watson.setOffset(15, 30);
  this.physics.add.collider(this.Principal, this.watson);
  //Aqui, criamos a animação do Watson
  this.watson.play("watson_front");
}

  //Aqui, criamos o HUD da tecla E para a câmara
  createHUD(){
    //Aqui, criamos o contâiner da tecla E
    this.containerTecla = this.add.container(0, 0).setDepth(500);
    let largura = 140;
    let altura = 40;
    //Aqui, criamos as características do ícone da tecla E
    let iconeTecla = this.add.graphics();
    iconeTecla.fillStyle(0xffffff, 1);
    iconeTecla.lineStyle(2, 0x000000, 1);
    //Aqui, deixamos o retângulo arredondado e centralizamos o texto 
    iconeTecla.fillRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);
    iconeTecla.strokeRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);
    //Aqui, criamos o texto
    let letra = this.add.text(0, 0, "Aperte E", { fontSize: "20px", color: "#000000", fontStyle: "bold" }).setOrigin(0.5);
    //Aqui, adicionamos tudo que fizemos no contêiner
    this.containerTecla.add([iconeTecla, letra]);
    //Aqui, fazemos o contêiner só aparecer quando o jogador poder interagir
    this.containerTecla.setVisible(false);
    //Aqui, fazemos o contêiner flutuar
    this.tweens.add({ targets: this.containerTecla, y: "+=5", duration: 800, yoyo: true, repeat: -1 });

    //Aqui, fazemos a mesma coisa do HUD da câmara, mas para o Watson
    this.containerTeclaWatson = this.add.container(0, 0).setDepth(500);
    let iconeTeclaWatson = this.add.graphics();
    iconeTeclaWatson.fillStyle(0xffffff, 1);
    iconeTeclaWatson.lineStyle(2, 0x000000, 1);
    iconeTeclaWatson.fillRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);
    iconeTeclaWatson.strokeRoundedRect(-largura / 2, -altura / 2, largura, altura, 10);
    let letraWatson = this.add.text(0, 0, "Aperte E", { fontSize: "20px", color: "#000000", fontStyle: "bold" }).setOrigin(0.5);
    this.containerTeclaWatson.add([iconeTeclaWatson, letraWatson]);
    this.containerTeclaWatson.setVisible(false);
    this.tweens.add({ targets: this.containerTeclaWatson, y: "+=5", duration: 800, yoyo: true, repeat: -1 });

    
    //Aqui, criamos as caixas de aviso
    this.retanguloAviso = this.add.graphics();
    this.retanguloAviso.fillStyle(0x000000, 0.8);
    this.retanguloAviso.fillRect(700, 900, 500, 30, 15); 
    this.retanguloAviso.setScrollFactor(0).setDepth(2000).setVisible(false);

    this.textoAviso = this.add.text(950, 910, "SISTEMA ATUALIZADO", {
        fontSize: '18px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001).setVisible(false);
  }

  //camera de UI para corrigir o problema de zoom no texto, ignorando os objetos do mundo e da UI conforme necessário
  configurarCameraUI() {
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    
    // Elementos que pertencem ao MUNDO (sofrem zoom) - A UI ignora isso
    let objetosDoMundo = [
        this.mapa,
        this.Principal,
        this.watson,
        this.npc1, this.npc2, this.npc3, this.npc4,
        this.camara,
        this.containerTecla,       
        this.containerTeclaWatson, 
        ...this.objetosColisao.getChildren()
    ];
    if (this.snow && this.snow.graphics) objetosDoMundo.push(this.snow.graphics);
    
    this.uiCamera.ignore(objetosDoMundo);

    // Elementos que pertencem a INTERFACE (não sofrem zoom) - A câmera principal ignora isso
    let objetosUI = [
        this.sistemaDialogo.caixaDialogo,
        this.sistemaDialogo.labelNome,
        this.sistemaDialogo.textoDialogo,
        this.sistemaDialogo.indicadorTeclaE.container,
        this.retanguloAviso,
        this.textoAviso
    ];
    this.cameras.main.ignore(objetosUI);
  }

  //método do Phaser que é chamado a cada frame para atualizar diversas funções, dentre elas colisão e interação com teclas de entrada
  update() {
  //Aqui, chamamos as funções que serão atualizadas a cada frame
    if (this.estaEmDialogo()) return;
  this.atualizarMovimento();
  this.atualizarDepth();
  this.atualizarInteracoes();
}
  
  //Aqui, fazemos o controle de diálogo da fase
   estaEmDialogo() {
    if (!this.lendoMensagem) return false;

    this.Principal.setVelocity(0, 0);
    this.Principal.anims.stop();

    if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
     this.sistemaDialogo.interagir();
   }

  return true;
}
  
  //Aqui, configuramos o movimento do personagem
  atualizarMovimento() {
   movimentacaoSophia(this, this.Principal, {
    left: "sophia_esquerda",
    right: "sophia_direita",
    front: "sophia_frente",
    back: "sophia_tras"
   });

  puloSophia(this, this.Principal);
}
//Aqui, atualizamos a organização visual do nosso código
atualizarDepth() {
  const objetos = [
    this.Principal,
    this.watson,
    this.npc1,
    this.npc2,
    this.npc3,
    this.npc4
  ];

  objetos.forEach(obj => obj.setDepth(obj.y));
}

//Aqui, atualizamos as interações
atualizarInteracoes() {
  this.verificarInteracaoCamara();
  this.verificarInteracaoWatson();
  this.executarInteracoes();
}

//Aqui, verificamos a interação com a câmara
verificarInteracaoCamara() {
  const distancia = Phaser.Math.Distance.Between(
    this.Principal.x,
    this.Principal.y,
    this.camara.x,
    this.camara.y
  );

  if (distancia < 140 && this.entrarNaCamara) {
    this.podeInteragir = true;
    this.containerTecla.setVisible(true);
    this.containerTecla.setPosition(this.camara.x, this.camara.y - 50);
  } else {
    this.podeInteragir = false;
    this.containerTecla.setVisible(false);
  }
}

//Aqui, verificamos a interação com o Watson
verificarInteracaoWatson() {
  const distancia = Phaser.Math.Distance.Between(
    this.Principal.x,
    this.Principal.y,
    this.watson.x,
    this.watson.y
  );

  if (distancia < 120 && !this.entrarNaCamara) {
    this.podeInteragirWatson = true;
    this.containerTeclaWatson.setVisible(true);
    this.containerTeclaWatson.setPosition(this.watson.x, this.watson.y - 80);
  } else {
    this.podeInteragirWatson = false;
    this.containerTeclaWatson.setVisible(false);
  }
}

//Aqui, executamos as interações
executarInteracoes() {
  if (!Phaser.Input.Keyboard.JustDown(this.teclaE)) return;

  if (this.podeInteragir && this.entrarNaCamara) {
    this.interagirCamara();
  }

  if (this.podeInteragirWatson) {
    this.interagirWatson();
  }
}

//Aqui, executamos as interações com a câmara
interagirCamara() {
  this.containerTecla.setVisible(false);
  this.lendoMensagem = true;

  const falaCamara = [
    { nome: "SISTEMA", personagem: null, texto: "Iniciando criogenia..." }
  ];

  this.sistemaDialogo.iniciarDialogo(falaCamara, () => {
    this.lendoMensagem = false;
    this.cameras.main.fadeOut(1000);

    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("sceneLBFuturo");
    });
  });
}

//Aqui, executamos as interações com o Watson
interagirWatson() {
  this.containerTeclaWatson.setVisible(false);
  this.lendoMensagem = true;

  const falasWatson = [
    {
      nome: "Watson",
      personagem: this.watson,
      texto: "Sophia, boa sorte, estaremos torcendo para que você fique sempre bem."
    }
  ];

  this.sistemaDialogo.iniciarDialogo(falasWatson, () => {
    this.lendoMensagem = false;
    this.entrarNaCamara = true;
  });
}
  
  //Aqui, criamos a caixa de aviso para o menu
  exibirAviso(frase) {
    this.textoAviso.setText(frase);
    this.retanguloAviso.setVisible(true);
    this.textoAviso.setVisible(true);

    this.time.delayedCall(5000, () => {
      this.retanguloAviso.setVisible(false);
      this.textoAviso.setVisible(false);
    });
  }

  //método para colisão de objetos na cena
  criarColisao(objeto, reduzirAltura = 1) {
    this.physics.add.existing(objeto, true);
    let alturaOriginal = objeto.displayHeight;
    objeto.body.setSize(objeto.displayWidth, alturaOriginal * reduzirAltura);
    objeto.body.setOffset(0, alturaOriginal * (1 - reduzirAltura));
    this.objetosColisao.add(objeto);
  }
}
