import { registrarTeclaMenu } from "../menu.js";
import { HudTeclaE } from "./hudTeclaE.js";

// Esta cena organiza toda a progressao da fase 2:
// exploracao do mapa, dialogos com Asimov, mini game da rede neural,
// liberacao do bau e transicao para a proxima cena.
export class FaseDois extends Phaser.Scene { 
  constructor() {
    super("FaseDois");
  }

  preload() {
    // Carrega os assets visuais e sonoros usados em todos os momentos da fase.
    this.load.image("portas", "assets/Fases/FaseDois/salaPortas.png");
    this.load.image("B1", "assets/Fases/FaseDois/binario1.png");
    this.load.image("B2", "assets/Fases/FaseDois/binario2.png");
    this.load.image("B3", "assets/Fases/FaseDois/binario3.png");
    this.load.spritesheet("sophia", "assets/personagens/sophia.png", {
      frameWidth:  64,
      frameHeight: 64,
    });
    this.load.spritesheet("asimov", "assets/Personagens/asimov.png", {
      frameWidth:  32,
      frameHeight: 32,
    });
    this.load.spritesheet("valvula", "assets/Fases/FaseDois/ValvulaSprite.png", {
      frameWidth:  320,
      frameHeight: 320,
    });
    this.load.spritesheet("redeNeural", "assets/Fases/FaseDois/RedesNeurais (1).png", {
      frameWidth:  320,
      frameHeight: 320,
    });
    this.load.spritesheet("bauAnimado", "assets/Objetos/faseUm/bau.png", {
      frameWidth:  128,
      frameHeight: 128,
    });
    this.load.audio('bg-music-fases', 'assets/bg-music-fases.mp3');
  }

