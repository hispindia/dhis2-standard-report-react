// Translation
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./index.css";

export default ({ data }) => {
  const { t } = useTranslation();

  useEffect(() => {
    console.log(data);
  }, []);

  const getRandomNumber = () => {
    return Math.floor(Math.random() * 101);
  };

  const renderData = () => {
    return data
      ? data.map((prov) => {
          return (
            <>
              <tr>
                <td className="row-title">{prov["name"]}</td>
                <td className="input-field">
                  {prov.hasOwnProperty("totalServices")
                    ? prov["totalServices"]
                    : "0"}
                </td>
                <td className="input-field">{`${getRandomNumber()} (D)`}</td>
                <td className="input-field">{`${getRandomNumber()} (D)`}</td>
                <td className="input-field">{`${getRandomNumber()} (D)`}</td>
                <td className="input-field">{`${getRandomNumber()} (D)`}</td>
                <td className="input-field">{`${getRandomNumber()} (D)`}</td>
                <td className="input-field">{`${getRandomNumber()} (D)`}</td>
                <td className="input-field">{`${getRandomNumber()} (D)`}</td>
                <td className="input-field percentage">
                  {`${getRandomNumber()}% (D)`}
                </td>
                <td className="input-field percentage">{`${getRandomNumber()}% (D)`}</td>
              </tr>
            </>
          );
        })
      : null;
  };

  return Array.isArray(data) ? (
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
            <th className="balance-col">{t("popFromFF")}</th>
            <th className="balance-col">{t("estPop")}</th>
            <th className="balance-col">{t("popFromFF")}</th>
          </tr>
        </thead>
        <tbody>{renderData()}</tbody>
      </table>
    </div>
  ) : null;
};
