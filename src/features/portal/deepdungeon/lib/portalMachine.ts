import { assign, createMachine, Interpreter, State } from "xstate";
import { CONFIG } from "lib/config";
import { GameState } from "features/game/types/game";
import { OFFLINE_FARM } from "features/game/lib/landData";
import { decodeToken } from "features/auth/actions/login";
import { getJwt, getUrl, loadPortal } from "../../actions/loadPortal";

// --- TUS INTERFACES ---
import { PlayerStats } from "./playerState";
import { DropKey } from "../DeepDungeonConstants";
import { DROP_ITEMS_CONFIG, DUNGEON_POINTS } from "../DeepDungeonConstants";

export interface Context {
  id: number;
  jwt: string | null;
  state: GameState | undefined;
  stats: PlayerStats;
  codex: {
    enemiesDefeated: Record<string, number>;
    crystalsMined: Record<string, number>;
    trapsTriggered: number;
  };
  levelProgress: {
    enemies: Record<string, number>;
    crystals: Record<string, number>;
  };
  dungeonPoints: number;
  rerollCost: number;
  showCardSelector: boolean;
  startedAt: number;
}

export type DungeonEvent =
  | { type: "START" }
  | { type: "UPDATE_STATS"; stats: Partial<PlayerStats> }
  | { type: "HIT_TRAP"; damage: number }
  | { type: "ADD_ENERGY"; amount: number }
  | {
      type: "ENEMY_KILLED";
      enemyName: string;
      loot?: { key: DropKey; amount: number };
    }
  | {
      type: "CRYSTAL_MINED";
      crystalType: string;
      shapeId: number; // <--- AÑADE ESTO AQUÍ
    }
  | { type: "ITEM_COLLECTED"; itemKey: keyof typeof DROP_ITEMS_CONFIG }
  | { type: "PICKAXE_FOUND"; amount: number }
  | { type: "NEXT_MAP" }
  | { type: "OPEN_CARD_SELECTOR" }
  | { type: "ADD_POINTS"; amount: number }
  | { type: "ON_REROLL" }
  | { type: "APPLY_CARD_BONUS"; bonus: any }
  | { type: "GAME_OVER" }
  | { type: "RETRY" };

// --- DEFINICIÓN DE LOS ESTADOS (PORTAL STATE) ---
export type PortalState = {
  value:
    | "initialising"
    | "error"
    | "unauthorised"
    | "loading"
    | "playing"
    | "gameOver"
    | "winner"
    | "loser"
    | "complete";
  context: Context;
};

// --- DEFINICIÓN DEL INTÉRPRETE Y EL ESTADO PARA REACT ---
export type MachineInterpreter = Interpreter<
  Context,
  any,
  DungeonEvent,
  PortalState
>;

export type PortalMachineState = State<Context, DungeonEvent, PortalState>;

