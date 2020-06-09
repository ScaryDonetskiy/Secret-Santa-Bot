import {ContextMessageUpdate, Markup} from "telegraf";
import {ActionInterface} from "./ActionInterface";
import {TeamRepository} from "../repositories/TeamRepository";
import {UserRepository} from "../repositories/UserRepository";

export class CreateCommand implements ActionInterface {
    private teamRepository: TeamRepository;
    private userRepository: UserRepository;

    constructor(teamRepository: TeamRepository, userRepository: UserRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
    }

    do(ctx: ContextMessageUpdate): void {
        const from = ctx.from;
        if (from === undefined) {
            console.warn(ctx);
            return;
        }

        const teamResult = this.teamRepository.create(from.id.toString());
        teamResult.resultPromise.then(() => {
            ctx.reply(`Your team token: ${teamResult.document.id}`).catch(console.error);
            const username = from.username === undefined ? `${from.first_name} ${from.last_name}` : from.username;
            const userResult = this.userRepository.createToTeam(from.id.toString(), username, teamResult.document.id)
            userResult.resultPromise.then(() => ctx
                .reply(
                    'You are joined a team! Now you can send me a command "/recipient" and I\'ll choose it for you',
                    Markup.keyboard(['/recipient']).resize().extra()
                ), null
            );
        }, null);
    }
}
