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
		const messages = await db.all("select * from messages where (to_id = ? and type = 0) or type = 1", req.session.user.id);

		if (req.session.user.type == 0) {
			const tasks = await db.all("select tasks.id as task_id, tasks.name as task_name, classes.name as class_name, * from tasks, classes where tasks.class_id = classes.id and tasks.id not in (select task_id from attempts where user_id = ?)", req.session.user.id);
			const attempts = await db.all("select attempts.id as attempt_id, * from attempts, tasks where user_id = ? and attempts.task_id = tasks.id", req.session.user.id);
			for (const attempt of attempts) {
				const answers = await db.all("select correct from attemptAnswers, answers where attempt_id = ? and attemptAnswers.answer_id = answers.id", attempt.attempt_id);
				attempt.answers = answers;
			}
			
			return res.render("students/index", { quote, tasks, attempts, badgeCount: messages.length });
		} else {
			//const tasks = await db.all("")
			return res.render("teachers/index", { quote, badgeCount: messages.length });
		}
	}
});

module.exports = router;
