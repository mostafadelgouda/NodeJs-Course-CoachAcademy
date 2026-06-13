const http = require('http');
const url = require('url');

const users = [
    { id: 1, name: 'Mostafa', age: 25 },
    { id: 2, name: 'Ahmed', age: 30 }
];

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // GET /users
    if (req.method === 'GET' && pathname === '/users') {
        const minAge = Number(parsedUrl.query.minAge);

        if (minAge) {
            return sendJson(
                res,
                200,
                users.filter(u => u.age >= minAge)
            );
        }

        return sendJson(res, 200, users);
    }

    // GET /users/:id
    const userIdMatch = pathname.match(/^\/users\/(\d+)$/);

    if (req.method === 'GET' && userIdMatch) {
        const id = Number(userIdMatch[1]);

        const user = users.find(u => u.id === id);

        if (!user) {
            return sendJson(res, 404, {
                message: 'User not found'
            });
        }

        return sendJson(res, 200, user);
    }

    // POST /users
    if (req.method === 'POST' && pathname === '/users') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const { name, age } = JSON.parse(body);

                if (!name || !age) {
                    return sendJson(res, 400, {
                        message: 'name and age are required'
                    });
                }

                const user = {
                    id: users.length + 1,
                    name,
                    age
                };

                users.push(user);

                sendJson(res, 201, user);
            } catch {
                sendJson(res, 400, {
                    message: 'Invalid JSON'
                });
            }
        });

        return;
    }

    // PUT /users/:id
    if (req.method === 'PUT' && userIdMatch) {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try {
                const id = Number(userIdMatch[1]);

                const user = users.find(u => u.id === id);

                if (!user) {
                    return sendJson(res, 404, {
                        message: 'User not found'
                    });
                }

                const data = JSON.parse(body);

                user.name = data.name ?? user.name;
                user.age = data.age ?? user.age;

                sendJson(res, 200, user);
            } catch {
                sendJson(res, 400, {
                    message: 'Invalid JSON'
                });
            }
        });

        return;
    }

    // DELETE /users/:id
    if (req.method === 'DELETE' && userIdMatch) {
        const id = Number(userIdMatch[1]);

        const index = users.findIndex(u => u.id === id);

        if (index === -1) {
            return sendJson(res, 404, {
                message: 'User not found'
            });
        }

        users.splice(index, 1);

        res.writeHead(204);
        return res.end();
    }

    sendJson(res, 404, {
        message: 'Route not found'
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});