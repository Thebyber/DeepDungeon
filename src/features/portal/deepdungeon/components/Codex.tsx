import React from "react";

interface CodexProps {
  enemies: any[];
  items: any[];
  onClose: () => void;
}

const Codex: React.FC<CodexProps> = ({ enemies, items, onClose }) => {
  // Agrupar enemigos por nombre para las estadísticas
  const groupedEnemies = enemies.reduce((acc, enemy) => {
    const name = enemy.stats.name;
    if (!acc[name]) acc[name] = { count: 0, stats: enemy.stats };
    acc[name].count++;
    return acc;
  }, {} as any);

  return (
    <div className="codex-overlay">
      <div className="codex-window">
        <button className="close-btn" onClick={onClose}>{`X`}</button>
        <h1>{`--- CODEX ---`}</h1>

        <section>
          <h2>{`ENEMIES`}</h2>
          {Object.keys(groupedEnemies).map((name) => (
            <div key={name} className="enemy-row">
              <div className="enemy-main">
                <span className="enemy-name">
                  {name} {`(x${groupedEnemies[name].count})`}
                </span>
                <p>
                  {`HP: `}
                  {groupedEnemies[name].stats.hp} {`| DEF: `}
                  {groupedEnemies[name].stats.defense}
                </p>
              </div>
              <div className="drops-list">
                <span>{`Drops:`}</span>
                {groupedEnemies[name].stats.lootTable.map((loot: any) => (
                  <img
                    key={loot.key}
                    src={`assets/icons/${loot.key.toLowerCase()}.png`}
                    title={loot.key}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2>{`DISCOVERABLE ITEMS`}</h2>
          <div className="items-grid">
            {/* Aquí mapeas tus cristales y picos del mapa */}
            {items.map((item, i) => (
              <div key={i} className="item-slot">
                <img src={`assets/icons/${item.texture.key}.png`} />
                <span>{`x1`}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Codex;
