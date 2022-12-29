import { useEffect, useState } from "react";
import Loader from "@/common/Loader/Loader";
import { pull } from "@/utils/fetch";
import { useTranslation } from "react-i18next";
import useAppState from "@/hooks/useAppState";

import Example from "@/reports/example";

// import Report from "@/reports/qps/third-party-all-approved";
//import Report from "@/reports/qps/all-raw-value";
// import Report from "@/reports/qps/3rd-party-all-raw-value";
// import Report from "@/reports/lao-hmis/ncle-weekly";
// import Report from "@/reports/laos-his/tb-case-finding";
// import Report from "@/reports/lao-hmis/download-event-linelist";
// import Report from "@/reports/qias/flip-chart-33";
// import Report from "@/reports/qias/flip-chart";
// import Report from "@/reports/qias/flip-chart-32";
// import Report from '@/reports/qias/flip-chart-35';
// import Report from "@/reports/qias/flip-chart-35";
// import Report from "@/reports/qias/flip-chart-34";
// import Report from "@/reports/qias/flip-chart";
// import Report from "@/reports/qias/flip-chart/";
//import Report from "@/reports/qias/flip-chart-34";
//import Report from "@/reports/lao-hmis/epi-coverage";
// import Report from "@/reports/laos-his/tb-case-finding";



const App = () => {
  const { action } = useAppState();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  /**
   * Expand report width as much as possible
   * @param {String} domId - Root DOM Id
   */
  const expandReport = (domId) => {
    parent.document.getElementById(
      domId
    ).children[0].children[1].children[0].children[0].children[0].children[0].children[0].children[0].style.width =
      "100%";
  };

  useEffect(() => {
    setTimeout(() => {
      if (parent.document.getElementById("root")) {
        expandReport("root");
      }
      if (parent.document.getElementById("dhis2-app-root")) {
        expandReport("dhis2-app-root");
      }
    }, 500);
  }, []);

  useEffect(() => {
    (async () => {
      const metadata = {};
      const me = await pull("/api/me");
      const orgUnits = await pull(
        "/api/organisationUnits?fields=id,name,displayName,level,parent,ancestors,attributeValues&paging=false"
      );
      const orgUnitLevels = await pull(
        "/api/organisationUnitLevels?fields=id,name,displayName"
      );
      metadata.me = me;
      metadata.orgUnits = orgUnits.organisationUnits;
      metadata.orgUnitLevels = orgUnitLevels.organisationUnitLevels;
      action.setMetadata(metadata);
      i18n.changeLanguage(me.settings.keyUiLocale);
      setLoading(false);
    })();
  }, []);

  return loading ? (
    <Loader>{t("initializing")}</Loader>
  ) : (
    <div className="App">
      <Example />
    </div>
  );
};

export default App;
