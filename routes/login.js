const express = require("express");
const router = express.Router();

/* GET users listing. */
    if (req.session.loggedin) {
        res.redirect('/');
    } else {
        res.render('login', { title: 'Login' });
    }
router.get("/", (req, res) => {
});

router.post('/', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    req.session.loggedin = true;
    req.session.userid = "a";

    res.redirect('/');
});

module.exports = router;
