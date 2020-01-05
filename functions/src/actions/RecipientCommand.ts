import * as admin from "firebase-admin";
import {ContextMessageUpdate, Markup} from "telegraf";
import * as _ from "underscore";
import {ActionInterface} from "./ActionInterface";

export class RecipientCommand implements ActionInterface {
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
        this.db.collection('users').doc(from.id.toString()).get().then(doc => {
            if (doc.exists) {
                const teamDocument = this.db.collection('teams').doc(doc.get('teamId'));
                teamDocument.collection('gift_map').where('from', '==', doc.id).get().then(snapshot => {
                    if (snapshot.empty) {
                        const teamMembers = <any>[];
                        const giftReceivers = <any>[];
                        const usersPromise = this.db.collection('users').where('teamId', '==', doc.get('teamId')).get().then(usersSnapshot => {
                            usersSnapshot.forEach(user => teamMembers.push(user.id));
                        });
                        const receiversPromise = teamDocument.collection('gift_map').get().then(teamSantasSnapshot => {
                            teamSantasSnapshot.forEach(item => giftReceivers.push(item.get('to')));
                        });
                        Promise.all([usersPromise, receiversPromise]).then(() => {
                            const withoutGift = _.difference(teamMembers, giftReceivers);
                            const userId: string|undefined = _.sample(_.without(withoutGift, doc.id));
                            if (userId === undefined) {
                                ctx.reply('Sorry, we need more players :(').catch(console.log);
                                return;
                            }

                            this.db.collection('users').doc(userId).get().then(receiver => {
                                teamDocument.collection('gift_map').doc().set({
                                    from: doc.id,
                                    to: receiver.id
                                }).then(() => ctx.reply(`You are Secret Santa for @${receiver.get('username')}`), null);
                            }, null);
                        }, null);
                    } else {
                        snapshot.forEach(giftMapDocument => {
                            this.db.collection('users').doc(giftMapDocument.get('to')).get().then(user => {
                                ctx.reply(`You are Secret Santa for @${user.get('username')}`).catch(console.error);
                            }, null);
                        });
                    }
                }, null);
            } else {
                ctx.reply('You aren\'t joined any team. Create your one using "/create" command or just send me a team token',
                    Markup.keyboard(['/create']).oneTime().resize().extra()).catch(console.log);
            }
        }, null);
    }
}