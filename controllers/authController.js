const db = require('../database'); // Adjust the path according to your project structure

exports.getLoginPage = (req, res) => {
  res.render('login');
};

exports.loginUser = (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  console.log(`Received login request for username: ${username}`);

  db.query("SELECT * FROM utilisateur WHERE nom = ? AND password = ?", [username, password], function(error, results, fields) {
    if (error) {
      console.error('Database query error:', error);
      res.render('login', { error: 'An error occurred. Please try again later.' });
      return;
    }

    if (results.length > 0) {
      const user = results[0];
      const userFonction = user.fonction;
      console.log(`User found with fonction: ${userFonction}`);

      // Redirect based on user function
      if (userFonction === 'directeur' || userFonction === 'support') {
        res.redirect('/home1');
      } else if (userFonction === 'employe') {
        res.redirect('/employe');
      } else {
        res.redirect('/');
      }
    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  });
};

exports.logoutUser = (req, res) => {
  res.redirect('/');
};
