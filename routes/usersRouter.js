const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const users = JSON.parse(fs.readFileSync('./data/users.json'));

router.get('/cadastrar-usuario', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        res.render('cadastro/cadastro_usuario', { users: users });
    } else {
        res.redirect('/admin');
    }
});

router.post('/cadastrar-usuario', (req, res) => {
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

router.delete('/deletar-usuario/:id', (req, res) => {
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

router.put('/editar-usuario/:id', (req, res) => {
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

router.get('/editar-usuario/:id', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const userId = req.params.id;
        const index = users.findIndex(user => user.id === userId);
        res.render('editar/editar_usuario', { usuario: users[index] });
    } else {
        res.redirect('/admin');
    }
});

module.exports = router;
