import { React, useEffect, useState } from "react";
import withReportContainer from "@/hocs/withReportContainer";
// Translation
import { useTranslation } from "react-i18next";
import useLocalization from "@/hooks/useLocalization";
import {
  enTranslations,
  laosTranslations,
} from "@/shared_resources/service-coverage/translations";
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
import ServiceTypeSelector from "@/shared_resources/service-coverage/ServiceTypeSelector";
import CountryReportTable from "./components/CountryReportTable";
import ProvinceReportTable from "./components/ProvinceReportTable";
// Other tools
import { pull } from "@/utils/fetch";
import { getCurrLanguageTranslation } from "./utils";
import { ignoredOrgUnits, orgUnitGroupsMapping } from "./mapping";
import _ from "lodash";
// CSS
import "./index.css";

const Report = () => {
  const { t, i18n } = useTranslation();
  const { state, action } = useAppState();
  const { orgUnit, period } = state.selection;
  // Custom state
  const [data, setData] = useState({});
  const [currLanguage, setCurrLanguage] = useState("en");
  const [isDataDownloaded, setDataDownloadedSts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState("");
  // console.log(orgUnit);

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

  const handleServiceChange = (value) => {
    setServiceType(value);
  };

  const isEnoughData = () => {
    return orgUnit && period.dhis2Period !== null && serviceType ? true : false;
  };

  const getOrgUnitsBaseOnGroup = (listOrgUnits, orgUnitGroupTag) => {
    return listOrgUnits
      .filter((orgUnit) => {
        const orgUnitGroupsId = orgUnit["organisationUnitGroups"].map(
          (orgUnitGroup) => orgUnitGroup["id"]
        );
        return orgUnitGroupsId.includes(orgUnitGroupsMapping[orgUnitGroupTag]);
      })
      .sort((a, b) => {
        return a["name"].localeCompare(b["name"]);
      });
  };

  /* Get data for Laos PDR */
  // /api/analytics/events/query/Yj9cJ34AXw6.json?dimension=pe:LAST_12_MONTHS&dimension=ou:IWp9dQGM0bS&dimension=hCTTxOH8FOa.zzbjz44qcVl&dimension=hCTTxOH8FOa.wQNvIFAlWdA:IN:1&stage=hCTTxOH8FOa&displayProperty=NAME&outputType=EVENT&desc=eventdate&pageSize=100&page=1
  /* Get Org Unit path */
  // /api/organisationUnits/dIpcc4rnWOC.json?fields=path

  const getProvsData = async () => {
    const countryData = await pull(
      `/api/organisationUnits/${orgUnit["id"]}.json?fields=id,name,children[id,name,translations]`
    );
    const mainProvinces = countryData["children"]
      .filter((province) => {
        return !ignoredOrgUnits.includes(province["id"]);
      })
      .sort((a, b) => {
        return a["name"].localeCompare(b["name"]);
      });
    return mainProvinces.map((province) => {
      const provName = getCurrLanguageTranslation(
        currLanguage,
        province["translations"],
        province["name"]
      );
      // You can write more code in here to fetch data for each province
      return {
        id: province["id"],
        name: provName,
      };
    });
  };

  const getProvsAnalyticsData = async () => {
    let finalGroupData;
    const data = await pull(
      `/api/analytics/events/query/Yj9cJ34AXw6.json?dimension=pe:${period.dhis2Period}&dimension=ou:IWp9dQGM0bS&dimension=hCTTxOH8FOa.zzbjz44qcVl&dimension=hCTTxOH8FOa.${serviceType}:IN:1&stage=hCTTxOH8FOa&displayProperty=NAME&outputType=EVENT&desc=eventdate&paging=false`
    );
    if (data["rows"].length) {
      const groupData = _.groupBy(data["rows"], "12");
      // console.log(groupData);
      let newData = [];
      for (const orgUnitId in groupData) {
        const orgUnitPath = await pull(
          `/api/organisationUnits/${orgUnitId}.json?fields=path`
        );
        // console.log(orgUnitPath);
        const orgUnitsHrchyArr = orgUnitPath["path"].split("/");
        newData.push([orgUnitsHrchyArr[2], groupData[orgUnitId].length]);
      }
      const newGroupData = _.groupBy(newData, "0");
      finalGroupData = Object.keys(newGroupData).map((provOrgUnitId) => {
        const totalCount = newGroupData[provOrgUnitId].reduce((acc, curr) => {
          return acc + curr[1];
        }, 0);
        return { id: provOrgUnitId, totalServices: totalCount };
      });
    }
    return finalGroupData;
  };

  const getCountryData = async () => {
    const [provsData, provsAnalyticsData] = await Promise.all([
      getProvsData(),
      getProvsAnalyticsData(),
    ]);
    // console.log(provsData);
    // console.log(provsAnalyticsData);
    return provsData.map((prov) => {
      const analyticsData = provsAnalyticsData.find(
        (provAnalyticsData) => provAnalyticsData["id"] === prov["id"]
      );
      return analyticsData ? { ...prov, ...analyticsData } : prov;
    });
  };

  const getReport = async () => {
    setData({});
    setLoading(true);
    switch (orgUnit["level"]) {
      case 1:
        const mainData = await getCountryData();
        setData(mainData);
        break;
      case 2:
        const provData = await pull(
          `/api/organisationUnits/${orgUnit["id"]}.json?fields=id,name,children[id,name,translations,description,organisationUnitGroups]`
        );
        const districts = provData["children"];
        let dhoOrgUnits = getOrgUnitsBaseOnGroup(districts, "DHO");
        if (orgUnit["id"] === "W6sNfkJcXGC") {
          // console.log("You are choosing Vientiane Capital.");
          let chOrgUnits = getOrgUnitsBaseOnGroup(districts, "CH");
          chOrgUnits = chOrgUnits.map((orgUnit) => {
            const provName = getCurrLanguageTranslation(
              currLanguage,
              orgUnit["translations"],
              orgUnit["name"]
            );
            // You can write more code in here to fetch data for each CH Hospital
            return {
              id: orgUnit["id"],
              name: provName,
            };
          });
          setData((oldData) => ({ ...oldData, CH_ORG_UNITS: chOrgUnits }));
        } else {
          console.log("You are choosing Province Level.");
          let phOrgUnits = getOrgUnitsBaseOnGroup(districts, "PH");
          phOrgUnits = phOrgUnits.map((orgUnit) => {
            const provName = getCurrLanguageTranslation(
              currLanguage,
              orgUnit["translations"],
              orgUnit["name"]
            );
            // You can write more code in here to fetch data for each CH Hospital
            return {
              id: orgUnit["id"],
              name: provName,
            };
          });
          setData((oldData) => ({ ...oldData, PH_ORG_UNITS: phOrgUnits }));
        }
        dhoOrgUnits = dhoOrgUnits.map((orgUnit) => {
          const provName = getCurrLanguageTranslation(
            currLanguage,
            orgUnit["translations"],
            orgUnit["name"]
          );
          // You can write more code in here to fetch data for each CH Hospital
          return {
            id: orgUnit["id"],
            name: provName,
          };
        });
        setData((oldData) => ({ ...oldData, DHO_ORG_UNITS: dhoOrgUnits }));
        break;
      default:
        break;
    }
    setLoading(false);
    setDataDownloadedSts(true);
  };

  const routingRender = () => {
    switch (orgUnit["level"]) {
      case 1:
        return <CountryReportTable data={data} />;
      case 2:
        return <ProvinceReportTable data={data} />;
      default:
        return (
          <div className="error-field">
            <h2>This report is only applied for Country and Province level</h2>
          </div>
        );
    }
  };

  return loading ? (
    <Loader>Loading...</Loader>
  ) : (
    <div className="service-coverage-container">
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
        {isEnoughData() ? (
          <div className="button-container">
            <Button variant="contained" onClick={getReport}>
              {t("grpt")}
            </Button>
          </div>
        ) : null}
      </HeaderBar>
      <div>{isDataDownloaded ? routingRender() : null}</div>
    </div>
  );
};

export default withReportContainer(Report);
