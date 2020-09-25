class Key extends Phaser.Physics.Arcade.Sprite {
  emitter

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'key_shine');

    scene.physics.add.existing(this);

    this.body.width = 24
    this.body.height = 24
    this.body.allowRotation = true
    this.body.setAllowGravity(false)

    const anims = scene.anims;
    anims.create({
      key: "key_shine",
      frames: anims.generateFrameNames('key', { prefix: 'key ', start: 0, end: 9, suffix: '.ase', zeroPad: 1 }),
      frameRate: 11,
      repeat: -1
    });

    this.play('key_shine');

    var particles = scene.add.particles('particle');

    this.emitter = particles.createEmitter({
      lifespan: 1000,
      speed: {min:20, max: 100},
      gravityY: 200,
      scale: { start: 1.5, end: 0 },
      blendMode: 'ADD',
      frequency: -1,
    });
    this.emitter.startFollow(this)
  }

  update(time) {

  }

  collect(key, collider) {
    this.emitter.explode(10)
    this.destroy()
  }
}

export default Key