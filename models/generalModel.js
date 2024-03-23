const BaseSQLModel = require("./baseSQLModel");
const db = require("./dbConn");

class GeneralModel extends BaseSQLModel {
  constructor() {
    super();
    this.connection = db;
  }

  async getAllBooks() {
    const query = `
        SELECT
            book_id,
            title,
            author,
            genre,
            plot,
            base_price,
            discount_percent,
            sell_price,
            cover_img,
            created_at
        FROM
            book;
    `;
    return this.executeQuery(query);
}

  async getCategoriesWithBooks() {
    const query = `
      SELECT
        c.category_name,
        b.book_id,
        b.title,
        b.author,
        b.genre,
        b.plot,
        b.base_price,
        b.discount_percent,
        b.sell_price,
        b.cover_img,
        b.created_at
      FROM
        category_order co
      JOIN
        category c ON co.category_id = c.category_id
      LEFT JOIN
        book_category bc ON c.category_id = bc.category_id
      LEFT JOIN
        book b ON bc.book_id = b.book_id
      ORDER BY
        co.order_num, b.book_id;
    `;
    return this.executeQuery(query);
  }
  async getBooksWithNoCatagory() {
    const query = `
    SELECT
    b.book_id,
    b.title,
    b.author,
    b.genre,
    b.plot,
    b.base_price,
    b.discount_percent,
    b.sell_price,
    b.cover_img,
    b.created_at
  FROM
    book b
  LEFT JOIN
    book_category bc ON b.book_id = bc.book_id
  WHERE
    bc.book_id IS NULL;
    `;
    return this.executeQuery(query);
  }
  async getCategoryOrder() {
    const query = `
        SELECT co.order_num, c.category_id, c.category_name
        FROM category_order co
        JOIN category c ON co.category_id = c.category_id
        ORDER BY co.order_num;
    `;

    try {
      const results = await this.executeQuery(query);
      return results;
    } catch (error) {
      console.error('Error retrieving category order:', error);
      return [];
    }
  }
  async findCartById(userId) {
    const query = `
      SELECT 
        c.cart_id,
        b.book_id,
        b.title, 
        b.author, 
        b.genre, 
        b.plot, 
        b.base_price, 
        b.discount_percent, 
        b.sell_price, 
        b.cover_img,
        SUM(cd.quantity) AS total_quantity,
        SUM(cd.quantity * b.sell_price) AS total_price
      FROM 
        cart_detail cd
      JOIN 
        book b ON cd.product_id = b.book_id
      JOIN 
        cart c ON cd.cart_id = c.cart_id
      WHERE 
        c.user_id = ?
      GROUP BY 
        c.cart_id, cd.product_id;`;

    const results = await this.executeQuery(query, [userId]);
    return results;
  }
  async addCategory(categoryName) {
    try {
      // Execute the query to insert the new category
      const insertQuery = "INSERT INTO category (category_name) VALUES (?)";
      const insertResult = await this.executeQuery(insertQuery, [categoryName]);

      // If insertion was successful, return the category_id of the newly inserted category
      if (insertResult && insertResult.insertId) {
        return { success: true, category_id: insertResult.insertId };
      } else {
        return { success: false, message: "Failed to add category" };
      }
    } catch (error) {
      // If any error occurs during execution, return an error message
      return { success: false, message: error.message };
    }
  }
  async addBook(name, genre, imgUrl, author, price, discount, plot) {
    try {
      name = name || null;
      genre = genre || null;
      imgUrl = imgUrl || null;
      author = author || null;
      price = price || null;
      discount = discount || null;
      plot = plot || null;

      console.log("addName:", name);
      console.log("addGenre:", genre);
      console.log("addImg URL:", imgUrl);
      console.log("addAuthor:", author);
      console.log("addPrice:", price);
      console.log("addDiscount:", discount);
      console.log("addPlot:", plot);

      // Insert the book into the database
      const insertQuery = `
            INSERT INTO book (title, genre, cover_img, author, base_price, discount_percent, plot) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
      const insertResult = await this.executeQuery(insertQuery, [name, genre, imgUrl, author, price, discount, plot]);

      if (insertResult && insertResult.insertId) {
        return { success: true, book_id: insertResult.insertId, message: "Book added successfully" };
      } else {
        return { success: false, message: "Failed to add book" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async editBook(id, name, genre, imgUrl, author, price, discount, plot) {
    try {
        // Prepare the update query
        const updateQuery = `
            UPDATE book 
            SET 
                title = COALESCE(?, title),
                genre = COALESCE(?, genre),
                cover_img = COALESCE(?, cover_img),
                author = COALESCE(?, author),
                base_price = COALESCE(?, base_price),
                discount_percent = COALESCE(?, discount_percent),
                plot = COALESCE(?, plot)
            WHERE book_id = ?;
        `;
        
        // Execute the update query
        const updateResult = await this.executeQuery(updateQuery, [name, genre, imgUrl, author, price, discount, plot, id]);

        // Check if the update was successful
        if (updateResult && updateResult.affectedRows > 0) {
            return { success: true, message: "Book edited successfully" };
        } else {
            return { success: false, message: "Failed to edit book" };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
  }
  async deleteBookById(bookId) {
    // Begin transaction
    try {
      // Delete entries from book_category table associated with the book
      const deleteCategoryQuery = "DELETE FROM book_category WHERE book_id = ?";
      await this.executeQuery(deleteCategoryQuery, [bookId]);

      // Delete the book from the book table
      const deleteBookQuery = "DELETE FROM book WHERE book_id = ?";
      await this.executeQuery(deleteBookQuery, [bookId]);

      // Commit transaction if all queries succeed


      return { success: true, message: "Book and associated categories deleted successfully." };
    } catch (error) {
      // Rollback transaction if any query fails

      return { success: false, message: "Failed to delete book and associated categories.", error };
    }
  }
  async getBookCategories(bookID) {
    try {
      const query = `
          SELECT c.category_id
          FROM category c
          INNER JOIN book_category bc ON c.category_id = bc.category_id
          WHERE bc.book_id = ?
      `;
      const result = await this.executeQuery(query, [bookID]);

      if (result && result.length > 0) {
        const categories = result.map(row => row.category_id);
        return { success: true, categories };
      } else {
        const categories = [];
        return { success: true, categories, message: "No categories found for the specified book ID" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async addBookToCategories(book_id, categoryIDs) {
    try {
      // Iterate over the array of category IDs and insert into book_category table
      for (const categoryID of categoryIDs) {
        const insertQuery = "INSERT INTO book_category (book_id, category_id) VALUES (?, ?)";
        await this.executeQuery(insertQuery, [book_id, categoryID]);
      }

      return { success: true, message: "Book added to categories successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async editBookToCategories(book_id, categoryIDs) {
    try {
      const deleteAllCategoryTie = "DELETE FROM book_category WHERE book_id = ?";
      await this.executeQuery(deleteAllCategoryTie, [book_id]);

      for (const categoryID of categoryIDs) {
        const insertQuery = "INSERT INTO book_category (book_id, category_id) VALUES (?, ?)";
        await this.executeQuery(insertQuery, [book_id, categoryID]);
      }

      return { success: true, message: "Book editted to categories successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async deleteBookToCategories(book_id) {
    try {
      const deleteAllCategoryTie = "DELETE FROM book_category WHERE book_id = ?";
      await this.executeQuery(deleteAllCategoryTie, [book_id]);

      return { success: true, message: "Book deleted from categories successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async findBookID(name, genre, imgUrl, author, price, discount, plot) {
    try {
      // Construct the SELECT query to find the book_id based on attributes
      const selectQuery = `
            SELECT book_id
            FROM book
            WHERE 
                title = ? AND
                genre = ? AND
                cover_img = ? AND
                author = ? AND
                base_price = ? AND
                discount_percent = ? AND
                plot = ?
        `;

      // Execute the query with provided attributes
      const result = await this.executeQuery(selectQuery, [name, genre, imgUrl, author, price, discount, plot]);

      // If a book matching the attributes is found, return its book_id
      if (result && result.length > 0) {
        return { success: true, book_id: result[0].book_id };
      } else {
        return { success: false, message: "Book not found" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async deleteCategoryByID(categoryID) {
    try {
      // First, delete the entry from category_order
      const deleteOrderQuery = "DELETE FROM category_order WHERE category_id = ?";
      await this.executeQuery(deleteOrderQuery, [categoryID]);

      // Then, delete the category itself
      const deleteCategoryQuery = "DELETE FROM category WHERE category_id = ?";
      const deleteCategoryResult = await this.executeQuery(deleteCategoryQuery, [categoryID]);

      if (deleteCategoryResult && deleteCategoryResult.affectedRows > 0) {
        return { success: true, message: "Category deleted successfully" };
      } else {
        return { success: false, message: "Category not found or could not be deleted" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async updateCategoryNameByID(categoryID, newCategoryName) {
    try {
      // Update the category name
      const updateQuery = "UPDATE category SET category_name = ? WHERE category_id = ?";
      const updateResult = await this.executeQuery(updateQuery, [newCategoryName, categoryID]);

      if (updateResult && updateResult.affectedRows > 0) {
        return { success: true, message: "Category name updated successfully" };
      } else {
        return { success: false, message: "Category not found or could not be updated" };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  async addToCart(userId, productId, quantity) {
    const query = `
        INSERT INTO cart_detail (cart_id, product_id, quantity, date_added)
        SELECT 
            c.cart_id, 
            ?, 
            ?, 
            CURRENT_TIMESTAMP
        FROM 
            cart c
        WHERE 
            c.user_id = ?;`;

    try {
      // Execute the query
      const result = await this.executeQuery(query, [productId, quantity, userId]);
      // Check if any rows were affected (successful insertion)
      if (result.affectedRows > 0) {
        return { success: true, message: "Product added to cart successfully." };
      } else {
        return { success: false, message: "Failed to add product to cart." };
      }
    } catch (error) {
      // Handle error
      console.error("Error adding product to cart:", error);
      return { success: false, message: "An error occurred while adding product to cart." };
    }
  }
  async deleteCartItem(cartId, bookId) {
    const query = `
      DELETE FROM cart_detail
      WHERE cart_id = ? AND product_id = ?;
    `;

    try {
      await this.executeQuery(query, [cartId, bookId]);
      console.log(`Successfully deleted item with book_id ${bookId} from cart_id ${cartId}.`);
    } catch (error) {
      console.error('Error deleting item from cart:', error);
    }
  }
  async moveCategoryUp(categoryId, orderNum) {
    const prevOrderNum = orderNum - 1;

    // Check if the category is already at the top
    if (prevOrderNum < 1) {
      console.log('Category is already at the top. No need to move.');
      return;
    }

    // Swap order numbers
    const query = `
        START TRANSACTION;
        UPDATE category_order SET order_num = -1 WHERE order_num = ?;
        UPDATE category_order SET order_num = ? WHERE category_id = ?;
        UPDATE category_order SET order_num = ? WHERE order_num = -1;
        COMMIT;
    `;

    try {
      await this.executeQuery(query, [orderNum, prevOrderNum, categoryId, orderNum]);
      console.log(`Category with ID ${categoryId} moved up successfully.`);
    } catch (error) {
      console.error('Error moving category up:', error);
    }
  }
  async getMaxOrderNum() {
    const query = `
      SELECT MAX(order_num) AS max_order_num
      FROM category_order;
  `;

    try {
      const result = await this.executeQuery(query);
      return result[0].max_order_num;
    } catch (error) {
      console.error('Error fetching maximum order number:', error);
      return null;
    }
  }
  async getMinOrderNum() {
    const query = `
      SELECT MIN(order_num) AS min_order_num
      FROM category_order;
  `;

    try {
      const result = await this.executeQuery(query);
      return result[0].min_order_num;
    } catch (error) {
      console.error('Error fetching minimum order number:', error);
      return null;
    }
  }
  async moveCategoryDown(categoryId, orderNum) {

    try {
      const maxRow = await this.getMaxOrderNum()
      console.log("max row = ", maxRow)
      const tempRow = maxRow + 1;
      const prevPlace = parseInt(orderNum);

      // Check if the category is already at the bottom
      if (prevPlace === maxRow || !maxRow) {
        console.log('Category is already at the bottom or maxOrderNum is not available. No need to move.');
        return;
      }

      // Start a transaction
      await this.executeQuery('START TRANSACTION;');

      // Update the order number of the provided category
      await this.executeQuery(`
          UPDATE category_order
          SET order_num = ?
          WHERE category_id = ?;
      `, [tempRow, categoryId]);
      console.log("prevPlace: ", prevPlace);
      const newPlace = prevPlace + parseInt(1);
      console.log("newPlace: ", newPlace);
      // Update the order number of the category below the provided category
      await this.executeQuery(`
          UPDATE category_order
          SET order_num = ?
          WHERE order_num = ? + 1;
      `, [prevPlace, prevPlace]);

      // Update the order number of the provided category
      await this.executeQuery(`
          UPDATE category_order
          SET order_num = ?
          WHERE category_id = ?;
      `, [prevPlace + 1, categoryId]);

      // Commit the transaction
      await this.executeQuery('COMMIT;');

      console.log(`Moved category ${categoryId} down`);
    } catch (error) {
      // Rollback the transaction in case of error
      await this.executeQuery('ROLLBACK;');
      console.error('Error moving category down:', error);
      throw error;
    }
  }
  async moveCategoryUp(categoryId, orderNum) {
    try {
      const maxRow = await this.getMaxOrderNum()
      const minRow = await this.getMinOrderNum();
      const prevPlace = parseInt(orderNum);

      // Check if the category is already at the top
      if (prevPlace === minRow || !minRow) {
        console.log('Category is already at the top or minOrderNum is not available. No need to move.');
        return;
      }

      // Start a transaction
      await this.executeQuery('START TRANSACTION;');

      // Update the order number of the provided category
      const tempRow = maxRow + 1;
      await this.executeQuery(`
          UPDATE category_order
          SET order_num = ?
          WHERE category_id = ?;
      `, [tempRow, categoryId]);

      // Update the order number of the category above the provided category
      const newPlace = prevPlace - 1;
      await this.executeQuery(`
          UPDATE category_order
          SET order_num = ?
          WHERE order_num = ? - 1;
      `, [prevPlace, prevPlace]);

      // Update the order number of the provided category
      await this.executeQuery(`
          UPDATE category_order
          SET order_num = ?
          WHERE category_id = ?;
      `, [newPlace, categoryId]);

      // Commit the transaction
      await this.executeQuery('COMMIT;');

      console.log(`Moved category ${categoryId} up`);
    } catch (error) {
      // Rollback the transaction in case of error
      await this.executeQuery('ROLLBACK;');
      console.error('Error moving category up:', error);
      throw error;
    }
  }
}

const GeneralDB = new GeneralModel();

module.exports = GeneralDB;