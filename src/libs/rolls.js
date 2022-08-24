export function diceList(list, modifier) {
  const dice = [...list];
  
  if (modifier > 0) {
    dice.push(modifier);
    return dice.join("+")
  }
  
  if (modifier < 0) {
    return dice.join("+") + modifier;
  }
  
  return dice.join("+")
}

export function random(size) {
  const randomValues = window.crypto.getRandomValues(new Uint32Array(1));
  
  const sizeN = parseInt (size.slice(1));
  
  return (randomValues[0] % sizeN) + 1;
}

export function prepareDice(d4, d6, d8, d10, d12, d20, bonus, malus) {
  const dice = [];
  for (let i = 0; i < d4; i++) {
    dice.push("d4");
  }
  for (let i = 0; i < d6; i++) {
    dice.push("d6");
  }
  for (let i = 0; i < d8; i++) {
    dice.push("d8");
  }
  for (let i = 0; i < d10; i++) {
    dice.push("d10");
  }
  for (let i = 0; i < d12; i++) {
    dice.push("d12");
  }
  for (let i = 0; i < d20; i++) {
    dice.push("d20");
  }
  const modifier = bonus - malus;
  return {dice, modifier};
}