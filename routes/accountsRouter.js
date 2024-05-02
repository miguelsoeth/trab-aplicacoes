const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const accounts = JSON.parse(fs.readFileSync('./data/accounts.json'));

router.get('/cadastrar-conta', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        res.render('cadastro_conta', { accounts: accounts });
    } else {
        res.redirect('/admin');
    }
});

router.post('/cadastrar-conta', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const newAccount = {
            id: uuidv4(),
            description: req.body.tipo,
            comments: `${req.body.banco}: ${req.body.conta}`
        };
        accounts.push(newAccount);
        console.log(accounts);
        fs.writeFileSync('./data/accounts.json', JSON.stringify(accounts, null, 4), 'utf-8');
        res.redirect('/admin/cadastrar-conta');
    } else {
        res.redirect('/admin');
    }
});

router.put('/editar-conta/:id', (req, res) => {
    const accountId = req.params.id;
    const index = accounts.findIndex(account => account.id === accountId);
    const editAccount = {
        description: req.body.tipo,
        comments: `${req.body.banco}: ${req.body.conta}`
    };
    if (index !== -1) {
        accounts[index] = {
            ...accounts[index],
            ...editAccount
        };
        fs.writeFileSync('./data/accounts.json', JSON.stringify(accounts, null, 2));
        res.status(200).json(accounts[index]);
    } else {
        res.sendStatus(404);
    }
});

router.get('/editar-conta/:id', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const accountId = req.params.id;
        const index = accounts.findIndex(accounts => accounts.id === accountId);
        const [banco, conta] = accounts[index].comments.split(':').map(str => str.trim());
        const editAccount = {
            banco: banco,
            conta: conta,
            tipo: accounts[index].description
        };
        res.render('editar_conta', { account: editAccount });
    } else {
        res.redirect('/admin');
    }
});

router.delete('/deletar-conta/:id', (req, res) => {
    const accountId = req.params.id;
    const index = accounts.findIndex(account => account.id === accountId);
    if (index !== -1) {
        accounts.splice(index, 1);
        fs.writeFileSync('./data/accounts.json', JSON.stringify(accounts, null, 2));
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;