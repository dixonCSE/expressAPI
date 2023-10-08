const express = require("express");
const cors = require("cors");
const config = require("dotenv").config;

const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");

const app = express();
config();
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
	res.status(200).json({
		message: "user authenticated.",
	});
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

const port = process.env.HTTP_PORT || 8080;

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
