import Phaser from "phaser";

/**
 * A class that wraps up our 2D platforming player logic. It creates, animates and moves a sprite in
 * response to WASD/arrow keys. Call its update method from the scene's update and call its destroy
 * method when you're done with the player.
 */
class Player {
  scene
  sprite
  keys
  weapon

  constructor(scene, x : Number, y : Number) {
    this.scene = scene;

    // Create the animations we need from the player spritesheet
    const anims = scene.anims;
    anims.create({
      key: "player_idle",
      frames: anims.generateFrameNames('player', {prefix: 'player ', start: 0, end: 3, suffix: '.ase', zeroPad: 1}),
      frameRate: 0,
      repeat: -1
    });
    anims.create({
      key: "player_walk",
      frames: anims.generateFrameNames('player', {prefix: 'player ', start: 21, end: 26, suffix: '.ase', zeroPad: 1}),
      frameRate: 0,
      repeat: -1
    });
    anims.create({
      key: "player_run",
      frames: anims.generateFrameNames('player', {prefix: 'player ', start: 11, end: 16, suffix: '.ase', zeroPad: 1}),
      frameRate: 11,
      repeat: -1
    });
    anims.create({
      key: "player_jump",
      frames: anims.generateFrameNames('player', {prefix: 'player ', start: 4, end: 8, suffix: '.ase', zeroPad: 1}),
      frameRate: 11,
      repeat: 1
    });
    anims.create({
      key: "player_air",
      frames: anims.generateFrameNames('player', {prefix: 'player ', start: 8, end: 8, suffix: '.ase', zeroPad: 1}),
      frameRate: 1,
      repeat: 0
    });
    anims.create({
      key: "player_land",
      frames: anims.generateFrameNames('player', {prefix: 'player ', start: 9, end: 11, suffix: '.ase', zeroPad: 1}),
      frameRate: 11,
      repeat: 0
    });
    anims.create({
      key: "player_throw",
      frames: anims.generateFrameNames('player', {prefix: 'player ', start: 17, end: 20, suffix: '.ase', zeroPad: 1}),
      frameRate: 11,
      repeat: -1
    });

    // Create the physics-based sprite that we will move around and animate
    this.sprite = scene.physics.add
      .sprite(x, y, "player", 0)
      .setDrag(2000, 0)
      .setMaxVelocity(200, 450);

      this.sprite.body.width = 15
      this.sprite.body.height = 25
      this.sprite.body.offset = new Phaser.Math.Vector2(9, 6)


    // Track the arrow keys & WASD
    const { LEFT, RIGHT, UP, DOWN, W, A, S, D, ENTER, SPACE } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard.addKeys({
      left: LEFT,
      right: RIGHT,
      up: UP,
      down: DOWN,
      w: W,
      a: A,
      s: S,
      d: D,
      enter: ENTER,
      space: SPACE,
    });
  }

  update(time) {
    const keys = this.keys;
    const sprite = this.sprite;
    const onGround = sprite.body.blocked.down;
    const acceleration = 7000

    const actions = {
      moveLeft: keys.left.isDown || keys.a.isDown,
      moveRight: keys.right.isDown || keys.d.isDown,
      aimUp: keys.up.isDown || keys.w.isDown,
      aimDown: keys.down.isDown || keys.s.isDown,
      fire: keys.enter.isDown,
      jump: keys.space.isDown,
    }

    // Apply horizontal acceleration when left/a or right/d are applied
    if (actions.moveLeft) {
      sprite.setAccelerationX(-acceleration);
      sprite.setFlipX(true);
    } else if (actions.moveRight) {
      sprite.setAccelerationX(acceleration);
      sprite.setFlipX(false);
    } else {
      sprite.setAccelerationX(0);
    }

    // Only allow the player to jump if they are on the ground
    if (onGround && (actions.jump)) {
      sprite.anims.play("player_jump", true);
      sprite.setVelocityY(-700);
    }

    // Update the animation/texture based on the state of the player
    if (onGround) {
      if (sprite.body.velocity.x !== 0) sprite.anims.play("player_run", true);
      else sprite.anims.play("player_idle", true);
    } else {
      sprite.anims.play("player_air", true );
      // sprite.setTexture("player", 10);
    }

    if (actions.fire) {
      let angle = new Phaser.Math.Vector2(0, 0)


      // Basic throws (Not holding any directions)
      if(sprite.flipX) {
        angle.x = -1
      } else {
        angle.x = 1
      }

      // Throw up
      if(actions.aimUp) {
        angle.y = -1
      }

      // Throw down
      if(actions.aimDown) {
        angle.y = 1
      }

      console.log("isflipped?", sprite.flipX)

      // if(sprite.flipX)
      // Fire!
      this.weapon.fire(this.sprite.x, this.sprite.y, angle)
    }
  }

  destroy() {
    this.sprite.destroy();
  }

  setWeapon(weapon) {
    this.weapon = weapon
    this.scene.physics.add.overlap(this.sprite, this.weapon.ammo, (player, card) => {
      this.weapon.collect(card)
    })
  }
}

export default Player