import challengeGroupModel from "../models/challenges/ChallengeGroup.js";
import challengeRoomModel from "../models/challenges/ChallengeRoom.js";
import Invitation from "../models/invitations/Invitations.js";
import InvitationRecipients from "../models/invitations/invitationRecipients.js";
import { io, httpServer } from './socketio.js';

class ChallengeSocketService {
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

    static getInvitations(socket) {
        /* ========== Send Invitation to users via Socket For Challenge Room ======== */
        socket.on('get_invitations', async (params) => {
            console.log('Received get_invitations request');
            try {
                if (!params) {
                    io.emit('error', { message: 'Internal server error', status: 500 });
                }

                const invitations = await Invitation.find({
                    recipients: { $in: [params] },
                }).populate("recipients").populate("challenge_room").populate("created_by");


                /* =========== Deleting Invitation after 12 seconds ======== */
                setTimeout(async () => {
                    const deleteInvitationRecipients = await InvitationRecipients.deleteMany({ invitation_id: invitations._id });
                    const deleteInvitation = await Invitation.findByIdAndDelete(invitations._id);
                    let payload = {
                        message: 'Invitation deleted successfully',
                        data: {
                            deleteInvitationRecipients,
                            deleteInvitation
                        },
                        status: 200
                    }
                    /* ========== Emit Invitation Deleted ======== */
                    io.emit('invitation_deleted', payload);
                }, 12000);

                /* ========== Emit Invitation ======== */
                io.emit('invitations', invitations);
            } catch (error) {
                console.error(error);
                io.emit('error', { message: 'Internal server error' });
            }
        });
    }

}

export default ChallengeSocketService