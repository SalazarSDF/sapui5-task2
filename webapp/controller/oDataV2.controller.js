sap.ui.define(
  [
    "sapui5task2/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sapui5task2/controller/parts/productV2Types",
  ],
  (BaseController, MessageBox, MessageToast, JSONModel, productV2Types) => {
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

        Object.keys(productV2Types).forEach((type) => {
          productV2Types[type] = productV2Types[type].bind(this);
        });
      },
      productV2Types: productV2Types,

      onProductSelect: function (oEvent) {
        const oTable = oEvent.getSource();
        const aSelectedItems = oTable.getSelectedItems();
        const oViewModel = this.getModel("view");
        oViewModel.setProperty(
          "/selectedRows",
          aSelectedItems.map((item) => item.getBindingContext("odataV2")),
        );
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

      onOpenAddProductDialog: async function () {
        this.oAddDialog ??= await this.loadFragment({
          name: "sapui5task2.fragments.AddProductDialog",
        });

        const oODataModel = this.getModel("odataV2");
        const oInitialProperties = {
          Name: "",
          Description: "",
          ReleaseDate: "",
          DiscontinuedDate: null,
          Rating: 2,
          Price: 0.0,
        };
        const oContext = oODataModel.createEntry("/Products", {
          properties: oInitialProperties,
        });
        this.oAddDialog.setBindingContext(oContext, "odataV2");

        const oDialogProduct = new JSONModel({
          validation: {
            Name: { errorMessage: "", isTouched: false },
            Description: { errorMessage: "", isTouched: false },
            ReleaseDate: { errorMessage: "", isTouched: false },
            DiscontinuedDate: { errorMessage: "", isTouched: false },
            Rating: { errorMessage: "", isTouched: false },
            Price: { errorMessage: "", isTouched: false },
            isValid: false,
          },
        });
        this.oAddDialog.setModel(oDialogProduct, "dialogProduct");
        this.oAddDialog.open();
      },

      onValidateForm: function (oEvent) {
        const oDialogModel = this.oAddDialog.getModel("dialogProduct");
        const oValidation = oDialogModel.getProperty("/validation");

        const oContext = this.oAddDialog.getBindingContext("odataV2");
        const oDialogProduct = oContext.getObject();

        const aFormFields = [
          {
            id: "product_name_input",
            name: "Name",
            value: oDialogProduct.Name,
            validateValue: productV2Types.validateProductName,
          },
          {
            id: "product_description_input",
            name: "Description",
            value: oDialogProduct.Description,
            validateValue: productV2Types.validateProductDescription,
          },
          {
            id: "product_release_date_picker",
            name: "ReleaseDate",
            value: oDialogProduct.ReleaseDate,
            validateValue: productV2Types.validateReleaseDate,
          },
          {
            id: "product_discontinued_date_picker",
            name: "DiscontinuedDate",
            value: oDialogProduct.DiscontinuedDate,
            validateValue: productV2Types.validateDiscontinuedDate,
          },
          {
            id: "product_rating_input",
            name: "Rating",
            value: oDialogProduct.Rating,
            validateValue: productV2Types.validateRating,
          },
          {
            id: "product_price_input",
            name: "Price",
            value: oDialogProduct.Price,
            validateValue: productV2Types.validatePrice,
          },
        ].map((formField) => ({
          ...formField,
          isTouched: oValidation[formField.name].isTouched,
        }));

        const sChangedId = oEvent.getSource().getId().split("--").pop();
        const oChangedField = aFormFields.find(
          (oField) => oField.id === sChangedId,
        );
        oChangedField.isTouched = true;
        oDialogModel.setProperty(
          `/validation/${oChangedField.name}/isTouched`,
          true,
        );

        const errors = {};

        aFormFields.forEach((oField) => {
          const oControl = this.byId(oField.id);
          try {
            oField.validateValue(oField.value);
            if (oField.isTouched) {
              oControl.setValueState("None");
            }
          } catch (oError) {
            if (oField.isTouched) {
              oControl.setValueState("Error");
            }
            oDialogModel.setProperty(
              `/validation/${oField.name}/errorMessage`,
              oError.message,
            );
            errors[oField.name] = oError.message;
          }
        });

        oDialogModel.setProperty(
          `/validation/isValid`,
          Object.keys(errors).length === 0,
        );
      },

      onConfirmAddProduct: function () {
        const oDialogModel = this.oAddDialog.getModel("dialogProduct");

        if (!oDialogModel.getProperty("/validation/isValid")) {
          MessageBox.error(
            this.getResourceBundle().getText("createFailedMessage"),
          );
          return;
        }
        const oContext = this.oAddDialog.getBindingContext("odataV2");

        const oModel = this.getModel("odataV2");
        oModel.submitChanges({
          success: () => {
            MessageToast.show(
              this.getResourceBundle().getText("addSuccessMessage"),
            );
            this.onCloseAddProductDialog();
          },
          error: (oError) => {
            oModel.deleteCreatedEntry(oContext);
            MessageBox.error("Error: " + oError.message);
          },
        });
      },

      onCloseAddProductDialog: function () {
        const oContext = this.oAddDialog.getBindingContext("odataV2");

        if (oContext && oContext.isTransient()) {
          const oModel = this.getModel("odataV2");
          oModel.deleteCreatedEntry(oContext);
        }
        this.oAddDialog.close();
      },
    });
  },
);
