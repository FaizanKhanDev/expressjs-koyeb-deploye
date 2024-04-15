import challengeGroupModel from "../../models/challenges/ChallengeGroup.js";
import challengeRoomModel from "../../models/challenges/ChallengeGroup.js";
import Invitation from "../../models/invitations/Invitations.js";
import InvitationRecipients from "../../models/invitations/invitationRecipients.js";
import { io, httpServer } from '../../sockets/socketio.js';

class ChallengeController {
    static createChallenge(socket) {
        /* ========== Creating Challenge By User  ======== */
        socket.io("create_challenge", async (data) => {
            console.log(JSON.stringify(data))

            /* ========== DeStructuring Variables ========= */
            let {
                challenge,
                challenge_room,
                invitation
            } = data

            if (!challenge || !challenge_room || !invitation) {
                io.emit('error', { message: 'Internal server error', status: 500 });
            }
            /* =========== Create a New Challenge Group ========= */
            const create_challenge = new challengeGroupModel(challenge)
            create_challenge.save();

            /* =========== Create a New Challenge Room For Challenge ========= */
            const create_challenge_room = new challengeRoomModel(challenge_room);
            create_challenge_room.save();

            /* =========== Create a New Invitation For Inviting in challenge Room ========= */
            const create_invitation = new Invitation(
                invitation
            );

            await create_invitation.save();

            /* ========== Create a Recipents for Invitation ========= */
            const recipientsPromises = invitation.recipients.map(async (recipient) => {
                const invitationRecipient = new InvitationRecipients({
                    user_id: recipient,
                    invitation_id: invitation._id,
                    is_expired: false
                });
                return invitationRecipient.save();
            });
            await Promise.all(recipientsPromises);
        })
    }



}

export default ChallengeController