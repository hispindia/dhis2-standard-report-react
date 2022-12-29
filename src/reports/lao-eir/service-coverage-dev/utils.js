/**
 * Get current language translation
 * @param {String} currLanguage - Current language
 * @param {Array} translArr - List of Translation
 * @param {String} defaultName - Default English name
 * @returns
 */
const getCurrLanguageTranslation = (currLanguage, translArr, defaultName) => {
  if (translArr.length) {
    const translations = translArr.filter((translation) => {
      return (
        translation["property"] === "NAME" &&
        translation["locale"] === currLanguage
      );
    });
    return translations.length ? translations[0]["value"] : defaultName;
  } else {
    return defaultName;
  }
};

export { getCurrLanguageTranslation };
