sap.ui.define(
  [
    "sapui5task2/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
  ],
  (BaseController, MessageBox, MessageToast, JSONModel) => {
    "use strict";
    return BaseController.extend("sapui5task2.controller.oDataV2", {
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
        const aSelectedItems = oTable.getSelectedItems();
        const oViewModel = this.getModel("view");
        oViewModel.setProperty("/selectedRows", aSelectedItems.map(item => item.getBindingContext("odataV2")));
      },

      onDeleteProducts: function () {

        const oModel = this.getView().getModel("odataV2");
        const viewModel = this.getModel("view");

        const aSelectedItems = viewModel.getProperty("/selectedRows");
        aSelectedItems.forEach((oItem) => {
          oItem.delete();
        });
        viewModel.setProperty("/selectedRows", []);

        oModel.submitChanges({
          success: () => {
            MessageToast.show(
              this.getResourceBundle().getText("deleteSuccessMessage", [
                aSelectedItems.length,
              ]),
            );
          },
          error: (oError) => {
            MessageBox.error(
              this.getResourceBundle().getText("deleteFailedMessage") +
                ": " +
                oError.message,
            );
          },
        });
      },
    });
  },
);
