import React, { useState, useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";

// Componentes UI de Sunflower Land
import { Modal } from "components/ui/Modal";
import { OuterPanel, InnerPanel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";

// Lógica de cartas y tipos
import { getRandomCard, Card, CARD_POOL } from "../DeepDungeonConstants";

const RARITY_INFO: {
  type: Card["type"];
  label: string;
  chance: string;
  color: string;
  bg: string;
}[] = [
  {
    type: "Legendary",
    label: "LEGENDARY",
    chance: "3%",
    color: "#ff8c00",
    bg: "#fce46b",
  },
  {
    type: "Epic",
    label: "EPIC",
    chance: "12%",
    color: "#b145e5",
    bg: "#ca67ff",
  },
  {
    type: "Rare",
    label: "RARE",
    chance: "25%",
    color: "#4592e5",
    bg: "#6985ff",
  },
  {
    type: "Common",
    label: "COMMON",
    chance: "60%",
    color: "#aaaaaa",
    bg: "#c7c7c7",
  },
];

const getCardIcon = (icon: Card["icon"]) => {
  switch (icon) {
    case "attack":
      return SUNNYSIDE.icons.sword;
    case "lightning":
      return SUNNYSIDE.icons.lightning;
    case "crit":
      return "world/DeepDungeonAssets/crit.png";
    case "defense":
      return "world/DeepDungeonAssets/shield.png";
    case "pickaxe":
      return "world/DeepDungeonAssets/pickaxe.png";
    default:
      return SUNNYSIDE.icons.expression_confused;
  }
};

export const CardSelectionHUD: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);
  const [showCatalog, setShowCatalog] = useState(false);

  const [cards, setCards] = useState<Card[]>([
    getRandomCard(),
    getRandomCard(),
    getRandomCard(),
  ]);

  const playUISound = (fileName: string) => {
    const audio = new Audio(`/world/DeepDungeonAssets/${fileName}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const handleReroll = () => {
    playUISound("reroll_cards");
    portalService.send("ON_REROLL");
    setCards([getRandomCard(), getRandomCard(), getRandomCard()]);
  };

  const selectCard = (card: Card) => {
    playUISound("card_sound");
    portalService.send("APPLY_CARD_BONUS", { bonus: card.bonus });
    portalService.send("NEXT_MAP");
  };

  const { dungeonPoints, rerollCost } = portalState.context;

  const getCardGlow = (card: Card) => {
    if (card.type === "Legendary") return `0 0 20px ${card.color}`;
    if (card.type === "Epic") return `0 0 20px ${card.color}`;
    if (card.type === "Rare") return `0 0 20px ${card.color}`;
    return "none";
  };

  const getCardBackground = (type: string) => {
    switch (type) {
      case "Rare":
        return "#6985ff";
      case "Epic":
        return "#ca67ff";
      case "Legendary":
        return "#fce46b";
      default:
        return "#c7c7c7";
    }
  };

  return (
    <>
      <Modal show={true}>
        <OuterPanel className="bg-[#ead4aa] p-3 text-center relative">
          {/* Botón de ayuda "?" */}
          <div
            className="absolute top-2 right-2 cursor-pointer hover:scale-110 transition-transform"
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "#4592e5",
              border: "2px solid #2a5fa0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowCatalog(true)}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "13px",
                fontFamily: "monospace",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              {"?"}
            </span>
          </div>

          <Label type="formula" className="mb-4 uppercase tracking-wide">
            {`Choose one of the three benefits!`}
          </Label>

          <div className="flex gap-3 justify-center mb-5">
            {cards.map((card, i) => (
              <OuterPanel
                key={`${card.name}-${i}`}
                onClick={() => selectCard(card)}
                className="w-40 p-2 cursor-pointer hover:scale-105 transition-all flex flex-col items-center"
                style={{
                  borderColor: card.color,
                  borderStyle: "solid",
                  borderWidth: "4px",
                  boxShadow: getCardGlow(card),
                  backgroundColor: getCardBackground(card.type),
                }}
              >
                <p
                  className="font-pixel mb-1 uppercase"
                  style={{
                    color: card.color,
                    fontSize: `20px`,
                    textAlign: "center",
                    textShadow:
                      "1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000",
                    letterSpacing: "1.5px",
                  }}
                >
                  {card.type}
                </p>

                <img
                  src={getCardIcon(card.icon)}
                  className="w-9 my-2"
                  alt={card.icon}
                />
                <div className="text-[5px] font-pixel text-brown-800 bg-black/5 w-full py-1 rounded mt-auto">
                  {Object.entries(card.bonus as Record<string, number>).map(
                    ([key, val]) => {
                      const isPercentage =
                        key === "crit" || key === "criticalChance";
                      return (
                        <p key={key} className="leading-tight">
                          {`+`}
                          {isPercentage ? `${val * 100}%` : val} {key}
                        </p>
                      );
                    },
                  )}
                </div>
              </OuterPanel>
            ))}
          </div>

          <InnerPanel className="p-3 bg-[#ead4aa] flex flex-col items-center">
            <Button
              disabled={dungeonPoints < rerollCost}
              onClick={handleReroll}
              className="mb-2"
            >
              <div className="flex items-center gap-2 justify-center">
                <span>{`REROLL`}</span>
                <span className="text-yellow-500">
                  {rerollCost} {`pts`}
                </span>
              </div>
            </Button>

            <p className="font-pixel text-[8px] text-brown-700">
              {`Your points:`}{" "}
              <span className="text-brown-900 font-bold">{dungeonPoints}</span>
            </p>
          </InnerPanel>
        </OuterPanel>
      </Modal>

      {/* Modal catálogo de cartas */}
      <Modal show={showCatalog} onHide={() => setShowCatalog(false)}>
        <OuterPanel className="bg-[#ead4aa] p-3">
          <div className="flex items-center justify-between mb-3">
            <Label type="formula" className="uppercase">
              {`Card Drop Catalog`}
            </Label>
            <img
              src={SUNNYSIDE.icons.close}
              className="cursor-pointer"
              style={{ width: "22px" }}
              onClick={() => setShowCatalog(false)}
            />
          </div>

          <div
            className="overflow-y-auto scrollable pr-1"
            style={{ maxHeight: "380px" }}
          >
            {RARITY_INFO.map((rarity) => {
              const cardsOfRarity = CARD_POOL.filter(
                (c) => c.type === rarity.type,
              );
              const perCard =
                cardsOfRarity.length > 0
                  ? (parseFloat(rarity.chance) / cardsOfRarity.length).toFixed(
                      1,
                    )
                  : "0";

              return (
                <div key={rarity.type} className="mb-4">
                  {/* Cabecera de rareza */}
                  <div
                    className="flex items-center gap-2 px-2 py-1 rounded mb-2"
                    style={{ backgroundColor: rarity.bg }}
                  >
                    <span
                      className="font-pixel uppercase text-[10px]"
                      style={{
                        color: rarity.color,
                        textShadow:
                          "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                      }}
                    >
                      {rarity.label}
                    </span>
                    <span
                      className="font-pixel text-[9px] text-white ml-auto"
                      style={{ textShadow: "1px 1px 0 #000" }}
                    >
                      {rarity.chance} {`rarity`}
                    </span>
                  </div>

                  {/* Cartas de esa rareza */}
                  <div className="flex flex-wrap gap-1 px-1">
                    {cardsOfRarity.map((card) => (
                      <div
                        key={card.name}
                        className="flex items-center gap-1 px-2 py-1 rounded"
                        style={{
                          backgroundColor: rarity.bg + "55",
                          border: `1px solid ${rarity.color}`,
                          minWidth: "120px",
                        }}
                      >
                        <img
                          src={getCardIcon(card.icon)}
                          style={{ width: "12px", height: "12px" }}
                          alt={card.icon}
                        />
                        <span className="font-pixel text-[7px] text-brown-900">
                          {card.name}
                        </span>
                        <span
                          className="font-pixel text-[6px] ml-auto"
                          style={{ color: rarity.color }}
                        >
                          {perCard}
                          {`%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </OuterPanel>
      </Modal>
    </>
  );
};
