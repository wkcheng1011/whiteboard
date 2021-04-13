const express = require("express");
const { Database } = require("sqlite3");
const { v4: uuid } = require('uuid');
const { default: validator } = require("validator");
const router = express.Router();

let db = new Database("");

router.get("/", async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
		db = res.locals.db;

		const classes = await db.all("select * from classes");
		const users = await db.all("select * from users");

		const counts = {};

		const sentMessages = await db.all("select * from messages where from_id = ? and type = 0", req.session.user.id);
		const receivedMessages = await db.all("select * from messages where to_id = ? and type = 0", req.session.user.id);

		for (const message of sentMessages) {
			counts[message.to_id] = counts[message.to_id] || message;
			counts[message.to_id].name = users.filter(_user => _user.id == message.to_id)[0].name;
			counts[message.to_id].target_id = message.to_id;
			counts[message.to_id].cnt = (counts[message.to_id].cnt || 0) + 1;
		}

		for (const message of receivedMessages) {
			counts[message.from_id] = counts[message.from_id] || message;
			counts[message.from_id].name = users.filter(_user => _user.id == message.from_id)[0].name;
			counts[message.from_id].target_id = message.from_id;
			counts[message.from_id].cnt = (counts[message.from_id].cnt || 0) + 1;
		}

		const classMessages = (await db.all("select count(*) as cnt, * from messages where type = 1 group by to_id order by at desc")).map(message => {
			message.name = classes.filter(_class => _class.id == message.to_id)[0].name;
			message.target_id = message.to_id;
			return message;
		});

		return res.render("message", { messages: [...Object.values(counts), ...classMessages].sort((m1, m2) => {
			return new Date(m2.at) - new Date(m1.at);
		}) });
	}
});

router.get("/new", async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
		db = res.locals.db;
		const stmt = await db.prepare("select * from users where id != ?");
        const users = await stmt.all(req.session.user.id);
		res.render("messageNew", { users });
	}
});

router.post("/new", async (req, res) => {
    if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
		db = res.locals.db;
        const from_id = req.session.user.id;
        const to_id = req.body.to;
        
        if (!validator.isUUID(to_id)) {
			return res.render("error", { message: "Not a valid UUID", error: to_id });
		}

        // Add the message
        const message_id = uuid();
        await db.run("insert into messages (id, from_id, to_id, type, content) values (?, ?, ?, ?, ?)", message_id, from_id, to_id, 0, req.body.content);
        
		res.redirect("/messages/0/" + to_id);
	}
});

router.get(/\/(\d)\/(.{36})/, async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
		db = res.locals.db;
		const [type, id] = [req.params[0], req.params[1]];

		if ([0, 1].indexOf(type-0) == -1) {
			return res.render("error", { message: "Not a valid type", error: type });
		}

		if (!validator.isUUID(id)) {
			return res.render("error", { message: "Not a valid UUID", error: id });
		}

		
		let messages, displayname;
		if (type == 0) { // DM
			displayname = (await db.get("select name from users where id = ?", id)).name;
			messages = await db.all("select * from messages, users where (from_id = ? and to_id = ? or from_id = ? and to_id = ?) and from_id = users.id", id, req.session.user.id, req.session.user.id, id);
		} else { // GM
			displayname = (await db.get("select name from classes where id = ?", id)).name;
			messages = await db.all("select classes.name as displayname, users.name as user_name, * from messages, classes, users where to_id = ? and to_id = classes.id and from_id = users.id", id);
		}

		messages = messages.sort((m1, m2) => {
			return new Date(m1.at) - new Date(m2.at);
		});

		return res.render("messageView", { displayname, messages });
	}
});

router.post(/\/(\d)\/(.{36})/, async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
		db = res.locals.db;
		const [type, id] = [req.params[0], req.params[1]];

		if ([0, 1].indexOf(type-0) == -1) {
			return res.render("error", { message: "Not a valid type", error: type });
		}

		if (!validator.isUUID(id)) {
			return res.render("error", { message: "Not a valid UUID", error: id });
		}

		const _uuid = uuid();
		await db.run("insert into messages (id, from_id, to_id, type, content) values (?, ?, ?, ?, ?)", _uuid, req.session.user.id, id, type, req.body.message);

		return res.redirect(req.originalUrl);
	}
});
module.exports = router;
