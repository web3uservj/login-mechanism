const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const config = require('./config');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(config.dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/views/signup.html');
});

app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            username: username,
            password: hashedPassword
        });
        
        await newUser.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error signing up user');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            return res.status(401).send('Invalid password');
        }
        
        res.cookie('user_id', user._id, { maxAge: 900000, httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in user');
    }
});


app.get('/dashboard', async (req, res) => {
    const userId = req.cookies.user_id;

    try {
        // Fetch user details from MongoDB based on userId
        const user = await User.findById(userId);

        if (user) {
            res.send(`<h1>Welcome ${user.username} to your Dashboard!</h1>`);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching user details');
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});