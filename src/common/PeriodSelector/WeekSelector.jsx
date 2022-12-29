import Input from "@/common/Input/Input";
import { useTranslation } from "react-i18next";
import useAppState from "@/hooks/useAppState";
import moment from "moment";

const WeekSelector = () => {
  const { state, action } = useAppState();
  const { year } = state.selection.period;
  const { t } = useTranslation();
  let weeks = year ? moment([year, 1, 1]).isoWeeksInYear() : 0;
  const valueSet = [];
  for (let i = 1; i <= weeks; i++) {
    valueSet.push({
      value: i,
      label: t("week") + " " + i
    });
  }
  return (
    <div>
      <Input
        value={state.selection.period.week}
        label={t("week")}
        valueType="TEXT"
        valueSet={valueSet}
        change={(value) => {
          action.selectPeriod("week", value);
          action.selectPeriod("weekName", t("week") + " " + value);
        }}
      />
    </div>
  );
};

export default WeekSelector;
