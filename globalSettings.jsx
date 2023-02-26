import { storage } from '@forge/api';
import ForgeUI, { render, AdminPage, Fragment, GlobalSettings, useState, Button, useProductContext, Tabs, Tab, Text } from '@forge/ui';
import { defaultSharedConfiguration } from './defaults/initialConfiguration.js';
import { getConfigurationSettings, setConfigurationSettings } from './storage/configurationData.js';
import { deleteDistributedData } from './storage/distributedStorage.js';
import { AwardOptionsTable } from './ui/configuration/AwardOptionsTable.js';
import { JiraOptions } from './ui/configuration/JiraOptions.js';
import { ConfluenceOptions } from './ui/configuration/ConfluenceOptions.js';
import { getStandardContext } from './utils.js';
import { RedemptionTable } from './ui/configuration/RedemptionTable.js';

const SharedSettings = () => {
    const context = getStandardContext(useProductContext(), 'user');

    if (context.isLicensed === false) {
        console.error('License not found', useProductContext())
        return (
            <Fragment>
                <Text>Please confirm you have a valid license for Scavenger Hunt</Text>
            </Fragment>
        );
    }
    
    const [currentConfig, setCurrentConfig] = useState(async () => getConfigurationSettings(context));

    const saveSettings = async (newConfig) => {
        console.debug('saving a new config via the settings page');
        newConfig.awards = [...newConfig.awards].sort((a, b) => {
            let fa = a.name.toLowerCase(),
                fb = b.name.toLowerCase();

            if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
        });        
        await setConfigurationSettings(newConfig, context);
        setCurrentConfig(newConfig);
    };

    const resetSettings = async () => {
        console.debug('resetting settings');
        let storageEntries = await storage.query().limit(18).getMany();
        while (storageEntries.results.length > 0) {
            for (i=0; i<storageEntries.results.length; i++) {
                console.debug(`deleting ${storageEntries.results[i].key}`);
                console.warn(await deleteDistributedData(storageEntries.results[i].key, context.product));
            }
            storageEntries = await storage.query().limit(18).getMany();
        }

        setCurrentConfig(defaultSharedConfiguration);
    };

    return (
        <Fragment>
            <Tabs>
                <Tab label='Award Configuration'>
                    <AwardOptionsTable currentConfig={currentConfig} setCurrentConfig={saveSettings} context={context} />
                </Tab>
                <Tab label='Jira Activities'>
                    <JiraOptions currentConfig={currentConfig} setCurrentConfig={saveSettings} context={context} />
                </Tab>
                <Tab label='Confluence Activities'>
                    <ConfluenceOptions currentConfig={currentConfig} setCurrentConfig={saveSettings} context={context} />
                </Tab>
                <Tab label='Redemption'>
                    <RedemptionTable currentConfig={currentConfig} setCurrentConfig={saveSettings} />
                </Tab>
                <Tab label='Advanced'>
                    <Text>{`Delete everything created by this app and stored in ${context.product.toUpperCase()}`}</Text>
                    <Button text='Reset Configuration' onClick={resetSettings} appearance='danger' />
                </Tab>
            </Tabs>
        </Fragment>
    );
};

export const showConfluenceSettings = render(
    <GlobalSettings>
        <SharedSettings />
    </GlobalSettings>
);

export const showJiraSettings = render(
    <AdminPage>
        <SharedSettings />
    </AdminPage>
);

