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

        const oDialogProduct = new JSONModel({
          product: {
            Name: "",
            Description: "",
            ReleaseDate: new Date().toISOString().split("T")[0],
            DiscontinuedDate: null,
            Rating: 2.5,
            Price: 0.0,
          },
          validation: {
            Name: "",
            Description: "",
            ReleaseDate: "",
            DiscontinuedDate: null,
            Rating: 2.5,
            Price: 0.0,
            isValid: false,
          },
        });
        this.oAddDialog.setModel(oDialogProduct, "dialogProduct");
        this.oAddDialog.open();
      },

      onValidateForm: function () {
        const oDialogModel = this.oAddDialog.getModel("dialogProduct");
        const oDialogProduct = oDialogModel.getProperty("/product");
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
        ];

        const errors = {};

        aFormFields.forEach((oField) => {
          const oControl = this.byId(oField.id);
          try {
            oField.validateValue(oField.value);
            oControl.setValueState("None");
          } catch (oError) {
            oControl.setValueState("Error");
            oDialogModel.setProperty(
              `/validation/${oField.name}`,
              oError.message,
            );
            errors[oField.name] = oError.message;
          }
        });

        oDialogModel.setProperty(`/validation/isValid`, Object.keys(errors).length === 0);
      },

      onConfirmAddProduct: function () {
        const oDialogModel = this.oAddDialog.getModel("dialogProduct");
        const oDialogProduct = oDialogModel.getProperty("/product");

        const oNewProduct = {
          Name: oDialogProduct.Name,
          Description: oDialogProduct.Description,
          ReleaseDate: new Date(oDialogProduct.ReleaseDate),
          DiscontinuedDate: oDialogProduct.DiscontinuedDate
            ? new Date(oDialogProduct.DiscontinuedDate)
            : null,
          Price: parseFloat(oDialogProduct.Price),
          Rating: parseFloat(oDialogProduct.Rating),
        };

        const oModel = this.getModel("odataV2");
        oModel.create("/Products", oNewProduct, {
          success: () => {
            MessageToast.show(
              this.getResourceBundle().getText("addSuccessMessage"),
            );
            this.onCloseAddProductDialog();
          },
          error: (oError) => {
            MessageBox.error("Error: " + oError.message);
          },
        });
      },

      onCloseAddProductDialog: function () {
        this.oAddDialog.close();
      },
    });
  },
);
