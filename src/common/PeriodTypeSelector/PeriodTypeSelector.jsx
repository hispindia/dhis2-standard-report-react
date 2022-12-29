import Input from "@/common/Input/Input";
import useAppState from "@/hooks/useAppState";
import { useTranslation } from "react-i18next";
import "./PeriodTypeSelector.css";
const PERIOD_TYPES = [
  "Yearly",
  "SixMonthly",
  "Monthly",
  "Quarterly",
  "Weekly",
  "Daily",
  "Last12Months",
];

/**
 * * Yearly
 * * SixMonthly
 * * Monthly
 * * Quarterly
 * * Daily
 * * Weekly
 */
const PeriodTypeSelector = ({ periodTypes }) => {
  const { t } = useTranslation();
  const { state, action } = useAppState();
  const { period } = state.selection;

  return (
    <div className="period-type-selector-container">
      <Input
        value={period.periodType}
        label={t("pleaseSelectPeriodType")}
        valueType="TEXT"
        valueSet={
          periodTypes
            ? periodTypes.map((pt) => {
                return { value: pt, label: t(pt) };
              })
            : PERIOD_TYPES.map((pt) => {
                return { value: pt, label: t(pt) };
              })
        }
        change={(value) => {
          action.selectPeriod("periodType", value);
        }}
      />
    </div>
  );
};

export default PeriodTypeSelector;
