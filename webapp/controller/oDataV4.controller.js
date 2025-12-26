sap.ui.define(
  [
    "sapui5task2/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
  ],
  (BaseController, MessageBox, MessageToast, JSONModel) => {
    "use strict";
    return BaseController.extend("sapui5task2.controller.oDataV4", {
      onInit() {
        if (BaseController.prototype.onInit) {
          BaseController.prototype.onInit.apply(this, arguments);
        }
        const oViewModel = new JSONModel({
          selectedRows: [],
        });
        this.setModel(oViewModel, "view");
      },

      onProductSelect: function (oEvent) {
        const oTable = oEvent.getSource();
        const aSelectedItems = oTable.getSelectedContexts();
        const oViewModel = this.getModel("view");
        oViewModel.setProperty("/selectedRows", aSelectedItems);
      },

      onDeleteProducts: function () {
        const oModel = this.getModel("odataV4");
        const oViewModel = this.getModel("view");
        const aSelectedContexts = oViewModel.getProperty("/selectedRows");
        const iCount = aSelectedContexts.length;

        if (iCount === 0) {
          return;
        }

        aSelectedContexts.forEach((oContext) => {
          oContext.delete("deleteGroup");
        });

        oModel
          .submitBatch("deleteGroup")
          .then(() => {
            MessageToast.show(
              this.getI18nText("deleteSuccessMessage", [iCount]),
            );
            oViewModel.setProperty("/selectedRows", []);
          })
          .catch((oError) => {
            MessageBox.error(
              this.getI18nText("deleteFailedMessage") + ": " + oError.message,
            );
          });
      },
    });
  },
);
