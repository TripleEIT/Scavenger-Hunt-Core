import { defaultAwardSuggestions } from "./awardSuggestions";


export const defaultJiraConfiguration = {
    issueCreated: true,
    issueUpdated: true,
    issueCommented: true,
    issueCreatedProbability: 8,
    issueUpdatedProbability: 5,
    issueCommentedProbability: 8
  };

export const defaultConfluenceConfiguration = {
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
    awards: defaultAwardSuggestions,
    jiraOptions: defaultJiraConfiguration,
    confluenceOptions: defaultConfluenceConfiguration,
    activeUsers: [],
    redemptions: [],
};
