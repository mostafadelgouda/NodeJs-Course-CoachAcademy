const express = require('express');

const app = express();

app.use(express.json());

const users = [
    { id: 1, name: 'Mostafa', age: 25 },
    { id: 2, name: 'Ahmed', age: 30 }
];

// Logger Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Get all users
app.get('/users', (req, res) => {
    const minAge = Number(req.query.minAge);

    if (minAge) {
        return res.json(
            users.filter(user => user.age >= minAge)
        );
    }

    res.json(users);
});

// Get user by id
app.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        });
    }

    res.json(user);
});

// Create user
app.post('/users', (req, res) => {
    const { name, age } = req.body;

    if (!name || !age) {
        return res.status(400).json({
            message: 'name and age are required'
        });
    }

    const user = {
        id: users.length + 1,
        name,
        age
    };

    users.push(user);

    res.status(201).json(user);
});

// Update user
app.put('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        });
    }

    user.name = req.body.name ?? user.name;
    user.age = req.body.age ?? user.age;

    res.json(user);
});

// Delete user
app.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: 'User not found'
        });
    }

    users.splice(index, 1);

    res.status(204).send();
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});