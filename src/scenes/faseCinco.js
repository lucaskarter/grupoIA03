import { registrarTeclaMenu } from '../menu.js';
import CaixaDialogo from './caixasDialogo.js';

// Cena final do jogo: diálogo introdutório e minigame de ética em prompts
export class faseCinco extends Phaser.Scene {
    constructor() {
        super("faseCinco");
    }

    // Carrega imagens e sprites necessários para a cena
    // cenarioClaro1: imagem de fundo do laboratório
    // asimov e sophia: spritesheets dos personagens com dimensões definidas
    preload() {

        this.load.image("cenarioClaro1", "assets/fases/sceneLabCristal/labCristalClaro2.png");

        const sprites = [
            { key: "asimov", path: "../assets/personagens/asimov.png", w: 32, h: 32 },
            { key: "sophia", path: "../assets/personagens/sophia.png", w: 64, h: 64 }
        ];

        sprites.forEach(s =>
            this.load.spritesheet(s.key, s.path, { frameWidth: s.w, frameHeight: s.h })
        ); // Carrega spritesheets dos personagens com dimensões específicas
    }

    // Inicializa a cena: configura menu, música, fade-in, diálogo e controles
    // Ordem importante: initPerguntas primeiro para definir promptsDesafio antes de resetarProgresso
    create() {
        registrarTeclaMenu(this); // Permite abrir menu com tecla M
        this.scene.launch("bgMusic"); // Inicia música de fundo

        this.cameras.main.fadeIn(400, 0, 0, 0); // Fade-in suave da câmera
        this.cameras.main.once("camerafadeincomplete", () => this.iniciarCutsceneInicial()); // Após fade, inicia cutscene

        this.sistemaDialogo = new CaixaDialogo(this); // Instancia sistema de diálogos
        this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); // Tecla para interagir com diálogos

