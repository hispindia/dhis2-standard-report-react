import { atom, selector } from "recoil";

const metadataState = atom({
  key: "metadataState",
  default: {
    me: {},
    orgUnits: [],
    orgUnitLevels: []
  }
});

export { metadataState };
