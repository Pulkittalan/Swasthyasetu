// server.js

const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config();





// telemedicine imports
const cors = require('cors');

const socketIo = require('socket.io');  // Add this line to import socket.io


const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "geolocation=(self)");
  next();
});

//tellmedicine
const server = http.createServer(app);

// Store room information for video call
const rooms = {};

// Middleware setup
app.use(cookieParser());

// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL!');
});

// Passport setup: Serialize user into the session
passport.serializeUser(function (user, done) {
  done(null, user.id); // Store the user ID in the session
});

// Passport setup: Deserialize user from session
passport.deserializeUser(function (id, done) {
  connection.query('SELECT * FROM users WHERE id = ?', [id], function (err, results) {
    if (err) {
      return done(err);
    }
    done(null, results[0]);
  });
});

// Google OAuth strategy configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK
}, function (accessToken, refreshToken, profile, done) {
  // Save user info to MySQL or update existing user
  const user = {
    id: profile.id,
    first_name: profile.name.givenName,
    last_name: profile.name.familyName,
    email: profile.emails[0].value,
    google_id: profile.id,
    image: profile.photos[0].value
  };

  connection.query('SELECT * FROM users WHERE google_id = ?', [profile.id], function (err, results) {
    if (err) return done(err);

    if (results.length > 0) {
      // User exists, update their details
      return done(null, results[0]);
    } else {
      // User doesn't exist, insert into the database
      connection.query('INSERT INTO users (google_id, first_name, last_name, email, image) VALUES (?, ?, ?, ?, ?)', 
        [user.google_id, user.first_name, user.last_name, user.email, user.image], function (err, results) {
          if (err) return done(err);
          user.id = results.insertId;  // Attach the inserted user ID
          return done(null, user);
        });
    }
  });
}));

// Google sign-in route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('/');
  }
);

// Protected route (example)
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`<h1>Welcome, ${req.user.first_name} ${req.user.last_name}!</h1><p><img src="${req.user.image}" alt="Profile Image" /><br><a href="/logout">Logout</a></p>`);
  } else {
    res.send('<h1>Home Page</h1><p><a href="/auth/google">Sign In with Google</a></p>');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.send(err);
    }
    res.redirect('/');
  });
});
//telemedicine section 
// Enable CORS for all origins or specify only allowed origins
app.use(cors({
  origin: '*', // or '*' to allow all origins
  methods: ['GET', 'POST']
}));

const io = socketIo(server, {
  cors: {
    origin: '*', // or '*' to allow all origins
    methods: ['GET', 'POST']
  }
});

// Your Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Socket.IO handling
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);
    
    socket.on("send-message", (message) => {
      console.log("Message received: ", message);
      socket.broadcast.emit("receive-message", message); // Send to other users
  });

  socket.on("disconnect", () => {
      console.log("A user disconnected");
  });

    // User joins a room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room: ${roomId}`);

        // Notify other users in the room
        socket.to(roomId).emit('user-joined', socket.id);
    });

    // Relay signaling data
    socket.on('signal', ({ roomId, data }) => {
        socket.to(roomId).emit('signal', { sender: socket.id, data });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
// Handle real-time messaging
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Doctor sends message -> Broadcast to Patient
  socket.on('doctor-message', (message) => {
      console.log(`Doctor: ${message}`);
      io.emit('doctor-message', message);
  });

  // Patient sends message -> Broadcast to Doctor
  socket.on('patient-message', (message) => {
      console.log(`Patient: ${message}`);
      io.emit('patient-message', message);
  });

  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
});
connection.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected...");
});
// Doctor Registration Route
app.post('/register/doctor', (req, res) => {
  const { doctor_id, password, email, doctor_name, doctor_special } = req.body;

  // ✅ Check if required fields are provided
  if (!doctor_id || !password || !email || !doctor_name || !doctor_special) {
      return res.status(400).json({ message: "All fields are required" });
  }


  const checkQuery = "SELECT * FROM doctors WHERE email = ? OR doctor_id = ?";
  connection.query(checkQuery, [email, doctor_id], (err, results) => {
      if (err) {
          console.error("❌ Database Error:", err);
          return res.status(500).json({ message: "Database error" });
      }
      if (results.length > 0) {
          return res.status(400).json({ message: "Doctor already exists" });
      }

      // ✅ Hash the password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
              console.error("❌ Error hashing password:", err);
              return res.status(500).json({ message: "Error hashing password" });
          }

          // ✅ Insert doctor data into the database
          const insertQuery = "INSERT INTO doctors (doctor_id, password, email, doctor_name, doctor_special) VALUES (?, ?, ?, ?, ?)";
          connection.query(insertQuery, [doctor_id, hashedPassword, email, doctor_name, doctor_special], (err, results) => {
              if (err) {
                  console.error("❌ Error inserting doctor:", err);
                  return res.status(500).json({ message: "Error registering doctor", error: err });
              }
              res.status(201).json({ message: "Doctor registered successfully" });
          });
      });
  });
});

