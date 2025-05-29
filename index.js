const express = require("express");
// const { createServer } = require("http");
const app = express();
// const server = createServer(app);
const userRoutes = require("./routes/User");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");

const cookieParse = require("cookie-parser");
const database = require("./config/database");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = +process.env.PORT || 4000;

// database connect
database.connect();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParse());
app.use(
  cors({
    origin: "https://study-notion-server-mu.vercel.app",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);

// def route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your sever is up and running...",
  });
});

app.listen(PORT, () => {
  console.log("Server successfully running on PORT: 4000");
});

// server.listen(PORT, () => {
//   console.log(`Server is listening on port ${PORT}`);
// });
