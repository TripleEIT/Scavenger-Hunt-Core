const defaultPowerUps = [
    {
        type: 'doubleReward',
        quantity: 2
    },
    {
        type: 'luckyCharm10',
        quantity: 1
    }
];

export const defaultUserRecord = {
    accountId: '',
    awardActivity: [],
    powerUpActivity: [],
    awardBalance: [],
    powerUpBalance: defaultPowerUps,
    activePowerUp: null,
    activePowerUpExpiration: null,
};
