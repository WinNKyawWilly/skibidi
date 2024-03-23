const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

// Controllers
const Authen = require("./controllers/authen");

// Database models
const db = require("./models/dbConn.js");
const UserDB = require("./models/userModel");
const generalDB = require("./models/generalModel");

// Authentication
const session = require("express-session");
const { log } = require("console");
const { render } = require("ejs");
const mysqlStore = require("express-mysql-session")(session);

// DB connection for storing session data
const options = db.dbconfig;
options.createDatabaseTable = true;
const sessionStore = new mysqlStore(options);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public"));

// Define session configuration for your server
app.use(
    session({
        store: sessionStore,
        secret: "jklfsodifjsktnwjasdp465dd", // A secret key used to sign the session ID cookie
        resave: true, // Forces the session to be saved back to the session store
        saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
        cookie: {
            maxAge: 3600000, // Sets the cookie expiration time in milliseconds (1 hour here)
            sameSite: true,
            httpOnly: true, // Reduces client-side script control over the cookie
            secure: false, // Ensures cookies are only sent over HTTPS //we do not impmentment HTTPS yet, so, this is false
        },
    })
);





// app.get("/Office/Bills", async function (req, res) {
//     try {
//         if (req.session.is_admin) {
//             const result = await generalDB.getCategoriesWithOrder();
//         } else {
//             res.redirect("/");
//         }


//     } catch (error) {

//         console.error('Error executing query:', error);
//         res.status(500).send("Internal Server Error");
//     }
// })

