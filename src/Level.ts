import { mapDefined } from "../node_modules/tslint/lib/utils";

class Level {
  scene: Phaser.Scene;

  mapId:string = ""
  tileSetId:string = ""

  // Keys
  totalKeys:number = 0
  keysCollected:number = 0

  constructor(scene: Phaser.Scene, mapId:string, tileSetId:string) {
    this.scene = scene;
    this.mapId = mapId
    this.tileSetId = tileSetId
  }

  load() {

  }

  public create() {
    const tilemap = this.scene.make.tilemap({ key: this.mapId });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = tilemap.addTilesetImage("tileset", this.tileSetId);

    // Parameters: layer name (or index) from Tiled, tileset, x, y

    const background = tilemap.createDynamicLayer("Background", tileset, 0, 0);
    const belowLayer = tilemap.createDynamicLayer("Below Player", tileset, 0, 0);
    const worldLayer = tilemap.createDynamicLayer("World", tileset, 0, 0);
    const aboveLayer = tilemap.createDynamicLayer("Above Player", tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });
  }
}

export default Level