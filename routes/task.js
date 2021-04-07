const express = require("express");
const router = express.Router();
const { v4: uuid } = require('uuid');
const { Database } = require("sqlite3");
const { default: validator } = require("validator");
let db = new Database("");

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
	return array;
}

router.get(/\/attempts\/(.{36})/, async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
        db = res.locals.db;

		const id = req.params[0];

		if (!validator.isUUID(id)) {
			return res.render("error", { message: "Not a valid UUID", error: id });
		}

		const meta = await db.get("select users.name as user_name, tasks.name as task_name, * from attempts, tasks, users where attempts.id = ? and attempts.task_id = tasks.id and attempts.user_id = users.id", id);

		const questions = shuffle(await db.all("select * from questions where task_id = (select task_id from attempts where id = ?)", id));
		for (const question of questions) {
			const answers = await db.all("select * from answers where question_id = ?", question.id);
			question.answers = shuffle(answers);

			const selectedAnswer = await db.get("select attemptAnswers.answer_id from attempts, attemptAnswers where attempts.id = ? and attemptAnswers.attempt_id = attempts.id and attemptAnswers.question_id = ?", id, question.id);
			question.selected = selectedAnswer.answer_id;
		}

		if (!meta) {
			return res.render("error", { message: "Not a valid task", error: id });
		}

		return res.render("taskAttempt", { meta, questions });
	}
});

router.get(/\/contents\/(.{36})/, async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
        db = res.locals.db;

		const id = req.params[0];

		if (!validator.isUUID(id)) {
			return res.render("error", { message: "Not a valid UUID", error: id });
		}

		if (req.session.user.type == 0) {
			const taskMeta = await db.get("select * from tasks where id = ?", id);
			
			const questions = shuffle(await db.all("select * from questions where task_id = ?", id));
			for (const question of questions) {
				const answers = await db.all("select * from answers where question_id = ?", question.id);
				question.answers = shuffle(answers);
			}
		
			if (!taskMeta) {
				return res.render("error", { message: "Not a valid task", error: id });
			}

			return res.render("students/task", { taskMeta, questions });
		} else {
			return res.render("teachers/task", { taskMeta, questions });
		}
		
	}
});

router.post(/\/contents\/(.{36})/, async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
        db = res.locals.db;

		const id = req.params[0];

		if (!validator.isUUID(id)) {
			return res.render("error", { message: "Not a valid UUID", error: id });
		}

		const _uuid = uuid();
		await db.run("insert into attempts (id, task_id, user_id) values (?, ?, ?)", _uuid, id, req.session.user.id);

		for (const question_id in req.body) {
			const _uuid2 = uuid();
			const answer_id = req.body[question_id];
			await db.run("insert into attemptAnswers values (?, ?, ?, ?)", _uuid2, _uuid, answer_id, question_id);
		}

		return res.redirect(`/tasks/attempts/${_uuid}`);
	}
});

router.get("/", async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else if (req.session.user.type != 1) {
		return res.redirect("/");
	} else {
        db = res.locals.db;

		return res.render("teachers/task");
	}
});

router.get("/new", async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else if (req.session.user.type != 1) {
		return res.redirect("/");
	} else {
        db = res.locals.db;

		return res.render("teachers/taskNew");
	}
});

router.post("/new", async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else if (req.session.user.type != 1) {
		return res.redirect("/");
	} else {
        db = res.locals.db;

		// const test = JSON.parse(req.body.test);

		// await db.run("insert into tasks");
		return res.render("teachers/taskNew");
	}
});

module.exports = router;
