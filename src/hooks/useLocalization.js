import { useTranslation } from "react-i18next";

const useLocalization = (locale, translations) => {
  const { t, i18n } = useTranslation();
  translations.forEach((translation) => {
    i18n.addResource(locale, "translation", translation.key, translation.value);
  });
};

export default useLocalization;
