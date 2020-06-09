import {ContextMessageUpdate, Markup} from "telegraf";
import {ActionInterface} from "./ActionInterface";
import {TeamRepository} from "../repositories/TeamRepository";
import {UserRepository} from "../repositories/UserRepository";

export class JoinTeam implements ActionInterface {
    private teamRepository: TeamRepository;
    private userRepository: UserRepository;

    constructor(teamRepository: TeamRepository, userRepository: UserRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
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
        this.teamRepository.find(text).then((team: FirebaseFirestore.DocumentSnapshot) => {
            if (team.exists) {
                const from = ctx.from;
                if (from === undefined) {
                    console.warn(ctx);
                    return;
                }
                const username = from.username === undefined ? `${from.first_name} ${from.last_name}` : from.username;
                this.userRepository.createToTeam(from.id.toString(), username, team.id).resultPromise.then(() => ctx
                    .reply(
                        'You are joined a team! Now you can send me a command "/recipient" and I\'ll choose it for you',
                        Markup.keyboard(['/recipient']).resize().extra()
                    ), null);
            } else {
                ctx.reply('Team is not found :(').catch(console.error);
            }
        }, null);
    }
}