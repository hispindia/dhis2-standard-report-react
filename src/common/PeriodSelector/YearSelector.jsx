import Input from "@/common/Input/Input";
import { useTranslation } from "react-i18next";
import useAppState from "@/hooks/useAppState";
import moment from "moment";

const YearSelector = () => {
  const { state, action } = useAppState();
  const { t } = useTranslation();
  const startYear = 1900;
  const currentYear = moment().year();
  let valueSet = [];

  for (let i = currentYear; i >= startYear; i--) {
    valueSet.push({
      label: i + "",
      value: i
    });
  }
  return (
    <div>
      <Input
        value={state.selection.period.year}
        label={t("year")}
        valueType="TEXT"
        valueSet={valueSet}
        change={(value) => {
          action.selectPeriod("year", value);
        }}
      />
    </div>
  );
};

export default YearSelector;
