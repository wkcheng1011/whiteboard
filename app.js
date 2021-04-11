const debug = true;

const createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const sqlite = require("sqlite-async");

const app = express();

const routes = {
	"/": "index.js",
	"/login": "login.js",
	"/messages/": "message.js",
	"/tasks/": "task.js",
	"/myprofile/": "myprofile.js"
};

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Session
app.use(
	session({
		secret: "whiteboard",
		resave: false,
		saveUninitialized: true,
		cookie: {},
	})
);

// Export session data
app.use((req, res, next) => {
	res.locals.dbg = debug;
	res.locals.session = req.session;
	next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(async (req, res, next) => {
	try {
		const db = await sqlite.open("database/db.sqlite3");
		await db.run("PRAGMA foreign_keys = ON");
		res.locals.db = db;
		next();
	} catch (e) {
		console.error("Database not found! Please initialize by running database/generate_data.js")
		process.exit(1);
	}
});

for (const path in routes) {
	const router = require("./routes/" + routes[path]);
	app.use(path, router);
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
