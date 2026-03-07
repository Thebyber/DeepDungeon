export class CrystalContainer extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  public isBeingMined: boolean = false;
  private health: number = 1;
  public type: string;
  public menaLevel: number; // <--- PASO 1: Declarar la propiedad

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    menaLevel: number, // Recibes el 4 o el 1
  ) {
    super(scene, x, y);
    this.type = type;
    this.menaLevel = menaLevel; // <--- PASO 2: Guardarlo para usarlo luego

    const spriteKey = `mena_${type}_${menaLevel}`;
    const sprite = scene.add.sprite(0, 0, spriteKey);
    sprite.setOrigin(0.5, 0.5);
    this.add(sprite);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    if (this.body) {
      this.body.setSize(6, 6);
      this.body.setOffset(0, 0);
      this.body.setImmovable(true);
    }
  }

  public takeDamage(): boolean {
    this.health--;

    // Feedback visual de golpe
    this.scene.tweens.add({
      targets: this,
      scale: 0.8,
      duration: 50,
      yoyo: true,
      ease: "Quad.easeInOut",
    });

    if (this.health <= 0) {
      this.collect();
      return true;
    }
    return false;
  }

  private collect() {
    const scene = this.scene as DeepDungeonScene;
    const puntos = DUNGEON_POINTS.CRYSTALS[crystalName];
    // Forzamos que shapeId tenga un valor aunque falle la carga (por defecto 1)
    const finalLevel = this.menaLevel || 1;

    //console.log(`✅ [CONTENEDOR] Enviando datos correctos: ${this.type} - Nivel: ${finalLevel}`);

    scene.portalService?.send("CRYSTAL_MINED", {
      crystalType: this.type,
      shapeId: finalLevel, // <--- Aquí garantizamos que NO sea undefined
    });
    // 3. ENVIAR PUNTOS (Usando la acción genérica ADD_POINTS)
    scene.portalService?.send("ADD_POINTS", { amount: puntos });
    this.destroy();
  }
}
