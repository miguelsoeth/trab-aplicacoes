const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


function autenticador(req, res, next) {
  const users = JSON.parse(fs.readFileSync('./data/users.json'));
  const { account, password } = req.body;
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const user = users.find(u => (u.email === account || u.user === account) && u.pwd === hashedPassword);

  if (user) {
    req.session.user = user;
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = autenticador;