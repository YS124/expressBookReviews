const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Implement username validation logic (e.g., minimum length, allowed characters)
  return username.length >= 6 && /^[a-zA-Z0-9_]*$/.test(username);
};

const authenticatedUser = (username, password) => {
  // Implement logic to check username and password against your user database
  // This is a placeholder, replace with actual authentication logic
  return users.some(user => user.username === username && user.password === password);
};



regd_users.post("/login", (req, res) => {
  // Implement login logic using authenticatedUser function
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Successful login
  const token = jwt.sign({ user: username }, "secret", { expiresIn: '30m' });
    req.session.authorization = { accessToken: token };

    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { review } = req.query; // Get the review from the request query
  const token = req.headers['authorization']; // Get the JWT token from the authorization header

  // Validate the request
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  // Verify the JWT token (replace with actual JWT verification logic)
  try {
    const decoded = jwt.verify(token, "secret");
    const username = decoded.user;

    // Find the user from the user database
    const user = users.find(user => user.username === username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the book by ISBN (replace with actual book data retrieval)
    const isbn = req.params.isbn;
    const isbnAsNumber = parseInt(isbn, 10); // Convert ISBN string to a number

    // Check if ISBN is a valid number (optional)
    if (isNaN(isbnAsNumber)) {
        return res.status(400).json({ message: "Invalid ISBN format" });
    }

    // Find the book using the ISBN as the key
    let book = books[isbnAsNumber];


    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user already has a review for this book
    if (!user.reviews) {
      user.reviews = {};
    }

    if (user.reviews[isbn]) {
      // Update existing review
      user.reviews[isbn] = review;
    } else {
      // Add new review
      user.reviews[isbn] = review;
    }

    // Save the updated user data (replace with actual data persistence)
    // ...

    return res.status(200).json({ message: "Review added/updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers['authorization']; // Get the JWT token from the authorization header

  // Validate the request
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  // Verify the JWT token (replace with actual JWT verification logic)
  try {
    const decoded = jwt.verify(token, "secret");
    const username = decoded.user;

    // Find the user from the user database
    const user = users.find(user => user.username === username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the book by ISBN (replace with actual book data retrieval)
    const isbn = req.params.isbn;
    const isbnAsNumber = parseInt(isbn, 10); // Convert ISBN string to a number

    // Check if ISBN is a valid number (optional)
    if (isNaN(isbnAsNumber)) {
        return res.status(400).json({ message: "Invalid ISBN format" });
    }

    // Find the book using the ISBN as the key
    let book = books[isbnAsNumber];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review for this book
    if (!user.reviews || !user.reviews[isbn]) {
      return res.status(404).json({ message: "Review not found for this book" });
    }

    // Delete the review
    delete user.reviews[isbn];

    // Save the updated user data (replace with actual data persistence)
    // ...

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
