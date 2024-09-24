const request = require("supertest");
const chai = require("chai");

const { expect } = chai;

describe("Test sample API", function () {
  it("should return users data", async function () {
    const { statusCode, ok } = await request("http://localhost:3000")
      .post("/api/users/login-user")
      .send({
        email: "bevlimo@gmail.com",
        password: "genbev@1234",
      }).expect(200);
    const response = await request("http://localhost:3000")
      .get("/api/users/name")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmVlZDhmODEwNWU1ZDgwMWI2MjIzNDEiLCJpYXQiOjE3MjY5OTc3NTMsImV4cCI6MTcyNjk5OTU1M30.1HNZbpwn97WLj0k51WpInfmICO97rIp2j7fExxBhCQ0"
      );
    expect(response.status).to.equal(200);
    expect(response.ok).to.equal(true);
  });
});


// "test": "node --experimental-vm-modules node_modules/.bin/jest tests/api/users",
