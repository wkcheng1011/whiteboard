const express = require("express");
const { Database } = require("sqlite3");
const uuid = require("uuid/v4");
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

		const messages = (await db.all("select count(*) as cnt, * from messages group by to_id order by at desc")).filter(message => {
			return message.type == 0 && message.to_id == req.session.user.id || message.type == 1
		}).map(message => {
			if (message.type == 0) { // DM
				message.name = users.filter(user => user.id == message.from_id)[0].name;
				message.target_id = message.from_id;
			} else { // GM
				message.name = classes.filter(_class => _class.id == message.to_id)[0].name;
				message.target_id = message.to_id;
			}
			return message;
		}).sort((m1, m2) => {
			return new Date(m2.at) - new Date(m1.at);
		});

		return res.render("message", { messages });
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

        const result = await db.get(`select * from users where id = ?`, to_id);
        
        if (!result) {
            return res.render("error", {
				message: "User does not exist",
				error: to_id
			});
        }

        // Create channel
        const channel_id = uuid();
        await db.run(`insert into channels values (?)`, channel_id);
        
        // Add the 2 users to channel
        for (const user_id of [from_id, to_id]) {
            await db.run("insert into participants values (?, ?)", channel_id, user_id);
        }

        // Add the message
        const message_id = uuid();
        await db.run("insert into messages (id, user_id, channel_id, title, content) values (?, ?, ?, ?, ?)", message_id, from_id, channel_id, req.body.title, req.body.content);
        
		res.redirect("/message");
	}
});

router.get(/\/(\d)\/(.{36})/, async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = req.originalUrl;
		return res.redirect("/login");
	} else {
		db = res.locals.db;
		const [type, id] = [req.params[0], req.params[1]];

		if ([0, 1].indexOf(type) == 1) {
			return res.render("error", { message: "Not a valid type", error: type });
		}

		if (!validator.isUUID(id)) {
			return res.render("error", { message: "Not a valid UUID", error: id });
		}

		let messages;
		if (type == 0) { // DM
			messages = await db.all("select users.name as displayname, * from messages, users where from_id = ? and from_id = users.id", id);
		} else { // GM
			messages = await db.all("select classes.name as displayname, users.name as user_name, * from messages, classes, users where to_id = ? and to_id = classes.id and from_id = users.id", id);
		}

		if (messages.length == 0) {
			return res.render("error", {
				message: "No messages",
				error: id,
			});
		}

		return res.render("messageView", { messages });
	}
});
module.exports = router;
