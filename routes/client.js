const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');



router.get('/', clientController.getAllClients);
router.get('/addClient', (req, res) => res.render('client/addClient'));
router.get('/:id/edit', clientController.getClientById);
router.post('/', clientController.createClient);
router.post('/:id/edit', clientController.updateClientById);
router.post('/updateStatut/:id', clientController.updateClientStatut);
router.get('/:id/view', clientController.viewClientById);


module.exports = router;
