// ---------------------- Classe para criar efeito de neve no jogo -----------------------
export class SnowEffect {
  // Construtor: inicializa o efeito com configurações opcionais
  constructor(scene, config = {}) {
    this.scene = scene;
    this.count    = config.count    ?? 150;  // Número de flocos de neve
    this.wind     = config.wind     ?? 0.3;  // Velocidade do vento
    this.speed    = config.speed    ?? 1.5;  // Velocidade de queda
    this.maxSize  = config.maxSize  ?? 4;    // Tamanho máximo dos flocos
    this.alpha    = config.alpha    ?? 0.85; // Transparência máxima
    this.color    = config.color    ?? 0xffffff; // Cor dos flocos (branco)
    this.flakes   = [];  // Array para armazenar os flocos
    this.graphics = scene.add.graphics();  // Objeto gráfico para desenhar

    this.graphics.setDepth(config.depth ?? 9999);  // Profundidade de renderização
    this.graphics.setScrollFactor(0);  // Não segue a câmera

    this._spawn();  // Cria os flocos iniciais
    scene.events.on('update', this._update, this);  // Atualiza a cada frame
    scene.events.once('destroy', () => this.destroy(), this);  // Limpa ao destruir cena
  }

  // ------------------- Método privado: cria os flocos de neve com propriedades aleatórias ----------------------
  _spawn() {
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    for (let i = 0; i < this.count; i++) {
      this.flakes.push({
        x:      Phaser.Math.Between(0, W),  // Posição X inicial
        y:      Phaser.Math.Between(-H, H), // Posição Y inicial (acima da tela)
        size:   Phaser.Math.FloatBetween(1, this.maxSize),  // Tamanho
        speed:  Phaser.Math.FloatBetween(0.6, 1.4),  // Velocidade individual
        drift:  Phaser.Math.FloatBetween(-0.4, 0.4),  // Desvio lateral
        alpha:  Phaser.Math.FloatBetween(0.4, this.alpha),  // Transparência
        wobble: Phaser.Math.FloatBetween(0, Math.PI * 2),  // Oscilação
      });
    }
  }

  // Método privado: atualiza posição e desenha os flocos a cada frame
  _update() {
    const W = this.scene.scale.width;
    const H = this.scene.scale.height;
    this.graphics.clear();  // Limpa o gráfico anterior

    for (const f of this.flakes) {
      f.wobble += 0.02;  // Atualiza oscilação
      f.x += this.wind + f.drift + Math.sin(f.wobble) * 0.3;  // Move horizontalmente
      f.y += this.speed * f.speed;  // Move verticalmente

      // Reinicia posição se sair da tela
      if (f.y > H + f.size)  f.y = -f.size;
      if (f.x > W + f.size)  f.x = -f.size;
      if (f.x < -f.size)     f.x = W + f.size;

      this.graphics.fillStyle(this.color, f.alpha);  // Define cor e transparência
      this.graphics.fillCircle(f.x, f.y, f.size);  // Desenha o floco como círculo
    }
  }

  // Métodos para alterar vento e velocidade em tempo real
  setWind(v)  { this.wind = v; }
  setSpeed(v) { this.speed = v; }

  // Método para destruir o efeito e limpar eventos
  destroy() {
    this.scene.events.off('update', this._update, this);
    this.graphics.destroy();
  }
}
