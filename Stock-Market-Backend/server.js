const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (for development)
  },
});

app.use(cors());
app.use(express.json());

// Mock stock data (replace with real API calls)
const stocks = {
  AAPL: 150.25,
  GOOGL: 2800.50,
  MSFT: 299.75,
};

// Fetch stock prices from an external API (mock implementation)
const fetchStockPrice = async (symbol) => {
  // Replace with a real API call (e.g., Alpha Vantage, Yahoo Finance)
  return stocks[symbol] || null;
};

// WebSocket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send initial stock data
  socket.emit("initialData", stocks);

  // Handle stock symbol input
  socket.on("fetchStock", async (symbol) => {
    const price = await fetchStockPrice(symbol);
    if (price) {
      stocks[symbol] = price;
      io.emit("stockUpdate", { symbol, price });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
