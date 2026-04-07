import caixasDialogo from './caixasDialogo.js';

export class sceneInicial extends Phaser.Scene {
    constructor() {
        super("sceneInicial");
    }

    preload() {
        this.load.image("labBranco", "assets/Fases/sceneLBPassado/labBranco.png");
        this.load.image("objetosLab", "assets/Objetos/sceneLBPassado/partOne/objetosLabBNorm.png");
        this.load.spritesheet("watson", "assets/personagens/watson.png", {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet("sophia", "assets/personagens/sophia.png", {
            frameWidth: 64,
            frameHeight: 64,
        });
    }

    create() {
        // Instanciado corretamente com um nome padrão para evitar confusões
        this.sistemaDialogo = new caixasDialogo(this);
        this.lendoMensagem = false;

        this.cameras.main.fadeIn(400, 0, 0, 0);

        const larguraJogo = this.cameras.main.width;
        const alturaJogo = this.cameras.main.height;

        this.scaleMapa = 4;

        this.mapa = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "labBranco").setScale(this.scaleMapa).setDepth(-1);
        this.objetos = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "objetosLab").setScale(this.scaleMapa).setDepth(-1);

        let escurecerFundo = this.add.rectangle(0, 0, larguraJogo, alturaJogo, 0x000000);
        escurecerFundo.setOrigin(0, 0).setAlpha(0.9).setDepth(-1);

        // Personagens posicionados (vão aparecer assim que a câmera abrir)
        this.watson = this.add.sprite(larguraJogo - 300, alturaJogo - 250, "watson").setScale(20).setVisible(false);
        this.sophia = this.add.sprite(300, alturaJogo - 250, "sophia").setScale(18).setFlipX(true).setVisible(false);

        this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // diálogos
        this.dialogos = [
            { nome: "Watson", personagem: this.watson, texto: "Sophia, os resultados finais das simulações foram liberados para toda equipe." },
            { nome: "Watson", personagem: this.watson, texto: "Minha preocupação em relação ao uso da tecnologia no futuro apenas aumenta e os testes expuseram a probabilidade crescente de grande uso indevido de tecnologias atuais e emergentes." },
            { nome: "Watson", personagem: this.watson, texto: "Temo que no futuro os humanos possam ficar dependentes de algo maior ou até pior que isso…" },
            { nome: "Watson", personagem: this.watson, texto: "Assim, preciso lhe pedir algo, eu e uma equipe montamos um projeto para que, caso haja uma crise tecnológica no futuro, teremos alguém preparado para consertar o problema." },
            { nome: "Watson", personagem: this.watson, texto: "Deixaremos alguém congelado em uma câmara e, quando e se for necessário, essa pessoa será liberada para ajudar no que for necessário." },
            { nome: "Watson", personagem: this.watson, texto: "Nós pensamos que para esse projeto ninguém seria melhor do que você, mas claro, apenas se você aceitar nossa proposta…" },
            { nome: "Sophia", personagem: this.sophia, texto: "Não sabemos o que pode acontecer no futuro… Mas estarei preparada e aceito fazer parte dessa missão." },
            { nome: "Watson", personagem: this.watson, texto: "Ótimo, então vamos nos reunir com o resto da equipe, ainda temos muitas coisas para planejar." }
        ];

        // Assim que a tela terminar de clarear, inicia a cutscene
        this.cameras.main.once("camerafadeincomplete", () => {
            // Deixa os personagens visíveis
            this.watson.setVisible(true);
            this.sophia.setVisible(true);
            
            this.lendoMensagem = true;

            // Inicia o diálogo
            this.sistemaDialogo.iniciarDialogo(this.dialogos, () => {
                // O que acontece quando o diálogo acabar
                this.lendoMensagem = false;
                this.finalizarCena(); // Corrigido para C maiúsculo
            });
        });
    }

    update() {
        // No update, a tecla E serve APENAS para interagir (avançar), não para iniciar
        if (this.lendoMensagem && Phaser.Input.Keyboard.JustDown(this.teclaE)) {
            this.sistemaDialogo.interagir();
        }
    }

    finalizarCena() {
        if (this.cenaFinalizando) return;
        this.cenaFinalizando = true;

        this.sophia.destroy();
        this.watson.destroy();

        this.cameras.main.fadeOut(1000);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("sceneLBPassado");
        });
    }
}
