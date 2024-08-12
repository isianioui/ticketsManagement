const db = require('../database');

exports.createDemandeur = (req, res) => {
    const { nom, signalerprobleme_description, signalerprobleme_type, telephone, adresse } = req.body;

    if (!nom || !signalerprobleme_type) {
        return res.status(400).json({ error: 'Name and problem type are required' });
    }

    const query = 'INSERT INTO Demandeur (nom, signalerprobleme_description, signalerprobleme_type, telephone, adresse, statut) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [nom, signalerprobleme_description, signalerprobleme_type, telephone, adresse, 1], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.redirect('/demandeurs');
    });
};



exports.getAllDemandeurs = (req, res) => {
    const query = 'SELECT * FROM Demandeur WHERE statut = "1" ';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: err.message });
        }
        res.render('demandeur/viewDemandeur', { demandeurs: results });
    });
};



exports.getDemandeurById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Demandeur WHERE id = ? ';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Demandeur not found' });
        }

        res.render('demandeur/editDemandeur', { demandeur: results[0] });


    });
};



exports.updateDemandeurById = (req, res) => {
    const { id } = req.params;
    const { nom, signalerprobleme_description, signalerprobleme_type , telephone , adresse } = req.body;

    if (!nom || !signalerprobleme_type) {
        return res.status(400).json({ error: 'Name and problem type are required' });
    }

    const query = 'UPDATE Demandeur SET nom = ?, signalerprobleme_description = ?, signalerprobleme_type = ? , telephone = ? , adresse = ? WHERE id = ?';
    db.query(query, [nom, signalerprobleme_description, signalerprobleme_type, telephone , adresse ,id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Demandeur not found' });
        }
        res.redirect('/demandeurs');

    });
};




exports.deleteDemandeurById = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Demandeur WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Demandeur not found' });
        }
        res.redirect('/demandeurs');
    });
};




// exports.deleteAllDemandeurs = (req, res) => {
//     const query = 'DELETE FROM Demandeur';
//     db.query(query, (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.redirect('/demandeurs');
//     });
// };


exports.updateDemandeurStatut = (req, res) => {
    const { id } = req.params;
    const statut = 0; 

    const updateQuery = 'UPDATE Demandeur SET statut = ? WHERE id = ?';
    db.query(updateQuery, [statut, id], (err, result) => {
        if (err) {
            console.error('Error updating demandeur status:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Demandeur status updated successfully');
        res.redirect('/demandeurs');
    });
};




exports.viewDemandeurById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Demandeur WHERE id = ? AND statut = 1';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Demandeur not found' });
        }
        res.render('demandeur/view1Demandeur', { demandeur: results[0] });
    });
};
