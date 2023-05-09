const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'TaxiGoElluminati');
        const admin = await Admin.findOne({_id: decoded._id, 'tokens.token': token})

        if (!admin) {
            throw new Error('Admin authentication failed');
        }

        req.token = token;
        req.admin = admin;
        
        next();

    } catch (error) {
        
        res.status(400).send({error: 'Please Authenticate'})
    }
}

module.exports = auth;