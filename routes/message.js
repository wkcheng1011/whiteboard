const express = require("express");
const { Database } = require("sqlite3");
const { default: validator } = require("validator");
const router = express.Router();

let db = new Database("");

router.get("/", async (req, res) => {
    if (!req.session.user) {
        req.session.redirect = "/message";
        res.redirect("/login");
    } else {
        db = res.locals.db;

        const stmt = await db.prepare("select * from messages where channel_id in (select id from channels where id in (select channel_id from participants where user_id = ?))");
        const result = await stmt.all(req.session.user.id);

        res.render("message", {messageCount: result.length});
    }
});

router.get("/new", async (req, res) => {
    if (!req.session.user) {
        req.session.redirect = "/message";
        res.redirect("/login");
    } else {
        db = res.locals.db;

        const stmt = await db.prepare("select * from messages where channel_id in (select id from channels where id in (select channel_id from participants where user_id = ?))");
        const result = await stmt.all(req.session.user.id);

        res.render("message", {messageCount: result.length});
    }
});

router.get("/*", async (req, res) => {
    if (!req.session.user) {
        req.session.redirect = "/message";
        res.redirect("/login");
    } else {
        db = res.locals.db;
        const id = req.params[0];
        
        if (!validator.isUUID(id)) {
            return res.render("error", {message: "Not a valid UUID", error: id});
        }
        const stmt = await db.prepare("select users.name as f, at, content from messages, users where messages.id = ? and user_id = users.id");
        const result = await stmt.get(id);
        if (!result) {
            return res.render("error", {message: "Message does not exist", error: id});
        }
        const {f, at, content} = result;

        return res.render("messageView", {from: f, at, content});
    }
});
module.exports = router;
