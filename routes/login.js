const express = require("express");
const md5 = require("md5");
const router = express.Router();

/* GET users listing. */
router.get("/", (req, res) => {
    if ("logout" in req.query) {
        req.session.user = undefined;
        res.redirect("/login");
    } else if (req.session.user) {
        res.redirect(req.session.redirect || "/");
	} else {
		res.render("login", { failed: false });
	}
});

router.post("/", async (req, res) => {
	try {
		const username = req.body.username;
		const password = req.body.password;

		const db = res.locals.db;
		const stmt = await db.prepare(
			"select * from users where username = ? and password = ?"
		);
		const result = await stmt.get(username, md5(password));

		if (result) {
			req.session.user = result;
			return res.redirect(req.session.redirect || "/");
		}
	} catch (e) {
	} 
    return res.render("login", { failed: true });
});

module.exports = router;
