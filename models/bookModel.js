const BaseSQLModel = require("./baseSQLModel");
const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);

// Create a new class for a specific table
class bookModel extends BaseSQLModel {

  constructor() {
    super("book"); //table 'book'
  }

  //check if there is a record of Book in the database?
  // if there is no Book record, call setinitialItems() to define intial
  async defineInitialItems() {
    const results = await this.findAll()
      .then((results) => {
        if (results[0] == undefined) {
          this.setIniBook();
        } else {
          console.log("All books:", results);
        }
      })
      .catch((error) => {
        console.error("Error retrieving users:", error);
      });

    return results;
  }

  async setIniBook() {
    try {
      // Read the content of the SQL file
      const queryPath = '../Sql/book.sql'; // Update with the correct path
      const query = await readFileAsync(queryPath, 'utf-8');
  
      // Execute the query
      const results = await this.executeQuery(query);
  
      return results;
    } catch (error) {
      console.error('Error executing SQL query:', error.message);
      throw error;
    }
  }

  async setinitialItems() {
    const item2 = {
      name: "Hit the + button to add a new item",
    };
    const item3 = {
      name: "<--- Hit this to delete an item",
    };

    const defaultItems = [item1, item2, item3];

    defaultItems.forEach((item) =>
      this.create(item)
        .then((insertId) => {
          console.log("New user created with ID:", insertId);
        })
        .catch((error) => {
          console.error("Error creating user:", error);
        })
    );
  }

}

const bookDB = new bookModel();

module.exports = bookDB;