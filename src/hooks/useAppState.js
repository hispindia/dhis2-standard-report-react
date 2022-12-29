import { selectionState, selectedOrgUnit, selectedPeriod } from "@/recoil/selection";
import { metadataState } from "@/recoil/metadata";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

const useAppState = () => {
  const selection = useRecoilValue(selectionState);
  const selectOrgUnit = useSetRecoilState(selectedOrgUnit);
  const selectPeriod = useSetRecoilState(selectedPeriod);
  const [metadata, setMetadata] = useRecoilState(metadataState);

  const state = {
    state: {
      selection,
      metadata
    },
    action: {
      setMetadata: (metadata) => {
        setMetadata(metadata);
      },
      selectOrgUnit: (orgUnit) => {
        selectOrgUnit(orgUnit);
      },
      selectPeriod: (type, newValue) => {
        selectPeriod({
          type,
          newValue
        });
      }
    }
  };
  return state;
};

export default useAppState;
