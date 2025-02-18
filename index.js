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
    const port = process.env.PORT || 8000;
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

app.get("/contacts/", async (request, response) => {
  try {
    const getContacts = `SELECT * FROM contactDetails;`;
    const contactsArr = await db.all(getContacts);
    response.json(contactsArr.map(convertContactsDBToResponseObj));
  } catch (e) {
    response.status(500).json({ error: "Failed to fetch contacts" });
  }
});

app.get("/contacts/:id/", async (request, response) => {
  try {
    const { id } = request.params;
    const getContact = `SELECT * FROM contactDetails WHERE id = ?;`;
    const contact = await db.get(getContact, [id]);

    if (contact) {
      response.json(convertContactsDBToResponseObj(contact));
    } else {
      response.status(404).json({ error: "Contact not found" });
    }
  } catch (e) {
    response.status(500).json({ error: "Failed to fetch contact" });
  }
});

app.post("/contacts/", async (request, response) => {
  try {
    const { name, email, number, address } = request.body;

    if (!name || !email || !number || !address) {
      return response.status(400).json({ error: "All fields are required" });
    }

    const postContactsQuery = `
      INSERT INTO contactDetails (name, email, number, address)
      VALUES (?, ?, ?, ?);
    `;
    await db.run(postContactsQuery, [name, email, number, address]);
    response.status(201).json({ message: "Contact created successfully" });
  } catch (e) {
    response.status(500).json({ error: "Failed to create contact" });
  }
});

app.put("/contacts/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const { name, email, number, address } = request.body;

    if (!name || !email || !number || !address) {
      return response.status(400).json({ error: "All fields are required" });
    }

    const updateContactsQuery = `
      UPDATE contactDetails
      SET name = ?, email = ?, number = ?, address = ?
      WHERE id = ?;
    `;
    await db.run(updateContactsQuery, [name, email, number, address, id]);
    response.json({ message: "Contact updated successfully" });
  } catch (e) {
    response.status(500).json({ error: "Failed to update contact" });
  }
});

app.delete("/contacts/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const deleteContact = `DELETE FROM contactDetails WHERE id = ?;`;
    await db.run(deleteContact, [id]);
    response.json({ message: "Contact deleted successfully" });
  } catch (e) {
    response.status(500).json({ error: "Failed to delete contact" });
  }
});
