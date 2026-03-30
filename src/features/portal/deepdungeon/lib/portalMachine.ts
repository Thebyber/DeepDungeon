import { assign, createMachine, Interpreter, State } from "xstate";
import { CONFIG } from "lib/config";
import { OFFLINE_FARM } from "features/game/lib/landData";
import { decodeToken } from "features/auth/actions/login";
import { getUrl, loadPortal } from "../../actions/loadPortal";

// --- TUS INTERFACES ---
import { PlayerStats } from "./playerState";
import {
  DAILY_ATTEMPTS,
  DROP_ITEMS_CONFIG,
  DUNGEON_POINTS,
  UNLIMITED_ATTEMPTS_COST,
  RESTOCK_ATTEMPTS_COST,
  DropKey,
  PORTAL_NAME,
} from "../DeepDungeonConstants";
import { getAttemptsLeft } from "./DeepDungeonUtils";
import { GameState } from "features/game/types/game";
import { purchaseMinigameItem } from "features/game/events/minigames/purchaseMinigameItem";
import { startMinigameAttempt } from "features/game/events/minigames/startMinigameAttempt";
import { submitMinigameScore } from "features/game/events/minigames/submitMinigameScore";
import { submitScore, startAttempt } from "features/portal/lib/portalUtil";

export const getJwt = () => {
  const code = new URLSearchParams(window.location.search).get("jwt");
  return code;
};

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
  endAt: number;
  score: number;
  attemptsRemaining: number;
  lastScore: number;
}

export type DungeonEvent =
  | { type: "START" }
  | { type: "CANCEL_PURCHASE" }
  | { type: "PURCHASED_RESTOCK" }
  | { type: "PURCHASED_UNLIMITED" }
  | { type: "UPDATE_STATS"; stats: Partial<PlayerStats> }
  | { type: "HIT_TRAP"; damage: number }
  | { type: "ADD_ENERGY"; amount: number }
  | { type: "CONSUME_ENERGY"; amount: number }
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
  | { type: "RETRY" }
  | { type: "CONTINUE" }
  | { type: "END_GAME_EARLY" };

