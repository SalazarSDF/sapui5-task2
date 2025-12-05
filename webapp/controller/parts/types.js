sap.ui.define([], () => {
  "use strict";
  return {
    validateAuthorName: function (oValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      if (!oValue || oValue.trim() === "") {
        throw new Error(oResourceBundle.getText("authorNameRequired"));
      }
      const digitRegex = /\d/;
      if (digitRegex.test(oValue)) {
        throw new Error(oResourceBundle.getText("authorNameNoDigits"));
      }
      if (oValue.trim().length < 2) {
        throw new Error(oResourceBundle.getText("authorNameMinLength"));
      }
    },

    validateStringField: function (oValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      if (!oValue || oValue.trim() === "") {
        throw new Error(oResourceBundle.getText("fieldRequired"));
      }

      if (oValue.trim().length < 2) {
        throw new Error(oResourceBundle.getText("fieldMinLength"));
      }
    },

    validateDateField: function (oValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      if (!oValue) {
        throw new Error(oResourceBundle.getText("dateRequired"));
      }

      const selectedDate = new Date(oValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        throw new Error(oResourceBundle.getText("dateNotFuture"));
      }
    },
  };
});
