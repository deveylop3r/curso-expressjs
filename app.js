require("dotenv").config();
const express = require("express");

const LoggerMiddleware = require("./middlewares/logger");
const { validateUser } = require("./utils/validation");

const bodyParser = require("body-parser");

const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "users.json");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(LoggerMiddleware);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(
    `<h1>Welcome to the Express.js App</h1>
    <p> V2 Use the following endpoints:</p>
    <ul>
      <li><a href="/api/hello">/api/hello</a> - Returns a hello message</li>
      <li><a href="/api/goodbye">/api/goodbye</a> - Returns a goodbye message</li>
      <li>Running on port: ${PORT}</li>
    </ul>`
  );
});

app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`Mostrar información del usuario con ID: ${userId}`);
});

app.get("/search", (req, res) => {
  const searchTerm = req.query.term || "No search term provided";
  const category = req.query.category || "Todas";
  res.send(`
    <h2>Resultados de búsqueda:</h2>
    Buscar información relacionada con:
    <p>Termino: ${searchTerm} </p> 
    <p>Categoría: ${category}</p>
    `);
  //http://localhost:3000/search?term=express&category=nodejs
});

app.post("/form", (req, res) => {
  const { name, email } = req.body;
  res.json({
    message: "Formulario recibido",
    data: {
      name: name,
      email: email,
    },
  });
  res.send(`
    <h2>Formulario enviado:</h2>
    <p>Nombre: ${name}</p>
    <p>Email: ${email}</p>
  `);
});

app.post("/api/data", (req, res) => {
  const { data } = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No data provided" });
  }
  res.status(200).json({
    message: "Data received successfully",
    data,
  });
});

app.get("/users", (req, res) => {
  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    const users = JSON.parse(data);
    res.json(users);
  });
});

app.post("/users", (req, res) => {
  const newUser = req.body;

  fs.readFile(usersFilePath, "utf-8", (err, fileData) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).json({ error: "Error reading user data." });
    }

    const users = JSON.parse(fileData);

    const validation = validateUser(newUser, users);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    users.push(newUser);
    // Guardamos el nuevo usuario en el archivo
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing to users file:", writeErr);
        return res.status(500).json({ error: "Error saving user." });
      }
      res.status(201).json(newUser);
    });
  });
});

app.put("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10); // Mantén esta línea, es necesaria
  const updatedUser = req.body; // Obtén los datos del cuerpo de la solicitud

  const { id, ...dataToUpdate } = updatedUser;

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error con conexión de datos." });
    }
    let users = JSON.parse(data);

    // Verificar si el usuario existe
    const userExists = users.some((user) => user.id === userId);
    if (!userExists) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Validar los datos a actualizar (sin el ID)
    const validation = validateUser(
      { ...dataToUpdate, id: userId },
      users,
      userId
    );
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    users = users.map((user) =>
      user.id === userId ? { ...user, ...dataToUpdate, id: userId } : user
    );
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error al actualizar el usuario" });
      }
      res.json({ ...dataToUpdate, id: userId });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  fs.readFile(usersFilePath, "utf-8", (err, fileData) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).json({ error: "Error conexion de datos" });
    }

    let users;
    try {
      users = JSON.parse(fileData);
    } catch (parseError) {
      console.error("Error parsing users.json:", parseError);
      return res.status(500).json({ error: "Error parsing user data." });
    }

    users = users.filter((user) => user.id !== userId);

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing to users file:", writeErr);
        return res.status(500).json({ error: "Error deleting user." });
      }
      res.status(204).send();
    });
  });
});
/* app.post("/users", (req, res) => {
  const newUser = req.body;

  // VALIDACIÓN MEJORADA:
  if (!newUser || typeof newUser !== "object" || newUser === null) {
    return res
      .status(400)
      .json({ error: "Invalid user data format: expected an object." });
  }
  // Asegúrate de que los campos esperados existan y sean del tipo correcto (puedes ser más estricto)
  if (
    typeof newUser.id !== "number" ||
    typeof newUser.name !== "string" ||
    typeof newUser.email !== "string" ||
    newUser.name.trim() === "" ||
    newUser.email.trim() === ""
  ) {
    return res.status(400).json({
      error:
        "User ID (number), name (string), and email (string) are required and cannot be empty.",
    });
  }

  fs.readFile(usersFilePath, "utf-8", (err, fileData) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).json({ error: "Error reading user data." });
    }

    let users;
    try {
      users = JSON.parse(fileData);
      if (!Array.isArray(users)) {
        // Si el archivo no contenía un array
        console.warn(
          "users.json did not contain a valid array. Initializing as empty."
        );
        users = [];
      }
    } catch (parseError) {
      console.error(
        "Error parsing users.json:",
        parseError,
        ". Initializing as empty array."
      );
      users = []; // Si el JSON está tan corrupto que no se puede parsear, empieza con un array vacío
    }

    users.push(newUser);

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing to users file:", writeErr);
        return res.status(500).json({ error: "Error saving user." });
      }
      res.status(201).json(newUser);
    });
  });
}); */

/* app.put("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updatedUser = req.body;

  if (!updatedUser || typeof updatedUser !== "object" || updatedUser === null) {
    return res
      .status(400)
      .json({ error: "Invalid user data format: expected an object." });
  }

  fs.readFile(usersFilePath, "utf-8", (err, fileData) => {
    if (err) {
      console.error("Error reading users file:", err);
      return res.status(500).json({ error: "Error reading user data." });
    }

    let users;
    try {
      users = JSON.parse(fileData);
    } catch (parseError) {
      console.error("Error parsing users.json:", parseError);
      return res.status(500).json({ error: "Error parsing user data." });
    }

    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    users[userIndex] = { ...users[userIndex], ...updatedUser };

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing to users file:", writeErr);
        return res.status(500).json({ error: "Error updating user." });
      }
      res.json(users[userIndex]);
    });
  });
}); */
