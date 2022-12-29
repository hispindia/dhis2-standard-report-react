import Input from "@/common/Input/Input";
import { useTranslation } from "react-i18next";
import useAppState from "@/hooks/useAppState";

const MonthSelector = () => {
  const { state, action } = useAppState();
  const { t } = useTranslation();
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const valueSet = months.map((month, index) => {
    return {
      value: index + 1,
      label: t(month)
    };
  });
  return (
    <div>
      <Input
        value={state.selection.period.month}
        label={t("month")}
        valueType="TEXT"
        valueSet={valueSet}
        change={(value) => {
          action.selectPeriod("month", value);
          action.selectPeriod("monthName", t(months[value - 1]));
        }}
      />
    </div>
  );
};

export default MonthSelector;
