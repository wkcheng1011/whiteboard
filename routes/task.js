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

router.get(/\/attempt\/(.{36})/, async (req, res) => {
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

			const selectedAnswer = await db.get("select attemptAnswers.answer_id from attempts, attemptAnswers where attempts.id = ? and attemptAnswers.attempt_id = attempts.id and attemptAnswers.answer_id in (select id from answers where answers.question_id = ?)", id, question.id);
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
			const answer_id = req.body[question_id];
			await db.run("insert into attemptAnswers values (?, ?)", _uuid, answer_id);
		}

		return res.redirect(`/tasks/attempt/${_uuid}`);
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

		const tasks = await db.all("select * from tasks");
		for (const task of tasks) {
			const attemptAnswers = await db.all("select * from answers, attemptAnswers where attemptAnswers.answer_id = answers.id and attemptAnswers.attempt_id in (select id from attempts where task_id = ?)", task.id);
			task.average = attemptAnswers.filter(a => a.correct).length / attemptAnswers.length;
		}

		return res.render("teachers/task", { tasks });
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

		const classes = await db.all("select * from classes");

		return res.render("teachers/taskNew", { classes });
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

		const task_uuid = uuid();

		await db.run("insert into tasks values (?, ?, ?, ?, ?, ?)", 
			task_uuid, 
			req.body.class,
			req.body.start.replace("T", " ") + ":00",
			req.body.end.replace("T", " ") + ":00",
			req.body.title,
			req.body.description
		);

		const questions = {};
		for (const key in req.body) {
			let value;
			if (value = key.match(/^q-(.{5})$/)) { // Question
				questions[value[1]] = questions[value[1]] || {};
				questions[value[1]].question = req.body[key];
			} else if (value = key.match(/^q-(.{5})-c-(.{5})$/)) { // Answer
				questions[value[1]] = questions[value[1]] || {};
				questions[value[1]]["a-" + value[2]] = req.body[key];
			} else if (value = key.match(/^q-(.{5})-r$/)) { // Correct
				questions[value[1]] = questions[value[1]] || {};
				questions[value[1]].correct = "a-" + req.body[key];
			}
		}

		for (const question_id in questions) {
			const question = questions[question_id];
			const question_uuid = uuid();
			await db.run("insert into questions values (?, ?, ?)", question_uuid, task_uuid, question.question);
			for (const answer_id of Object.keys(question).filter(a => a.startsWith("a-"))) {
				const answer = question[answer_id];
				const answer_uuid = uuid();
				await db.run("insert into answers values (?, ?, ?, ?)", answer_uuid, question_uuid, answer, question.correct == answer_id);
			}
		}

		return res.redirect("/tasks");
	}
});

module.exports = router;
