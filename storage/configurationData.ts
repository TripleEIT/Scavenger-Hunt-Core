import { StandardContext } from 'src/utils';
import { defaultSharedConfiguration } from '../defaults/initialConfiguration';
import { RewardEntry } from './rewardData';
import { deleteDistributedData, getDistributedData, setDistributedData } from './distributedStorage';
import { getUserRecord } from './userData';

const configurationSettingsKey = 'configurationSettings';
let configurationSettings = null;

export interface JiraConfiguration {
    issueCreated: boolean;
    issueUpdated: boolean;
    issueCommented: boolean;
    issueCreatedProbability: number;
    issueUpdatedProbability: number;
    issueCommentedProbability: number;
}

export interface ConfluenceConfiguration {
    pageCreated: boolean;
    pageUpdated: boolean;
    pageLiked: boolean;
    blogCreated: boolean;
    blogUpdated: boolean;
    blogLiked: boolean;
    commentCreated: boolean;
    pageCreatedProbability: number;
    pageUpdatedProbability: number;
    pageLikedProbability: number;
    blogCreatedProbability: number;
    blogUpdatedProbability: number;
    blogLikedProbability: number;
    commentCreatedProbability: number;
}

export interface SharedConfiguration {
    rewards: RewardEntry[];
    jiraOptions: JiraConfiguration;
    confluenceOptions: ConfluenceConfiguration;
    activeUsers: string[];
    redemptions: string[];
}

export const getConfigurationSettings = async (context: StandardContext) => {
    try {
        if (configurationSettings) {
            console.debug('Using cached configuration settings');
            return configurationSettings as SharedConfiguration;
        }

        let settings = await getDistributedData(configurationSettingsKey, context.product);
        if (!settings) {
            console.warn('Using default configuration settings');
            settings = defaultSharedConfiguration;
        }

        console.debug('Fetched Configuration settings', settings);

        // If a user that has not previously registered requests the configuration, register them
        const activeUser = settings.activeUsers.find((user) => user?.accountId == context.accountId);
        if (!activeUser && context.caller == 'user') {
            console.debug('Adding user to active users', context.accountId);
            settings.activeUsers.push(await getUserRecord(context.accountId, context));
            await setConfigurationSettings(settings, context);
        }

        configurationSettings = settings;
        return settings as SharedConfiguration;
    } catch (error) {
        console.error('Error getting configuration settings', error);
    }
};

export const setConfigurationSettings = async (settings: SharedConfiguration, context: StandardContext) => {
    try {
        configurationSettings = settings;
        console.debug('Saving Configuration settings', settings);
        await setDistributedData(configurationSettingsKey, settings, context.product);
    } catch (error) {
        console.error('Error saving configuration settings', error);
    }
};

export const deleteConfigurationSettings = async (context: StandardContext) => {
    try {
        configurationSettings = null;
        await deleteDistributedData(configurationSettingsKey, context.product);
        console.debug('Configuration settings deleted');
    } catch (error) {
        console.error('Error deleting configuration settings', error);
    }
};
