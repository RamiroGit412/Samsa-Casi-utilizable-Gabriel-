require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3009;

// Conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a la BD:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ SAMSA Backend funcionando correctamente.');
});

// Registro de usuarios
app.post('/registrar', (req, res) => {
  const {
    nombre, celular, dni_cuil, obra_social, correo, contrasena, fecha_nacimiento
  } = req.body;

  const query = `
    INSERT INTO usuarios (nombre, celular, dni_cuil, obra_social, correo, contrasena, fecha_nacimiento)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [nombre, celular, dni_cuil, obra_social, correo, contrasena, fecha_nacimiento], (err, result) => {
    if (err) {
      console.error('❌ Error al registrar usuario:', err);
      return res.status(500).json({ error: 'Error al registrar el usuario' });
    }
    res.json({ mensaje: '✅ Usuario registrado correctamente' });
  });
});

// Login de usuario
app.post('/login', (req, res) => {
  const { dni, contrasena } = req.body;

  const query = `SELECT * FROM usuarios WHERE dni_cuil = ? AND contrasena = ?`;

  db.query(query, [dni, contrasena], (err, results) => {
    if (err) {
      console.error('❌ Error en login:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = results[0];
    res.json({
      mensaje: '✅ Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol // opcional si usás roles
      }
    });
  });
});

// Listado de todos los usuarios (modo prueba)
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
    res.json(results);
  });
});

// Crear nuevo turno
app.post('/turnos', (req, res) => {
  const {
    id_usuario, nombre_paciente, apellido_paciente, correo, telefono, dni,
    id_medico, nombre_medico, especialidad, fecha, hora
  } = req.body;

  console.log('📩 Datos recibidos para turno:', req.body);

  if (!nombre_paciente || !correo || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const query = `
    INSERT INTO turnos (
      id_usuario, nombre_paciente, apellido_paciente, correo, telefono, dni,
      id_medico, nombre_medico, especialidad, fecha, hora
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    id_usuario, nombre_paciente, apellido_paciente, correo, telefono, dni,
    id_medico, nombre_medico, especialidad, fecha, hora
  ], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar turno:', err);
      return res.status(500).json({ error: 'Error al guardar el turno' });
    }

    res.json({ mensaje: '✅ Turno guardado correctamente', id: result.insertId });
  });
});

// Obtener turnos de un usuario
app.get('/mis-turnos/:id', (req, res) => {
  const id_usuario = req.params.id;

  const query = `SELECT * FROM turnos WHERE id_usuario = ? ORDER BY fecha DESC, hora ASC`;

  db.query(query, [id_usuario], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener turnos:', err);
      return res.status(500).json({ error: 'Error al obtener los turnos del usuario' });
    }

    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`✅ SAMSA Backend corriendo en http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${port} ya está en uso. Probá con otro puerto en el archivo .env o liberalo con: npx kill-port ${port}`);
  } else {
    console.error('❌ Error al iniciar el servidor:', err);
  }
});

