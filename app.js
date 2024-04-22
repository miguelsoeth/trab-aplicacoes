const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const autenticador = require('./middlewares/autenticador');
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/admin');
    }
    else {
        res.render('login');
    }    
});

app.post('/login', autenticador, (req, res) => {
    res.redirect('/admin');
});

app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/login');
});

app.get('/admin', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        res.render('admin', { name: req.session.user.name });
    } else {
        res.redirect('/login');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});