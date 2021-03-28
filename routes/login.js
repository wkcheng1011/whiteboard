const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/');
    } else {
        res.render('login', { title: 'Login' });
    }
});

router.post('/', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    req.session.loggedin = true;
    req.session.userid = "a";

    res.redirect('/');
});

module.exports = router;
