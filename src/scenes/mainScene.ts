import 'phaser';

import AsepriteSpriteFactory from 'phaser-aseprite'

import playerPng from '../assets/player.png';
import playerJson from '../assets/player.json';
import cardsPng from '../assets/cards.png';
import cardsJson from '../assets/cards.json';

import Player from '../Player'
import Key from '../Key';
// import Level from '../Level';

class Card extends Phaser.Physics.Arcade.Sprite {
  public scene: Phaser.Scene
  public sprite

  constructor(scene: Phaser.Scene, x: number, y: number, texture, frame, options) {
    super(scene, x, y, 'cards', 'card_heart', options)
    this.scene = scene;

    scene.physics.add.existing(this);

    // Randomise the card to a suit
    this.setFrame(Phaser.Utils.Array.GetRandom(this.texture.getFrameNames()))

    // this.setSize(7, 9)
    this.body.width = 7
    this.body.height = 7
    this.body.isCircle = false
    this.body.allowRotation = true
    this.body.angularVelocity = 1000
    this.setDrag(100 , 0)
    // this.setAngularVelocity(1000)
    this.body.setAllowGravity(false)
    this.setDrag(100)
    this.setAngularDrag(100)
    this.setBounce(0.2)
    this.setActive(false)
    this.setVisible(false)
  }

  update(time) {
    // console.log("COLLIDE?", this.body.blocked)
    if(this.body.blocked.left || this.body.blocked.right || this.body.blocked.up || this.body.blocked.down) {
      if(this.body.velocity.x > 90 || this.body.velocity.x < -90) {
        this.body.immovable = true
        this.body.moves = false
        this.body.allowRotation = false
      } else {
        this.body.setAllowGravity(true)
        this.setAngularDrag(1000)
      }
    }
  }
}

class RangedWeapon {
  scene:Phaser.Scene
  damage:number = 0
  ammo:Phaser.GameObjects.Group
  lastFired:number = 0
  bulletSpeed:number = 500
  fireSound:string = ''
  reloadSound:string = ''

  constructor(scene:Phaser.Scene, Bullet:Class, maxAmmo:number) {
    this.scene = scene
    this.ammo = scene.add.group({
      classType: Bullet,
      maxSize: maxAmmo,
      runChildUpdate: true
    })
  }

  fire(x:number, y:number, angle:Phaser.Math.Vector2) {
    // Limit rate of fire
    if(this.scene.time.now < this.lastFired + 250) return

    // Grab a piece of ammo
    const bullet = this.ammo.get()

    // No ammo? No pew pew.
    if(!bullet) return

    // Do the shooty shoot
    console.log("FIRE!", x, x + (angle.x * 100))
    bullet.setPosition(x + (angle.x * 15), y)
    bullet.active = true
    bullet.visible = true

    console.log("FRAME NAMES", bullet.texture.getFrameNames())
    // console.log("GET", bullet.texture.get('card 1.ase'))
    bullet.setFrame(Phaser.Utils.Array.GetRandom(bullet.texture.getFrameNames()))
    // bullet.play('card_heart')

    bullet.setVelocity(angle.x * this.bulletSpeed, angle.y * this.bulletSpeed)
    this.scene.sound.play(this.fireSound)

    this.lastFired = this.scene.time.now
  }

  collect(bullet:Phaser.GameObjects.Sprite) {
    bullet.destroy()
    this.scene.sound.play(this.fireSound)
  }
}

class ThrowingCard extends RangedWeapon {
  fireSound:string = 'card_throw'

  constructor(scene) {
    super(scene, Card, 52)
  }
}

// class Card extends Phaser.Physics.Sprite {
//   name:String = "Card"
//   constructor(scene, x, y, texture, frame, options) {
//     super(scene.matter.world, x, y, 'card', 'card_heart', options)
//     const seed = Math.random()
//     if(seed < 0.25) {
//       this.setFrame('card_heart')
//     } else if(seed < 0.5 && seed > 0.25) {
//       this.setFrame('card_diamond')
//     } else if(seed < 0.75 && seed > 0.5) {
//       this.setFrame('card_club')
//     } else {
//       this.setFrame('card_spade')
//     }
//     scene.add.existing(this)
//   }
//   fire(playerX, playerY, targetX, targetY) {
//     this.setPosition(playerX, playerY)
//     this.setVelocity(10, -10)
//     this.setActive(true)
//     this.setVisible(true)
//   }
//   update(time, delta) {
//     // this.x -= 10
//     // this.rotation += 1
//   }
//   // ...
//   // preUpdate(time, delta) {
//   //     super.preUpdate(time, delta);
//   // }
// }


