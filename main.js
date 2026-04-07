import { scenePreFase4 } from "./src/scenes/scenePreFase4.js";
import { welcomeScene } from "./src/scenes/Welcome.js";
import { sceneInicial } from "./src/scenes/sceneInicial.js";
import { sceneLBPassado } from "./src/scenes/sceneLBPassado.js";
import { sceneLBFuturo } from "./src/scenes/sceneLBFuturo.js";
import { sceneRestauracao } from "./src/scenes/sceneRestauracao.js";
import { faseUm } from "./src/scenes/FaseUm.js";
import { FaseDois } from "./src/scenes/FaseDois.js";
import { transicao1para2 } from "./src/scenes/transicao1para2.js";
import { faseTres } from "./src/scenes/faseTres.js";
import { FaseDoischao } from "../src/scenes/chaoCaindo.js";
import { faseQuatro } from "./src/scenes/faseQuatro.js";
import { faseCinco } from "./src/scenes/faseCinco.js";
import { CreditsScene } from "./src/scenes/sceneCreditos.js";
import { menu } from "./src/menu.js";
import { bgMusic } from "./src/scenes/bgMusic.js";

const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: "#262540",
  pixelArt: true,
  roundPixel: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  audio: {
    disableWebAudio: false,
  },
  parent: 'game-container',
  dom: {
    createContainer: true // Isso é obrigatório para usar elementos DOM
  },
  //scene: [sceneInicial, sceneLBPassado, sceneLBFuturo],
  //scene: [faseCinco, CreditsScene, ],

  scene: [
    welcomeScene,
    sceneInicial,
    sceneLBPassado,
    sceneLBFuturo,
    faseUm,
    transicao1para2,
    FaseDois,
    FaseDoischao,
    faseTres,
    scenePreFase4,
    faseQuatro,
    sceneRestauracao,
    faseCinco,
    CreditsScene,
    menu,
    bgMusic,
  ],

};

const game = new Phaser.Game(config);
