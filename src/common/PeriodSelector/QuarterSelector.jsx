import Input from "@/common/Input/Input";
import { useTranslation } from "react-i18next";
import useAppState from "@/hooks/useAppState";

const QuarterSelector = () => {
  const { state, action } = useAppState();
  const { t } = useTranslation();
  const quarters = [1, 2, 3, 4];
  const valueSet = quarters.map((quarter, index) => {
    return {
      value: quarter,
      label: t("Q" + quarter)
    };
  });

  return (
    <div>
      <Input
        value={state.selection.period.quarter}
        label={t("quarter")}
        valueType="TEXT"
        valueSet={valueSet}
        change={(value) => {
          action.selectPeriod("quarter", value);
          action.selectPeriod("quarterName", t("Q" + value));
        }}
      />
    </div>
  );
};

export default QuarterSelector;
