sap.ui.define(
  [
    "sapui5task2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  (BaseController, JSONModel, Filter, FilterOperator) => {
    "use strict";

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

        this.setMainModel(oModel);
        this._initializeGenres();
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

      onAddBook: function () {
        const oModel = this.getMainModel();
        const aBooks = oModel.getProperty("/books");

        const oNewBook = {
          ID: "B" + String(aBooks.length + 1).padStart(3, "0"),
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: new Date().toISOString().split("T")[0],
          AvailableQuantity: 1,
          editMode: true,
        };

        aBooks.push(oNewBook);
        oModel.setProperty("/books", aBooks);

        sap.m.MessageToast.show("new book Added");
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

        sap.m.MessageToast.show("Deleted");
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
        this.byId("booksTable").removeSelections();;
        this.byId("delete_book_button").setEnabled(false);
      },
    });
  },
);
