sap.ui.define(["sapui5task2/controller/BaseController"], (BaseController) => {
  "use strict";
  return BaseController.extend("sapui5task2.controller.Main", {
    onInit() {
      if (BaseController.prototype.onInit) {
        BaseController.prototype.onInit.apply(this, arguments);
      }
    },
  });
});
