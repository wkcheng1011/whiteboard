const express = require("express");
const { Database } = require("sqlite3");
const router = express.Router();

/* GET home page. */
router.get("/", async (req, res) => {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        res.render("index");
    }
});

module.exports = router;
