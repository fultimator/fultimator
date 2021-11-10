const skills = {};

function calcSkillsMax(monster) {
  let number = 4;

  if (
    monster.type === "Costrutto" ||
    monster.type === "Elementale" ||
    monster.type === "Non Morto"
  ) {
    number = 2;
  }

  if (
    monster.type === "Demone" ||
    monster.type === "Pianta" ||
    monster.type === "Umanoide"
  ) {
    number = 3;
  }

  return number;
}

function calcSkillsCurrent(monster) {
  return monster.skills.length + calcSkillsCurrentAttacks(monster);
}

function calcSkillsCurrentAttacks(monster) {
  let sum = 0;
  monster.attacks.forEach((attack) => {
    sum += attack.effects.length;
  });

  return sum;
}

export { skills, calcSkillsMax, calcSkillsCurrent };
