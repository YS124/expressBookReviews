const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }

  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add the new user to the in-memory array (replace with database storage)
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Get all books from the database (books.js)
  const bookList = books;

  // Send the response with the list of books as JSON
  return res.status(200).json({ message: "List of Books", books: JSON.stringify(bookList) });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Validate the ISBN (optional)
  // You can add logic here to check if the ISBN is a valid format

  // Find the book by ISBN in the database
  const book = books[isbn];

  // Check if book exists
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Send the response with book details
  return res.status(200).json({ message: "Book Details", book });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  
  // Retrieve the author name from the request parameters
  const author = req.params.author;

  // Get all book IDs (keys) from the books object
  const bookIds = Object.keys(books);

  // Initialize an empty array to store matching books
  const matchingBooks = [];

  // Iterate through all book IDs
  for (const bookId of bookIds) {
    // Access the book object using the ID (key)
    const book = books[bookId];

    // Check if the book's author matches the requested author
    if (book.author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push(book);
    }
  }

  // Check if any matching books were found
  if (matchingBooks.length === 0) {
    return res.status(404).json({ message: "No books found by this author" });
  }

  // Send the response with matching book(s) details
  return res.status(200).json({ message: "Matching Books", books: matchingBooks });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Retrieve the title from the request parameters
  const title = req.params.title.toLowerCase(); // Lowercase the title for case-insensitive search

  // Initialize an empty array to store matching books
  const matchingBooks = [];

  // Iterate through all books in the database
  for (const isbn in books) {
    const book = books[isbn];

    // Check if the book's title (lowercase) matches the requested title (lowercase)
    if (book.title.toLowerCase().includes(title)) { // Use includes for partial title search
      matchingBooks.push(book);
    }
  }

  // Check if any matching books were found
  if (matchingBooks.length === 0) {
    return res.status(404).json({ message: "No books found by this title" });
  }

  // Send the response with matching book(s) details
  return res.status(200).json({ message: "Matching Books", books: matchingBooks });

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Find the book by ISBN in the database
  const book = books[isbn];

  // Check if book exists
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if reviews exist for the book
  if (!book.reviews || Object.keys(book.reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book" });
  }

  // Reviews exist, send them in the response
  return res.status(200).json({ message: "Book Reviews", reviews: book.reviews });
});

module.exports.general = public_users;
