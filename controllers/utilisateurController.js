const db = require('../database');

exports.createUtilisateur = (req, res) => {
  const { nom, tell, email, chargeT, statut, fonction, password } = req.body;

  if (!nom || !tell || !email || !fonction || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'INSERT INTO Utilisateur (nom, tell, email, chargeT, statut, fonction, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [nom, tell, email, chargeT, 1, fonction, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/utilisateurs');
  });
};




exports.getAllUtilisateurs = (req, res) => {
  const query = 'SELECT * FROM Utilisateur';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.render('utilisateur/viewUtilisateurs', { utilisateurs: results });  });
};




exports.getUtilisateurById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Utilisateur WHERE id = ? AND statut = 1';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur not found' });
    }
    res.render('utilisateur/editUtilisateur', { utilisateur: results[0] });
  });
};




exports.updateUtilisateurById = (req, res) => {
  const { id } = req.params;
  const { nom, tell, email, chargeT, statut, fonction, password } = req.body;

  if (!nom || !tell || !email || !fonction) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'UPDATE Utilisateur SET nom = ?, tell = ?, email = ?, chargeT = ?, statut = ?, fonction = ?, password = ? WHERE id = ?';
  db.query(query, [nom, tell, email, chargeT, statut, fonction, password, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
   
    res.redirect('/utilisateurs');
  });
};



exports.deleteUtilisateurById = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Utilisateur WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilisateur not found' });
    }
    res.status(200).json({ message: 'Utilisateur deleted successfully' });
  });
};




exports.deleteAllUtilisateurs = (req, res) => {
  const query = 'DELETE FROM Utilisateur';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'All Utilisateurs deleted successfully' });
  });
};





exports.updateUtilisateurStatut = (req, res) => {
  const id = req.params.id;

  db.query('SELECT statut FROM Utilisateur WHERE id = ?', [id], (err, results) => {
      if (err) {
          console.error(err);
          res.redirect('/utilisateurs');
      } else {
          if (results.length > 0) {
              const newStatus = results[0].statut === 1 ? 0 : 1;

              db.query('UPDATE Utilisateur SET statut = ? WHERE id = ?', [newStatus, id], (err) => {
                  if (err) {
                      console.error(err);
                  }
                  res.redirect('/utilisateurs');
              });
          } else {
              res.redirect('/utilisateurs');
          }
      }
  });
};




exports.viewUtilisateurById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Utilisateur WHERE id = ? AND statut = 1';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error retrieving utilisateur:', err);
      return res.status(500).json({ error: 'Failed to retrieve utilisateur' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur not found' });
    }
    const utilisateur = results[0];
    res.render('utilisateur/view1Utilisateur', { utilisateur });
  });
};




exports.logTime = (req, res) => {
  const { id } = req.params;
  const { timeSpent } = req.body;

  const query = 'INSERT INTO TicketTimeLog (utilisateur_id, time_spent) VALUES (?, ?)';
  db.query(query, [id, timeSpent], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Time logged successfully' });
  });
};


// // Assign a role to a user
// exports.assignRole = (req, res) => {
//   const { userName, role } = req.body;

//   // Find the user by name
//   const findUserQuery = 'SELECT id FROM Utilisateur WHERE nom = ?';
//   db.query(findUserQuery, [userName], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (results.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const userId = results[0].id;

//     // Update the user's role
//     const updateRoleQuery = 'UPDATE Utilisateur SET fonction = ? WHERE id = ?';
//     db.query(updateRoleQuery, [role, userId], (err) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.redirect('utilisateur/userRole');
//     });
//   });
// };



exports.assignPermissions = (req, res) => {
  const { userId, permissions } = req.body;
  if (!userId || !permissions) {
    return res.status(400).json({ error: 'User ID and permissions are required.' });
  }

  // Ensure permissions is an array
  const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];

  // Begin transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction Error:', err);
      return res.status(500).json({ error: 'Failed to start transaction.' });
    }

    // Delete existing permissions for the user
    const deleteQuery = 'DELETE FROM UserPermissions WHERE user_id = ?';
    db.query(deleteQuery, [userId], (err) => {
      if (err) {
        return db.rollback(() => {
          console.error('Delete Error:', err);
          res.status(500).json({ error: 'Failed to clear previous permissions.' });
        });
      }

      // Insert new permissions
      const insertQuery = 'INSERT INTO UserPermissions (user_id, permission_id) VALUES ?';
      const values = permissionsArray.map(permissionId => [userId, permissionId]);

      db.query(insertQuery, [values], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error('Insert Error:', err);
            res.status(500).json({ error: 'Failed to assign permissions.' });
          });
        }

        // Commit transaction
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Commit Error:', err);
              res.status(500).json({ error: 'Failed to commit transaction.' });
            });
          }

          // Successfully assigned permissions
          res.redirect('/utilisateurs/userRole'); // Redirect to a relevant page
        });
      });
    });
  });
};


exports.getUserPermissions = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT Permissions.name FROM Permissions
    JOIN UserPermissions ON Permissions.id = UserPermissions.permission_id
    WHERE UserPermissions.user_id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};


