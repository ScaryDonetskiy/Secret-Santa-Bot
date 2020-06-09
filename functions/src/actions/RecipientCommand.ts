import {ContextMessageUpdate, Markup} from "telegraf";
import * as _ from "underscore";
import {ActionInterface} from "./ActionInterface";
import {UserRepository} from "../repositories/UserRepository";
import {GiftMapRepository} from "../repositories/GiftMapRepository";

export class RecipientCommand implements ActionInterface {
    private userRepository: UserRepository;
    private giftMapRepository: GiftMapRepository;

    constructor(userRepository: UserRepository, giftMapRepository: GiftMapRepository) {
        this.userRepository = userRepository;
        this.giftMapRepository = giftMapRepository;
    }

    do(ctx: ContextMessageUpdate): void {
        const from = ctx.from;
        if (from === undefined) {
            console.warn(ctx);
            return;
        }
        this.userRepository.find(from.id.toString()).then(doc => {
            if (doc.exists) {
                this.giftMapRepository.findByTeamIdAndUserId(doc.get('teamId'), doc.id).then(snapshot => {
                    if (snapshot.empty) {
                        const teamMembers = <any>[];
                        const giftReceivers = <any>[];
                        const usersPromise = this.userRepository.findByTeamId(doc.get('teamId')).then(usersSnapshot => {
                            usersSnapshot.forEach(user => teamMembers.push(user.id));
                        });
                        const receiversPromise = this.giftMapRepository.findByTeamId(doc.get('teamId')).then(teamSantasSnapshot => {
                            teamSantasSnapshot.forEach(item => giftReceivers.push(item.get('to')));
                        });
                        Promise.all([usersPromise, receiversPromise]).then(() => {
                            const withoutGift = _.difference(teamMembers, giftReceivers);
                            const userId: string | undefined = _.sample(_.without(withoutGift, doc.id));
                            if (userId === undefined) {
                                ctx.reply('Sorry, we need more players :(').catch(console.log);
                                return;
                            }

                            this.userRepository.find(userId).then(receiver => {
                                this.giftMapRepository.setNewPair(doc.get('teamId'), doc.id, receiver.id)
                                    .then(() => ctx.reply(`You are Secret Santa for @${receiver.get('username')}`), null);
                            }, null);
                        }, null);
                    } else {
                        snapshot.forEach(giftMapDocument => {
                            this.userRepository.find(giftMapDocument.get('to')).then(user => {
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