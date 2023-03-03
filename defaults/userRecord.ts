import { PowerUpStatus, User } from 'src/storage/userData';

const defaultPowerUps: PowerUpStatus[] = [
    {
        type: 'doubleReward',
        quantity: 2
    },
    {
        type: 'luckyCharm10',
        quantity: 1
    }
];

export const defaultUserRecord: User = {
    accountId: '',
    rewardActivity: [],
    powerUpActivity: [],
    rewardBalance: [],
    powerUpBalance: defaultPowerUps,
    activePowerUp: null,
    activePowerUpExpiration: null
};
