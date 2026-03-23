const pool = require('../config/db');

const getBicycles = async (req, res) => {
    try {
        let query = 'SELECT * FROM bicycles';
        const params = [];

        if (req.query.search) {
            query += ' WHERE name LIKE ?';
            params.push(`%${req.query.search}%`);
        } else if (req.query.type) {
            query += ' WHERE type = ?';
            params.push(req.query.type);
        }

        const [bicycles] = await pool.query(query, params);
        res.json(bicycles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getBicycleById = async (req, res) => {
    try {
        const [bicycles] = await pool.query('SELECT * FROM bicycles WHERE id = ?', [req.params.id]);
        if (bicycles.length > 0) {
            res.json(bicycles[0]);
        } else {
            res.status(404).json({ message: 'Bicycle not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addBicycle = async (req, res) => {
    try {
        const { name, type, price } = req.body;

        const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

        if (!name || !type || !price || !image) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const [result] = await pool.query(
            'INSERT INTO bicycles (name, type, price, image) VALUES (?, ?, ?, ?)',
            [name, type, price, image]
        );

        res.status(201).json({ id: result.insertId, name, type, price, image });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateBicycle = async (req, res) => {
    try {
        const { name, type, price } = req.body;
        
        let image = req.body.image; 

        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }

        let updateQuery = 'UPDATE bicycles SET name = ?, type = ?, price = ?';
        const params = [name, type, price];

        if (image) {
            updateQuery += ', image = ?';
            params.push(image);
        }
        
        updateQuery += ' WHERE id = ?';
        params.push(req.params.id);

        const [result] = await pool.query(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bicycle not found' });
        }

        res.json({ message: 'Bicycle updated successfully', id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteBicycle = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM bicycles WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bicycle not found' });
        }

        res.json({ message: 'Bicycle removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getBicycles,
    getBicycleById,
    addBicycle,
    updateBicycle,
    deleteBicycle
};