// --- DEFINICIÓN DE LOS ESTADOS (PORTAL STATE) ---
export type PortalState = {
  value:
    | "initialising"
    | "error"
    | "ready"
    | "unauthorised"
    | "loading"
    | "introduction"
    | "playing"
    | "gameOver"
    | "winner"
    | "loser"
    | "complete"
    | "starting"
    | "noAttempts";
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

const resetGameTransition = {
  RETRY: {
    target: "starting",
    actions: assign({
      // Resetamos las stats al valor inicial
      stats: {
        energy: 100,
        maxEnergy: 100,
        currentLevel: 1,
        inventory: { pickaxe: 1 },
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
      score: 0,
      rerollCost: 100,
      startedAt: 0,
    }),
  },
};

// --- LA MÁQUINA ---
export const portalMachine = createMachine<Context, DungeonEvent, PortalState>({
  id: "portalMachine",
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
    endAt: 0,
    score: 0,
    attemptsRemaining: 0,
    lastScore: 0,
  },
  states: {
    initialising: {
      always: [
        {
          target: "unauthorised",
          // TODO: Also validate token
          cond: (context) => !!CONFIG.API_URL && !context.jwt,
        },
        {
          target: "loading",
        },
      ],
    },
    loading: {
      id: "loading",
      invoke: {
        src: async (context) => {
          if (!getUrl()) {
            return { game: OFFLINE_FARM, attemptsRemaining: DAILY_ATTEMPTS };
          }

          const { farmId } = decodeToken(context.jwt as string);

          const { game } = await loadPortal({
            portalId: CONFIG.PORTAL_APP,
            token: context.jwt as string,
          });

          const minigame = game.minigames.games[PORTAL_NAME];
          const attemptsRemaining = getAttemptsLeft(minigame);

          return { game, farmId, attemptsRemaining };
        },
        onDone: [
          {
            target: "introduction",
            actions: assign({
              state: (_: Context, event) => event.data.game,
              id: (_: Context, event) => event.data.farmId,
              attemptsRemaining: (_: Context, event) =>
                event.data.attemptsRemaining,
            }),
          },
        ],
        onError: {
          target: "error",
        },
      },
    },
    noAttempts: {
      on: {
        CANCEL_PURCHASE: {
          target: "introduction",
        },
        PURCHASED_RESTOCK: {
          target: "introduction",
          actions: assign<Context>({
            state: (context: Context) =>
              purchaseMinigameItem({
                state: context.state as GameState,
                action: {
                  id: PORTAL_NAME,
                  sfl: RESTOCK_ATTEMPTS_COST,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }),
        },
        PURCHASED_UNLIMITED: {
          target: "introduction",
          actions: assign<Context>({
            state: (context: Context) =>
              purchaseMinigameItem({
                state: context.state as GameState,
                action: {
                  id: PORTAL_NAME,
                  sfl: UNLIMITED_ATTEMPTS_COST,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }),
        },
      },
    },
    starting: {
      always: [
        {
          target: "noAttempts",
          cond: (context) => {
            const minigame = context.state?.minigames.games[PORTAL_NAME];
            const attemptsRemaining = getAttemptsLeft(minigame);
            return attemptsRemaining <= 0;
          },
        },
        {
          target: "ready",
        },
      ],
    },
    introduction: {
      on: {
        CONTINUE: {
          target: "starting",
        },
      },
    },
    ready: {
      on: {
        START: {
          target: "playing",
          actions: assign({
            startedAt: () => Date.now(),
            score: 0,
            state: (context: Context) => {
              startAttempt();
              return startMinigameAttempt({
                state: context.state as GameState,
                action: {
                  type: "minigame.attemptStarted",
                  id: PORTAL_NAME,
                },
              });
            },
            attemptsRemaining: (context: Context) =>
              context.attemptsRemaining - 1,
          }),
        },
      },
    },
    playing: {
      on: {
        UPDATE_STATS: {
          actions: assign({
            stats: (ctx, event: any) => ({
              ...ctx.stats,
              ...(event.stats || {}),
              inventory: {
                ...(ctx.stats.inventory || {}),
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
            target: "loser",
            cond: (context) => context.stats.energy - 10 <= 0, // Simplifica para probar
            actions: assign({
              stats: (context) => ({
                ...context.stats,
                energy: 0,
              }),
            }),
          },
          {
            actions: assign({
              stats: (context, event: any) => {
                const damage = event.damage ?? 10;
                return {
                  ...context.stats, // <--- CLAVE: Copia el objeto anterior
                  energy: Math.max(0, context.stats.energy - damage), // <--- CLAVE: Crea la nueva referencia
                };
              },
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
        CONSUME_ENERGY: {
          actions: assign({
            stats: (ctx, event: any) => ({
              ...ctx.stats,
              energy: Math.max(0, ctx.stats.energy - (event.amount || 1)),
            }),
          }),
        },
        ENEMY_KILLED: {
          actions: assign((context, event: any) => {
            const type = (
              event.enemyType ||
              event.enemyName ||
              ""
            ).toLowerCase();
            if (!type) return context;

            //console.log(`[MACHINE] Muerte detectada: ${type}. Nivel: ${currentLevelCount} -> ${currentLevelCount + 1}`);

            // Retornamos el nuevo estado de una sola vez
            return {
              ...context,
              levelProgress: {
                ...context.levelProgress,
                enemies: {
                  ...context.levelProgress.enemies,
                  [type]: (context.levelProgress.enemies[type] || 0) + 1,
                },
              },
              codex: {
                ...context.codex,
                enemiesDefeated: {
                  ...context.codex.enemiesDefeated,
                  [type]: (context.codex.enemiesDefeated[type] || 0) + 1,
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
                inventory: {
                  ...context.stats.inventory,
                  [itemKey]:
                    ((context.stats.inventory as Record<string, number>)[
                      itemKey
                    ] || 0) + 1,
                },
              };
            },
            score: (context, event: any) => {
              const { crystalType, shapeId } = event;
              const itemKey = `${crystalType}_crystal_${shapeId}`;
              const pointsToAdd =
                DUNGEON_POINTS.CRYSTALS[
                  itemKey as keyof typeof DUNGEON_POINTS.CRYSTALS
                ] || 0;

              return context.score + pointsToAdd; // <--- SUMA AL SCORE
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
                // Asegúrate de que no explote si inventory es undefined
                pickaxe: (context.stats.inventory?.pickaxe || 0) + 1,
              },
            }),
          }),
        },
        ADD_POINTS: {
          actions: assign({
            score: (ctx, event: any) => (ctx.score || 0) + (event.amount || 0),
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
              };
            },
            score: (ctx) =>
              ctx.score + DUNGEON_POINTS.LEVEL_REWARD(ctx.stats.currentLevel),
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
            // RESTA puntos de la moneda, pero NO del score
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
        END_GAME_EARLY: {
          actions: assign({
            startedAt: () => 0,
            lastScore: (context: Context) => {
              return context.score;
            },
            state: (context: Context) => {
              submitScore({ score: context.score });
              return submitMinigameScore({
                state: context.state as GameState,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: context.score,
                  id: PORTAL_NAME,
                },
              });
            },
          }),
          target: "gameOver",
        },
        GAME_OVER: {
          target: "gameOver",
          actions: assign({
            lastScore: (context: Context) => {
              return context.score;
            },
            state: (context: Context) => {
              submitScore({ score: Math.round(context.score) });
              return submitMinigameScore({
                state: context.state as GameState,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(context.score),
                  id: PORTAL_NAME,
                },
              });
            },
          }),
        },
      }, // <-- ESTE CIERRA EL BLOQUE 'on' de 'playing'
    }, // <-- ESTE CIERRA EL ESTADO 'playing'
    gameOver: {
      always: [
        {
          target: "complete",
          cond: (context) => {
            const dateKey = new Date().toISOString().slice(0, 10);

            const minigame = context.state?.minigames.games[PORTAL_NAME];
            const history = minigame?.history ?? {};

            return !!history[dateKey]?.prizeClaimedAt;
          },
          actions: assign({
            // Resetamos las stats al valor inicial
            stats: {
              energy: 100,
              maxEnergy: 100,
              currentLevel: 1,
              inventory: { pickaxe: 1 },
              attack: 1,
              defense: 1,
              criticalChance: 0.1,
            },
            levelProgress: { enemies: {}, crystals: {} },
            dungeonPoints: 0,
            score: 0,
            rerollCost: 100,
            startedAt: 0,
          }) as any,
        },

        {
          target: "winner",
          cond: (context) => {
            const prize = context.state?.minigames.prizes[PORTAL_NAME];
            if (!prize) {
              return false;
            }

            return context.score >= prize.score;
          },
          actions: assign({
            // Resetamos las stats al valor inicial
            stats: {
              energy: 100,
              maxEnergy: 100,
              currentLevel: 1,
              inventory: { pickaxe: 1 },
              attack: 1,
              defense: 1,
              criticalChance: 0.1,
            },
            levelProgress: { enemies: {}, crystals: {} },
            dungeonPoints: 0,
            score: 0,
            rerollCost: 100,
            startedAt: 0,
          }) as any,
        },
        {
          target: "loser",
          actions: assign({
            // Resetamos las stats al valor inicial
            stats: {
              energy: 100,
              maxEnergy: 100,
              currentLevel: 1,
              inventory: { pickaxe: 1 },
              attack: 1,
              defense: 1,
              criticalChance: 0.1,
            },
            levelProgress: { enemies: {}, crystals: {} },
            dungeonPoints: 0,
            score: 0,
            rerollCost: 100,
            startedAt: 0,
          }) as any,
        },
      ],
    },
    winner: {
      on: resetGameTransition,
    },

    loser: {
      on: resetGameTransition,
    },

    complete: {
      on: resetGameTransition,
    },

    error: {
      on: {
        RETRY: {
          target: "initialising",
        },
      },
    },

    unauthorised: {},
  },
});
