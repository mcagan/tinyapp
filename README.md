# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of main page"](https://github.com/mcagan/tinyapp/blob/master/docs/main-page.png?raw=true)
!["Screenshot of the MyURLs page when the user is logged in"](https://github.com/mcagan/tinyapp/blob/master/docs/myurls-logged-in.png?raw=true)
!["Screenshot of the registration page"](https://github.com/mcagan/tinyapp/blob/master/docs/registration-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Using the App

- Create an account by clicking the Register button.
- Create as many TinyURLs as you want.
- Click on the TinyURL to go to the website you want.

## Some extra features

- The shortURLs are links to the webpages. 
- The app adds "http://" to urls if the user did not enter it. 
- I added a name field and display the name when the user is logged in because I find that looks nicer than the email. 
- Most of the stretch functionalities are implemented except for having all visits timestamped in the edit pages of the URLs.

Known issue: Users who are not logged in are counted as unique users each time they visit a page through a shortURL.