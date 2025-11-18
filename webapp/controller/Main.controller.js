sap.ui.define(
  [
    "sapui5task2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/m/MessageToast",
  ],
  (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    SimpleType,
    ValidateException,
    MessageToast,
  ) => {
    "use strict";

    const AuthorNameType = SimpleType.extend("AuthorNameType", {
      formatValue: function (oValue) {
        return oValue;
      },
      parseValue: function (oValue) {
        return oValue;
      },
      validateValue: function (oValue) {
        if (!oValue || oValue.trim() === "") {
          throw new ValidateException("Author name is required");
        }

        const digitRegex = /\d/;
        if (digitRegex.test(oValue)) {
          throw new ValidateException("Author name cannot contain digits");
        }

        if (oValue.trim().length < 2) {
          throw new ValidateException(
            "Author name must be at least 2 characters long",
          );
        }
      },
    });

    const RequiredStringType = SimpleType.extend("RequiredStringType", {
      formatValue: function (oValue) {
        return oValue;
      },
      parseValue: function (oValue) {
        return oValue;
      },
      validateValue: function (oValue) {
        if (!oValue || oValue.trim() === "") {
          throw new ValidateException("This field is required");
        }

        if (oValue.trim().length < 2) {
          throw new ValidateException("Must be at least 2 characters long");
        }
      },
    });

    const RequiredDateType = SimpleType.extend("RequiredDateType", {
      formatValue: function (oValue) {
        return oValue;
      },
      parseValue: function (oValue) {
        return oValue;
      },
      validateValue: function (oValue) {
        if (!oValue) {
          throw new ValidateException("Date is required");
        }

        const selectedDate = new Date(oValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
          throw new ValidateException("Release date cannot be in the future");
        }
      },
    });

    const RequiredQuantityType = SimpleType.extend("RequiredQuantityType", {
      formatValue: function (oValue) {
        return oValue;
      },
      parseValue: function (oValue) {
        return oValue;
      },
      validateValue: function (oValue) {
        if (oValue === undefined || oValue === null) {
          throw new ValidateException("Quantity is required");
        }

        if (oValue < 1) {
          throw new ValidateException("Quantity must be at least 1");
        }

        if (oValue > 1000) {
          throw new ValidateException("Quantity cannot exceed 1000");
        }

        if (!Number.isInteger(oValue)) {
          throw new ValidateException("Quantity must be a whole number");
        }
      },
    });

    return BaseController.extend("sapui5task2.controller.Main", {
      onInit() {
        if (BaseController.prototype.onInit) {
          BaseController.prototype.onInit.apply(this, arguments);
        }

        const aBooks = [
          {
            ID: "B001",
            Name: "The Great Gatsby",
            Author: "F. Scott Fitzgerald",
            Genre: "Classic",
            ReleaseDate: "1925-04-10",
            AvailableQuantity: 5,
          },
          {
            ID: "B002",
            Name: "To Kill a Mockingbird",
            Author: "Harper Lee",
            Genre: "Fiction",
            ReleaseDate: "1960-07-11",
            AvailableQuantity: 3,
          },

          {
            ID: "B003",
            Name: "The Midnight Library",
            Author: "Matt Haig",
            Genre: "Fantasy",
            ReleaseDate: "2020-08-13",
            AvailableQuantity: 7,
          },
          {
            ID: "B004",
            Name: "Project Hail Mary",
            Author: "Andy Weir",
            Genre: "Science Fiction",
            ReleaseDate: "2021-05-04",
            AvailableQuantity: 4,
          },
          {
            ID: "B005",
            Name: "Where the Crawdads Sing",
            Author: "Delia Owens",
            Genre: "Mystery",
            ReleaseDate: "2018-08-14",
            AvailableQuantity: 6,
          },
        ];

        const oModel = new JSONModel({
          books: aBooks.map((book) => ({ ...book, editMode: false })),
        });

        const oDialogModel = new JSONModel({
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: new Date().toISOString().split("T")[0],
          AvailableQuantity: 1,
        });

        this.setMainModel(oModel);
        this.setModel(oDialogModel, "dialog");
        this._initializeGenres();
      },

      types: {
        authorName: AuthorNameType,
        requiredString: RequiredStringType,
        requiredDate: RequiredDateType,
        requiredQuantity: RequiredQuantityType,
      },

      _initializeGenres: function () {
        const oModel = this.getMainModel();
        const aBooks = oModel.getProperty("/books");

        const aUniqueGenres = [...new Set(aBooks.map((book) => book.Genre))];

        const aGenreItems = [{ key: "", text: "All Genres" }].concat(
          aUniqueGenres.map((genre) => ({
            key: genre,
            text: genre,
          })),
        );

        oModel.setProperty("/genres", aGenreItems);
      },

      onOpenAddBookDialog: async function () {
        const oDialogModel = this.getModel("dialog");
        oDialogModel.setData({
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: new Date().toISOString().split("T")[0],
          AvailableQuantity: 1,
        });

        this.oAddDialog ??= await this.loadFragment({
          name: "sapui5task2.view.AddBookDialog",
        });

        this.byId("dialog_button_on_confirm_add").setEnabled(false);
        this._resetValidationStates();

        this.oAddDialog.open();
      },

      _resetValidationStates: function () {
        const aInputIds = [
          "book_name_input",
          "book_author_input",
          "book_genre_input",
          "book_release_date_picker",
          "book_quantity_input",
        ];

        aInputIds.forEach((sId) => {
          const oControl = this.byId(sId);
          if (oControl) {
            oControl.setValueState("None");
          }
        });
      },

      onValidateField: function (oEvent) {
        const oSource = oEvent.getSource();
        const sValue = oSource.getValue();

        try {
          if (oSource.getBinding("value")) {
            const oBinding = oSource.getBinding("value");
            if (oBinding && oBinding.type && oBinding.type.validateValue) {
              oBinding.type.validateValue(sValue);
              oSource.setValueState("None");
            }
          }
        } catch (oError) {
          oSource.setValueState("Error");
          if (oError.message) {
            oSource.setValueStateText(oError.message);
          }
        }

        this._validateForm();
      },

      _validateForm: function () {
        const oDialogModel = this.getModel("dialog");
        const oData = oDialogModel.getData();

        const aFields = [
          {
            id: "book_name_input",
            value: oData.Name,
            type: RequiredStringType,
          },
          {
            id: "book_author_input",
            value: oData.Author,
            type: AuthorNameType,
          },
          {
            id: "book_genre_input",
            value: oData.Genre,
            type: RequiredStringType,
          },
          {
            id: "book_release_date_picker",
            value: oData.ReleaseDate,
            type: RequiredDateType,
          },
          {
            id: "book_quantity_input",
            value: oData.AvailableQuantity,
            type: RequiredQuantityType,
          },
        ];

        let bIsFormValid = true;

        aFields.forEach((oField) => {
          const oControl = this.byId(oField.id);
          if (oControl) {
            try {
              const oTypeInstance = new oField.type();
              oTypeInstance.validateValue(oField.value);
              oControl.setValueState("None");
            } catch (oError) {
              oControl.setValueState("Error");
              if (oError.message) {
                oControl.setValueStateText(oError.message);
              }
              bIsFormValid = false;
            }
          }
        });

        this.byId("dialog_button_on_confirm_add").setEnabled(bIsFormValid);
      },

      _generateBookId: function () {
        const oModel = this.getMainModel();
        const aBooks = oModel.getProperty("/books");

        let iMaxId = 0;
        aBooks.forEach((oBook) => {
          const sId = oBook.ID;
          if (sId && sId.startsWith("B")) {
            const iCurrentId = parseInt(sId.substring(1));
            if (iCurrentId > iMaxId) {
              iMaxId = iCurrentId;
            }
          }
        });

        return "B" + String(iMaxId + 1).padStart(3, "0");
      },

      onConfirmAddBook: function () {
        const oDialogModel = this.getModel("dialog");
        const oNewBookData = oDialogModel.getData();
        const oModel = this.getMainModel();
        const aBooks = oModel.getProperty("/books");

        const sNewId = this._generateBookId();

        const oNewBook = {
          ID: sNewId,
          Name: oNewBookData.Name,
          Author: oNewBookData.Author,
          Genre: oNewBookData.Genre,
          ReleaseDate: oNewBookData.ReleaseDate,
          AvailableQuantity: parseInt(oNewBookData.AvailableQuantity),
          editMode: false,
        };

        aBooks.push(oNewBook);
        oModel.setProperty("/books", aBooks);

        MessageToast.show(
          `New book "${oNewBookData.Name}" added successfully with ID: ${sNewId}`,
        );
        this.onCloseAddBookDialog();
      },

      onCloseAddBookDialog: function () {
        if (this.oAddDialog) {
          this.oAddDialog.close();
        }
      },

      onDeleteBook: function () {
        const oTable = this.byId("booksTable");
        const aSelectedItemsIds = oTable
          .getSelectedItems()
          .map((item) => item.getBindingContext().getProperty("ID"));

        const oModel = this.getMainModel();
        const aBooks = oModel.getProperty("/books");

        const filteredBooks = aBooks.filter(
          (book) => !aSelectedItemsIds.includes(book["ID"]),
        );
        oModel.setProperty("/books", filteredBooks);

        MessageToast.show("Deleted");
      },

      onBookSelect: function () {
        const oTable = this.byId("booksTable");
        const aSelectedItems = oTable.getSelectedItems();
        const oDeleteButton = this.byId("delete_book_button");

        oDeleteButton.setEnabled(aSelectedItems.length > 0);
      },

      onFilterByTitleAndGenre: function () {
        const oTable = this.byId("booksTable");
        const oBinding = oTable.getBinding("items");

        const aFilters = [];

        const sTitle = this.byId("search_book_input").getValue();
        if (sTitle) {
          aFilters.push(new Filter("Name", FilterOperator.Contains, sTitle));
        }

        const sGenre = this.byId("select_genre_select").getSelectedKey();
        if (sGenre) {
          aFilters.push(new Filter("Genre", FilterOperator.EQ, sGenre));
        }
        oBinding.filter(aFilters);
      },

      onEditTitle: function (oEvent) {
        const oBindingContext = oEvent.getSource().getBindingContext();
        const oModel = this.getMainModel();
        const sPath = oBindingContext.getPath();

        oModel.setProperty(sPath + "/editMode", true);
      },

      onSaveTitle: function (oEvent) {
        const oBindingContext = oEvent.getSource().getBindingContext();
        const oModel = this.getMainModel();
        const sPath = oBindingContext.getPath();

        oModel.setProperty(sPath + "/editMode", false);
      },

      onOpenCofirmDeleteDialog: async function () {
        this.oDialog ??= await this.loadFragment({
          name: "sapui5task2.view.DeleteBooksDialog",
        });

        this.oDialog.open();
      },

      onConfirmDeleteBooks: function () {
        this.onDeleteBook();
        this.onCloseDeleteBooksDialog();
      },

      onCloseDeleteBooksDialog: function () {
        this.byId("delete_books_dialog").close();
        this.byId("booksTable").removeSelections();
        this.byId("delete_book_button").setEnabled(false);
      },
    });
  },
);
