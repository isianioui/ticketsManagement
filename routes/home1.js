const express = require('express');
const router = express.Router();
const db = require('../database');

async function queryDatabase(query, params = []) {
    return new Promise((resolve, reject) => {
        db.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

router.get('/', async (req, res) => {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const clientResults = await queryDatabase('SELECT * FROM Client WHERE statut = 1 ');
        const demandeurResults = await queryDatabase('SELECT * FROM Demandeur WHERE statut = 1 ');
        const ticketResults = await queryDatabase('SELECT * FROM Ticket WHERE statut = 1 ');
        const utilisateurResults = await queryDatabase('SELECT * FROM Utilisateur WHERE statut = 1 ');

        const statsQuery = `
            SELECT 
                COUNT(*) AS total_tickets,
                COUNT(CASE WHEN YEAR(datereception) = ? AND MONTH(datereception) = ? AND DAY(datereception) = ? THEN 1 END) AS today_tickets
            FROM Ticket
            WHERE statut = 1 
        `;
        const statsResults = await queryDatabase(statsQuery, [year, month, day]);
        const stats = statsResults[0];

        const todayTicketsQuery = `
            SELECT 
                t.id,
                t.description,
                DATE_FORMAT(t.datereception, '%d/%m/%Y %H:%i:%s') as datereception,
                t.etat,
                t.notes,
                t.priorite,
                c.nom AS client_nom,
                d.nom AS demandeur_nom
            FROM Ticket t
            JOIN Client c ON t.client_id = c.id
            JOIN Demandeur d ON t.demandeure_id = d.id
            WHERE DATE(t.datereception) = CURDATE()
            LIMIT 0, 25
        `;
        const todayTicketsResults = await queryDatabase(todayTicketsQuery);

        const openTickets = await queryDatabase('SELECT * FROM Ticket WHERE etat = "en attente" AND statut = 1');
        const inProgressTickets = await queryDatabase('SELECT * FROM Ticket WHERE etat = "en cours" AND statut = 1');
        const closedTickets = await queryDatabase('SELECT * FROM Ticket WHERE etat = "resolu" AND statut = 1');
        const rejectedTickets = await queryDatabase('SELECT * FROM Ticket WHERE etat = "rejete" AND statut = 1');
        const interventionNeededTickets = await queryDatabase('SELECT * FROM Ticket WHERE etat = "necessite une intervention" AND statut = 1');

        const highPriorityTickets = await queryDatabase('SELECT * FROM Ticket WHERE priorite = "haute" AND statut = 1');
        const mediumPriorityTickets = await queryDatabase('SELECT * FROM Ticket WHERE priorite = "moyenne" AND statut = 1');
        const lowPriorityTickets = await queryDatabase('SELECT * FROM Ticket WHERE priorite = "basse" AND statut = 1');

        const openedTicketsData = await queryDatabase(`
            SELECT MONTH(datereception) as month, COUNT(*) as count 
            FROM Ticket 
            WHERE statut = 1 
            GROUP BY MONTH(datereception)
        `);

        const closeTicketsData = await queryDatabase(`
            SELECT MONTH(datereception) as month, COUNT(*) as count 
            FROM Ticket 
            WHERE statut = 0 
            GROUP BY MONTH(datereception)
        `);

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const openedTickets = new Array(12).fill(0);
        const closeTickets = new Array(12).fill(0);

        openedTicketsData.forEach(item => {
            openedTickets[item.month - 1] = item.count;
        });

        closeTicketsData.forEach(item => {
            closeTickets[item.month - 1] = item.count;
        });

        res.render('home1', {
            clients: clientResults,
            demandeurs: demandeurResults,
            tickets: ticketResults,
            utilisateurs: utilisateurResults,
            today_tickets: stats.today_tickets || 0,
            total_tickets: stats.total_tickets || 0,
            todayTickets: todayTicketsResults,
            open_tickets: openTickets.length,
            in_progress_tickets: inProgressTickets.length,
            closed_tickets: closedTickets.length,
            rejected_tickets: rejectedTickets.length,
            intervention_needed_tickets: interventionNeededTickets.length,
            high_priority_tickets: highPriorityTickets.length,
            medium_priority_tickets: mediumPriorityTickets.length,
            low_priority_tickets: lowPriorityTickets.length,
            monthLabels: months,
            openedTickets: openedTickets,
            closedTickets: closeTickets,
            total_clients: clientResults.length,
            total_demandeurs: demandeurResults.length,
            total_utilisateurs: utilisateurResults.length
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});



// // Add this route to home1.js for 'En attente' tickets
// router.get('./tickets/enAttente', async (req, res) => {
//     try {
//         // Query to fetch tickets with 'En attente' status
//         const enAttenteTicketsQuery = `
//             SELECT 
//                 t.id,
//                 t.description,
//                 DATE_FORMAT(t.datereception, '%d/%m/%Y %H:%i:%s') as datereception,
//                 t.etat,
//                 t.notes,
//                 t.priorite,
//                 c.nom AS client_nom,
//                 d.nom AS demandeur_nom
//             FROM Ticket t
//             JOIN Client c ON t.client_id = c.id
//             JOIN Demandeur d ON t.demandeure_id = d.id
//             WHERE t.etat = 'En attente' AND t.statut = 1
//         `;
//         const enAttenteTicketsResults = await queryDatabase(enAttenteTicketsQuery);

//         // Render the enAttente view and pass the tickets data
//         res.render('ticket/enAttente', { tickets: enAttenteTicketsResults });
//     } catch (error) {
//         console.error('Error fetching "En attente" tickets:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


module.exports = router;
