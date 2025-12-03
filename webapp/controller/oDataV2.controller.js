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
          isRowsSelected: false,
        });

        this.setModel(oViewModel, "view");
      },

      onProductSelect: function (oEvent) {
        const oTable = oEvent.getSource();
        const aSelectedItems = oTable.getSelectedItems();
        const oViewModel = this.getModel("view");
        const isRowsSelected = aSelectedItems.length > 0;
        oViewModel.setProperty("/isRowsSelected", isRowsSelected);
      },

      onDeleteProducts: function () {
        const oTable = this.byId("productsTableV2");
        const aSelectedItems = oTable.getSelectedItems();

        const oModel = this.getView().getModel("odataV2");

        aSelectedItems.forEach((oItem) => {
          const sPath = oItem.getBindingContext("odataV2").getPath();
          oModel.remove(sPath);
        });

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
        oTable.removeSelections();
      },
    });
  },
);
