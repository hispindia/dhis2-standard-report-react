import { writeFile, utils } from "xlsx";

const download = (
  events,
  optionSetsOptions,
  fileName,
  lsOrgUnitOptions,
  t,
  orgUnits
) => {
  const findOrgName = (code) => {
    return code && lsOrgUnitOptions.find((e) => e.code === code)?.displayName;
  };
  const payload_events = [];

  events.map((event) => {
    let row = {};
    const getValueOptions = (code, optionSetId) => {
      return optionSetsOptions
        .find((e) => e.id === optionSetId)
        .options.find((e) => e.code === code)?.displayName;
    };
    const value = (id) => {
      let output = event.dataValues.filter((e) => e.dataElement === id)[0]
        ?.value;
      return output ? output : "";
    };
    row[t("orgUnit")] = orgUnits.find(
      (e) => e.id === event.orgUnit
    ).displayName;
    row[t("dateOfReport")] = event.eventDate.slice(0, 10);
    row[t("nameSurname")] = `${value("lQSUx15reeW")} ${value("rVgvJgkKGeG")}`;
    row[t("age")] = value("zDPvXY6h4JN");
    row[t("sex")] = getValueOptions(value("CC9BpgSQbfh"), "C4y5rqhEvnE");
    row[t("nationality")] =
      value("jaan5ZI8EnJ") === "true"
        ? value("Nsv148saunk")
        : findOrgName("LA");
    row[t("occupation")] = getValueOptions(value("VxyFtFkaFpf"), "zBVgecf3Ia6");
    row[t("provinceOfResidence")] = findOrgName(value("r2lL9b9n7AH"));
    row[t("districtOfResidence")] = findOrgName(value("WtqnbO4FXrx"));
    row[t("villageOfResidence")] = findOrgName(value("mrrTTvKqyi1"));
    row[t("contactPhoneNumber")] = value("fou2X6uMkty");
    row[t("onsetDate")] = value("bS8cPIyCJNR");
    row[t("symptom")] = "";
    row[t("diseaseName")] = getValueOptions(
      value("Dyq13cMGMzT"),
      "kMe7B54S9VH"
    );
    row[t("dateOfAdmitted")] = value("p3jMZ9XRiIJ");
    row[t("treatmentWard")] = getValueOptions(
      value("iuVbJUaYMd9"),
      "g3Lwk861HoK"
    );
    payload_events.push(row);
  });

  let wb_options = utils.book_new();
  let ws_options = utils.json_to_sheet(payload_events);

  utils.book_append_sheet(wb_options, ws_options, "Sheet1");
  writeFile(wb_options, `${fileName}.xlsx`);
};

export { download };
