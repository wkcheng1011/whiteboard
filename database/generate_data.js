const fs = require("fs");
const sqlite = require("sqlite-async");
const { v4: uuid } = require('uuid');
const md5 = require("md5");
const randomWords = require('random-words');

const dbFile = "db.sqlite3";

function random(low, high) {
	return (Math.random() * (high - low) + low) | 0;
}

async function main() {
	if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);

	const db = await sqlite.open(dbFile);
	console.log("Opened database");

	const sqls = fs.readFileSync("db_schema.sql").toString().split(";");
	sqls.pop();

	for (const sql of sqls) {
		await db.run(sql);
	}

	await db.run("PRAGMA foreign_keys = ON");
	console.log("Initialized database schema");

	const tableArgCount = {
		users: 5,
		classes: 3,
		members: 2,
		questions: 3,
		answers: 4,
		attemptAnswers: 2
	};

	// Prepare database statements
	const stmts = {};

	for (const table in tableArgCount) {
		stmts[table] = await db.prepare(
			`insert into ${table} values (${Array(tableArgCount[table])
				.fill("?")
				.join(",")})`
		);
	}
	stmts["messages"] = await db.prepare(`insert into messages values (?, ?, ?, ?, datetime('now', ?, 'localtime'), ?)`);
	stmts["tasks"] = await db.prepare(`insert into tasks values (?, ?, (datetime('now', ?, 'localtime')), (datetime('now', ?, 'localtime')), ?, ?)`);
	stmts["attempts"] = await db.prepare(`insert into attempts (id, task_id, user_id) values (?, ?, ?)`);

	// Users (10 Students, 3 Teachers)
	const students = [];
	const teachers = [];

	for (let i = 1; i <= 10; i++) {
		const _uuid = uuid();
		students.push(_uuid);
		await stmts.users.run(
			_uuid,
			`Student ${randomWords()}`,
			0,
			`student${i}`,
			md5(`student${i}`)
		);
		console.log("users", { type: "student", i, _uuid });
	}
	for (let i = 1; i <= 3; i++) {
		const _uuid = uuid();
		teachers.push(_uuid);
		await stmts.users.run(
			_uuid,
			`Teacher ${randomWords()}`,
			1,
			`teacher${i}`,
			md5(`teacher${i}`)
		);
		console.log("users", { type: "teacher", i, _uuid });
	}

	// 6 Classes randomly distributed to 3 teachers
	const classes = {};

	for (let i = 1; i <= 6; i++) {
		const _uuid = uuid();
		const teacher = random(0, teachers.length);

		classes[_uuid] = teacher;
		await stmts.classes.run(_uuid, teachers[teacher], `Class ${randomWords()}`);
		console.log("class", { i, _uuid, teacher: teacher+1 });
	}

	// Distribute users into random classes
	for (const _class in classes) {
		for (const student of students) {
			if (random(0, 10) % 3 == 0) {
				await stmts.members.run(_class, student);
				console.log("member", {_class, student});
			}
		}
	}

	// 6 Class channels and some random DM channels
	const messages = [];

	for (const _class in classes) {
		const users = [...students, teachers[classes[_class]]];
		for (let i = 1; i <= random(3, 10); i++) {
			const _uuid = uuid();
			messages.push(_uuid);
			const from = random(0, users.length);
			let at = random(-3600, 3600);
			at = (at > 0 ? "+" : "") + at;

			await stmts.messages.run(_uuid, users[from], _class, 1, `${at} second`, randomWords({min: 5, max: 20, join: ' '}));
			console.log("messages", { i, _uuid, from: from, _class });
		}
	}

	for (let i = 1; i <= 10; i++) {
		const _uuid = uuid();
		messages.push(_uuid);

		let from, to;
		do {
			from = i < 3 ? i % 2 : random(0, students.length);
			to = i < 3 ? 1 - (i % 2) : random(0, students.length);
		} while (from == to);
		
		let at = random(-3600, 3600);
		at = (at > 0 ? "+" : "") + at;

		await stmts.messages.run(_uuid, students[from], students[to], 0, `${at} second`, randomWords({min: 5, max: 20, join: ' '}));
		console.log("messages", { i, _uuid, from, to });
	}

	// 18 Tasks randomly distributed to 6 classes
	const tasks = [];

	for (let i = 1; i <= 6; i++) {
		const _uuid = uuid();
		tasks.push(_uuid);
		const _class = random(0, Object.keys(classes).length);
		const startDay = random(-14, -7);
		const endDay = random(1, 14);

		await stmts.tasks.run(
			_uuid,
			Object.keys(classes)[_class],
			`${startDay} day`,
			`+${endDay} day`,
			`Task ${randomWords()}`,
			`
# Heading

## Sub heading

This is content. ${randomWords({min: 20, max: 100, join: ' '})}
			`
		);
		console.log("task", { i, _uuid, _class, startDay, endDay });

		// Each task have 5-10 questions
		const questions = {};
		for (let j = 0; j < random(5, 10); j++) {
			const _uuid2 = uuid();
			questions[_uuid2] = [];

			await stmts.questions.run(_uuid2, _uuid, randomWords({min: 5, max: 10, join: ' '}) + "?");
			console.log("question", {j, _uuid2, _uuid});

			const answersSize = random(3, 5);
			const correct = random(0, answersSize);

			for (let k = 0; k < answersSize; k++) {
				const _uuid3 = uuid();
				questions[_uuid2].push(_uuid3);
				await stmts.answers.run(_uuid3, _uuid2, correct == k ? "Correct" : "Incorrect", correct == k);
				console.log("answer", { k, _uuid3, _uuid2, correct: correct == k });
			}
		}

		for (const student of students) {
			if (random(0, 10) % 3 == 0) {
				const _uuid4 = uuid();
				await stmts.attempts.run(_uuid4, _uuid, student);
				console.log("attempt", {_uuid4, _uuid, student});
				for (const question in questions) {
					const answers = questions[question];
					const answer = random(0, answers.length);

					await stmts.attemptAnswers.run(_uuid4, answers[answer]);
					console.log("attemptAnswer", {_uuid4, question, ans: answers[answer]});
				}
			}
		}
	}

	console.log("Done");
}

main();
