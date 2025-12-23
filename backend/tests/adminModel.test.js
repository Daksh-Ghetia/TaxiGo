const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Admin = require('../src/models/admin');

let originalFindOne;
let originalCompare;
let originalSign;

beforeEach(() => {
    originalFindOne = Admin.findOne;
    originalCompare = bcrypt.compare;
    originalSign = jwt.sign;
});

afterEach(() => {
    Admin.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
    jwt.sign = originalSign;
});

test('generateAuthToken stores token and calls save', async () => {
    jwt.sign = () => 'signedToken';

    let saveCalled = false;
    const fakeAdmin = {
        _id: 'admin123',
        tokens: [],
        async save() {
            saveCalled = true;
        }
    };

    const token = await Admin.prototype.generateAuthToken.call(fakeAdmin);

    assert.equal(token, 'signedToken');
    assert.deepEqual(fakeAdmin.tokens, [{ token: 'signedToken' }]);
    assert.equal(saveCalled, true);
});

test('findByCredentials resolves admin when email and password match', async () => {
    const adminRecord = { email: 'admin@example.com', password: 'hashed' };

    Admin.findOne = async (query) => {
        if (query.email === 'admin@example.com') {
            return adminRecord;
        }
        return null;
    };

    bcrypt.compare = async (password, hashed) => {
        assert.equal(password, 'supplied-password');
        assert.equal(hashed, 'hashed');
        return true;
    };

    const result = await Admin.findByCredentials('admin@example.com', 'supplied-password');

    assert.equal(result, adminRecord);
});

test('findByCredentials throws when admin is missing', async () => {
    Admin.findOne = async () => null;
    bcrypt.compare = async () => {
        throw new Error('should not reach compare');
    };

    await assert.rejects(
        () => Admin.findByCredentials('missing@example.com', 'irrelevant'),
        /Account does not exist/
    );
});

test('findByCredentials throws when password does not match', async () => {
    Admin.findOne = async () => ({ email: 'admin@example.com', password: 'hashed' });
    bcrypt.compare = async () => false;

    await assert.rejects(
        () => Admin.findByCredentials('admin@example.com', 'wrong'),
        /Unable to login/
    );
});