  create() {
    // Este array guarda objetos que pertencem ao mundo da fase.
    // A camera de UI ignora tudo aqui para manter HUD e dialogos fixos na tela.
    this.worldObjects = [];

    let gifElemento4 = document.createElement('img');
        gifElemento4.src = 'assets/TextosCenas/salaDasPortas.gif';
    
        // Forçando estilos CSS para garantir que ele apareça
        gifElemento4.style.width = '1920px'; // Coloque a largura aproximada do seu GIF
        gifElemento4.style.height = '1080px';
        //gifElement.style.display = 'block';
        //gifElement.style.border = '2px solid red'; // Descomente para debugar: se a borda vermelha aparecer, o HTML está funcionando, mas o caminho do arquivo pode estar errado.
    
        let domElemento4 = this.add.dom( 1550, 0 , gifElemento4).setOrigin(0.8).setScrollFactor(0);
        const duracaoDoGif = 5000; 
        // O Phaser espera esse tempo passar e executa a função interna
        this.time.delayedCall(duracaoDoGif, () => {
            // Verifica se o elemento ainda existe na cena
            if (domElemento4 && domElemento4.active) {
                // Esconde o GIF para ele não aparecer rodando de novo
                domElemento4.setVisible(false); 
                domElemento4.destroy(); 
            }
        });

    // ── Mapa ─────────────────────────────────────────────────────────────────
    // O fundo e quase invisivel para reforcar que a sala esta escura para Sophia.
    this.portas = this.add.image(0, 0, "portas").setOrigin(0, 0).setScale(3).setAlpha(0.1);
    this.worldObjects.push(this.portas);

    const larguraMapa = this.portas.width  * 3;
    const alturaMapa  = this.portas.height * 3;
    this.physics.world.setBounds(0, 0, larguraMapa, alturaMapa);

    // ── Baú — invisível até o minigame terminar ───────────────────────────────
    // O bau ja existe no mapa, mas comeca invisivel e sem colisao.
    // Ele so e liberado depois que o mini game termina.
    this.bauAnimado = this.physics.add.staticSprite(880, 640, "bauAnimado").setScale(0.6);
    this.bauAnimado.body.setSize(60, 40);
    this.bauAnimado.body.setOffset(34, 70);
    this.bauAnimado.refreshBody();
    this.bauAnimado.setVisible(false);
    this.bauAnimado.body.enable = false;
    this.bauAnimado.setInteractive({ useHandCursor: true });
    this.worldObjects.push(this.bauAnimado);

    // As animacoes globais do bau so sao criadas uma vez.
    if (!this.anims.exists("fechado")) {
      this.anims.create({
        key: "fechado",
        frames: [{ key: "bauAnimado", frame: 0 }],
        frameRate: 1,
      });
      this.anims.create({
        key: "abrindo",
        frames: this.anims.generateFrameNumbers("bauAnimado", { start: 0, end: 1 }),
        frameRate: 2,
        repeat: 0,
      });
    }
    this.bauAnimado.play("fechado");

    // ── Asimov ───────────────────────────────────────────────────────────────
    // Asimov funciona como NPC fixo da fase e depois participa da cutscene.
    this.asimov = this.physics.add.sprite(this.portas.x + 480, this.portas.y + 340, "asimov")
      .setScale(3);
    this.asimov.body.setAllowGravity(false);
    this.asimov.setCollideWorldBounds(true);
    this.asimov.setSize(15, 12);
    this.asimov.setOffset(8, 16);
    this.asimov.setImmovable(true);
    this.worldObjects.push(this.asimov);

    // ── Sophia ───────────────────────────────────────────────────────────────
    // Sophia e o personagem controlado pelo jogador.
    this.sophia = this.physics.add.sprite(100, 500, "sophia").setScale(2);
    this.sophia.setCollideWorldBounds(true);
    this.sophia.body.setSize(22, 10, true);
    this.sophia.body.setAllowGravity(false);
    this.worldObjects.push(this.sophia);

    this.physics.add.collider(this.sophia, this.bauAnimado);
    this.physics.add.collider(this.sophia, this.asimov);

    // ALTERE AQUI: zoom padrao da exploracao na FaseDois.
    // Parametros de camera centralizados para facilitar ajuste fino da cena.
    this.zoomExploracaoFaseDois = 2;
    // ALTERE AQUI: zoom usado quando a camera aproxima do bau na transicao final.
    this.zoomTransicaoBauFaseDois = 2;
    this.cameras.main.startFollow(this.sophia);
    this.cameras.main.setBounds(0, 0, larguraMapa, alturaMapa);
    this.cameras.main.setZoom(this.zoomExploracaoFaseDois);

    this.scene.launch("bgMusic");

    // ── Paredes ───────────────────────────────────────────────────────────────
    // As paredes sao retangulos invisiveis posicionados manualmente sobre a arte.
    this.walls = this.physics.add.staticGroup();
    const s = 3;
    [
      [160*s, 3*s,   320*s, 20*s],
      [160*s, 240*s, 320*s, 30*s],
      [325*s, 90*s,  25*s,  250*s],
      [110*s, 38*s,  1,     50*s],
      [100*s, 63*s,  10*s,  1*s ],
      [25*s,  63*s,  20*s,  1*s ],
      [208*s, 38*s,  1,     50*s],
      [223*s, 63*s,  10*s,  1*s ],
      [295*s, 63*s,  20*s,  1*s ],
      [208*s, 194*s, 1,     89*s],
      [223*s, 150*s, 10*s,  1*s ],
      [295*s, 150*s, 20*s,  1*s ],
    ].forEach(([x, y, w, h]) => {
      const r = this.add.rectangle(x, y, w, h);
      this.walls.add(r);
      this.worldObjects.push(r);
    });
    this.physics.world.enable(this.walls);
    this.physics.add.collider(this.sophia, this.walls);

    // ── Controles ─────────────────────────────────────────────────────────────
    this.speed   = 150;
    // Sophia aceita setas e WASD como controles de movimento.
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys    = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.teclaE   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Flags que travam ou liberam partes da logica conforme a cena avanca.
    this.pulando               = false;
    this.podeInteragirAsimov   = false;
    this.podeInteragirBau      = false;
    this.bauInteragido         = false;
    this.lendoMensagem         = false;
    this.miniGameAtivo         = false;
    this.bauLiberadoParaSophia = false;
    this.falandoAsimov         = false;

    // Garante que o diálogo do Asimov só dispare UMA vez
    this.dialogoAsimovJaIniciado = false;

    // Override de fecharMensagem (usado na sequência do baú)
    this.fecharMensagemOverride = null;

    // Ajustes da cutscene apÃ³s a rede neural:
    // altere estes valores para reposicionar Asimov e Sophia perto do baÃº.
    // ALTERE AQUI: deslocamento final do Asimov no eixo X em relacao ao bau.
    this.cutsceneBauAsimovOffsetX = -10;
    // ALTERE AQUI: deslocamento final do Asimov no eixo Y.
    this.cutsceneBauAsimovOffsetY = 75;
    // Se true, o Asimov mantem o Y atual e so ajusta o X no teletransporte.
    this.cutsceneBauAsimovMoverApenasNoX = true;
    // ALTERE AQUI: deslocamento final da Sophia no eixo X em relacao ao Asimov.
    this.cutsceneBauSophiaOffsetX = -60;
    // ALTERE AQUI: deslocamento final da Sophia no eixo Y em relacao ao Asimov.
    this.cutsceneBauSophiaOffsetY = 220;
    // ALTERE AQUI: duracao do fade de entrada/saida da tela preta.
    this.cutsceneBauDuracaoFade = 350;
    // ALTERE AQUI: tempo em que a tela fica totalmente preta antes de revelar.
    this.cutsceneBauTempoTelaPreta = 220;
    this.cutsceneBauVelocidade = 120;
    this.cutsceneBauSophiaDelay = 200;

    // Registra o atalho global de menu desta cena.
    registrarTeclaMenu(this);
    this.createAnimations();

    // ── Botão "Aperte E" ──────────────────────────────────────────────────────
    // O mesmo indicador "Aperte E" e reutilizado para o Asimov e para o bau.
    this.containerTeclaAsimov = this.add.container(0, 0).setDepth(200);
    const icone = this.add.graphics();
    icone.fillStyle(0xffffff, 1);
    icone.lineStyle(2, 0x000000, 1);
    icone.fillRoundedRect(-70, -20, 140, 40, 10);
    icone.strokeRoundedRect(-70, -20, 140, 40, 10);
    const letraBtn = this.add.text(0, 0, "Aperte E", {
      fontSize: "20px", color: "#000000", fontStyle: "bold",
    }).setOrigin(0.5);
    this.containerTeclaAsimov.add([icone, letraBtn]);
    this.containerTeclaAsimov.setVisible(false);
    this.worldObjects.push(this.containerTeclaAsimov);
    this.tweens.add({
      targets: this.containerTeclaAsimov, y: "+=5",
      duration: 800, yoyo: true, repeat: -1,
    });

    // ── UI Camera ─────────────────────────────────────────────────────────────
    // Camera exclusiva da interface, usada por dialogos e overlays.
    const uiWidth = this.cameras.main.width;
    const uiHeight = this.cameras.main.height;
    this.uiCamera = this.cameras.add(0, 0, uiWidth, uiHeight);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.ignore(this.worldObjects);

    // ── Caixa de diálogo ──────────────────────────────────────────────────────
    const margem       = 20;
    const larguraCaixa = uiWidth - margem * 2;
    const alturaCaixa  = 140;
    const xCaixa       = margem;
    const yCaixa       = uiHeight - alturaCaixa - margem;
    this.dialogoLarguraTexto = larguraCaixa - 32;
    this.dialogoAlturaTexto = alturaCaixa - 24;

    // Caixa de dialogo compartilhada por exploracao, mini game e cutscenes.
    this.caixaDialogo = this.add.graphics().setDepth(3000).setVisible(false);
    this.caixaDialogo.fillStyle(0x1a1a1a, 0.92);
    this.caixaDialogo.lineStyle(2, 0x00ffff, 1);
    this.caixaDialogo.fillRoundedRect(xCaixa, yCaixa, larguraCaixa, alturaCaixa, 10);
    this.caixaDialogo.strokeRoundedRect(xCaixa, yCaixa, larguraCaixa, alturaCaixa, 10);

    this.textoDialogo = this.add.text(xCaixa + 16, yCaixa + 22, "", {
      fontSize:    "32px",
      fontFamily:  "'Courier New', Courier, monospace",
      color:       "#ccffff",
      wordWrap:    { width: larguraCaixa - 32 },
      lineSpacing: 6,
    }).setDepth(3001).setVisible(false);

    this.labelNome = this.add.text(xCaixa + 12, yCaixa - 18, "", {
      fontSize:        "32px",
      fontFamily:      "'Courier New', Courier, monospace",
      color:           "#00ffff",
      fontStyle:       "bold",
      backgroundColor: "#1a1a1a",
      padding: { left: 6, right: 6, top: 2, bottom: 2 },
    }).setDepth(3002).setVisible(false);

    this.indicadorDialogoE = new HudTeclaE(this, {
      x: xCaixa + larguraCaixa - 70,
      y: yCaixa + alturaCaixa - 32,
      depth: 3003,
    });

    this.cameras.main.ignore([
      this.caixaDialogo,
      this.textoDialogo,
      this.labelNome,
      this.indicadorDialogoE.container,
    ]);

    // Alem da tecla E, o bau aceita clique quando estiver liberado.
    this.bauAnimado.on("pointerdown", () => {
      if (this.bauLiberadoParaSophia && !this.bauInteragido) {
        this.containerTeclaAsimov.setVisible(false);
        this._cutscene_interagir_bau();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ANIMAÇÕES
  // ═══════════════════════════════════════════════════════════════════════════
  createAnimations() {
    // Define animacoes basicas dos personagens.
    // Como as chaves de animacao vivem globalmente no Phaser, sempre verificamos
    // se elas ja existem antes de criar novamente.
    if (!this.anims.exists("asimov_front")) {
      this.anims.create({ key: "asimov_front", frames: this.anims.generateFrameNumbers("asimov", { start: 0,  end: 1  }), frameRate: 4, repeat: -1 });
      this.anims.create({ key: "asimov_back",  frames: this.anims.generateFrameNumbers("asimov", { start: 7,  end: 9  }), frameRate: 4, repeat: -1 });
      this.anims.create({ key: "asimov_side",  frames: this.anims.generateFrameNumbers("asimov", { start: 14, end: 16 }), frameRate: 4, repeat: -1 });
    }
    this.asimov.play("asimov_front");

    if (!this.anims.exists("sophia-left")) {
      this.anims.create({ key: "sophia-left",  frames: this.anims.generateFrameNumbers("sophia", { start: 24, end: 29 }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: "sophia-right", frames: this.anims.generateFrameNumbers("sophia", { start: 16, end: 21 }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: "sophia-front", frames: this.anims.generateFrameNumbers("sophia", { start: 0,  end: 7  }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: "sophia-back",  frames: this.anims.generateFrameNumbers("sophia", { start: 8,  end: 15 }), frameRate: 10, repeat: -1 });
    }
  }

  _ajustarTextoDialogo(textoCompleto) {
    // Tenta encaixar a fala dentro da caixa reduzindo a fonte aos poucos.
    // Isso evita overflow quando o texto e grande.
    const tamanhos = [32, 30, 28, 26, 24, 22, 20];

    for (const tamanho of tamanhos) {
      const lineSpacing = tamanho >= 30 ? 6 : tamanho >= 26 ? 4 : 2;

      this.textoDialogo.setStyle({
        fontSize: `${tamanho}px`,
        fontFamily: "'Courier New', Courier, monospace",
        color: "#ccffff",
        wordWrap: { width: this.dialogoLarguraTexto },
        lineSpacing,
      });

      this.textoDialogo.setText(textoCompleto);
      if (this.textoDialogo.height <= this.dialogoAlturaTexto) {
        this.textoDialogo.setText("");
        return;
      }
    }

    this.textoDialogo.setStyle({
      fontSize: "20px",
      fontFamily: "'Courier New', Courier, monospace",
      color: "#ccffff",
      wordWrap: { width: this.dialogoLarguraTexto },
      lineSpacing: 2,
    });
    this.textoDialogo.setText("");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  UPDATE
  // ═══════════════════════════════════════════════════════════════════════════
  _atualizarAnimacaoSophiaDuranteMovimento(dx, dy) {
    // Escolhe a direcao com base no eixo dominante do deslocamento.
    if (Math.abs(dx) >= Math.abs(dy)) {
      this.sophia.anims.play(dx < 0 ? "sophia-left" : "sophia-right", true);
      return;
    }

    this.sophia.anims.play(dy < 0 ? "sophia-back" : "sophia-front", true);
  }

  _moverSpriteComAnimacao(sprite, destinoX, destinoY, velocidade, aoConcluir) {
    // Helper de cutscene:
    // move um sprite em linha reta e mantem a animacao coerente com a direcao.
    const posicaoInicialX = sprite.x;
    const posicaoInicialY = sprite.y;
    const distancia = Phaser.Math.Distance.Between(posicaoInicialX, posicaoInicialY, destinoX, destinoY);
    const duracao = Math.max((distancia / velocidade) * 1000, 50);
    let ultimoX = posicaoInicialX;
    let ultimoY = posicaoInicialY;

    return this.tweens.add({
      targets: sprite,
      x: destinoX,
      y: destinoY,
      duration: duracao,
      ease: "Linear",
      onStart: () => {
        const dx = destinoX - posicaoInicialX;
        const dy = destinoY - posicaoInicialY;

        if (sprite === this.asimov) {
          if (Math.abs(dx) >= Math.abs(dy)) {
            this.asimov.setFlipX(dx < 0);
            this.asimov.anims.play("asimov_side", true);
          } else {
            this.asimov.anims.play(dy < 0 ? "asimov_back" : "asimov_front", true);
          }
          return;
        }

        if (sprite === this.sophia) {
          this._atualizarAnimacaoSophiaDuranteMovimento(dx, dy);
        }
      },
      onUpdate: () => {
        // Para Sophia, recalculamos a direcao durante o tween.
        // Isso deixa a animacao mais natural em trajetos curtos.
        const dx = sprite.x - ultimoX;
        const dy = sprite.y - ultimoY;

        if (sprite === this.sophia && (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5)) {
          this._atualizarAnimacaoSophiaDuranteMovimento(dx, dy);
        }

        ultimoX = sprite.x;
        ultimoY = sprite.y;
      },
      onComplete: () => {
        // Quando o movimento termina, o sprite volta para o frame parado.
        sprite.anims.stop();

        if (sprite === this.asimov) {
          this.asimov.setFrame(0);
          this.asimov.setFlipX(false);
        }

        if (sprite === this.sophia) {
          this.sophia.setFrame(0);
        }

        if (aoConcluir) aoConcluir();
      },
    });
  }

  update() {
    // Ordem de prioridade do update:
    // 1. Se houver dialogo aberto, Sophia para e "E" avanca a fala.
    // 2. Se o mini game estiver ativo, a exploracao fica congelada.
    // 3. So depois disso processamos movimento e interacoes do mapa.
    if (this.lendoMensagem) {
      this.sophia.setVelocity(0, 0);
      this.sophia.anims.stop();
      if (Phaser.Input.Keyboard.JustDown(this.teclaE)) this.fecharMensagem();
      return;
    }

    if (this.miniGameAtivo) {
      this.sophia.setVelocity(0, 0);
      this.sophia.anims.stop();
      return;
    }

    // ── Movimento de Sophia ───────────────────────────────────────────────────
    // Movimento livre da Sophia durante a exploracao.
    let vx = 0, vy = 0;
    if      (this.cursors.left.isDown  || this.keys.A.isDown) { vx = -this.speed; this.sophia.anims.play("sophia-left",  true); }
    else if (this.cursors.right.isDown || this.keys.D.isDown) { vx =  this.speed; this.sophia.anims.play("sophia-right", true); }
    if      (this.cursors.up.isDown    || this.keys.W.isDown) { vy = -this.speed; if (vx === 0) this.sophia.anims.play("sophia-back",  true); }
    else if (this.cursors.down.isDown  || this.keys.S.isDown) { vy =  this.speed; if (vx === 0) this.sophia.anims.play("sophia-front", true); }

    this.sophia.setVelocity(vx, vy);
    this.sophia.body.velocity.normalize().scale(this.speed);
    if (vx === 0 && vy === 0) { this.sophia.anims.stop(); this.sophia.setFrame(0); }

    // O pulo e apenas visual: um tween curto no eixo Y.
    if (Phaser.Input.Keyboard.JustDown(this.keySpace) && !this.pulando) {
      this.pulando = true;
      const yi = this.sophia.y;
      this.tweens.add({
        targets: this.sophia, y: yi - 40,
        duration: 180, yoyo: true, ease: "Sine.easeOut",
        onComplete: () => { this.sophia.y = yi; this.pulando = false; },
      });
    }
    this.sophia.setDepth(this.sophia.y);
    this.asimov.setDepth(this.asimov.y);

    // ── Interação com Asimov — apenas uma vez ─────────────────────────────────
    // O indicador de interacao com Asimov so aparece antes do primeiro dialogo.
    if (!this.dialogoAsimovJaIniciado) {
      const dist = Phaser.Math.Distance.Between(
        this.sophia.x, this.sophia.y, this.asimov.x, this.asimov.y
      );
      if (dist < 120) {
        this.podeInteragirAsimov = true;
        this.containerTeclaAsimov.setVisible(true);
        this.containerTeclaAsimov.setPosition(this.asimov.x, this.asimov.y - 80);
      } else {
        this.podeInteragirAsimov = false;
        if (!this.podeInteragirBau) this.containerTeclaAsimov.setVisible(false);
      }

      if (this.podeInteragirAsimov && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
        this.dialogoAsimovJaIniciado = true;
        this.containerTeclaAsimov.setVisible(false);
        this._iniciarDialogoAsimov();
      }
    }

    // ── Interação com o baú — só após cutscene completa ──────────────────────
    // O bau entra no loop de interacao apenas depois da cutscene do mini game.
    if (this.bauLiberadoParaSophia && !this.bauInteragido) {
      const distBau = Phaser.Math.Distance.Between(
        this.sophia.x, this.sophia.y, this.bauAnimado.x, this.bauAnimado.y
      );
      if (distBau < 100) {
        this.podeInteragirBau = true;
        this.containerTeclaAsimov.setVisible(true);
        this.containerTeclaAsimov.setPosition(this.bauAnimado.x, this.bauAnimado.y - 60);
      } else {
        this.podeInteragirBau = false;
        this.containerTeclaAsimov.setVisible(false);
      }

      if (this.podeInteragirBau && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
        this.containerTeclaAsimov.setVisible(false);
        this._cutscene_interagir_bau();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  DIÁLOGO DO ASIMOV — usa sistema normal (update fecha via JustDown)
  // ═══════════════════════════════════════════════════════════════════════════
  _iniciarDialogoAsimov() {
    // O dialogo inicial e armazenado como lista de falas.
    // fecharMensagem() percorre esse array uma fala por vez.
    this.dialogoAsimov = [
      { texto: "Chegamos, Sophia. Essa é a sala com 3 portas.", falante: "Asimov" },
      { texto: "Asimov… está tudo escuro para mim. Só consigo enxergar seu olho brilhando.", falante: "Sophia" },
      { texto: "Entendi, Sophia. Eu consigo enxergar no escuro… mas meus sensores de reconhecimento de padrões foram corrompidos.", falante: "Asimov" },
      { texto: "Mas existe uma solução! Você precisa entrar na minha cabeça e religar os neurônios que foram desligados.", falante: "Asimov" },
      { texto: "Espera… você tem um cérebro de verdade aí dentro?", falante: "Sophia" },
      { texto: "Uma versão artificial, sim! Funciona igual ao seu — com neurônios que se conectam e aprendem. Só que os meus estão apagados. Você me ajuda a religar?", falante: "Asimov" },
    ];
    this.dialogoAsimovIndex = 0;
    this.falandoAsimov = true;
    this.mostrarMensagem(this.dialogoAsimov[0].texto, this.dialogoAsimov[0].falante);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  DIÁLOGO NORMAL
  // ═══════════════════════════════════════════════════════════════════════════
  mostrarMensagem(textoCompleto, nome = "") {
    // Sistema padrao de dialogo da exploracao:
    // abre a caixa, mostra o nome do falante e escreve o texto aos poucos.
    this.lendoMensagem = true;
    this.caixaDialogo.setVisible(true);
    this.indicadorDialogoE.mostrar();
    this._ajustarTextoDialogo(textoCompleto);
    this.textoDialogo.setVisible(true).setText("");
    this.textoAtualArmazenado = textoCompleto;
    this.labelNome.setVisible(nome.trim() !== "");
    if (nome.trim() !== "") this.labelNome.setText(nome);

    let i = 0;
    if (this.timerEscrever) this.timerEscrever.remove();
    this.timerEscrever = this.time.addEvent({
      delay: 30,
      callback: () => { this.textoDialogo.text += textoCompleto[i++]; },
      repeat: textoCompleto.length - 1,
    });
  }

  fecharMensagem() {
    // Sequencias especiais podem substituir temporariamente o fechamento padrao.
    // Delega para override quando a sequência do baú estiver ativa
    if (this.fecharMensagemOverride) {
      this.fecharMensagemOverride();
      return;
    }

    // Primeiro aperto termina o efeito de digitacao, sem fechar a mensagem.
    if (this.timerEscrever && this.timerEscrever.getProgress() < 1) {
      this.timerEscrever.remove();
      this.textoDialogo.setText(this.textoAtualArmazenado);
      return;
    }

    this.lendoMensagem = false;
    this.caixaDialogo.setVisible(false);
    this.textoDialogo.setVisible(false).setText("");
    this.labelNome.setVisible(false);
    this.indicadorDialogoE.esconder();

    // Quando a conversa inicial acaba, a cena muda para o mini game.
    if (this.falandoAsimov) {
      this.dialogoAsimovIndex++;
      if (this.dialogoAsimovIndex < this.dialogoAsimov.length) {
        const p = this.dialogoAsimov[this.dialogoAsimovIndex];
        this.mostrarMensagem(p.texto, p.falante);
        return;
      }
      this.falandoAsimov = false;
      this.iniciarMiniGame();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HELPER — Diálogo dentro do mini-game (listener próprio, não usa update)
  // ═══════════════════════════════════════════════════════════════════════════
  _mgDialogo(texto, falante, callback) {
    // Versao do dialogo usada dentro do mini game.
    // Ela nao depende do update e gerencia seu proprio listener da tecla E.
    this.caixaDialogo.setVisible(true);
    this.indicadorDialogoE.mostrar();
    this._ajustarTextoDialogo(texto);
    this.textoDialogo.setVisible(true).setText("");
    this.textoAtualArmazenado = texto;
    this.labelNome.setVisible(true).setText(falante);

    let i = 0;
    if (this.timerEscrever) this.timerEscrever.remove();
    this.timerEscrever = this.time.addEvent({
      delay: 30,
      callback: () => { this.textoDialogo.text += texto[i++]; },
      repeat: texto.length - 1,
    });

    if (this.tweenTextoE) this.tweenTextoE.stop();
    this.mgTextoE.setAlpha(0);

    // Remove qualquer listener anterior antes de adicionar um novo
    // Evita empilhar varios callbacks na mesma tecla E.
    if (this.mgListenerE) {
      this.teclaE.off("down", this.mgListenerE);
      this.mgListenerE = null;
    }

    const onE = () => {
      if (this.timerEscrever && this.timerEscrever.getProgress() < 1) {
        this.timerEscrever.remove();
        this.textoDialogo.setText(texto);
        return;
      }
      this.teclaE.off("down", onE);
      this.mgListenerE = null;
      this.caixaDialogo.setVisible(false);
      this.textoDialogo.setVisible(false).setText("");
      this.labelNome.setVisible(false);
      this.indicadorDialogoE.esconder();
      this.mgTextoE.setAlpha(0);
      callback();
    };

    this.mgListenerE = onE;
    this.teclaE.on("down", onE);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MINI-GAME — INICIAR
  // ═══════════════════════════════════════════════════════════════════════════
  iniciarMiniGame() {
    // A exploracao congela e a cena vira uma interface didatica por cima do mapa.
    this.miniGameAtivo = true;

    // Troca para música de fases
    if (this.game.sound.get('bgMusic')) {
      this.game.sound.get('bgMusic').stop();
    }
    this.musicFases = this.sound.add('bg-music-fases');
    this.musicFases.play({ loop: true });

    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;

    // Overlay escuro para esconder temporariamente o mapa da sala.
    this.mgOverlay = this.add.graphics()
      .fillStyle(0x000000, 0.92)
      .fillRect(0, 0, cameraWidth, cameraHeight)
      .setDepth(2000);
    this.cameras.main.ignore(this.mgOverlay);

    const escala  = this._escalaRede(cameraWidth, cameraHeight);
    this.mgRede   = this.add.sprite(cameraWidth / 2, cameraHeight / 2, "redeNeural")
      .setDepth(2001)
      .setScale(escala)
      .setFrame(0);
    this.cameras.main.ignore(this.mgRede);

    this.mgTextoE = this.add.text(cameraWidth / 2, cameraHeight - 18, "Pressione E para continuar", {
      fontSize: "13px", fontFamily: "'Courier New', Courier, monospace", color: "#00ffff",
    }).setOrigin(0.5, 1).setDepth(2002).setAlpha(0);
    this.cameras.main.ignore(this.mgTextoE);

    this.mgListenerE = null;

    this._mg_fase1_dialogo();
  }

  _escalaRede(cameraWidth, cameraHeight) {
    // Escala responsiva para a sprite da rede caber em diferentes resolucoes.
    return Math.min((cameraWidth * 0.88) / 320, (cameraHeight * 0.80) / 320);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FASE 1 — Arrastar binários
  // ═══════════════════════════════════════════════════════════════════════════
  _mg_fase1_dialogo() {
    // Apresenta a metafora das entradas da rede usando os binarios da fase 1.
    this.mgRede.anims.stop();
    this.mgRede.setFrame(0);

    this._mgDialogo(
      "Aqui está meu cérebro! Sabe como o seu funciona? Ele recebe informações pelos sentidos, visão, tato, olfato. O meu funciona igual! Lembra daqueles números que coletou na fase 1 então eles são as informações sobre a porta correta. Arraste cada um até os meus 3 neurônios de entrada!",
      "Asimov",
      () => this._mg_fase1_interativo()
    );
  }

  _mg_fase1_interativo() {
    // Etapa 1: arrastar os tres binarios ate seus neuronios de entrada.
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;

    const escala = this._escalaRede(cameraWidth, cameraHeight);
    const redeCX = cameraWidth / 2;
    const redeCY = cameraHeight / 2;

    const entradaX = redeCX - 320 * escala * 0.335;
    const entradaYs = [
      redeCY - 320 * escala * 0.220,
      redeCY - 320 * escala * 0.080,
      redeCY + 320 * escala * 0.080,
    ];
    const raioAlvo = 14 * escala;

    // Cada acerto avanca um frame da rede para mostrar progresso visual.
    const spritesPorDeposito = [1, 2, 3];

    const binariosConfig = [
      { key: "B1", oriX: cameraWidth * 0.08, oriY: cameraHeight * 0.30, alvo: 0 },
      { key: "B2", oriX: cameraWidth * 0.08, oriY: cameraHeight * 0.50, alvo: 1 },
      { key: "B3", oriX: cameraWidth * 0.08, oriY: cameraHeight * 0.70, alvo: 2 },
    ];

    // Cria as zonas-alvo com um marcador visual e um estado logico.
    this.mgZonasFase1 = entradaYs.map((ey, idx) => {
      const g = this.add.graphics().setDepth(2008);
      g.lineStyle(2, 0x00ffff, 0.55);
      g.strokeCircle(entradaX, ey, raioAlvo);
      this.cameras.main.ignore(g);

      const label = this.add.text(entradaX, ey - raioAlvo - 10, `B${idx + 1}`, {
        fontSize: "11px", fontFamily: "'Courier New', Courier, monospace",
        color: "#00ffff", fontStyle: "bold",
      }).setOrigin(0.5, 1).setDepth(2009).setAlpha(0.7);
      this.cameras.main.ignore(label);

      return { x: entradaX, y: ey, raio: raioAlvo, ativo: false, g, label, indice: idx };
    });

    this.mgBinarios        = [];
    this.mgEntradaAtivadas = 0;

    binariosConfig.forEach((cfg) => {
      const img = this.add.image(cfg.oriX, cfg.oriY, cfg.key)
        .setDepth(2010)
        .setScale(0.15)
        .setInteractive({ draggable: true });
      this.cameras.main.ignore(img);
      this.mgBinarios.push({ img, oriX: cfg.oriX, oriY: cfg.oriY, alvo: cfg.alvo, encaixado: false });
    });

    // Enquanto o objeto nao foi encaixado, ele segue o cursor normalmente.
    this.input.on("drag", (pointer, obj, dx, dy) => {
      const bin = this.mgBinarios.find(b => b.img === obj);
      if (bin && !bin.encaixado) { obj.x = dx; obj.y = dy; }
    });

    this.input.on("dragend", (pointer, obj) => {
      const bin = this.mgBinarios.find(b => b.img === obj);
      if (!bin || bin.encaixado) return;

      const zona = this.mgZonasFase1[bin.alvo];
      const dist = Phaser.Math.Distance.Between(obj.x, obj.y, zona.x, zona.y);

      // A folga extra no raio deixa o encaixe mais amigavel para o jogador.
      if (!zona.ativo && dist <= zona.raio + 26) {
        bin.encaixado = true;
        zona.ativo    = true;
        this.mgEntradaAtivadas++;

        this.tweens.add({ targets: obj, x: zona.x, y: zona.y, duration: 180, ease: "Back.easeOut" });

        zona.g.clear();
        zona.g.fillStyle(0x00ff88, 0.2);
        zona.g.lineStyle(3, 0x00ff88, 1);
        zona.g.fillCircle(zona.x, zona.y, zona.raio);
        zona.g.strokeCircle(zona.x, zona.y, zona.raio);
        zona.label.setColor("#00ff88");
        this.tweens.add({ targets: zona.g, alpha: 0.3, duration: 150, yoyo: true, repeat: 2 });

        obj.disableInteractive();

        // Atualiza o frame da rede de acordo com quantas entradas ja foram ligadas.
        const spriteAlvo = spritesPorDeposito[this.mgEntradaAtivadas - 1];
        this.mgRede.setFrame(spriteAlvo);

        if (this.mgEntradaAtivadas >= 3) {
          this.input.off("drag");
          this.input.off("dragend");
          this.time.delayedCall(600, () => this._mg_fase1_concluida());
        }

      } else {
        // Se o jogador errar, o binario volta para a origem e a zona pisca em vermelho.
        this.tweens.add({ targets: obj, x: bin.oriX, y: bin.oriY, duration: 220, ease: "Sine.easeOut" });

        zona.g.clear();
        zona.g.lineStyle(2, 0xff3333, 0.8);
        zona.g.strokeCircle(zona.x, zona.y, zona.raio);
        this.time.delayedCall(400, () => {
          if (!zona.ativo) {
            zona.g.clear();
            zona.g.lineStyle(2, 0x00ffff, 0.55);
            zona.g.strokeCircle(zona.x, zona.y, zona.raio);
          }
        });
      }
    });
  }

  _mg_fase1_concluida() {
    // Limpa os elementos da fase 1 antes de abrir a etapa seguinte.
    this.mgBinarios.forEach(b => b.img.destroy());
    this.mgZonasFase1.forEach(z => { z.g.destroy(); z.label.destroy(); });
    this.mgRede.setFrame(3);

    this._mgDialogo(
      "Isso! As informações entraram! Sabe quando você ouve uma música e reconhece a melodia? Seus neurônios de entrada captaram o som primeiro. Os meus acabaram de captar os dados das portas! Agora precisamos acender o miolo, a parte que pensa de verdade. Clique em todos os 12 neurônios centrais!",
      "Asimov",
      () => this._mg_fase2_interativo()
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FASE 2 — Clicar nos 12 neurônios
  // ═══════════════════════════════════════════════════════════════════════════
  _mg_framePorNeuronioDenso(indice) {
    const framesPorNeuronio = [4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
    return framesPorNeuronio[indice] ?? 16;
  }

  _mg_limparInteracoesDensa() {
    if (!this.mgBtnsDensa) return;

    this.mgBtnsDensa.forEach((botao) => {
      if (botao.g) botao.g.destroy();
      if (botao.zona) botao.zona.destroy();
    });

    this.mgBtnsDensa = [];
  }

  _mg_fase2_interativo() {
    // Etapa 2: ativar manualmente os 12 neuronios das camadas centrais.
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;

    this.mgRede.setFrame(3);
    this.mgDensaAtivados = 0;

    const escala = this._escalaRede(cameraWidth, cameraHeight);
    const redeCX = cameraWidth / 2;
    const redeCY = cameraHeight / 2.35;

    const densaX1 = redeCX - 320 * escala * 0.128;
    const densaX2 = redeCX + 320 * escala * 0.11;

    const topOffset = 320 * escala * 0.30;
    const botOffset = 320 * escala * 0.30;
    const neuroniosPorColuna = 6;
    const densaYs = Array.from({ length: neuroniosPorColuna }, (_, i) => {
      return redeCY - topOffset + (topOffset + botOffset) * (i / (neuroniosPorColuna - 1));
    });

    const raio = 14 * escala;
    this.mgBtnsDensa = [];
    this.mgIndiceDensoAtual = 0;
    let indiceNeuronio = 0;

    const atualizarOrdemDensa = () => {
      this.mgBtnsDensa.forEach((botao, indice) => {
        if (botao.zona.ativado) return;

        botao.g.clear();
        if (indice === this.mgIndiceDensoAtual) {
          botao.g.lineStyle(3, 0xffff66, 0.95);
          botao.zona.setInteractive();
        } else {
          botao.g.lineStyle(2, 0x00ffff, 0.25);
          botao.zona.disableInteractive();
        }
        botao.g.strokeCircle(botao.xPos, botao.dy, raio);
      });
    };

    // Helper que cria uma coluna de 6 neuronios clicaveis.
    const criarNeuronios = (xPos) => {
      densaYs.forEach((dy) => {
        const indiceAtual = indiceNeuronio;
        const g = this.add.graphics().setDepth(2015);
        g.lineStyle(2, 0x00ffff, 0.45);
        g.strokeCircle(xPos, dy, raio);
        this.cameras.main.ignore(g);

        const zona = this.add.zone(xPos, dy, raio * 2.6, raio * 2.6)
          .setDepth(2016).setInteractive();
        this.cameras.main.ignore(zona);
        if (indiceAtual !== 0) zona.disableInteractive();

        zona.once("pointerdown", () => {
          // once() garante que cada neuronio so conte uma unica vez.
          if (zona.ativado || indiceAtual !== this.mgIndiceDensoAtual) return;
          zona.ativado = true;
          this.mgDensaAtivados++;
          this.mgRede.setFrame(this._mg_framePorNeuronioDenso(indiceAtual));

          g.clear();
          g.fillStyle(0x00ffff, 0.3);
          g.lineStyle(3, 0x00ffff, 1);
          g.fillCircle(xPos, dy, raio);
          g.strokeCircle(xPos, dy, raio);
          this.tweens.add({ targets: g, alpha: 0.35, duration: 180, yoyo: true, repeat: 2 });
          zona.disableInteractive();
          this.mgIndiceDensoAtual++;
          atualizarOrdemDensa();

          if (this.mgDensaAtivados >= neuroniosPorColuna * 2) {
            this.mgBtnsDensa.forEach(b => b.zona.disableInteractive());
            this.time.delayedCall(500, () => this._mg_fase2_concluida());
          }
        });

        this.mgBtnsDensa.push({ g, zona, xPos, dy });
        indiceNeuronio++;
      });
    };

    criarNeuronios(densaX1);
    criarNeuronios(densaX2);
    atualizarOrdemDensa();
  }

  _mg_fase2_concluida() {
    // Encerrada a parte manual, o Asimov explica a ideia de treinamento.
    this._mg_limparInteracoesDensa();
    this.mgRede.setFrame(16);

    this._mgDialogo(
      "Todos os neurônios do miolo estão recebendo as informações! É igualzinho ao seu cérebro quando você estuda: cada vez que você pratica algo, as conexões entre seus neurônios ficam mais fortes. Agora vou usar esses neurônios para aprender com os dados vou errar, corrigir e melhorar várias vezes. Isso se chama treinamento!",
      "Asimov",
      () => this._mg_fase3_epocas()
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FASE 3 — Treinamento
  // ═══════════════════════════════════════════════════════════════════════════
  _mg_fase3_epocas() {
    // Etapa 3: a rede "treina sozinha" em varias epocas consecutivas.
    this._mg_limparInteracoesDensa();

    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;

    this.mgTextoEpoca = this.add.text(cameraWidth / 2, cameraHeight * 0.06, "Época: 0 / 10", {
      fontSize: "18px", fontFamily: "'Courier New', Courier, monospace",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(2025).setAlpha(0);
    this.cameras.main.ignore(this.mgTextoEpoca);
    this.tweens.add({ targets: this.mgTextoEpoca, alpha: 1, duration: 300 });

    const totalEpocas = 10;
    const frameInicio = 4;
    const frameFim    = 16;
    const totalFrames = frameFim - frameInicio + 1;
    const msPorFrame  = 80;

    let epocaAtual = 0;
    let frameLocal = 0;

    // Cada tick avanca um frame; ao completar o ciclo, conta uma epoca.
    const tick = () => {
      this.mgRede.setFrame(frameInicio + frameLocal);
      frameLocal++;

      if (frameLocal >= totalFrames) {
        frameLocal = 0;
        epocaAtual++;
        this.mgTextoEpoca.setText(`Época: ${epocaAtual} / ${totalEpocas}`);
        if (epocaAtual >= totalEpocas) {
          this.time.delayedCall(300, () => this._mg_fase3_resultado());
          return;
        }
      }

      this.time.delayedCall(msPorFrame, tick);
    };

    this.time.delayedCall(300, tick);
  }

  _mg_fase3_resultado() {
    // O frame 18 representa o estado em que algo deu errado na saida da rede.
    this.mgRede.anims.stop();
    this.mgRede.setFrame(18);

    if (this.mgTextoEpoca) {
      this.tweens.add({
        targets: this.mgTextoEpoca, alpha: 0, duration: 300,
        onComplete: () => { if (this.mgTextoEpoca) this.mgTextoEpoca.destroy(); },
      });
    }

    this._mgDialogo(
      "Hmm… treinei bastante, mas tem algo errado na saída. Sabe quando você estuda muito mas na hora da prova trava? Comigo aconteceu algo parecido o fluxo do meu pensamento está desregulado. Tem uma válvula que controla isso. Você consegue girá-la pra mim?",
      "Asimov",
      () => this._mg_valvula()
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  VÁLVULA
  // ═══════════════════════════════════════════════════════════════════════════
  _mg_valvula() {
    // Mini desafio extra: girar a valvula para "destravar" a rede.
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;

    this.tweens.add({
      targets: this.mgRede, alpha: 0, duration: 350,
      onComplete: () => this.mgRede.setVisible(false),
    });

    const escalaValvula = Math.min((cameraWidth * 0.55) / 160, (cameraHeight * 0.55) / 160);

    this.mgValvula = this.add.sprite(cameraWidth / 2, cameraHeight / 2, "valvula")
      .setDepth(2030).setScale(escalaValvula).setFrame(0).setAlpha(0).setInteractive();
    this.cameras.main.ignore(this.mgValvula);
    this.tweens.add({ targets: this.mgValvula, alpha: 1, duration: 350 });

    this.mgTextoValvula = this.add.text(cameraWidth / 2, cameraHeight * 0.88, "Clique na válvula para girar!", {
      fontSize: "16px", fontFamily: "'Courier New', Courier, monospace",
      color: "#ffff00", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(2031).setAlpha(0);
    this.cameras.main.ignore(this.mgTextoValvula);
    this.tweens.add({ targets: this.mgTextoValvula, alpha: 1, duration: 400 });

    this.tweenValvulaTexto = this.tweens.add({
      targets: this.mgTextoValvula, alpha: 0.15, duration: 650, yoyo: true, repeat: -1,
    });

    // O clique dispara a animacao da valvula frame a frame.
    this.mgValvula.once("pointerdown", () => {
      if (this.tweenValvulaTexto) this.tweenValvulaTexto.stop();
      this.mgTextoValvula.setAlpha(0.6).setText("Girando…");

      const msPorFrameValvula  = 200;
      const totalFramesValvula = 4;
      let fv = 0;

      const girar = () => {
        fv++;
        if (fv < totalFramesValvula) {
          this.mgValvula.setFrame(fv);
          this.time.delayedCall(msPorFrameValvula, girar);
        } else {
          this.time.delayedCall(400, () => this._mg_valvula_concluida());
        }
      };
      this.time.delayedCall(msPorFrameValvula, girar);
    });
  }

  _mg_valvula_concluida() {
    // Apos a valvula, a rede reaparece no estado corrigido.
    this.tweens.add({
      targets: [this.mgValvula, this.mgTextoValvula], alpha: 0, duration: 350,
      onComplete: () => {
        this.mgValvula.destroy();
        this.mgTextoValvula.destroy();
        this.mgRede.setFrame(20);
        this.mgRede.setAlpha(0).setVisible(true);
        this.tweens.add({
          targets: this.mgRede, alpha: 1, duration: 400,
          onComplete: () => this._mg_dialogo_final(),
        });
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  DIÁLOGO FINAL DO MINIGAME
  // ═══════════════════════════════════════════════════════════════════════════
  _mg_dialogo_final() {
    // Fecha a narrativa do mini game antes de devolver o jogador ao mapa.
    this._mgDialogo(
      "FUNCIONOU! Olha só o neurônio de saída correto acendeu! Meu cérebro aprendeu qual porta é a certa. Vamos, Sophia eu sei o caminho!",
      "Asimov",
      () => this._mg_encerrar()
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ENCERRAR MINIGAME
  // ═══════════════════════════════════════════════════════════════════════════
  _mg_encerrar() {
    // Garante que nenhum listener de E do minigame sobrou
    if (this.mgListenerE) {
      this.teclaE.off("down", this.mgListenerE);
      this.mgListenerE = null;
    }

    this._mg_limparInteracoesDensa();

    // Limpa a interface criada exclusivamente para o mini game.
    this.mgOverlay.destroy();
    this.mgRede.destroy();
    this.mgTextoE.destroy();
    if (this.mgBrilho) this.mgBrilho.destroy();

    // Volta para música padrão
    if (this.musicFases) {
      this.musicFases.stop();
    }
    this.scene.launch("bgMusic");

    // Revela o baú com brilho pulsante
    // O bau passa a existir de fato na cena e ganha destaque visual.
    this.bauAnimado.setVisible(true);
    this.bauAnimado.setAlpha(1);
    this.bauAnimado.body.enable = true;
    this.bauAnimado.refreshBody();

    this.tweenBauBrilho = this.tweens.add({
      targets:  this.bauAnimado,
      alpha:    { from: 0.4, to: 1 },
      duration: 400,
      yoyo:     true,
      repeat:   -1,
      ease:     "Sine.easeInOut",
      onUpdate: () => {
        this.bauAnimado.setTint(
          this.bauAnimado.alpha > 0.75 ? 0xffdd88 : 0xffffff
        );
      },
    });

    // miniGameAtivo permanece true até o fim da cutscene
    this.time.delayedCall(250, () => this._cutscene_dialogo_asimov(() => this._cutscene_bau_fade()));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CUTSCENE — Asimov para 100px acima do baú; Sophia segue ao lado
  // ═══════════════════════════════════════════════════════════════════════════
  _cutscene_bau_fade() {
    // Versao usada hoje: escurece a tela, reposiciona personagens e revela o bau.
    const bauX = this.bauAnimado.x;
    const bauY = this.bauAnimado.y;

    const asimovDestinoFinalX = bauX + this.cutsceneBauAsimovOffsetX;
    const asimovDestinoFinalY = this.cutsceneBauAsimovMoverApenasNoX
      ? this.asimov.y + this.cutsceneBauAsimovOffsetY
      : bauY + this.cutsceneBauAsimovOffsetY;
    const sophiaDestinoFinalX = asimovDestinoFinalX + this.cutsceneBauSophiaOffsetX;
    const sophiaDestinoFinalY = asimovDestinoFinalY + this.cutsceneBauSophiaOffsetY;

    // Overlay preto fixo na camera para a troca de enquadramento da cutscene.
    const fadePreto = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0
    )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(4500);

    this.sophia.setVelocity(0, 0);
    this.sophia.anims.stop();
    this.asimov.anims.stop();

    this.tweens.add({
      targets: fadePreto,
      alpha: 1,
      duration: this.cutsceneBauDuracaoFade,
      onComplete: () => {
        // Reposiciona tudo enquanto a tela esta completamente preta.
        this.asimov.setPosition(asimovDestinoFinalX, asimovDestinoFinalY);
        this.sophia.setPosition(sophiaDestinoFinalX, sophiaDestinoFinalY);
        this.asimov.setFrame(0).setFlipX(false);
        this.sophia.setFrame(0);

        this.cameras.main.centerOn(bauX, bauY);

        this.time.delayedCall(this.cutsceneBauTempoTelaPreta, () => {
          this.tweens.add({
            targets: fadePreto,
            alpha: 0,
            duration: this.cutsceneBauDuracaoFade,
            onComplete: () => {
              fadePreto.destroy();
              if (this.tweenBauBrilho) {
                this.tweenBauBrilho.stop();
                this.tweenBauBrilho = null;
              }
              this.bauAnimado.setAlpha(1).clearTint();
              this.miniGameAtivo = false;
              this.bauLiberadoParaSophia = true;
            },
          });
        });
      },
    });
  }

  _cutscene_bau() {
    // Metodo antigo da cutscene, mantido como referencia.
    // Hoje a cena usa _cutscene_bau_fade() para ter um resultado mais previsivel.
    const bauX = this.bauAnimado.x;
    const bauY = this.bauAnimado.y;

    const asimovDestX = bauX + this.cutsceneBauAsimovOffsetX;
    const asimovDestY = bauY - 100;   // 100px acima do baú (fora da porta)
    const asimovDestinoFinalY = this.cutsceneBauAsimovMoverApenasNoX
      ? this.asimov.y + this.cutsceneBauAsimovOffsetY
      : bauY + this.cutsceneBauAsimovOffsetY;
    const sophiaDestinoFinalX = asimovDestX + this.cutsceneBauSophiaOffsetX;
    const sophiaDestinoFinalY = asimovDestinoFinalY + this.cutsceneBauSophiaOffsetY;

    // ── Asimov ────────────────────────────────────────────────────────────────
    this._moverSpriteComAnimacao(
      this.asimov,
      asimovDestX,
      asimovDestinoFinalY,
      this.cutsceneBauVelocidade
    );

    this.time.delayedCall(this.cutsceneBauSophiaDelay, () => {
      this._moverSpriteComAnimacao(
        this.sophia,
        sophiaDestinoFinalX,
        sophiaDestinoFinalY,
        this.cutsceneBauVelocidade,
        () => {
          this.time.delayedCall(300, () => this._cutscene_dialogo_asimov());
        },
      );
    });

    // O bloco abaixo ficou como rascunho antigo e nao executa por causa deste return.
    return;

    if (Math.abs(dxA) >= Math.abs(dyA)) {
      this.asimov.setFlipX(dxA < 0);
      this.asimov.anims.play("asimov_side", true);
    } else {
      this.asimov.anims.play(dyA < 0 ? "asimov_back" : "asimov_front", true);
    }

    this.tweens.add({
      targets: this.asimov, x: asimovDestX, y: asimovDestY,
      duration: durA, ease: "Linear",
      onComplete: () => { this.asimov.anims.stop(); this.asimov.setFrame(0); this.asimov.setFlipX(false); },
    });

    // ── Sophia segue com delay ────────────────────────────────────────────────
    const distS = Phaser.Math.Distance.Between(this.sophia.x, this.sophia.y, sophiaDestX, sophiaDestY);
    const durS  = Math.max((distS / vel) * 1000, 50);
    const dxS   = sophiaDestX - this.sophia.x;
    const dyS   = sophiaDestY - this.sophia.y;

    this.time.delayedCall(200, () => {
      if (Math.abs(dxS) >= Math.abs(dyS)) {
        this.sophia.anims.play(dxS < 0 ? "sophia-left" : "sophia-right", true);
      } else {
        this.sophia.anims.play(dyS < 0 ? "sophia-back" : "sophia-front", true);
      }

      this.tweens.add({
        targets: this.sophia, x: sophiaDestX, y: sophiaDestY,
        duration: durS, ease: "Linear",
        onComplete: () => {
          this.sophia.anims.stop();
          this.sophia.setFrame(0);
          this.time.delayedCall(300, () => this._cutscene_dialogo_asimov());
        },
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CUTSCENE — Asimov fala; libera Sophia para ir ao baú
  // ═══════════════════════════════════════════════════════════════════════════
  _cutscene_dialogo_asimov(aoConcluir) {
    // Reaproveita o dialogo do mini game para nao depender do update.
    // Usa _mgDialogo (tem listener próprio, não interfere no update)
    this._mgDialogo(
      "Sophia, agora eu sei qual é a porta correta. A pista que precisamos está naquele baú na sala ao lado. Vá até ele que estamos no caminho certo.",
      "Asimov",
      () => {
        if (aoConcluir) aoConcluir();
      }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  INTERAÇÃO COM O BAÚ — Sophia abre e vai pra fase 3
  // ═══════════════════════════════════════════════════════════════════════════
  _cutscene_interagir_bau() {
    // Interacao final: Sophia abre o bau, le a pista e a fase termina.
    this.bauInteragido = true;
    this.miniGameAtivo = true;
    this.sophia.setVelocity(0, 0);
    this.bauAnimado.play("abrindo");

    this.time.delayedCall(1000, () => {
      // A fala do bau fica aberta ate o jogador confirmar com E.
      this.mostrarMensagem("Achei imagens de cristais...", "Sophia");

      this.fecharMensagemOverride = () => {
        if (this.timerEscrever && this.timerEscrever.getProgress() < 1) {
          this.timerEscrever.remove();
          this.textoDialogo.setText(this.textoAtualArmazenado);
          return;
        }

        this.fecharMensagemOverride = null;
        this.lendoMensagem = false;
        this.caixaDialogo.setVisible(false);
        this.textoDialogo.setVisible(false).setText("");
        this.labelNome.setVisible(false);
        this.indicadorDialogoE.esconder();
        this._transicao_para_chaocaindo();
      };
    });
  }

  _transicao_para_chaocaindo() {
    // Faz o fechamento cinematografico da fase antes de trocar de cena.
    const overlay = this.add.rectangle(0, 0, 1920, 1080, 0x000000, 0)
      .setOrigin(0, 0)
      .setDepth(5000)
      .setScrollFactor(0);

    this.containerTeclaAsimov.setVisible(false);
    this.cameras.main.stopFollow();

    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.zoomTransicaoBauFaseDois,
      duration: 900,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: this.cameras.main,
      scrollX: this.bauAnimado.x - this.cameras.main.width / 6,
      scrollY: this.bauAnimado.y - this.cameras.main.height / 3,
      duration: 900,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 900,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.scene.start("FaseDoischao");
      },
    });
  }
}
