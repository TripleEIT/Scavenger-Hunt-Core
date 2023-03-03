import { RewardEntry } from 'src/storage/rewardData';
import { generateRandomString } from '../utils';

export const hasDefaultRewardSuggestion = (rewardId) => {
    // Check if we have any default reward suggestions
    // Further checks may be added, currently only checks if the rewardName is in the defaultRewardSuggestions
    return defaultRewardSuggestions.some((reward) => reward.id === rewardId);
};

export const getDefaultReward = (rewardId) => {
    // Pulled straight from the defaultRewardSuggestions
    // further customizations may be added at this location
    return defaultRewardSuggestions.find((reward) => reward.id === rewardId);
};

export const getNewGenericReward = () => {
    // Generate a new generic reward
    // This is used when a user creates a new reward
    return {
        id: generateRandomString(30),
        name: 'New Reward',
        description: 'A new reward',
        incrementName: 'point(s)',
        quantityRequired: 10,
        outstandingRewards: 0,
        enabled: false
    } as RewardEntry;
};

export const blankReward: RewardEntry = {
    id: '',
    name: '',
    description: '',
    incrementName: '',
    quantityRequired: 0,
    outstandingRewards: 0,
    enabled: false
};

export const firstIncrementEarnedMessage: string =
    '{{userMention}} earned their first {{rewardIcon}} towards a {{rewardName}}!  Only {{quantityRemaining}} more {{incrementName}} to go!  \r\nCheck the app page to see your progress.';
export const incrementEarnedMessage: string =
    '{{userMention}} earned one more {{incrementName}} towards a {{rewardName}}, keep up the good work.';
export const oneIncrementRemainingMessage: string =
    'There is only one {{increment}} remaining until {{userMention}} earns a {{rewardName}}!  \r\nKeep an eye on the leaderboard to see how things are progressing.';
export const rewardEarnedMessage: string =
    '{{rewardIcon}}{{rewardIcon}}Congratulations {{userMention}}, you earned a {{rewardName}}!{{rewardIcon}}{{rewardIcon}} \r\nYou can redeem your reward from the Scavenger Hunt tab.';

export const rewardRedeemedMessage: string = 'Congratulations on collecting all of the increments needed, enjoy your reward!';

export const defaultRewardSuggestions: RewardEntry[] = [
    {
        id: 'reward-three',
        name: 'Breakfast Treats',
        description: 'Start your day off right with a breakfast treat!',
        incrementName: 'donut(s)',
        quantityRequired: 5,
        outstandingRewards: 0,
        enabled: true,
        icon: ':doughnut:'
    },
    {
        id: 'reward-two',
        name: 'Caffeine Boost',
        description: 'Grab a coffee or energy drink to keep you going, our gift to you!',
        incrementName: 'bean(s)',
        quantityRequired: 5,
        outstandingRewards: 0,
        enabled: true,
        icon: ':coffee:'
    },
    {
        id: 'reward-one',
        name: 'Team Pizza Party',
        description: "A pizza party for the whole team!  We'll even throw in some extra slices for the next day!",
        incrementName: 'slice(s)',
        quantityRequired: 10,
        outstandingRewards: 0,
        enabled: true,
        icon: ':pizza:'
    }
];
