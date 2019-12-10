const mysql = require('mysql');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const bcrypt = require('bcryptjs');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

app.set('view engine', 'hbs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs'
});

db.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + db.threadId);
});

app.get('/', function (req, res) {
    db.query('SELECT * FROM users', (err, rows) => {
        if (err) {
            console.log(err);

        } else {
            console.log(rows[0].id);

            res.render('index', {
                data: rows
            })
        }
    });

});

app.post('/login', (req, res) => {

    const email = req.body.loginEmail;
    const password = req.body.loginPassword;

    console.log(email, password);
    let sql = 'SELECT password, id FROM users WHERE email = ?';
    db.query(sql, email, async (err, row) => {
        if (err) {
            console.log(err);
        } else {
            console.log(row[0].password);
            console.log(row[0].id);

            const isMatch = await bcrypt.compare(password, row[0].password);

            if (isMatch) {
                const token = jwt.sign({ _id: row[0].id }, 'telmosecretcode');
                console.log(token);

                const data = jwt.verify(token, 'telmosecretcode');
                console.log(data);
                res.render('login', {
                    data: true
                });
            } else {
                // res.send('<h1>Sorry wrong password or email');
                res.render('login', {
                    data: false
                });
            }
        }
    });
});

app.post('/register', (req, res) => {

    const email = req.body.registerEmail;
    let password = req.body.registerPassword;

    console.log(email, password);
    let sql = 'SELECT ?? FROM ?? WHERE email = ?';
    db.query(sql, ['email', 'users', email], async (err, row) => {
        if (err) {
            console.log(err);
        } else {

            if (row.length > 0) {
                return res.send('<h1>That Email has been taken</h1>');
            }

            password = await bcrypt.hash(password, 8);

            const insertSql = 'INSERT INTO users SET ?';
            db.query(insertSql, { name: 'Dude', email: email, password: password }, async (err, row) => {
                if (err) {
                    console.log(err);
                } else {
                    res.send('<h1>You are registered</h1>');
                }
            })


        }
    });

});

app.get('/users', (req, res) => {
    let sql = 'SELECT * FROM users';

    db.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            console.log(rows);
            res.render('users', {
                data: rows
            });
        }
    });
});

app.get('/edit/:id', (req, res) => {

    let id = req.params.id;
    console.log(id);
    let sql = 'UPDATE users SET name = ? WHERE id = ?';

    db.query(sql, ['Yoo', id], (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            res.send('<h1>User name changed</h1>');
        }
    });
});



// app.get('/users', (req, res) => {
//     let newEMp = {
//         Name: 'Super',
//         EmpCode: 780,
//         Salary: 35000
//     };
//     let sql = 'INSERT INTO employee SET ?';
//     let query = db.query(sql, newEMp, (err, result) => {
//         if (err) throw err;
//         res.send('user created');
//     })
// });

app.get('/getUsers', function (req, res) {
    let sql = 'SELECT * FROM employee';
    let query = connection.query(sql, (err, results) => {
        if (err) throw err;
        console.log(results)
        res.send(results);
    })
});

app.get('/getUsers/:id', function (req, res) {
    let sql = 'SELECT * FROM employee WHERE EmpID = ?';
    let query = db.query(sql, [req.params.id], (err, results) => {
        if (err) throw err;
        console.log(results)
        res.send(results);
    })
});

app.get('/updateUsers/:id', function (req, res) {
    let sql = 'UPDATE employee SET Name = ? WHERE EmpID = ?';
    let newName = 'Telmo';
    let query = db.query(sql, [newName, req.params.id], (err, results) => {
        if (err) throw err;
        console.log(results)
        res.send('Username updated');
    })
});

app.get('/deleteUsers/:id', function (req, res) {
    let sql = 'DELETE from employee WHERE EmpID = ?';

    let query = db.query(sql, [req.params.id], (err, results) => {
        if (err) throw err;
        console.log(results)
        res.send(`User ID ${req.params.id} deleted`);
    })
});

app.listen(3000, () => {
    console.log("listening on port 3000");
})