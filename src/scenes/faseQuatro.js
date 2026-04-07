//nesta fase o jogador precisa limpar o ruído da imagem do cristal. Para isso ele precisa passar o mouse na tela, e isso vai limpar e alcançar a nitidez desejada.
//O jogador tem um tempo limitado para terminar essa fase
//O jogador precisa de uma nitide alta para passar de fase

import { registrarTeclaMenu } from '../menu.js';

export class faseQuatro extends Phaser.Scene {
    constructor() {
        super("faseQuatro");
    }

    //----------------------------carrega todas as imagens e sprites------------------------------
    preload() {
        this.load.image('cristais', 'assets/Fases/FaseQuatro/cabeça1.png');
        this.load.image('cristais2', 'assets/Fases/FaseQuatro/cabeça2.png');
        this.load.image('cristais3', 'assets/Fases/FaseQuatro/cabeça3.png');
        this.load.image('cristais4', 'assets/Fases/FaseQuatro/cabeça4.png');
        this.load.image('esponja', 'assets/Fases/FaseQuatro/esponja.png');
        this.load.image('textoExplicacao', 'assets/Fases/FaseQuatro/textoExplicação.png');
        this.load.image('textoPerda', 'assets/Fases/FaseQuatro/textoPerda.png');
        this.load.image('textoSucesso', 'assets/Fases/FaseQuatro/sucesso.png');
        this.load.spritesheet('barraCarregamento', 'assets/Fases/FaseQuatro/barraProgresso.png', { frameWidth: 200, frameHeight: 128 });
    }

