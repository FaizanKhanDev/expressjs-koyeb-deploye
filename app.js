import express from 'express';
import { fileURLToPath } from 'url';
import http from 'http';
import path from 'path';

import cors from 'cors';
import { Server as SocketServer } from 'socket.io';
import Invitation from "./src/models/invitations/Invitations.js";
import connectDB from './src/config/connectdb.js';
import dotenv from 'dotenv';
import userRoutes from './src/routes/userRoutes.js';
import soundsRoutes from './src/routes/soundsRoutes/index.js'
import soundPackRoutes from './src/routes/soundPackRoutes/index.js';
import invitationsRoutes from './src/routes/invitationsRoutes/index.js';
import bodyParser from 'body-parser';
import upload from './src/middlewares/upload-middleware.js';
// import ChallengeSocketService from './src/sockets/ChallengeSocketService.js';
dotenv.config();
import { io, httpServer } from './src/sockets/socketio.js';
/* ================= Create Instance of Server =========== */
const app = express();
/* ================= Start Server on PORT =============== */
const PORT = process.env.PORT;
/* ================= Database Connection Url =============== */
const DATABASE_URL = process.env.DATABASE_URL;


/*
Cross-origin resource sharing (CORS) is a mechanism for integrating applications. 
CORS defines a way for client web applications that are loaded in one domain to 
interact with resources in a different domain
*/
/* ========= Cross-origin resource sharing (CORS) ========== */
app.use(cors());

/* ================= Connect to DB =============== */
connectDB(DATABASE_URL);


/* ============== For JSON data =========== */
app.use(express.json());


/*  ================= Increase payload size limit =========== */
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


/* =================  Setup Live/Local Url of uploads =========== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================ Serve static files from the 'uploads' directory ================= */
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads',)));

/* ================= CORS =============== */
app.use(cors());

/* ================= Connect to DB =============== */
connectDB(DATABASE_URL);

/* ================= Middlewares =============== */
app.use(express.json());

/* ========= Confirguring Multer ========= */
app.use(upload.fields([

  {
    name: 'sounds', maxCount: 1
  },
  {
    name: 'user_sounds', maxCount: 1
  },
  {
    name: 'sound_pack', maxCount: 1
  }
]));

/* ================= Routes ================= */
app.use("/api/user", userRoutes);
app.use("/api/sounds", soundsRoutes);
app.use("/api/soundpack", soundPackRoutes);
app.use("/api/invitations", invitationsRoutes);


// ChallengeSocketService.getInvitations();



/* ================= Socket Connection =============== */
io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);


  // socket.on('getInvitations', async () => {
  //   const payload = await Invitation.find();
  //   io.emit('invitations', payload);
  // });



  // socket.on('get_invitations', async (params) => {
  //   // console.log('Received get_invitations request', params);
  //   try {
      
  //     // const invitations = await Invitation.find({
  //       //   recipients: { $in: [params] },
  //       // });
  //       console.log('Received get_invitations request');
  //     const invitations = await Invitation.find();
  //     io.emit('invitations', invitations);
  //   } catch (error) {
  //     console.error(error);
  //     io.emit('error', { message: 'Internal server error' });
  //   }
  // });

  socket.on('create_invitation', async (invitationData) => {
    try {
      console.log('Received create_invitation request');
      let newInvitation = "";
      newInvitation = await Invitation.create(invitationData);

      setTimeout(async () => {
        newInvitation = await Invitation.findByIdAndDelete(newInvitation._id);
        io.emit('invitation_deleted', newInvitation._id);
        console.log("Invitation deleted: ", newInvitation._id);

      }, 12000);
      io.emit('invitation_created', newInvitation);
    } catch (error) {
      console.error(error);
      socket.emit('error', { message: 'Error creating invitation' });
    }
  });



  socket.on('message', async (data) => {
    io.emit('messageResponse', data);
  });

  socket.on('newUser', (data) => {
    // users.push(data);
    io.emit('newUserResponse', users);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
    // users = users.filter((user) => user.socketID !== socket.id);
    // io.emit('newUserResponse', users);
    socket.disconnect();
  });

  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));


});


app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});


/* ================= Start Server on PORT =============== */
httpServer.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  
});
