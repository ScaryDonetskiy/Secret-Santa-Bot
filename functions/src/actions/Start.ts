import {ContextMessageUpdate, Markup} from "telegraf";
import {ActionInterface} from "./ActionInterface";

export class Start implements ActionInterface {
    do(ctx: ContextMessageUpdate): void {
        ctx.reply('Welcome to Secret Santa Bot! Send me your team id or use "/create" command to make a new one',
            Markup.keyboard(['/create']).oneTime().resize().extra()).catch(console.error);
    }
}