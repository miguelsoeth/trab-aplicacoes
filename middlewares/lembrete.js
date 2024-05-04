const fs = require('fs');

const lembrete = (req, res, next) => {
    const { mes } = req.query;
    const entries = JSON.parse(fs.readFileSync('./data/entries.json'));
    let filteredEntries = entries;
    if (mes) {
        const [year, month] = mes.split('-'); // month - 1 because month is zero-indexed in JavaScript Date objects
        filteredEntries = entries.filter(entry => {
            const [entryYear, entryMonth, entryDay] = entry.due_date.split('-');
            //console.log("FILTER", year, month, "ENTRY", entryYear, entryMonth, "RESULT", entryYear === year && entryMonth === month);
            return entryYear === year && entryMonth === month;
        });
    }
    const today = new Date().toLocaleDateString('en-GB', { timeZone: 'America/Sao_Paulo' }).split('/').reverse().join('-');

    // Filtra os lançamentos para encontrar os do dia e os em atraso
    const todayEntry = filteredEntries.filter(entry => entry.due_date === today && entry.type !== 'Receita' && entry.status !== 'Cancelada');
    const overdueEntries = filteredEntries.filter(entry => new Date(entry.due_date) < new Date(today) && entry.status !== 'Cancelada' && entry.type !== 'Receita' && entry.status !== 'Paga');
    // Adiciona os resultados ao objeto de resposta
    res.locals.todayEntry = todayEntry;
    res.locals.overdueEntries = overdueEntries;
    
    next();
};

module.exports = lembrete;
