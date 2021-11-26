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
  Typography,
} from "@mui/material";
import Vulnerabilities from "./elements/Vulnerabilities";

function ChangeElements({ npc, setnpc }) {
  return (
    <>
      <Typography variant="h6">Affinità</Typography>
      <ChangeElementType npc={npc} setnpc={setnpc} />
      <Vulnerabilities npc={npc} setnpc={setnpc} />
    </>
  );
}

function ChangeElementType({ npc, setnpc }) {
  if (npc.type === "Demone") {
    return <ChangeElementsDemon npc={npc} setnpc={setnpc} />;
  }
  if (npc.type === "Elementale") {
    return <ChangeElementsElemental npc={npc} setnpc={setnpc} />;
  }
  if (npc.type === "Pianta") {
    return <ChangeElementsPlant npc={npc} setnpc={setnpc} />;
  }
  return null;
}

function ChangeElementsDemon({ npc, setnpc }) {
  const isResistant = (npc, element) => {
    return npc.typeRules.demonResistances[element];
  };

  const countResistances = (npc) => {
    let sum = 0;
    Object.entries(npc.typeRules.demonResistances).forEach((el) => {
      if (el[1]) {
        sum++;
      }
    });
    return sum;
  };

  const onSelectElement = (e) => {
    if (countResistances(npc) >= 2) {
      if (!isResistant(npc, e.target.name)) {
        return;
      }
    }
    setnpc((prevState) => {
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
          checked={isResistant(npc, "physical")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="air"
          icon={faWind}
          checked={isResistant(npc, "air")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="lightning"
          icon={faBolt}
          checked={isResistant(npc, "lightning")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="dark"
          icon={faSkull}
          checked={isResistant(npc, "dark")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="earth"
          icon={faMountain}
          checked={isResistant(npc, "earth")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="fire"
          icon={faFire}
          checked={isResistant(npc, "fire")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="ice"
          icon={faSnowflake}
          checked={isResistant(npc, "ice")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="light"
          icon={faSnowflake}
          checked={isResistant(npc, "light")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="poison"
          icon={faSkullCrossbones}
          checked={isResistant(npc, "poison")}
          onSelectElement={onSelectElement}
        />
      </FormGroup>
    </FormControl>
  );
}

function ChangeElementsElemental({ npc, setnpc }) {
  const isImmune = (npc, element) => {
    return npc.typeRules.elementalImmunities[element];
  };

  const countImmunities = (npc) => {
    let sum = 0;
    Object.entries(npc.typeRules.elementalImmunities).forEach((el) => {
      if (el[1]) {
        sum++;
      }
    });
    return sum;
  };

  const onSelectElement = (e) => {
    if (countImmunities(npc) >= 2) {
      if (!isImmune(npc, e.target.name)) {
        return;
      }
    }
    setnpc((prevState) => {
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
          checked={isImmune(npc, "physical")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="air"
          icon={faWind}
          checked={isImmune(npc, "air")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="lightning"
          icon={faBolt}
          checked={isImmune(npc, "lightning")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="dark"
          icon={faSkull}
          checked={isImmune(npc, "dark")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="earth"
          icon={faMountain}
          checked={isImmune(npc, "earth")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="fire"
          icon={faFire}
          checked={isImmune(npc, "fire")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="ice"
          icon={faSnowflake}
          checked={isImmune(npc, "ice")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="light"
          icon={faSnowflake}
          checked={isImmune(npc, "light")}
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

function ChangeElementsPlant({ npc, setnpc }) {
  const isVulnerable = (npc, element) => {
    return npc.typeRules.plantVulnerabilities[element];
  };

  const countImmunities = (npc) => {
    let sum = 0;
    Object.entries(npc.typeRules.plantVulnerabilities).forEach((el) => {
      if (el[1]) {
        sum++;
      }
    });
    return sum;
  };

  const onSelectElement = (e) => {
    if (countImmunities(npc) >= 1) {
      if (!isVulnerable(npc, e.target.name)) {
        return;
      }
    }
    setnpc((prevState) => {
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
          checked={isVulnerable(npc, "air")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="lightning"
          icon={faBolt}
          checked={isVulnerable(npc, "lightning")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="fire"
          icon={faFire}
          checked={isVulnerable(npc, "fire")}
          onSelectElement={onSelectElement}
        />
        <CheckElement
          element="ice"
          icon={faSnowflake}
          checked={isVulnerable(npc, "ice")}
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
