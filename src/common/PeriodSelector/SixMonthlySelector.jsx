import Input from "@/common/Input/Input";
import { useTranslation } from "react-i18next";
import useAppState from "@/hooks/useAppState";

const SixMonthlySelector = () => {
  const { state, action } = useAppState();
  const { t } = useTranslation();
  const sixMonthlySet = [1, 2];
  const valueSet = sixMonthlySet.map((sixMthlyElement) => {
    return {
      value: sixMthlyElement,
      label: t("S" + sixMthlyElement),
    };
  });

  return (
    <div>
      <Input
        value={state.selection.period.sixMonthly}
        label={t("sixMonth")}
        valueType="TEXT"
        valueSet={valueSet}
        change={(value) => {
          action.selectPeriod("sixMonthly", value);
          action.selectPeriod("sixMonthlyName", t("S" + value));
        }}
      />
    </div>
  );
};

export default SixMonthlySelector;
