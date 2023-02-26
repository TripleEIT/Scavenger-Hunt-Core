import { AwardEntry } from 'src/storage/awardData';
import { generateRandomString } from '../utils';

export const hasDefaultAwardSuggestion = (awardId) => {
    // Check if we have any default award suggestions
    // Further checks may be added, currently only checks if the awardName is in the defaultAwardSuggestions
    return defaultAwardSuggestions.some((award) => award.id === awardId);
};

export const getDefaultAward = (awardId) => {
    // Pulled straight from the defaultAwardSuggestions
    // further customizations may be added at this location
    return defaultAwardSuggestions.find((award) => award.id === awardId);
};

export const getNewGenericAward = () => {
    // Generate a new generic award
    // This is used when a user creates a new award
    return {
        id: generateRandomString(30),
        name: 'New Award',
        description: 'A new award',
        incrementName: 'point(s)',
        quantityRequired: 10,
        outstandingAwards: 0,
        enabled: false
    } as AwardEntry;
};

export const blankAward : AwardEntry = {
    id: '',
    name: '',
    description: '',
    incrementName: '',
    quantityRequired: 0,
    outstandingAwards: 0,
    enabled: false
};

export const firstIncrementEarnedMessage : string =
    '{{userMention}} earned their first {{awardIcon}} towards a {{awardName}}!  Only {{quantityRemaining}} more {{incrementName}} to go!  \r\nCheck the app page to see your progress.';
export const incrementEarnedMessage : string =
    '{{userMention}} earned one more {{incrementName}} towards a {{awardName}}, keep up the good work.';
export const oneIncrementRemainingMessage : string =
    'There is only one {{increment}} remaining until {{userMention}} earns a {{awardName}}!  \r\nKeep an eye on the leaderboard to see how things are progressing.';
export const awardEarnedMessage : string =
    '{{awardIcon}}{{awardIcon}}Congratulations {{userMention}}, you earned a {{awardName}}!{{awardIcon}}{{awardIcon}} \r\nYou can redeem your award from the Scavenger Hunt tab.';

export const awardRedeemedMessage : string = 'Congratulations on collecting all of the increments needed, enjoy your reward!';

export const defaultAwardSuggestions : AwardEntry[] = [
    {
        id: 'award-three',
        name: 'Breakfast Treats',
        description: 'Start your day off right with a breakfast treat!',
        incrementName: 'donut(s)',
        quantityRequired: 5,
        outstandingAwards: 0,
        enabled: true,
        icon: ':doughnut:'
    },
    {
        id: 'award-two',
        name: 'Caffeine Boost',
        description: 'Grab a coffee or energy drink to keep you going, our gift to you!',
        incrementName: 'bean(s)',
        quantityRequired: 5,
        outstandingAwards: 0,
        enabled: true,
        icon: ':coffee:'
    },
    {
        id: 'award-one',
        name: 'Team Pizza Party',
        description: "A pizza party for the whole team!  We'll even throw in some extra slices for the next day!",
        incrementName: 'slice(s)',
        quantityRequired: 10,
        outstandingAwards: 0,
        enabled: true,
        icon: ':pizza:'
    }
];
