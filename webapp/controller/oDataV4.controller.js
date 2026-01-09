sap.ui.define(
  [
    "sapui5task2/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sapui5task2/controller/parts/productV2Types",
  ],
  (BaseController, MessageBox, MessageToast, JSONModel, productTypes) => {
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

        Object.keys(productTypes).forEach((type) => {
          productTypes[type] = productTypes[type].bind(this);
        });
      },

      productTypes: productTypes,

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

      onOpenProductDialog: async function (sMode = "add", oContext = null) {
        this.oProductDialog ??= await this.loadFragment({
          name: "sapui5task2.fragments.ProductDialogV4",
        });

        const oModel = this.getModel("odataV4");
        if (sMode === "add") {
          const oCreateBinding = oModel.bindList(
            "/Products",
            undefined,
            undefined,
            undefined,
            {
              $$updateGroupId: "createGroup",
            },
          );
          const oInitialProperties = {
            Name: "",
            Description: "",
            ReleaseDate: null,
            DiscontinuedDate: null,
            Rating: 2,
            Price: 0.0,
          };
          oContext = await oCreateBinding.create(oInitialProperties);
        }

        this.oProductDialog.setBindingContext(oContext, "odataV4");

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
      },
      onValidateForm: function (oEvent, bForce) {
        const oDialogModel = this.oProductDialog.getModel("dialogProduct");
        const oValidation = oDialogModel.getProperty("/validation");
        const oContext = this.oProductDialog.getBindingContext("odataV4");
        const oDialogProduct = oContext.getObject();
        const aFormFields = [
          {
            id: "product_name_input_V4",
            name: "Name",
            value: oDialogProduct.Name,
            validateValue: this.productTypes.validateProductName,
          },
          {
            id: "product_description_input_V4",
            name: "Description",
            value: oDialogProduct.Description,
            validateValue: this.productTypes.validateProductDescription,
          },
          {
            id: "product_release_date_picker_V4",
            name: "ReleaseDate",
            value: oDialogProduct.ReleaseDate,
            validateValue: this.productTypes.validateReleaseDate,
          },
          {
            id: "product_discontinued_date_picker_V4",
            name: "DiscontinuedDate",
            value: oDialogProduct.DiscontinuedDate,
            validateValue: this.productTypes.validateDiscontinuedDate,
          },
          {
            id: "product_rating_input_V4",
            name: "Rating",
            value: oDialogProduct.Rating,
            validateValue: this.productTypes.validateRating,
          },
          {
            id: "product_price_input_V4",
            name: "Price",
            value: oDialogProduct.Price,
            validateValue: this.productTypes.validatePrice,
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
        const oContext = this.oProductDialog.getBindingContext("odataV4");
        const oModel = this.getModel("odataV4");
        const oListBinding = this.byId("products_table_V4").getBinding("items");

        const sBatchGroup = sMode === "add" ? "createGroup" : "editGroup";

        oModel
          .submitBatch(sBatchGroup)
          .then(() => {
            MessageToast.show(
              this.getI18nText(
                sMode === "add" ? "addSuccessMessage" : "editSuccessMessage",
              ),
            );
            this.onCloseProductDialog();
            oListBinding.refresh();
          })
          .catch((oError) => {
            if (sMode === "add" ) {
              oContext.delete(sBatchGroup);
            }
            MessageBox.error(
              this.getI18nText(
                sMode === "add" ? "addFailedMessage" : "editFailedMessage",
              ) +
                ": " +
                oError.message,
            );
          });
      },
      onCloseProductDialog: function () {
        const oContext = this.oProductDialog.getBindingContext("odataV4");
        const oDialogModel = this.oProductDialog.getModel("dialogProduct");
        const sMode = oDialogModel.getProperty("/mode");

        if (sMode === "add") {
          oContext.delete("createGroup");
        } else if (sMode == "edit") {
          oContext.resetChanges();
        }
        this.oProductDialog.close();
      },

      onEditProduct: function (oEvent) {
        const oItem = oEvent.getSource().getParent();
        const oContext = oItem.getBindingContext("odataV4");
        this.onOpenProductDialog("edit", oContext);
      },
    });
  },
);
