const express = require('express')
const router = express.Router();
const passport = require('passport');
const User = require('../models/users');


//Register
router.post('/register', async (req, res) => {
    try {
        const isAdmin = req.body.isAdmin === true;
        const user = await User.register(
            new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                age: req.body.age,
                gender: req.body.gender,
                email: req.body.email,
                username: req.body.username,
                isAdmin
            }),
            req.body.password
        );
        passport.authenticate('local')(req, res, () => {
            res.json({ success: true, user });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


//Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!user) {
            return res.json({ success: false, error: 'Authenticate failed' });
        }
        req.logIn(user, (loginErr) => {
            if (loginErr) {
                return res.status(500).json({ success: false, error: loginErr.message });
            }

            return res.json({ success: true, user })
        })
    })(req, res, next)
})


//Check if user is login or not
router.get('/check-auth', (req, res) => {
    console.log("User auth:", req.isAuthenticated)
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false, user: null });
    }
})

//Logout
router.get('/logout', (req, res) => {
    req.logOut(err => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message })
        }
        res.json({ success: true })
    })
})


//admin register
router.get('/admin/register', (req, res) => {
    res.render('adminRegister')
})


router.post('/admin/register', async (req, res) => {
    try {

        const secretCode = req.body.secretCode;
        if (secretCode !== process.env.ADMIN_SECRET_CODE) {
            return res.render('adminRegister', { errorMessage: 'Invalid code.' });
        }

        const isAdmin = true;
        const user = User.register(
            new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                age: req.body.age,
                gender: req.body.gender,
                email: req.body.email,
                username: req.body.username,
                isAdmin
            }),
            req.body.password);
        passport.authenticate('local')(req, res, () => {
            res.json({ success: true, user });
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

router.get('/admin/login', (req, res) => {
    res.render('adminLogin')
})

router.post('/admin/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!user) {
            return res.render('adminLogin', { errorMessage: 'Authentication failed' });
        }
        if (!user.isAdmin) {
            return res.render('adminLogin', { errorMessage: 'You are not admin.' });
        }
        req.logIn(user, (loginErr) => {
            if (loginErr) {
                return res.status(500).json({ success: false, error: loginErr.message });
            }
            console.log('Admin login successful.')
            res.redirect('/')
        })
    })(req, res, next);
})

router.get('/admin/logout', (req, res) => {
    req.logOut(err => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.redirect('/admin/login');
    })
})

module.exports = router;
