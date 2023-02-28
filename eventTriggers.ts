import { doesEventTriggerAward } from './engine/awardProbability';
import { grantUserConfluenceAward, grantUserJiraAward } from './engine/awardEngine';
import { getConfigurationSettings } from './storage/configurationData';
import { getStandardContext, getStandardEvent } from './utils';
import { getConfluenceAppUser, getJiraAppUser } from './storage/userData';

export interface JiraEvent {
    eventType: string;
    accountId: string;
    eventName: string;
    eventDisplayName: string;
    issue: {
        id: string;
        key: string;
        summary: string;
    };
}

export interface ConfluenceEvent {
    eventType: string;
    accountId: string;
    eventName: string;
    eventDisplayName: string;
    content: {
        id: string;
        title: string;
        type: string;
        space: {
            id: string;
            key: string;
        };
    };
}

export async function processJiraEvent(event, context) {
    const standardContext = getStandardContext(context, 'event');
    if (standardContext.isLicensed === false) {
        console.error('License is not active. Ignoring event.', context);
    }

    const jiraAppUser = await getJiraAppUser();
    const jiraEvent = getJiraEvent(event);
    console.debug('Jira app user:', jiraAppUser);
    console.debug('Jira event:', jiraEvent);
    if (jiraAppUser.accountId === jiraEvent.accountId) {
        console.debug('Ignoring event triggered by app user');
        return;
    }

    const configurationSettings = await getConfigurationSettings(context);
    const standardEvent = await getStandardEvent(jiraEvent, standardContext, 'eventTrigger');
    const receivesAward = doesEventTriggerAward(standardEvent, configurationSettings);
    if (receivesAward) {
        await grantUserJiraAward(standardEvent, configurationSettings);
    }
}

export async function processConfluenceEvent(event, context) {
    const standardContext = getStandardContext(context, 'event');
    if (standardContext.isLicensed === false) {
        console.error('License is not active. Ignoring event.', context);
    }

    const confluenceAppUser = await getConfluenceAppUser();
    const confluenceEvent = getConfluenceEvent(event);

    if (confluenceAppUser.accountId === confluenceEvent.accountId) {
        console.debug('Ignoring event triggered by app user');
        return;
    }

    const configurationSettings = await getConfigurationSettings(context);
    const standardEvent = await getStandardEvent(confluenceEvent, standardContext, 'eventTrigger');
    const receivesAward = doesEventTriggerAward(standardEvent, configurationSettings);

    if (receivesAward) {
        await grantUserConfluenceAward(standardEvent, configurationSettings);
    }
}

const getJiraEvent = (event) => {
    let jiraEvent = {
        eventType: event.eventType as string,
        accountId: event.atlassianId as string,
        eventName: '',
        eventDisplayName: '',
        issue: {
            id: event.issue.id as string,
            key: event.issue.key as string,
            summary: event.issue.fields.summary as string
        }
    };

    switch (event.eventType) {
        case 'avi:jira:viewed:issue':
            jiraEvent.eventName = 'jiraIssueViewed';
            jiraEvent.eventDisplayName = 'Jira issue viewed';
            break;
        case 'avi:jira:created:issue':
            jiraEvent.eventName = 'jiraIssueCreated';
            jiraEvent.eventDisplayName = 'Jira issue created';
            break;
        case 'avi:jira:updated:issue':
            jiraEvent.eventName = 'jiraIssueUpdated';
            jiraEvent.eventDisplayName = 'Jira issue updated';
            break;
        case 'avi:jira:commented:issue':
            jiraEvent.eventName = 'jiraIssueCommented';
            jiraEvent.eventDisplayName = 'Jira issue commented';
            break;
        default:
            console.error('Unknown event type received (Jira): ', event.eventType);
    }

    return jiraEvent as JiraEvent;
};

const getConfluenceEvent = (event) => {
    let confluenceEvent = {
        eventType: event.eventType as string,
        accountId: event.atlassianId as string,
        eventName: '',
        eventDisplayName: '',
        content: {
            type: event.content.type as string,
            id: event.content.id as string,
            title: event.content.title as string,
            space: {
                id: event.content.space.id as string,
                key: event.content.space.key as string
            }
        }
    };

    switch (event.eventType) {
        case 'avi:confluence:created:page':
            confluenceEvent.eventName = 'confluencePageCreated';
            confluenceEvent.eventDisplayName = 'Confluence page created';
            break;
        case 'avi:confluence:updated:page':
            confluenceEvent.eventName = 'confluencePageUpdated';
            confluenceEvent.eventDisplayName = 'Confluence page updated';
            break;
        case 'avi:confluence:liked:page':
            confluenceEvent.eventName = 'confluencePageLiked';
            confluenceEvent.eventDisplayName = 'Confluence page liked';
            break;
        case 'avi:confluence:created:blogpost':
            confluenceEvent.eventName = 'confluenceBlogCreated';
            confluenceEvent.eventDisplayName = 'Confluence blogpost created';
            break;
        case 'avi:confluence:updated:blogpost':
            confluenceEvent.eventName = 'confluenceBlogUpdated';
            confluenceEvent.eventDisplayName = 'Confluence blogpost updated';
            break;
        case 'avi:confluence:liked:blogpost':
            confluenceEvent.eventName = 'confluenceBlogLiked';
            confluenceEvent.eventDisplayName = 'Confluence blogpost liked';
            break;
        case 'avi:confluence:created:comment':
            confluenceEvent.eventName = 'confluenceCommentCreated';
            confluenceEvent.eventDisplayName = 'Confluence comment created';
            confluenceEvent.content = {
                type: event.content.type,
                id: event.content.container.id,
                title: event.content.container.title,
                space: {
                    id: event.content.space.id,
                    key: event.content.space.key
                }
            };
            break;
        case 'avi:confluence:viewed:page':
            confluenceEvent.eventName = 'confluencePageViewed';
            confluenceEvent.eventDisplayName = 'Confluence page viewed';
            break;
        default:
            console.error('Unknown event type received (Confluence): ', event.eventType);
    }

    return confluenceEvent as ConfluenceEvent;
};
