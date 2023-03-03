import { getActiveProductRewards, recordRewardedIncrementWon } from '../storage/rewardData';
import { rewardUserRewardIncrement } from '../storage/userData';
import { determineReward } from './rewardProbability';
import { commentOnIssue, commentOnConfluenceContent } from './messages';

export const grantUserJiraReward = async (standardEvent, configuration) => {
    const context = standardEvent.context;
    const jiraRewards = await getActiveProductRewards('jira', context, configuration);
    console.debug('Jira rewards: ', jiraRewards);
    const rewardWon = determineReward(jiraRewards);

    if (!rewardWon) {
        console.warn('There are no rewards left to be won, but things are enabled');
        return;
    }

    const updatedUser = await rewardUserRewardIncrement(standardEvent, rewardWon, context);
    await recordRewardedIncrementWon(standardEvent, rewardWon, context, configuration, updatedUser);

    await commentOnIssue(standardEvent, rewardWon, context);
};

export const grantUserConfluenceReward = async (standardEvent, configuration) => {
    const context = standardEvent.context;
    const confluenceRewards = await getActiveProductRewards('confluence', context, configuration);
    console.debug('Confluence rewards: ', confluenceRewards);
    const rewardWon = determineReward(confluenceRewards);

    if (!rewardWon) {
        console.warn('There are no rewards left to be won, but things are enabled');
        return;
    }

    const updatedUser = await rewardUserRewardIncrement(standardEvent, rewardWon, context);
    await recordRewardedIncrementWon(standardEvent, rewardWon, context, configuration, updatedUser);

    await commentOnConfluenceContent(standardEvent, rewardWon, context);
};
