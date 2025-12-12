sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
  "use strict";

  return BaseController.extend("sapui5task2.controller.BaseController", {
    onInit: function () {},

    getModel: function (sName) {
      return this.getView().getModel(sName);
    },

    setModel: function (oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    getResourceBundle: function () {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    getI18nText: function (sText) {
      return this.getOwnerComponent()
        .getModel("i18n")
        .getResourceBundle()
        .getText(sText);
    },

    getMainModel: function () {
      return this.getView().getModel();
    },

    setMainModel: function (oModel) {
      return this.getView().setModel(oModel);
    },

    getRouter: function () {
      return this.getOwnerComponent().getRouter();
    },
  });
});
