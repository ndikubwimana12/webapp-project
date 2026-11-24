const test = require("node:test");
const assert = require("node:assert");
const app = require("../server");

let server;
let baseUrl;

test.before(async () => {
    server = app.listen(0);

    await new Promise(resolve => server.once("listening", resolve));

    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
});

test.after(async () => {
    await new Promise(resolve => server.close(resolve));
});

test("Homepage should load successfully", async () => {
    const response = await fetch(`${baseUrl}/`);

    assert.strictEqual(response.status, 200);
});

test("Health API should return OK", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.status, "OK");
});