const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const auth = require('../src/middleware/authentication');
const Admin = require('../src/models/admin');

let originalFindOne;

const createMockResponse = () => {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        send(payload) {
            this.body = payload;
            return this;
        }
    };
};

const createRequestWithHeaders = (headers) => ({
    headers,
    header(name) {
        const key = name.toLowerCase();
        return this.headers[key];
    }
});

beforeEach(() => {
    originalFindOne = Admin.findOne;
});

afterEach(() => {
    Admin.findOne = originalFindOne;
});

test('auth middleware attaches admin and token when verification succeeds', async () => {
    const token = jwt.sign({ _id: 'admin123' }, 'TaxiGoElluminati');
    const adminRecord = { _id: 'admin123', tokens: [{ token }] };

    Admin.findOne = async (query) => {
        if (query._id === 'admin123' && query['tokens.token'] === token) {
            return adminRecord;
        }
        return null;
    };

    const req = createRequestWithHeaders({ authorization: `Bearer ${token}` });
    const res = createMockResponse();
    let nextCalled = false;

    await auth(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.admin, adminRecord);
    assert.equal(req.token, token);
    assert.equal(res.statusCode, null);
});

test('auth middleware responds with 400 when admin lookup fails', async () => {
    const token = jwt.sign({ _id: 'admin123' }, 'TaxiGoElluminati');

    Admin.findOne = async () => null;

    const req = createRequestWithHeaders({ authorization: `Bearer ${token}` });
    const res = createMockResponse();
    let nextCalled = false;

    await auth(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'Please Authenticate' });
});

test('auth middleware responds with 400 when Authorization header is missing', async () => {
    Admin.findOne = async () => {
        throw new Error('Should not be called');
    };

    const req = createRequestWithHeaders({});
    const res = createMockResponse();
    let nextCalled = false;

    await auth(req, res, () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: 'Please Authenticate' });
});