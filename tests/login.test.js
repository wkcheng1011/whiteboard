const supertest = require('supertest');
const supertest_session = require("supertest-session");
const app = require('../app.js')

var testSession = supertest_session(app);

describe("Redirect test", () => {
	it("guest will be redirected to login", async () => {
        const result = await supertest(app).get("/");
		expect(result.redirect).toEqual(true);
        expect(result.headers.location).toEqual("/login");
	});
});

describe("Wrong credentials test", () => {
	it("(student1, blabla) will show an error message", async () => {
        const result = await supertest(app).post('/login').send({username: "student1", password: "blabla"});
		expect(result.text).toMatch("Login failed!");
	});
});

describe("Login test", () => {
	it("(student1, student1) will be logged in", async () => {
        const result = await supertest(app).post('/login').send({username: "student1", password: "student1"});
        expect(result.redirect).toEqual(true);
        expect(result.headers.location).toEqual("/");
	});
});

describe("Login test", () => {
    beforeEach(async () => {
        await testSession.post("/login").send({username: "student1", password: "student1"});
    })

	it("Logged in users will be redirected to index", async () => {
        const result = await testSession.get("/login");
        expect(result.redirect).toEqual(true);
        expect(result.headers.location).toEqual("/");
	});

    it("Can be logged out", async () => {
        const result = await testSession.get("/login?logout");
        expect(result.redirect).toEqual(true);
        expect(result.headers.location).toEqual("/login");
    });

    it("Can read messages", async () => {
        const result = await testSession.get("/message/");
        expect(result.text).toMatch(/You have \d+ messages./);
    });
});