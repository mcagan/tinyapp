const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(cookieParser());

//Databases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
  urlDatabase[shortID] = url;
  return true;
};

const addNewUser = (name, email, password) => {
  const userId = generateRandomString();
  const newUserObj = {
    id: userId,
    name,
    email,
    password
  };
  users[userId] = newUserObj;
  return userId;
};

const findByEmail = email => {
  const user = Object.values(users).find(userObj => userObj.email === email);
  return user;
}

const authenticateUser = (email, password) => {
  let user = findByEmail(email);
  if(user && user.password === password) {
    return user;
  } else {
    return false;
  }
};

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
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { urls: urlDatabase, currentUser: loggedInUser };
  res.render("urls_index", templateVars);
});

//Register
app.get("/register", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  templateVars = { currentUser: loggedInUser }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const user = findByEmail(email);
  if (email.length === 0 | password.length === 0) {
    res.status(400).send("Please enter a valid email and password.")
  } else if (user) {
    res.status(403).send('Sorry, the user is already registered');
  } else {
    const userId = addNewUser(name, email, password);
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
});

//Login
app.get("/login", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  templateVars = { currentUser: loggedInUser }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password);
  if (user) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(403).send("Wrong email or password");
  }
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Add new URL
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  templateVars = { currentUser: loggedInUser }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], currentUser: loggedInUser };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  templateVars = {shortURL: shortURL, longURL: req.body, currentUser: loggedInUser};
  res.render("urls_show", templateVars);
});

//Redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    res.send("<html><body>URL not found</body></html>\n");
  }
});

//Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  id = req.params.shortURL;
  delete urlDatabase[id];
  res.redirect("/urls");
})

//Update
app.post("/urls/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  updateURL(shortURL, req.body.longURL);
  res.redirect("/urls");
});

