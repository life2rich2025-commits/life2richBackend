const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoute");
const voucherRoutes = require("./routes/voucherRoute");
const homeRoutes = require("./routes/homeRoutes");

const app = express();
const PORT = 4000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  console.log("HIT ROOT ROUTE");
  res.send("API Running");
});

app.use("/api", userRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api", homeRoutes );

app.use("/api/voucher", voucherRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
