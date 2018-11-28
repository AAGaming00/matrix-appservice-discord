import * as Discord from "discord.js";
import { MockUser } from "./user";

// we are a test file and thus need those
/* tslint:disable:no-unused-expression max-file-line-count no-any */

export class MockMessage {
    public embeds: any[] = [];
    public content = "";
    public channel: Discord.TextChannel | undefined;
    public guild: Discord.Guild | undefined;
    public author: MockUser;
    public mentions: any = {};
    constructor(channel?: Discord.TextChannel) {
        this.mentions.everyone = false;
        this.channel = channel;
        if (channel && channel.guild) {
            this.guild = channel.guild;
        }
        this.author = new MockUser("123456");
    }
}
