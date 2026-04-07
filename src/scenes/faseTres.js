import caixasDialogo from './caixasDialogo.js';

//Antes de tudo, criaremos uma função que cobre os requisitos do GDD de matemática, que envolve MU e MUV, e vamos fazer isso usando uma pedra no cenário do jogo

// Aqui, fazemos uma função responsável por simular o lançamento oblíquo da pedra
// Obs: Não usamos a física do Phaser, apenas equações de movimento (MU e MUV)
function launchStoneProjectile(scene, stone, xi, yi, xf, yf, duration) {

  // Aqui, definimos uma constante do tempo total do movimento, em segundos
  const T = duration;

  // Aqui, definimos a aceleração no eixo Y
  const ay = 200;

  // Aqui, criamos a velocidade constante no eixo horizontal (MU)
  const vx = (xf - xi) / T;

  // Aqui, criamos a velocidade variável no eixo vertical (MUV)
  // Aqui, calculamos a velocidade y inicial, usando a fórmula de "Sorvetão", para que a pedra chegue no final no ponto que esperamos
  const vy0 = ((yf - yi) - 0.5 * ay * T * T) / T;

  // Aqui, criamos uma variável que guarda quanto tempo passou desde o início do movimento
  let elapsed = 0;

  // Aqui, fazemos essa função ser chamada a cada frame, para criar a animação da pedra
  function onUpdate(time, delta) {

    // Aqui, convertemos o delta de milissegundos para segundos, para calcularmos o tempo a partir dos segundos
    elapsed += delta / 1000;

    // Aqui, garantimos que o tempo da animação nunca ultrapasse o tempo total da equação, ao chegar no tempo total, a animação para
    const t = Math.min(elapsed, T);

    //Aqui, calculamos a posição x da pedra, usando s= s0 + v.t
    const x = xi + vx * t;

    //Aqui, calculamos a velocidade y da pedra, usando v = v0 + a.t
    const vy = vy0 + ay * t;

    //Aqui, calculamos a posição y da pedra, a partir da equação de "sorvetão"
    const y = yi + vy0 * t + 0.5 * ay * t * t;
    console.log(
      `[MU - eixo X] t=${t.toFixed(2)}s | posicao x=${x.toFixed(2)} | velocidade vx=${vx.toFixed(2)}`
    );
    console.log(
      `[MUV - eixo Y] t=${t.toFixed(2)}s | posicao y=${y.toFixed(2)} | velocidade vy=${vy.toFixed(2)} | aceleracao ay=${ay}`
    );

    // Aqui, atualizamos a posição da pedra na tela
    stone.x = x;
    stone.y = y;

    // Aqui, verificamos se o tempo de movimento já acabou
    if (t >= T) {

      // Aqui, paramos a animação se o tempo de movimento estiver acabado
      scene.events.off('update', onUpdate);

      // Aqui, removemos a pedra quando ela chegar na sua posição final
      stone.destroy(); 

      // Aqui, criamos uma nova pedra na posição inicial, para animação se repetir, e o movimento ser percebido pelo jogador
      const novaPedra = scene.add.image(xi, yi, "pedra");
      scene.pedraFundo = novaPedra;
      if (scene.uiCamera) {
        scene.uiCamera.ignore(novaPedra);
      }

      // Aqui, reiniciamos a animação
      launchStoneProjectile(scene, novaPedra, xi, yi, xf, yf, T);
    }
  }

  // Aqui, fazemos a função não só ser chamada a cada frame, mas seja executada a cada frame
  scene.events.on('update', onUpdate);
}

//Aqui, temos a fase 3 por completo, que consiste em pular plataformas e coletar cristais
export class faseTres extends Phaser.Scene {
  constructor() {
    super("faseTres");
  }

