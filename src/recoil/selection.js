import { atom, selector } from "recoil";

const selectionState = atom({
  key: "selectionState",
  default: {
    orgUnit: {},
    period: {
      dhis2Period: "",
      startDate: "",
      endDate: "",
      periodName: "",
      quarter: "",
      quarterName: "",
      month: "",
      monthName: "",
      week: "",
      weekName: "",
      sixMonthly: "",
      sixMonthlyName: "",
      year: "",
      periodType: "",
    },
  },
});

const selectedOrgUnit = selector({
  key: "selectedOrgUnit",
  get: ({ get }) => {
    const state = get(selectionState);
    return state.orgUnit;
  },
  set: ({ get, set }, newValue) => {
    const currentState = { ...get(selectionState) };
    currentState.orgUnit = newValue;
    set(selectionState, currentState);
  },
});

const selectedPeriod = selector({
  key: "selectedPeriod",
  get: ({ get }) => {
    const state = get(selectionState);
    return state.period;
  },
  set: ({ get, set }, { type, newValue }) => {
    const currentState = { ...get(selectionState) };
    const newPeriod = { ...currentState.period, [type]: newValue };
    currentState.period = newPeriod;
    set(selectionState, currentState);
  },
});

export { selectionState, selectedOrgUnit, selectedPeriod };
