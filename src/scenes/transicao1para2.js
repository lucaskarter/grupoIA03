// =============================================================================
// CENA DE TRANSIÇÃO: transicao1para2
// Propósito: Exibir a cutscene final do laboratório destruído e redirecionar
//            o jogador para a cena "FaseDois".
// - O mapa e toda a decoração permanecem visíveis (sem interação nem colisão).
// - Não há exploração livre: o jogador apenas assiste à cutscene.
// - A tecla E avança o diálogo.
// =============================================================================
import { registrarTeclaMenu } from '../menu.js';
import { movimentacaoSophia } from './movimentacao.js';
import { SnowEffect } from './efeitoNeve.js';
import caixasDialogo from './caixasDialogo.js';

export class transicao1para2 extends Phaser.Scene {
    constructor() {
        super("transicao1para2");
    }

    preload() {
        // Mapa de fundo
        this.load.image("labDestruido", "assets/fases/sceneLBPassado/labDestruido.png");

        // Spritesheets dos personagens
        this.load.spritesheet("sophia", "assets/personagens/sophia.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("asimov", "assets/personagens/asimov.png", { frameWidth: 32, frameHeight: 32 });

        // Objetos decorativos do cenário
        this.load.image("armarioD",      "assets/objetos/sceneLBPassado/partTwo/armarioDestruido.png");
        this.load.image("alvoD",         "assets/objetos/sceneLBPassado/partTwo/alvoDestruido.png");
        this.load.image("mesa1D",        "assets/objetos/sceneLBPassado/partTwo/mesa1Destruida.png");
        this.load.image("mesa2D",        "assets/objetos/sceneLBPassado/partTwo/mesa2Destruida.png");
        this.load.image("mesa3D",        "assets/objetos/sceneLBPassado/partTwo/mesa3Destruida.png");
        this.load.image("piaD",          "assets/objetos/sceneLBPassado/partTwo/piaDestruida.png");
        this.load.image("reservasCrioD", "assets/objetos/sceneLBPassado/partTwo/reservasCrioDestruidas.png");
        this.load.image("comptCimaD",    "assets/objetos/sceneLBPassado/partTwo/comptCimaDestruido.png");
        this.load.image("comptBaixoD",   "assets/objetos/sceneLBPassado/partTwo/comptBaixoDestruido.png");
        this.load.image("criogeniaD",    "assets/objetos/sceneLBPassado/partTwo/criogeniaDestruida.png");
        this.load.image("camara",        "assets/objetos/sceneLBPassado/partOne/camara.png");
    }

    create() {
        registrarTeclaMenu(this);
        
        // Instancia o Gerenciador de Diálogos
        this.sistemaDialogo = new caixasDialogo(this);

        let gifElemento3 = document.createElement('img');
            gifElemento3.src = 'assets/TextosCenas/RetornoLab.gif';
        
            // Forçando estilos CSS para garantir que ele apareça
            gifElemento3.style.width = '1920px'; // Coloque a largura aproximada do seu GIF
            gifElemento3.style.height = '1080px';
            //gifElement.style.display = 'block';
            //gifElement.style.border = '2px solid red'; // Descomente para debugar: se a borda vermelha aparecer, o HTML está funcionando, mas o caminho do arquivo pode estar errado.
        
            let domElemento3 = this.add.dom( 1550, 0 , gifElemento3).setOrigin(0.8).setScrollFactor(0);
            const duracaoDoGif = 5000; 
            // O Phaser espera esse tempo passar e executa a função interna
            this.time.delayedCall(duracaoDoGif, () => {
                // Verifica se o elemento ainda existe na cena
                if (domElemento3 && domElemento3.active) {
                    // Esconde o GIF para ele não aparecer rodando de novo
                    domElemento3.setVisible(false); 
                    domElemento3.destroy(); 
                }
            });

        this.scene.launch("bgMusic");

        const w = this.scale.width;
        const h = this.scale.height;

        this.gamePhase      = "cutscene";
        this.isDialogueOpen = false;

        this.mapa = this.add.image(w / 2, h / 2, "labDestruido").setScale(3);
        new SnowEffect(this, { depth: -2 });

        this.criarDecoracao();

        this.sophia = this.physics.add.sprite(this.mapa.x, this.mapa.y - 300, "sophia")
            .setScale(2)
            .setDepth(12);
        this.sophia.body.setAllowGravity(false);
        this.sophia.setCollideWorldBounds(true);
        this.sophia.setSize(30, 25);
        this.sophia.setOffset(15, 30);

        this.asimov = this.physics.add.sprite(this.mapa.x, this.mapa.y + 200, "asimov")
            .setScale(3)
            .setDepth(12);
        this.asimov.body.setAllowGravity(false);
        this.asimov.setCollideWorldBounds(true);
        this.asimov.setSize(15, 12);
        this.asimov.setOffset(8, 16);

        this.createCharacterAnimations();

        this.sophia.play("sophia-idle-down");
        this.asimov.play("asimov-idle-right");

        this.cameras.main.setBounds(0, 0, w, h);
        this.cameras.main.startFollow(this.sophia);
        this.cameras.main.fadeIn(1000);

        this.keys = this.input.keyboard.addKeys({
            E: Phaser.Input.Keyboard.KeyCodes.E
        });

        this.startIntroCutscene();
    }

    criarDecoracao() {
        const decoracao = [
            { key: "mesa3D",        x: -410, y: -260, scale: 3.0  },
            { key: "mesa1D",        x: -257, y: -380, scale: 3.0  },
            { key: "mesa2D",        x:  258, y: -382, scale: 3.0  },
            { key: "mesa3D",        x:  393, y:  118, scale: 3.0  },
            { key: "piaD",          x: -397, y:   70, scale: 3.0  },
            { key: "criogeniaD",    x:    0, y: -394, scale: 3.0  },
            { key: "reservasCrioD", x:  423, y: -235, scale: 3.0  },
            { key: "armarioD",      x: -380, y: -390, scale: 3.25 },
            { key: "armarioD",      x:  380, y: -390, scale: 3.25 },
            { key: "alvoD",         x: -385, y: -125, scale: 3.0  },
            { key: "alvoD",         x:  365, y:  -25, scale: 3.1  },
            { key: "comptBaixoD",   x: -215, y: -140, scale: 3.0  },
            { key: "comptBaixoD",   x:  212, y: -140, scale: 3.0  },
            { key: "comptBaixoD",   x: -215, y:   50, scale: 3.0  },
            { key: "comptBaixoD",   x:  212, y:   50, scale: 3.0  },
            { key: "camara",        x:    0, y: -380, scale: 0.25 },
        ];

        decoracao.forEach((obj) => {
            const absX = this.mapa.x + obj.x;
            const absY = this.mapa.y + obj.y;

            this.add.image(absX, absY, obj.key)
                .setScale(obj.scale)
                .setDepth(11)       
                .setTint(0xaec0d1); 
        });
    }

    update() {
        if (this.sophia) this.sophia.setDepth(this.sophia.y);
        if (this.asimov) this.asimov.setDepth(this.asimov.y);

        if (this.gamePhase === "cutscene") {
            this.sophia.setVelocity(0, 0);
        }

        // Interação com o novo gerenciador usando a tecla E
        if (this.isDialogueOpen && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
            this.sistemaDialogo.interagir();
        }
    }

    startIntroCutscene() {
        // Nova formatação das falas
        const cutsceneDialogue = [
            { nome: "Sophia", personagem: this.sophia, texto: "Então, Asimov, como foi a missão?" },
            { nome: "Asimov", personagem: this.asimov, texto: "Obrigada pela ajuda, Sophia! Agora aprendi através da repetição de padrões e posso me movimentar sozinho." },
            { nome: "Asimov", personagem: this.asimov, texto: "Analisei os padrões do ambiente e agora consigo desviar de todos os obstáculos à minha frente." },
            { nome: "Asimov", personagem: this.asimov, texto: "Sophia, durante minha jornada de aprendizado, encontrei informações que podem nos ajudar à restaurar a energia do laboratório."},
            { nome: "Sophia", personagem: this.sophia, texto: "O que você encontrou?" },
            { nome: "Asimov", personagem: this.asimov, texto: "Encontrei um conjunto de números binários que nos ajudarão a localizar uma porta específica e nessa porta poderemos encontrar mais informações sobre o cristal!"},
            { nome: "Sophia", personagem: this.sophia, texto: "Perfeito. Obrigada pelas informações, Asimov.\nVamos continuar nossa missão." },
            { nome: "Asimov", personagem: this.asimov, texto: "Objetivo atualizado: encontrar a porta correta do laboratório." },
            { nome: "SISTEMA", personagem: null, texto: "Asimov conduziu Sophia até a Sala das Portas.\nA próxima etapa começa agora..." }
        ];

        this.playAnimIfNeeded(this.asimov, "asimov-walk-up");
        
        this.tweens.add({
            targets:  this.asimov,
            y:        this.sophia.y + 60,
            x:        this.sophia.x,
            duration: 6800,
            ease:     "Sine.inOut",
            onComplete: () => {
                this.updateAsimovAnimation(0, 0);
                
                // Abre o diálogo após o Tween do Asimov andar
                this.isDialogueOpen = true;
                this.sistemaDialogo.iniciarDialogo(cutsceneDialogue, () => {
                    this.isDialogueOpen = false; // Bloqueia a tecla E
                    
                    // Transição final para a Fase Dois
                    this.time.delayedCall(600, () => {
                        this.cameras.main.fadeOut(1200, 0, 0, 0);
                        this.cameras.main.once("camerafadeoutcomplete", () => {
                            this.scene.start("FaseDois");
                        });
                    });
                });
            }
        });
    }

    createCharacterAnimations() {
        if (!this.anims.exists("sophia-walk-down")) {
            this.anims.create({ key: "sophia-walk-down",  frames: this.anims.generateFrameNumbers("sophia", { start: 0,  end: 7  }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: "sophia-walk-up",    frames: this.anims.generateFrameNumbers("sophia", { start: 8,  end: 15 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: "sophia-walk-right", frames: this.anims.generateFrameNumbers("sophia", { start: 16, end: 21 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: "sophia-walk-left",  frames: this.anims.generateFrameNumbers("sophia", { start: 24, end: 29 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: "sophia-idle-down",  frames: [{ key: "sophia", frame: 0  }], frameRate: 1 });
            this.anims.create({ key: "sophia-idle-up",    frames: [{ key: "sophia", frame: 8  }], frameRate: 1 });
            this.anims.create({ key: "sophia-idle-right", frames: [{ key: "sophia", frame: 16 }], frameRate: 1 });
            this.anims.create({ key: "sophia-idle-left",  frames: [{ key: "sophia", frame: 24 }], frameRate: 1 });
        }

        if (!this.anims.exists("asimov-walk-down")) {
            this.anims.create({ key: "asimov-walk-down",  frames: this.anims.generateFrameNumbers("asimov", { start: 7,  end: 9  }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: "asimov-walk-up",    frames: this.anims.generateFrameNumbers("asimov", { start: 14, end: 16 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: "asimov-walk-right", frames: this.anims.generateFrameNumbers("asimov", { start: 28, end: 34 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: "asimov-walk-left",  frames: this.anims.generateFrameNumbers("asimov", { start: 21, end: 26 }), frameRate: 10, repeat: -1 });
            this.anims.create({ key: "asimov-idle-down",  frames: [{ key: "asimov", frame: 7  }], frameRate: 1 });
            this.anims.create({ key: "asimov-idle-up",    frames: [{ key: "asimov", frame: 14 }], frameRate: 1 });
            this.anims.create({ key: "asimov-idle-right", frames: [{ key: "asimov", frame: 28 }], frameRate: 1 });
            this.anims.create({ key: "asimov-idle-left",  frames: [{ key: "asimov", frame: 21 }], frameRate: 1 });
        }
    } 

    playAnimIfNeeded(sprite, key) {
        if (!sprite.anims.currentAnim || sprite.anims.currentAnim.key !== key) {
            sprite.play(key, true);
        }
    }

    updateAsimovAnimation(vx, vy) {
        if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) {
            const facing = this.asimovFacing || "right";
            this.playAnimIfNeeded(this.asimov, `asimov-idle-${facing}`);
            return;
        }
        if (Math.abs(vx) > Math.abs(vy)) {
            this.asimovFacing = vx > 0 ? "right" : "left";
        } else {
            this.asimovFacing = vy > 0 ? "down" : "up";
        }
        this.playAnimIfNeeded(this.asimov, `asimov-walk-${this.asimovFacing}`);
    }
}
