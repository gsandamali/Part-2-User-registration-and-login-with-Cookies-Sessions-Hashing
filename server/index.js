const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require('bcrypt');
const saltRound = 10;
 
const app = express();
 
app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use (
    session ({
        key: "userId",
        secret: "subscribe",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24,
        },
    })
);
const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "add-password",
    database: "loginsystem",
});
 
app.post('/register', (req, res)=> {
    const username = req.body.username;
    const password = req.body.password;
    bcrypt.hash(password,saltRound, (err, hash) => {
    if (err) {
            console.log(err)
        }
        db.execute( 
            "INSERT INTO users (username, password) VALUES (?,?)",
            [username, hash], 
            (err, result)=> {
                console.log(err);
            }
        );
    })
});
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});
app.post('/login', (req, res) => {
 const username = req.body.username;
 const password = req.body.password;
 
 db.execute(
        "SELECT * FROM users WHERE username = ?;",
        [username], 
        (err, result)=> {
            if (err) {
                res.send({err: err});
            }
            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {
                        req.session.user = result;
                        console.log(req.session.user);
                        res.send(result);
                    } else{
                        res.send({message: "Wrong username/ password comination!"}); 
                    }
                });
            } else {
                res.send({ message: "User doesn't exists"});
            }
        }
    );
});
 
app.listen(3001, () => {
    console.log("running server");
});