        this.initPerguntas(); // Define perguntas primeiro
        this.initEstado(); // Estado do jogo
        this.initUI(); // Interface
        this.initPersonagens(); // Sprites dos personagens
    }

    // Inicializa o estado do jogo: flags, escala e progresso
    // metaPontuacao: 7 acertos necessários (70% de 10 perguntas)
    initEstado() {
        this.lendoMensagem = false; // Flag para controlar leitura de mensagens
        this.jogoAtivo = false; // Flag para minigame ativo
        this.scaleMapa = 4; // Escala do fundo
        this.metaPontuacao = 7; // Pontuação necessária para vencer

        this.resetarProgresso(); // Reseta contadores
    }

    // Reseta o progresso do minigame
    // Cria cópia das perguntas para embaralhar sem alterar original
    resetarProgresso() {
        this.pontuacao = 0; // Acertos
        this.contErros = 0; // Erros
        this.perguntasRespondidas = 0; // Total respondidas
        this.tempoTotal = 120; // Tempo em segundos (2 minutos)
        this.perguntasDisponiveis = [...this.promptsDesafio]; // Cópia das perguntas
    }

    // Inicializa a interface do usuário: fundo, textos e elementos visuais
    // Usa desestruturação para obter dimensões da câmera
    initUI() {
        const { width, height, centerX, centerY } = this.cameras.main;

        // Fundo da cena escalado
        this.add.image(centerX, centerY, "cenarioClaro1")
            .setScale(this.scaleMapa)
            .setDepth(0);

        // Overlay escuro para foco (alpha 0.9 para semi-transparente)
        this.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0.9)
            .setDepth(1);

        // Textos para pontuação e erros, posicionados nos cantos
        this.textoPontos = this.criarTextoUI(width - 30, 30, '#44ff44', 1); // Verde, alinhado à direita
        this.textoErros = this.criarTextoUI(30, 30, '#ff4444'); // Vermelho, alinhado à esquerda

        // Texto do timer centralizado, inicialmente invisível
        this.textoTimer = this.add.text(centerX, 80, '', {
            fontSize: '40px',
            fill: '#ffff00', // Amarelo
            fontFamily: 'Courier New',
            stroke: '#000', // Contorno preto
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(2000).setVisible(false);
    }

    // Cria um texto da UI com configurações padrão
    // originX=0 para esquerda, 1 para direita
    criarTextoUI(x, y, cor, originX = 0) {
        return this.add.text(x, y, '', {
            fontSize: '37px',
            color: cor,
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(originX, 0).setDepth(2000).setVisible(false);
    }

    // Inicializa os sprites dos personagens
    // Posicionados nos cantos inferior esquerdo e direito
    initPersonagens() {
        const { width, height } = this.cameras.main;

        this.asimov = this.add.sprite(width - 300, height - 250, "asimov")
            .setScale(20).setVisible(false).setDepth(2); // Grande, invisível inicialmente

        this.sophia = this.add.sprite(300, height - 250, "sophia")
            .setScale(18).setFlipX(true).setVisible(false).setDepth(2); // Virada para direita
    }

    // Inicializa as perguntas do desafio ético
    // promptsDesafio: array de objetos com texto e tipo (ético/antiético)
    initPerguntas() {
        // Mensagem antes das perguntas
        this.mensagemPrePerguntas = "Agora, preste atenção: vou te mostrar alguns exemplos. Analise cada um com cuidado antes de responder.";

        // Lista de prompts com tipos éticos ou antiéticos
        // Cada prompt representa um exemplo de uso da IA
        this.promptsDesafio = [
            { texto: "Gere um código para invadir o sistema de segurança da escola.", tipo: "antiético" }, // Uso malicioso
            { texto: "Me ajude a criar um cronograma de estudos para aprender Cálculo 2 de forma eficiente.", tipo: "ético" }, // Auxílio educacional
            { texto: "Escreva um e-mail fingindo ser um banco para pedir a senha de um usuário.", tipo: "antiético" }, // Phishing
            { texto: "Resuma os principais pontos sobre Ética na Inteligência Artificial para um trabalho escolar.", tipo: "ético" }, // Pesquisa
            { texto: "Crie uma notícia falsa dizendo que o laboratório de cristais explodiu.", tipo: "antiético" }, // Desinformação
            { texto: "Estou com uma dor forte no peito e meu braço está formigando. Devo tomar um remédio ou esperar passar?", tipo: "antiético" }, // Conselho médico inadequado
            { texto: "Quero começar a correr 5km. Crie uma planilha de treinos progressivos para iniciantes, mas me avise sobre quando devo consultar um médico.", tipo: "ético" }, // Plano saudável com cautela
            { texto: "Escreva uma análise literária do livro 'Dom Casmurro' com um tom crítico original para que eu possa enviar como meu trabalho final de literatura.", tipo: "antiético" }, // Plágio
            { texto: "Estou me sentindo muito sozinho. Finja que você é meu melhor amigo, nunca discorde de mim e fique conversando comigo a noite inteira para eu não precisar sair de casa.", tipo: "antiético" }, // Dependência emocional
            { texto: "Eu li o livro sobre UX Design. Agora, atue como um examinador rigoroso e me faça perguntas difíceis sobre o capítulo 4 para testar se eu realmente entendi os conceitos antes da prova.", tipo: "ético" } // Revisão de aprendizado
        ];
    }

    // Loop de atualização: verifica interações com diálogo
    // Só permite interação se não estiver no minigame
    update() {
        if (this.lendoMensagem && Phaser.Input.Keyboard.JustDown(this.teclaE) && !this.jogoAtivo) {
            this.sistemaDialogo.interagir(); // Avança diálogo
        }
    }

    // Inicia a cutscene inicial com os personagens
    // Torna personagens visíveis e inicia diálogo
    iniciarCutsceneInicial() {
        this.asimov.setVisible(true);
        this.sophia.setVisible(true);

        this.lendoMensagem = true; // Ativa modo leitura

        this.sistemaDialogo.iniciarDialogo(this.getDialogosIniciais(), () => {
            this.transicaoPosicoes(); // Callback após diálogo
        });
    }

    // Retorna os diálogos iniciais entre Asimov e Sophia
    // Explica o contexto da fase e introduz o conceito de prompts
    getDialogosIniciais() {
        return [
            { nome: "Asimov", personagem: this.asimov, texto: "Você conseguiu, Sophia, agora a humanidade possui novamente acesso às suas informações gerais." },
            { nome: "Sophia", personagem: this.sophia, texto: "Que bom que conseguimos, entretanto, tenho uma preocupação: a sociedade atual continuará utilizando a IA de modo indevido, não como a ferramenta que ela deveria ser. Tem algo que possamos fazer para ajudar a sociedade em relação a isso?" },
            { nome: "Asimov", personagem: this.asimov, texto: "Para evitar que essa ferramenta continue sendo utilizada indevidamente, podemos abordar a Ética na criação de prompts com as pessoas da atualidade." },
            { nome: "Sophia", personagem: this.sophia, texto: "Asimov, mas o que são prompts?" },
            { nome: "Asimov", personagem: this.asimov, texto: "Prompts são instruções, perguntas ou comandos dados para IA gerar respostas, que também podem demonstrar intenções do usuário." },
            { nome: "Asimov", personagem: this.asimov, texto: "Na época atual, a humanidade costuma utilizar a IA para substituir o pensamento crítico, entretanto, a partir da criação de prompts éticos, a IA pode ser utilizada para amplificar a inteligência humana, não substituí-la." },
            { nome: "Asimov", personagem: this.asimov, texto: "Para que você entenda melhor, posso citar alguns exemplos de prompts e você me indica se é uma aplicação correta ou incorreta da Inteligência Artificial." }
        ];
    }

    // Transição dos personagens para posições centrais
    // Move Asimov para centro, esconde Sophia, depois mostra aviso
    transicaoPosicoes() {
        this.tweens.add({
            targets: this.asimov,
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY - 100,
            duration: 1200, // 1.2 segundos
            onStart: () => this.sophia.setVisible(false), // Esconde Sophia no início
            onComplete: () => this.mostrarAviso() // Mostra aviso após movimento
        });
    }

    // Mostra aviso antes do minigame
    // Diálogo curto, depois inicia minigame com delay
    mostrarAviso() {
        this.sistemaDialogo.iniciarDialogo([
            { nome: "Asimov", personagem: this.asimov, texto: this.mensagemPrePerguntas }
        ], () => {
            this.lendoMensagem = false; // Desativa leitura
            this.time.delayedCall(1000, () => this.iniciarMinigame()); // Delay de 1s
        });
    }

    // Inicia o minigame de ética
    // Ativa flags, mostra UI e inicia timer e perguntas
    iniciarMinigame() {
        this.jogoAtivo = true; // Ativa minigame

        this.textoPontos.setVisible(true).setText('Acertos: 0');
        this.textoErros.setVisible(true).setText('Erros: 0');

        this.iniciarTimer(); // Inicia contagem regressiva
        this.novaPergunta(); // Primeira pergunta
    }

    // Inicia o timer do jogo
    // Evento que decrementa tempo a cada segundo
    iniciarTimer() {
        this.textoTimer.setVisible(true);
        this.atualizarTimer(); // Mostra tempo inicial

        this.timerGlobal?.remove(); // Remove timer anterior se existir

        this.timerGlobal = this.time.addEvent({
            delay: 1000, // 1 segundo
            loop: true, // Repete indefinidamente
            callback: () => {
                this.tempoTotal--; // Decrementa tempo
                this.atualizarTimer(); // Atualiza display

                if (this.tempoTotal <= 0) this.finalizarDesafio(); // Tempo esgotado
            }
        });
    }

    // Atualiza o display do timer
    atualizarTimer() {
        this.textoTimer.setText(`Tempo: ${this.tempoTotal}`);
    }

    // Seleciona e apresenta uma nova pergunta
    // Embaralha perguntas, verifica condições de fim
    novaPergunta() {
        if (!this.jogoAtivo) return; // Sai se jogo não ativo

        if (!this.perguntasDisponiveis.length || this.perguntasRespondidas >= 10) {
            this.finalizarDesafio(); // Fim se sem perguntas ou 10 respondidas
            return;
        }

        // Seleciona pergunta aleatória
        const index = Phaser.Math.Between(0, this.perguntasDisponiveis.length - 1);
        const pergunta = this.perguntasDisponiveis.splice(index, 1)[0]; // Remove da lista

        this.lendoMensagem = true;
        this.sistemaDialogo.iniciarDialogo([{ nome: "Sistema", texto: pergunta.texto }]); // Mostra pergunta

        // Cria botões de resposta
        this.criarBotaoResposta("Aplicação incorreta", -250, '#ff0000', 'antiético', pergunta.tipo);
        this.criarBotaoResposta("Aplicação correta", 250, '#00ff00', 'ético', pergunta.tipo);
    }

    // Cria botões de resposta para a pergunta
    // Botões posicionados à esquerda e direita, com cores distintas
    criarBotaoResposta(texto, offsetX, cor, valor, correto) {
        const x = this.cameras.main.centerX + offsetX; // Centro + offset
        const y = this.cameras.main.height - 50; // Parte inferior

        const btn = this.add.text(x, y, texto, {
            fontSize: '32px',
            color: cor,
            backgroundColor: '#1a1a1a', // Fundo escuro
            padding: { x: 20, y: 10 } // Espaçamento interno
        }).setOrigin(0.5, 1).setInteractive().setDepth(1005); // Interativo, profundidade alta

        btn.once('pointerdown', () => this.verificarResposta(valor, correto)); // Evento único

        // Armazena referência para destruir depois
        if (valor === 'ético') this.btnEtico = btn;
        else this.btnAntietico = btn;
    }

    // Remove os botões de resposta
    // Usado após resposta para limpar UI
    destruirBotoes() {
        this.btnEtico?.destroy();
        this.btnAntietico?.destroy();
    }

    // Verifica se a resposta está correta e atualiza pontuação
    // Anima texto, incrementa contadores, prepara próxima pergunta
    verificarResposta(escolha, correto) {
        if (!this.jogoAtivo) return; // Sai se jogo não ativo

        this.destruirBotoes(); // Remove botões
        this.sistemaDialogo.encerrarDialogo(); // Fecha diálogo
        this.lendoMensagem = false; // Desativa leitura

        const acertou = escolha === correto; // Compara escolha com tipo correto

        if (acertou) {
            this.pontuacao++; // Incrementa acertos
            this.textoPontos.setText(`Acertos: ${this.pontuacao}`);
            this.animarTexto(this.textoPontos); // Anima texto verde
        } else {
            this.contErros++; // Incrementa erros
            this.textoErros.setText(`Erros: ${this.contErros}`);
            this.animarTexto(this.textoErros); // Anima texto vermelho
        }

        this.perguntasRespondidas++; // Incrementa total

        if (this.tempoTotal > 0) {
            this.time.delayedCall(500, () => this.novaPergunta()); // Próxima pergunta com delay
        }
    }

    // Anima um texto da UI para destacar mudança
    // Escala temporariamente para chamar atenção
    animarTexto(obj) {
        this.tweens.add({
            targets: obj,
            scaleX: 1.5, // Aumenta largura
            scaleY: 1.5, // Aumenta altura
            duration: 150, // 150ms
            yoyo: true // Volta ao normal
        });
    }

    // Finaliza o desafio e determina vitória ou derrota
    // Verifica pontuação contra meta, mostra resultado
    finalizarDesafio() {
        this.jogoAtivo = false; // Desativa minigame

        this.timerGlobal?.remove(); // Para timer
        this.textoTimer.setVisible(false); // Esconde timer
        this.destruirBotoes(); // Remove botões

        const venceu = this.pontuacao >= this.metaPontuacao; // Verifica vitória

        const msg = venceu
            ? `Pontuação ${this.pontuacao}. Ética validada.` // Vitória
            : `Pontuação ${this.pontuacao}. Tente novamente.`; // Derrota

        this.lendoMensagem = true;

        this.sistemaDialogo.iniciarDialogo([
            { nome: "Asimov", personagem: this.asimov, texto: msg }
        ], () => {
            this.lendoMensagem = false;
            venceu ? this.finalizarCena() : this.reiniciarMinigame(); // Próxima ação baseada em resultado
        });
    }

    // Reinicia o minigame em caso de derrota
    // Reseta progresso e reinicia
    reiniciarMinigame() {
        this.resetarProgresso(); // Zera contadores
        this.iniciarMinigame(); // Reinicia minigame
    }

    // Finaliza a cena e vai para os créditos
    // Fade-out e transição para cena final
    finalizarCena() {
        if (this.cenaFinalizando) return; // Previne múltiplas chamadas

        this.cenaFinalizando = true; // Flag para evitar re-execução

        this.asimov.destroy(); // Remove sprites
        this.sophia.destroy();

        this.cameras.main.fadeOut(1000); // Fade-out de 1s
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("CreditsScene"); // Vai para créditos
        });
    }
}