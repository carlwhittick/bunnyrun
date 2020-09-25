import { MainScene } from './scenes/mainScene';

const config: GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [MainScene],
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      // debug: true,
    }
  }
};

const game = new Phaser.Game(config);
