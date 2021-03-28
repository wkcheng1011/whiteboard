const fs = require("fs");
const sqlite = require("sqlite-async");
const uuid = require("uuid/v4");
const md5 = require("md5");

const dbFile = "db.sqlite3";

function random(low, high) {
	return (Math.random() * (high - low) + low) | 0;
}

async function main() {
	fs.unlinkSync(dbFile);

	const db = await sqlite.open(dbFile);
	console.log("Opened database");

	const sqls = fs.readFileSync("db_schema.sql").toString().split(";");
	sqls.pop();

	for (const sql of sqls) {
		await db.run(sql);
	}
	console.log("Initialized database schema");

	const tables = {
		"users": 5, 
		"classes": 3, 
		"tasks": 5, 
		"questions": 3, 
		"answers": 4
	};

	const stmts = {};

	for (const table in tables) {
		stmts[table] = await db.prepare(`insert into ${table} values (${Array(tables[table]).fill('?').join(',')})`);
	}

	// Users (10 Students, 3 Teachers)
	const students = [];
	const teachers = [];

	for (let i = 1; i <= 10; i++) {
		const _uuid = uuid();
		students.push(_uuid);
		await stmts.users.run(_uuid, `Student ${i}`, 0, `student${i}`, md5(`student${i}`));
		console.log("student", { i, _uuid });
	}
	for (let i = 1; i <= 3; i++) {
		const _uuid = uuid();
		teachers.push(_uuid);
		await stmts.users.run(_uuid, `Teacher ${i}`, 1, `teacher${i}`, md5(`teacher${i}`));
		console.log("teacher", { i, _uuid });
	}

	// 6 Classes randomly distributed to 3 teachers
	const classes = [];
	
	for (let i = 1; i <= 6; i++) {
		const _uuid = uuid();
		classes.push(_uuid);
		const teacher = random(0, teachers.length);
		await stmts.classes.run(_uuid, teachers[teacher], `Class ${i}`);
		console.log("class", { i, _uuid, teacher });
	}

	// 18 Tasks randomly distributed to 6 classes
	const tasks = [];

	for (let i = 1; i <= 6; i++) {
		const _uuid = uuid();
		tasks.push(_uuid);
		const _class = random(0, classes.length);
		const startDay = random(1, 14);
		const duration = random(7, 14);

		await stmts.tasks.run(
			_uuid,
			classes[_class],
			`datetime('now', '+${startDay} day', 'localtime')`,
			`datetime('now', '+${startDay + duration} day', 'localtime')`,
			`Task ${i}`
		);
		console.log("task", { i, _uuid, _class, startDay, duration });

		// Each task have 5-10 questions
		const questions = [];
		for (let j = 0; j < random(5, 10); j++) {
			const _uuid2 = uuid();
			questions.push(_uuid2);
			
			await stmts.questions.run(_uuid2, _uuid, `Question ${j}`);

			const answers = [];
			const answersSize = random(3, 5);
			const correct = random(0, answersSize);

			for (let k = 0; k < answersSize; k++) {
				const _uuid3 = uuid();
				// await stmts.answers.run();
			}
			
		}
	}

	
	
	console.log("Done");
}

main();
