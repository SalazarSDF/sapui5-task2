sap.ui.define([], () => {
  "use strict";
  return {
    authorNameValidation: function (oValue) {
      if (!oValue || oValue.trim() === "") {
        throw new Error("Author name is required");
      }
      const digitRegex = /\d/;
      if (digitRegex.test(oValue)) {
        throw new Error("Author name cannot contain digits");
      }
      if (oValue.trim().length < 2) {
        throw new Error(
          "Author name must be at least 2 characters long",
        );
      }
    },

    requiredStringValidation: function (oValue) {
      if (!oValue || oValue.trim() === "") {
        throw new Error("This field is required");
      }

      if (oValue.trim().length < 2) {
        throw new Error("Must be at least 2 characters long");
      }
    },

    requiredDateValidation: function (oValue) {
      if (!oValue) {
        throw new Error("Date is required");
      }

      const selectedDate = new Date(oValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        throw new Error("Release date cannot be in the future");
      }
    },

    requiredQuantityValidation: function (oValue) {
      if (oValue === undefined || oValue === null) {
        throw new Error("Quantity is required");
      }

      if (oValue < 1) {
        throw new Error("Quantity must be at least 1");
      }

      if (oValue > 1000) {
        throw new Error("Quantity cannot exceed 1000");
      }

      if (!Number.isInteger(oValue)) {
        throw new Error("Quantity must be a whole number");
      }
    },
  };
});
