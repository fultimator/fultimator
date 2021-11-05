import {
  faBolt,
  faFire,
  faGun,
  faMountain,
  faSkull,
  faSkullCrossbones,
  faSnowflake,
  faWind,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from "@mui/material";

function ChangeElements({ monster, setMonster }) {
  if (monster.type === "Demone") {
    return <ChangeElementsDemon monster={monster} setMonster={setMonster} />;
  }
  if (monster.type === "Elementale") {
    return (
      <ChangeElementsElemental monster={monster} setMonster={setMonster} />
    );
  }
  if (monster.type === "Pianta") {
    return <ChangeElementsPlant monster={monster} setMonster={setMonster} />;
  }
  return null;
}

function ChangeElementsDemon({ monster, setMonster }) {
  const isResistant = (monster, element) => {
    return monster.typeRules.demonResistances[element];
  };

  const countResistances = (monster) => {
    let sum = 0;
    Object.entries(monster.typeRules.demonResistances).forEach((el) => {
      if (el[1]) {
        sum++;
      }
    });
    return sum;
  };

  const onSelectElement = (e) => {
    if (countResistances(monster) >= 2) {
      if (!isResistant(monster, e.target.name)) {
        return;
      }
    }
    setMonster((prevState) => {
      const newState = Object.assign({}, prevState);

      newState.typeRules.demonResistances[e.target.name] =
        !prevState.typeRules.demonResistances[e.target.name];

      return newState;
    });
  };

  return (
    <FormControl
      // error={error}
      component="fieldset"
      sx={{}}
      variant="standard"
    >
      <FormLabel component="legend">
        Scegli due tipi di danno a cui il Demone è resistente
      </FormLabel>
      <FormGroup row={true}>
        <CheckElement
          element="physical"
          icon={faGun}
          checked={isResistant(monster, "physical")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="air"
          icon={faWind}
          checked={isResistant(monster, "air")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="lightning"
          icon={faBolt}
          checked={isResistant(monster, "lightning")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="dark"
          icon={faSkull}
          checked={isResistant(monster, "dark")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="earth"
          icon={faMountain}
          checked={isResistant(monster, "earth")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="fire"
          icon={faFire}
          checked={isResistant(monster, "fire")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="ice"
          icon={faSnowflake}
          checked={isResistant(monster, "ice")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="light"
          icon={faSnowflake}
          checked={isResistant(monster, "light")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="poison"
          icon={faSkullCrossbones}
          checked={isResistant(monster, "poison")}
          onSelectElement={onSelectElement}
        />
      </FormGroup>
    </FormControl>
  );
}

function ChangeElementsElemental({ monster, setMonster }) {
  const isImmune = (monster, element) => {
    return monster.typeRules.elementalImmunities[element];
  };

  const countImmunities = (monster) => {
    let sum = 0;
    Object.entries(monster.typeRules.elementalImmunities).forEach((el) => {
      if (el[1]) {
        sum++;
      }
    });
    return sum;
  };

  const onSelectElement = (e) => {
    if (countImmunities(monster) >= 2) {
      if (!isImmune(monster, e.target.name)) {
        return;
      }
    }
    setMonster((prevState) => {
      const newState = Object.assign({}, prevState);

      newState.typeRules.elementalImmunities[e.target.name] =
        !prevState.typeRules.elementalImmunities[e.target.name];

      return newState;
    });
  };

  return (
    <FormControl
      // error={error}
      component="fieldset"
      sx={{}}
      variant="standard"
    >
      <FormLabel component="legend">
        Scegli un tipo di danno a cui l'Elementale è immune (oltre a Veleno)
      </FormLabel>
      <FormGroup row={true}>
        <CheckElement
          element="physical"
          icon={faGun}
          checked={isImmune(monster, "physical")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="air"
          icon={faWind}
          checked={isImmune(monster, "air")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="lightning"
          icon={faBolt}
          checked={isImmune(monster, "lightning")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="dark"
          icon={faSkull}
          checked={isImmune(monster, "dark")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="earth"
          icon={faMountain}
          checked={isImmune(monster, "earth")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="fire"
          icon={faFire}
          checked={isImmune(monster, "fire")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="ice"
          icon={faSnowflake}
          checked={isImmune(monster, "ice")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="light"
          icon={faSnowflake}
          checked={isImmune(monster, "light")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="poison"
          icon={faSkullCrossbones}
          checked
          readonly={true}
        />
      </FormGroup>
    </FormControl>
  );
}

function ChangeElementsPlant({ monster, setMonster }) {
  const isVulnerable = (monster, element) => {
    return monster.typeRules.plantVulnerabilities[element];
  };

  const countImmunities = (monster) => {
    let sum = 0;
    Object.entries(monster.typeRules.plantVulnerabilities).forEach((el) => {
      if (el[1]) {
        sum++;
      }
    });
    return sum;
  };

  const onSelectElement = (e) => {
    if (countImmunities(monster) >= 1) {
      if (!isVulnerable(monster, e.target.name)) {
        return;
      }
    }
    setMonster((prevState) => {
      const newState = Object.assign({}, prevState);

      newState.typeRules.plantVulnerabilities[e.target.name] =
        !prevState.typeRules.plantVulnerabilities[e.target.name];

      return newState;
    });
  };

  return (
    <FormControl
      // error={error}
      component="fieldset"
      sx={{}}
      variant="standard"
    >
      <FormLabel component="legend">
        Scegli un tipo di danno a cui la Pianta è vulnerabile
      </FormLabel>
      <FormGroup row={true}>
        <CheckElement
          element="air"
          icon={faWind}
          checked={isVulnerable(monster, "air")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="lightning"
          icon={faBolt}
          checked={isVulnerable(monster, "lightning")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="fire"
          icon={faFire}
          checked={isVulnerable(monster, "fire")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="ice"
          icon={faSnowflake}
          checked={isVulnerable(monster, "ice")}
          onSelectElement={onSelectElement}
        />
      </FormGroup>
    </FormControl>
  );
}

function CheckElement({ element, icon, checked, onSelectElement }) {
  return (
    <FormControlLabel
      control={
        <Checkbox checked={checked} onChange={onSelectElement} name={element} />
      }
      label={
        <>
          <FontAwesomeIcon icon={icon} /> {element}
        </>
      }
    />
  );
}

export default ChangeElements;
