import { React, useEffect, useState } from "react";
import withReportContainer from "@/hocs/withReportContainer";
import { organisationUnits } from "./metadata/organisationUnits.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Translation
import { useTranslation } from "react-i18next";
import useLocalization from "@/hooks/useLocalization";
import {
  enTranslations,
  laosTranslations,
} from "../ServiceCoverageMainRrc/translations";
// Selector
import PeriodTypeSelector from "@/common/PeriodTypeSelector/PeriodTypeSelector";
import PeriodSelector from "@/common/PeriodSelector/PeriodSelector";
import OrgUnitSelector from "@/common/OrgUnitSelector/OrgUnitSelector";
// Hooks
import useAppState from "@/hooks/useAppState";
// Components
import { Button } from "@mui/material";
import Loader from "@/common/Loader/Loader";
import HeaderBar from "@/common/HeaderBar";
import ServiceTypeSelector from "../ServiceCoverageMainRrc/ServiceTypeSelector";

// Other tools
import { pull } from "@/utils/fetch";
// CSS
import "./index.css";
import { es } from "date-fns/locale";

const Report = () => {
  const { t, i18n } = useTranslation();
  const { state, action } = useAppState();
  const { orgUnit, period } = state.selection;
  // Custom state
  const [currLanguage, setCurrLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [lstOrgUnitTable, setLstOrgUnitTable] = useState({});
  const [lstTableData, setLstTableData] = useState({});
  const [selector, setSelector] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [CHPHTables, setCHPHTables] = useState([]);
  const [isShowSubTable, setIsShowSubTable] = useState(false);
  const lstEstimatedPopId = {
    iuJuFQqTSMt: "Nib5DBD8a2a",
    E4YaV9wahBu: "Nib5DBD8a2a",
    EdCjK8sy4WH: "Nib5DBD8a2a",
    n6rveUjp5h1: "AZitTVZUVkN",
    TFIM3NzVlzn: "Nib5DBD8a2a",
    eb5xGUCIGw3: "Nib5DBD8a2a",
    TvfJjKrHq7m: "Nib5DBD8a2a",
    uQ6miuyuEle: "Nib5DBD8a2a",
    x1aaFGkMUtF: "Nib5DBD8a2a",
    TXdcfWEjnCG: "Nib5DBD8a2a",
    JPxlkjfWRAm: "Nib5DBD8a2a",
    p6r3CmynN3p: "Nib5DBD8a2a",
    g1NaOGHcdoT: "Nib5DBD8a2a",
    NLLpw6yqkR0: "Nt5y1WYCqv3",
    Hj0RkiE6uPG: "Nt5y1WYCqv3",
    ftictJHtIUl: "Nt5y1WYCqv3",
    QQ8tl6gKEEx: "Nt5y1WYCqv3",
  };

  const lstDeNonEPI = {
    NLLpw6yqkR0: { program: "Ii2YCz7Om1U", stage: "DZyezxEbRog" },
    Hj0RkiE6uPG: { program: "SvbebekiPDE", stage: "yheipfCVPxk" },
    ftictJHtIUl: { program: "lHC89UaXkTW", stage: "qpyy0O53mEJ" },
    QQ8tl6gKEEx: { program: "SvbebekiPDE", stage: "yheipfCVPxk" },
  };
  useLocalization("lo", laosTranslations);
  useLocalization("en", enTranslations);

  useEffect(() => {
    (async () => {
      const req = await pull("/api/me?fields=settings");
      const usrLanguage =
        Object.keys(req).length === 0 || req === undefined
          ? "en"
          : req["settings"]["keyUiLocale"];
      i18n.changeLanguage(usrLanguage);
      setCurrLanguage(usrLanguage);
      setLoading(false);
    })();
  }, []);
  useEffect(() => {
    isFetching === false &&
      setIsShowSubTable(
        Object.keys(CHPHTables).length > 0 && orgUnit["level"] === 2
      );
  }, [isFetching]);

  const handleServiceChange = (value) => {
    setServiceType(value);
  };

  const isEnoughSelectors = () => {
    return orgUnit && period.dhis2Period !== null && serviceType ? true : false;
  };

  const getReport = () => {
    if (selector !== period.dhis2Period + orgUnit.id + serviceType) {
      if (orgUnit["level"] < 3) {
        setIsFetching(true);
      } else {
        toast.error("This report is for provincial and provincial level only", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    }
    setSelector(period.dhis2Period + orgUnit.id + serviceType);
  };

  useEffect(() => {
    if (isFetching === true) {
      (async () => {
        let tempLstOrgsData = {};
        let tempLstOrgUnitTable = [];
        if (orgUnit["level"] === 1) {
          const lstProvincesAPI = await pull(
            `/api/organisationUnitGroups/jblbYwuvO33.json?fields=organisationUnits[id,name]`
          );
          tempLstOrgUnitTable = lstProvincesAPI.organisationUnits;
        } else if (orgUnit["level"] === 2) {
          const lstDistrictsAPI = await pull(
            `/api/organisationUnitGroups/Zh1inFu0Z2O.json?fields=organisationUnits[id,name,level,ancestors]`
          );
          tempLstOrgUnitTable = lstDistrictsAPI?.organisationUnits.filter(
            (orgUnitsDistricts) =>
              orgUnitsDistricts.ancestors
                .map((ans) => ans.id)
                .includes(orgUnit.id)
          );

          if (period.dhis2Period === "LAST_12_MONTHS") {
            const CHPHAPI = await pull(
              `/api/organisationUnitGroups/qIO4vKXvSc1.json?fields=organisationUnits[id,name,parent[id]]`
            );
            const lstCHPH = CHPHAPI.organisationUnits.filter(
              (org) => org.parent.id === orgUnit.id
            );
            const startYear = period.startDate.split("-")[0];
            const startMonth = period.startDate.split("-")[1];
            const endYear = period.endDate.split("-")[0];
            const endMonth = period.endDate.split("-")[1];
            let tempCHPHTables = {};
            const lstLast12Months = {};
            const lstDistrictNames = {};
            tempLstOrgUnitTable.map((org) => (lstDistrictNames[org.name] = 0));
            lstDistrictNames["countNoAddress"] = 0;

            if (startYear == endYear) {
              for (let index = 1; index <= 12; index++) {
                let month = index;
                if (index < 10) {
                  month = "0" + index;
                }
                lstLast12Months[`${startYear}-${month}`] = lstDistrictNames;
              }
            } else {
              for (let index = startMonth; index <= 12; index++) {
                lstLast12Months[`${startYear}-${index}`] = lstDistrictNames;
              }
              for (let index = 1; index <= endMonth; index++) {
                let month = index;
                if (index < 10) {
                  month = "0" + index;
                }
                lstLast12Months[`${endYear}-${month}`] = lstDistrictNames;
              }
            }

            for (let index = 0; index < lstCHPH.length; index++) {
              const CHPHId = lstCHPH[index].id;
              const CHPHName = lstCHPH[index].name;
              let cloneLstLast12Months = JSON.parse(
                JSON.stringify(lstLast12Months)
              );
              tempCHPHTables[CHPHName] = cloneLstLast12Months;

              let eventDataAPI = null;
              if (!Object.keys(lstDeNonEPI).includes(serviceType)) {
                eventDataAPI = await pull(
                  `/api/analytics/events/query/UXiVDCcnmoJ?dimension=pe:${period.dhis2Period}&dimension=ou:${CHPHId}&dimension=YfgUjOzcdm2.${serviceType}:IN:1&dimension=YfgUjOzcdm2.WtqnbO4FXrx&stage=YfgUjOzcdm2&displayProperty=NAME&outputType=EVENT&desc=eventdate&paging=false`
                );
              } else {
                const stage = lstDeNonEPI[serviceType].stage;
                let condition = "";
                switch (serviceType) {
                  case "QQ8tl6gKEEx":
                    condition = `&dimension=${stage}.DIdyGwQaUnv:LT:1`;
                    break;
                  case "NLLpw6yqkR0":
                    condition = `&dimension=${stage}.L4vJEryMxSp:IN:3;4;2;1`;
                    break;
                  default:
                    break;
                }
                eventDataAPI = await pull(
                  `/api/analytics/events/query/${lstDeNonEPI[serviceType].program}.json?dimension=pe:${period.dhis2Period}&dimension=ou:${CHPHId}&dimension=${stage}.WtqnbO4FXrx${condition}&stage=${stage}&displayProperty=NAME&outputType=EVENT&desc=eventdate&paging=false`
                );
              }

              const findInx = (field) => {
                return eventDataAPI.headers.findIndex((e) => e.name === field);
              };
              eventDataAPI.rows.map((event) => {
                let orgOriginName = "";
                const eventPeriod = event[findInx("eventdate")].slice(0, 7);
                orgOriginName = organisationUnits.filter(
                  (org) => org.code === event[findInx("WtqnbO4FXrx")]
                )[0]?.displayName;

                if (!orgOriginName || orgOriginName === "") {
                  tempCHPHTables[CHPHName][eventPeriod]["countNoAddress"] += 1;
                } else if (
                  tempLstOrgUnitTable.map((e) => e.name).includes(orgOriginName)
                ) {
                  if (
                    orgOriginName === "0102 Sikhottabong" &&
                    CHPHName === "0002 CH Mittaphap"
                  ) {
                  }
                  tempCHPHTables[CHPHName][eventPeriod][orgOriginName] += 1;
                }
              });
            }
            setCHPHTables(tempCHPHTables);
          }
        }
        tempLstOrgUnitTable.sort((a, b) => {
          return a["name"].localeCompare(b["name"]);
        });

        setLstOrgUnitTable(tempLstOrgUnitTable);
        let lstOrgId = [];
        lstOrgId = tempLstOrgUnitTable.map((e) => {
          tempLstOrgsData[e.id] = {
            countEvents: 0,
            countInside: 0,
            countOutside: 0,
            countOther: 0,
            countNoAddress: 0,
            countTotalCachment: 0,
            countPop: "",
            countPopPercent: "",
          };
          return e.id;
        });

        for (let index = 0; index < lstOrgId.length; index++) {
          const orgRowId = lstOrgId[index];
          let eventDataAPI = null;
          if (!Object.keys(lstDeNonEPI).includes(serviceType)) {
            eventDataAPI = await pull(
              `/api/analytics/events/query/UXiVDCcnmoJ?dimension=pe:${period.dhis2Period}&dimension=ou:${orgRowId}&dimension=YfgUjOzcdm2.${serviceType}:IN:1&dimension=YfgUjOzcdm2.r2lL9b9n7AH&dimension=YfgUjOzcdm2.WtqnbO4FXrx&stage=YfgUjOzcdm2&displayProperty=NAME&outputType=EVENT&desc=eventdate&paging=false`
            );
          } else {
            const stage = lstDeNonEPI[serviceType].stage;
            let condition = "";
            switch (serviceType) {
              case "QQ8tl6gKEEx":
                condition = `&dimension=${stage}.DIdyGwQaUnv:LT:1`;
                break;
              case "NLLpw6yqkR0":
                condition = `&dimension=${stage}.L4vJEryMxSp:IN:3;4;2;1`;
                break;
              default:
                break;
            }
            eventDataAPI = await pull(
              `/api/analytics/events/query/${lstDeNonEPI[serviceType].program}.json?dimension=pe:${period.dhis2Period}&dimension=ou:${orgRowId}&dimension=${stage}.r2lL9b9n7AH&dimension=${stage}.WtqnbO4FXrx${condition}&stage=${stage}&displayProperty=NAME&outputType=EVENT&desc=eventdate&paging=false`
            );
          }

          const findInx = (field) => {
            return eventDataAPI.headers.findIndex((e) => e.name === field);
          };

          eventDataAPI.rows.map((event) => {
            let orgOriginId = "";

            if (orgUnit["level"] === 1) {
              orgOriginId = organisationUnits.filter(
                (org) => org.code === event[findInx("r2lL9b9n7AH")]
              )[0]?.id;
            }
            if (orgUnit["level"] === 2) {
              orgOriginId = organisationUnits.filter(
                (org) => org.code === event[findInx("WtqnbO4FXrx")]
              )[0]?.id;
            }

            if (!orgOriginId || orgOriginId === "") {
              tempLstOrgsData[orgRowId]["countNoAddress"] += 1;
            } else if (orgOriginId === orgRowId) {
              tempLstOrgsData[orgRowId]["countInside"] += 1;
              tempLstOrgsData[orgRowId]["countTotalCachment"] += 1;
            } else {
              tempLstOrgsData[orgRowId]["countOutside"] += 1;
              if (tempLstOrgsData[orgOriginId]) {
                tempLstOrgsData[orgOriginId]["countOther"] += 1;
                tempLstOrgsData[orgOriginId]["countTotalCachment"] += 1;
              } else {
                tempLstOrgsData[orgOriginId] = { countOther: 1 };
                tempLstOrgsData[orgOriginId] = { countTotalCachment: 1 };
              }
            }
          });

          tempLstOrgsData[orgRowId]["countEvents"] = eventDataAPI.rows.length;

          const estimatedPopId = lstEstimatedPopId[serviceType];
          if (estimatedPopId) {
            const estimatedPopAPI = await pull(
              `/api/analytics.json?dimension=dx:${lstEstimatedPopId[serviceType]}&dimension=ou:${orgRowId}&filter=pe:${period.dhis2Period}&displayProperty=NAME`
            );
            const findPopInx = (field) => {
              return estimatedPopAPI.headers.findIndex((e) => e.name === field);
            };
            estimatedPopAPI.rows.map((r) => {
              let value = r[findPopInx("value")];
              tempLstOrgsData[orgRowId]["countPop"] = parseInt(value);
              tempLstOrgsData[orgRowId]["countPopPercent"] =
                (
                  (tempLstOrgsData[orgRowId]["countTotalCachment"] /
                    parseInt(value)) *
                  100
                ).toFixed(2) + "%";
            });
          }
          // tempLstOrgsData[orgRowId]["countTotalCachment"] =
          //   tempLstOrgsData[orgRowId]["countInside"] +
          //   tempLstOrgsData[orgRowId]["countOther"];
        }
        console.log(tempLstOrgsData);
        setLstTableData(tempLstOrgsData);
        setIsFetching(false);
      })();
    }
  }, [isFetching]);
  return loading ? (
    <Loader>Loading...</Loader>
  ) : (
    <div className="epi-coverage-container">
      <HeaderBar>
        <OrgUnitSelector />
        <PeriodTypeSelector
          periodTypes={["Yearly", "Monthly", "Last12Months"]}
        />
        <PeriodSelector />
        <ServiceTypeSelector
          value={serviceType}
          onChangeValue={handleServiceChange}
        />
        {isEnoughSelectors() ? (
          <div className="button-container">
            <Button variant="contained" onClick={getReport}>
              {t("grpt")}
            </Button>
          </div>
        ) : null}
      </HeaderBar>
      <div>
        <ToastContainer />
        {isFetching ? (
          <Loader>Loading...</Loader>
        ) : (
          Object.keys(lstTableData).length > 0 && (
            <>
              <div className="report-table">
                <table>
                  <thead>
                    <tr>
                      <th className="report-title" colSpan={11}>
                        {t("serCover")}
                      </th>
                    </tr>
                    <tr>
                      <th className="main-label" rowSpan={2}>
                        {t("orgUnit")}
                      </th>
                      <th className="main-label" colSpan={8}>
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
                      <th className="balance-col">{t("noAddr")}</th>
                      <th className="balance-col">{t("ttCachArea")}</th>
                      <th className="balance-col">{t("estPop")}</th>
                      <th
                        className="balance-col"
                        style={{ backgroundColor: "#ccc" }}
                      >
                        {t("popFromFF")}
                      </th>
                      <th className="balance-col">{t("estPop")}</th>
                      <th
                        className="balance-col"
                        style={{ backgroundColor: "#ccc" }}
                      >
                        {t("popFromFF")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lstOrgUnitTable.map((prov) => {
                      return (
                        <tr>
                          <td className="row-title">{prov["name"]}</td>
                          <td className="input-field">
                            {lstTableData[prov["id"]]["countEvents"]}
                          </td>
                          <td className="input-field">
                            {lstTableData[prov["id"]]["countInside"]}
                          </td>
                          <td className="input-field">
                            {lstTableData[prov["id"]]["countOutside"]}
                          </td>
                          <td className="input-field">
                            {lstTableData[prov["id"]]["countOther"]}
                          </td>
                          <td className="input-field">
                            {lstTableData[prov["id"]]["countNoAddress"]}
                          </td>
                          <td className="input-field">
                            {lstTableData[prov["id"]]["countTotalCachment"]}
                          </td>
                          <td className="input-field">
                            {lstTableData[prov["id"]]["countPop"]}
                          </td>
                          <td className="input-field percentage disable-field"></td>
                          <td className="input-field">
                            {lstTableData[prov["id"]]["countPopPercent"]}
                          </td>
                          <td className="input-field percentage disable-field"></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {isShowSubTable &&
                Object.keys(CHPHTables)
                  .sort((a, b) => {
                    return a.localeCompare(b);
                  })
                  .map((chph) => {
                    const tableCHPHData = CHPHTables[chph];
                    const lstDistrictName = lstOrgUnitTable.map((e) => e.name);
                    const arrayReduce = lstDistrictName.map((distName) => {
                      return Object.values(tableCHPHData)
                        .map((e) => {
                          return e[distName];
                        })
                        .reduce((sum, a) => sum + a, 0);
                    });
                    const totalSum = arrayReduce.reduce((sum, a) => sum + a, 0);

                    return (
                      <div className="report-table chph-table">
                        <table>
                          <thead>
                            <tr>
                              <th
                                className="report-title"
                                colSpan={lstOrgUnitTable.length + 3}
                              >
                                {chph}
                              </th>
                            </tr>
                            <tr>
                              <th className="main-label" rowSpan={2}>
                                {"Period/Org"}
                              </th>
                              {lstOrgUnitTable.map((prov) => (
                                <th className="balance-col">{prov["name"]}</th>
                              ))}
                              <th className="main-label" rowSpan={2}>
                                {"No address"}
                              </th>
                              <th className="main-label" rowSpan={2}>
                                {"Total"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(tableCHPHData).map((period) => {
                              return (
                                <tr>
                                  <td className="row-title">{period}</td>
                                  {Object.keys(tableCHPHData[period])
                                    .sort((a, b) => {
                                      return a.localeCompare(b);
                                    })
                                    .map((orgName) => {
                                      return (
                                        <td className="input-field">
                                          {tableCHPHData[period][orgName]}
                                        </td>
                                      );
                                    })}
                                  <td className="input-field">
                                    {Object.values(
                                      tableCHPHData[period]
                                    ).reduce((sum, a) => sum + a, 0)}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="main-label">
                              <td className="row-title"> {"Total"}</td>
                              {arrayReduce.map((e) => {
                                return <td className="input-field">{e}</td>;
                              })}
                              <td className="input-field">
                                {Object.values(tableCHPHData)
                                  .map((e) => {
                                    return e["countNoAddress"];
                                  })
                                  .reduce((sum, a) => sum + a, 0)}
                              </td>
                              <td className="input-field">{totalSum}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
            </>
          )
        )}
      </div>
    </div>
  );
};
export default withReportContainer(Report);
