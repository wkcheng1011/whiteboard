const express = require("express");
const router = express.Router();

const fetch = require("node-fetch");
const { Database } = require("sqlite3");
let db = new Database("");

/* GET home page. */
router.get("/", async (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
	} else {
        db = res.locals.db;

		const quote = await (await fetch("https://api.quotable.io/random")).json();
        const tasks = await db.all("select tasks.id as task_id, tasks.name as task_name, classes.name as class_name, start, end, * from tasks, classes where tasks.class_id = classes.id");
        
		const messages = await db.all("select * from messages where (to_id = ? and type = 0) or type = 1", req.session.user.id);
		
		res.render("index", { quote, tasks, badgeCount: messages.length });
	}
});

module.exports = router;
