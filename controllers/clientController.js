

const db = require('../database');

exports.getAllClients = (req, res) => {
    const query = 'SELECT * FROM Client WHERE statut = 1';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.render('client/viewClients', { clients: results });
    });
};

exports.getClientById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Client WHERE id = ? AND statut = 1';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Client not found or inactive' });
        }
        res.render('client/editClient', { client: results[0] });
    });
};

exports.createClient = (req, res) => {
    const { nom, nbretoiles, numerotele, statut } = req.body;

    if (!nom || !nbretoiles || !numerotele ) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'INSERT INTO Client (nom, nbretoiles, numerotele, statut) VALUES (?, ?, ?, ?)';
    db.query(query, [nom, nbretoiles, numerotele, 1], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.redirect('/clients');
    });
};

exports.updateClientById = (req, res) => {
    const { id } = req.params;
    const { nom, nbretoiles, numerotele, statut } = req.body;

    if (!nom || !nbretoiles || !numerotele || statut === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'UPDATE Client SET nom = ?, nbretoiles = ?, numerotele = ?, statut = ? WHERE id = ?';
    db.query(query, [nom, nbretoiles, numerotele, statut, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.redirect('/clients');
    });
};

exports.updateClientStatut = (req, res) => {
    const { id } = req.params;
    const statut = 0;

    const updateQuery = 'UPDATE Client SET statut = ? WHERE id = ?';
    db.query(updateQuery, [statut, id], (err, result) => {
        if (err) {
            console.error('Error updating client status:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('Client status updated successfully');
        res.redirect('/clients'); 
    });
};

exports.viewClientById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Client WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.render('client/view1Client', { client: results[0] });
    });
};







