sap.ui.define(
  [
    "sapui5task2/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sapui5task2/controller/parts/productV2Types",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (
    BaseController,
    MessageBox,
    MessageToast,
    JSONModel,
    productV2Types,
    Filter,
    FilterOperator,
  ) => {
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

        this.resourceBundle = this.getResourceBundle();
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
              this.getI18nText("deleteSuccessMessage", [aSelectedItems.length]),
            );
          },
          error: (oError) => {
            MessageBox.error(
              this.getI18nText("deleteFailedMessage") + ": " + oError.message,
            );
          },
        });
      },

      onOpenProductDialog: async function (sMode, oContext = null) {
        this.oProductDialog ??= await this.loadFragment({
          name: "sapui5task2.fragments.ProductDialog",
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

        if (sMode === "add") {
          oContext = oODataModel.createEntry("/Products", {
            properties: oInitialProperties,
          });
        }
        this.oProductDialog.setBindingContext(oContext, "odataV2");

        const oDialogProduct = new JSONModel({
          mode: sMode,
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
        this.oProductDialog.setModel(oDialogProduct, "dialogProduct");
        this.oProductDialog.open();
        this.onValidateForm();
      },

      onValidateForm: function (oEvent, bForce) {
        const oDialogModel = this.oProductDialog.getModel("dialogProduct");
        const oValidation = oDialogModel.getProperty("/validation");

        const oContext = this.oProductDialog.getBindingContext("odataV2");
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

        if (oEvent) {
          const sChangedId = oEvent.getSource().getId().split("--").pop();
          const oChangedField = aFormFields.find(
            (oField) => oField.id === sChangedId,
          );
          if (oChangedField) {
            oChangedField.isTouched = true;
            oDialogModel.setProperty(
              `/validation/${oChangedField.name}/isTouched`,
              true,
            );
          }
        }
        if (bForce) {
          aFormFields.forEach((oField) => {
            oField.isTouched = true;
            oDialogModel.setProperty(
              `/validation/${oField.name}/isTouched`,
              true,
            );
          });
        }

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

      onConfirmProduct: function () {
        this.onValidateForm(null, true);

        const oDialogModel = this.oProductDialog.getModel("dialogProduct");

        if (!oDialogModel.getProperty("/validation/isValid")) {
          MessageBox.error(this.getI18nText("saveFailedMessage"));
          return;
        }

        const sMode = oDialogModel.getProperty("/mode");
        const oContext = this.oProductDialog.getBindingContext("odataV2");
        const oModel = this.getModel("odataV2");

        oModel.submitChanges({
          success: () => {
            MessageToast.show(
              this.getI18nText(
                sMode === "add" ? "addSuccessMessage" : "editSuccessMessage",
              ),
            );
            this.onCloseProductDialog();
          },
          error: (oError) => {
            oModel.deleteCreatedEntry(oContext);
            MessageBox.error("Error: " + oError.message);
          },
        });
      },

      onCloseProductDialog: function () {
        const oContext = this.oProductDialog.getBindingContext("odataV2");
        const oModel = this.getModel("odataV2");

        if (oContext && oContext.isTransient()) {
          oModel.deleteCreatedEntry(oContext);
        } else {
          oModel.resetChanges();
        }
        this.oProductDialog.close();
      },

      onEditProduct: function (oEvent) {
        const oItem = oEvent.getSource().getParent();
        const oContext = oItem.getBindingContext("odataV2");
        this.onOpenProductDialog("edit", oContext);
      },

      onFilterProducts: function (oEvent) {
        const sQuery = oEvent.getParameter("newValue");
        const oTable = this.byId("products_table_V2");
        const oBinding = oTable.getBinding("items");

        if (sQuery) {
          const oFilter = new Filter("Name", FilterOperator.Contains, sQuery);
          oBinding.filter(oFilter);
          return;
        }
        oBinding.filter([]);
      },
    });
  },
);
