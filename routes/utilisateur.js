const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const db = require('../database');


router.post('/', utilisateurController.createUtilisateur);
router.get('/addUtilisateur', (req, res) => res.render('utilisateur/addUtilisateur'));

router.get('/', utilisateurController.getAllUtilisateurs);
router.get('/:id/edit', utilisateurController.getUtilisateurById);
router.post('/:id/edit', utilisateurController.updateUtilisateurById);
// router.post('/:id/delete', utilisateurController.updateUtilisateurStatut); 
router.get('/:id/view', utilisateurController.viewUtilisateurById);
router.post('/:id/toggle', utilisateurController.updateUtilisateurStatut);

// Route to display the permissions management page
router.get('/userRole', (req, res) => {
    // Fetch all users and permissions to display
    const getUsersQuery = 'SELECT id, nom FROM Utilisateur WHERE statut = 1 ';
    const getPermissionsQuery = 'SELECT id, name FROM Permissions';
    
    db.query(getUsersQuery, (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      db.query(getPermissionsQuery, (err, permissions) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
  
        res.render('utilisateur/userRole', { users, permissions });
      });
    });
  });
  
  // Route to handle assigning permissions
  router.post('/assign-permissions', utilisateurController.assignPermissions);
  
  // router.post('/assign-permissions', (req, res) => {
  //   console.log("Route '/assign-permissions' reached.");
  //   utilisateurController.assignPermissions(req, res);
  // });
  

// router.post('/:id/logTime', utilisateurController.logTime);



module.exports = router;
