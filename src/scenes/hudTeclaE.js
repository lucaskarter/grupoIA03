export class HudTeclaE {
  constructor(scene, config = {}) {
    this.scene = scene;

    const {
      x = 0,
      y = 0,
      depth = 1000,
      scrollFactor = 0,
      largura = 58,
      altura = 50,
    } = config;

    this.container = scene.add.container(x, y)
      .setDepth(depth)
      .setScrollFactor(scrollFactor)
      .setVisible(false)
      .setAlpha(1);

    const fundo = scene.add.graphics();
    fundo.fillStyle(0x081018, 0.92);
    fundo.lineStyle(3, 0x00ffff, 1);
    fundo.fillRoundedRect(-largura / 2, -altura / 2, largura, altura, 12);
    fundo.strokeRoundedRect(-largura / 2, -altura / 2, largura, altura, 12);

    const letra = scene.add.text(0, 0, "E", {
      fontSize: "34px",
      fontFamily: "'Courier New', Courier, monospace",
      color: "#ccffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.container.add([fundo, letra]);

    this.tween = scene.tweens.add({
      targets: this.container,
      alpha: 0.2,
      duration: 520,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
      paused: true,
    });
  }

  mostrar() {
    this.container.setVisible(true);
    this.container.setAlpha(1);
    this.tween.resume();
  }

  esconder() {
    this.tween.pause();
    this.container.setAlpha(1);
    this.container.setVisible(false);
  }

  destruir() {
    this.tween.stop();
    this.container.destroy(true);
  }
}
