const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // 1. Validate input
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // 2. Check if user exists
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    // 3. Add user properly
    users.push({ username, password });

    return res.status(200).json({
        message: "User registered successfully"
    });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    const books = require('./booksdb.js'); // adjust path if needed

    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const books = require('./booksdb.js');

    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }

    return res.status(404).json({ message: "Book not found" });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const books = require('./booksdb.js');

    const authorName = req.params.author;
    const result = {};

    const bookKeys = Object.keys(books);

    bookKeys.forEach((key) => {
        if (books[key].author === authorName) {
            result[key] = books[key];
        }
    });

    if (Object.keys(result).length > 0) {
        return res.status(200).json(result);
    }

    return res.status(404).json({ message: "No books found for this author" });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const books = require('./booksdb.js');

    const titleParam = req.params.title.toLowerCase();
    const result = {};

    const bookKeys = Object.keys(books);

    bookKeys.forEach((key) => {
        const bookTitle = books[key].title.toLowerCase();

        if (bookTitle.includes(titleParam)) {
            result[key] = books[key];
        }
    });

    if (Object.keys(result).length > 0) {
        return res.status(200).json(result);
    }

    return res.status(404).json({ message: "No books found with this title" });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const books = require('./booksdb.js');

    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }

    return res.status(404).json({ message: "Book not found" });
});

const axios = require("axios");

public_users.get("/async/books", async (req, res) => {
    try {
        const response = await axios.get("http://localhost:5000/");
        return res.status(200).json(response.data);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

public_users.get("/async/isbn/:isbn", async (req, res) => {
    try {
        const isbn = req.params.isbn;

        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        return res.status(200).json(response.data);

    } catch (err) {
        return res.status(404).json({ message: "Book not found" });
    }
});

public_users.get("/async/author/:author", async (req, res) => {
    try {
        const author = req.params.author;

        const response = await axios.get(`http://localhost:5000/author/${author}`);
        return res.status(200).json(response.data);

    } catch (err) {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

public_users.get("/async/title/:title", async (req, res) => {
    try {
        const title = req.params.title;

        const response = await axios.get(`http://localhost:5000/title/${title}`);
        return res.status(200).json(response.data);

    } catch (err) {
        return res.status(404).json({ message: "No books found with this title" });
    }
});
module.exports.general = public_users;
