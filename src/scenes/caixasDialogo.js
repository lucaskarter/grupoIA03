import { HudTeclaE } from "./hudTeclaE.js";

export default class CaixaDialogo {
    constructor(scene) {
        this.scene = scene;
        
        const larguraJogo = scene.scale.width;
        const alturaJogo = scene.scale.height;

        const larguraCaixa = 1300;
        const alturaCaixa = 220; // Ajustei para o tamanho da sua cena
        const xCaixa = (larguraJogo - larguraCaixa) / 2;
        const yCaixa = alturaJogo - alturaCaixa - 50;

        // --- ELEMENTOS VISUAIS ---
        this.caixaDialogo = scene.add.graphics();
        this.caixaDialogo.fillStyle(0x1a1a1a, 0.9);
        this.caixaDialogo.lineStyle(2, 0x00ffff, 1);
        this.caixaDialogo.fillRoundedRect(xCaixa, yCaixa, larguraCaixa, alturaCaixa, 15);
        this.caixaDialogo.strokeRoundedRect(xCaixa, yCaixa, larguraCaixa, alturaCaixa, 15);
        this.caixaDialogo.setScrollFactor(0).setDepth(1000).setVisible(false);

        this.textoDialogo = scene.add.text(xCaixa + 40, yCaixa + 30, "", {
            fontSize: "32px",
            fontFamily: "'Courier New', Courier, monospace",
            color: "#ccffff",
            wordWrap: { width: larguraCaixa - 80 },
            lineSpacing: 10,
        }).setScrollFactor(0).setDepth(1001).setVisible(false);

        this.labelNome = scene.add.text(xCaixa + 16, yCaixa - 28, "", {
            fontSize: "32px",
            fontFamily: "'Courier New', Courier, monospace",
            color: "#00ffff",
            fontStyle: "bold",
            backgroundColor: "#1a1a1a",
            padding: { left: 8, right: 8, top: 3, bottom: 3 },
        }).setScrollFactor(0).setDepth(1002).setVisible(false);

        this.indicadorTeclaE = new HudTeclaE(scene, {
            x: xCaixa + larguraCaixa - 70,
            y: yCaixa + alturaCaixa - 32,
            depth: 1003,
        });

        // --- ESTADOS DO GERENCIADOR ---
        this.falas = [];
        this.indiceDialogo = 0;
        this.textoAtualArmazenado = "";
        this.timerEscrever = null;
        this.estaEscrevendo = false;
        this.callbackFimDialogo = null;

        // Vincula o escopo do clique para não dar erro
        this.interagir = this.interagir.bind(this);
    }

    // AQUI ESTÁ A FUNÇÃO QUE ESTAVA FALTANDO!
    iniciarDialogo(listaDeFalas, callbackFim) {
        this.falas = listaDeFalas;
        this.indiceDialogo = 0;
        this.callbackFimDialogo = callbackFim;
        
        this.caixaDialogo.setVisible(true);
        this.textoDialogo.setVisible(true);
        this.labelNome.setVisible(true);
        this.indicadorTeclaE.mostrar();

        // Se quiser que pule falas clicando com o mouse também, descomente a linha abaixo:
        // this.scene.input.on('pointerdown', this.interagir);

        this.mostrarProximaFala();
    }

    mostrarProximaFala() {
        let falaAtual = this.falas[this.indiceDialogo];
        let textoCompleto = falaAtual.texto;
        let nome = falaAtual.nome;

        this.textoDialogo.setText("");
        
        if (nome && nome.trim() !== "") {
            this.labelNome.setText(nome);
            this.labelNome.setVisible(true);
        } else {
            this.labelNome.setVisible(false);
        }

        this.textoAtualArmazenado = textoCompleto;
        this.estaEscrevendo = true;

        this.destacarPersonagemFalando(falaAtual.personagem);

        let letraAtual = 0;
        if (this.timerEscrever) this.timerEscrever.remove();

        this.timerEscrever = this.scene.time.addEvent({
            delay: 30,
            callback: () => {
                if (letraAtual < textoCompleto.length) {
                    this.textoDialogo.text += textoCompleto[letraAtual];
                    letraAtual++;
                } else {
                    this.estaEscrevendo = false;
                }
            },
            repeat: textoCompleto.length - 1,
        });
    }

    destacarPersonagemFalando(personagemFalando) {
        const todosPersonagens = new Set();
        this.falas.forEach(fala => {
            if (fala.personagem) todosPersonagens.add(fala.personagem);
        });

        // Escurece todos
        todosPersonagens.forEach(p => p.setTint(0x888888));

        // Ilumina apenas o que está falando
        if (personagemFalando) {
            personagemFalando.clearTint();
        }
    }

    interagir() {
        if (this.estaEscrevendo && this.timerEscrever) {
            this.timerEscrever.remove();
            this.textoDialogo.setText(this.textoAtualArmazenado);
            this.estaEscrevendo = false;
            return;
        }

        this.indiceDialogo++;

        if (this.indiceDialogo < this.falas.length) {
            this.mostrarProximaFala();
        } else {
            this.encerrarDialogo();
        }
    }

    encerrarDialogo() {
        this.caixaDialogo.setVisible(false);
        this.textoDialogo.setVisible(false);
        this.labelNome.setVisible(false);
        this.indicadorTeclaE.esconder();

        this.falas.forEach(fala => {
            if (fala.personagem) fala.personagem.clearTint();
        });

        // this.scene.input.off('pointerdown', this.interagir);

        if (this.callbackFimDialogo) {
            this.callbackFimDialogo();
        }
    }
}
