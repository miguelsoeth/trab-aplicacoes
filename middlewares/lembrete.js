const fs = require('fs');

const lembrete = (req, res, next) => {
    const entries = JSON.parse(fs.readFileSync('./data/entries.json'));
    const today = new Date().toISOString().split('T')[0]; // Obtém a data de hoje

    // Filtra os lançamentos para encontrar os do dia e os em atraso
    const todayEntry = entries.filter(entry => entry.due_date === today);
    const overdueEntries = entries.filter(entry => new Date(entry.due_date) < new Date() && entry.status !== 'Cancelada');

    // Adiciona os resultados ao objeto de resposta
    res.locals.todayEntry = todayEntry;
    res.locals.overdueEntries = overdueEntries;
    
    next();
};

module.exports = lembrete;
