import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Telegraf from 'telegraf';
import * as _ from 'underscore';

const db = admin.initializeApp(functions.config().firebase).firestore();
const bot = new Telegraf(functions.config().telegram.bot_token);

bot.start(ctx => ctx.reply('Welcome to Secret Santa Bot! Send me your team id or use "/create <team_name>" command to make a new one'));

bot.command('create', ctx => {
    const teamName = ctx.message;
    const teamDocument = db.collection('teams').doc();
    teamDocument.set({
        title: teamName
    }).then(() => {
        ctx.reply(`Your team token: ${teamDocument.id}`);

        const from = ctx.from;
        if (from === undefined) {
            console.log(ctx);
            return;
        }
        const userDocument = db.collection('users').doc(from.id.toString());
        userDocument.set({
            teamId: teamDocument.id,
            username: from.username,
        }).then(() => ctx.reply('You are joined a team! Now you can send me a command "/recipient" and I\'ll choose it for you'));
    });
});

bot.on('text', ctx => {
    const message = ctx.message;
    if (message === undefined) {
        console.log(ctx);
        return;
    }
    db.collection('teams').doc(message.toString()).get().then(doc => {
        if (doc.exists) {
            const from = ctx.from;
            if (from === undefined) {
                console.log(ctx);
                return;
            }
            const userDocument = db.collection('users').doc(from.id.toString());
            userDocument.set({
                teamId: doc.id,
                username: from.username,
            }).then(() => ctx.reply('You are joined a team! Now you can send me a command "/recipient" and I\'ll choose it for you'));
        } else {
            ctx.reply('Team is not found :(');
        }
    })
});

bot.command('recipient', ctx => {
    const from = ctx.from;
    if (from === undefined) {
        console.log(ctx);
        return;
    }
    db.collection('users').doc(from.id.toString()).get().then(doc => {
        if (doc.exists) {
            const teamDocument = db.collection('teams').doc(doc.get('teamId'));
            teamDocument.collection('gift_map').where('from', '==', doc.id).get().then(snapshot => {
                if (snapshot.empty) {
                    const teamMembers = <any>[];
                    const giftReceivers = <any>[];
                    const usersPromise = db.collection('users').where('teamId', '==', doc.get('teamId')).get().then(usersSnapshot => {
                        usersSnapshot.forEach(user => teamMembers.push(user.id));
                    });
                    const receiversPromise = teamDocument.collection('gift_map').get().then(teamSantasSnapshot => {
                        teamSantasSnapshot.forEach(item => giftReceivers.push(item.get('to')));
                    });
                    Promise.all([usersPromise, receiversPromise]).then(() => {
                        const withoutGift = _.intersection(teamMembers, giftReceivers);
                        db.collection('users').doc(_.sample(withoutGift)).get().then(receiver => {
                            teamDocument.collection('gift_map').doc().set({
                                from: doc.id,
                                to: receiver.id
                            }).then(() => ctx.reply(`You are Secret Santa for ${receiver.get('username')}`));
                        });
                    });
                } else {
                    snapshot.forEach(giftMapDocument => {
                        db.collection('users').doc(giftMapDocument.get('from')).get().then(user => {
                            ctx.reply(`You are Secret Santa for ${user.get('username')}`)
                        })
                    });
                }
            });
        } else {
            ctx.reply('You aren\'t joined any team. Create your one using "/create <team_name>" command or just send me a team token');
        }
    });
});

bot.launch();

export const helloWorld = functions.https.onRequest((request, response) => {
    response.redirect('https://t.me/cloud_santa_bot')
});


