const pool = require('../config/db');

const createBooking = async (req, res) => {
    try {
        const { bicycle_id, date, duration } = req.body;
        const user_id = req.user.id;
        const rent_duration = duration ? parseInt(duration) : 1;

        if (!bicycle_id || !date) {
            return res.status(400).json({ message: 'Please provide bicycle and date' });
        }

        // Fetch bicycle price
        const [bicycles] = await pool.query('SELECT price FROM bicycles WHERE id = ?', [bicycle_id]);
        if (bicycles.length === 0) return res.status(404).json({ message: 'Bicycle not found' });
        const bicycle = bicycles[0];
        
        const total_price = bicycle.price * rent_duration;

        const [result] = await pool.query(
            'INSERT INTO bookings (user_id, bicycle_id, date, duration, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, bicycle_id, date, rent_duration, total_price, 'pending']
        );

        res.status(201).json({ message: 'Booking requested successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const query = `
            SELECT b.*, bic.name as bicycle_name, bic.image as bicycle_image, bic.price 
            FROM bookings b 
            JOIN bicycles bic ON b.bicycle_id = bic.id 
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await pool.query(query, [req.user.id]);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const query = `
            SELECT b.*, u.name as user_name, u.email as user_email, bic.name as bicycle_name 
            FROM bookings b 
            JOIN users u ON b.user_id = u.id 
            JOIN bicycles bic ON b.bicycle_id = bic.id
            ORDER BY b.created_at DESC
        `;
        const [bookings] = await pool.query(query);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [result] = await pool.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ message: 'Booking status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
        if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });

        const booking = bookings[0];
        if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this booking' });
        }

        await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
        res.json({ message: 'Booking deleted' });
        
    } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Server error' }); 
    }
}

module.exports = {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    deleteBooking
};
