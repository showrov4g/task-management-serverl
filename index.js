// Import the express module
const express = require('express');
const cors = require('cors')
require('dotenv').config()
const port =process.env.PORT || 3000;
const app = express();

// middleware
app.use(cors)
app.use(express.json())





// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});