import { Server as SocketServer } from 'socket.io';
import http from 'http';
import ChallengeController from "../controllers/ChallengeController/index.js";
import InvitationsController from "../controllers/invitationsController/index.js";

/* ================= Setup Socket Server =============== */
const setupSocketServer = (app) => {
  const httpServer = http.createServer(app);
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*"
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    /* ========= Send Invitation to users via Socket For Challenge Room ======== */
    socket.on('get_invitations', async (data) => {
      InvitationsController.getInvitations(io, socket, data);
    });

    // ChallengeController.createChallenge(socket);


    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
    });
  });

  return { httpServer, io };
};


const { httpServer, io } = setupSocketServer();

/* ================= Export Socket Server and IO =============== */
export { httpServer, io };
