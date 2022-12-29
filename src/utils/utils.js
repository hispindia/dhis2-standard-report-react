import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { pull } from "@/utils/fetch";

const printToPdf = async (dhis2Period, orgUnitName, ids, fileName) => {
  const pdf = new jsPDF("p", "pt", "a4", false);
  for (let i = 0; i < ids.length; i++) {
    const page = document.getElementById(ids[i]);
    const canvas = await html2canvas(page);
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 1600, 0, undefined, false);
    pdf.addPage();
  }
  pdf.save(`${fileName}_${dhis2Period}_${orgUnitName}.pdf`);
};

const findHeaderIndex = (headers, name) => {
  const found = headers.findIndex((header) => header.name === name);
  return found;
};

const fillData = (result) => {
  if (result.rows.length > 0) {
    return result.rows[0][findHeaderIndex(result.headers, "value")];
  } else {
    return 0;
  }
};

const returnTableData = async (
  array,
  flagTotal,
  totalNumber,
  orgUnit,
  period
) => {
  for (let i = 0; i < array.length; i++) {
    const results = await pull(
      `/api/analytics.json?dimension=dx:${array[i].id}&filter=ou:${orgUnit.id}&filter=pe:${period.dhis2Period}&displayProperty=NAME`
    );
    if (results.rows.length > 0) {
      if (flagTotal) {
        array[i].value =
          results.rows[0][findHeaderIndex(results.headers, "value")];
        array[i].total = totalNumber;
        array[i].percent = parseFloat(
          (array[i].value / array[i].total) * 100
        ).toFixed(1);
      } else {
        array[i].value =
          results.rows[0][findHeaderIndex(results.headers, "value")];
      }
    }
  }
  return array;
};

const returnTableDataWithSpecifyDenominator = async (
  array,
  flagTotal,
  totalNumber,
  orgUnit,
  period,
  denominatorId
) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i].totalId === denominatorId) {
      const results = await pull(
        `/api/analytics.json?dimension=dx:${array[i].id}&filter=ou:${orgUnit.id}&filter=pe:${period.dhis2Period}&displayProperty=NAME`
      );
      if (results.rows.length > 0) {
        if (flagTotal) {
          array[i].value =
            results.rows[0][findHeaderIndex(results.headers, "value")];
          array[i].total = totalNumber;
          array[i].percent = parseFloat(
            (array[i].value / array[i].total) * 100
          ).toFixed(1);
        } else {
          array[i].value =
            results.rows[0][findHeaderIndex(results.headers, "value")];
        }
      }
    }
  }
  return array;
};

const returnPieValue = async (
  object,
  id,
  flagTotal,
  totalNumber,
  orgUnit,
  period,
  optionDoughnut,
  resultDenominator
) => {
  if (!resultDenominator) {
    const results = await pull(
      `/api/analytics.json?dimension=dx:${id}&filter=ou:${orgUnit.id}&filter=pe:${period.dhis2Period}&displayProperty=NAME`
    );
    if (results.rows.length > 0) {
      if (flagTotal) {
        object.datasets[0].data = [
          parseFloat(
            (results.rows[0][findHeaderIndex(results.headers, "value")] /
              totalNumber) *
              100
          ).toFixed(1),
          100 -
            parseFloat(
              (results.rows[0][findHeaderIndex(results.headers, "value")] /
                totalNumber) *
                100
            ).toFixed(1),
        ];
      } else {
        object.datasets[0].data = [0, 100];
      }
    } else {
      object.datasets[0].data = [0, 100];
    }
    if (object.datasets[0].data[0] > 100) {
      object.datasets[0].data = [100, 0];
    }

    if (
      object.datasets[0].data[0] === "NaN" ||
      isNaN(object.datasets[0].data[0])
    ) {
      object.datasets[0].data[0] = 0;
    }
    if (
      object.datasets[0].data[1] === "NaN" ||
      isNaN(object.datasets[0].data[1])
    ) {
      object.datasets[0].data[1] = 100;
    }

    return object;
  } else {
    const results = await pull(
      `/api/analytics.json?dimension=dx:${id}&filter=ou:${orgUnit.id}&filter=pe:${period.dhis2Period}&displayProperty=NAME`
    );
    if (results.rows.length > 0) {
      if (flagTotal) {
        object.datasets[0].data = [
          parseFloat(
            (results.rows[0][findHeaderIndex(results.headers, "value")] /
              totalNumber) *
              100
          ).toFixed(1),
          100 -
            parseFloat(
              (results.rows[0][findHeaderIndex(results.headers, "value")] /
                totalNumber) *
                100
            ).toFixed(1),
        ];
      } else {
        object.datasets[0].data = [0, 100];
      }
    } else {
      object.datasets[0].data = [0, 100];
    }
    if (object.datasets[0].data[0] > 100) {
      object.datasets[0].data = [100, 0];
    }

    if (
      object.datasets[0].data[0] === "NaN" ||
      isNaN(object.datasets[0].data[0])
    ) {
      object.datasets[0].data[0] = 0;
    }
    if (
      object.datasets[0].data[1] === "NaN" ||
      isNaN(object.datasets[0].data[1])
    ) {
      object.datasets[0].data[1] = 100;
    }

    let centerText = returnDoughtnutCenterText(
      results,
      resultDenominator,
      optionDoughnut
    );
    return { data: object, centerText };
  }
};

const returnDoughtnutCenterText = (arrNum, arrTotal, optionDoughnut) => {
  if (!optionDoughnut) {
    optionDoughnut = {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
        datalabels: {
          display: function (context) {
            var dataset = context.dataset;
            var count = dataset.data.length;
            var value = dataset.data[context.dataIndex];
            return context.dataIndex === 1 ? null : `${value}%`;
          },
          font: {
            weight: "bold",
          },
          formatter: function (value, context) {
            return value + "%";
          },
          color: "white",
        },
        doughnutlabel: {
          paddingPercentage: 5,
          labels: [
            {
              text: `0`,
              font: {
                size: "40",
                family: "Arial, Helvetica, sans-serif",
                style: "italic",
                weight: "bold",
              },
              color: "black",
            },
          ],
        },
      },
    };
  }

  if (arrTotal.rows.length > 0 || arrNum.rows.length > 0) {
    console.log(arrTotal.rows);
    let valueCenterText = 0;
    let valueCenterTextNumerator = 0;
    if (arrTotal.rows.length > 0) {
      valueCenterText =
        arrTotal.rows[0][findHeaderIndex(arrTotal.headers, "value")] === "NaN"
          ? 0
          : arrTotal.rows[0][findHeaderIndex(arrTotal.headers, "value")];
    }
    if (arrNum.rows.length > 0) {
      valueCenterTextNumerator =
        arrNum.rows[0][findHeaderIndex(arrNum.headers, "value")] === "NaN"
          ? 0
          : arrNum.rows[0][findHeaderIndex(arrNum.headers, "value")];
    }

    optionDoughnut.plugins.doughnutlabel.labels[0].text = `${parseFloat(
      valueCenterTextNumerator
    ).toFixed(0)} / ${parseFloat(valueCenterText).toFixed(0)}`;
  } else {
    optionDoughnut.plugins.doughnutlabel.labels[0].text = "0 / 0";
  }
  return optionDoughnut;
};

export {
  findHeaderIndex,
  fillData,
  returnTableData,
  returnPieValue,
  returnTableDataWithSpecifyDenominator,
  printToPdf,
  returnDoughtnutCenterText,
};
