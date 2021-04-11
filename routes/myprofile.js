const express = require("express");
const md5 = require("md5");
const router = express.Router();

const fetch = require("node-fetch");

const { Database } = require("sqlite3");
let db = new Database("");

router.get("/", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
	} else {
		db = res.locals.db;
		const quote = await (await fetch("https://api.quotable.io/random")).json();
		const messages = await db.all("select * from messages where (to_id = ? and type = 0) or type = 1", req.session.user.id);
        
		res.render("myprofile", { quote, badgeCount: messages.length });
	}
});

module.exports = router;