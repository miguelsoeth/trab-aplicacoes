const express = require('express');
const session = require('express-session');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const app = express();
const autenticador = require('./middlewares/autenticador');
const PORT = 3000;
const users = JSON.parse(fs.readFileSync('./data/users.json'));

app.use(express.json());
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

app.get('/admin/cadastrar-usuario', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        res.render('cadastro_usuario', { users: users });
    } else {
        res.redirect('/admin');
    }
});

app.post('/admin/cadastrar-usuario', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const newUser = {
            id: uuidv4(),
            ...req.body
        };
        newUser.pwd = crypto.createHash('sha256').update(newUser.pwd).digest('hex');
        users.push(newUser);
        console.log(users);
        fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 4), 'utf-8');
        res.redirect('/admin/cadastrar-usuario');
    } else {
        res.redirect('/admin');
    }
});

app.delete('/admin/deletar-usuario/:id', (req, res) => {
    const userId = req.params.id;
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
        users.splice(index, 1);
        fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.put('/admin/editar-usuario/:id', (req, res) => {
    const userId = req.params.id;
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
        users[index] = {
            ...users[index],
            ...req.body
        };
        users[index].pwd = crypto.createHash('sha256').update(users[index].pwd).digest('hex');
        fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
        res.status(200).json(users[index]);
    } else {
        res.sendStatus(404);
    }
});

app.get('/admin/editar-usuario/:id', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const userId = req.params.id;
        const index = users.findIndex(user => user.id === userId);
        res.render('editar_usuario', { usuario: users[index] });
    } else {
        res.redirect('/admin');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});