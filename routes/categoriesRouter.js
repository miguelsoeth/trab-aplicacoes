const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const categories = JSON.parse(fs.readFileSync('./data/categories.json'));

router.get('/cadastrar-categoria', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        res.render('cadastro_categoria', { categories: categories });
    } else {
        res.redirect('/admin');
    }
});

router.post('/cadastrar-categoria', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const newCategory = {
            id: uuidv4(),
            ...req.body
        };
        categories.push(newCategory);
        console.log(categories);
        fs.writeFileSync('./data/categories.json', JSON.stringify(categories, null, 4), 'utf-8');
        res.redirect('/admin/cadastrar-categoria');
    } else {
        res.redirect('/admin');
    }
});

router.put('/editar-categoria/:id', (req, res) => {
    const categoryID = req.params.id;
    const index = categories.findIndex(category => category.id === categoryID);
    if (index !== -1) {
        categories[index] = {
            ...categories[index],
            ...req.body
        };
        fs.writeFileSync('./data/categories.json', JSON.stringify(categories, null, 2));
        res.status(200).json(categories[index]);
    } else {
        res.sendStatus(404);
    }
});

router.get('/editar-categoria/:id', (req, res) => {
    if (req.session.user && req.session.user.level === 'admin') {
        const categoryId = req.params.id;
        const index = categories.findIndex(category => category.id === categoryId);
        res.render('editar_categoria', { category: categories[index] });
    } else {
        res.redirect('/admin');
    }
});

router.delete('/deletar-categoria/:id', (req, res) => {
    const categoryId = req.params.id;
    const index = categories.findIndex(category => category.id === categoryId);
    if (index !== -1) {
        categories.splice(index, 1);
        fs.writeFileSync('./data/categories.json', JSON.stringify(categories, null, 2));
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;