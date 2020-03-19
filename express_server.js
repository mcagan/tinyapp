const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(cookieSession({
  name: 'session',
  keys: ['hbdLeo', 'hbdLuka'],
}))

//Databases
const urlDatabase = {
  "b2xVn2": {shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca", userId: "klf7kj"},
  "9sm5xK": {shortURL: "9sm5xK", longURL: "http://www.google.com", userId: "jhk76b"}
};

const users = { 
  "klf7kj": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "jhk76b": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//Functions
const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i <= 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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
}

const authenticateUser = (email, password) => {
  let user = findByEmail(email, users);
  if(user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

const addNewURL = (longURL, userId) => {
  const shortURL = generateRandomString();
  const newURLObj = {shortURL, longURL, userId};
  urlDatabase[shortURL] = newURLObj;
  return shortURL;
};

const urlsForUser = id => {
  const newArray = Object.values(urlDatabase);
  const result = newArray.filter(url => url.userId === id);
  console.log(result);
  return result;
}

//Server setup
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Main Page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const urls = urlsForUser(userId);
  let templateVars = { urls, currentUser: loggedInUser };
  res.render("urls_index", templateVars);
});

//Register
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  templateVars = { currentUser: loggedInUser }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const user = findByEmail(email, users);
  if (email.length === 0 | password.length === 0) {
    res.status(400).send("Please enter a valid email and password.")
  } else if (user) {
    res.status(403).send('The user with this email is already registered');
  } else {
    const userId = addNewUser(name, email, password);
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

//Login
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  templateVars = { currentUser: loggedInUser }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password);
  if (user) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send("Wrong email or password");
  }
});

//Logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

//Add new URL
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  if (loggedInUser) {
    templateVars = { currentUser: loggedInUser }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, currentUser: loggedInUser };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const longURL = req.body.longURL;
  const shortURL = addNewURL(longURL, userId);
  templateVars = {shortURL, longURL, currentUser: loggedInUser};
  res.render("urls_show", templateVars);
});

//Redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("<html><body>URL not found</body></html>\n");
  }
});

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  id = req.params.shortURL;
  if (urlDatabase[id].userId === userId) {
    delete urlDatabase[id];
  }
  res.redirect("/urls");
})

//Update
app.post("/urls/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  if (urlDatabase[shortURL].userId === userId) {
    updateURL(shortURL, req.body.longURL);
  }
  res.redirect("/urls");
});

app.get("/urlDatabase", (req, res) => {
  res.json(urlDatabase);
});

app.get("/userDatabase", (req, res) => {
  res.json(users);
});
