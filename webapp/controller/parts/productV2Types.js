sap.ui.define([], () => {
  "use strict";
  return {
    validateProductName: function (oValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      if (!oValue || oValue.trim() === "") {
        throw new Error(oResourceBundle.getText("productNameRequired"));
      }

      if (oValue.trim().length < 5) {
        throw new Error(oResourceBundle.getText("productNameMinLength"));
      }

      if (oValue.trim().length > 100) {
        throw new Error(oResourceBundle.getText("productNameMaxLength"));
      }
    },

    validateProductDescription: function (oValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      if (!oValue || oValue.trim() === "") {
        throw new Error(oResourceBundle.getText("productDescriptionRequired"));
      }

      if (oValue.trim().length < 10) {
        throw new Error(oResourceBundle.getText("productDescriptionMinLength"));
      }

      if (oValue.trim().length > 500) {
        throw new Error(oResourceBundle.getText("productDescriptionMaxLength"));
      }
    },

    validateReleaseDate: function (oValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      if (!oValue) {
        throw new Error(oResourceBundle.getText("releaseDateRequired"));
      }

      const selectedDate = new Date(oValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        throw new Error(oResourceBundle.getText("releaseDateNotFuture"));
      }

      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 50);
      if (selectedDate < minDate) {
        throw new Error(oResourceBundle.getText("releaseDateTooPast"));
      }
    },

    validateDiscontinuedDate: function (oValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      // if empty, validation passes
      if (!oValue) {
        return;
      }

      const discontinuedDate = new Date(oValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (discontinuedDate > today) {
        throw new Error(oResourceBundle.getText("discontinuedDateNotFuture"));
      }
    },

    validateRating: function (oValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      if (oValue === undefined || oValue === null || oValue === "") {
        throw new Error(oResourceBundle.getText("ratingRequired"));
      }

      const rating = parseFloat(oValue);

      if (isNaN(rating)) {
        throw new Error(oResourceBundle.getText("ratingMustBeNumber"));
      }

      if (rating < 1) {
        throw new Error(oResourceBundle.getText("ratingMin"));
      }

      if (rating > 5) {
        throw new Error(oResourceBundle.getText("ratingMax"));
      }
    },

    validatePrice: function (oValue) {
      const oResourceBundle = this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle();

      if (oValue === undefined || oValue === null || oValue === "") {
        throw new Error(oResourceBundle.getText("priceRequired"));
      }

      const price = parseFloat(oValue);

      if (isNaN(price)) {
        throw new Error(oResourceBundle.getText("priceMustBeNumber"));
      }

      if (price <= 0) {
        throw new Error(oResourceBundle.getText("pricePositive"));
      }

      if (price > 1000000) {
        throw new Error(oResourceBundle.getText("priceTooHigh"));
      }

      const decimalPart = oValue.toString().split(".")[1];
      if (decimalPart && decimalPart.length > 2) {
        throw new Error(oResourceBundle.getText("priceTwoDecimals"));
      }
    },

    validateProductForm: function (oProduct) {
      const errors = {};

      try {
        this.validateProductName(oProduct.Name);
      } catch (e) {
        errors.Name = e.message;
      }

      try {
        this.validateProductDescription(oProduct.Description);
      } catch (e) {
        errors.Description = e.message;
      }

      try {
        this.validateReleaseDate(oProduct.ReleaseDate);
      } catch (e) {
        errors.ReleaseDate = e.message;
      }

      try {
        this.validateDiscontinuedDate(
          oProduct.DiscontinuedDate,
          oProduct.ReleaseDate,
        );
      } catch (e) {
        errors.DiscontinuedDate = e.message;
      }

      try {
        this.validateRating(oProduct.Rating);
      } catch (e) {
        errors.Rating = e.message;
      }

      try {
        this.validatePrice(oProduct.Price);
      } catch (e) {
        errors.Price = e.message;
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors: errors,
      };
    },
  };
});
