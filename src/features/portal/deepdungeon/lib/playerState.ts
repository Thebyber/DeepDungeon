export interface PlayerStats {
  energy: number;
  maxEnergy: number;
}

export class PlayerState {
  private static instance: PlayerState;
  private stats: PlayerStats = {
    energy: 100, // Energía inicial
    maxEnergy: 100,
  };

  private constructor() {}

  public static getInstance(): PlayerState {
    if (!PlayerState.instance) {
      PlayerState.instance = new PlayerState();
    }
    return PlayerState.instance;
  }

  public getEnergy() {
    return this.stats.energy;
  }

  public consumeEnergy(amount: number): boolean {
    if (this.stats.energy >= amount) {
      this.stats.energy -= amount;
      return true;
    }
    return false; // No hay suficiente energía
  }

  public addEnergy(amount: number) {
    this.stats.energy = Math.min(
      this.stats.energy + amount,
      this.stats.maxEnergy,
    );
  }

  public increaseMaxEnergy(amount: number) {
    this.stats.maxEnergy += amount;
    this.stats.energy += amount; // Opcional: curar al aumentar el máximo
  }
}
