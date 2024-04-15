import { Server as SocketServer } from 'socket.io'; // Import Server class from socket.io
import http from 'http';
import Invitation from "../../models/invitations/Invitations.js";
import InvitationRecipients from "../../models/invitations/invitationRecipients.js";

import { io, httpServer } from '../../sockets/socketio.js';
class InvitationsController {
    static getInvitations = async (io, socket, data) => {
        /* ========== Send Invitation to users via Socket For Challenge Room ======== */
        console.log('Received get_invitations request');
        try {
            const invitations = await Invitation.find({
                recipients: { $in: [data] },
            })
            .populate("recipients").populate("challenge_room").populate("created_by");


            /* =========== Deleting Invitation after 12 seconds ======== */
            // setTimeout(async () => {
            //     const deleteInvitationRecipients = await InvitationRecipients.deleteMany({ invitation_id: invitations._id });
            //     const deleteInvitation = await Invitation.findByIdAndDelete(invitations._id);
            //     let payload = {
            //         message: 'Invitation deleted successfully',
            //         data: {
            //             deleteInvitationRecipients,
            //             deleteInvitation
            //         },
            //         status: 200
            //     }
            //     /* ========== Emit Invitation Deleted ======== */
            //     io.emit('invitation_deleted', payload);
            // }, 12000);

            /* ========== Emit Invitation ======== */
            io.emit('invitations', invitations);
        } catch (error) {
            console.error(error);
            io.emit('error', { message: 'Internal server error' });
        }
    }

    static createInvitation = async (data) => {
      
    }
}

export default InvitationsController;








