const express = require('express');
const router = express.Router();
const demandeurController = require('../controllers/demandeurController');



router.post('/', demandeurController.createDemandeur);
router.get('/', demandeurController.getAllDemandeurs);
router.get('/addDemandeur', (req, res) => res.render('demandeur/addDemandeur'));

router.get('/:id', demandeurController.getDemandeurById);
router.get('/:id/edit', (req, res) => {
    demandeurController.getDemandeurById(req, res, (err, demandeur) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('demandeurs/editDemandeur', { demandeur });
    });
});
router.post('/:id/edit', demandeurController.updateDemandeurById);


router.post('/updateStatut/:id', demandeurController.updateDemandeurStatut);
router.get('/:id/view', demandeurController.viewDemandeurById); 



module.exports = router;


