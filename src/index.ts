import axios from 'axios';

import {TokenInfo, TokenInfoEntries} from "./token-info";


const BASE_URL = "https://core-dev.a11bd.net";

export async function getTokenInfo(): Promise<TokenInfo> {
    const { data, status } = await axios.get<TokenInfoEntries>(
        BASE_URL + '/token-info',
        {
            headers: {
                Accept: 'application/json',
            },
        },
    );
    return new TokenInfo(data);
}
