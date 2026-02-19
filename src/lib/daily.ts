
const DAILY_API_KEY = process.env.DAILY_API_KEY;

if (!DAILY_API_KEY) {
    console.warn("DAILY_API_KEY is missing from environment variables.");
}

const DAILY_API_URL = "https://api.daily.co/v1";

interface CreateRoomResponse {
    id: string;
    name: string;
    api_created: boolean;
    privacy: string;
    url: string;
    created_at: string;
    config: {
        exp: number;
    };
}

interface CreateTokenResponse {
    token: string;
}

export async function createDailyRoom(roomName?: string): Promise<CreateRoomResponse> {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
    };

    const body: any = {
        privacy: "private",
        properties: {
            enable_chat: true,
            enable_screenshare: true,
            // Default expiration: 24 hours from now
            exp: Math.round(Date.now() / 1000) + 24 * 60 * 60,
        },
    };

    if (roomName) {
        body.name = roomName;
    }

    const res = await fetch(`${DAILY_API_URL}/rooms`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Failed to create Daily room: ${error}`);
    }

    return res.json();
}

export async function createDailyToken(
    roomName: string,
    userName: string,
    isOwner: boolean = false
): Promise<string> {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
    };

    const body = {
        properties: {
            room_name: roomName,
            user_name: userName,
            is_owner: isOwner,
            // Token expires in 2 hours
            exp: Math.round(Date.now() / 1000) + 2 * 60 * 60,
        },
    };

    const res = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Failed to create Daily token: ${error}`);
    }

    const data: CreateTokenResponse = await res.json();
    return data.token;
}
