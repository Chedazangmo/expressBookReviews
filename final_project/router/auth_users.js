const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // 1. Validate input
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password required"
        });
    }

    // 2. Check credentials
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid login credentials"
        });
    }

    // 3. Generate JWT
    const accessToken = jwt.sign(
        { username: username },
        "fingerprint_customer",
        { expiresIn: "1h" }
    );

    // 4. Store in session
    req.session.authorization = {
        username: username,
        token: accessToken
    };

    return res.status(200).json({
        message: "Login successful",
        token: accessToken
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }

    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];

        return res.status(200).json({
            message: `Review for ISBN ${isbn} deleted`
        });
    }

    return res.status(403).json({
        message: "You do not have a review to delete"
    });
});
    
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
