sap.ui.define(["sap/ui/core/format/DateFormat"], (DateFormat) => {
  "use strict";

  return {
    formatYear: function (dateValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();
      let oDateFormat = DateFormat.getDateInstance({
        pattern: "yyyy",
      });
      let year = oDateFormat.format(new Date(dateValue));
      return oResourceBundle.getText("publishedWithYear", year);
    },
  };
});
