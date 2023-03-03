import { applyUserEligibility } from '../storage/userData';

export const doesEventTriggerReward = (standardEvent, configuration) => {
    let eligibility = { eligible: false, probability: 0 };
    let rewardTriggered = false;
    switch (standardEvent.product) {
        case 'jira':
            eligibility = jiraEventRewardEligibility(standardEvent, configuration);
            eligibility = applyUserEligibility(eligibility, standardEvent.userRecord);
            rewardTriggered = calculateProbability(eligibility);
            console.debug(
                `Jira event: ${standardEvent.eventName} eligible: ${eligibility.eligible} probability: ${eligibility.probability} triggered: ${rewardTriggered}`
            );
            return rewardTriggered;
        case 'confluence':
            eligibility = confluenceRewardEligibility(standardEvent, configuration);
            eligibility = applyUserEligibility(eligibility, standardEvent.userRecord);
            rewardTriggered = calculateProbability(eligibility);
            console.debug(
                `Confluence event: ${standardEvent.eventName} eligible: ${eligibility.eligible} probability: ${eligibility.probability} triggered: ${rewardTriggered}`
            );
            return rewardTriggered;
        default:
            console.error('No product found for event: ' + standardEvent.product);
            return false;
    }
};

const jiraEventRewardEligibility = (standardEvent, configuration) => {
    switch (standardEvent.eventName) {
        case 'jiraIssueViewed':
            // views are for testing only, this trigger will not be shipped with the product
            return {
                eligible: configuration?.jiraOptions?.issueViewed ?? true,
                probability: configuration?.jiraOptions?.issueViewedProbability ?? 900
            };
        case 'jiraIssueCreated':
            return {
                eligible: configuration?.jiraOptions?.issueCreated ?? false,
                probability: configuration?.jiraOptions?.issueCreatedProbability ?? 0
            };
        case 'jiraIssueUpdated':
            return {
                eligible: configuration?.jiraOptions?.issueUpdated ?? false,
                probability: configuration?.jiraOptions?.issueUpdatedProbability ?? 0
            };
        case 'jiraIssueCommented':
            return {
                eligible: configuration?.jiraOptions?.issueCommented ?? false,
                probability: configuration?.jiraOptions?.issueCommentedProbability ?? 0
            };
        default:
            return { eligible: false, probability: 0 };
    }
};

const confluenceRewardEligibility = (standardEvent, configuration) => {
    switch (standardEvent.eventName) {
        case 'confluencePageViewed':
            // views are for testing only, this trigger will not be shipped with the product
            return {
                eligible: configuration?.confluenceOptions?.pageViewed ?? true,
                probability: configuration?.confluenceOptions?.pageViewedProbability ?? 500
            };
        case 'confluencePageCreated':
            return {
                eligible: configuration?.confluenceOptions?.pageCreated ?? false,
                probability: configuration?.confluenceOptions?.pageCreatedProbability ?? 0
            };
        case 'confluencePageUpdated':
            return {
                eligible: configuration?.confluenceOptions?.pageUpdated ?? false,
                probability: configuration?.confluenceOptions?.pageUpdatedProbability ?? 0
            };
        case 'confluencePageLiked':
            return {
                eligible: configuration?.confluenceOptions?.pageLiked ?? false,
                probability: configuration?.confluenceOptions?.pageLikedProbability ?? 0
            };
        case 'confluenceBlogCreated':
            return {
                eligible: configuration?.confluenceOptions?.blogCreated ?? false,
                probability: configuration?.confluenceOptions?.blogCreatedProbability ?? 0
            };
        case 'confluenceBlogUpdated':
            return {
                eligible: configuration?.confluenceOptions?.blogUpdated ?? false,
                probability: configuration?.confluenceOptions?.blogUpdatedProbability ?? 0
            };
        case 'confluenceBlogLiked':
            return {
                eligible: configuration?.confluenceOptions?.blogLiked ?? false,
                probability: configuration?.confluenceOptions?.blogLikedProbability ?? 0
            };
        case 'confluenceCommentCreated':
            return {
                eligible: configuration?.confluenceOptions?.commentCreated ?? false,
                probability: configuration?.confluenceOptions?.commentCreatedProbability ?? 0
            };
        default:
            return { eligible: false, probability: 0 };
    }
};

// Reward probability is a random number between 0 and 100, if the number is less than the probability, the reward is triggered
// this matches the description in the UI of per-100 users
const calculateProbability = (eligibility) => {
    if (eligibility.eligible) {
        return Math.floor(Math.random() * 100) < eligibility.probability;
    }
    return false;
};

// Distribution needs to be even for rewards with much higher availability counts.
export const determineReward = (eligibleRewards) => {
    const rewardOptions = [];
    eligibleRewards.forEach((reward) => {
        for (let i = 0; i < reward.outstandingRewards; i++) {
            rewardOptions.push(reward.id);
        }
    });

    if (rewardOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * rewardOptions.length);
        const winningRewardId = rewardOptions[randomIndex];
        return eligibleRewards.find((reward) => reward.id === winningRewardId);
    } else {
        return null;
    }
};