export class MainScene extends Phaser.Scene {
  private player:Player
  private cards:Phaser.GameObjects.Group
  private keys:Phaser.GameObjects.Group
  private cursors
  private lastFired

  constructor() {
    super({ key: 'MainScene' });
  }

  public preload() {
    this.load.atlas('player', 'assets/player2.png', 'assets/player2.json');

    this.load.image("tiles", "assets/tiles.png");
    this.load.tilemapTiledJSON("map", "assets/map.json");
    // this.load.image('card', cardPng);
    this.load.atlas('cards', 'assets/cards.png', 'assets/cards.json');
    this.load.atlas("key", "assets/key.png", 'assets/key.json');
    this.load.image("particle", "assets/particle.png");

    this.cameras.main.setBackgroundColor(0x16171a)

    this.load.audio('card_throw', 'assets/card_throw.wav')
  }

  public create() {
    const map = this.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("kings-and-pigs-terrain", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y

    const background = map.createDynamicLayer("Background", tileset, 0, 0);
    const belowLayer = map.createDynamicLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createDynamicLayer("World", tileset, 0, 0);
    const aboveLayer = map.createDynamicLayer("Above Player", tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collides: true });

    // const key = new Key(this, 100, 100)
    // this.add.existing(key)

    this.keys = this.add.group({
      classType: Key,
      runChildUpdate: true
    })

    const key = this.keys.get()

    key.x = 100
    key.y = 100

    const key2 = this.keys.get()

    key2.x = 520
    key2.y = 480



    this.player = new Player(this, 400, 150);
    this.player.setWeapon(new ThrowingCard(this))

    // this.add.group({
    //   classType: Card,
    //   maxSize: 52,
    //   runChildUpdate: true
    // })

    // this.input.on('pointerdown', (event: any) => {
    //   this.player.sprite.x = event.x
    //   this.player.sprite.y = event.y
    //   this.player.sprite.setVelocityY(0)
    //   this.player.sprite.setVelocityX(0)


    //   // const card = this.cards.get()
    //   // console.log("FIRE")

    //   // if(card) {
    //   //     card.setPosition(this.player.sprite.x, this.player.sprite.y)
    //   //     this.player.sprite.play('player_throw', true)
    //   //     card.body.setVelocity(-300, 0)
    //   //     card.body.allowGravity = false
    //   //     card.setActive(true)
    //   //     card.setVisible(true)
    //   //     this.sound.play('card_throw');
    //   //   // card.fire(this.player.sprite.x, this.player.sprite.y, event.downX, event.downY)
    //   // }
    // });

    this.physics.world.addCollider(this.player.sprite, worldLayer);
    this.physics.world.addCollider(this.player.weapon.ammo, worldLayer);

    const a = this.physics.add.overlap(this.player.sprite, this.keys, (player, key) => {
      console.log("COLLECT WITH player")
      key.collect(player, key)
    });
    console.log("AAA", a)
    this.physics.add.overlap(this.player.weapon.ammo, this.keys, (ammo, key) => {
      console.log("COLLECT WITH CARD")
      key.collect(ammo, key)
    });
    // this.matter.world.convertTilemapLayer(worldLayer);



    console.log(this.player)

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // worldLayer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });


    // this.anims.create({
    //   key: 'player_idle',
    //   frames: this.anims.generateFrameNames('player', {prefix: 'player ', start: 10, end: 10, suffix: '.ase', zeroPad: 1}),
    //   frameRate: 0,
    //   repeat: -1
    // })
    // this.anims.create({
    //   key: 'player_run',
    //   frames: this.anims.generateFrameNames('player', {prefix: 'player ', start: 0, end: 9, suffix: '.ase', zeroPad: 1}),
    //   frameRate: 11,
    //   repeat: -1
    // })

    // this.anims.create({
    //   key: 'cards',
    //   frames: [
    //     {key:'card_diamond', frame: 0},
    //     {key:'card_club', frame: 1},
    //     {key:'card_heart', frame: 2},
    //     {key:'card_spade', frame: 3},
    //   ]
    // })

    // this.cursors = this.input.keyboard.createCursorKeys();


    // this.cards = this.add.group({
    //   classType: Card,
    //   key: 'card',
    //   frame: 'card_heart',
    //   maxSize: 52,
    //   runChildUpdate: true
    // })

    // const playerController = {
    //     matterSprite: this.matter.add.sprite(0, 0, 'player'),
    //     blocked: {
    //         left: false,
    //         right: false,
    //         bottom: false
    //     },
    //     isTouching: {
    //         left: false,
    //         right: false,
    //         bottom: false
    //     },
    //     sensors: {
    //         bottom: null,
    //         left: null,
    //         right: null
    //     },
    //     time: {
    //         leftDown: 0,
    //         rightDown: 0
    //     },
    //     lastJumpedAt: 0,
    //     speed: {
    //         run: 7,
    //         jump: 10
    //     }
    // };

    // playerController.matterSprite.width = 30
    // playerController.matterSprite.height = 48

    // var M = Phaser.Physics.Matter.Matter;
    // var w = playerController.matterSprite.width;
    // var h = playerController.matterSprite.height;
    // console.log("Width", w, "heigt", h, "M", M)
    // var playerBody = M.Bodies.rectangle(0, 0, w, h, { chamfer: { radius: 8 } });
    // playerController.sensors.bottom = M.Bodies.rectangle(0, h, w * 0.5, 5, { isSensor: true });
    // playerController.sensors.left = M.Bodies.rectangle(-w, 0, 5, h * 0.25, { isSensor: true });
    // playerController.sensors.right = M.Bodies.rectangle(w, 0, 5, h * 0.25, { isSensor: true });
    // var compoundBody = M.Body.create({
    //     parts: [
    //         playerBody, playerController.sensors.bottom, playerController.sensors.left,
    //         playerController.sensors.right
    //     ],
    //     friction: 0.01,
    //     restitution: 0.05 // Prevent body from sticking against a wall
    // });

    // playerController.matterSprite
    //     .setExistingBody(compoundBody)
    //     .setDisplayOrigin(w / 2, h / 2)
    //     .setFixedRotation() // Sets max inertia to prevent rotation
    //     .setPosition(400, 300);


    // this.input.on('pointerdown', (event: any) => {
    //   // playerController.matterSprite.x = event.x
    //   // playerController.matterSprite.y = event.y
    //   // playerController.matterSprite.setVelocityY(0)
    //   // playerController.matterSprite.setVelocityX(0)
    //   const card = this.cards.get()
    //   console.log("FIRE")

    //   if(card) {
    //     card.fire(this.player.matterSprite.x, this.player.matterSprite.y, event.downX, event.downY)
    //   }
    // });

    // this.player = playerController
  }

