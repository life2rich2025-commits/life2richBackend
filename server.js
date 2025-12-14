const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoute");
const voucherRoutes = require("./routes/voucherRoute");
const homeRoutes = require("./routes/homeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes")


const app = express();
const PORT = 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/upload_profile', express.static('upload_profile'));

connectDB();


app.get("/", (req, res) => {
  console.log("HIT ROOT ROUTE");
  res.send("API Running");
});

app.use("/api", userRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api", homeRoutes );

app.use("/api/voucher", voucherRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/notification", notificationRoutes);



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
