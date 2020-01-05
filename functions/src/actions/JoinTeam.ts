import * as admin from "firebase-admin";
import {ContextMessageUpdate, Markup} from "telegraf";
import {ActionInterface} from "./ActionInterface";

export class JoinTeam implements ActionInterface {
    private db: admin.firestore.Firestore;

    constructor(db: admin.firestore.Firestore) {
        this.db = db;
    }

    do(ctx: ContextMessageUpdate): void {
        const message = ctx.message;
        if (message === undefined) {
            console.warn(ctx);
            return;
        }
        const text = message.text;
        if (text === undefined) {
            console.warn(ctx);
            return;
        }
        this.db.collection('teams').doc(text).get().then(doc => {
            if (doc.exists) {
                const from = ctx.from;
                if (from === undefined) {
                    console.warn(ctx);
                    return;
                }
                const userDocument = this.db.collection('users').doc(from.id.toString());
                const username = from.username === undefined ? `${from.first_name} ${from.last_name}` : from.username;
                userDocument.set({
                    teamId: doc.id,
                    username: username,
                }).then(() => ctx.reply('You are joined a team! Now you can send me a command "/recipient" and I\'ll choose it for you',
                    Markup.keyboard(['/recipient']).resize().extra()), null);
            } else {
                ctx.reply('Team is not found :(').catch(console.error);
            }
        }, null);
    }
}