const express = require("express");
const { Database } = require("sqlite3");
const uuid = require("uuid/v4");
const { default: validator } = require("validator");
const router = express.Router();

let db = new Database("");

router.get("/", async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = "/message";
		res.redirect("/login");
	} else {
		db = res.locals.db;

		const messages = await db.all("select * from messages where channel_id in (select channel_id from participants where user_id = ?) and user_id != ?", req.session.user.id, req.session.user.id);

		res.render("message", { messages });
	}
});

router.get("/new", async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = "/message/new";
		res.redirect("/login");
	} else {
		db = res.locals.db;
		const stmt = await db.prepare("select * from users where id != ?");
        const users = await stmt.all(req.session.user.id);
		res.render("messageNew", { users });
	}
});

router.post("/new", async (req, res) => {
    if (!req.session.user) {
		req.session.redirect = "/message/new";
		res.redirect("/login");
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
        await db.run("insert into messages (id, user_id, channel_id, content) values (?, ?, ?, ?)", message_id, from_id, channel_id, req.body.content);
        
		res.redirect("/message");
	}
});

router.get("/*", async (req, res) => {
	if (!req.session.user) {
		req.session.redirect = "/message/" + req.params[0];
		res.redirect("/login");
	} else {
		db = res.locals.db;
		const id = req.params[0];

		if (!validator.isUUID(id)) {
			return res.render("error", { message: "Not a valid UUID", error: id });
		}

		const result = await db.get("select users.name as f, at, content from messages, users where messages.id = ? and user_id = users.id", id);
		if (!result) {
			return res.render("error", {
				message: "Message does not exist",
				error: id,
			});
		}
		const { f, at, content } = result;

		return res.render("messageView", { from: f, at, content });
	}
});
module.exports = router;
