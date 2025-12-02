sap.ui.define(
  [
    "sapui5task2/controller/BaseController",
    "sapui5task2/controller/parts/types",
    "sapui5task2/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
  ],
  (BaseController, types, Formatter, JSONModel, Filter, FilterOperator, MessageToast) => {
    "use strict";
    return BaseController.extend("sapui5task2.controller.JSON", {
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

        const oViewModel = new JSONModel({
          genres: [],
          isRowsSelected: false,
          filters: {
            title: "",
            genre: "",
          },
        });

        this.setMainModel(oModel);
        this.setModel(oViewModel, "view");
        this._initializeGenres();

        Object.keys(types).forEach((type) => {
          types[type] = types[type].bind(this);
        });
      },

      types: types,

      formatter: Formatter,

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
          name: "sapui5task2.fragments.AddBookDialog",
        });

        const oDialogBook = new JSONModel({
          book: {
            Name: "",
            Author: "",
            Genre: "",
            ReleaseDate: new Date().toISOString().split("T")[0],
            AvailableQuantity: 1,
            editMode: false,
          },
          validation: {
            Name: "",
            Author: "",
            Genre: "",
            ReleaseDate: "",
            AvailableQuantity: "",
          },
        });
        this.oAddDialog.setModel(oDialogBook, "dialogBook");
        this.oAddDialog.open();
      },

      onValidateForm: function () {
        const oDialogModel = this.oAddDialog.getModel("dialogBook");
        const oDialogBook = oDialogModel.getProperty("/book");

        const aFormFields = [
          {
            id: "book_name_input",
            name: "Name",
            value: oDialogBook.Name,
            validateValue: types.validateStringField,
          },
          {
            id: "book_author_input",
            name: "Author",
            value: oDialogBook.Author,
            validateValue: types.validateAuthorName,
          },
          {
            id: "book_genre_input",
            name: "Genre",
            value: oDialogBook.Genre,
            validateValue: types.validateStringField,
          },
          {
            id: "book_release_date_picker",
            name: "ReleaseDate",
            value: oDialogBook.ReleaseDate,
            validateValue: types.validateDateField,
          },
          {
            id: "book_quantity_input",
            name: "AvailableQuantity",
            value: oDialogBook.AvailableQuantity,
            validateValue: types.validateQuatityField,
          },
        ];

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
          }
        });
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
        const oModel = this.getMainModel();
        const oDialogModel = this.oAddDialog.getModel("dialogBook");
        const oDialogBook = oDialogModel.getProperty("/book");

        const aBooks = oModel.getProperty("/books");
        const sNewId = this._generateBookId();

        aBooks.push({ ...oDialogBook, ID: sNewId });
        oModel.setProperty("/books", aBooks);

        MessageToast.show(
          `New book "${oDialogBook.Name}" added successfully with ID: ${sNewId}`,
        );

        this.oAddDialog.close();
      },

      onCloseAddBookDialog: function () {
        this.oAddDialog.close();
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
        const oBindingContext = oEvent.getSource().getBindingContext();
        const bCurrentEditMode = oBindingContext.getProperty("editMode");
        oBindingContext.setProperty("editMode", !bCurrentEditMode);
      },

      onOpenCofirmDeleteDialog: async function () {
        this.oDialog ??= await this.loadFragment({
          name: "sapui5task2.fragments.DeleteBooksDialog",
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
