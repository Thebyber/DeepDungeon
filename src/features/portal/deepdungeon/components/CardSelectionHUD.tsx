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
import { getRandomCard, Card } from "../DeepDungeonConstants";

export const CardSelectionHUD: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

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

  // Función para calcular el brillo según la rareza
  const getCardGlow = (card: Card) => {
    if (card.type === "Legendary") return `0 0 20px ${card.color}`;
    if (card.type === "Epic") return `0 0 20px ${card.color}`;
    if (card.type === "Rare") return `0 0 20px ${card.color}`;
    return "none"; // Las comunes no brillan
  };

  // --- NUEVA FUNCIÓN PARA EL COLOR DE FONDO ---
  const getCardBackground = (type: string) => {
    switch (type) {
      case "Rare":
        return "#6985ff"; // Azul suave
      case "Epic":
        return "#ca67ff"; // Morado suave
      case "Legendary":
        return "#fce46b"; // Dorado suave
      default:
        return "#c7c7c7"; // Tu color original (Común)
    }
  };

  return (
    <Modal show={true}>
      <OuterPanel className="bg-[#ead4aa] p-3 text-center">
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
                // CAMBIO AQUÍ: Color de fondo dinámico respetando tu estilo
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
                src={
                  card.icon === "attack"
                    ? SUNNYSIDE.icons.sword
                    : card.icon === "lightning"
                      ? SUNNYSIDE.icons.lightning
                      : card.icon === "crit"
                        ? "world/DeepDungeonAssets/crit.png"
                        : card.icon === "defense"
                          ? "world/DeepDungeonAssets/shield.png"
                          : card.icon === "pickaxe"
                            ? "world/DeepDungeonAssets/pickaxe.png"
                            : SUNNYSIDE.icons.expression_confused
                }
                className="w-9 my-2"
                alt={card.icon}
              />
              <div className="text-[5px] font-pixel text-brown-800 bg-black/5 w-full py-1 rounded mt-auto">
                {Object.entries(card.bonus as Record<string, number>).map(
                  ([key, val]) => {
                    // Definimos qué llaves queremos que se muestren como porcentaje
                    const isPercentage =
                      key === "crit" || key === "criticalChance";

                    return (
                      <p key={key} className="leading-tight">
                        {`+`}
                        {/* Si es porcentaje, multiplicamos por 100 y añadimos %, si no, mostramos val normal */}
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
  );
};
