const {urlDatabase, users} = require("./databases");
const bcrypt = require('bcrypt');

const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i <= 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const updateURL = (shortID, url) => {
  urlDatabase[shortID].longURL = url;
  return true;
};

const addNewUser = (name, email, password) => {
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUserObj = {
    id: userId,
    name,
    email,
    password: hashedPassword
  };
  users[userId] = newUserObj;
  return userId;
};

const findByEmail = (email, database) => {
  const user = Object.values(database).find(userObj => userObj.email === email);
  return user;
};

const authenticateUser = (email, password) => {
  let user = findByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

const addNewURL = (longURL, userId) => {
  const shortURL = generateRandomString();
  if (!longURL.startsWith("http")) {
    longURL = "https://" + longURL;
  }
  const dateCreated = new Date();
  const dateString = dateCreated.toDateString()
  const newURLObj = {shortURL, longURL, userId, visits: {usersWithoutAccount: 0}, createdOn: dateString};
  urlDatabase[shortURL] = newURLObj;
  return shortURL;
};

const urlsForUser = id => {
  const newArray = Object.values(urlDatabase);
  const result = newArray.filter(url => url.userId === id);
  return result;
};

const totalVisits = shortURL => {
  let total = 0;
  for (let value in urlDatabase[shortURL]["visits"]) {
    total += urlDatabase[shortURL]["visits"][value];
  }
  return total;
}

module.exports = {generateRandomString, updateURL, addNewUser, findByEmail, authenticateUser, addNewURL, urlsForUser, totalVisits};