  public update(time) {
    this.player.update(time);


    // const player = this.player.matterSprite
    // const onFloor = this.player.blocked.bottom
    // const onLeftWall = this.player.blocked.left
    // const onRightWall = this.player.blocked.left
    // const canJump = (time - this.player.lastJumpedAt) > 250;

    // // if(onLeftWall || onRightWall) {
    // //   player.x += 2
    // // }

    // console.log({onLeftWall, onRightWall, onFloor})

    // // console.log(onFloor)
    // // console.log(this.player.blocked)

    // if (this.cursors.left.isDown)
    // {
    //     player.setX(player.x - this.player.speed.run);
    //     player.play('player_run', true)
    //     player.setFlip(true)
    //     // player.anims.play('left', true);
    // }
    // else if (this.cursors.right.isDown)
    // {
    //     player.setX(player.x + this.player.speed.run);
    //     player.play('player_run', true)
    //     player.setFlip(false)
    //     // player.anims.play('right', true);
    // }
    // else
    // {
    //     player.setVelocityX(0);
    //     player.play('player_idle')
    //     // player.anims.play('turn');
    // }

    // if (this.cursors.up.isDown && canJump && (onFloor || onLeftWall || onRightWall))
    // {
    //   let jumpX = 0
    //   if(onLeftWall) {
    //     jumpX = -this.player.speed.jump
    //   }
    //   if(onRightWall) {
    //     jumpX = this.player.speed.jump
    //   }

    //   console.log(jumpX)

    //    player.setVelocityY(-this.player.speed.jump, jumpX);
    //    this.player.lastJumpedAt = time
    // }
    // card.reset(this.player.x - 8, this.player.y - 8);
  }
}