app.get("/Office/Product", async function (req, res) {
    try {
        if (req.session.is_admin) {
            const categoryOrder = await generalDB.getCategoryOrder();
            const result = await generalDB.getCategoriesWithBooks();
            const user = await UserDB.findById(req.session.user_id);
            console.log("session-/Home: ", req.sessionID);
            console.log("session-/Home: ", req.session);
            const bookID = 45;
            const bookCat = await generalDB.getBookCategories(bookID)
            console.log("bookCat: ", bookCat.categories);
            const bookCatText = bookCat.categories.join(',');
            console.log("bookCatText: ", bookCatText);
            const bresult = await generalDB.getBooksWithNoCatagory();
            const booksWithNoCategory = [];
            for (const row of bresult) {
                booksWithNoCategory.push({
                    book_id: row.book_id,
                    title: row.title,
                    author: row.author,
                    genre: row.genre,
                    plot: row.plot,
                    base_price: row.base_price,
                    discount_percent: row.discount_percent,
                    sell_price: row.sell_price,
                    cover_img: row.cover_img,
                    created_at: row.created_at,
                    bookCatText: []
                });
            }

            //store the result in 2d array
            // const categoriesWithBooks = {};
            // result.forEach( async (row)  => {
            //     const categoryName = row.category_name;

            //     if (!categoriesWithBooks[categoryName]) {
            //         categoriesWithBooks[categoryName] = {
            //             category_id: row.category_id,
            //             books: []
            //         };
            //     }
            //     const bookCat = await generalDB.getBookCategories(bookID)
            //     const bookCatText = bookCat.categories.join(',');

            //     categoriesWithBooks[categoryName].books.push({
            //         book_id: row.book_id,
            //         title: row.title,
            //         author: row.author,
            //         genre: row.genre,
            //         plot: row.plot,
            //         base_price: row.base_price,
            //         discount_percent: row.discount_percent,
            //         sell_price: row.sell_price,
            //         cover_img: row.cover_img,
            //         created_at: row.created_at,
            //         bookCatText: bookCatText
            //     });
            // });

            const categoriesWithBooks = {}; // Initialize the categoriesWithBooks object

            // Iterate over each row asynchronously using for...of loop
            for (const row of result) {
                const categoryName = row.category_name;

                if (!categoriesWithBooks[categoryName]) {
                    categoriesWithBooks[categoryName] = {
                        category_id: row.category_id,
                        books: []
                    };
                }

                // Assuming each row has a book_id field
                const bookID = row.book_id;
                const bookCat = await generalDB.getBookCategories(bookID);
                console.log("bookCatLog", bookCat);
                const bookCatText = bookCat.categories.join(',');

                categoriesWithBooks[categoryName].books.push({
                    book_id: row.book_id,
                    title: row.title,
                    author: row.author,
                    genre: row.genre,
                    plot: row.plot,
                    base_price: row.base_price,
                    discount_percent: row.discount_percent,
                    sell_price: row.sell_price,
                    cover_img: row.cover_img,
                    created_at: row.created_at,
                    bookCatText: bookCatText
                });
            }
            const category = Array.isArray(categoryOrder) ? categoryOrder : [];
            //console.log(JSON.stringify(categoriesWithBooks, null, 2));
            console.log("No cat:", JSON.stringify(booksWithNoCategory, null, 2));

            const noCatKeys = Object.keys(booksWithNoCategory)
            console.log("noCatLenght", noCatKeys.length);

            res.render("BOProduct", {
                noCatLenght: noCatKeys.length,
                booksNoCat: booksWithNoCategory,
                categoriesWithBooks: categoriesWithBooks,
                category: category,
                user: user
            });


        } else {
            res.redirect("/");
        }


    } catch (error) {

        console.error('Error executing query:', error);
        res.status(500).send("Internal Server Error");
    }
})
app.post('/addBook', async (req, res) => {
    // Retrieve data from the request body
    const { name, genre, imgUrl, author, price, discount, Plot } = req.body;
    const category = req.body.box
    // Log the retrieved data
    console.log('New Book Information:');
    console.log('Name:', name);
    console.log("genre:", genre);
    console.log("imgUrl:", imgUrl);
    console.log('Author:', author);
    console.log('Price:', price);
    console.log('Discount:', discount);
    console.log('Description:', Plot);
    console.log('Category:', category);




    const create_book_res = await generalDB.addBook(name, genre, imgUrl, author, price, discount, Plot)
    const book_id = create_book_res.book_id

    console.log("book_id:", book_id);

    if (category !== undefined) {
        const book_cat_res = await generalDB.addBookToCategories(book_id, category)
        console.log("book_cat_res:", book_cat_res);
    }


    res.redirect("/Office/Product")

    // Respond with a success message or redirect as needed
    //res.send('Book information logged successfully!');
});
app.post('/editBook', async (req, res) => {
    // Retrieve data from the request body
    const { bId, name, genre, imgUrl, author, price, discount, Plot } = req.body;
    const category = req.body.box
    // Log the retrieved data
    console.log('Edit Book Information:');
    console.log('bookID:', bId);
    console.log('Name:', name);
    console.log("genre:", genre);
    console.log("imgUrl:", imgUrl);
    console.log('Author:', author);
    console.log('Price:', price);
    console.log('Discount:', discount);
    console.log('Description:', Plot);
    console.log('Category:', category);

    const edit_book_res = await generalDB.editBook(bId, name, genre, imgUrl, author, price, discount, Plot)

    if (category !== undefined) {
        const book_cat_res = await generalDB.editBookToCategories(bId, category)
        console.log("book_cat_res:", book_cat_res);
    } else {
        const delete_cat_res = await generalDB.deleteBookToCategories(bId, category)
        console.log("book_cat_res:", delete_cat_res);
    }

    res.redirect("/Office/Product")
    // res.redirect("/Office/Product")

    // Respond with a success message or redirect as needed
    //res.send('Book information logged successfully!');
});
app.post('/deleteBook', async (req, res) => {

    // Retrieve data from the request body
    const book_id = req.body.newBookId;

    // Log the retrieved data
    console.log('Delete Book Information:');
    console.log("book_id:", book_id);

    const result = await generalDB.deleteBookById(book_id)

    res.redirect("/Office/Product")



    //Respond with a success message or redirect as needed
    //res.send('Book information logged successfully!');
});