// --- LA MÁQUINA ---
export const portalMachine = createMachine<Context, DungeonEvent, PortalState>({
  id: "deep_dungeon",
  initial: "initialising",
  context: {
    id: 0,
    jwt: getJwt(),
    state: CONFIG.API_URL ? undefined : OFFLINE_FARM,
    stats: {
      energy: 100,
      maxEnergy: 100,
      currentLevel: 1,
      inventory: { pickaxe: 1 },
      targetScore: 0,
      attack: 1,
      defense: 1,
      criticalChance: 0.1,
    },
    codex: {
      enemiesDefeated: {},
      crystalsMined: {},
      trapsTriggered: 0,
    },
    levelProgress: {
      enemies: {},
      crystals: {},
    },
    dungeonPoints: 0, // Nueva variable para gastar
    rerollCost: 100,
    showCardSelector: false,
    startedAt: 0,
  },
  states: {
    initialising: {
      always: [
        { target: "loading", cond: (ctx) => !CONFIG.API_URL || !!ctx.jwt },
        { target: "unauthorised" },
      ],
    },
    loading: {
      invoke: {
        src: async (ctx) => {
          if (!getUrl()) return { game: OFFLINE_FARM, farmId: 0 };
          const { game } = await loadPortal({
            portalId: CONFIG.PORTAL_APP,
            token: ctx.jwt as string,
          });
          const { farmId } = decodeToken(ctx.jwt as string);
          return { game, farmId };
        },
        onDone: {
          target: "playing",
          actions: assign({
            state: (_, event) => event.data.game,
            id: (_, event) => event.data.farmId,
            startedAt: () => Date.now(),
          }),
        },
        onError: { target: "error" },
      },
    },
    playing: {
      on: {
        UPDATE_STATS: {
          actions: assign({
            stats: (ctx, event) => ({
              ...ctx.stats,
              ...event.stats,
              inventory: {
                ...ctx.stats.inventory,
                ...(event.stats?.inventory || {}),
              },
            }),
          }),
        },
        ITEM_COLLECTED: {
          actions: assign({
            stats: (ctx, event: any) => {
              const { itemKey } = event;
              const config =
                DROP_ITEMS_CONFIG[itemKey as keyof typeof DROP_ITEMS_CONFIG];

              // Si el ítem no existe en nuestra config, devolvemos las stats como estaban
              if (!config) return ctx.stats;

              // Creamos una copia profunda para evitar mutaciones raras
              const newStats = JSON.parse(JSON.stringify(ctx.stats));

              // ¡EJECUTAMOS LA ACCIÓN QUE TÚ ESCRIBISTE EN LA CONSTANTE!
              config.action(newStats);

              return newStats;
            },
          }),
        },
        HIT_TRAP: [
          {
            // Si la energía llega a 0, NO cambiamos de estado todavía.
            // Solo actualizamos la energía a 0. La escena detectará esto.
            cond: (ctx, event) => ctx.stats.energy - event.damage <= 0,
            actions: assign({
              stats: (ctx, event) => ({
                ...ctx.stats,
                energy: 0,
              }),
            }),
          },
          {
            actions: assign({
              stats: (ctx, event) => ({
                ...ctx.stats,
                energy: Math.max(0, ctx.stats.energy - event.damage),
              }),
              codex: (ctx) => ({
                ...ctx.codex,
                trapsTriggered: ctx.codex.trapsTriggered + 1,
              }),
            }),
          },
        ],
        ADD_ENERGY: {
          actions: assign({
            stats: (ctx, event: any) => {
              const amount = event.amount || 0;
              // Calculamos la nueva energía sin pasarnos del máximo
              const newEnergy = Math.min(
                ctx.stats.maxEnergy,
                ctx.stats.energy + amount,
              );

              return {
                ...ctx.stats,
                energy: newEnergy,
              };
            },
          }),
        },
        ENEMY_KILLED: {
          actions: assign((context, event: any) => {
            const type = (
              event.enemyType ||
              event.enemyName ||
              ""
            ).toLowerCase();
            if (!type) return {};

            const currentLevelCount = context.levelProgress.enemies[type] || 0;
            const currentGlobalCount = context.codex.enemiesDefeated[type] || 0;

            //console.log(`[MACHINE] Muerte detectada: ${type}. Nivel: ${currentLevelCount} -> ${currentLevelCount + 1}`);

            // Retornamos el nuevo estado de una sola vez
            return {
              levelProgress: {
                ...context.levelProgress,
                enemies: {
                  ...context.levelProgress.enemies,
                  [type]: currentLevelCount + 1,
                },
              },
              codex: {
                ...context.codex,
                enemiesDefeated: {
                  ...context.codex.enemiesDefeated,
                  [type]: currentGlobalCount + 1,
                },
              },
            };
          }),
        },
        CRYSTAL_MINED: {
          actions: assign({
            levelProgress: (context, event: any) => {
              const { crystalType, shapeId } = event;
              const itemKey = `${crystalType}_crystal_${shapeId}`;
              return {
                ...context.levelProgress,
                crystals: {
                  ...context.levelProgress.crystals,
                  [itemKey]:
                    ((context.levelProgress.crystals as Record<string, number>)[
                      itemKey
                    ] || 0) + 1,
                },
              };
            },
            codex: (context, event: any) => {
              const { crystalType, shapeId } = event;
              const itemKey = `${crystalType}_crystal_${shapeId}`;
              const currentCrystals = context.codex.crystalsMined || {};
              return {
                ...context.codex,
                crystalsMined: {
                  ...currentCrystals,
                  [itemKey]:
                    ((currentCrystals as Record<string, number>)[itemKey] ||
                      0) + 1,
                },
              };
            },
            stats: (context, event: any) => {
              const { crystalType, shapeId } = event;
              const itemKey = `${crystalType}_crystal_${shapeId}`;
              const pointsToAdd =
                DUNGEON_POINTS.CRYSTALS[
                  itemKey as keyof typeof DUNGEON_POINTS.CRYSTALS
                ] || 0;
              return {
                ...context.stats,
                targetScore: context.stats.targetScore + pointsToAdd, // <--- SUMA AL SCORE
                inventory: {
                  ...context.stats.inventory,
                  [itemKey]:
                    ((context.stats.inventory as Record<string, number>)[
                      itemKey
                    ] || 0) + 1,
                },
              };
            },
            dungeonPoints: (context, event: any) => {
              const { crystalType, shapeId } = event;
              const itemKey = `${crystalType}_crystal_${shapeId}`;
              const pointsToAdd =
                DUNGEON_POINTS.CRYSTALS[
                  itemKey as keyof typeof DUNGEON_POINTS.CRYSTALS
                ] || 0;

              return context.dungeonPoints + pointsToAdd; // <--- SUMA A LOS PUNTOS DE GASTO
            },
          }),
        },
        PICKAXE_FOUND: {
          actions: assign({
            stats: (context) => ({
              ...context.stats,
              inventory: {
                ...context.stats.inventory,
                pickaxe: (context.stats.inventory.pickaxe || 0) + 1,
              },
            }),
          }),
        },
        ADD_POINTS: {
          actions: assign({
            stats: (ctx, event: any) => ({
              ...ctx.stats,
              targetScore: (ctx.stats.targetScore || 0) + (event.amount || 0),
            }),
            dungeonPoints: (ctx, event: any) =>
              (ctx.dungeonPoints || 0) + (event.amount || 0),
          }),
        },
        NEXT_MAP: {
          actions: assign({
            stats: (ctx, event: any) => {
              // Usamos el nivel que viene del evento, o sumamos 1 si no viene nada (por seguridad)
              const nextLevel = event.level;

              // Si el evento no trae nivel o si el nivel es el mismo que ya tenemos, NO HACEMOS NADA.
              // Esto evita que al elegir la carta se sume un +1 accidental.
              if (!nextLevel || nextLevel === ctx.stats.currentLevel) {
                return ctx.stats;
              }
              return {
                ...ctx.stats,
                currentLevel: nextLevel,
                // Curamos un poco de energía al pasar de nivel
                energy: Math.min(ctx.stats.maxEnergy, ctx.stats.energy + 15),
                // Sumamos los puntos por completar el nivel anterior
                targetScore:
                  ctx.stats.targetScore +
                  DUNGEON_POINTS.LEVEL_REWARD(ctx.stats.currentLevel),
              };
            },
            // Resetear el progreso específico del piso que acabamos de dejar
            levelProgress: {
              enemies: {},
              crystals: {},
            },
            // Sumar puntos de recompensa a la moneda de la tienda
            dungeonPoints: (ctx) =>
              ctx.dungeonPoints +
              DUNGEON_POINTS.LEVEL_REWARD(ctx.stats.currentLevel),
          }),
        },
        OPEN_CARD_SELECTOR: {
          actions: assign({ showCardSelector: true }),
        },
        ON_REROLL: {
          // Solo permite si tiene puntos suficientes
          cond: (ctx) => ctx.dungeonPoints >= ctx.rerollCost,
          actions: assign({
            // RESTA puntos de la moneda, pero NO del targetScore
            dungeonPoints: (ctx) => ctx.dungeonPoints - ctx.rerollCost,
            // Duplica el coste del siguiente
            rerollCost: (ctx) => ctx.rerollCost * 2,
          }),
        },

        APPLY_CARD_BONUS: {
          actions: assign({
            showCardSelector: false, // <--- AGREGAR ESTO PARA QUE SE CIERRE AL ELEGIR
            stats: (ctx, event: any) => {
              const { bonus } = event;
              const newMaxEnergy = ctx.stats.maxEnergy + (bonus.maxEnergy || 0);
              return {
                ...ctx.stats,

                maxEnergy: newMaxEnergy,
                energy: Math.min(
                  newMaxEnergy,
                  ctx.stats.energy + (bonus.energy || 0),
                ),
                attack: ctx.stats.attack + (bonus.attack || 0),
                defense: ctx.stats.defense + (bonus.defense || 0),
                criticalChance: ctx.stats.criticalChance + (bonus.crit || 0),
                inventory: {
                  ...ctx.stats.inventory,
                  pickaxe:
                    (ctx.stats.inventory.pickaxe || 0) + (bonus.pickaxe || 0),
                },
              };
            },
          }),
        },
        GAME_OVER: "gameOver",
      }, // <-- ESTE CIERRA EL BLOQUE 'on' de 'playing'
    }, // <-- ESTE CIERRA EL ESTADO 'playing'
    gameOver: {
      on: {
        RETRY: {
          target: "initialising",
          actions: assign((context) => ({
            // Resetamos las stats al valor inicial
            stats: {
              energy: 100,
              maxEnergy: 100,
              currentLevel: 1,
              inventory: { pickaxe: 1 },
              targetScore: 0,
              attack: 1,
              defense: 1,
              criticalChance: 0.1,
            },
            // Limpiamos el progreso del nivel actual
            levelProgress: {
              enemies: {},
              crystals: {},
            },
            // Opcional: ¿Quieres resetear los puntos totales o mantenerlos?
            // Si quieres resetearlos, ponlos a 0 aquí:
            dungeonPoints: 0,
            rerollCost: 100,
          })),
        },
      },
    },
    winner: {},
    loser: {},
    complete: {},
    error: {},
    unauthorised: {},
  },
});
