import * as Chai from "chai";
import * as ChaiAsPromised from "chai-as-promised";

import { Util, ICommandAction, ICommandParameters } from "../src/util";

Chai.use(ChaiAsPromised);
const expect = Chai.expect;

function CreateMockIntent(members) {
    return {
        getClient: () => {
            return {
                _http: {
                    authedRequestWithPrefix: async (_, __, url, ___, ____, _____) => {
                        const ret = [];
                        for (const member of members[url]) {
                            ret.push({
                                membership: member.membership,
                                state_key: member.mxid,
                                content: {
                                    displayname: member.displayname,
                                },
                            });
                        }
                        return {
                            chunk: ret,
                        };
                    },
                },
            };
        },
    };
}

describe("Util", () => {
    describe("MsgToArgs", () => {
        it("parses arguments", () => {
            const {command, args} = Util.MsgToArgs("!matrix command arg1 arg2", "!matrix");
            Chai.assert.equal(command, "command");
            // tslint:disable-next-line:no-magic-numbers
            Chai.assert.equal(args.length, 2);
            Chai.assert.equal(args[0], "arg1");
            Chai.assert.equal(args[1], "arg2");
        });
    });
    describe("ParseCommand", () => {
        it("parses commands", () => {
            const action: ICommandAction = {
                params: ["param1", "param2"],
                run: async ({param1, param2}) => {
                    return `param1: ${param1}\nparam2: ${param2}`;
                },
            };
            const parameters: ICommandParameters = {
                param1: {
                    get: async (param: string) => {
                        return "param1_" + param;
                    },
                },
                param2: {
                    get: async (param: string) => {
                        return "param2_" + param;
                    },
                },
            };
            return Util.ParseCommand(action, parameters, ["hello", "world"]).then((retStr) => {
                expect(retStr).equal("param1: param1_hello\nparam2: param2_world");
            });
        });
    });
    describe("GetMxidFromName", () => {
        it("Finds a single member", () => {
            const mockRooms = {
                "/rooms/abc/members": [
                    {
                        membership: "join",
                        mxid: "@123:localhost",
                        displayname: "GoodBoy",
                    },
                ],
            };
            const intent = CreateMockIntent(mockRooms);
            return Util.GetMxidFromName(intent, "goodboy", ["abc"]).then((mxid) => {
                expect(mxid).equal("@123:localhost");
            });
        });
        it("Errors on multiple members", () => {
            const mockRooms = {
                "/rooms/abc/members": [
                    {
                        membership: "join",
                        mxid: "@123:localhost",
                        displayname: "GoodBoy",
                    },
                    {
                        membership: "join",
                        mxid: "@456:localhost",
                        displayname: "GoodBoy",
                    },
                ],
            };
            const intent = CreateMockIntent(mockRooms);
            return expect(Util.GetMxidFromName(intent, "goodboy", ["abc"])).to.eventually.be.rejected;
        });
        it("Errors on no member", () => {
            const mockRooms = {
                "/rooms/abc/members": [
                    {
                        membership: "join",
                        mxid: "@123:localhost",
                        displayname: "GoodBoy",
                    },
                ],
            };
            const intent = CreateMockIntent(mockRooms);
            return expect(Util.GetMxidFromName(intent, "badboy", ["abc"])).to.eventually.be.rejected;
        });
    });
});
