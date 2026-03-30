export interface PlayerStats {
  energy: number;
  maxEnergy: number;
  currentLevel: number;
  inventory: {
    pickaxe: number;
  };
  attack: number;
  defense: number;
  criticalChance: number;
}

/**
 * --- CAMBIO CLAVE ---
 * Ya no necesitamos la clase PlayerState con Singleton.
 * Los valores iniciales ahora deben vivir en el 'context' de DungeonMachine.ts
 */

// Si necesitas mantener la clase para no romper referencias masivas en Phaser,
// úsala solo como un "traductor" de eventos:

export class PlayerStateBridge {
  // Este método sustituye a consumeEnergy, addEnergy, etc.
  // Pero lo ideal es llamar directamente a portalService.send() en tus archivos .ts
}
