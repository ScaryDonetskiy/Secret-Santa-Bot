import {ContextMessageUpdate} from "telegraf";

export interface ActionInterface {
    do(ctx: ContextMessageUpdate): void;
}