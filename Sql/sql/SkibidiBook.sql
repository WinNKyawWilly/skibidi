-- Create user table
CREATE TABLE user (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT 0,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart table
CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create book table without publication_date
CREATE TABLE book (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    plot TEXT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    sell_price DECIMAL(10, 2) GENERATED ALWAYS AS (base_price - (base_price * discount_percent / 100)) STORED,
    cover_img VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a new category table with separate category_id and order_num columns
CREATE TABLE category (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL
);

-- Create junction table for the many-to-many relationship between books and categories
CREATE TABLE book_category (
    book_id INT,
    category_id INT,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES book(book_id),
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

-- Create cart_detail table
CREATE TABLE cart_detail (
    cart_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT,
    product_id INT,
    quantity INT,
    date_added DATETIME,
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id),
    FOREIGN KEY (product_id) REFERENCES book(book_id)
);

-- Create a new category_order table to store the order numbers
CREATE TABLE category_order (
    category_id INT PRIMARY KEY,
    order_num INT NOT NULL AUTO_INCREMENT,
    UNIQUE KEY (order_num),
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

-- Create a trigger to update category_order when a new category is added
DELIMITER //
CREATE TRIGGER after_insert_category
AFTER INSERT ON category
FOR EACH ROW
BEGIN
    DECLARE total_categories INT;
    SELECT COUNT(*) INTO total_categories FROM category;
    INSERT INTO category_order (category_id, order_num) VALUES (NEW.category_id, total_categories + 1);
END;
//
DELIMITER ;

-- Create trigger to automatically create a cart for every new user
DELIMITER //
CREATE TRIGGER after_insert_user
AFTER INSERT ON user
FOR EACH ROW
BEGIN
    INSERT INTO cart (user_id) VALUES (NEW.user_id);
END;
//
DELIMITER ;


