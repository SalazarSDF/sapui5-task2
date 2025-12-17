sap.ui.define(
  ["sapui5task2/controller/BaseController"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("sapui5task2.controller.Product", {
      onInit: function () {
        if (BaseController.prototype.onInit) {
          BaseController.prototype.onInit.apply(this, arguments);
        }
        this.getRouter()
          .getRoute("productDetail")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
        const sProductID = oEvent.getParameter("arguments").ProductID;
        this.getView().bindElement({
          path: `/Products(${sProductID})`,
          model: "odataV2",
        });
      },

      onNavBack: function () {
        this.getRouter().navTo("odataV2Tab");
      },
    });
  },
);
