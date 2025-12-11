sap.ui.define(["sapui5task2/controller/BaseController"], (BaseController) => {
  "use strict";
  return BaseController.extend("sapui5task2.controller.Main", {
    onInit() {
      if (BaseController.prototype.onInit) {
        BaseController.prototype.onInit.apply(this, arguments);
      }
      const oRouter = this.getRouter();
      oRouter.getRoute("RouteMain").attachPatternMatched(this._onRouteMatched, this);
      oRouter.getRoute("tab").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched(oEvent) {
      const oArguments = oEvent.getParameter("arguments");
      const sTabKey = oArguments.tabKey || "json";
      this.byId("iconTabBar").setSelectedKey(sTabKey);
    },

    onTabSelect(oEvent) {
      const sKey = oEvent.getParameter("key");
      this.getRouter().navTo("tab", { tabKey: sKey });
    },
  });
});
