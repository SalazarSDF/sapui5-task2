sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("sapui5task2.controller.Main", {
      onInit() {
        const oBookData = {
          books: [
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
              Name: "The Great Gatsby",
              Author: "F. Scott Fitzgerald",
              Genre: "Classic",
              ReleaseDate: "1925-04-10",
              AvailableQuantity: 5,
            },
            {
              ID: "B004",
              Name: "To Kill a Mockingbird",
              Author: "Harper Lee",
              Genre: "Fiction",
              ReleaseDate: "1960-07-11",
              AvailableQuantity: 3,
            },

            {
              ID: "B005",
              Name: "To Kill a Mockingbird",
              Author: "Harper Lee",
              Genre: "Fiction",
              ReleaseDate: "1960-07-11",
              AvailableQuantity: 0,
            },
          ],
        };

        const oModel = new JSONModel(oBookData);

        this.getView().setModel(oModel);
      },

      onFilterByTitle: function () {
      },

      onAddBook: function () {
        sap.m.MessageToast.show("Add book");
      },

      onDeleteBook: function () {
        sap.m.MessageToast.show("Delete book");
      },
    });
  },
);
