const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');




router.post('/', ticketController.createTicket);
router.get('/addTicket', (req, res) => res.render('ticket/addTicket')); 

router.get('/', ticketController.getAllTickets);
router.get('/:id/edit', ticketController.getTicketById);
router.post('/:id/edit', ticketController.updateTicketById);
router.delete('/:id', ticketController.deleteTicketById);
router.delete('/', ticketController.deleteAllTickets);
router.get('/:id/view', ticketController.viewTicketById);
router.get('/home1' , ticketController.ticketStats);
router.get('/en-attente', ticketController.getEnAttenteTickets);
router.get('/en-cours', ticketController.getEnCoursTickets);
router.get('/resolu', ticketController.getResoluTickets);
router.get('/rejete', ticketController.getRejeteTickets);
router.get('/necessiteIntervention', ticketController.getInterventionTickets);







// router.post('/:id/logTime', ticketController.logTime);




module.exports = router;
