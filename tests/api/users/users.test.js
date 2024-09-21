const request = require("supertest");

request("http://localhost:3000")
  .get("/api/users/name")
  .set(
    "Authorization",
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmVlZDhmODEwNWU1ZDgwMWI2MjIzNDEiLCJpYXQiOjE3MjY5MzExMDAsImV4cCI6MTcyNjkzMjkwMH0.qQzJkaNhy39TUXBDNG57QGBMquNmw_OUwWOwzK-VTLk"
  )
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
    console.log(res.body);
});
