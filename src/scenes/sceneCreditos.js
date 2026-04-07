export class CreditsScene extends Phaser.Scene {
  constructor() { super({ key: 'CreditsScene' }); }

  preload() {
    this.load.video('creditoFinal', 'assets/Cutscene/CreditoFinal.mp4');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.cameras.main.setBackgroundColor(0x000000);

    const video = this.add.video(W / 2, H / 2, 'creditoFinal');
    video.setDisplaySize(W, H);
    video.play();

    video.once('complete', () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('welcomeScene');
      });
    });

    // Clique ou tecla pula o vídeo
    this.input.keyboard.once('keydown', () => this._pular(video));
    this.input.once('pointerdown', () => this._pular(video));
  }

  _pular(video) {
    video.stop();
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('welcomeScene');
    });
  }
}