// ** Hospital Registration **
app.post("/register/hospital", async (req, res) => {
  const { hospital_id, password, email, hospital_name,hospital_address, hospital_contact } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Correct SQL query with placeholders for all values
    const query = "INSERT INTO hospitals (hospital_id, password, email, hospital_name, hospital_address, hospital_contact) VALUES (?, ?, ?, ?,?,?)";
    
    connection.query(query, [hospital_id, hashedPassword, email, hospital_name,hospital_address, hospital_contact], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Hospital registered successfully!" });
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Error hashing password' });
  }
});


// ** Doctor Login **
app.post("/login/doctor", (req, res) => {
  const { doctor_id, password } = req.body;

  connection.query("SELECT * FROM doctors WHERE doctor_id = ?", [doctor_id], async (err, results) => {
      if (err || results.length === 0) return res.status(400).json({ error: "Doctor not found" });

      const match = await bcrypt.compare(password, results[0].password);
      if (!match) return res.status(401).json({ error: "Invalid password" });

      const token = jwt.sign({ doctor_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.json({ message: "Login successful", token });
  });
});


// ** Hospital Login **
app.post("/login/hospital", (req, res) => {
  const { hospital_id, password } = req.body;

  connection.query("SELECT * FROM hospitals WHERE hospital_id = ?", [hospital_id], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
  }

  if (results.length > 0) {
      const hospital = results[0];

      // Compare the password with the stored hashed password
      const isMatch = await bcrypt.compare(password, hospital.password);
      if (isMatch) {
          // Create JWT token
          const token = jwt.sign({ hospitalId: hospital.hospital_id }, process.env.JWT_SECRET, { expiresIn: "1h" });


          // Send token and hospitalId in response
          res.json({ token, hospitalId: hospital.hospital_id });
      } else {
          res.status(400).json({ error: 'Invalid password' });
      }
  } else {
      res.status(404).json({ error: 'Hospital not found' });
  }
});
});
app.set('view engine', 'ejs');

// Route for the unique dashboard
// Route for the unique dashboard
app.get('/dashboard/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;

  // Fetch the hospital details from the database using the hospitalId
  connection.query('SELECT * FROM hospitals WHERE hospital_id = ?', [hospitalId], (err, results) => {
      if (err || results.length === 0) {
          return res.status(404).send('Hospital not found');
      }
      const hospital = results[0]; // Define hospital variable

      // Fetch bed details for the hospital
      connection.query('SELECT category, total_beds, available_beds FROM bed_data WHERE hospital_name = ?', 
        [hospital.hospital_name], (err, bedResults) => {
        
        if (err) {
          return res.status(500).send('Error fetching bed data');
        }
  
        // Render the EJS template with both hospital and bed data
        res.render('hospital-dashboard', { hospital, bedData: bedResults });
    });
  });
});

//bed management system 
// Bed management system
app.post('/submit-bed-data', (req, res) => {
  const { hospitalName, location, category, totalBeds, availableBeds } = req.body;

  // SQL query to insert or update bed data
  const query = `
    INSERT INTO bed_data (hospital_name, location, category, total_beds, available_beds)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE total_beds = VALUES(total_beds), available_beds = VALUES(available_beds)
  `;

  // Execute query
  connection.query(query, [hospitalName, location, category, totalBeds, availableBeds], (err, result) => {
      if (err) {
          console.error('Error inserting/updating data:', err);
          return res.status(500).json({ success: false, message: 'Error inserting/updating data' });
      }

      // Send a success response
      res.status(200).json({ success: true, message: 'Data inserted/updated successfully' });
  });
});
//server govt scheme 

// Route to fetch Excel data
app.get('/api/schemes', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'schemes.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const data = xlsx.utils.sheet_to_json(sheet);
    res.json(data);
});

