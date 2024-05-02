const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const entries = JSON.parse(fs.readFileSync('./data/entries.json'));

router.get('/cadastrar-entrada', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const categories = JSON.parse(fs.readFileSync('./data/categories.json'));
        res.render('cadastro_entrada', { entries: entries, categoriesList: categories });
    } else {
        res.redirect('/admin');
    }
});

router.post('/cadastrar-entrada', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const newEntry = {
            id: uuidv4(),
            ...req.body
        };
        entries.push(newEntry);
        console.log(entries);
        fs.writeFileSync('./data/entries.json', JSON.stringify(entries, null, 4), 'utf-8');
        res.redirect('/admin/cadastrar-entrada');
    } else {
        res.redirect('/admin');
    }
});

router.delete('/deletar-entrada/:id', (req, res) => {
    const entryId = req.params.id;
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
        entries.splice(index, 1);
        fs.writeFileSync('./data/entries.json', JSON.stringify(entries, null, 2));
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

router.get('/editar-entrada/:id', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const entryId = req.params.id;
        const index = entries.findIndex(entry => entry.id === entryId);
        const categories = JSON.parse(fs.readFileSync('./data/categories.json'));
        res.render('editar_entrada', { entry: entries[index], categoriesList: categories });
    } else {
        res.redirect('/admin');
    }
});

router.put('/editar-entrada/:id', (req, res) => {
    const entryId = req.params.id;
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
        entries[index] = {
            ...entries[index],
            ...req.body
        };
        fs.writeFileSync('./data/entries.json', JSON.stringify(entries, null, 2));
        res.status(200).json(entries[index]);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;