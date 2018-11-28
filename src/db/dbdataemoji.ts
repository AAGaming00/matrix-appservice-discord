import { DiscordStore } from "../store";
import { IDbData } from "./dbdatainterface";
import { ISqlCommandParameters } from "./connector";

export class DbEmoji implements IDbData {
    public EmojiId: string;
    public Name: string;
    public Animated: boolean;
    public MxcUrl: string;
    public CreatedAt: number;
    public UpdatedAt: number;
    public Result: boolean;

    public async RunQuery(store: DiscordStore, params: ISqlCommandParameters): Promise<void> {
        let query = `
            SELECT *
            FROM emoji
            WHERE emoji_id = $id`;
        if (params.mxc_url) {
            query = `
                SELECT *
                FROM emoji
                WHERE mxc_url = $mxc`;
        }
        const row = await store.db.Get(query, {
                id: params.emoji_id,
                mxc: params.mxc_url,
            });
        this.Result = row !== undefined;
        if (this.Result) {
            this.EmojiId = row.emoji_id as string;
            this.Name = row.name as string;
            this.Animated = Boolean(row.animated);
            this.MxcUrl = row.mxc_url as string;
            this.CreatedAt = row.created_at as number;
            this.UpdatedAt = row.updated_at as number;
        }
    }

    public async Insert(store: DiscordStore): Promise<void> {
        this.CreatedAt = new Date().getTime();
        this.UpdatedAt = this.CreatedAt;
        await store.db.Run(`
            INSERT INTO emoji
            (emoji_id,name,animated,mxc_url,created_at,updated_at)
            VALUES ($emoji_id,$name,$animated,$mxc_url,$created_at,$updated_at);`, {
                animated: Number(this.Animated),
                created_at: this.CreatedAt,
                emoji_id: this.EmojiId,
                mxc_url: this.MxcUrl,
                name: this.Name,
                updated_at: this.UpdatedAt,
        });
    }

    public async Update(store: DiscordStore): Promise<void> {
        // Ensure this has incremented by 1 for Insert+Update operations.
        this.UpdatedAt = new Date().getTime() + 1;
        await store.db.Run(`
            UPDATE emoji
            SET name = $name,
            animated = $animated,
            mxc_url = $mxc_url,
            updated_at = $updated_at
            WHERE
            emoji_id = $emoji_id`, {
                animated: Number(this.Animated),
                emoji_id: this.EmojiId,
                mxc_url: this.MxcUrl,
                name: this.Name,
                updated_at: this.UpdatedAt,
        });
    }

    public async Delete(store: DiscordStore): Promise<void> {
        throw new Error("Delete is not implemented");
    }
}
