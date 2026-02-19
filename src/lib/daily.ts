
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
            // SECURITY: Hard limit room life to 2 hours
            // The room will be automatically deleted after this timestamp
            exp: Math.round(Date.now() / 1000) + 2 * 60 * 60,
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

/**
 * Create a secure access token with strict time limits.
 * @param durationInSeconds Max duration for the token validity (default 60 mins)
 */
export async function createDailyToken(
    roomName: string,
    userName: string,
    isOwner: boolean = false,
    durationInSeconds: number = 3600 // 1 hour default
): Promise<string> {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
    };

    // Calculate strict expiration
    const expirationTime = Math.round(Date.now() / 1000) + durationInSeconds;

    const body = {
        properties: {
            room_name: roomName,
            user_name: userName,
            is_owner: isOwner,
            // SECURITY: Token expires strictly
            exp: expirationTime,
            // CRITICAL: Force user ejection when token expires to prevent runaway billing
            eject_at_token_exp: true,
            // Optional: prevent joining before start time? (Not implemented here for simplicity)
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
