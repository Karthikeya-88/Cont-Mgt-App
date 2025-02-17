const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const { request } = require("http");
const databasePath = path.join(__dirname, "contacts.db");
app.use(cors());
app.use(express.json);
let db;

const initializeDbAndServer = async () => {
  try {
    db = open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    const port = process.env.PORT || 3080;
    app.listen(port, () => {
      console.log(`Server Running at ${port}`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
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
  const getContacts = `SELECT * FROM contacts;`;
  const contactsArr = await db.all(getContacts);
  response.send(convertContactsDBToResponseObj(contactsArr));
});

app.get("/ct/:id/", async (request, response) => {
  const { id } = request.params;
  const getContact = `SELECT * FROM contacts WHERE id = ${id};`;
  const contactsArr = await db.get(getContact);
  response.send(convertContactsDBToResponseObj(contactsArr));
});

app.post("/ct/", async (request, response) => {
  const { id, name, email, number, address, createdAt } = request.body;
  const postContactsQuery = `INSERT INTO contacts(id, name, email, number, address, created_at) VALUES (${id}, '${name}', '${email}', ${number}, '${address}', '${createdAt}');`;
  await db.run(postContactsQuery);
  response.send("Contact Created Successfully");
});

app.put("/ct/:id", async (request, response) => {
  const { name, email, number, address, createdAt } = request.body;
  const { id } = request.params;
  const updateContactsQuery = `UPDATE contacts SET name = '${name}', email = '${email}', number = ${number}, address = '${address}', created_at = '${createdAt}' WHERE id = ${id}`;
  await db.run(updateContactsQuery);
  response.send("Contact Updated");
});

app.delete("/ct/:id", async (request, response) => {
  const { id } = request.params;
  const deleteContact = `DELETE FROM contacts WHERE id = ${id};`;
  await db.run(deleteContact);
  response.send("Contact Deleted");
});
