import {ContextMessageUpdate, Markup} from "telegraf";
import * as admin from "firebase-admin";
import {ActionInterface} from "./ActionInterface";

export class CreateCommand implements ActionInterface {
    private db: admin.firestore.Firestore;

    constructor(db: admin.firestore.Firestore) {
        this.db = db;
    }

    do(ctx: ContextMessageUpdate): void {
        const from = ctx.from;
        if (from === undefined) {
            console.warn(ctx);
            return;
        }

        const teamDocument = this.db.collection('teams').doc();
        teamDocument.set({
            adminId: from.id.toString()
        }).then(() => {
            ctx.reply(`Your team token: ${teamDocument.id}`).catch(console.error);
            const userDocument = this.db.collection('users').doc(from.id.toString());
            userDocument.set({
                teamId: teamDocument.id,
                username: from.username,
            }).then(() => ctx
                .reply(
                    'You are joined a team! Now you can send me a command "/recipient" and I\'ll choose it for you',
                    Markup.keyboard(['/recipient']).resize().extra()
                ), null
            );
        }, null);
    }
}
