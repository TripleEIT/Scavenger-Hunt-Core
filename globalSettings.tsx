import ForgeUI, { render, AdminPage, Fragment, GlobalSettings, useState, Button, useProductContext, Tabs, Tab, Text } from '@forge/ui';
import { getConfigurationSettings, setConfigurationSettings, SharedConfiguration } from './storage/configurationData';
import { RewardOptionsTable } from './ui/configuration/RewardOptionsTable';
import { JiraOptions } from './ui/configuration/JiraOptions';
import { ConfluenceOptions } from './ui/configuration/ConfluenceOptions';
import { getStandardContext } from './utils';
import { RedemptionTable } from './ui/configuration/RedemptionTable';
import { AdvancedConfiguration } from './ui/configuration/AdvancedConfiguration';

const SharedSettings = () => {
    const context = getStandardContext(useProductContext(), 'user');

    if (context.isLicensed === false) {
        console.error('License not found', useProductContext());
        return (
            <Fragment>
                <Text>Please confirm you have a valid license for Scavenger Hunt</Text>
            </Fragment>
        );
    }

    const [currentConfig, setCurrentConfig] = useState(async () => getConfigurationSettings(context));
    

    const saveSettings = async (newConfig: SharedConfiguration) => {
        console.debug('saving a new config via the settings page');
        newConfig.rewards = [...newConfig.rewards].sort((a, b) => {
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
        console.debug('saved a new config via the settings page',newConfig);
        setCurrentConfig(newConfig);
    };

    return (
        <Fragment>
            <Tabs>
                <Tab label="Reward Configuration">
                    <RewardOptionsTable currentConfig={currentConfig} setCurrentConfig={saveSettings} context={context} />
                </Tab>
                {context.product === 'jira' && (
                    <Tab label="Jira Activities">
                        <JiraOptions currentConfig={currentConfig} setCurrentConfig={saveSettings} context={context} />
                    </Tab>
                )}
                {context.product === 'confluence' && (
                    <Tab label="Confluence Activities">
                        <ConfluenceOptions currentConfig={currentConfig} setCurrentConfig={saveSettings} context={context} />
                    </Tab>
                )}
                <Tab label="Redemption">
                    <RedemptionTable currentConfig={currentConfig} setCurrentConfig={saveSettings} />
                </Tab>
                <Tab label="Advanced">
                    <AdvancedConfiguration currentConfig={currentConfig} setCurrentConfig={saveSettings} context={context} />
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
