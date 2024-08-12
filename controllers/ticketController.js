const db = require('../database');



exports.createTicket = (req, res) => {
  const { description, notes, client_id, support_id, demandeure_id, etat, priorite } = req.body;

  if (!description || !client_id || !demandeure_id || !etat || !priorite ) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const statut = 1;
  const query = 'INSERT INTO Ticket (description, datereception, notes, client_id, support_id, demandeure_id, etat, priorite, statut) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [description, notes, client_id, support_id, demandeure_id, etat, priorite, statut], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.redirect('/tickets');
  });
};






exports.getAllTickets = (req, res) => {
    const query = `
        SELECT t.*, c.nom AS client_nom, d.nom AS demandeur_nom, d.signalerprobleme_description, d.signalerprobleme_type
        FROM Ticket t
        LEFT JOIN Client c ON t.client_id = c.id
        LEFT JOIN Demandeur d ON t.demandeure_id = d.id
        WHERE t.statut = 1
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('ticket/viewTickets', { tickets: results });
    });
};










exports.getTicketById = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT t.*, c.nom AS client_nom, d.nom AS demandeur_nom
    FROM Ticket t
    LEFT JOIN Client c ON t.client_id = c.id
    LEFT JOIN Demandeur d ON t.demandeure_id = d.id
    WHERE t.id = ? AND t.statut = 1
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.render('ticket/editTicket', { ticket: results[0] });
  });
};







exports.updateTicketById = (req, res) => {
  const { id } = req.params;
  const { description, datereception, notes, client_nom, support_id, demandeur_nom, etat, priorite, statut } = req.body;

  const getClientIdQuery = 'SELECT id FROM Client WHERE nom = ?';
  db.query(getClientIdQuery, [client_nom], (err, clientResult) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      const client_id = clientResult.length > 0 ? clientResult[0].id : null;

      const getDemandeurIdQuery = 'SELECT id FROM Demandeur WHERE nom = ?';
      db.query(getDemandeurIdQuery, [demandeur_nom], (err, demandeurResult) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
          const demandeure_id = demandeurResult.length > 0 ? demandeurResult[0].id : null;

          if (!description || !datereception || !client_nom || !demandeur_nom || !etat || !priorite || statut === undefined) {
              return res.status(400).json({ error: 'All required fields must be provided' });
          }

          const query = 'UPDATE Ticket SET description = ?, datereception = ?, notes = ?, client_id = ?, support_id = ?, demandeure_id = ?, etat = ?, priorite = ?, statut = ? WHERE id = ?';
          db.query(query, [description, datereception, notes, client_id, support_id, demandeure_id, etat, priorite, statut, id], (err, result) => {
              if (err) {
                  return res.status(500).json({ error: err.message });
              }
              if (result.affectedRows === 0) {
                  return res.status(404).json({ error: 'Ticket not found' });
              }
              res.redirect('/tickets');
          });
      });
  });
};



exports.deleteTicketById = (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE Ticket SET statut = 0 WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.redirect('/tickets');
  });
};



exports.deleteAllTickets = (req, res) => {
  const query = 'DELETE FROM Ticket';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'All tickets deleted successfully' });
  });
};




exports.viewTicketById = (req, res) => {
  const { id } = req.params;
  const query = `
      SELECT t.*, c.nom AS client_nom, d.nom AS demandeur_nom
      FROM Ticket t
      LEFT JOIN Client c ON t.client_id = c.id
      LEFT JOIN Demandeur d ON t.demandeure_id = d.id
      WHERE t.id = ? AND t.statut = 1
  `;
  db.query(query, [id], (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
          return res.status(404).json({ error: 'Ticket not found' });
      }
      res.render('ticket/view1Ticket', { ticket: results[0] });
  });
};



exports.ticketStats = (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // Months are 0-based
  const day = today.getDate();

  const statsQuery = `
    SELECT 
      COUNT(*) AS total_tickets,
      COUNT(CASE WHEN YEAR(datereception) = ? AND MONTH(datereception) = ? AND DAY(datereception) = ? THEN 1 END) AS today_tickets
    FROM Ticket 
    
  `;

  db.query(statsQuery, [year, month, day], (error, results) => {
    if (error) {
      console.error('Error executing query', error);
      return res.status(500).send('Error fetching data');
    }

    const stats = results[0];
    res.render('home1', {
      today_tickets: stats.today_tickets || 0,
      total_tickets: stats.total_tickets || 0
    });
  });
};



exports.getEnAttenteTickets = async (req, res) => {
  try {
      const query = `
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
          WHERE t.etat = 'En attente' AND t.statut = 1
      `;
      const results = await queryDatabase(query);
      res.render('ticket/enAttente', { tickets: results });
  } catch (error) {
      console.error('Error fetching "En attente" tickets:', error);
      res.status(500).send('Internal Server Error');
  }
};


exports.getEnCoursTickets = async (req, res) => {
  try {
      const query = `
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
          WHERE t.etat = 'En cours' AND t.statut = 1
      `;
      const results = await queryDatabase(query);
      res.render('ticket/enCours', { tickets: results });
  } catch (error) {
      console.error('Error fetching "En attente" tickets:', error);
      res.status(500).send('Internal Server Error');
  }
};

exports.getRejeteTickets = async (req, res) => {
  try {
      const query = `
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
          WHERE t.etat = 'rejete' AND t.statut = 1
      `;
      const results = await queryDatabase(query);
      res.render('ticket/rejete', { tickets: results });
  } catch (error) {
      console.error('Error fetching "En attente" tickets:', error);
      res.status(500).send('Internal Server Error');
  }
};


exports.getResoluTickets = async (req, res) => {
  try {
      const query = `
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
          WHERE t.etat = 'resolu' AND t.statut = 1
      `;
      const results = await queryDatabase(query);
      res.render('ticket/resolu', { tickets: results });
  } catch (error) {
      console.error('Error fetching "En attente" tickets:', error);
      res.status(500).send('Internal Server Error');
  }
};


exports.getInterventionTickets = async (req, res) => {
  try {
      const query = `
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
          WHERE t.etat = 'necessite une intervention' AND t.statut = 1
      `;
      const results = await queryDatabase(query);
      res.render('ticket/necessiteIntervention', { tickets: results });
  } catch (error) {
      console.error('Error fetching "En attente" tickets:', error);
      res.status(500).send('Internal Server Error');
  }
};


async function queryDatabase(query, params = []) {
  console.log('Executing query:', query, 'with params:', params);
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




// exports.logTime = (req, res) => {
//   const { id } = req.params;
//   const { timeSpent } = req.body;

//   const query = 'UPDATE Ticket SET time_spent = ? WHERE id = ?';
//   db.query(query, [timeSpent, id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.status(200).json({ message: 'Time logged successfully' });
//   });
// };
