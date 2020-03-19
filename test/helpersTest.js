const { assert } = require('chai');

const { findByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined if user with that email doesn not exist', function() {
      const user = findByEmail("user5@example.com", testUsers)
      const expectedOutput = undefined;
      assert.equal(user, expectedOutput);
    })
  });
