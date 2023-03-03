import { RewardEntry } from 'src/storage/rewardData';
import { ConfluenceConfiguration, JiraConfiguration } from 'src/storage/configurationData';
import { defaultRewardSuggestions } from './rewardSuggestions';

export const defaultJiraConfiguration: JiraConfiguration = {
    issueCreated: true,
    issueUpdated: true,
    issueCommented: true,
    issueCreatedProbability: 8,
    issueUpdatedProbability: 5,
    issueCommentedProbability: 8
};

export const defaultConfluenceConfiguration: ConfluenceConfiguration = {
    pageCreated: true,
    pageUpdated: true,
    pageLiked: true,
    blogCreated: true,
    blogUpdated: true,
    blogLiked: true,
    commentCreated: true,
    pageCreatedProbability: 22,
    pageUpdatedProbability: 10,
    pageLikedProbability: 5,
    blogCreatedProbability: 22,
    blogUpdatedProbability: 10,
    blogLikedProbability: 5,
    commentCreatedProbability: 12
};

export const defaultSharedConfiguration = {
    rewards: defaultRewardSuggestions,
    jiraOptions: defaultJiraConfiguration,
    confluenceOptions: defaultConfluenceConfiguration,
    activeUsers: [],
    redemptions: []
};
