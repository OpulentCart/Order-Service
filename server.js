const express = require("express");
const cors = require("cors");
const app = express();
const { connectDB } = require("./config/dbConfig");
require("dotenv").config();

// middleware
app.use(express.json());
app.use(cors());

// connect to the database
connectDB();

app.use("/orders", require("./routes/orderRoutes"));

app.listen(process.env.PORT, () => console.log(`Order Service running on port ${process.env.PORT}`));