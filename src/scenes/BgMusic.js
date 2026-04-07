// Classe que representa a cena de música de fundo do jogo.
// Esta cena é responsável por carregar e reproduzir a música em loop,
// persistindo entre todas as cenas do jogo.
export class bgMusic extends Phaser.Scene {

  // Construtor da cena: define o identificador único da cena.
  constructor() {
    super("bgMusic");
  }

  preload() { 
    // Carrega o arquivo de áudio 'bg-music.mp3' com a chave 'bgMusic' para uso posterior.
    this.load.audio("bgMusic", "assets/bg_music.wav");
  }

  create() {
    // Verifica se o som já foi adicionado ao gerenciador global de som do jogo.
    if (!this.game.sound.get('bgMusic')) {
      // Adiciona o som ao gerenciador global de som com configurações de loop e volume.
      this.music = this.game.sound.add('bgMusic', {
        loop: true,    // Faz o áudio repetir indefinidamente.
        volume: 0.70  // Define o volume em 70%
      });
      this.music.play();// Inicia a reprodução da música.
    } else {
      this.music = this.game.sound.get('bgMusic');
      if (!this.music.isPlaying) {
        this.music.play();
      }
    }
  }
}