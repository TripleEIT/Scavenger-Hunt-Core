import { defaultSharedConfiguration } from '../defaults/initialConfiguration.js';
import { deleteDistributedData, getDistributedData, setDistributedData } from './distributedStorage.js';
import { getUserRecord } from './userData.js';

const configurationSettingsKey = 'configurationSettings';
let configurationSettings = null;

export const getConfigurationSettings = async (context) => {
    try {
        if (configurationSettings) {
            console.debug('Using cached configuration settings');
            return configurationSettings;
        }

        let settings = await getDistributedData(configurationSettingsKey, context.product);
        if (!settings) {
            console.warn('Using default configuration settings');
            settings = defaultSharedConfiguration;
        }

        console.debug('Fetched Configuration settings');

        // If a user that has not previously registered requests the configuration, register them
        const activeUser = settings.activeUsers.find((user) => user?.accountId == context.accountId);
        if (!activeUser && context.caller == 'user') {
            settings.activeUsers.push(await getUserRecord(context.accountId, context));
            await setConfigurationSettings(settings, context);
        }

        configurationSettings = settings;
        return settings;
    } catch (error) {
        console.error('Error getting configuration settings', error);
    }
};

export const setConfigurationSettings = async (settings, context) => {
    try {
        configurationSettings = settings;
        const saveResult = await setDistributedData(configurationSettingsKey, settings, context.product);
        if (saveResult.successful == false) {
            console.error('Error saving configuration settings', saveResult);
        }
    } catch (error) {
        console.error('Error saving configuration settings', error);
    }
};

export const deleteConfigurationSettings = async (context) => {
    try {
        configurationSettings = null;
        await deleteDistributedData(configurationSettingsKey, context.product);
        console.debug('Configuration settings deleted');
    } catch (error) {
        console.error('Error deleting configuration settings', error);
    }
};

