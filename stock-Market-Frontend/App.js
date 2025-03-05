import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const socket = io("http://localhost:5000");

const App = () => {
  const [stocks, setStocks] = useState({});
  const [symbol, setSymbol] = useState("");
  const [theme, setTheme] = useState("light");
  const searchHistoryRef = useRef([]);

  // Fetch initial stock data
  useEffect(() => {
    socket.on("initialData", (initialStocks) => {
      setStocks(initialStocks);
    });

    socket.on("stockUpdate", ({ symbol, price }) => {
      setStocks((prev) => ({ ...prev, [symbol]: price }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle stock symbol input
  const handleFetchStock = () => {
    if (symbol.trim()) {
      socket.emit("fetchStock", symbol);
      searchHistoryRef.current.push(symbol);
      setSymbol("");
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Chart data
  const chartData = {
    labels: Object.keys(stocks),
    datasets: [
      {
        label: "Stock Prices",
        data: Object.values(stocks),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className={`container-fluid ${theme === "dark" ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <div className="row p-4">
        <div className="col-md-8">
          <h1>Stock Market Dashboard</h1>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g., AAPL)"
            />
            <button className="btn btn-primary mt-2" onClick={handleFetchStock}>
              Fetch Stock Price
            </button>
          </div>
          <div>
            <h2>Live Stock Prices</h2>
            <ul className="list-group">
              {Object.entries(stocks).map(([symbol, price]) => (
                <li key={symbol} className="list-group-item">
                  {symbol}: ${price}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-md-4">
          <h2>Search History</h2>
          <ul className="list-group">
            {searchHistoryRef.current.map((search, index) => (
              <li key={index} className="list-group-item">
                {search}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="row p-4">
        <div className="col">
          <h2>Stock Trends</h2>
          <Line data={chartData} />
        </div>
      </div>
      <button className="btn btn-secondary position-fixed bottom-0 end-0 m-3" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

export default App;
