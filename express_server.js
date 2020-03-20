const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {updateURL, addNewUser, findByEmail, authenticateUser, addNewURL, urlsForUser} = require("./helpers");
const {urlDatabase, users} = require("./databases");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['hbdLeo', 'hbdLuka'],
}));

//Server setup
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Main Page
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const urls = Object.values(urlDatabase);
  let templateVars = { currentUser: loggedInUser, urls};
  res.render("homepage", templateVars);
});

//MyURLs
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
  if (loggedInUser) {
    res.redirect('/urls');
  }
  let templateVars = { currentUser: loggedInUser };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const user = findByEmail(email, users);
  if (email.length === 0 | password.length === 0) {
    res.status(400).send("Please enter a valid email and password");
  } else if (user) {
    res.status(403).send("The user with this email is already registered");
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
  if (loggedInUser) {
    res.redirect('/urls');
  }
  let templateVars = { currentUser: loggedInUser };
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
  req.session = null;
  res.redirect("/urls");
});

//Add new URL
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  if (loggedInUser) {
    let templateVars = { currentUser: loggedInUser };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const id = req.params.shortURL;
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  if (!urlDatabase[id]) {
    res.status(404).send("URL not found");
  }
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, currentUser: loggedInUser };
  if (urlDatabase[id].userId === userId) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("Unauthorized credentials");
  }
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  if (!userId) {
    res.send("Please log in to create a new URL");
  }
  const longURL = req.body.longURL;
  const shortURL = addNewURL(longURL, userId);
  let templateVars = {shortURL, longURL, currentUser: loggedInUser};
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
  const id = req.params.shortURL;
  if (urlDatabase[id].userId === userId) {
    delete urlDatabase[id];
  } else {
    res.status(403).send("Unauthorized credentials");
  }
  res.redirect("/urls");
});

//Update
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  if (urlDatabase[shortURL].userId === userId) {
    updateURL(shortURL, req.body.longURL);
  }
  res.redirect("/urls");
});