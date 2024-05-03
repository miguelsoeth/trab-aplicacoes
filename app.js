//npm installs
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
//middlewares
const autenticador = require('./middlewares/autenticador');
const lembrete = require('./middlewares/lembrete');
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

app.get('/usuario-nao-ativado', (req, res) => {
    res.render('off.ejs', { nome: req.session.user.name });
});

app.get('/login', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        res.redirect('/admin');
    }
    else if (req.session.user) {
        res.redirect('/lancamentos');
    }
    else {
        res.render('login');
    }    
});

app.post('/login', autenticador, (req, res) => {
    if (req.session.user.status === 'off') {
        res.redirect('/usuario-nao-ativado');
    }
    else if (req.session.user && req.session.user.level === 'admin') {
        res.redirect('/admin');
    }
    else {
        res.redirect('/lancamentos');
    }    
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

app.get('/lembrete', (req, res) => {
    res.render('lembrete');
});

app.use('/admin', usersRouter);

app.use('/admin', accountsRouter);

app.use('/admin', categoriesRouter);

app.use('/admin', entriesRouter);

app.get('/lancamentos', lembrete, (req, res) => {    
    if (req.session.user) {
        const entries = JSON.parse(fs.readFileSync('./data/entries.json'));
        const { mes } = req.query;
        
        let filteredEntries = entries;
        if (mes) {
            const [year, month] = mes.split('-'); // month - 1 because month is zero-indexed in JavaScript Date objects
            filteredEntries = entries.filter(entry => {
                const [entryYear, entryMonth, entryDay] = entry.due_date.split('-');
                //console.log("FILTER", year, month, "ENTRY", entryYear, entryMonth, "RESULT", entryYear === year && entryMonth === month);
                return entryYear === year && entryMonth === month;
            });
        }
        const todayEntry = res.locals.todayEntry;
        const overdueEntries = res.locals.overdueEntries;
        const level = req.session.user.level;
        console.log("TODAY: ", todayEntry, "OVERDUE", overdueEntries);
        res.render('entries', { entries: filteredEntries, level, todayEntry, overdueEntries });
    } else {
        res.redirect('/login');
    }    
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});