  preload() {
    //Aqui, carregamos os arquivos que vamos usar nessa fase
    this.load.image("parede", "assets/Fases/faseTres/backgroundFase3Escuro.png");
    this.load.image("pedra", "assets/Objetos/FaseTres/pedrinha.png");
    this.load.spritesheet("sophia", "assets/personagens/sophia.png", { frameWidth: 64, frameHeight: 64 });
    this.load.image("plataforma", "assets/Objetos/faseTres/Cano 1, Fase 3.png");
    this.load.image("plataformaMovel", "assets/Objetos/faseTres/Cano 2, Fase 3.png");
    this.load.image("cristalVerdadeiro", "assets/Objetos/FaseTres/cristalVerdadeiro.png");
    this.load.image("cristalFalso", "assets/Objetos/FaseTres/cristalFalso.png");

  }
  create() {
    // Instanciando o sistema de diálogos
    this.sistemaDialogo = new caixasDialogo(this);

    let gifElemento5 = document.createElement('img');
        gifElemento5.src = 'assets/TextosCenas/subsoloLab.gif';
        // Forçando estilos CSS para garantir que ele apareça
        gifElemento5.style.width = '1920px'; // Coloque a largura aproximada do seu GIF
        gifElemento5.style.height = '1080px';
        //gifElement.style.display = 'block';
        //gifElement.style.border = '2px solid red'; // Descomente para debugar: se a borda vermelha aparecer, o HTML está funcionando, mas o caminho do arquivo pode estar errado.
    
        let domElemento5 = this.add.dom( 1550, 0 , gifElemento5).setOrigin(0.8).setScrollFactor(0);
        const duracaoDoGif = 5000; 
        // O Phaser espera esse tempo passar e executa a função interna
        this.time.delayedCall(duracaoDoGif, () => {
            // Verifica se o elemento ainda existe na cena
            if (domElemento5 && domElemento5.active) {
                // Esconde o GIF para ele não aparecer rodando de novo
                domElemento5.setVisible(false); 
                domElemento5.destroy(); 
            }
        });

    this.lendoMensagem = false; // Controle de interação do player

    //Aqui, criamos o mapa de fundo
    this.fundo = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "parede");

    // Aqui, criamos o personagem
    this.player = this.physics.add.sprite(1000, 870, "sophia")
    this.player.setScale(1.4)
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(30, 45, true);

    //Aqui, definimos a velocidade e criamos uma variável para o pulo
    this.speed = 150;
    this.pulando = false;

    //Aqui, habilitamos as setas para a fase
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    //Aqui, configuramos as plataformas para a fase
    const criarPlataforma = (x, y) => {
      let p = this.plataformas.create(x, y, "plataforma");
      p.setScale(0.4);
      p.refreshBody();
      p.body.setSize(65, 23);
      p.body.setOffset(5, 38);
    };

    //Aqui, criamos essas plataformas na fase
    this.plataformas = this.physics.add.staticGroup();
    criarPlataforma(865, 870, "plataforma");
    criarPlataforma(1020, 820, "plataforma");
    criarPlataforma(980, 650, "plataforma");
    criarPlataforma(860, 600, "plataforma");
    criarPlataforma(990, 520, "plataforma");
    criarPlataforma(880, 720, "plataforma");
    criarPlataforma(850, 420, "plataforma");
    criarPlataforma(1040, 370, "plataforma");
    criarPlataforma(1060, 330, "plataforma");
    criarPlataforma(1090, 200, "plataforma");
    criarPlataforma(880, 280, "plataforma");

    //Aqui, criamos as plataformas que se moverão na vertical
    this.plataformasMoveis = this.physics.add.group({ allowGravity: false, immovable: true });

    this.plataformaMovel = this.plataformasMoveis.create(1075, 730, "plataformaMovel");
    this.plataformaMovel.setScale(0.4);
    this.plataformaMovel.body.setAllowGravity(false);
    this.plataformaMovel.body.setImmovable(true);
    this.plataformaMovel.setSize(160, 60);
    this.plataformaMovel.setOffset(10, 98);

    this.plataformaMovel2 = this.plataformasMoveis.create(1075, 590, "plataformaMovel");
    this.plataformaMovel2.setScale(0.4);
    this.plataformaMovel2.body.setAllowGravity(false);
    this.plataformaMovel2.body.setImmovable(true);
    this.plataformaMovel2.setSize(160, 60);
    this.plataformaMovel2.setOffset(10, 98);

