import { useEffect } from "react";
import moment from "moment";
// Translation
import { useTranslation } from "react-i18next";
// Hooks
import useAppState from "@/hooks/useAppState";
import "./index.css";

export default ({ data }) => {
  const { t } = useTranslation();
  const { state } = useAppState();
  const { period } = state.selection;

  useEffect(() => {
    console.log(data);
    // getListOfLast12Months();
  }, []);

  const getRandomNumber = () => {
    return Math.floor(Math.random() * 101);
  };

  const getListOfLast12Months = () => {
    const dateStart = moment(period["endDate"]);
    const dateEnd = moment(period["startDate"]);
    const temp = dateStart.clone();
    let listPeriods = [];
    while (dateEnd <= temp || temp.format("M") === dateEnd.format("M")) {
      const newDateObj = {
        label: temp.format("MMMM YYYY"),
        dhis2Period: temp.format("YYYYMM"),
      };
      listPeriods.push(newDateObj);
      temp.subtract(1, "month");
    }
    return listPeriods;
  };

  const renderHospitalFields = () => {
    const hospitalType = data.hasOwnProperty("CH_ORG_UNITS")
      ? "CH_ORG_UNITS"
      : "PH_ORG_UNITS";
    const monthPeriods = getListOfLast12Months();
    const renderMonthsFields = monthPeriods.map((monthInYear) => {
      return (
        <tr>
          <th>{monthInYear["label"]}</th>
          {data["DHO_ORG_UNITS"].map((prov) => {
            return <td>{getRandomNumber()}</td>;
          })}
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      );
    });
    return data[hospitalType].map((hospitalObj) => {
      return (
        <>
          <tr>
            <th
              className="hospital-name"
              colSpan={data["DHO_ORG_UNITS"].length + 3}
            >
              {hospitalObj["name"]}
            </th>
          </tr>
          <tr>
            <th className="hospital-col-title">{t("periodOrg")}</th>
            {data["DHO_ORG_UNITS"].map((prov) => {
              return <th className="hospital-col-title">{prov["name"]}</th>;
            })}
            <th className="hospital-col-title">{t("noAddr")}</th>
            <th className="hospital-col-title">{t("total")}</th>
          </tr>
          {renderMonthsFields}
          <tr>
            <th className="total-field">{t("total")}</th>
            {data["DHO_ORG_UNITS"].map((prov) => {
              return <td className="total-field">&nbsp;</td>;
            })}
            <td className="total-field">&nbsp;</td>
            <td className="total-field">&nbsp;</td>
          </tr>
          <tr>
            <th colSpan={data["DHO_ORG_UNITS"].length + 3}>&nbsp;</th>
          </tr>
        </>
      );
    });
  };

  const renderData = () => {
    return data.hasOwnProperty("DHO_ORG_UNITS")
      ? data["DHO_ORG_UNITS"].map((prov) => {
          return (
            <>
              <tr>
                <td className="row-title">{prov["name"]}</td>
                <td className="input-field">{getRandomNumber()}</td>
                <td className="input-field">{getRandomNumber()}</td>
                <td className="input-field">{getRandomNumber()}</td>
                <td className="input-field">{getRandomNumber()}</td>
                <td className="input-field">{getRandomNumber()}</td>
                <td className="input-field">{getRandomNumber()}</td>
                <td className="input-field">{getRandomNumber()}</td>
                <td className="input-field">{getRandomNumber()}</td>
                <td className="input-field">{getRandomNumber()}</td>
                <td className="input-field percentage">{getRandomNumber()}%</td>
                <td className="input-field percentage">{getRandomNumber()}%</td>
              </tr>
            </>
          );
        })
      : null;
  };

  return !Array.isArray(data) ? (
    <div className="province-report-table">
      {data.hasOwnProperty("DHO_ORG_UNITS") ? (
        <table>
          <thead>
            <tr>
              <th className="report-title" colSpan={12}>
                {t("serCover")}
              </th>
            </tr>
            <tr>
              <th className="main-label" rowSpan={2}>
                {t("orgUnit")}
              </th>
              <th className="main-label" colSpan={9}>
                {t("num")}
              </th>
              <th className="main-label" colSpan={2}>
                %
              </th>
            </tr>
            <tr>
              <th className="balance-col">{t("ttSers")}</th>
              <th className="balance-col">{t("inside")}</th>
              <th className="balance-col">{t("outside")}</th>
              <th className="balance-col">{t("fromOth")}</th>
              <th className="balance-col">{t("fromProvHos")}</th>
              <th className="balance-col">{t("noAddr")}</th>
              <th className="balance-col">{t("ttCachArea")}</th>
              <th className="balance-col">{t("estPop")}</th>
              <th className="balance-col">{t("popFromFF")}</th>
              <th className="balance-col">{t("estPop")}</th>
              <th className="balance-col">{t("popFromFF")}</th>
            </tr>
          </thead>
          <tbody>{renderData()}</tbody>
          <tbody>
            <tr>
              <td colSpan={12}>&nbsp;</td>
            </tr>
            {renderHospitalFields()}
          </tbody>
        </table>
      ) : null}
    </div>
  ) : null;
};
