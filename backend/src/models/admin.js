const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

mongoose.set('strictQuery', true);

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
}, {
    timestamps: true
})

adminSchema.methods.generateAuthToken = async function () {  
    const admin = this;
    const token = jwt.sign({_id: admin._id.toString()}, 'TaxiGoElluminati');
    admin.tokens = admin.tokens.concat({token});

    await admin.save();

    return token;
}

/**Create a method to authenticate the admin */
adminSchema.statics.findByCredentials = async (email,password) => {
    // Find the mail id from tghe 
    const admin = await Admin.findOne({email: email})

    if (!admin) {
        throw new Error('Account does not exist');
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return admin;
}

adminSchema.pre('remove', async function (next) {  
    const admin = this;
    await Task.deleteMany({owner: admin._id})
    next()
})

// Hash the plain text password before saving
adminSchema.pre('save', async function (next) {  
    const admin = this

    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password,8);
    }

    next();
})

const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin



// const admin = new Admin({
//     name: 'Daksh Ghetia',
//     email: 'mail1@gmail.com',
//     password: 'asd'
// })

// admin.save().then(() => {
//     console.log("New admin addeded");
// }).catch((error) => {
//     console.log(error);
// })