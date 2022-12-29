import { React, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Modal,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  ImportExport,
  Flag,
  ArrowBack,
  AddCircle,
  FilterList,
  Search,
  NoteAlt,
} from "@mui/icons-material";

import Loader from "@/common/Loader/Loader";
import withReportContainer from "@/hocs/withReportContainer";
import OrgUnitSelector from "@/common/OrgUnitSelector/OrgUnitSelector";
import useAppState from "@/hooks/useAppState";
import useLocalization from "@/hooks/useLocalization";
import { pull, push } from "@/utils/fetch";
import "./index.css";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";
import moment from "moment";
import { el } from "date-fns/locale";
const { VITE_REPORT_MODE } = import.meta.env;

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};
const ActivePatients = () => {
  const [loading, setLoading] = useState(true);
  const [isShowTable, setIsShowTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [addNoteFromAllNotes, setAddNoteFromAllNotes] = useState(false);
  const [step, setStep] = useState(1);
  const [detailOfEvent, setDetailOfEvent] = useState([]);
  const [objSectionConsultation, setObjSectionConsultation] = useState(null);
  const [lstAllEventsOfPhysician, setLstAllEventsOfPhysician] = useState([]);
  const [lstAllEventsOfPsycho, setLstAllEventsOfPsycho] = useState([]);
  const [lstAllEventsOfNotes, setLstAllEventsOfNotes] = useState([]);
  const [lstAllEventsOfConsultation, setLstAllEventsOfConsultation] = useState(
    []
  );
  const [isFirstConsultation, setIsFirstConsultation] = useState(false);
  const [isLastConsultation, setIsLastConsultation] = useState(false);

  const [valueCheckbox, setValueCheckbox] = useState({
    psy: false,
    suicide: false,
    treatment: false,
  });
  const [valueCheckboxStatus, setValueCheckboxStatus] = useState({
    act: false,
    inAct: false,
  });
  const [valueCheckboxSystematic, setValueCheckboxSystematic] = useState({
    improved: false,
    moderate: false,
    worsen: false,
    noNeed: false,
    normal: false,
  });
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElSearch, setAnchorElSearch] = useState(null);
  const [typeSearch, setTypeSearch] = useState("");
  const [keySearch, setKeySearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const handleClickFilter = (event, type) => {
    setTypeFilter(type);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseFilter = () => {
    setAnchorEl(null);
  };

  const handleClickSearch = (event, type) => {
    setTypeSearch(type);
    setAnchorElSearch(event.currentTarget);
  };
  const handleCloseSearch = () => {
    setAnchorElSearch(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "filter-popover" : undefined;

  const openSearch = Boolean(anchorElSearch);
  const idSearch = openSearch ? "search-popover" : undefined;

  const [dataChart, setDataChart] = useState([]);
  const [allDatasTei, setAllDatasTei] = useState([]);
  const [savedAllDatasTei, setSavedAllDatasTei] = useState([]);

  const [orgUnitTitle, setOrgUnitTitle] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [allEventsOfTei, setAllEventsOfTei] = useState({});
  const [allTeis, setAllTeis] = useState([]);
  const [teiData, setTeiData] = useState({});
  const [rolePhysician, setRolePhysician] = useState(false);
  const [rolePsychiatrist, setRolePsychiatrist] = useState(false);
  const [roleTreatment, setRoleTreatment] = useState(false);
  const [typeAddEvent, setTypeAddEvent] = useState("");
  const [teiChosen, setTeiChosen] = useState(null);
  const [allowBack, setAllowBack] = useState(false);
  const [lstMedicine, setLstMedicine] = useState([]);
  const [lstDeConsultation, setLstDeConsultation] = useState([]);
  const [lstDeInitialVisit, setLstDeInitialVisit] = useState([]);
  const [lstDeNotes, setLstDeNotes] = useState([]);
  const [lstDePhysician, setLstDePhysician] = useState([]);
  const [lstDePsy, setLstDePsy] = useState([]);

  const [sortBy, setSortBy] = useState("");
  const [sortRevert, setSortRevert] = useState(false);
  const [showAllType, setShowAllType] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [responseSubmit, setResponseSubmit] = useState("");

  const [lstDesPsycho, setLstDesPsycho] = useState([
    {
      id: "achkq4Wz4Tz",
      name: "Need to examine the patient",
      title: "examinedThePatient",
    },
    {
      id: "OKpjiOVDMNs",
      name: "Psychiatrist consultant diagnosis",
      title: "psyDiagnosis",
    },
    {
      id: "jfgELN4dcQl",
      name: "Suicide risk assessed by psychiatrist",
      title: "suicideRiskAssessedByPsychiatrist",
    },
    {
      id: "cC6mXbiDjNF",
      name: "Psychiatrict consultation notes",
      title: "psyNotes",
    },
    { id: "OrV86rECvCe", name: "Flag for review", title: "flagForReview" },
  ]);

  const lstDeMedicine = [
    { name: "Medicine prescript 1", id: "sZHe1LVGeia", title: "medicine1" },
    {
      name: "Medicine prescript 1 daily dose",
      id: "SBaGM1yStjL",
      title: "dose1",
    },
    {
      name: "Medicine prescript 2",
      id: "E7v4iBvtPS6",
      title: "medicine2",
    },
    {
      name: "Medicine prescript 2 daily dose",
      id: "kh99oRC5Mfy",
      title: "dose2",
    },
    {
      name: "Medicine prescript 3",
      id: "AV2l0x57IRi",
      title: "medicine3",
    },
    {
      name: "Medicine prescript 3 daily dose",
      id: "YKiHMsKeTni",
      title: "dose3",
    },
    {
      name: "Medicine prescript 4",
      id: "ijZcDpug46e",
      title: "medicine4",
    },
    {
      name: "Medicine prescript 4 daily dose",
      id: "z7dtYocGjqq",
      title: "dose4",
    },
    {
      name: "Medicine prescript 5",
      id: "HrtW5RsDLXp",
      title: "medicine5",
    },
    {
      name: "Medicine prescript 5 daily dose",
      id: "s1M9fZMpJ2N",
      title: "dose5",
    },
    {
      name: "Medicine prescript Other Specify",
      id: "LO4FOxKPznR",
      title: "medicine6",
    },
    {
      name: "Medicine prescript Other Specify dosage",
      id: "eYaVukpqv4b",
      title: "dose6",
    },
  ];

  const [prescription, setPrescription] = useState({
    medicine1: "valueNull",
    dose1: "",
    medicine2: "valueNull",
    dose2: "",
    medicine3: "valueNull",
    dose3: "",
    medicine4: "valueNull",
    dose4: "",
    medicine5: "valueNull",
    dose5: "",
    medicine6: "valueNull",
    dose6: "",
    examinedThePatient: "",
    PHQ9Score: "",
    physicianNotes: "",
    physicianDiagnosis: "valueNull",
    suicideRiskAssessedByPhysician: "",
    flagForReview: "valueNull",
  });

  const [importantNoteForConsultant, setImportantNoteForConsultant] =
    useState("");
  const [psyData, setPsyData] = useState({
    examinedThePatient: "",
    psyDiagnosis: "",
    suicideRiskAssessedByPsychiatrist: "",
    psyNotes: "",
    flagForReview: "valueNull",
  });

  const [lstDesPhysician, setLstDesPhysician] = useState([
    {
      id: "NNl81rkUmnD",
      name: "Examined the patient",
      title: "examinedThePatient",
    },
    { id: "dUzDDG9we7p", name: "PHQ-9 score", title: "PHQ9Score" },
    {
      id: "Zx7uYd8jkp3",
      name: "Physician's diagnosis",
      title: "physicianDiagnosis",
    },
    {
      id: "OuZVdO0XgIh",
      name: "Suicide risk assessed by physician",
      title: "suicideRiskAssessedByPhysician",
    },
    { id: "BjpcUuzXFue", name: "Physician's notes :", title: "physicianNotes" },
    { id: "p8xMqcMl81N", name: "Flag for review", title: "flagForReview" },
  ]);

  const optionSetPhysicianDianosis = [
    {
      code: "0",
      name: "None",
      id: "WA4K13YuVng",
    },
    {
      code: "1",
      name: "Mild depression",
      id: "yndi0KNT7ou",
    },
    {
      code: "2",
      name: "Moderate depression",
      id: "QGAaFRu6EyV",
    },
    {
      code: "3",
      name: "Severe depression",
      id: "wVt6OdOwiZW",
    },
  ];

  const optionSetFlagForReview = [
    {
      code: "0",
      name: "No",
      id: "kVJykndaaKw",
    },
    {
      code: "1",
      name: "Flag for review",
      id: "bkYlSTWT5JW",
    },
  ];

  const optionSetFlagForReviewPhysic = [
    {
      code: "3",
      name: "Flag for review",
      id: "Ck8CftI1Er3",
    },
    {
      code: "0",
      name: "No",
      id: "z4L07bMiSJr",
    },
  ];

  const [lstDeInitial, setLstDeInitial] = useState([
    "F2NqmudkAzw",
    "pxAdOcG3Wv3",
    "g8CKZHRs2vf",
    "dl5BqxBNRU7",
    "cGsM4Tqldiu",
  ]);
  let lstDeConsultationBySection = {
    "Before screening": ["L58FqTbWXkk", "DZyC8pTq09D"],
    Medication: [
      "SVlzFnwlFQ8",
      "UQAjVb3u3FI",
      "xgji5WXIl06",
      "sDCs8nQV6JX",
      "JobNE9P5QMX",
      "hxHg8hW9KWL",
      "PWknOU9IEzl",
      "wXNkfHYjIBv",
      "S3HKcp7Trll",
      "tQSBrVLrMph",
      "cl131jeq5iq",
      "M2kVb6UFaxq",
      "qZuaZDxcU02",
      "VuH1wQBStv7",
      "fjjwPTEKZUI",
      "atQkDSgrds2",
      "R5A3Lze59SP",
      "w6ssrnlUYLO",
      "Yhn6lomu89P",
      "XTDTFvq0XIY",
      "ItYgMeQCVNr",
      "ox5rK6S7ioX",
      "bNhs1ZJgBn9",
      "V3Q5jHwkdnr",
      "ZSqXAricbw3",
      "MyQQLDwRb5H",
      "cMl7acpFSZx",
    ],
    "Psychotherapy (include social support)": [
      "l2oGeZJqqls",
      "FUOW9HDxYtQ",
      "kNWSFSQz9ep",
      "O5ARFXf4dYZ",
      "IbuPS5XhOiz",
      "l6T7yWY38GK",
      "g6KwFt4ZHCK",
      "wfvdO2QoVKw",
      "klbkA8FijZ0",
      "jIHURnWgjdX",
      "GqYqxu2LOpE",
      "PE1J8A2ycZx",
      "tAUGVMGpa3J",
      "MBBR6KKYdi5",
      "QupQ35PDGaX",
      "ugvseiKMkBd",
      "zfSu8HZhVxi",
    ],
    "Depression symptom assessment": [
      "ZeEhlkiUUMJ",
      "XHYcHuPeJdB",
      "ZQRgXyt1a2s",
      "JY9jppw2Df3",
      "Hup8aCsU7Fm",
      "tpDyOC6TnpP",
      "J4EuFfg17Uf",
      "XE9k0Avkd9E",
      "BywXWOlNUq6",
      "IIrS8L1rZRc",
      "Su5jupRwBDt",
      "jK5FpMjFVVT",
      "bsX2k2uiCgE",
      "WBmZqe0991H",
      "HE4h5YEo5mz",
      "wpRIkFHqueT",
      "bvRcd5dnq1R",
      "rNdN3wl0TER",
      "wfL3BRIo6Bj",
    ],
    "Management medically serious act of self-harm": [
      "U5Z1BkIgyPg",
      "B9xP1YSyE3p",
    ],
    "Flag for review": ["qLMEqG41ULv", "lbYDHwvLepb"],
  };
  const { t, i18n } = useTranslation();
  const { state } = useAppState();
  const { orgUnit } = state.selection;
  const { userGroups, dataViewOrganisationUnits } = state.metadata.me;
  const { orgUnits } = state.metadata;
  let userGroupsOrgUnitDisplayname = dataViewOrganisationUnits
    .map((e) => orgUnits.find((org) => org.id === e.id).displayName)
    .join(";");

  let userGroupsOrgUnit = dataViewOrganisationUnits.map((e) => e.id).join(";");
  useLocalization("lo", [{ key: "a", value: "LAOAAAAA" }]);
  useLocalization("en", [{ key: "a", value: "ENAAAAAAA" }]);
  useLocalization("vi", [{ key: "a", value: "VIAAAAAAA" }]);

  useEffect(() => {
    isDasboard && run();
    (async () => {
      const lstRole = userGroups.map((e) => e.id);
      i18n.changeLanguage("en");
      setLoading(false);
      setRolePhysician(lstRole.includes("E3czJYIt77m"));
      setRolePsychiatrist(lstRole.includes("OEZIJw3wyN3"));
      setRoleTreatment(lstRole.includes("RzZF90dwp94"));

      const lstOptionSetMedicineAPI = await pull(
        `/api/optionSets/tKiNCBE04ql.json?fields=options[id,name,code]`
      );
      setLstMedicine(lstOptionSetMedicineAPI.options);

      const lstDePhysicianAPI = await pull(
        `/api/programStages/HN0H6ha4zRV.json?fields=programStageDataElements[dataElement[id,name,displayName,valueType,optionSetValue,optionSet[options[id,name,code]]]`
      );
      let lstDePhysician = {};
      lstDePhysicianAPI.programStageDataElements.map(
        (de) => (lstDePhysician[de.dataElement.id] = de.dataElement)
      );

      setLstDePhysician(lstDePhysician);

      const lstDePsyAPI = await pull(
        `/api/programStages/FYifVckEipD.json?fields=programStageDataElements[dataElement[id,name,displayName,valueType,optionSetValue,optionSet[options[id,name,code]]]`
      );
      let lstDePsy = {};
      lstDePsyAPI.programStageDataElements.map(
        (de) => (lstDePsy[de.dataElement.id] = de.dataElement)
      );
      setLstDePsy(lstDePsy);

      const lstDeConsultationAPI = await pull(
        `/api/programStages/TgIXYmJFzZX.json?fields=programStageDataElements[dataElement[id,name,displayName,valueType,optionSetValue,optionSet[options[id,name,code]]]`
      );
      let lstDeConsul = {};
      lstDeConsultationAPI.programStageDataElements.map(
        (de) => (lstDeConsul[de.dataElement.id] = de.dataElement)
      );
      setLstDeConsultation(lstDeConsul);

      const lstDeInitialVisitAPI = await pull(
        `/api/programStages/tJwK3ZiXydS.json?fields=programStageDataElements[dataElement[id,name,displayName,displayFormName,valueType,optionSetValue,optionSet[options[id,name,code]]]`
      );
      let lstDeInitialVisit = {};

      lstDeInitialVisitAPI.programStageDataElements
        .filter((e) => lstDeInitial.includes(e.dataElement.id))
        .map((de) => (lstDeInitialVisit[de.dataElement.id] = de.dataElement));
      setLstDeInitialVisit(lstDeInitialVisit);

      const lstDeNoteAPI = await pull(
        `/api/programStages/uUnMwTTB3Tq.json?fields=programStageDataElements[dataElement[id,name,displayName,valueType,optionSetValue,optionSet[options[id,name,code]]]`
      );
      let lstDeNote = {};
      lstDeNoteAPI.programStageDataElements.map(
        (de) => (lstDeNote[de.dataElement.id] = de.dataElement)
      );
      setLstDeNotes(lstDeNote);
    })();
  }, []);

  useEffect(() => {
    let teiFiltered = savedAllDatasTei;

    let conditionFlag = [];
    valueCheckbox.psy && conditionFlag.push("1");
    valueCheckbox.treatment && conditionFlag.push("3");
    valueCheckbox.consultant && conditionFlag.push("4");
    const isBelowThreshold = (flag) => {
      let result = true;
      conditionFlag.map((e) => !flag.includes(e) && (result = false));
      return result;
    };

    teiFiltered = savedAllDatasTei.filter((e) => isBelowThreshold(e.flag));
    setPage(0);
    setAllDatasTei(teiFiltered);
  }, [valueCheckbox]);

  useEffect(() => {
    let teiFiltered = savedAllDatasTei;
    let conditionStatus = [];
    valueCheckboxStatus.act && conditionStatus.push("Active");
    valueCheckboxStatus.inAct && conditionStatus.push("InAct");
    const isBelowThreshold = (status) => {
      let result = true;
      conditionStatus.map((e) => !status.includes(e) && (result = false));
      return result;
    };
    teiFiltered = savedAllDatasTei.filter((e) => isBelowThreshold(e.status));
    setPage(0);
    setAllDatasTei(teiFiltered);
  }, [valueCheckboxStatus]);

  useEffect(() => {
    let teiFiltered = savedAllDatasTei;
    let conditionSystematic = [];
    valueCheckboxSystematic.improved && conditionSystematic.push("Improved");
    valueCheckboxSystematic.moderate && conditionSystematic.push("Moderate");
    valueCheckboxSystematic.worsen && conditionSystematic.push("Worsen");
    valueCheckboxSystematic.noNeed &&
      conditionSystematic.push("No need additional treatment");
    valueCheckboxSystematic.normal && conditionSystematic.push("Normal");
    const isBelowThreshold = (systematic) => {
      let result = true;
      conditionSystematic.map(
        (e) => !systematic.includes(e) && (result = false)
      );
      return result;
    };
    teiFiltered = savedAllDatasTei.filter((e) =>
      isBelowThreshold(e.systematicCaseReview)
    );
    setPage(0);
    setAllDatasTei(teiFiltered);
  }, [valueCheckboxSystematic]);

  useEffect(() => {
    let teiFiltered = savedAllDatasTei;

    teiFiltered = savedAllDatasTei.filter((e) => {
      let result = false;
      let type =
        typeSearch === "Patient ID"
          ? "patientID"
          : typeSearch === "Medical Record Number"
          ? "medicalRecordNumber"
          : "name";
      e[type].includes(keySearch) && (result = true);
      return result;
    });
    setPage(0);
    setAllDatasTei(teiFiltered);
  }, [keySearch]);

  let sortTeis = (condition) => {
    let diff = condition !== sortBy;
    let flagRevert = !sortRevert;
    if (!diff) {
      setSortRevert(!sortRevert);
      flagRevert = !flagRevert;
    } else {
      setSortRevert(false);
      flagRevert = true;
    }
    setSortBy(condition);
    if (flagRevert) {
      if (
        condition === "name" ||
        condition === "status" ||
        condition === "sessions" ||
        condition === "weeksSinceInitial"
      ) {
        allDatasTei.sort((a, b) => {
          var x = a[condition];
          var y = b[condition];
          if (x === "") {
            return 1;
          }
          if (y === "") {
            return -1;
          }
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
      } else {
        allDatasTei.sort((a, b) => {
          let x = moment(a[condition]);
          let y = moment(b[condition]);
          if (a[condition] === "") {
            return 1;
          }
          if (b[condition] === "") {
            return -1;
          }
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
      }
    } else {
      if (
        condition === "name" ||
        condition === "status" ||
        condition === "sessions" ||
        condition === "weeksSinceInitial"
      ) {
        allDatasTei.sort((a, b) => {
          var x = a[condition];
          var y = b[condition];
          if (x === "") {
            return 1;
          }
          if (y === "") {
            return -1;
          }
          if (x < y) {
            return 1;
          }
          if (x > y) {
            return -1;
          }
          return 0;
        });
      } else {
        allDatasTei.sort((a, b) => {
          var x = moment(a[condition]);
          var y = moment(b[condition]);
          if (a[condition] === "") {
            return 1;
          }
          if (b[condition] === "") {
            return -1;
          }
          if (x < y) {
            return 1;
          }
          if (x > y) {
            return -1;
          }
          return 0;
        });
      }
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const changeChooseMedicine = ({ value, index, field }) => {
    index
      ? setPrescription({ ...prescription, [`medicine${index}`]: value })
      : setPrescription({ ...prescription, [field]: value });
  };

  const changeInput = ({ value, index, field }) => {
    index
      ? setPrescription({ ...prescription, [`dose${index}`]: value })
      : setPrescription({ ...prescription, [field]: value });
  };

  const changeNotePhysician = ({ value }) => {
    setPrescription({ ...prescription, [`physicianNotes`]: value });
  };

  const changeChoosePsyData = ({ value, field }) => {
    setPsyData({ ...psyData, [field]: value });
  };

  const sortArrByDate = (arr, fieldDate) => {
    return arr.sort((a, b) => {
      var x = moment(a[fieldDate]);
      var y = moment(b[fieldDate]);

      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
  };

  const sortArrByValue = (arr, fieldDate) => {
    return arr.sort((a, b) => {
      var x = parseInt(a[fieldDate]);
      var y = parseInt(b[fieldDate]);

      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
  };

  const typeStage = (stageId) => {
    let type = "";
    switch (stageId) {
      case "tJwK3ZiXydS":
        type = "Initial Visit";
        break;
      case "TgIXYmJFzZX":
        type = "Consultation Activities";
        break;
      case "HN0H6ha4zRV":
        type = "Physician review";
        break;
      case "FYifVckEipD":
        type = "Psychiatrist review";
        break;
      case "FKyVRgtf0VC":
        type = "Treatment";
        break;
      case "uUnMwTTB3Tq":
        type = "Important reminder for collaborator";
        break;
      default:
        break;
    }
    return type;
  };

  const handleClickPatient = (teiId) => {
    const tei = allTeis.filter((e) => e.trackedEntityInstance === teiId);
    const lstEvents = tei[0].enrollments[0].events
      .filter(
        (e) =>
          e.status === "ACTIVE" ||
          e.status === "COMPLETED" ||
          e.status === "VISITED"
      )
      .filter(
        (e) =>
          e.programStage !== "yaGEYSRUJSX" &&
          e.programStage !== "dnHiOwUw5gY" &&
          e.programStage !== "zvdISdNh3X8" &&
          e.programStage !== "Xt9qOeugTKq" &&
          e.programStage !== "fSEF1zA5cVx" &&
          e.programStage !== "ILDYH6BCUIe"
      );

    const data = {
      name: tei[0]?.attributes.filter((e) => e.attribute === "rzPnALTfP76")[0]
        ?.value,
      events: sortArrByDate(lstEvents, "created"),
      teiId: tei[0]?.trackedEntityInstance,
    };
    setTeiData(data);
    setShowModal(true);

    let lstEventsHaveScore = [];
    data.events.map((event) => {
      let PHQ9Score = event.dataValues.filter(
        (dv) => dv?.dataElement === "dUzDDG9we7p"
      )[0]?.value;
      if (PHQ9Score) {
        data.events.filter((ev) => ev.event === event.event)[0]["PHQ9Score"] =
          PHQ9Score;
        lstEventsHaveScore.push({
          date: event.created,
          value: PHQ9Score,
        });
      }
    });
    setDataChart(lstEventsHaveScore);
  };

  const getDeValues = ({ stageId, event }) => {
    let lstDv = event.dataValues.filter((e) => e.dataElement !== "YW426fwkoll");
    let lstDEValue = [];
    if (lstDv.length > 0) {
      const value = (de) => {
        let foundDv = lstDv.filter((dv) => dv.dataElement === de);
        let foundDvValue = "";
        if (foundDv.length > 0) {
          foundDvValue = foundDv[0].value;
        }
        return foundDvValue;
      };

      // CONSULTATION
      if (stageId === "TgIXYmJFzZX") {
        let objOutput = {};
        Object.keys(lstDeConsultationBySection).map((sectionName) => {
          objOutput[sectionName] = [];

          lstDeConsultationBySection[sectionName].map((deId) => {
            let filterDE = lstDv.filter((e) => e.dataElement === deId)[0];
            if (filterDE) {
              let de = lstDeConsultation[deId];
              let valueType = de.valueType;
              let value = filterDE.value;
              let hasOptionSet = filterDE.optionSetValue;
              let v = "";
              if (valueType === "BOOLEAN") {
                v = value === "true" ? "Yes" : "No";
              } else if (valueType === "TRUE_ONLY") {
                v = value ? "Yes" : "No";
              } else {
                v = value;
              }
              if (hasOptionSet) {
                v = de.optionSet.options.filter(
                  (option) => option.code === v
                )[0].name;
              }
              let name = de.displayName ? de.displayName : de.name;
              if (
                objOutput[sectionName].filter((e) => e.id[deId]).length === 0
              ) {
                objOutput[sectionName].push({ value: v, name, id: deId });
              }
            }
          });
        });
        lstDEValue = objOutput;
      }

      // Notes
      if (stageId === "uUnMwTTB3Tq") {
        let v = value("sTwWHbR3HDA");
        if (v) {
          lstDEValue.push({
            value: v,
            displayName: "Important note for consultant",
          });
        }
      }

      // PHYSICIAN
      if (stageId === "HN0H6ha4zRV") {
        let lstIdDeMedicine = [
          { medicine: "sZHe1LVGeia", dose: "SBaGM1yStjL" },
          { medicine: "E7v4iBvtPS6", dose: "kh99oRC5Mfy" },
          { medicine: "AV2l0x57IRi", dose: "YKiHMsKeTni" },
          { medicine: "ijZcDpug46e", dose: "z7dtYocGjqq" },
          { medicine: "HrtW5RsDLXp", dose: "s1M9fZMpJ2N" },
          { medicine: "LO4FOxKPznR", dose: "eYaVukpqv4b" },
        ];
        lstIdDeMedicine.map(({ medicine, dose }) => {
          if (value(medicine) || value(dose)) {
            lstDEValue.push({
              medicine: value(medicine),
              dose: value(dose),
            });
          }
        });

        lstDesPhysician.map((de) => {
          let dataElement = lstDePhysician[de.id];
          let valueType = dataElement.valueType;
          let hasOptionSet = dataElement.optionSetValue;

          let v = value(de.id);
          if (v) {
            if (valueType === "BOOLEAN" || valueType === "TRUE_ONLY") {
              v = v ? "Yes" : "No";
            }
            if (hasOptionSet) {
              v = dataElement.optionSet.options.filter(
                (option) => option.code === v
              )[0]?.name;
            }

            lstDEValue.push({
              value: v,
              displayName: de.name,
            });
          }
        });
      }

      // PSY
      if (stageId === "FYifVckEipD") {
        lstDesPsycho.map((de) => {
          let dataElement = lstDePsy[de.id];
          let valueType = dataElement.valueType;
          let hasOptionSet = dataElement.optionSetValue;

          let v = value(de.id);
          if (v) {
            if (valueType === "BOOLEAN" || valueType === "TRUE_ONLY") {
              v = v ? "Yes" : "No";
            }
            if (hasOptionSet) {
              v = dataElement.optionSet.options.filter(
                (option) => option.code === v
              )[0].name;
            }

            lstDEValue.push({
              value: v,
              displayName: de.name,
            });
          }
        });
      }

      // INITIAL VISIT
      if (stageId === "tJwK3ZiXydS") {
        lstDeInitial.map((de) => {
          let dataElement = lstDeInitialVisit[de];
          let valueType = dataElement.valueType;
          let hasOptionSet = dataElement.optionSetValue;
          let v = value(de);
          if (v) {
            if (valueType === "BOOLEAN" || valueType === "TRUE_ONLY") {
              v = v ? "Yes" : "No";
            }
            if (hasOptionSet) {
              v = dataElement.optionSet.options.filter(
                (option) => option.code === v
              )[0].name;
            }
            lstDEValue.push({
              value: v,
              displayName: dataElement.displayFormName,
            });
          }
        });
      }
    }

    return { lstDEValue: lstDEValue, eventDate: event.created };
  };

  const handleDetail = ({ event, stageId }) => {
    setShowAllType(stageId);
    if (stageId === "HN0H6ha4zRV") {
      // PHYSICIAN
      setDetailOfEvent(getDeValues({ stageId, event: event }));
    } else if (stageId === "FYifVckEipD") {
      // PSYCHOTHERAPY
      setDetailOfEvent(getDeValues({ stageId, event: event }));
    } else if (stageId === "TgIXYmJFzZX") {
      // CONSULTATION ACTIVITIES"
      setObjSectionConsultation(getDeValues({ stageId, event: event }));
    } else if (stageId === "tJwK3ZiXydS") {
      // INITIAL VISIT
      setDetailOfEvent(getDeValues({ stageId, event: event }));
    } else if (stageId === "uUnMwTTB3Tq") {
      // NOTES
      setDetailOfEvent(getDeValues({ stageId, event: event }));
    }

    setStep(2);
  };

  const showDetailAllEventsByStageOfTei = ({ teiId, stageId, key }) => {
    setShowAllType(stageId);
    const teiInfo = allEventsOfTei[teiId].filter(
      (e) => e.programStage === stageId
    );
    let isHaveEvents = teiInfo.filter((e) => {
      if (
        e.dataValues.length === 1 &&
        e.dataValues[0].dataElement === "YW426fwkoll"
      ) {
        return false;
      } else {
        return true;
      }
    });
    let lstDataValues = [];
    let dataSorted = [];
    if (isHaveEvents.length > 0) {
      lstDataValues = isHaveEvents.map((e) =>
        getDeValues({
          stageId: stageId,
          event: e,
        })
      );

      dataSorted =
        lstDataValues.length > 0
          ? sortArrByDate(lstDataValues, "eventDate")
          : [];
    } else {
      dataSorted = [
        {
          lstDEValue: [],
          eventDate: "",
        },
      ];
    }
    if (dataSorted.length > 0) {
      if (stageId === "HN0H6ha4zRV") {
        setLstAllEventsOfPhysician(dataSorted.slice(-1));
      }
      if (stageId === "FYifVckEipD") {
        setLstAllEventsOfPsycho(dataSorted.slice(-1));
      }
      if (stageId === "TgIXYmJFzZX") {
        if (key === "firstConsultation") {
          setIsFirstConsultation(true);
          setIsLastConsultation(false);
          setLstAllEventsOfConsultation(dataSorted.slice(0, 1));
        } else {
          setIsFirstConsultation(false);
          setIsLastConsultation(true);
          setIsFirstConsultation(false);

          setLstAllEventsOfConsultation(dataSorted.slice(-1));
        }
      }
      if (stageId === "uUnMwTTB3Tq") {
        setLstAllEventsOfNotes(
          dataSorted.filter((e) => e.lstDEValue.length > 0)
        );
      }
    }
    setShowModal(true);
    setStep(3);
  };

  const handleAddEvent = ({ teiObj, typeAddEvent }) => {
    setTeiChosen(teiObj);
    setTypeAddEvent(typeAddEvent);
    setShowModal(true);
    setStep(4);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const countWeek = (date1, date2) => {
    let firstDate = new Date(
      date1.slice(0, 4),
      date1.slice(5, 7),
      date1.slice(8, 10)
    );
    let secondDate = new Date(
      date2.slice(0, 4),
      date2.slice(5, 7),
      date2.slice(8, 10)
    );
    return Math.floor((secondDate - firstDate) / (24 * 60 * 60 * 1000) / 7);
  };

  const onSubmit = () => {
    let dataValues = [];
    let programStage = "";
    if (typeAddEvent === "Physician review") {
      programStage = "HN0H6ha4zRV";
      dataValues = Object.keys(prescription)
        .map((p) => {
          if (prescription[p] !== "" && prescription[p] !== "valueNull") {
            return {
              dataElement: lstDeMedicine
                .concat(lstDesPhysician)
                .filter((d) => d.title === p)[0].id,
              value: prescription[p],
              providedElsewhere: false,
            };
          }
        })
        .filter((dv) => dv);
    }

    if (typeAddEvent === "Psychiatrist review") {
      programStage = "FYifVckEipD";
      dataValues = Object.keys(psyData)
        .map((p) => {
          if (psyData[p] !== "" && psyData[p] !== "valueNull") {
            return {
              dataElement: lstDesPsycho.filter((d) => d.title === p)[0].id,
              value: psyData[p],
              providedElsewhere: false,
            };
          }
        })
        .filter((dv) => dv);
    }

    if (typeAddEvent === "Notification for consultant") {
      programStage = "uUnMwTTB3Tq";
      if (importantNoteForConsultant !== "") {
        dataValues = [
          {
            dataElement: "sTwWHbR3HDA",
            value: importantNoteForConsultant,
            providedElsewhere: false,
          },
        ];
      }
    }

    let flagText = "";

    dataValues.map((dv) => (flagText += dv.value.trim()));
    if (flagText !== "") {
      let tei = allTeis.filter(
        (e) => e.trackedEntityInstance === teiChosen.tei
      )[0];

      let lstDeId = dataValues.map((e) => e.dataElement);

      if (lstDeId.includes("OrV86rECvCe")) {
        if (
          tei.attributes.map((attr) => attr.attribute.includes("CqQb6eSQ9Xu"))
        ) {
          tei.attributes = tei.attributes.concat({
            attribute: "CqQb6eSQ9Xu",
            displayName: "Patient's status FLAG Treatment",
            value: dataValues.filter((e) => e.dataElement === "OrV86rECvCe")[0]
              .value,
            valueType: "TEXT",
          });
        } else {
          tei.attributes.filter((e) => e.attribute === "CqQb6eSQ9Xu")[0].value =
            dataValues.filter((e) => e.dataElement === "OrV86rECvCe")[0].value;
        }
      }

      if (lstDeId.includes("p8xMqcMl81N")) {
        if (
          tei.attributes.map((attr) => attr.attribute.includes("l38T9AP4dxo"))
        ) {
          tei.attributes = tei.attributes.concat({
            attribute: "l38T9AP4dxo",
            displayName: "Patient's status FLAG Treatment",
            value: dataValues.filter((e) => e.dataElement === "p8xMqcMl81N")[0]
              .value,
            valueType: "TEXT",
          });
        } else {
          tei.attributes.filter((e) => e.attribute === "l38T9AP4dxo")[0].value =
            dataValues.filter((e) => e.dataElement === "p8xMqcMl81N")[0].value;
        }
      }

      let payloadPostAttribute = {
        trackedEntityInstances: [],
      };
      payloadPostAttribute.trackedEntityInstances.push(tei);
      let payloadPost = {
        dueDate: moment().format("YYYY-MM-DD"),
        eventDate: moment().format("YYYY-MM-DD"),
        program: "kTENGSq9iV7",
        programStage: programStage,
        orgUnit: teiChosen.orgUnit,
        trackedEntityInstance: teiChosen.tei,
        enrollment: teiChosen.enrollment,
        status: "COMPLETED",
        followup: false,
        deleted: false,
        dataValues: dataValues,
        attributeCategoryOptions: "xYerKDKCefk",
        attributeOptionCombo: "HllvX50cXC0",
      };
      push("api/events", payloadPost, "POST").then((e) => {
        setOpenSnackbar(true);
        if (e.httpStatusCode === 200) {
          push("api/trackedEntityInstances", payloadPostAttribute, "POST").then(
            (apiOutput) => {
              if (apiOutput.httpStatusCode === 200) {
                setResponseSubmit("OK");
              }
            }
          );
          closeModal();
          run();
        } else {
          setResponseSubmit("Error");
        }
      });
    } else {
      closeModal();
    }
  };
  const isDasboard = VITE_REPORT_MODE ? true : false;
  let orgUnitSelected = isDasboard ? userGroupsOrgUnit : orgUnit.id;

  const closeModal = () => {
    setShowModal(false);
    setAddNoteFromAllNotes(false);
    setIsLastConsultation(false);
    setIsFirstConsultation(false);

    setPrescription({
      medicine1: "valueNull",
      dose1: "",
      medicine2: "valueNull",
      dose2: "",
      medicine3: "valueNull",
      dose3: "",
      medicine4: "valueNull",
      dose4: "",
      medicine5: "valueNull",
      dose5: "",
      medicine6: "valueNull",
      dose6: "",
      examinedThePatient: "",
      PHQ9Score: "",
      physicianNotes: "",
      physicianDiagnosis: "valueNull",
      suicideRiskAssessedByPhysician: "",
      flagForReview: "valueNull",
    });
    setPsyData({
      examinedThePatient: "",
      psyDiagnosis: "",
      suicideRiskAssessedByPsychiatrist: "",
      psyNotes: "",
      flagForReview: "valueNull",
    });

    setLstAllEventsOfPhysician([]);
    setLstAllEventsOfPsycho([]);
    setLstAllEventsOfNotes([]);
    setStep(1);
    setAllowBack(false);
  };

  const run = async () => {
    setLoading(true);
    setOrgUnitTitle(orgUnit.name);
    (async () => {
      const callApi = await pull(
        `api/trackedEntityInstances.json?fields=*&program=kTENGSq9iV7&ou=${orgUnitSelected}&ouMode=DESCENDANTS&totalPages=true`
      );
      const pager = callApi.pager;
      const pageCount = pager.pageCount;
      const pageSize = pager.pageSize;
      let allTeisInOrgApi = callApi.trackedEntityInstances;
      if (pageCount > 1) {
        for (let index = 2; index <= pageCount; index++) {
          const callApiContinue = await pull(
            `api/trackedEntityInstances.json?fields=*&program=kTENGSq9iV7&ou=${orgUnitSelected}&ouMode=DESCENDANTS&totalPages=true&&page=${pageCount}&pageSize=${pageSize}`
          );
          allTeisInOrgApi = allTeisInOrgApi.concat(
            callApiContinue.trackedEntityInstances
          );
        }
      }

      let allObjTei = [];
      let allEventsTei = {};
      allTeisInOrgApi.map((e) => {
        {
          allEventsTei[e.trackedEntityInstance] =
            e.enrollments[0].events.length > 0 ? e.enrollments[0].events : [];
        }
      });
      setAllTeis(allTeisInOrgApi);
      setAllEventsOfTei(allEventsTei);
      allTeisInOrgApi.map((teiObj) => {
        let attrTei = {};
        let dataTei = teiObj.enrollments[0];
        let lstEvents = dataTei.events
          .filter(
            (e) =>
              e.status === "ACTIVE" ||
              e.status === "COMPLETED" ||
              e.status === "VISITED"
          )
          .filter(
            (e) =>
              e.programStage !== "yaGEYSRUJSX" &&
              e.programStage !== "dnHiOwUw5gY" &&
              e.programStage !== "zvdISdNh3X8" &&
              e.programStage !== "Xt9qOeugTKq" &&
              e.programStage !== "fSEF1zA5cVx" &&
              e.programStage !== "ILDYH6BCUIe"
          );

        let sessions = lstEvents.length;

        teiObj.attributes.map(
          (a) =>
            (attrTei[a.attribute] = {
              displayName: a.displayName,
              value: a.value,
            })
        );

        let lstPHQ9Arr = [];
        sessions > 0 &&
          lstEvents.map((e) => {
            let score = e?.dataValues.filter(
              (dv) => dv?.dataElement === "dUzDDG9we7p"
            )[0]?.value;
            if (score) {
              lstPHQ9Arr = lstPHQ9Arr.concat({
                value: score ? score : "",
                eventDate: e?.created,
              });
            }
          });

        const sortedLstPHQ9 = sortArrByDate(
          lstPHQ9Arr.map(({ value, eventDate }) => ({
            value: value,
            eventDate: eventDate,
          })),
          "eventDate"
        );

        const PHQ9First =
          sortedLstPHQ9.length > 0
            ? sortArrByDate(
                sortedLstPHQ9.map(({ value, eventDate }) => ({
                  value: value,
                  eventDate: eventDate,
                })),
                "eventDate"
              )[0].value
            : "";

        const PHQ9Last =
          sortedLstPHQ9.length > 1
            ? sortedLstPHQ9[sortedLstPHQ9.length - 1].value
            : "";

        const PHQ9Previous =
          sortedLstPHQ9.length > 1
            ? sortedLstPHQ9[sortedLstPHQ9.length - 2].value
            : "";

        let PHQ9Highest = "";
        if (sortedLstPHQ9.length > 2) {
          PHQ9Highest = sortArrByValue(
            sortedLstPHQ9.slice(0, sortedLstPHQ9.length - 1),
            "value"
          )[sortedLstPHQ9.length - 2].value;
        }

        let systematicCaseReview = "";
        if (sortedLstPHQ9.length > 2) {
          if (parseInt(PHQ9Last) < 5) {
            systematicCaseReview = "Normal";
          } else if (parseInt(PHQ9Last) < 10) {
            systematicCaseReview = "No need additional treatment";
          } else if (parseInt(PHQ9Previous) < parseInt(PHQ9Last)) {
            systematicCaseReview = "Worsen";
          } else if (
            parseInt(PHQ9Last) < parseInt(PHQ9Highest) &&
            parseInt(PHQ9Highest) / parseInt(PHQ9Last) < 2
          ) {
            systematicCaseReview = "Moderate";
          } else if (
            parseInt(PHQ9Last) < parseInt(PHQ9Highest) &&
            parseInt(PHQ9Highest) / parseInt(PHQ9Last) >= 2
          ) {
            systematicCaseReview = "Improved";
          }
        }

        const lstConsultation = lstEvents.filter(
          (e) => e?.programStage === "TgIXYmJFzZX"
        );
        let firstConsultation =
          lstConsultation.length > 1
            ? sortArrByDate(
                lstConsultation.map((e) => ({
                  date: e.created,
                })),
                "date"
              )[0].date
            : lstConsultation.length === 1 && lstConsultation[0].created;
        const lstPsycho = lstEvents.filter(
          (e) => e?.programStage === "FYifVckEipD"
        );

        const lstTreatment = lstEvents.filter(
          (e) => e?.programStage === "FKyVRgtf0VC"
        );

        const lstPhysician = lstEvents.filter(
          (e) => e?.programStage === "HN0H6ha4zRV"
        );

        let lastConsultation =
          lstConsultation.length > 1 &&
          sortArrByDate(
            lstConsultation.map((e) => ({
              date: e.created,
            })),
            "date"
          )[lstConsultation.length - 1].date;

        let lastPsycho =
          lstPsycho.length > 0 &&
          sortArrByDate(
            lstPsycho.map((e) => ({
              date: e.created,
            })),
            "date"
          )[lstPsycho.length - 1].date;

        let lastTreatment =
          lstTreatment.length > 0 &&
          sortArrByDate(
            lstTreatment.map((e) => ({
              date: e.created,
            })),
            "date"
          )[lstTreatment.length - 1].date;

        let lastPhysician =
          lstPhysician.length > 0 &&
          sortArrByDate(
            lstPhysician.map((e) => ({
              date: e.created,
            })),
            "date"
          )[lstPhysician.length - 1].date;
        let flagAttr = [];
        attrTei?.l38T9AP4dxo && flagAttr.push(attrTei?.l38T9AP4dxo.value);
        attrTei?.NeMtLewdNKE && flagAttr.push(attrTei?.NeMtLewdNKE.value);
        attrTei?.CqQb6eSQ9Xu && flagAttr.push(attrTei?.CqQb6eSQ9Xu.value);
        // flagAttr === "0" && (flagAttr = "");
        allObjTei.push({
          tei: teiObj.trackedEntityInstance,
          flag: flagAttr.sort(),
          patientID: attrTei?.MmrT3ugzXXM ? attrTei?.MmrT3ugzXXM.value : "",
          medicalRecordNumber: attrTei?.KQaCYNsDaFm
            ? attrTei?.KQaCYNsDaFm.value
            : "",
          name: attrTei?.rzPnALTfP76 ? attrTei?.rzPnALTfP76.value : "",
          status: attrTei?.J7DphcSPYoi ? attrTei?.J7DphcSPYoi.value : "",
          PHQ9First,
          PHQ9Last,
          systematicCaseReview,
          firstConsultation: firstConsultation ? firstConsultation : "",
          lastConsultation: lastConsultation ? lastConsultation : "",
          lastPsycho: lastPsycho ? lastPsycho : "",
          lastTreatment: lastTreatment ? lastTreatment : "",
          lastPhysician: lastPhysician ? lastPhysician : "",
          sessions,
          orgUnit: dataTei.orgUnit,
          weeksSinceInitial: countWeek(
            dataTei.enrollmentDate.slice(0, 10),
            new Date().toISOString()
          ),
          enrollment: dataTei.enrollment,
        });
      });
      setAllDatasTei(allObjTei);
      setSavedAllDatasTei(allObjTei);

      setIsShowTable(true);
      setLoading(false);
    })();
  };

  const styles = {
    styleCell: {
      color: "#1f497d",
      border: "1px solid white",
    },
    headerHasFilter: {
      fontWeight: 500,
      alignItems: "center",
      justifyContent: "center",
    },
    boxHeaderHasFilter: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  const showDatasTable = () => {
    return allDatasTei
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((teiObj, i) => {
        const teiId = teiObj.tei;
        const teiName = teiObj.name;
        const rowData = {
          flag: teiObj.flag,
          patientID: teiObj.patientID,
          medicalRecordNumber: teiObj.medicalRecordNumber,
          name: teiObj.name,
          status: teiObj.status,
          PHQ9First: teiObj.PHQ9First,
          PHQ9Last: teiObj.PHQ9Last,
          systematicCaseReview: teiObj.systematicCaseReview,
          firstConsultation: teiObj.firstConsultation.slice(0, 10),
          lastConsultation: teiObj.lastConsultation.slice(0, 10),
          psychoReview: teiObj.lastPsycho.slice(0, 10),
          lastTreatment: teiObj.lastTreatment.slice(0, 10),
          lastPhysician: teiObj.lastPhysician.slice(0, 10),
          sessions: teiObj.sessions,
          weeksSinceInitial: teiObj.weeksSinceInitial,
          notes: teiObj.tei,
        };
        return (
          <TableRow
            sx={{
              "&:hover": {
                backgroundColor: "#f7f7f7",
              },
              background: i % 2 ? "#f0f0f0" : "white",
            }}
            style={{
              height: 90,
              maxHeight: 90,
            }}
            key={teiName + i}
            align="center"
            onClick={() => handleClickPatient(teiId)}
          >
            {Object.keys(rowData).map((key) => {
              let stageId = "";
              const value = rowData[key];
              let isShowBtn = false;
              let type = "";
              switch (key.replace("last", "")) {
                case "firstConsultation":
                  type = "First Consultation";
                  break;
                case "Consultation":
                  type = "Consultation";
                  break;
                case "Physician":
                  type = "Physician review";
                  break;
                case "psychoReview":
                  type = "Psychiatrist review";
                  break;
                case "Treatment":
                  type = "Treatment";
                  break;
                case "notes":
                  type = "Notes";
                  break;
                default:
                  break;
              }

              if (
                (rolePhysician && type === "Physician review") ||
                (rolePsychiatrist && type === "Psychiatrist review") ||
                (roleTreatment && type === "Treatment")
              ) {
                isShowBtn = true;
              }
              if (type === "First Consultation") {
                stageId = "TgIXYmJFzZX";
              }
              if (type === "Consultation") {
                stageId = "TgIXYmJFzZX";
              }
              if (type === "Physician review") {
                stageId = "HN0H6ha4zRV";
              }
              if (type === "Psychiatrist review") {
                stageId = "FYifVckEipD";
              }
              if (type === "Notes") {
                stageId = "uUnMwTTB3Tq";
              }

              return type === "Consultation" ||
                type === "First Consultation" ||
                type === "Physician review" ||
                type === "Psychiatrist review" ? (
                <TableCell
                  style={{
                    height: 22,
                    textAlign:
                      (key === "lastConsultation" ||
                        key === "First Consultation") &&
                      "center",
                    minWidth: isShowBtn ? 110 : 90,
                  }}
                >
                  {isShowBtn && (
                    <Button
                      style={{
                        padding: 0,
                        heigth: 22,
                        width: 22,
                        minHeight: 0,
                        minWidth: 0,
                      }}
                      onClick={() => {
                        handleAddEvent({
                          teiObj: teiObj,
                          typeAddEvent: type,
                        });
                      }}
                    >
                      <AddCircle
                        style={{
                          padding: 0,
                          color: "#464b51",
                        }}
                      />
                    </Button>
                  )}
                  {value !== "" && (
                    <Button
                      style={{
                        color: "black",
                        fontWeight: 400,
                        fontSize: "14px",
                      }}
                      onClick={() => {
                        showDetailAllEventsByStageOfTei({
                          teiId: teiId,
                          stageId: stageId,
                          key,
                        });
                      }}
                    >
                      {value}
                    </Button>
                  )}
                </TableCell>
              ) : key === "flag" ? (
                <TableCell
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 90,
                    maxHeight: 90,
                    textAlign: "center",
                    fontWeight: 400,
                    fontSize: "14px",
                    minWidth: key === "lastTreatment" && 90,
                  }}
                >
                  {value.length !== 0 &&
                    value.map((flg) => {
                      return (
                        flg !== "" &&
                        flg !== "0" && (
                          <Flag
                            style={{
                              backgroundColor: "#f4f2ef",
                              boxShadow: "1px 2px 6px #d3d0cd",
                              marginRight: "5px",
                              borderRadius: 6,
                              padding: 6,
                              color:
                                flg === "1"
                                  ? "red"
                                  : flg === "3"
                                  ? "#f2d324"
                                  : flg === "4" && "green",
                            }}
                          />
                        )
                      );
                    })}
                </TableCell>
              ) : key === "notes" ? (
                <TableCell
                  style={{
                    textAlign: "center",
                  }}
                >
                  <Button
                    style={{
                      padding: 0,
                      heigth: 22,
                      width: 22,
                      minHeight: 0,
                      minWidth: 0,
                    }}
                    onClick={() => {
                      showDetailAllEventsByStageOfTei({
                        teiId: teiId,
                        stageId: stageId,
                      });
                    }}
                  >
                    <NoteAlt
                      style={{
                        backgroundColor: "#f4f2ef",
                        boxShadow: "1px 2px 6px #d3d0cd",
                        marginRight: "5px",
                        borderRadius: 6,
                        padding: 6,
                        color: "#f9aa20",
                      }}
                    />
                  </Button>
                </TableCell>
              ) : (
                <TableCell
                  style={{
                    textAlign: "center",
                    color: "black",
                    fontWeight: 400,
                    fontSize: "14px",
                    minWidth: key === "lastTreatment" && 90,
                  }}
                >
                  {value}
                </TableCell>
              );
            })}
          </TableRow>
        );
      });
  };

  const FilterMenu = () => {
    const [tempValueCheckbox, setTempValueCheckbox] = useState(valueCheckbox);
    const [tempvalueCheckboxStatus, setTempValueCheckboxStatus] =
      useState(valueCheckboxStatus);
    const [tempvalueCheckboxSystematic, setTempvalueCheckboxSystematic] =
      useState(valueCheckboxSystematic);

    return (
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseFilter}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            width: "210px",
            paddingInline: "10px",
            marginBlock: "10px",
          }}
        >
          {typeFilter === "Flags" && (
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempValueCheckbox.psy}
                    onChange={(event) => {
                      setTempValueCheckbox({
                        ...tempValueCheckbox,
                        ["psy"]: event.target.checked,
                      });
                    }}
                  />
                }
                label="Psychiatrist"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempValueCheckbox.treatment}
                    onChange={(event) => {
                      setTempValueCheckbox({
                        ...tempValueCheckbox,
                        ["treatment"]: event.target.checked,
                      });
                    }}
                  />
                }
                label="Treatment"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempValueCheckbox.consultant}
                    onChange={(event) => {
                      setTempValueCheckbox({
                        ...tempValueCheckbox,
                        ["consultant"]: event.target.checked,
                      });
                    }}
                  />
                }
                label="Consultant"
              />
              <Button
                style={{
                  outline: "none",
                  height: 32,
                  paddingInline: 24,
                  color: "#0F172A",
                  fontWeight: 400,
                  fontSize: 14,
                  backgroundColor: "#FFB600",
                }}
                onClick={() => {
                  handleCloseFilter();
                  setValueCheckbox(tempValueCheckbox);
                }}
              >
                Confirm
              </Button>
            </FormGroup>
          )}

          {typeFilter === "Status" && (
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempvalueCheckboxStatus.act}
                    onChange={(event) => {
                      setTempValueCheckboxStatus({
                        ...tempvalueCheckboxStatus,
                        ["act"]: event.target.checked,
                        ["inAct"]: event.target.checked && false,
                      });
                    }}
                  />
                }
                label="Active"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempvalueCheckboxStatus.inAct}
                    onChange={(event) => {
                      setTempValueCheckboxStatus({
                        ...tempvalueCheckboxStatus,
                        ["act"]: event.target.checked && false,
                        ["inAct"]: event.target.checked,
                      });
                    }}
                  />
                }
                label="InActive"
              />

              <Button
                style={{
                  outline: "none",
                  height: 32,
                  paddingInline: 24,
                  color: "#0F172A",
                  fontWeight: 400,
                  fontSize: 14,
                  backgroundColor: "#FFB600",
                }}
                onClick={() => {
                  handleCloseFilter();
                  setValueCheckboxStatus(tempvalueCheckboxStatus);
                }}
              >
                Confirm
              </Button>
            </FormGroup>
          )}

          {typeFilter === "systematicCaseReview" && (
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempvalueCheckboxSystematic.improved}
                    onChange={(event) => {
                      setTempvalueCheckboxSystematic({
                        ...tempvalueCheckboxSystematic,
                        ["improved"]: event.target.checked,
                        ["moderate"]: event.target.checked && false,
                        ["worsen"]: event.target.checked && false,
                        ["noNeed"]: event.target.checked && false,
                        ["normal"]: event.target.checked && false,
                      });
                    }}
                  />
                }
                label="Improved"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempvalueCheckboxSystematic.moderate}
                    onChange={(event) => {
                      setTempvalueCheckboxSystematic({
                        ...tempvalueCheckboxSystematic,
                        ["improved"]: event.target.checked && false,
                        ["moderate"]: event.target.checked,
                        ["worsen"]: event.target.checked && false,
                        ["noNeed"]: event.target.checked && false,
                        ["normal"]: event.target.checked && false,
                      });
                    }}
                  />
                }
                label="Moderate"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempvalueCheckboxSystematic.worsen}
                    onChange={(event) => {
                      setTempvalueCheckboxSystematic({
                        ...tempvalueCheckboxSystematic,
                        ["improved"]: event.target.checked && false,
                        ["moderate"]: event.target.checked && false,
                        ["worsen"]: event.target.checked,
                        ["noNeed"]: event.target.checked && false,
                        ["normal"]: event.target.checked && false,
                      });
                    }}
                  />
                }
                label="Worsen"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempvalueCheckboxSystematic.noNeed}
                    onChange={(event) => {
                      setTempvalueCheckboxSystematic({
                        ...tempvalueCheckboxSystematic,
                        ["improved"]: event.target.checked && false,
                        ["moderate"]: event.target.checked && false,
                        ["worsen"]: event.target.checked && false,
                        ["noNeed"]: event.target.checked,
                        ["normal"]: event.target.checked && false,
                      });
                    }}
                  />
                }
                label="No need additional treatment"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={tempvalueCheckboxSystematic.normal}
                    onChange={(event) => {
                      setTempvalueCheckboxSystematic({
                        ...tempvalueCheckboxSystematic,
                        ["improved"]: event.target.checked && false,
                        ["moderate"]: event.target.checked && false,
                        ["worsen"]: event.target.checked && false,
                        ["noNeed"]: event.target.checked && false,
                        ["normal"]: event.target.checked,
                      });
                    }}
                  />
                }
                label="Normal"
              />

              <Button
                style={{
                  outline: "none",
                  height: 32,
                  paddingInline: 24,
                  color: "#0F172A",
                  fontWeight: 400,
                  fontSize: 14,
                  backgroundColor: "#FFB600",
                }}
                onClick={() => {
                  handleCloseFilter();
                  setValueCheckboxSystematic(tempvalueCheckboxSystematic);
                }}
              >
                Confirm
              </Button>
            </FormGroup>
          )}
        </Box>
      </Popover>
    );
  };

  const SearchMenu = () => {
    const [valueSearch, setValueSearch] = useState("");
    const handleChange = (event) => {
      setValueSearch(event.target.value);
    };
    const searchTeis = () => {
      setKeySearch(valueSearch);
    };
    return (
      <Popover
        id={idSearch}
        open={openSearch}
        anchorEl={anchorElSearch}
        onClose={handleCloseSearch}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "300px",
            marginBlock: "10px",
          }}
        >
          <TextField
            id="outlined-name"
            label={typeSearch}
            value={valueSearch}
            onChange={handleChange}
            style={{
              width: "280px",
            }}
          />
          <Button
            style={{
              outline: "none",
              height: 32,
              paddingInline: 24,
              color: "#0F172A",
              fontWeight: 400,
              fontSize: 14,
              backgroundColor: "#FFB600",
              marginTop: "10px",
            }}
            onClick={() => {
              handleCloseSearch();
              searchTeis();
            }}
          >
            Search
          </Button>
        </Box>
      </Popover>
    );
  };

  const headerLabel = [
    "First",
    "Last",
    "Initial Consultation",
    "Last Consultation",
    "Psychiatrist review",
    "Last Treatment",
    "Physician review",
    "#Sessions",
    "Weeks since Initial",
  ];

  return loading ? (
    <Loader>Loading</Loader>
  ) : (
    <div className="ncle-weekly-container">
      {!isDasboard && (
        <Box style={{ height: "106px" }}>
          <div className="control-bar">
            <OrgUnitSelector />
            <div className="button-container">
              <Button
                variant="contained"
                onClick={run}
                disabled={!orgUnit.name}
              >
                {t("run")}
              </Button>
            </div>
          </div>
        </Box>
      )}
      {isShowTable && (
        <TableContainer component={Paper}>
          <Box
            style={{
              height: "120px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              style={{
                fontSize: 25,
                color: "#2A4879",
                fontWeight: 500,
              }}
            >
              ACTIVE PATIENTS
            </Typography>
            <Box>
              <Typography
                style={{
                  fontSize: 17,
                  fontWeight: 400,
                }}
              >
                Org Unit :
                {isDasboard ? userGroupsOrgUnitDisplayname : orgUnitTitle}
              </Typography>
              <Typography
                style={{
                  fontSize: 17,
                  fontWeight: 400,
                }}
              >
                Report generated date:{" "}
                {moment(new Date()).format("MMM DD, YYYY")}
              </Typography>
            </Box>
          </Box>

          <Box
            style={{
              height: isDasboard
                ? windowDimensions.height - 160
                : windowDimensions.height - 280,
            }}
          >
            <FilterMenu />
            <SearchMenu />
            <Table style={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow
                  style={{
                    backgroundColor: "#90ce4a",
                  }}
                >
                  <TableCell
                    align="center"
                    style={styles.styleCell}
                    rowSpan={2}
                  >
                    <Box style={styles.boxHeaderHasFilter}>
                      <Typography
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Flags
                      </Typography>
                      <FilterList
                        style={{
                          borderRadius: 5,
                          height: "18px",
                          width: "18px",
                          padding: "2px",
                          marginLeft: "5px",
                        }}
                        onClick={(e) => handleClickFilter(e, "Flags")}
                        sx={{
                          backgroundColor: "#fff",
                          "&:hover": {
                            backgroundColor: "#ededed",
                            cursor: "pointer",
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={styles.styleCell}
                    rowSpan={2}
                  >
                    <Box style={styles.boxHeaderHasFilter}>
                      <Typography
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Patient ID
                      </Typography>
                      <Search
                        style={{
                          borderRadius: 5,
                          height: "18px",
                          width: "18px",
                          padding: "2px",
                          marginLeft: "5px",
                        }}
                        onClick={(event) =>
                          handleClickSearch(event, "Patient ID")
                        }
                        sx={{
                          backgroundColor: "#fff",
                          "&:hover": {
                            backgroundColor: "#ededed",
                            cursor: "pointer",
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={styles.styleCell}
                    rowSpan={2}
                  >
                    <Box style={styles.boxHeaderHasFilter}>
                      <Typography
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Medical Record Number
                      </Typography>
                      <Search
                        style={{
                          borderRadius: 5,
                          height: "18px",
                          width: "18px",
                          padding: "2px",
                          marginLeft: "5px",
                        }}
                        onClick={(event) =>
                          handleClickSearch(event, "Medical Record Number")
                        }
                        sx={{
                          backgroundColor: "#fff",
                          "&:hover": {
                            backgroundColor: "#ededed",
                            cursor: "pointer",
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={styles.styleCell}
                    rowSpan={2}
                  >
                    <Box style={styles.boxHeaderHasFilter}>
                      <Typography
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Name
                      </Typography>
                      <Search
                        style={{
                          borderRadius: 5,
                          height: "18px",
                          width: "18px",
                          padding: "2px",
                          marginLeft: "5px",
                        }}
                        onClick={(event) => handleClickSearch(event, "Name")}
                        sx={{
                          backgroundColor: "#fff",
                          "&:hover": {
                            backgroundColor: "#ededed",
                            cursor: "pointer",
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={styles.styleCell}
                    rowSpan={2}
                  >
                    <Box style={styles.boxHeaderHasFilter}>
                      <Typography
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Status
                      </Typography>
                      <FilterList
                        style={{
                          borderRadius: 5,
                          height: "18px",
                          width: "18px",
                          padding: "2px",
                          marginLeft: "5px",
                        }}
                        onClick={(e) => handleClickFilter(e, "Status")}
                        sx={{
                          backgroundColor: "#fff",
                          "&:hover": {
                            backgroundColor: "#ededed",
                            cursor: "pointer",
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={styles.styleCell}
                    colSpan={2}
                  >
                    <Typography
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      PHQ-9
                    </Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={styles.styleCell}
                    rowSpan={2}
                  >
                    <Box style={styles.boxHeaderHasFilter}>
                      <Typography
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        Systematic case review
                      </Typography>
                      <FilterList
                        style={{
                          borderRadius: 5,
                          height: "18px",
                          width: "18px",
                          padding: "2px",
                          marginLeft: "5px",
                        }}
                        onClick={(e) =>
                          handleClickFilter(e, "systematicCaseReview")
                        }
                        sx={{
                          backgroundColor: "#fff",
                          "&:hover": {
                            backgroundColor: "#ededed",
                            cursor: "pointer",
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={styles.styleCell}
                    colSpan={8}
                  >
                    <Typography
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Contacts
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow
                  style={{
                    backgroundColor: "#90ce4a",
                    border: "1px solid white",
                  }}
                >
                  {headerLabel.map((header) => (
                    <TableCell
                      align="center"
                      style={
                        header === "Initial Consultation" ||
                        header === "Last Consultation"
                          ? { ...styles.styleCell, minWidth: 90 }
                          : styles.styleCell
                      }
                      onClick={() => {
                        header === "First" && sortTeis("PHQ9First");
                        header === "Last" && sortTeis("PHQ9Last");
                        header === "Initial Consultation" &&
                          sortTeis("firstConsultation");
                        header === "Last Consultation" &&
                          sortTeis("lastConsultation");
                        header === "Psychiatrist review" &&
                          sortTeis("lastPsycho");
                        header === "Last Treatment" &&
                          sortTeis("lastTreatment");
                        header === "Physician review" &&
                          sortTeis("lastPhysician");
                        header === "Weeks since Initial" &&
                          sortTeis("weeksSinceInitial");
                        header === "#Sessions" && sortTeis("sessions");
                      }}
                      sx={{
                        "&:hover": (header.includes("First") ||
                          header.includes("Last") ||
                          header.includes("review") ||
                          header.includes("#Sessions") ||
                          header.includes("Initial")) && {
                          backgroundColor: "#a0d365",
                          cursor: "pointer",
                        },
                      }}
                    >
                      {header.includes("First") ||
                      header.includes("review") ||
                      header.includes("Last") ||
                      header.includes("#Sessions") ||
                      header.includes("Initial") ? (
                        <Box style={styles.boxHeaderHasFilter}>
                          <Typography
                            style={{
                              fontWeight: 500,
                            }}
                          >
                            {header}
                          </Typography>
                          <ImportExport
                            style={{ fontSize: 18, marginLeft: 2 }}
                          />
                        </Box>
                      ) : (
                        <Typography
                          style={{
                            fontWeight: 500,
                          }}
                        >
                          {header}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="center" style={styles.styleCell}>
                    Notification for consultant
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allDatasTei.length === 0 ? (
                  <TableRow>
                    <TableCell align="center" colSpan={14}>
                      No data
                    </TableCell>
                  </TableRow>
                ) : (
                  showDatasTable()
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 100]}
              component="div"
              count={Object.values(allDatasTei).length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>

          {showModal && (
            <Modal
              open={showModal}
              onClose={() => {
                closeModal();
                setStep(1);
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "65%",
                  maxWidth: "1200px",
                  bgcolor: "#FFF",
                  paddingBlock: "35px",
                  paddingInline: "70px",
                  borderRadius: "12px",
                  overflow: "scroll",
                  height: windowDimensions.height - 10,
                }}
              >
                {step === 1 ? (
                  <>
                    <Typography
                      style={{
                        textAlign: "center",
                        fontSize: "28px",
                        marginBottom: "10px",
                      }}
                    >
                      Treatment History Report
                    </Typography>
                    <Typography style={{ fontSize: "18px" }}>
                      Patient Name: {teiData.name}
                    </Typography>
                    {(rolePhysician || rolePsychiatrist || roleTreatment) && (
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        {rolePhysician && (
                          <Button
                            style={{
                              backgroundColor: "#E2E8F0",
                              boxShadow: "3px 3px 6px #94A3BB",
                              marginInline: 10,
                            }}
                            onClick={() => {
                              handleAddEvent({
                                teiObj: allDatasTei.filter(
                                  (e) => e.tei === teiData.teiId
                                )[0],
                                typeAddEvent: "Physician review",
                              });
                              setAllowBack(true);
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 15,
                                color: "#475569",
                              }}
                            >
                              Add Physician review
                            </Typography>
                          </Button>
                        )}

                        {rolePsychiatrist && (
                          <Button
                            style={{
                              backgroundColor: "#E2E8F0",
                              boxShadow: "3px 3px 6px #94A3BB",
                            }}
                            onClick={() => {
                              handleAddEvent({
                                teiObj: allDatasTei.filter(
                                  (e) => e.tei === teiData.teiId
                                )[0],
                                typeAddEvent: "Psychiatrist review",
                              });
                              setAllowBack(true);
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 15,
                                color: "#475569",
                              }}
                            >
                              Add Psychiatrist review
                            </Typography>
                          </Button>
                        )}
                        {(rolePhysician || rolePsychiatrist) && (
                          <Button
                            style={{
                              backgroundColor: "#E2E8F0",
                              boxShadow: "3px 3px 6px #94A3BB",
                              marginInline: 10,
                            }}
                            onClick={() => {
                              handleAddEvent({
                                teiObj: allDatasTei.filter(
                                  (e) => e.tei === teiData.teiId
                                )[0],
                                typeAddEvent: "Notification for consultant",
                              });
                              setAllowBack(true);
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 15,
                                color: "#475569",
                              }}
                            >
                              Add Notification for consultant
                            </Typography>
                          </Button>
                        )}
                      </Box>
                    )}
                    <TableContainer
                      component={Paper}
                      style={{ marginBlock: "10px" }}
                    >
                      <Table aria-label="simple table">
                        <TableHead>
                          <TableRow
                            style={{
                              backgroundColor: "#90ce4a",
                            }}
                          >
                            <TableCell
                              align="center"
                              style={styles.styleCell}
                              rowSpan={2}
                            >
                              <Typography
                                style={{
                                  fontWeight: 500,
                                }}
                              >
                                Date of Contact
                              </Typography>
                            </TableCell>
                            <TableCell
                              align="center"
                              style={styles.styleCell}
                              rowSpan={2}
                            >
                              <Typography
                                style={{
                                  fontWeight: 500,
                                }}
                              >
                                Contact Type
                              </Typography>
                            </TableCell>
                            <TableCell
                              align="center"
                              style={styles.styleCell}
                              rowSpan={2}
                            >
                              <Typography
                                style={{
                                  fontWeight: 500,
                                }}
                              >
                                PHQ-9
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {teiData.events.length > 0 ? (
                            teiData.events.map((event) => (
                              <TableRow
                                onClick={() => {
                                  event.programStage === "tJwK3ZiXydS" &&
                                    handleDetail({
                                      event: event,
                                      stageId: "tJwK3ZiXydS",
                                    });
                                  event.programStage === "HN0H6ha4zRV" &&
                                    handleDetail({
                                      event: event,
                                      stageId: "HN0H6ha4zRV",
                                    });
                                  event.programStage === "FYifVckEipD" &&
                                    handleDetail({
                                      event: event,
                                      stageId: "FYifVckEipD",
                                    });
                                  event.programStage === "TgIXYmJFzZX" &&
                                    handleDetail({
                                      event: event,
                                      stageId: "TgIXYmJFzZX",
                                    });
                                  event.programStage === "uUnMwTTB3Tq" &&
                                    handleDetail({
                                      event: event,
                                      stageId: "uUnMwTTB3Tq",
                                    });
                                }}
                                sx={
                                  (event.programStage === "tJwK3ZiXydS" ||
                                    event.programStage === "HN0H6ha4zRV" ||
                                    event.programStage === "FYifVckEipD" ||
                                    event.programStage === "TgIXYmJFzZX" ||
                                    event.programStage === "uUnMwTTB3Tq") && {
                                    "&:hover": {
                                      backgroundColor: "#f1f1f1",
                                      cursor: "pointer",
                                    },
                                  }
                                }
                              >
                                <TableCell align="center">
                                  {event.eventDate.slice(0, 10)}
                                </TableCell>
                                <TableCell align="center">
                                  {typeStage(event.programStage)}
                                </TableCell>
                                <TableCell align="center">
                                  {event.PHQ9Score}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell align="center" colSpan={3}>
                                No Data
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {dataChart.length > 0 && (
                      <Box
                        style={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          style={{
                            width: "95%",
                          }}
                        >
                          <Line
                            data={{
                              labels: dataChart.map((e) => e.date),
                              datasets: [
                                {
                                  label: "PHQ-9",
                                  data: dataChart.map((e) => e.value),
                                  fill: false,
                                  borderColor: "rgba(75,192,192,1)",
                                },
                              ],
                            }}
                            options={{
                              elements: {
                                line: {
                                  tension: 0.4,
                                },
                              },
                              title: {
                                display: true,
                                text: "Chart Title",
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </>
                ) : step === 2 ? (
                  <Box>
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 20,
                      }}
                    >
                      <ArrowBack
                        style={{
                          fontWeight: 400,
                          minWidth: 50,
                          paddingBlock: 5,
                          flex: 1,
                          fontSize: 30,
                          backgroundColor: "#efefef",
                          color: "#243054",
                          borderRadius: 10,
                          boxShadow: "2px 4px 6px #bcbcbc",
                        }}
                        sx={{
                          "&:hover": {
                            cursor: "pointer",
                          },
                        }}
                        onClick={() => setStep(1)}
                      />
                      <Typography
                        style={{
                          textAlign: "center",
                          fontSize: "24px",
                          flex: 8,
                        }}
                      >
                        {showAllType === "TgIXYmJFzZX" && "Consultation"}
                        {showAllType === "HN0H6ha4zRV" && "Physician review"}
                        {showAllType === "tJwK3ZiXydS" && "Patient Information"}
                        {showAllType === "FYifVckEipD" && "Psychiatrist review"}
                        {showAllType === "uUnMwTTB3Tq" &&
                          "Important reminder for collaborator"}
                      </Typography>
                      <Box
                        style={{
                          flex: 1,
                          minWidth: 50,
                        }}
                      ></Box>
                    </Box>

                    <TableContainer component={Paper}>
                      <Table aria-label="simple table">
                        {showAllType !== "TgIXYmJFzZX" &&
                          showAllType !== "HN0H6ha4zRV" && (
                            <TableHead>
                              <TableRow
                                style={{
                                  backgroundColor: "#90ce4a",
                                }}
                              >
                                <TableCell
                                  align="center"
                                  style={styles.styleCell}
                                >
                                  <Typography
                                    style={{
                                      fontWeight: 500,
                                    }}
                                  >
                                    Date
                                  </Typography>
                                </TableCell>

                                {(showAllType === "FYifVckEipD" ||
                                  showAllType === "uUnMwTTB3Tq" ||
                                  showAllType === "tJwK3ZiXydS") && (
                                  <>
                                    <TableCell
                                      align="center"
                                      style={styles.styleCell}
                                    >
                                      <Typography
                                        style={{
                                          fontWeight: 500,
                                        }}
                                      >
                                        Data Element
                                      </Typography>
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      style={styles.styleCell}
                                    >
                                      <Typography
                                        style={{
                                          fontWeight: 500,
                                        }}
                                      >
                                        Value
                                      </Typography>
                                    </TableCell>
                                  </>
                                )}
                              </TableRow>
                            </TableHead>
                          )}

                        {showAllType === "TgIXYmJFzZX" ? (
                          <>
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  style={{
                                    fontSize: 20,
                                    fontWeight: 400,
                                  }}
                                >
                                  Date:
                                  {objSectionConsultation.eventDate.slice(
                                    0,
                                    10
                                  )}
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.keys(
                                objSectionConsultation.lstDEValue
                              ).map((sectionName) => {
                                return (
                                  <>
                                    <TableRow
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        paddingLeft: 20,
                                        height: 70,
                                        backgroundColor: "#90ce4a",
                                      }}
                                    >
                                      <Typography
                                        style={{
                                          fontSize: 18,
                                          fontWeight: 500,
                                        }}
                                      >
                                        {sectionName}
                                      </Typography>
                                    </TableRow>

                                    {Object.values(
                                      objSectionConsultation.lstDEValue[
                                        sectionName
                                      ]
                                    ).map((e) => {
                                      return (
                                        <TableRow
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                          }}
                                        >
                                          <TableCell
                                            style={{
                                              flex: 1,
                                            }}
                                          >
                                            <Typography>{e.name}</Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography
                                              style={{
                                                textAlign: "center",
                                                minWidth: 80,
                                              }}
                                            >
                                              {e.name !=
                                              "Flag from consultation"
                                                ? e.value
                                                : e.value == "4"
                                                ? "Flag for review"
                                                : e.value}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </>
                                );
                              })}
                            </TableBody>
                          </>
                        ) : showAllType === "HN0H6ha4zRV" ? (
                          <TableBody>
                            <TableRow
                              style={{
                                backgroundColor: "#90ce4a",
                                paddingLeft: 20,
                                height: 70,
                              }}
                            >
                              <TableCell
                                style={{
                                  fontSize: 18,
                                  fontWeight: 500,
                                  color: "#1f497d",
                                }}
                                colSpan={3}
                              >
                                Medication
                              </TableCell>
                            </TableRow>
                            <TableRow
                              style={{
                                backgroundColor: "#e5e5e5",
                              }}
                            >
                              <TableCell
                                align="center"
                                style={styles.styleCell}
                              >
                                <Typography
                                  style={{
                                    fontWeight: 500,
                                  }}
                                >
                                  Date
                                </Typography>
                              </TableCell>
                              <TableCell
                                align="center"
                                style={styles.styleCell}
                              >
                                <Typography
                                  style={{
                                    fontWeight: 500,
                                  }}
                                >
                                  Medicine prescript
                                </Typography>
                              </TableCell>
                              <TableCell
                                align="center"
                                style={styles.styleCell}
                              >
                                <Typography
                                  style={{
                                    fontWeight: 500,
                                  }}
                                >
                                  Daily dose
                                </Typography>
                              </TableCell>
                            </TableRow>

                            {detailOfEvent.lstDEValue.length > 0 ? (
                              detailOfEvent.lstDEValue
                                .filter((e) => e.dose)
                                .map(({ medicine, dose }, index) => (
                                  <TableRow>
                                    {index === 0 && (
                                      <TableCell
                                        rowSpan={
                                          detailOfEvent.lstDEValue.filter(
                                            (e) => e.dose
                                          ).length
                                        }
                                      >
                                        <Typography align="center">
                                          {detailOfEvent.eventDate.slice(0, 10)}
                                        </Typography>
                                      </TableCell>
                                    )}
                                    {showAllType === "HN0H6ha4zRV" && (
                                      <>
                                        <TableCell>
                                          <Typography
                                            style={{ marginLeft: 20 }}
                                          >
                                            {medicine}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          {dose}
                                        </TableCell>
                                      </>
                                    )}
                                    {showAllType === "FYifVckEipD" && (
                                      <TableCell align="center">
                                        {note}
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))
                            ) : (
                              <TableRow>
                                <TableCell align="center">
                                  {detailOfEvent.eventDate.slice(0, 10)}
                                </TableCell>
                                <TableCell align="center" colSpan={2}>
                                  Not medicine yet
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow
                              style={{
                                backgroundColor: "#90ce4a",
                                paddingLeft: 20,
                                height: 70,
                              }}
                            >
                              <TableCell
                                style={{
                                  fontSize: 18,
                                  fontWeight: 500,
                                  color: "#1f497d",
                                }}
                                colSpan={3}
                              >
                                Physician
                              </TableCell>
                            </TableRow>
                            <TableRow
                              style={{
                                backgroundColor: "#e5e5e5",
                              }}
                            >
                              <TableCell
                                align="center"
                                style={styles.styleCell}
                              >
                                <Typography
                                  style={{
                                    fontWeight: 500,
                                  }}
                                >
                                  Date
                                </Typography>
                              </TableCell>
                              <TableCell
                                align="center"
                                style={styles.styleCell}
                              >
                                <Typography
                                  style={{
                                    fontWeight: 500,
                                  }}
                                >
                                  Data Element
                                </Typography>
                              </TableCell>
                              <TableCell
                                align="center"
                                style={styles.styleCell}
                              >
                                <Typography
                                  style={{
                                    fontWeight: 500,
                                  }}
                                >
                                  Value
                                </Typography>
                              </TableCell>
                            </TableRow>
                            {detailOfEvent.lstDEValue.length > 0 ? (
                              detailOfEvent.lstDEValue
                                .filter((e) => e.displayName)
                                .map(({ displayName, value }, index) => (
                                  <TableRow>
                                    {index === 0 && (
                                      <TableCell
                                        rowSpan={
                                          detailOfEvent.lstDEValue.filter(
                                            (e) => e.displayName
                                          ).length
                                        }
                                      >
                                        <Typography align="center">
                                          {detailOfEvent.eventDate.slice(0, 10)}
                                        </Typography>
                                      </TableCell>
                                    )}
                                    {showAllType === "HN0H6ha4zRV" && (
                                      <>
                                        <TableCell>
                                          <Typography
                                            style={{ marginLeft: 20 }}
                                          >
                                            {displayName}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          {value}
                                        </TableCell>
                                      </>
                                    )}
                                    {showAllType === "FYifVckEipD" && (
                                      <TableCell align="center">
                                        {note}
                                      </TableCell>
                                    )}
                                  </TableRow>
                                ))
                            ) : (
                              <TableRow>
                                <TableCell align="center">
                                  {detailOfEvent.eventDate.slice(0, 10)}
                                </TableCell>
                                <TableCell align="center" colSpan={2}>
                                  Not physician yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        ) : (
                          <TableBody>
                            {detailOfEvent.lstDEValue.length > 0 ? (
                              detailOfEvent.lstDEValue.map(
                                ({ displayName, value }, index) => (
                                  <TableRow>
                                    {index === 0 && (
                                      <TableCell
                                        rowSpan={
                                          detailOfEvent.lstDEValue.length
                                        }
                                      >
                                        <Typography align="center">
                                          {detailOfEvent.eventDate.slice(0, 10)}
                                        </Typography>
                                      </TableCell>
                                    )}

                                    {(showAllType === "FYifVckEipD" ||
                                      showAllType === "uUnMwTTB3Tq" ||
                                      showAllType === "tJwK3ZiXydS") && (
                                      <>
                                        <TableCell>{displayName}</TableCell>
                                        <TableCell align="center">
                                          {value}
                                        </TableCell>
                                      </>
                                    )}
                                  </TableRow>
                                )
                              )
                            ) : (
                              <TableRow>
                                <TableCell align="center">
                                  {detailOfEvent.eventDate.slice(0, 10)}
                                </TableCell>
                                <TableCell align="center" colSpan={2}>
                                  {showAllType === "FYifVckEipD" &&
                                    "Not note yet"}
                                  {showAllType === "tJwK3ZiXydS" &&
                                    "No patient information"}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        )}
                      </Table>
                    </TableContainer>
                  </Box>
                ) : step === 3 ? (
                  <Box>
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        style={{
                          textAlign: "center",
                          fontSize: "28px",
                          flex: 10,
                        }}
                      >
                        {showAllType === "TgIXYmJFzZX" &&
                          isFirstConsultation &&
                          "First Consultation"}
                        {showAllType === "TgIXYmJFzZX" &&
                          isLastConsultation &&
                          "Last Consultation"}
                        {showAllType === "HN0H6ha4zRV" &&
                          "Last Physician review"}
                        {showAllType === "uUnMwTTB3Tq" &&
                          "Notifications for consultant"}
                        {showAllType === "FYifVckEipD" &&
                          "Last Psychiatrist review"}
                      </Typography>
                    </Box>
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box />
                      {(rolePhysician || rolePsychiatrist) &&
                        addNoteFromAllNotes && (
                          <Button
                            style={{
                              backgroundColor: "#E2E8F0",
                              boxShadow: "3px 3px 6px #94A3BB",
                              marginBlock: 20,
                            }}
                            onClick={() => {
                              handleAddEvent({
                                teiObj: allDatasTei.filter(
                                  (e) => e.tei === teiData.teiId
                                )[0],
                                typeAddEvent: "Notification for consultant",
                              });
                              setAllowBack(true);
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 15,
                                color: "#475569",
                              }}
                            >
                              Add Notification for consultant
                            </Typography>
                          </Button>
                        )}
                    </Box>
                    <TableContainer component={Paper}>
                      <Table aria-label="simple table">
                        {showAllType !== "TgIXYmJFzZX" &&
                          showAllType !== "HN0H6ha4zRV" && (
                            <TableHead>
                              <TableRow
                                style={{
                                  backgroundColor: "#90ce4a",
                                }}
                              >
                                <TableCell
                                  align="center"
                                  style={styles.styleCell}
                                >
                                  <Typography
                                    style={{
                                      fontWeight: 500,
                                    }}
                                  >
                                    Date
                                  </Typography>
                                </TableCell>
                                {(showAllType === "FYifVckEipD" ||
                                  showAllType === "uUnMwTTB3Tq") && (
                                  <>
                                    <TableCell
                                      align="center"
                                      style={styles.styleCell}
                                    >
                                      <Typography
                                        style={{
                                          fontWeight: 500,
                                        }}
                                      >
                                        Data Element
                                      </Typography>
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      style={styles.styleCell}
                                    >
                                      <Typography
                                        style={{
                                          fontWeight: 500,
                                        }}
                                      >
                                        Value
                                      </Typography>
                                    </TableCell>
                                  </>
                                )}
                              </TableRow>
                            </TableHead>
                          )}

                        {/* CONSULTATION ACTIVITIES */}
                        {showAllType === "TgIXYmJFzZX" &&
                          lstAllEventsOfConsultation.length > 0 &&
                          (lstAllEventsOfConsultation.filter(
                            (e) => Object.values(e.lstDEValue).length !== 0
                          ).length !== 0 ? (
                            <>
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    style={{
                                      fontSize: 20,
                                      fontWeight: 400,
                                    }}
                                  >
                                    Date:{" "}
                                    {lstAllEventsOfConsultation[0]?.eventDate.slice(
                                      0,
                                      10
                                    )}
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {lstAllEventsOfConsultation.map(
                                  (eventConsultation) => {
                                    return Object.keys(
                                      eventConsultation.lstDEValue
                                    ).map((sectionName) => {
                                      return (
                                        <>
                                          <TableRow
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              paddingLeft: 20,
                                              height: 70,
                                              backgroundColor: "#90ce4a",
                                            }}
                                          >
                                            <Typography
                                              style={{
                                                fontSize: 18,
                                                fontWeight: 500,
                                              }}
                                            >
                                              {sectionName}
                                            </Typography>
                                          </TableRow>

                                          {eventConsultation &&
                                            Object.values(
                                              eventConsultation.lstDEValue[
                                                sectionName
                                              ]
                                            ).map((e) => {
                                              return (
                                                <TableRow
                                                  style={{
                                                    display: "flex",
                                                    justifyContent:
                                                      "space-between",
                                                  }}
                                                >
                                                  <TableCell
                                                    style={{
                                                      flex: 1,
                                                    }}
                                                  >
                                                    <Typography>
                                                      {e.name}
                                                    </Typography>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Typography
                                                      style={{
                                                        textAlign: "center",
                                                        minWidth: 80,
                                                      }}
                                                    >
                                                      {e.value}
                                                    </Typography>
                                                  </TableCell>
                                                </TableRow>
                                              );
                                            })}
                                        </>
                                      );
                                    });
                                  }
                                )}
                              </TableBody>
                            </>
                          ) : (
                            <TableCell align="center" colSpan={3}>
                              Not consultation yet
                            </TableCell>
                          ))}

                        {/* PHYSICIAN */}
                        {showAllType === "HN0H6ha4zRV" &&
                          lstAllEventsOfPhysician.length > 0 && (
                            <TableBody>
                              <TableRow
                                style={{
                                  backgroundColor: "#90ce4a",
                                  paddingLeft: 20,
                                  height: 70,
                                }}
                              >
                                <TableCell
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 500,
                                    color: "#1f497d",
                                  }}
                                  colSpan={3}
                                >
                                  Medication
                                </TableCell>
                              </TableRow>
                              <TableRow
                                style={{
                                  backgroundColor: "#e5e5e5",
                                }}
                              >
                                <TableCell
                                  align="center"
                                  style={styles.styleCell}
                                >
                                  <Typography
                                    style={{
                                      fontWeight: 500,
                                    }}
                                  >
                                    Date
                                  </Typography>
                                </TableCell>
                                <TableCell
                                  align="center"
                                  style={styles.styleCell}
                                >
                                  <Typography
                                    style={{
                                      fontWeight: 500,
                                    }}
                                  >
                                    Medicine prescript
                                  </Typography>
                                </TableCell>
                                <TableCell
                                  align="center"
                                  style={styles.styleCell}
                                >
                                  <Typography
                                    style={{
                                      fontWeight: 500,
                                    }}
                                  >
                                    Daily dose
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              {lstAllEventsOfPhysician.map((eventPhysician) => {
                                let countDe = Object.values(
                                  eventPhysician.lstDEValue.filter(
                                    (e) => e.dose
                                  )
                                );
                                return countDe.length > 0 ? (
                                  eventPhysician.lstDEValue
                                    .filter((e) => e.dose)
                                    .map(({ medicine, dose }, index) => (
                                      <TableRow>
                                        {index === 0 && (
                                          <TableCell rowSpan={countDe.length}>
                                            <Typography align="center">
                                              {eventPhysician.eventDate.slice(
                                                0,
                                                10
                                              )}
                                            </Typography>
                                          </TableCell>
                                        )}
                                        <TableCell>
                                          <Typography
                                            style={{ marginLeft: 20 }}
                                          >
                                            {medicine}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          {dose}
                                        </TableCell>
                                      </TableRow>
                                    ))
                                ) : (
                                  <TableRow>
                                    <TableCell align="center">
                                      {eventPhysician.eventDate.slice(0, 10)}
                                    </TableCell>
                                    <TableCell align="center" colSpan={2}>
                                      Not Physician review yet
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              <TableRow
                                style={{
                                  backgroundColor: "#90ce4a",
                                  paddingLeft: 20,
                                  height: 70,
                                }}
                              >
                                <TableCell
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 500,
                                    color: "#1f497d",
                                  }}
                                  colSpan={3}
                                >
                                  Physician
                                </TableCell>
                              </TableRow>
                              <TableRow
                                style={{
                                  backgroundColor: "#e5e5e5",
                                }}
                              >
                                <TableCell
                                  align="center"
                                  style={styles.styleCell}
                                >
                                  <Typography
                                    style={{
                                      fontWeight: 500,
                                    }}
                                  >
                                    Date
                                  </Typography>
                                </TableCell>
                                <TableCell
                                  align="center"
                                  style={styles.styleCell}
                                >
                                  <Typography
                                    style={{
                                      fontWeight: 500,
                                    }}
                                  >
                                    Data Element
                                  </Typography>
                                </TableCell>
                                <TableCell
                                  align="center"
                                  style={styles.styleCell}
                                >
                                  <Typography
                                    style={{
                                      fontWeight: 500,
                                    }}
                                  >
                                    Value
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              {lstAllEventsOfPhysician.map((eventPhysician) => {
                                let countDe = Object.values(
                                  eventPhysician.lstDEValue.filter(
                                    (e) => e.displayName
                                  )
                                );
                                return countDe.length > 0 ? (
                                  eventPhysician.lstDEValue
                                    .filter((e) => e.displayName)
                                    .map(({ displayName, value }, index) => (
                                      <TableRow>
                                        {index === 0 && (
                                          <TableCell rowSpan={countDe.length}>
                                            <Typography align="center">
                                              {eventPhysician.eventDate.slice(
                                                0,
                                                10
                                              )}
                                            </Typography>
                                          </TableCell>
                                        )}
                                        <TableCell>
                                          <Typography
                                            style={{ marginLeft: 20 }}
                                          >
                                            {displayName}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          {value}
                                        </TableCell>
                                      </TableRow>
                                    ))
                                ) : (
                                  <TableRow>
                                    <TableCell align="center">
                                      {eventPhysician.eventDate.slice(0, 10)}
                                    </TableCell>
                                    <TableCell align="center" colSpan={2}>
                                      Not Physician review yet
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          )}

                        {/* PSYCHOTHERAPY */}
                        {showAllType === "FYifVckEipD" &&
                          (lstAllEventsOfPsycho.length > 0 &&
                          lstAllEventsOfPsycho.filter(
                            (e) => e.lstDEValue.length !== 0
                          ).length !== 0 ? (
                            <TableBody>
                              {lstAllEventsOfPsycho.map((eventPsycho) =>
                                eventPsycho.lstDEValue.map(
                                  ({ displayName, value }, index) => (
                                    <TableRow>
                                      {index === 0 && (
                                        <TableCell
                                          rowSpan={
                                            eventPsycho.lstDEValue.length
                                          }
                                        >
                                          <Typography align="center">
                                            {eventPsycho.eventDate.slice(0, 10)}
                                          </Typography>
                                        </TableCell>
                                      )}
                                      <TableCell>{displayName}</TableCell>
                                      <TableCell align="center">
                                        {value}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )
                              )}
                            </TableBody>
                          ) : (
                            <TableCell align="center" colSpan={2}>
                              Not Psychiatrist review yet
                            </TableCell>
                          ))}

                        {/* PSYCHOTHERAPY */}
                        {showAllType === "uUnMwTTB3Tq" &&
                          (lstAllEventsOfNotes.length > 0 &&
                          lstAllEventsOfNotes.filter(
                            (e) => e.lstDEValue.length > 0
                          ).length > 0 ? (
                            <TableBody>
                              {lstAllEventsOfNotes.map((eventNote) =>
                                eventNote.lstDEValue.map(
                                  ({ displayName, value }, index) => (
                                    <TableRow>
                                      {index === 0 && (
                                        <TableCell
                                          rowSpan={eventNote.lstDEValue.length}
                                        >
                                          <Typography align="center">
                                            {eventNote.eventDate.slice(0, 10)}
                                          </Typography>
                                        </TableCell>
                                      )}
                                      <TableCell>{displayName}</TableCell>
                                      <TableCell align="center">
                                        {value}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )
                              )}
                            </TableBody>
                          ) : (
                            <TableCell align="center" colSpan={3}>
                              Not important note for consultant yet
                            </TableCell>
                          ))}
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Box>
                    {allowBack ? (
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 20,
                        }}
                      >
                        <ArrowBack
                          style={{
                            fontWeight: 400,
                            minWidth: 50,
                            paddingBlock: 5,
                            flex: 1,
                            fontSize: 30,
                            backgroundColor: "#efefef",
                            color: "#243054",
                            borderRadius: 10,
                            boxShadow: "2px 4px 6px #bcbcbc",
                          }}
                          sx={{
                            "&:hover": {
                              cursor: "pointer",
                            },
                          }}
                          onClick={() =>
                            addNoteFromAllNotes ? setStep(3) : setStep(1)
                          }
                        />
                        <Typography
                          style={{
                            textAlign: "center",
                            fontSize: "24px",
                            flex: 8,
                          }}
                        >
                          Add {typeAddEvent}
                        </Typography>
                        <Box
                          style={{
                            flex: 1,
                            minWidth: 50,
                          }}
                        ></Box>
                      </Box>
                    ) : (
                      <Typography
                        style={{
                          fontSize: "28px",
                          marginBottom: "10px",
                        }}
                      >
                        Add {typeAddEvent}
                      </Typography>
                    )}
                    <Box
                      style={{
                        width: "100%",
                      }}
                    >
                      {typeAddEvent === "Notification for consultant" ? (
                        <Box>
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: 20,
                              height: 70,
                              backgroundColor: "#e5e5e5",
                              borderRadius: 10,
                              marginBottom: 15,
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 20,
                                fontWeight: 500,
                              }}
                            >
                              Note for consultant
                            </Typography>
                          </Box>
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Important note for consultant
                            </Typography>
                            <Box
                              style={{
                                width: 430,
                                marginTop: 4,
                                marginBottom: 6,
                              }}
                            >
                              <textarea
                                type="textarea"
                                value={importantNoteForConsultant}
                                onChange={(e) => {
                                  setImportantNoteForConsultant(e.target.value);
                                }}
                                style={{
                                  boxSizing: "border-box",
                                  fontSize: 18,
                                  width: "100%",
                                  height: 130,
                                  marginTop: 4,
                                  marginBottom: 6,
                                  padding: 18,
                                  borderRadius: "12px",
                                  borderColor: "#CBD5E1",
                                  borderWidth: "1px",
                                  color: "#0F172A",
                                  fontWeight: 400,
                                  fontFamily: "NotoSansLao, Roboto, sans-serif",
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      ) : typeAddEvent === "Physician review" ? (
                        <Box>
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: 20,
                              height: 70,
                              backgroundColor: "#e5e5e5",
                              borderRadius: 10,
                              marginBottom: 15,
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 20,
                                fontWeight: 500,
                              }}
                            >
                              Medicine
                            </Typography>
                          </Box>
                          {lstDeMedicine.map((deMedicine, index) => {
                            return (
                              <Box
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography
                                  style={{
                                    fontSize: 18,
                                    marginRight: 30,
                                    width: 300,
                                  }}
                                >
                                  {deMedicine.name}
                                </Typography>
                                {!deMedicine.name.includes("dos") ? (
                                  <FormControl
                                    style={{
                                      width: 430,
                                    }}
                                    sx={{
                                      padding: 0,
                                      margin: 0,
                                    }}
                                  >
                                    <Select
                                      value={
                                        prescription[
                                          `medicine${(index + 2) / 2}`
                                        ]
                                      }
                                      onChange={(e) => {
                                        changeChooseMedicine({
                                          value: e.target.value,
                                          index: (index + 2) / 2,
                                        });
                                      }}
                                      style={{
                                        width: "100%",
                                        height: 50,
                                        borderRadius: "12px",
                                        borderStyle: "solid",
                                        borderWidth: "1px",
                                        marginTop: 4,
                                        marginBottom: 6,
                                        borderColor: "#0F172A",
                                      }}
                                      sx={{
                                        "& legend": {
                                          display: "none",
                                        },
                                        "& .MuiOutlinedInput-notchedOutline": {
                                          border: "none",
                                        },
                                      }}
                                    >
                                      <MenuItem
                                        key="valueNull"
                                        value="valueNull"
                                        disabled
                                      >
                                        <Typography
                                          style={{
                                            fontSize: 18,
                                            color: "#0F172A",
                                            fontWeight: 400,
                                          }}
                                        >
                                          Select Medicine
                                        </Typography>
                                      </MenuItem>
                                      {lstMedicine.map((e) => {
                                        return (
                                          <MenuItem
                                            key={e.code}
                                            value={e.code}
                                            name={e.name}
                                          >
                                            <Typography
                                              style={{
                                                fontSize: 18,
                                              }}
                                            >
                                              {
                                                lstMedicine.filter(
                                                  (m) => m.code === e.code
                                                )[0].name
                                              }
                                            </Typography>
                                          </MenuItem>
                                        );
                                      })}
                                    </Select>
                                  </FormControl>
                                ) : (
                                  <Box
                                    style={{
                                      width: 430,
                                      marginTop: 4,
                                      marginBottom: 6,
                                    }}
                                  >
                                    <input
                                      style={{
                                        boxSizing: "border-box",
                                        width: "100%",
                                        height: 50,
                                        fontSize: 18,
                                        paddingLeft: 18,
                                        borderRadius: "12px",
                                        borderStyle: "solid",
                                        borderWidth: "1px",
                                        borderColor: "#0F172A",
                                        color: "#0F172A",
                                        fontWeight: 400,
                                        fontFamily:
                                          "NotoSansLao, Roboto, sans-serif",
                                      }}
                                      onChange={(e) => {
                                        changeInput({
                                          value: e.target.value,
                                          index: (index + 1) / 2,
                                        });
                                      }}
                                    />
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: 20,
                              height: 70,
                              backgroundColor: "#e5e5e5",
                              borderRadius: 10,
                              marginBlock: 15,
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 20,
                                fontWeight: 500,
                              }}
                            >
                              Physician
                            </Typography>
                          </Box>

                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Examined the patient
                            </Typography>
                            <FormControl
                              style={{
                                width: 430,
                              }}
                              sx={{
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <RadioGroup
                                aria-labelledby="radio-buttons-group-label"
                                defaultValue=""
                                name="examined-the-patient-radio-buttons-group"
                                row
                                value={prescription.examinedThePatient}
                                onChange={(event) => {
                                  setPrescription({
                                    ...prescription,
                                    ["examinedThePatient"]: event.target.value,
                                  });
                                }}
                              >
                                <FormControlLabel
                                  value="true"
                                  control={<Radio />}
                                  label="Yes"
                                />
                                <FormControlLabel
                                  value="false"
                                  control={<Radio />}
                                  label="No"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Box>
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              PHQ-9 score
                            </Typography>
                            <Box
                              style={{
                                width: 430,
                                marginTop: 4,
                                marginBottom: 6,
                              }}
                            >
                              <input
                                style={{
                                  boxSizing: "border-box",
                                  width: "100%",
                                  height: 50,
                                  fontSize: 18,
                                  paddingLeft: 18,
                                  borderRadius: "12px",
                                  borderStyle: "solid",
                                  borderWidth: "1px",
                                  borderColor: "#0F172A",
                                  color: "#0F172A",
                                  fontWeight: 400,
                                  fontFamily: "NotoSansLao, Roboto, sans-serif",
                                }}
                                onChange={(e) => {
                                  changeInput({
                                    value: e.target.value,
                                    field: "PHQ9Score",
                                  });
                                }}
                              />
                            </Box>
                          </Box>

                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Physician's diagnosis
                            </Typography>
                            <FormControl
                              style={{
                                width: 430,
                              }}
                              sx={{
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <Select
                                value={prescription["physicianDiagnosis"]}
                                onChange={(e) => {
                                  changeChooseMedicine({
                                    value: e.target.value,
                                    field: "physicianDiagnosis",
                                  });
                                }}
                                style={{
                                  width: "100%",
                                  height: 50,
                                  borderRadius: "12px",
                                  borderStyle: "solid",
                                  borderWidth: "1px",
                                  marginTop: 4,
                                  marginBottom: 6,
                                  borderColor: "#0F172A",
                                }}
                                sx={{
                                  "& legend": {
                                    display: "none",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                }}
                              >
                                <MenuItem
                                  key="valueNull"
                                  value="valueNull"
                                  disabled
                                >
                                  <Typography
                                    style={{
                                      fontSize: 18,
                                      color: "#0F172A",
                                      fontWeight: 400,
                                    }}
                                  >
                                    Select Diagnosis
                                  </Typography>
                                </MenuItem>
                                {optionSetPhysicianDianosis.map((option) => {
                                  return (
                                    <MenuItem
                                      key={option.id}
                                      value={option.code}
                                      name={option.name}
                                    >
                                      <Typography
                                        style={{
                                          fontSize: 18,
                                        }}
                                      >
                                        {
                                          optionSetPhysicianDianosis.filter(
                                            (m) => m.code === option.code
                                          )[0].name
                                        }
                                      </Typography>
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                          </Box>
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Suicide risk assessed by physician
                            </Typography>
                            <FormControl
                              style={{
                                width: 430,
                              }}
                              sx={{
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <RadioGroup
                                aria-labelledby="radio-buttons-group-label"
                                defaultValue=""
                                name="suicide-risk-radio-buttons-group"
                                row
                                value={
                                  prescription.suicideRiskAssessedByPhysician
                                }
                                onChange={(event) => {
                                  setPrescription({
                                    ...prescription,
                                    ["suicideRiskAssessedByPhysician"]:
                                      event.target.value,
                                  });
                                }}
                              >
                                <FormControlLabel
                                  value="true"
                                  control={<Radio />}
                                  label="Yes"
                                />
                                <FormControlLabel
                                  value="false"
                                  control={<Radio />}
                                  label="No"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Box>

                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Physician's notes :
                            </Typography>
                            <Box
                              style={{
                                width: 430,
                                marginTop: 4,
                                marginBottom: 6,
                              }}
                            >
                              <textarea
                                type="textarea"
                                value={prescription.physicianNotes}
                                onChange={(e) => {
                                  changeNotePhysician({
                                    value: e.target.value,
                                  });
                                }}
                                style={{
                                  boxSizing: "border-box",
                                  fontSize: 18,
                                  width: "100%",
                                  height: 130,
                                  marginTop: 4,
                                  marginBottom: 6,
                                  padding: 18,
                                  borderRadius: "12px",
                                  borderColor: "#CBD5E1",
                                  borderWidth: "1px",
                                  color: "#0F172A",
                                  fontWeight: 400,
                                  fontFamily: "NotoSansLao, Roboto, sans-serif",
                                }}
                              />
                            </Box>
                          </Box>
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Flag for review
                            </Typography>

                            <FormControl
                              style={{
                                width: 430,
                              }}
                              sx={{
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <Select
                                value={prescription["flagForReview"]}
                                onChange={(e) => {
                                  changeInput({
                                    value: e.target.value,
                                    field: "flagForReview",
                                  });
                                }}
                                style={{
                                  width: "100%",
                                  height: 50,
                                  borderRadius: "12px",
                                  borderStyle: "solid",
                                  borderWidth: "1px",
                                  marginTop: 4,
                                  marginBottom: 6,
                                  borderColor: "#0F172A",
                                }}
                                sx={{
                                  "& legend": {
                                    display: "none",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                }}
                              >
                                <MenuItem
                                  key="valueNull"
                                  value="valueNull"
                                  disabled
                                >
                                  <Typography
                                    style={{
                                      fontSize: 18,
                                      color: "#0F172A",
                                      fontWeight: 400,
                                    }}
                                  >
                                    Select Flag for review
                                  </Typography>
                                </MenuItem>
                                {optionSetFlagForReviewPhysic.map((e) => {
                                  return (
                                    <MenuItem
                                      key={e.code}
                                      value={e.code}
                                      name={e.name}
                                    >
                                      <Typography
                                        style={{
                                          fontSize: 18,
                                        }}
                                      >
                                        {
                                          optionSetFlagForReviewPhysic.filter(
                                            (m) => m.code === e.code
                                          )[0].name
                                        }
                                      </Typography>
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                          </Box>

                          {/* deMedicine.name.includes("notes") ? (
                                  <Box
                                    style={{
                                      width: 430,
                                      marginTop: 4,
                                      marginBottom: 6,
                                    }}
                                  >
                                    <textarea
                                      type="textarea"
                                      value={prescription.physicianNotes}
                                      onChange={(e) => {
                                        changeNotePhysician({
                                          value: e.target.value,
                                        });
                                      }}
                                      style={{
                                        boxSizing: "border-box",
                                        fontSize: 18,
                                        width: "100%",
                                        height: 130,
                                        marginTop: 4,
                                        marginBottom: 6,
                                        padding: 18,
                                        borderRadius: "12px",
                                        borderColor: "#CBD5E1",
                                        borderWidth: "1px",
                                        color: "#0F172A",
                                        fontWeight: 400,
                                        fontFamily:
                                          "NotoSansLao, Roboto, sans-serif",
                                      }}
                                    />
                                  </Box>
                                )  */}
                        </Box>
                      ) : typeAddEvent === "Psychiatrist review" ? (
                        <Box>
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Need to examine the patient
                            </Typography>
                            <FormControl
                              style={{
                                width: 430,
                              }}
                              sx={{
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <RadioGroup
                                aria-labelledby="radio-buttons-group-label"
                                defaultValue=""
                                name="examined-the-patient-radio-buttons-group"
                                row
                                value={psyData.examinedThePatient}
                                onChange={(event) => {
                                  changeChoosePsyData({
                                    value: event.target.value,
                                    field: "examinedThePatient",
                                  });
                                }}
                              >
                                <FormControlLabel
                                  value="true"
                                  control={<Radio />}
                                  label="Yes"
                                />
                                <FormControlLabel
                                  value="false"
                                  control={<Radio />}
                                  label="No"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Box>

                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Psychiatrist consultant diagnosis
                            </Typography>
                            <Box
                              style={{
                                width: 430,
                                marginTop: 4,
                                marginBottom: 6,
                              }}
                            >
                              <textarea
                                type="textarea"
                                value={psyData.psyDiagnosis}
                                onChange={(e) => {
                                  changeChoosePsyData({
                                    value: e.target.value,
                                    field: "psyDiagnosis",
                                  });
                                }}
                                style={{
                                  boxSizing: "border-box",
                                  fontSize: 18,
                                  width: "100%",
                                  height: 130,
                                  marginTop: 4,
                                  marginBottom: 6,
                                  padding: 18,
                                  borderRadius: "12px",
                                  borderColor: "#CBD5E1",
                                  borderWidth: "1px",
                                  color: "#0F172A",
                                  fontWeight: 400,
                                  fontFamily: "NotoSansLao, Roboto, sans-serif",
                                }}
                              />
                            </Box>
                          </Box>
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Suicide risk assessed by psychiatrist
                            </Typography>
                            <FormControl
                              style={{
                                width: 430,
                              }}
                              sx={{
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <RadioGroup
                                aria-labelledby="radio-buttons-group-label"
                                defaultValue=""
                                name="suicide-risk-psy-radio-buttons-group"
                                row
                                value={
                                  psyData.suicideRiskAssessedByPsychiatrist
                                }
                                onChange={(event) => {
                                  changeChoosePsyData({
                                    value: event.target.value,
                                    field: "suicideRiskAssessedByPsychiatrist",
                                  });
                                }}
                              >
                                <FormControlLabel
                                  value="true"
                                  control={<Radio />}
                                  label="Yes"
                                />
                                <FormControlLabel
                                  value="false"
                                  control={<Radio />}
                                  label="No"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Box>

                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Psychiatrict consultation notes
                            </Typography>
                            <Box
                              style={{
                                width: 430,
                                marginTop: 4,
                                marginBottom: 6,
                              }}
                            >
                              <textarea
                                type="textarea"
                                value={psyData.psyNotes}
                                onChange={(e) => {
                                  changeChoosePsyData({
                                    value: e.target.value,
                                    field: "psyNotes",
                                  });
                                }}
                                style={{
                                  boxSizing: "border-box",
                                  fontSize: 18,
                                  width: "100%",
                                  height: 130,
                                  marginTop: 4,
                                  marginBottom: 6,
                                  padding: 18,
                                  borderRadius: "12px",
                                  borderColor: "#CBD5E1",
                                  borderWidth: "1px",
                                  color: "#0F172A",
                                  fontWeight: 400,
                                  fontFamily: "NotoSansLao, Roboto, sans-serif",
                                }}
                              />
                            </Box>
                          </Box>
                          <Box
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: 18,
                                marginRight: 30,
                                width: 300,
                              }}
                            >
                              Flag for review
                            </Typography>
                            <FormControl
                              style={{
                                width: 430,
                              }}
                              sx={{
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <Select
                                value={psyData["flagForReview"]}
                                onChange={(e) => {
                                  changeChoosePsyData({
                                    value: e.target.value,
                                    field: "flagForReview",
                                  });
                                }}
                                style={{
                                  width: "100%",
                                  height: 50,
                                  borderRadius: "12px",
                                  borderStyle: "solid",
                                  borderWidth: "1px",
                                  marginTop: 4,
                                  marginBottom: 6,
                                  borderColor: "#0F172A",
                                }}
                                sx={{
                                  "& legend": {
                                    display: "none",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                }}
                              >
                                <MenuItem
                                  key="valueNull"
                                  value="valueNull"
                                  disabled
                                >
                                  <Typography
                                    style={{
                                      fontSize: 18,
                                      color: "#0F172A",
                                      fontWeight: 400,
                                    }}
                                  >
                                    Select Flag fo review
                                  </Typography>
                                </MenuItem>
                                {optionSetFlagForReview.map((e) => {
                                  return (
                                    <MenuItem
                                      key={e.code}
                                      value={e.code}
                                      name={e.name}
                                    >
                                      <Typography
                                        style={{
                                          fontSize: 18,
                                        }}
                                      >
                                        {
                                          optionSetFlagForReview.filter(
                                            (m) => m.code === e.code
                                          )[0].name
                                        }
                                      </Typography>
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>
                      ) : (
                        <></>
                      )}
                      <Box
                        style={{
                          display: "flex",
                          marginTop: 10,
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            color: "#F8FAFC",
                            paddingInline: 50,
                            paddingBlock: 10,
                            fontSize: 18,
                            borderRadius: 8,
                          }}
                          onClick={() => onSubmit()}
                        >
                          Save
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Modal>
          )}
        </TableContainer>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1000}
        onClose={handleClose}
      >
        {responseSubmit === "OK" ? (
          <Alert
            onClose={handleClose}
            sx={{ width: "100%" }}
            severity="success"
          >
            Create event success!
          </Alert>
        ) : (
          <Alert onClose={handleClose} sx={{ width: "100%" }} severity="error">
            Create event unsuccess!
          </Alert>
        )}
      </Snackbar>
    </div>
  );
};

export default withReportContainer(ActivePatients);
