sap.ui.define(["sapui5task2/controller/BaseController"], (BaseController) => {
  "use strict";
  return BaseController.extend("sapui5task2.controller.Main", {
    onInit() {
      if (BaseController.prototype.onInit) {
        BaseController.prototype.onInit.apply(this, arguments);
      }
      const oRouter = this.getRouter();
      oRouter.getRoute("RouteMain").attachPatternMatched(this._onRouteMatched, this);
      oRouter.getRoute("jsonTab").attachPatternMatched(this._onRouteMatched, this);
      oRouter.getRoute("odataV2Tab").attachPatternMatched(this._onRouteMatched, this);
      oRouter.getRoute("odataV4Tab").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched(oEvent) {
      const sRouteName = oEvent.getParameter("name");
      let sTabKey;
      switch (sRouteName) {
        case "RouteMain":
          this.getRouter().navTo("jsonTab", {}, true);
          return;
        case "jsonTab":
          sTabKey = "json";
          break;
        case "odataV2Tab":
          sTabKey = "odataV2";
          break;
        case "odataV4Tab":
          sTabKey = "odataV4";
          break;
      }
      this.byId("iconTabBar").setSelectedKey(sTabKey);
    },

    onTabSelect(oEvent) {
      const sKey = oEvent.getParameter("key");
      let sRouteName;
      switch (sKey) {
        case "json":
          sRouteName = "jsonTab";
          break;
        case "odataV2":
          sRouteName = "odataV2Tab";
          break;
        case "odataV4":
          sRouteName = "odataV4Tab";
          break;
      }
      this.getRouter().navTo(sRouteName);
    }
  });
});
