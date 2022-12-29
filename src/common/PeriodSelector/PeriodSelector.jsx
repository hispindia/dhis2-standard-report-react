import { useEffect, useState } from "react";
import Input from "@/common/Input/Input";
import { Popover } from "@mui/material";
import { useTranslation } from "react-i18next";
import useAppState from "@/hooks/useAppState";
import YearSelector from "./YearSelector";
import MonthSelector from "./MonthSelector";
import QuarterSelector from "./QuarterSelector";
import WeekSelector from "./WeekSelector";
import SixMonthlySelector from "./SixMonthlySelector";
import moment from "moment";
import "./PeriodSelector.css";

const specialPeriodTypes = ["Last12Months"];

const PeriodSelector = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const openPopover = Boolean(anchorEl);
  const { t } = useTranslation();
  const { state, action } = useAppState();
  const { period } = state.selection;

  // const renderInputValue = () => {
  //   let value = "";
  //   switch (period.periodType) {
  //     case "Yearly":
  //       if (period.year) value = period.year;
  //       break;
  //     case "Monthly":
  //       if (period.year && period.month) value = period.monthName + " " + period.year;
  //       break;
  //     case "Quarterly":
  //       if (period.year && period.quarter) value = period.quarterName + " - " + period.year;
  //       break;
  //     case "Weekly":
  //       if (period.year && period.week) value = period.weekName + " - " + period.year;
  //       break;
  //     case "Daily":
  //       if (period.date) value = period.date;
  //       break;
  //     default:
  //       break;
  //   }
  //   action.selectPeriod("periodName", value);
  //   return <Input valueType="TEXT" label={t("selectPeriod")} value={value} />;
  // };

  const isSpecialPeriod = (periodType) => {
    return specialPeriodTypes.includes(periodType) ? true : false;
  };

  const renderSelectors = () => {
    switch (period.periodType) {
      case "Yearly":
        return <YearSelector />;
      case "Monthly":
        return [<YearSelector />, <MonthSelector />];
      case "Quarterly":
        return [<YearSelector />, <QuarterSelector />];
      case "Weekly":
        return [<YearSelector />, <WeekSelector />];
      case "SixMonthly":
        return [<YearSelector />, <SixMonthlySelector />];
      case "Daily":
        return (
          <div>
            <Input
              value={state.selection.period.date}
              valueType="DATE"
              label={t("date")}
              change={(value) => {
                action.selectPeriod("date", value);
              }}
            />
          </div>
        );
      default:
        return (
          <div className="warning-field">Please select period type first</div>
        );
    }
  };

  const constConvertToDhis2Period = () => {
    let startDate;
    let endDate;
    switch (period.periodType) {
      case "Yearly":
        if (period.year) {
          action.selectPeriod("dhis2Period", `${period.year}`);
          action.selectPeriod("startDate", `${period.year}-01-01`);
          action.selectPeriod("endDate", `${period.year}-12-31`);
        } else {
          action.selectPeriod("dhis2Period", null);
          action.selectPeriod("startDate", "");
          action.selectPeriod("endDate", "");
        }
        break;
      case "Monthly":
        if (period.year && period.month) {
          action.selectPeriod("dhis2Period", `${period.year}${period.month < 10 ? "0" + period.month : period.month}`);
          startDate = moment([period.year, period.month - 1])
            .startOf("month")
            .format("YYYY-MM-DD");
          endDate = moment([period.year, period.month - 1])
            .endOf("month")
            .format("YYYY-MM-DD");
          action.selectPeriod("startDate", startDate);
          action.selectPeriod("endDate", endDate);
        } else {
          action.selectPeriod("dhis2Period", null);
          action.selectPeriod("startDate", "");
          action.selectPeriod("endDate", "");
        }
        break;
      case "Quarterly":
        if (period.year && period.quarter) {
          action.selectPeriod("dhis2Period", `${period.year}Q${period.quarter}`);
          startDate = moment([period.year]).quarter(period.quarter).startOf("quarter").format("YYYY-MM-DD");
          endDate = moment([period.year]).quarter(period.quarter).endOf("quarter").format("YYYY-MM-DD");
          action.selectPeriod("startDate", startDate);
          action.selectPeriod("endDate", endDate);
        } else {
          action.selectPeriod("dhis2Period", null);
          action.selectPeriod("startDate", "");
          action.selectPeriod("endDate", "");
        }
        break;
      case "SixMonthly":
        if (period.year && period.sixMonthly) {
          action.selectPeriod("dhis2Period", `${period.year}S${period.sixMonthly}`);
          const startedQuarter = period.sixMonthly === 2 ? period.sixMonthly + 1 : period.sixMonthly;
          startDate = moment([period.year]).quarter(startedQuarter).startOf("quarter").format("YYYY-MM-DD");
          endDate = moment([period.year])
            .quarter(startedQuarter + 1)
            .endOf("quarter")
            .format("YYYY-MM-DD");
          action.selectPeriod("startDate", startDate);
          action.selectPeriod("endDate", endDate);
        } else {
          action.selectPeriod("dhis2Period", null);
          action.selectPeriod("startDate", "");
          action.selectPeriod("endDate", "");
        }
        break;
      case "Last12Months":
        action.selectPeriod("dhis2Period", "LAST_12_MONTHS");
        const startedMonth = moment().subtract(1, "month");
        endDate = startedMonth.endOf("month").format("YYYY-MM-DD");
        action.selectPeriod("endDate", endDate);
        const afterSubtract = startedMonth.subtract(11, "months");
        startDate = afterSubtract.startOf("month").format("YYYY-MM-DD");
        action.selectPeriod("startDate", startDate);
        break;
      case "Weekly":
        if (period.year && period.week) {
          action.selectPeriod("dhis2Period", `${period.year}W${period.week}`);
          startDate = moment([period.year, 1, 1]).isoWeek(period.week).startOf("isoWeek").format("YYYY-MM-DD");
          endDate = moment([period.year, 1, 1]).isoWeek(period.week).endOf("isoWeek").format("YYYY-MM-DD");
          action.selectPeriod("startDate", startDate);
          action.selectPeriod("endDate", endDate);
        } else {
          action.selectPeriod("dhis2Period", null);
          action.selectPeriod("startDate", "");
          action.selectPeriod("endDate", "");
        }
        break;
      case "Daily":
        if (period.date) {
          action.selectPeriod("dhis2Period", `${period.date.replace(/-/g, "")}`);
          action.selectPeriod("startDate", period.date);
          action.selectPeriod("endDate", period.date);
        } else {
          action.selectPeriod("dhis2Period", null);
          action.selectPeriod("startDate", "");
          action.selectPeriod("endDate", "");
        }
        break;
      default:
        action.selectPeriod("dhis2Period", null);
        action.selectPeriod("startDate", "");
        action.selectPeriod("endDate", "");
        break;
    }
  };

  useEffect(() => {
    constConvertToDhis2Period();
  }, [JSON.stringify(period)]);

  useEffect(() => {
    if (period.dhis2Period) setAnchorEl(null);
  }, [JSON.stringify(period)]);

  useEffect(() => {
    let value = "";
    switch (period.periodType) {
      case "Yearly":
        if (period.year) value = period.year;
        break;
      case "Monthly":
        if (period.year && period.month) value = period.monthName + " " + period.year;
        break;
      case "Quarterly":
        if (period.year && period.quarter) value = period.quarterName + " - " + period.year;
        break;
      case "SixMonthly":
        if (period.year && period.sixMonthly) {
          value = period.sixMonthly === 2 ? "Half of " + period.year + " later" : "First half-year of " + period.year;
        }
        break;
      case "Weekly":
        if (period.year && period.week) value = period.weekName + " - " + period.year;
        break;
      case "Daily":
        if (period.date) value = period.date;
        break;
      case "Last12Months":
        value = t("Last12Months");
        break;
      default:
        break;
    }
    action.selectPeriod("periodName", value);
  }, [JSON.stringify(period.dhis2Period)]);

  return !isSpecialPeriod(period.periodType) ? (
    <div className="period-selector-container">
      <div
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <Input valueType="TEXT" label={t("selectPeriod")} value={period.periodName} />
      </div>
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <div className="period-selector-popover-container">{renderSelectors()}</div>
      </Popover>
    </div>
  ) : null;
};

export default PeriodSelector;