    //---------------------------------------carrega todas as imagens e sprites----------------------------------------
    create() {
        registrarTeclaMenu(this);
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Inicia a cena de música de fundo (bgMusic) que executa em loop em segundo plano.
        this.scene.launch("bgMusic");

        const { width, height } = this.sys.game.config; //a altura e o comprimento recebem valores definidos no sistema
        //altura - heigh
        //largura - width

        this.add.image(width / 2, height / 2, 'cristais').setDisplaySize(width, height); //adiciona a imagem real do cristal que fica no fundo de tudo

        // cria objetos sem adicioná-los à cena automaticamente por causa do False. Carrega a imagem da key.
        const img2 = this.make.image({ key: 'cristais2' }, false).setDisplaySize(width, height);
        const img3 = this.make.image({ key: 'cristais3' }, false).setDisplaySize(width, height);
        const img4 = this.make.image({ key: 'cristais4' }, false).setDisplaySize(width, height);

        //fórmula de apagar utilizada encontrada no site da Phaser: https://phaser.io/examples/v3.85.0/game-objects/render-texture/view/erase-part-of-render-texture
        // cria o objeto com o renderTexture, dinâmica que pode ser desenhada e apagada em tempo real. Começa na posição x e y = 0
        this.desenho2 = this.add.renderTexture(0, 0, width, height);
        this.desenho2.draw(img2, width / 2, height / 2); //a imagem que estava na memória e não aparecia na tela, agora é desenhada na tela
        this.desenho3 = this.add.renderTexture(0, 0, width, height);
        this.desenho3.draw(img3, width / 2, height / 2);
        this.desenho4 = this.add.renderTexture(0, 0, width, height);
        this.desenho4.draw(img4, width / 2, height / 2);

        // criação de canvas - corresponde a uma tela de desenho em branco que é controlada pelo javascript. Ela não aparece visualmente ao usuaário, mas é possivel manipular os pixels
        const criarMapa = (w, h) => { //recebe a coordenada de largura e de altura
            const c = document.createElement('canvas'); // cria o canvas explicado acima e armazena na variavedl c
            c.width = w; c.height = h;
            return c.getContext('2d', { willReadFrequently: true }); //o canvas tem que ser em 2D, por isso o context('2d')
        };
        this.mapa4 = criarMapa(width, height);
        this.mapa3 = criarMapa(width, height);
        this.mapa2 = criarMapa(width, height);

        // Create crystal mask to count only crystal pixels
        this.cristalMascara = criarMapa(width, height);
        const baseTexture = this.textures.get('cristais');
        const baseImg = baseTexture.getSourceImage();
        this.cristalMascara.drawImage(baseImg, 0, 0, width, height);
        const mascaraDados = this.cristalMascara.getImageData(0, 0, width, height).data;
        this.mascaraDados = mascaraDados;
        this.totalCristalPixels = 0;
        for (let i = 3; i < mascaraDados.length; i += 4) {
            if (mascaraDados[i] > 0) this.totalCristalPixels++;
        }

        const tamBorracha = 220; //tamanho borracha
        const borracha = this.make.image({ key: 'esponja' }, false).setDisplaySize(tamBorracha, tamBorracha); //cria o objeto da borracha mas não mostra na tela, esse aqui é somente para realizar a funç
        this.esponja = this.add.image(-100, -100, 'esponja').setDisplaySize(tamBorracha, tamBorracha).setDepth(10); //mostra a imagem na tela

        this.barraCarregamento = this.add.sprite(width / 2, 120, 'barraCarregamento', 0).setScale(3).setDepth(10); //adiciona a barra do overfitting
        this.anims.create({ //animação da passagem de frames
            key: 'barraCarregamento',
            frames: this.anims.generateFrameNumbers('barraCarregamento', { start: 0, end: 33 }), // são 34 imagens da barra
            frameRate: 1,
            repeat: 0
        });
        this.barraCarregamentoFrame = 0; //começa com o primeiro frame
        this.limpando = false;
        this.cronometroIniciado = false;
        this.tempoRestante = 60; //1 minuto de contador
        this.jogoParado = false;

        const estilo = {
            fontSize: '54px',
            fontFamily: "'Georgia', serif",
            fill: '#f0e6c8',
            stroke: '#1a1a1a',
            strokeThickness: 6,
            padding: { x: 14, y: 8 }
        };

        //this.fundoHUD = this.add.rectangle(14, height - 140, 360, 120, 0x000000, 0.55).setOrigin(0).setDepth(10);
        this.textoTempo = this.add.text(28, height - 135, 'Tempo: 1:00', estilo).setDepth(11);
        this.textoNitidez = this.add.text(28, height - 80, 'Nitidez: 0%', estilo).setDepth(11);

        this.desenhoAtiva = null; // renderTexture da camada que será apagada nessa sessão
        this.mapaAtivo = null; // mapa correspondente
        this.posMouseAtual = { x: 0, y: 0 }; // posição atual do mouse para o timer de camada

        // Exibe texto explicativo no início
        this.mostrandoExplicacao = true;
        this.mostrandoPerda = false;
        this.imagemExplicacao = this.add.image(width / 2, height / 2, 'textoExplicacao')
            .setDepth(100)
            .setScale(0.85);

        // Animação de escala
        this.tweens.add({
            targets: this.imagemExplicacao,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.teclaE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // timer que avança camada a cada 1 segundo enquanto o mouse estiver pressionado
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.limpando && !this.jogoParado) {
                    this.detectarCamada(this.posMouseAtual.x, this.posMouseAtual.y);
                    this.apagar(borracha, this.posMouseAtual.x, this.posMouseAtual.y, tamBorracha);
                }
            }
        });

        this.input.on('pointerdown', (pointer) => { //quando o jogador clicar com o botão esquerdo do mouse
            if (this.mostrandoExplicacao) {
                this.fecharExplicacao();
                return;
            }
            if (this.mostrandoPerda) {
                this.scene.restart();
                return;
            }
            this.limpando = true;
            this.posMouseAtual = { x: pointer.x, y: pointer.y };
            if (!this.cronometroIniciado) {
                this.cronometroIniciado = true;
                this.time.addEvent({ //cria um evento para o cronometro
                    delay: 1000,//de um em um segundo acontece repetindo 59 vezes que da um minuto
                    repeat: 59,
                    callback: () => { //chamada a cada segundo
                        this.tempoRestante--;
                        const min = Math.floor(this.tempoRestante / 60); //arredonda pro numero inteiro inferior achando o número dos minutos. 100 / 60 = 1,66 -> 1
                        const seg = this.tempoRestante % 60; //o resto da divisão feita acima
                        this.textoTempo.setText(`Tempo: ${min}:${seg.toString().padStart(2, '0')}`); //o padStart faz com que o número inferior a 10 tenha um zero a sua esquerda
                        if (this.tempoRestante <= 0) {
                            this.mostrarMenu('Fim do tempo de treinamento.\nReinicie o tratamento desta imagem.');
                        }
                    }
                });
            }

            this.detectarCamada(pointer.x, pointer.y);
            this.apagar(borracha, pointer.x, pointer.y, tamBorracha);
        });

        this.input.on('pointerup', () => { //quando o jogador solta o botão do mouse
            this.limpando = false;
            this.desenhoAtiva = null;
            this.mapaAtivo = null;
        });

        this.input.on('pointermove', (pointer) => { //a esponja move junto com o ponteiro do mouse
            if (this.mostrandoExplicacao) return; // bloqueia movimento durante explicação
            this.esponja.setPosition(pointer.x, pointer.y);
            if (pointer.isDown) {
                this.posMouseAtual = { x: pointer.x, y: pointer.y };
                this.detectarCamada(pointer.x, pointer.y);
                this.apagar(borracha, pointer.x, pointer.y, tamBorracha);
            }
        });
    }

    //some com a imagem de explicação do funcionamento da fase 4
    fecharExplicacao() {
        this.imagemExplicacao.destroy();
        this.mostrandoExplicacao = false;
    }

    update() {
        //Quando estiver com a imagem de explicação de funcionamento da fase 4, se o jogador apertar a tecla E, fecha a imagem
        if (this.mostrandoExplicacao) {
            if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
                this.fecharExplicacao();
            }
            return;
        }

        //Quando estiver com a imagem de perda de funcionamento da fase 4, se o jogador apertar a tecla E, fecha a imagem
        if (this.mostrandoPerda) {
            if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
                this.scene.restart();
            }
            return;
        }

        if (this.jogoParado) return; //sai das atualizações  se o jogador perdeu o tempo

        if (this.limpando) { //enquanto estiver limpando a barra de progresso aumenta os frames e vai subindo
            this.barraCarregamentoFrame = Math.min(33, this.barraCarregamentoFrame + 0.1);
        } else {
            this.barraCarregamentoFrame = Math.max(0, this.barraCarregamentoFrame - 0.1); //enquanto estiver sem limpar a barra de progresso diminui os frames e vai subindo
        }
        this.barraCarregamento.setFrame(Math.floor(this.barraCarregamentoFrame));

        if (Math.floor(this.barraCarregamentoFrame) >= 33) { //se os frames forem iguais a quantidade maxima, o jogador perde por Overfitting
            this.mostrarMenuPerda();
        }

        // conta pixels apagados no mapa2 (última camada) apenas na área do cristal
        const dados = this.mapa2.getImageData(0, 0, this.mapa2.canvas.width, this.mapa2.canvas.height).data;
        let apagados = 0;
        for (let i = 0; i < dados.length; i += 4) {
            if (this.mascaraDados[i + 3] > 0 && dados[i + 3] > 0) apagados++;
        }
        const pct = Math.floor((apagados / this.totalCristalPixels) * 100) + 2;
        this.textoNitidez.setText(`Nitidez: ${pct}%`);

        if (pct >= 100 && !this.jogoParado) {
            this.ganharFase();
        }
    }

    // -------------------- Função para mostrar a imagem de quando o jogador perde e passa do tempo ou atinge o limite do overfitting ------------------------
    mostrarMenuPerda() {
        if (this.jogoParado) return;
        this.jogoParado = true;
        this.mostrandoPerda = true;
        this.limpando = false;

        const { width, height } = this.sys.game.config;
        this.input.off('pointermove');

        const imagemPerda = this.add.image(width / 2, height / 2, 'textoPerda').setDepth(20).setScale(0.85);

        // animação vai e vem
        this.tweens.add({
            targets: imagemPerda,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // ----------------- Método para quando tiver que mostrar o que fazer na fase -----------------
    mostrarMenu(mensagem) {
        if (this.jogoParado) return;
        this.jogoParado = true;
        this.limpando = false;

        const { width, height } = this.sys.game.config;
        // tamanho do painel do texto
        const painelW = 800;
        const painelH = 320;

        this.input.off('pointermove'); //não acompanha o ponteiro

        const painel = this.add.rectangle(width / 2, height / 2, painelW, painelH, 0x8b7355).setDepth(20).setAlpha(0.92); //provisório o retângulo do fundo do texto
        this.add.text(width / 2, height / 2, mensagem, { //estilo do texto
            fontSize: '28px',
            fontStyle: 'bold',
            fontFamily: "'Courier New', Courier, monospace",
            fill: '#1a1a1a',
            align: 'center',
            wordWrap: { width: 760 }
        }).setOrigin(0.5).setDepth(21);

        this.input.once('pointerdown', () => { //caso haja um clique, restarta a cena
            this.scene.restart();
        });
    }

    detectarCamada(x, y) {} // mantido para compatibilidade com o timer

    // ------------ Para cada pixel dentro do círculo da esponja, apaga na camada mais elevada que ainda existe naquele pixel ------------
    apagar(borracha, cx, cy, tamBorracha) {
        const raio = tamBorracha / 2;
        const step = 4; // amostra a cada 4 pixels para performance
        const w4 = this.mapa4.canvas.width, h4 = this.mapa4.canvas.height;

        // lê os dados de todas as camadas de uma vez na área do círculo (bounding box)
        const x0 = Math.max(0, Math.floor(cx - raio));
        const y0 = Math.max(0, Math.floor(cy - raio));
        const x1 = Math.min(w4 - 1, Math.ceil(cx + raio));
        const y1 = Math.min(h4 - 1, Math.ceil(cy + raio));
        const bw = x1 - x0 + 1;
        const bh = y1 - y0 + 1;
        if (bw <= 0 || bh <= 0) return;

        const d4 = this.mapa4.getImageData(x0, y0, bw, bh).data;
        const d3 = this.mapa3.getImageData(x0, y0, bw, bh).data;
        const d2 = this.mapa2.getImageData(x0, y0, bw, bh).data;

        let afetou4 = false, afetou3 = false, afetou2 = false;

        for (let py = y0; py <= y1; py += step) {
            for (let px = x0; px <= x1; px += step) {
                // verifica se o pixel está dentro do círculo
                const dx = px - cx, dy = py - cy;
                if (dx * dx + dy * dy > raio * raio) continue;

                const idx = ((py - y0) * bw + (px - x0)) * 4 + 3; // canal alpha

                if (d4[idx] === 0) { // camada 4 ainda não apagada neste pixel
                    this.mapa4.fillRect(px, py, step, step);
                    afetou4 = true;
                } else if (d3[idx] === 0) {
                    this.mapa3.fillRect(px, py, step, step);
                    afetou3 = true;
                } else if (d2[idx] === 0) {
                    this.mapa2.fillRect(px, py, step, step);
                    afetou2 = true;
                }
            }
        }

        // apaga visualmente nas camadas afetadas usando o molde da esponja
        if (afetou4) this.desenho4.erase(borracha, cx, cy);
        if (afetou3) this.desenho3.erase(borracha, cx, cy);
        if (afetou2) this.desenho2.erase(borracha, cx, cy);
    }

    //--------------------------- Função para quando o jogador limpa 50% da nitidez da tela ------------------------------
    ganharFase() {
        this.jogoParado = true;
        this.cronometroIniciado = false; // Para o tempo

        const { width, height } = this.sys.game.config;

        const imagemSucesso = this.add.image(width / 2 + 50, height / 2, 'textoSucesso').setDepth(100).setScale(0.85);
        this.tweens.add({
            targets: imagemSucesso,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ao clicar
        this.input.once('pointerdown', () => {
            this.cameras.main.fadeOut(1000);
            this.cameras.main.once("camerafadeoutcomplete", () => {
                this.scene.start("sceneRestauracao");
            });
        });
    }
}
