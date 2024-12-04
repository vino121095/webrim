const Transport = require('../model/Transportmodel');

// Create a new transport record
exports.createTransport = async (req, res) => {
    try {
        const transport = await Transport.create(req.body);
        res.status(201).json(transport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all transport records
exports.getAllTransports = async (req, res) => {
    try {
        const transports = await Transport.findAll();
        res.status(200).json(transports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a transport record by ID
exports.getTransportById = async (req, res) => {
    try {
        const transport = await Transport.findByPk(req.params.id);
        if (transport) {
            res.status(200).json(transport);
        } else {
            res.status(404).json({ message: 'Transport not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a transport record by ID
exports.updateTransport = async (req, res) => {
    try {
        const transport = await Transport.findByPk(req.params.id);
        if (transport) {
            await transport.update(req.body);
            res.status(200).json(transport);
        } else {
            res.status(404).json({ message: 'Transport not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a transport record by ID
exports.deleteTransport = async (req, res) => {
    try {
        const transport = await Transport.findByPk(req.params.id);
        if (transport) {
            await transport.destroy();
            res.status(204).json({ message: 'Transport deleted successfully' });
        } else {
            res.status(404).json({ message: 'Transport not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};