    //Aqui, criamos a plataforma que se moverão na horizontal
    this.plataformaHorizontal = this.plataformasMoveis.create(900, 480, "plataformaMovel");
    this.plataformaHorizontal.setScale(0.4);
    this.plataformaHorizontal.body.setAllowGravity(false);
    this.plataformaHorizontal.body.setImmovable(true);
    this.plataformaHorizontal.setSize(160, 60);
    this.plataformaHorizontal.setOffset(10, 98);

    //Aqui, criamos uma variável para criar o loop de movimento da plataforma
    this.tempoMovimento = 0;

    //Aqui, criamos a variável para as paredes de colisão
    this.walls = this.physics.add.staticGroup();

    // Aqui, criamos no jogo as paredes inferior, da direita, da esquerda e de cima, limitando o mapa
    this.walls.add(this.add.rectangle(1000, 970, 500, 99,));
    this.walls.add(this.add.rectangle(1171, 600, 100, 2000,));
    this.walls.add(this.add.rectangle(749, 600, 100, 2000,));
    this.walls.add(this.add.rectangle(1000, 135, 500, 1,));



    //Aqui, adicionamos a colisão entre o personagem e as paredes
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.plataformas);
    this.physics.add.collider(this.player, this.plataformasMoveis);

    // Aqui, criamos a pedra do fundo na tela, em sua posição inicial
    this.pedraFundo = this.add.image(1065, 235, "pedra");
      //Aqui, iniciamos o movimento da pedra usando cinemática manual, definindo a posição inicial e final
       // Posição inicial (1065, 235)
       // Posição final (861, 235)
    launchStoneProjectile(this, this.pedraFundo, 1065, 235, 861, 235, 2);


    this.createAnimations();

    //Aqui, criamos os grupos de cristais
    this.cristaisVerdadeiros = this.physics.add.group();
    this.cristaisFalsos = this.physics.add.group();

    //Aqui, criamos uma função para colocar os cristais no jogo e não repetir código
    const criarCristal = (grupo, x, y, sprite) => {
      let c = grupo.create(x, y, sprite);
      c.setScale(0.05);
      c.body.setAllowGravity(false);
      c.body.setSize(500, 500);
      c.body.setOffset(500, 800);

      
    };

    //Aqui, posicionamos os cristais
    // Cristais verdadeiros
    criarCristal(this.cristaisVerdadeiros, 900, 850, "cristalVerdadeiro");
    criarCristal(this.cristaisVerdadeiros, 1040, 800, "cristalVerdadeiro");
    criarCristal(this.cristaisVerdadeiros, 1020, 630, "cristalVerdadeiro");
    criarCristal(this.cristaisVerdadeiros, 1100, 720, "cristalVerdadeiro");
    criarCristal(this.cristaisVerdadeiros, 1100, 580, "cristalVerdadeiro");
    criarCristal(this.cristaisVerdadeiros, 1020, 500, "cristalVerdadeiro");
    criarCristal(this.cristaisVerdadeiros, 900, 410, "cristalVerdadeiro");
    criarCristal(this.cristaisVerdadeiros, 1070, 320, "cristalVerdadeiro");
    criarCristal(this.cristaisVerdadeiros, 910, 250, "cristalVerdadeiro");

    // Cristais falsos
    criarCristal(this.cristaisFalsos, 900, 580, "cristalFalso");
    criarCristal(this.cristaisFalsos, 930, 700, "cristalFalso");
    criarCristal(this.cristaisFalsos, 1140, 190, "cristalFalso");


    //Aqui, criamos os contadores para os cristais e fazemos eles aparecerem na tela
    this.contadorVerdadeiros = 0;
    this.contadorFalsos = 0;
    this.contadorTotal = 0;

    this.textoCristais = this.add.text(30, 30, "", {
      fontSize: "26px",
      fontFamily: "'Courier New', Courier, monospace",
      fill: "#ffffff",
      backgroundColor: "#1a1a1a",
      padding: { left: 10, right: 10, top: 8, bottom: 8 }
    }).setScrollFactor(0).setDepth(1003);

    //Aqui, detectamos a coleta dos cristais
    this.physics.add.overlap(this.player, this.cristaisVerdadeiros, this.coletarVerdadeiro, null, this);
    this.physics.add.overlap(this.player, this.cristaisFalsos, this.coletarFalso, null, this);

    //Aqui, configuramos a camera para seguir o personagem no eixo Y
    this.cameras.main.startFollow(this.player, true, 0, 1);
    this.cameras.main.setZoom(5);


    //Aqui, criamos a interação com a corda
    this.corda = this.add.rectangle(993, 140, 1, 70,);
    this.physics.add.existing(this.corda, true);
    this.subindoCorda = false;
    this.physics.add.overlap(this.player, this.corda, this.ativarCorda, null, this);

   //Aqui, criamos variáveis que vamos usar no diálogo final
   this.resultadoFaseAtivo = false;
   this.tipoResultado = null; 
   
   
    //Aqui, criamos o diálogo inicial
    this.configurarCameraUI();
    
    this.lendoMensagem = true;
    const dialogoInicial = [
        { nome: "Asimov", personagem: null, texto: "Sophia, o chão estava muito velho e você acabou caindo. Preciso que você suba e colete apenas as imagens dos cristais azuis." }
    ];

    this.sistemaDialogo.iniciarDialogo(dialogoInicial, () => {
        this.lendoMensagem = false;
    });
  }

  configurarCameraUI() {
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);

    const objetosDoMundo = [
      this.fundo,
      this.player,
      this.corda,
      this.pedraFundo,
      ...this.plataformas.getChildren(),
      ...this.plataformasMoveis.getChildren(),
      ...this.walls.getChildren(),
      ...this.cristaisVerdadeiros.getChildren(),
      ...this.cristaisFalsos.getChildren(),
    ].filter(Boolean);

    // Passamos os componentes da caixa de dialogo para a câmera de UI
    const objetosUI = [
      this.sistemaDialogo.caixaDialogo,
      this.sistemaDialogo.labelNome,
      this.sistemaDialogo.textoDialogo,
      this.sistemaDialogo.indicadorTeclaE.container,
      this.textoCristais,
    ].filter(Boolean);

    this.uiCamera.ignore(objetosDoMundo);
    this.cameras.main.ignore(objetosUI);
  }

  //Aqui, criamos uma função que ativa a animação da corda
  ativarCorda() {
    if (this.subindoCorda) return;

    this.subindoCorda = true;

    // Aqui, travamos o movimento do jogador
    this.player.setVelocity(0, 0);
    this.player.body.allowGravity = false;

    this.player.anims.play("sophia-back", true);

    let startY = this.player.y;
    let alvoY = startY - 75;

    // Aqui, subimos a corda
    this.tweens.add({
      targets: this.player,
      y: alvoY,
      duration: 3000,
      onComplete: () => {

        //Aqui, fazemos o player andar para a esquerda depois de terminar de subir a corda
        this.player.anims.play("sophia-left", true);
        let startX = this.player.x;
        let alvoX = startX - 45;
        this.tweens.add({
          targets: this.player,
          x: alvoX,
          duration: 1000,
          onComplete: () => {

          // Verifica se coletou cristais falsos
          if (this.contadorFalsos > 0) {
           this.tipoResultado = "erro";
           this.lendoMensagem = true;
           this.sistemaDialogo.iniciarDialogo([
               { nome: "Asimov", personagem: null, texto: "Você coletou imagens de cristais falsos, assim, meu sistema treinará com informações falsas e não conseguiremos fabricar o cristal verdadeiro." }
           ], () => {
               // Aqui, adicionamos os dois possíveis finais da fase
               this.scene.restart(); //Aqui, reiniciamos a fase
           });
          }
          else {
           this.tipoResultado = "sucesso";
           this.lendoMensagem = true;
           this.sistemaDialogo.iniciarDialogo([
               { nome: "Asimov", personagem: null, texto: "Boa, você coletou apenas imagens de cristais verdadeiros, isso é muito importante para evitar que meu sistema seja treinado com informações falsas!" }
           ], () => {
               // Aqui, adicionamos os dois possíveis finais da fase
               this.scene.start("scenePreFase4"); // Aqui, avançamos para a próxima fase
           });
          }
          this.resultadoFaseAtivo = true;
}
        });
      }
    });

  }



