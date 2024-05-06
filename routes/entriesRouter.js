const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const entries = JSON.parse(fs.readFileSync('./data/entries.json'));

router.get('/cadastrar-entrada', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const categories = JSON.parse(fs.readFileSync('./data/categories.json'));
        const accounts = JSON.parse(fs.readFileSync('./data/accounts.json'));
        res.render('cadastro/cadastro_entrada', { entries: entries, categoriesList: categories, accountsList: accounts });
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
        delete newEntry.account_type;
        entries.push(newEntry);
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
        const accounts = JSON.parse(fs.readFileSync('./data/accounts.json'));
        const entryId = req.params.id;
        const index = entries.findIndex(entry => entry.id === entryId);
        const categories = JSON.parse(fs.readFileSync('./data/categories.json'));
        res.render('editar/editar_entrada', { entry: entries[index], categoriesList: categories, accountsList: accounts });
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
        delete entries[index].account_type;
        if (entries[index].status === "Lançada") {
            entries[index].payment_date = null;
        }
        fs.writeFileSync('./data/entries.json', JSON.stringify(entries, null, 2));
        res.status(200).json(entries[index]);
    } else {
        res.sendStatus(404);
    }
});

router.put('/confirmar-entrada/:id/:date', (req, res) => {
    const entryId = req.params.id;
    const confirmDate = req.params.date;
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
        entries[index] = {
            ...entries[index],
            status: "Confirmada",
            payment_date: confirmDate
        };
        fs.writeFileSync('./data/entries.json', JSON.stringify(entries, null, 2));
        res.status(200).json(entries[index]);
    } else {
        res.sendStatus(404);
    }
});

router.put('/cancelar-entrada/:id', (req, res) => {
    const entryId = req.params.id;
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
        entries[index] = {
            ...entries[index],
            status: "Cancelada",            
            payment_date: null
        };
        fs.writeFileSync('./data/entries.json', JSON.stringify(entries, null, 2));
        res.status(200).json(entries[index]);
    } else {
        res.sendStatus(404);
    }
});

router.put('/pagar-entrada/:id', (req, res) => {
    const entryId = req.params.id;
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month since it's zero-based
        const day = String(currentDate.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        entries[index] = {
            ...entries[index],
            status: "Paga",
            payment_date: formattedDate
        };
        fs.writeFileSync('./data/entries.json', JSON.stringify(entries, null, 2));
        res.status(200).json(entries[index]);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;