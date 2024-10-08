import React from "react";
import styled from "styled-components";

const prayerStrengthMultiplier = {
  burstOfStrength: 1.05,
  superhumanStrength: 1.1,
  ultimateStrength: 1.15,
  chivalry: 1.18,
  piety: 1.23,
};

const prayerAttackMultiplier = {
  clarityOfThought: 1.05,
  improvedReflexes: 1.1,
  incredibleReflexes: 1.15,
  chivalry: 1.15,
  piety: 1.2,
};

const styleStrengthBoost = {
  defence: 0,
  accurate: 0,
  aggressive: 3,
  controlled: 1,
};

const styleAttackBoost = {
  defence: 0,
  accurate: 3,
  aggressive: 0,
  controlled: 0,
};

const calculateDamageInfo = ({
  strengthLevel,
  attackLevel,
  attackTime,
  meleeStrengthBonus,
  equipmentAttackBonus,
  enemyDefence,
  enemyTypeDefenceBonus,
  strengthBoost = 0,
  attackBoost = 0,
  combatStyle = "defence",
  prayers = [],
  fullMeleeVoid = false,
}) => {
  const prayerStrengthBoost = prayers.reduce(
    (boost, prayer) => boost * (prayerStrengthMultiplier[prayer] || 1.0),
    1.0
  );
  const effectiveStrength = Math.floor(
    (Math.floor((strengthLevel + strengthBoost) * prayerStrengthBoost) +
      styleStrengthBoost[combatStyle] +
      8) *
      (fullMeleeVoid ? 1.1 : 1.0)
  );
  const maxHit = Math.floor(
    (effectiveStrength * (meleeStrengthBonus + 64) + 320) / 640
  );

  const prayerAttackBoost = prayers.reduce(
    (boost, prayer) => boost * (prayerAttackMultiplier[prayer] || 1.0),
    1.0
  );
  const effectiveAttack = Math.floor(
    (Math.floor((attackLevel + attackBoost) * prayerAttackBoost) +
      styleAttackBoost[combatStyle] +
      8) *
      (fullMeleeVoid ? 1.1 : 1.0)
  );
  const attackRoll = Math.floor(effectiveAttack * (equipmentAttackBonus + 64));

  const defenceRoll = (enemyDefence + 9) * (enemyTypeDefenceBonus + 64);
  const hitChance =
    attackRoll > defenceRoll
      ? 1 - (defenceRoll + 2.0) / (2 * (attackRoll + 1))
      : attackRoll / (2.0 * defenceRoll + 1);

  const damagePerHit = (maxHit * hitChance) / 2.0;
  const dps = damagePerHit / attackTime;

  return {
    dps,
    hitChance,
    maxHit,
    damagePerHit,
  };
};

const StyledSelect = styled.select`
  background: transparent;
  font-size: 20px;
  border-radius: 3px;
  padding: 3px;
  color: white;
`;

const DamageStat = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid white;
  padding: 16px;
`;

const EnemyStatCollection = ({ onChange }) => {
  // TODO
  return <div></div>;
};

const WeaponStatCollection = ({ onChange }) => {
  // TODO
  return <div></div>;
};

const EquipmentStatCollection = ({ onChange }) => {
  // TODO
  return <div></div>;
};

const Combat = ({ statsData, getLevel }) => {
  const [combatStyle, setCombatStyle] = React.useState("defence");
  const [combatType, setCombatType] = React.useState("stab");
  const [enemyStats, setEnemyStats] = React.useState({
    defence: 1,
    typeDefenseBonuses: { stab: 0, slash: 0, crush: 0 },
  });
  const [weaponStats, setWeaponStats] = React.useState({
    attackSpeed: 2.4,
    strengthBonus: 63,
    attackBonuses: { stab: 65, slash: 55, crush: -2 },
  });
  const [equipmentStats, setEquipmentStats] = React.useState({
    strengthBonus: 9,
    attackBonuses: { stab: 10, slash: 6, crush: 6 },
  });

  const { dps, maxHit, damagePerHit, hitChance } = calculateDamageInfo({
    strengthLevel: getLevel(statsData["strength"]),
    attackLevel: getLevel(statsData["attack"]),
    attackTime: weaponStats.attackSpeed,
    meleeStrengthBonus:
      weaponStats.strengthBonus + equipmentStats.strengthBonus,
    equipmentAttackBonus:
      weaponStats.attackBonuses[combatType] +
      equipmentStats.attackBonuses[combatType],
    enemyDefence: enemyStats.defence,
    enemyTypeDefenceBonus: enemyStats.typeDefenseBonuses[combatType],
    combatStyle,
  });

  return (
    <>
      <h1>Combat calculator</h1>
      <div style={{ display: "flex" }}>
        <DamageStat>
          <span>Max hit</span>
          <span>{maxHit}</span>
        </DamageStat>
        <DamageStat>
          <span>Hit chance</span>
          <span>{hitChance.toFixed(2)}</span>
        </DamageStat>
        <DamageStat>
          <span>Damage per hit</span>
          <span>{damagePerHit.toFixed(2)}</span>
        </DamageStat>
        <DamageStat>
          <span>DPS</span>
          <span>{dps.toFixed(2)}</span>
        </DamageStat>
      </div>
      <div style={{ marginTop: "20px" }}>
        {/*
          TODO collect:
          Stat boosts: attack, strength
          prayers
          void set
        */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <strong>Attack style</strong>
          <StyledSelect
            value={combatStyle}
            onChange={(e) => {
              setCombatStyle(e.target.value);
            }}
          >
            <option value="defence">Defence</option>
            <option value="accurate">Accurate</option>
            <option value="aggressive">Aggressive</option>
            <option value="controlled">Controlled</option>
          </StyledSelect>
          <StyledSelect
            value={combatType}
            onChange={(e) => {
              setCombatType(e.target.value);
            }}
          >
            <option value="stab">Stab</option>
            <option value="slash">Slash</option>
            <option value="crush">Crush</option>
          </StyledSelect>
        </div>
        <EnemyStatCollection onChange={(v) => setEnemyStats(v)} />
        <WeaponStatCollection onChange={(v) => setWeaponStats(v)} />
        <EquipmentStatCollection onChange={(v) => setEquipmentStats(v)} />
      </div>
    </>
  );
};

export default Combat;