//Aqui, temos as funções para coletar os cristais verdadeiros
coletarVerdadeiro(player, cristal) {
  cristal.destroy();
  this.contadorVerdadeiros++;
  this.contadorTotal++;
}
//Aqui, temos as funções para coletar os cristais falsos
coletarFalso(player, cristal) {
  cristal.destroy();
  this.contadorFalsos++;
  this.contadorTotal++;
}
createAnimations() {

  if (this.anims.exists("sophia-left")) return;

  this.anims.create({
    key: "sophia-left",
    frames: this.anims.generateFrameNumbers("sophia", { start: 24, end: 29 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "sophia-right",
    frames: this.anims.generateFrameNumbers("sophia", { start: 16, end: 21 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "sophia-back",
    frames: this.anims.generateFrameNumbers("sophia", { start: 8, end: 15 }),
    frameRate: 10,
    repeat: -1
  });
}

update() {

  //Aqui, adicionamos as interações aos diálogos inicial e final
  if (this.lendoMensagem) {
    this.player.setVelocity(0);
    this.player.anims.stop();
    this.player.setFrame(0);

    if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      this.sistemaDialogo.interagir();
    }
    return;
  }

  //Aqui, bloqueamos os controles do personagem durante a subida da corda
  if (this.subindoCorda) {
    this.player.setVelocity(0);
    return;
  }
  //Aqui, atualizamos o contador da tela
  this.textoCristais.setText(
    "Verdadeiros: " + this.contadorVerdadeiros +
    "\nFalsos: " + this.contadorFalsos +
    "\nTotal: " + this.contadorTotal
  );

  //Aqui, travamos o eixo X da câmera no centro da tela
  this.cameras.main.scrollX = 960 - this.cameras.main.width / 2;

  //Aqui, resetamos a velocidade sempre que não estiver nada sendo apertado
  let velocityX = 0;

  // Aqui, fazemos o movimento horizontal do personagem
  if (this.cursors.left.isDown || this.keys.A.isDown) {
    velocityX = -this.speed;
    this.player.anims.play("sophia-left", true);
  }
  else if (this.cursors.right.isDown || this.keys.D.isDown) {
    velocityX = this.speed;
    this.player.anims.play("sophia-right", true);
  }
  // Aqui, fazemos a animação parar quando o personagem estiver parado
  if (velocityX === 0) {
    this.player.anims.stop();
    this.player.setFrame(0);
  }

  // Aqui, aplicamos a velocidade e a gravidade ao jogador
  this.player.setGravityY(200);
  this.player.setVelocityX(velocityX);

  // Aqui, adicionamos o pulo na fase
  if (Phaser.Input.Keyboard.JustDown(this.keySpace) && (this.player.body.blocked.down || this.player.body.touching.down)) {
    this.player.setVelocityY(-180);
  }

  //Aqui, criamos o movimento das plataformas que se moverão na vertical
  this.tempoMovimento += 0.01;
  let meio = 730;
  let meio2 = 590
  let amplitude = 60;
  this.plataformaMovel.y = meio + amplitude * Math.sin(this.tempoMovimento);
  this.plataformaMovel.body.updateFromGameObject();
  this.plataformaMovel2.y = meio2 + amplitude * Math.sin(this.tempoMovimento);
  this.plataformaMovel2.body.updateFromGameObject();

  //Aqui, criamos o movimento da plataforma que se moverá na horizontal
  let centroX = 900;
  let amplitudeX = 50;
  this.plataformaHorizontal.x = centroX + amplitudeX * Math.sin(this.tempoMovimento);
  this.plataformaHorizontal.body.updateFromGameObject();
} };
