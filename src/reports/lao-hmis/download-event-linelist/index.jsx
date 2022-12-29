import { React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableHead,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import Loader from "@/common/Loader/Loader";
import withReportContainer from "@/hocs/withReportContainer";
import PeriodSelector from "@/common/PeriodSelector/PeriodSelector";
import OrgUnitSelector from "@/common/OrgUnitSelector/OrgUnitSelector";
import useAppState from "@/hooks/useAppState";
import useLocalization from "@/hooks/useLocalization";
import { pull } from "@/utils/fetch";
import { enTranslations, laosTranslations } from "./translations";
import "./index.css";
import { download } from "./download";

const downloadEventLinelist = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const { t, i18n } = useTranslation();
  const { state, action } = useAppState();
  const [isChooseProvince, setIsChooseProvince] = useState(true);
  const [fileName, setFileName] = useState("");
  const [isAllowRun, setIsAllowRun] = useState(false);

  const [lsOrgUnitOptions, setLstOrgUnitOptions] = useState([]);
  const [optionSetsOptions, setOptionSetsOptions] = useState([]);
  const { orgUnits } = state.metadata;

  const { dhis2Period, startDate, endDate } = state.selection.period;

  const levelOrgUnit = state.selection.orgUnit.level;
  const orgUnitId = state.selection.orgUnit.id;
  const orgUnitName = state.selection.orgUnit.name;
  useLocalization("lo", laosTranslations);
  useLocalization("en", enTranslations);
  const findOrgName = (code) => {
    return code && lsOrgUnitOptions.find((e) => e.code === code)?.displayName;
  };
  const getValueOptions = (code, optionSetId) => {
    return optionSetsOptions
      .find((e) => e.id === optionSetId)
      .options.find((e) => e.code === code)?.displayName;
  };
  useEffect(() => {
    (async () => {
      action.selectPeriod("periodType", "Daily");
      const orgUnitOptionSetsAPI = await pull(
        `/api/optionSets?fields=options[displayName,id,code]&filter=id:in:[quAw9R43Hcc,Fo4t7THmuHx,SYbcOcQqrWK,Zd0Zy8VfMls]`
      );
      const optionSetsAPI = await pull(
        `/api/optionSets?fields=id,options[displayName,id,code]&filter=id:in:[kMe7B54S9VH,C4y5rqhEvnE,zBVgecf3Ia6,g3Lwk861HoK]&paging=false`
      );
      setLstOrgUnitOptions(
        [].concat(...orgUnitOptionSetsAPI.optionSets.map((e) => e.options))
      );
      setOptionSetsOptions(optionSetsAPI.optionSets);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (levelOrgUnit === 2 && startDate) {
      setIsAllowRun(true);
      setFileName(orgUnitName.concat(`_${startDate}`).replaceAll(" ", "_"));
    }
  }, [orgUnitName, dhis2Period]);

  useEffect(() => {
    !levelOrgUnit || levelOrgUnit === 2
      ? setIsChooseProvince(true)
      : setIsChooseProvince(false);
  }, [levelOrgUnit]);

  const run = async () => {
    setIsAllowRun(false);
    setLoading(true);
    if (orgUnitId && startDate && endDate) {
      const resultPage1API = await pull(
        `/api/events.json?program=h6x4kyzKyK3&orgUnit=${orgUnitId}&startDate=${startDate}&endDate=${endDate}&ouMode=DESCENDANTS&totalPages=true&paging=false`
      );
      setEvents(resultPage1API.events);
      setLoading(false);
    }
  };

  return loading ? (
    <Loader>Loading</Loader>
  ) : (
    <div className="download-event-linelist-container">
      <div className="control-bar">
        <div className="row-control-bar">
          <OrgUnitSelector />
          <PeriodSelector />
          <div className="button-container">
            <Button variant="contained" onClick={run} disabled={!isAllowRun}>
              {t("run")}
            </Button>
          </div>
        </div>
        {!isChooseProvince && (
          <div className="error-text">Please Choose Province</div>
        )}
      </div>
      {events.length > 0 && (
        <div>
          <Button
            variant="contained"
            onClick={() =>
              download(
                events,
                optionSetsOptions,
                fileName,
                lsOrgUnitOptions,
                t,
                orgUnits
              )
            }
          >
            <div
              id="spinner"
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "5px",
              }}
            >
              <CircularProgress
                style={{
                  width: "18px",
                  height: "18px",
                  color: "white",
                }}
              />
            </div>
            {t("Download")}
          </Button>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("orgUnit")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("dateOfReport")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("nameSurname")}
                  </TableCell>
                  <TableCell width={"4%"} component="th" scope="row">
                    {t("age")}
                  </TableCell>
                  <TableCell width={"4%"} component="th" scope="row">
                    {t("sex")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("nationality")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("occupation")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("provinceOfResidence")}
                  </TableCell>
                  <TableCell width={"8%"} component="th" scope="row">
                    {t("districtOfResidence")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("villageOfResidence")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("contactPhoneNumber")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("onsetDate")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("symptom")}
                  </TableCell>
                  <TableCell width={"8%"} component="th" scope="row">
                    {t("diseaseName")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("dateOfAdmitted")}
                  </TableCell>
                  <TableCell width={"6%"} component="th" scope="row">
                    {t("treatmentWard")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event, i) => {
                  const value = (id) => {
                    let output = event.dataValues.filter(
                      (e) => e.dataElement === id
                    )[0]?.value;
                    return output ? output : "";
                  };
                  let orgUnitName = orgUnits.find(
                    (e) => e.id === event.orgUnit
                  ).displayName;
                  return (
                    <TableRow
                      key={i}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f7f7f7",
                        },
                      }}
                    >
                      <TableCell width={"6%"} component="th" scope="row">
                        {orgUnitName}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {event.eventDate.slice(0, 10)}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {value("lQSUx15reeW")}
                        {value("rVgvJgkKGeG")}
                      </TableCell>
                      <TableCell width={"4%"} component="th" scope="row">
                        {value("zDPvXY6h4JN")}
                      </TableCell>
                      <TableCell width={"4%"} component="th" scope="row">
                        {getValueOptions(value("CC9BpgSQbfh"), "C4y5rqhEvnE")}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {value("jaan5ZI8EnJ") === "true"
                          ? value("Nsv148saunk")
                          : findOrgName("LA")}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {getValueOptions(value("VxyFtFkaFpf"), "zBVgecf3Ia6")}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {findOrgName(value("r2lL9b9n7AH"))}
                      </TableCell>
                      <TableCell width={"8%"} component="th" scope="row">
                        {findOrgName(value("WtqnbO4FXrx"))}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {findOrgName(value("mrrTTvKqyi1"))}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {value("fou2X6uMkty")}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {value("bS8cPIyCJNR")}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {/* {(value("Dyq13cMGMzT"))} */}
                      </TableCell>
                      <TableCell width={"8%"} component="th" scope="row">
                        {getValueOptions(value("Dyq13cMGMzT"), "kMe7B54S9VH")}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {value("p3jMZ9XRiIJ")}
                      </TableCell>
                      <TableCell width={"6%"} component="th" scope="row">
                        {getValueOptions(value("iuVbJUaYMd9"), "g3Lwk861HoK")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default withReportContainer(downloadEventLinelist);
