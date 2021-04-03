const express = require("express");
const router = express.Router();

const { Database } = require("sqlite3");
let db = new Database("");


router.get("/", async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
        db = res.locals.db;
	}
});

module.exports = router;
