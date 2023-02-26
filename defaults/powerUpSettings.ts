export interface PowerUpDefinition {
    name: string;
    description: string;
    durationSeconds: number;
    duration: string;
}

export const getPowerUpDefinition = (type) => {
    return powerUpDefinitions[type] as PowerUpDefinition;
};

const powerUpDefinitions = {
    doubleReward: {
        name: 'Double Reward Detective',
        description: 'Up your sleuthing skills for a day and get double the rewards whenever you find an increment.',
        durationSeconds: 60 * 60 * 24 * 1,
        duration: '1 Day'
    },
    luckyCharm10: {
        name: 'Lucky Charm 10',
        description: "You're own magical charm!  Increase your chance of finding any increment by 10%",
        durationSeconds: 60 * 60 * 6,
        duration: '6 Hours'
    }
};