app.get("/Office/Category", async function (req, res) {
    try {
        if (req.session.is_admin) {
            const categoryOrder = await generalDB.getCategoryOrder();
            const user = await UserDB.findById(req.session.user_id);
            console.log("categoryOrder: ", categoryOrder);

            // Ensure category is an array
            const category = Array.isArray(categoryOrder) ? categoryOrder : [];
            console.log("Type: ", typeof (category));
            console.log("Rendering BOCategory");
            const categoryKeys = Object.keys(category)
            console.log("CatLenght: ", categoryKeys.length);
            res.render("BOCategory", {
                catLenght: categoryKeys.length,
                category: category,
                user: user
            });
        } else {
            res.redirect("/");

        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/catMoveUp", async function (req, res) {
    const orderNum = req.body.orderNum;
    const categoryId = req.body.category_id;
    console.log("Try to move categoryId " + categoryId + " Down");
    console.log("Try to move categoryOrder " + orderNum + " Down");
    // Perform logic to move category up
    const result = await generalDB.moveCategoryUp(categoryId, orderNum);
    //console.log("result: ",result);
    res.redirect("/Office/Category"); // Redirect back to the category page
});
app.post("/catMoveDown", async function (req, res) {
    const orderNum = req.body.orderNum;
    const categoryId = req.body.category_id;
    console.log("Try to move categoryId " + categoryId + " Down");
    console.log("Try to move categoryOrder " + orderNum + " Down");
    // Perform logic to move category up
    const result = await generalDB.moveCategoryDown(categoryId, orderNum);
    //console.log("result: ",result);
    res.redirect("/Office/Category"); // Redirect back to the category page
});
app.post("/addNewCat", async function (req, res) {
    const categoryName = req.body.catName;

    console.log("Try to add ", categoryName);

    const result = await generalDB.addCategory(categoryName);

    res.redirect("/Office/Category"); // Redirect back to the category page
});
app.post('/editCategory', async (req, res) => {
    // Extracting data from the request body
    const newCatName = req.body.editCatName;
    const category_id = req.body.category_id;

    // Logging the received data
    console.log("Received form data:");
    console.log("Category Name:", newCatName);
    console.log("Category ID:", category_id);

    const result = await generalDB.updateCategoryNameByID(category_id, newCatName);

    // Sending a response
    res.redirect('/Office/Category');
});
app.post('/deleteCategory', async (req, res) => {
    // Retrieve the catID from the request body
    const catID = req.body.catID;

    // Perform deletion or any other operation with catID here
    // For now, let's just log it
    console.log("catID to be deleted:", catID);
    const result = await generalDB.deleteCategoryByID(catID);

    // Sending response
    res.redirect('/Office/Category');
});

app.get("/aboutUs", async function (req, res) {

    const user = await UserDB.findById(req.session.user_id);
    res.render("aboutUs", {
        user: user
    });
});
app.get("/", async function (req, res) {
    try {
        const result = await generalDB.getCategoriesWithBooks();
        console.log("session-/Home: ", req.sessionID);
        console.log("session-/Home: ", req.session);
        //store the result in 2d array
        const categoriesWithBooks = {};
        result.forEach(row => {
            const categoryName = row.category_name;

            if (!categoriesWithBooks[categoryName]) {
                categoriesWithBooks[categoryName] = {
                    category_id: row.category_id,
                    books: []
                };
            }

            categoriesWithBooks[categoryName].books.push({
                book_id: row.book_id,
                title: row.title,
                author: row.author,
                genre: row.genre,
                plot: row.plot,
                base_price: row.base_price,
                discount_percent: row.discount_percent,
                sell_price: row.sell_price,
                cover_img: row.cover_img,
                created_at: row.created_at
            });
        });
        //simplify log
        const simplifiedOutput = {};
        result.forEach(row => {
            const categoryName = row.category_name;

            if (!simplifiedOutput[categoryName]) {
                simplifiedOutput[categoryName] = [];
            }

            simplifiedOutput[categoryName].push({
                book_id: row.book_id,
                title: row.title,
                author: row.author,
                genre: row.genre
            });
        });

        console.log("user: ", req.session.user_id);

        if (req.session.user_id) {
            console.log("USER!!!");
            const user = await UserDB.findById(req.session.user_id);
            console.log("user: ", user);

            if (req.session.is_admin) {
                console.log("ADMIN!!!");
                console.log(JSON.stringify(categoriesWithBooks, null, 2));
                //console.log(JSON.stringify(simplifiedOutput, null, 2));
                res.render("Home", {
                    categoriesWithBooks: categoriesWithBooks,
                    user: user
                });
            } else {
                //console.log(JSON.stringify(simplifiedOutput, null, 2));
                console.log("Going to land on Home with user");
                res.render("Home", {
                    categoriesWithBooks: categoriesWithBooks,
                    user: user
                });
            }

        } else {
            //This log is too long
            //console.log(JSON.stringify(categoriesWithBooks, null, 2));
            //Shorter log to see just book_id and title
            //console.log(JSON.stringify(simplifiedOutput, null, 2));
            console.log("GUEST!!!!");
            res.render("Home", { categoriesWithBooks: categoriesWithBooks });
        }

    } catch (error) {
        // Handle error appropriately
        console.error('Error executing query:', error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/category", async function (req, res) {
    const category = req.query.category;
    const booksString = req.query.books;

    // Convert the books string back to a JavaScript object
    const books = JSON.parse(booksString);

    // Now you can use the category and books variables in your logic
    console.log("Category:", category);
    console.log("Books:", books);

    // Log
    console.log("Received category and books information successfully!");

    if (req.session.user_id) {
        const user = await UserDB.findById(req.session.user_id);
        res.render("Category", {
            catName: category,
            books: books,
            user: user
        });
    } else {
        res.render("Category", {
            catName: category,
            books: books
        });
    }

});
app.get('/title', async (req, res) => {
    const bookData = req.query.book;

    // Parse the JSON string back to a JavaScript object
    const book = JSON.parse(decodeURIComponent(bookData));
    console.log('Received book information:', book);

    if (!bookData) {
        // Handle the case where book data is not provided
        return res.status(400).send('Book data not provided');
    }

    if (req.session.user_id) {
        const user = await UserDB.findById(req.session.user_id);
        res.render("Title", {
            book: book,
            user: user
        });
    } else {
        res.render("Title", {
            book: book
        });
    }

    //res.send('Received book information successfully!');

});
app.get("/all/:page", async function (req, res) {
    const page = req.params.page
    console.log("page: ",page);
    const allBookData = await generalDB.getAllBooks();
    console.log("allBook :", allBookData);

    
    const allBook = [];
    for (const row of allBookData) {
        allBook.push({
            book_id: row.book_id,
            title: row.title,
            author: row.author,
            genre: row.genre,
            plot: row.plot,
            base_price: row.base_price,
            discount_percent: row.discount_percent,
            sell_price: row.sell_price,
            cover_img: row.cover_img,
            created_at: row.created_at,
            bookCatText: []
        });
    }
    console.log("Book lenght: ",allBook.length);
    const allPage = Math.ceil((allBook.length) / 15)
    console.log("allPage: ", allPage);
    if (req.session.user_id) {
        const user = await UserDB.findById(req.session.user_id);
        res.render('AllBook', {
            page : page,
            allPage : allPage,
            books: allBook,
            user: user
        });
    } else {
        res.render('AllBook', {
            page : page,
            allPage : allPage,
            books : allBook
    
        })
    }

    
});

app.get('/cart', async (req, res) => {
    const user = await UserDB.findById(req.session.user_id);
    const cart = await generalDB.findCartById(req.session.user_id);

    // Initialize an empty object to store cart information by category
    const userCartByTitle = {};

    // Iterate over each item in the cart
    cart.forEach(item => {
        const bookTitle = item.title;

        // If the book title doesn't exist in userCartByTitle, create it
        if (!userCartByTitle[bookTitle]) {
            userCartByTitle[bookTitle] = [];
        }

        // Add the cart item to the array under the appropriate book title
        userCartByTitle[bookTitle].push({
            cart_id: item.cart_id,
            book_id: item.book_id,
            title: item.title,
            author: item.author,
            genre: item.genre,
            base_price: item.base_price,
            discount_percent: item.discount_percent,
            sell_price: item.sell_price,
            cover_img: item.cover_img,
            total_quantity: item.total_quantity,
            total_price: item.total_price
        });
    });

    console.log("Cart req from user: ", user);
    console.log("Cart: ", userCartByTitle);
    res.render('Cart', {
        user: user,
        cart: userCartByTitle
    });
});
app.post('/addToCart', async (req, res) => {
    try {
        console.log("call addtocart");
        const { quantity, book } = req.body; // Destructure quantity and book from req.body

        console.log("Quantity:", quantity);
        console.log("Book:", book);

        const user = await UserDB.findById(req.session.user_id);

        console.log("Add item to user cart:", req.session.user_id);
        console.log("Quantity:", quantity);
        console.log("Add BookID:", book.book_id);

        const userId = req.session.user_id; // Provide the user ID
        const productId = book.book_id; // Provide the product ID

        const addToCartResult = await generalDB.addToCart(userId, productId, quantity);
        console.log(addToCartResult);
        // You can add your logic to add the item to the cart here

        res.sendStatus(200); // Send success status
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.sendStatus(500); // Send error status
    }
});
app.post('/removeFromCart', async (req, res) => {
    const book_id = req.body.itemId;
    const cart_id = req.body.cartId;
    console.log("remove book_id", book_id);
    console.log("from cart_id", cart_id);
    const removeFromCartResults = await generalDB.deleteCartItem(cart_id, book_id);
    console.log("removeFromCartResults", removeFromCartResults);
    res.redirect('/cart');
});

app.post("/register", async (req, res) => {
    console.log("/register called");
    try {
        // Access form data from req.body
        const formData = req.body.form;
        console.log("Register Form Data:", formData);

        const { email, password } = formData;
        const registerResult = await Authen.userRegister(req, res, email, password);

        if (registerResult.success) {
            res.send('Account created successfully!');
        } else {
            res.status(400).json({ error: registerResult.message });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.post("/login", async (req, res) => {
    try {
        const formData = req.body.form;
        console.log("Login Form Data:", formData);

        // Get user input using bodyParser
        const { email, password } = formData;

        const loginResult = await Authen.userLogin(req, res, email, password);
        console.log("session-/login: ", req.sessionID);

        if (loginResult.success) {
            // Store session information
            const sessionInfo = {
                user_id: req.session.user_id,
                email: req.session.email,
                is_admin: req.session.is_admin
                // Add other session data as needed
            };
            console.log("session-/login: ", req.sessionID);
            // Redirect to the home page with session information
            //res.redirect(`/?session=${encodeURIComponent(JSON.stringify(sessionInfo))}`);
            res.redirect('/');
        } else {
            console.log("401 error", loginResult.message);
            res.status(401).json({ error: loginResult.message });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get("/logout", async (req, res) => {
    req.session.destroy();
    console.log("session-/logout: ", req.sessionID);
    res.redirect('/');
});

// Serve static files from both 'public' and 'src' directories
app.use(express.static('public'));
app.use('/src', express.static('src'));
app.use('/img', express.static('img'));

app.listen(3000, function () {
    console.log("server listening on port 3000");
});
