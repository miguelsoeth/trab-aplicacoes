//npm installs
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
//middlewares
const autenticador = require('./middlewares/autenticador');
//routes
const usersRouter = require('./routes/usersRouter');
const accountsRouter = require('./routes/accountsRouter');
const categoriesRouter = require('./routes/categoriesRouter');
const entriesRouter = require('./routes/entriesRouter');
//app
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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

app.use('/admin', usersRouter);

app.use('/admin', accountsRouter);

app.use('/admin', categoriesRouter);

app.use('/admin', entriesRouter);

app.get('/lancamentos', (req, res) => {
    const entries = JSON.parse(fs.readFileSync('./data/entries.json'));
    res.render('entries', { entries });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});