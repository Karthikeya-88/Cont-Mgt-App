const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const databasePath = path.join(__dirname, "contactDetails.db");
app.use(cors());
app.use(express.json());
let db;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    const port = process.env.PORT || 3080;
    app.listen(port, () => {
      console.log(`Server Running at ${port}`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertContactsDBToResponseObj = (dbObject) => {
  return {
    id: dbObject.id,
    name: dbObject.name,
    email: dbObject.email,
    number: dbObject.number,
    address: dbObject.address,
    createdAt: dbObject.created_at,
  };
};

app.get("/ct/", async (request, response) => {
  const getContacts = `SELECT * FROM contactDetails;`;
  const contactsArr = await db.all(getContacts);
  response.send(contactsArr.map(convertContactsDBToResponseObj));
});

app.get("/ct/:id/", async (request, response) => {
  const { id } = request.params;
  const getContact = `SELECT * FROM contactDetails WHERE id = ${id};`;
  const contactsArr = await db.get(getContact);
  response.send(convertContactsDBToResponseObj(contactsArr));
});

app.post("/ct/", async (request, response) => {
  const { id, name, email, number, address, createdAt } = request.body;
  const postContactsQuery = `INSERT INTO contactDetails(id, name, email, number, address, created_at) VALUES (${id}, '${name}', '${email}', '${number}', '${address}', '${createdAt}');`;
  await db.run(postContactsQuery);
  response.send("Contact Created Successfully");
});

app.put("/ct/:id", async (request, response) => {
  const { name, email, number, address, createdAt } = request.body;
  const { id } = request.params;
  const updateContactsQuery = `UPDATE contactDetails SET name = '${name}', email = '${email}', number = ${number}, address = '${address}', created_at = '${createdAt}' WHERE id = ${id}`;
  await db.run(updateContactsQuery);
  response.send("Contact Updated");
});

app.delete("/ct/:id", async (request, response) => {
  const { id } = request.params;
  const deleteContact = `DELETE FROM contactDetails WHERE id = ${id};`;
  await db.run(deleteContact);
  response.send("Contact Deleted");
});

module.exports = app;
