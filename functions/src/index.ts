import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Telegraf from 'telegraf';
import {CreateCommand} from "./actions/CreateCommand";
import {RecipientCommand} from "./actions/RecipientCommand";
import {JoinTeam} from "./actions/JoinTeam";
import {Start} from "./actions/Start";

const db = admin.initializeApp(functions.config().firebase).firestore();
const bot = new Telegraf(functions.config().telegram.bot_token);

bot.start(new Start().do);
bot.command('create', ctx => {
    new CreateCommand(db).do(ctx);
});
bot.command('recipient', ctx => {
    new RecipientCommand(db).do(ctx);
});
bot.on('text', ctx => {
    new JoinTeam(db).do(ctx);
});

export const webhookCallbackFn = functions.https.onRequest(((req, resp) => bot.handleUpdate(req.body, resp)));

export const helloWorld = functions.https.onRequest((request, response) => {
    response.redirect('https://t.me/cloud_santa_bot')
});

bot.telegram.setWebhook(`https://us-central1-${admin.instanceId().app.options.projectId}.cloudfunctions.net/webhookCallbackFn`).catch(console.error);

