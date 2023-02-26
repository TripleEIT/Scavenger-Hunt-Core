import { getActiveProductAwards, recordAwardedIncrementWon } from '../storage/awardData.js';
import { awardUserAwardIncrement } from '../storage/userData.js';
import { determineAward } from './awardProbability.js';
import { commentOnIssue, commentOnConfluenceContent } from './messages.js';

export const grantUserJiraAward = async (standardEvent, configuration) => {
    const context = standardEvent.context;
    const jiraAwards = await getActiveProductAwards('jira', context, configuration);
    console.debug('Jira awards: ', jiraAwards);
    const awardWon = determineAward(jiraAwards);

    if (!awardWon) {
        console.warn('There are no awards left to be won, but things are enabled');
        return;
    }

    const updatedUser = await awardUserAwardIncrement(standardEvent, awardWon, context);
    await recordAwardedIncrementWon(standardEvent, awardWon, context, configuration, updatedUser);

    await commentOnIssue(standardEvent, awardWon, context);
};

export const grantUserConfluenceAward = async (standardEvent, configuration) => {
    const context = standardEvent.context;
    const confluenceAwards = await getActiveProductAwards('confluence', context, configuration);
    console.debug('Confluence awards: ', confluenceAwards);
    const awardWon = determineAward(confluenceAwards);

    if (!awardWon) {
        console.warn('There are no awards left to be won, but things are enabled');
        return;
    }

    const updatedUser = await awardUserAwardIncrement(standardEvent, awardWon, context);
    await recordAwardedIncrementWon(standardEvent, awardWon, context, configuration, updatedUser);

    await commentOnConfluenceContent(standardEvent, awardWon, context);
};
