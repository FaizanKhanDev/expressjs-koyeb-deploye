import { fileURLToPath } from 'url';
import Invitation from './models/invitations/invitations.js';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import express from 'express';
import cors from 'cors';
import connectDB from './config/connectdb.js';
import userRoutes from './routes/userRoutes.js';
import soundsRoutes from './routes/soundsRoutes/index.js'
import soundPackRoutes from './routes/soundPackRoutes/index.js';
import invitationsRoutes from './routes/invitationsRoutes/index.js';
import multer from 'multer';
import bodyParser from 'body-parser';
import upload from './middlewares/upload-middleware.js';
import http from 'http';
const app = express();
const port = process.env.PORT;
const realTimePort = process.env.REALTIME_PORT;
const DATABASE_URL = process.env.DATABASE_URL;
import InvitationRecipients from "./models/invitations/invitationRecipents.js";
import InvitationsController from './controllers/invitationsController/index.js';
import { Server as SocketServer } from 'socket.io';

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

// const server = http.createServer(app); // Add this
// InvitationsController.setupWebSocket(server);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", async (socket) => {
//   socket.on("disconnect", () => {
//     console.log("user disconnected");
//   });

//   // socket.on('create_invitation', async (data) => {
//   //   try {
//   //       const { type, recipients, user_id, is_expired } = data;
//   //       console.log(data);
//   //       if (!type || !recipients || !user_id || !is_expired) {
//   //           socket.emit('error', { message: 'All fields are required' });
//   //           return;
//   //       }   

//   //       const invitation = new Invitation({
//   //           type: type,
//   //           recipients: recipients,
//   //       });

//   //       // Save the invitation
//   //       await invitation.save();

//   //       // Iterate over recipients and save each one
//   //       const recipientsPromises = recipients.map(async (recipient) => {
//   //           const invitationRecipient = new InvitationRecipients({
//   //               user_id: recipient,
//   //               invitation_id: invitation._id,
//   //               is_expired
//   //           });
//   //           return invitationRecipient.save();
//   //       });

//   //       // Wait for all recipient saves to complete
//   //       await Promise.all(recipientsPromises);

//   //       socket.emit('invitation_created', { message: 'Invitation created successfully', data: invitation });
//   //   } catch (error) {
//   //       console.error(error);
//   //       socket.emit('error', { message: 'Internal server error' });
//   //   }
//   // });




//   socket.on('get_invitations', async () => {
//     try {
//       console.log('Received get_invitations request');
//       const invitations = await Invitation.find()
//       socket.emit('invitations', invitations);
//     } catch (error) {
//       console.error(error);
//       socket.emit('error', { message: 'Internal server error' });
//     }
//   });




// })

/* ================= Routes ================= */
app.use("/api/user", userRoutes);
app.use("/api/sounds", soundsRoutes);
app.use("/api/soundpack", soundPackRoutes);
app.use("/api/invitations", invitationsRoutes);

const socketIO = new SocketServer(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

//Add this before the app.get() block
socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data);
  });


  //Listens when a new user joins the server
  socket.on('newUser', (data) => {
    //Adds the new user to the list of users
    users.push(data);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);
    socket.disconnect();
  });

  socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));

//   socket.on('get_invitations', async () => {
//     try {
//         console.log('Received get_invitations request');
//         const invitations = await Invitation.find()
//         socket.emit('invitations', invitations);
//     } catch (error) {
//         console.error(error);
//         socket.emit('error', { message: 'Internal server error' });
//     }
// })


});






const httpServer = http.Server(app);


const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on  http://localhost:${PORT}`);
});



// server.listen(realTimePort, () => {
//   console.log(`realtime server listening at http://localhost:${realTimePort}`);
// });

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
