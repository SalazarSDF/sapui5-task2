sap.ui.define([], () => {
  "use strict";

  return {
    formatYear: function (dateValue) {
      const staticText = "Published: ";
      if (!dateValue) return staticText + "Unknown";

      let oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
        pattern: "yyyy",
      });
      let year = oDateFormat.format(new Date(dateValue));

      return staticText + year;
    },
  };
});
