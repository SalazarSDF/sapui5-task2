sap.ui.define(
  [
    "sapui5task2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    SimpleType,
    ValidateException,
    MessageToast,
    MessageBox,
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
          books: aBooks,
        });

        const oViewModel = new JSONModel({
          genres: [],
          isRowsSelected: false,
          filters: {
            title: "",
            genre: "",
          },

          editingBookId: null,
          editMode: false,
        });

        this.setMainModel(oModel);
        this.setModel(oViewModel, "view");
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
        const oViewModel = this.getModel("view");
        const aBooks = oModel.getProperty("/books");

        const aUniqueGenres = [...new Set(aBooks.map((book) => book.Genre))];

        const aGenreItems = [{ key: "", text: "All Genres" }].concat(
          aUniqueGenres.map((genre) => ({
            key: genre,
            text: genre,
          })),
        );

        oViewModel.setProperty("/genres", aGenreItems);
      },

      onOpenAddBookDialog: async function () {
        this.oAddDialog ??= await this.loadFragment({
          name: "sapui5task2.view.fragments.AddBookDialog",
        });

        const oDialogBook = new JSONModel({
          book: {
            Name: "",
            Author: "",
            Genre: "",
            ReleaseDate: new Date().toISOString().split("T")[0],
            AvailableQuantity: 1,
          },
        });
        this.oAddDialog.setModel(oDialogBook, "dialogBook");
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

      onValidateForm: function () {
        const oDialogModel = this.oAddDialog.getModel("dialogBook");
        const oDialogBook = oDialogModel.getProperty("/book");

        const aFields = [
          {
            id: "book_name_input",
            value: oDialogBook.Name,
            type: RequiredStringType,
          },
          {
            id: "book_author_input",
            value: oDialogBook.Author,
            type: AuthorNameType,
          },
          {
            id: "book_genre_input",
            value: oDialogBook.Genre,
            type: RequiredStringType,
          },
          {
            id: "book_release_date_picker",
            value: oDialogBook.ReleaseDate,
            type: RequiredDateType,
          },
          {
            id: "book_quantity_input",
            value: oDialogBook.AvailableQuantity,
            type: RequiredQuantityType,
          },
        ];

        let bIsFormValid = true;

        aFields.forEach((oField) => {
          const oControl = this.byId(oField.id);
          if (oControl) {
            const sValue = oControl.getValue();
            try {
              const oTypeInstance = new oField.type();

              if (oField.value !== sValue) {
                console.groupCollapsed(
                  "%c Расхождение!",
                  "color: red; font-weight: bold;",
                );
                console.log("Control ID: ", oControl.getId());
                console.log("VALUE FROM MODEL = ", oField.value);
                console.log("VALUE FROM VIEW = ", sValue);
                console.groupEnd();
              }

              oTypeInstance.validateValue(sValue);
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

        return bIsFormValid;
      },

      _validateNewBook: function () {
        const oDialogModel = this.oAddDialog.getModel("dialogBook");
        const oDialogBook = oDialogModel.getProperty("/book");

        const { Author, AvailableQuantity, Genre, Name, ReleaseDate } =
          oDialogBook;
        let bIsValid = true;

        try {
          const authorName = new AuthorNameType();
          const requiredString = new RequiredStringType();
          const requiredDate = new RequiredDateType();
          const requiredQuantity = new RequiredQuantityType();

          authorName.validateValue(Author);
          requiredString.validateValue(Genre);
          requiredString.validateValue(Name);
          requiredDate.validateValue(ReleaseDate);
          requiredQuantity.validateValue(AvailableQuantity);
        } catch (e) {
          MessageBox.alert(e.message);
          bIsValid = false;
        }

        return bIsValid;
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

         
        if (!this._validateNewBook()) {
          return;
        }
         
        const oModel = this.getMainModel();
        const oDialogModel = this.oAddDialog.getModel("dialogBook");
        const oDialogBook = oDialogModel.getProperty("/book");

        const aBooks = oModel.getProperty("/books");
        const sNewId = this._generateBookId();

        const oNewBook = {
          ID: sNewId,
          Name: oDialogBook.Name,
          Author: oDialogBook.Author,
          Genre: oDialogBook.Genre,
          ReleaseDate: oDialogBook.ReleaseDate,
          AvailableQuantity: parseInt(oDialogBook.AvailableQuantity),
        };

        aBooks.push(oNewBook);
        oModel.setProperty("/books", aBooks);

        MessageToast.show(
          `New book "${oDialogBook.Name}" added successfully with ID: ${sNewId}`,
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

      onBookSelect: function (oEvent) {
        const oTable = oEvent.getSource();
        const aSelectedItems = oTable.getSelectedItems();
        const oViewModel = this.getModel("view");
        const isRowsSelected = aSelectedItems.length > 0;
        oViewModel.setProperty("/isRowsSelected", isRowsSelected);
      },

      onFilterByTitleAndGenre: function () {
        const oTable = this.byId("booksTable");
        const oBinding = oTable.getBinding("items");

        const oViewModel = this.getModel("view");
        const oFilters = oViewModel.getProperty("/filters");

        const aFilters = [];
        if (oFilters.title) {
          aFilters.push(
            new Filter("Name", FilterOperator.Contains, oFilters.title),
          );
        }

        if (oFilters.genre) {
          aFilters.push(new Filter("Genre", FilterOperator.EQ, oFilters.genre));
        }

        oBinding.filter(aFilters);
      },

      onToggleEdit: function (oEvent) {
        const oButton = oEvent.getSource();
        const oBindingContext = oButton.getBindingContext();
        const oViewModel = this.getModel("view");
        const sID = oBindingContext.getProperty("ID");
        const bCurrentMode = oViewModel.getProperty("/editMode");

        oViewModel.setProperty("/editingBookId", sID);

        if (bCurrentMode) {
          oViewModel.setProperty("/editingBookId", null);
        }

        oViewModel.setProperty("/editMode", !bCurrentMode);
      },

      onOpenCofirmDeleteDialog: async function () {
        this.oDialog ??= await this.loadFragment({
          name: "sapui5task2.view.fragments.DeleteBooksDialog",
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
      },
    });
  },
);
