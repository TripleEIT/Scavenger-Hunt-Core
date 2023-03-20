import { storage } from '@forge/api';
import ForgeUI, { Button, Em, Form, Fragment, Heading, Strong, Text, TextField, useState } from '@forge/ui';
import { defaultSharedConfiguration } from '../../defaults/initialConfiguration';
import { SharedConfiguration } from '../../storage/configurationData';
import { deleteDistributedData } from '../../storage/distributedStorage';
import { createOrUpdateRemoteEndpoints, getKnownEndpoints, KnownEndpoints } from '../../storage/endpointManager';
import { StandardContext } from '../../utils';
import { ConfirmationButton } from '../ConfirmationButton';

export const AdvancedConfiguration = (props) => {
    const currentConfig: SharedConfiguration = props.currentConfig;
    const context: StandardContext = props.context;
    const setCurrentConfig = props.setCurrentConfig;

    const [storageEndpoints, setStorageEndpoints] = useState<KnownEndpoints>(async () => await getKnownEndpoints(context.product));

    const saveAdvancedSettings = async (formData) => {
        console.debug('saving advanced settings');
        const newStorageEndpoints = await createOrUpdateRemoteEndpoints(context.product, formData.remoteEndpoint);
        await setStorageEndpoints(newStorageEndpoints);
    };

    const resetSettings = async () => {
        console.debug('resetting settings');
        let storageEntries = await storage.query().limit(10).getMany();
        while (storageEntries.results.length > 1) {
            for (let i = 0; i < storageEntries.results.length; i++) {
                // this entry gets auto-created and generates a loop, so we manually delete it
                if (storageEntries.results[i].key !== 'knownEndpoints') {
                    console.debug(`deleting ${storageEntries.results[i].key}`);
                    await deleteDistributedData(storageEntries.results[i].key, context.product);
                }
            }
            storageEntries = await storage.query().limit(18).getMany();
        }
        await deleteDistributedData('knownEndpoints', context.product);
        setCurrentConfig(defaultSharedConfiguration);
    };

    return (
        <Fragment>
            <Text> </Text>
            <Form
                onSubmit={saveAdvancedSettings}
                submitButtonAppearance="primary"
                submitButtonText={context.product === 'jira' ? 'Set Confluence Endpoint' : 'Set Jira Endpoint'}
            >
                {context.product === 'jira' && (
                    <Fragment>
                        <Heading size="medium">{'Jira <-> Confluence Connection'}</Heading>
                        <Text>
                            The below endpoint is secure and unique to your installation, paste this in the Jira App's administration and
                            save the endpoint to share scores and configuration.
                        </Text>
                        <Heading size="small">Jira Endpoint</Heading>
                        <Text>
                            <Em>{storageEndpoints.jiraFetchUrl}</Em>
                        </Text>
                        <TextField name="remoteEndpoint" label="Confluence Endpoint" defaultValue={storageEndpoints.confluenceFetchUrl} />
                    </Fragment>
                )}
                {context.product === 'confluence' && (
                    <Fragment>
                        <Heading size="medium">{'Confluence <-> Jira Connection'}</Heading>
                        <Text>
                            The below endpoint is secure and unique to your installation, paste this in the Jira App's administration and
                            save the endpoint to share scores and configuration.
                        </Text>
                        <Heading size="small">Confluence Endpoint</Heading>
                        <Text>
                            <Em>{storageEndpoints.confluenceFetchUrl}</Em>
                        </Text>
                        <TextField name="remoteEndpoint" label="Jira Endpoint" defaultValue={storageEndpoints.jiraFetchUrl} />
                    </Fragment>
                )}
            </Form>
            <Text> </Text>
            <Text> </Text>
            <Heading size="medium">Reset Scavenger Hunt configuration to default</Heading>
            <ConfirmationButton text="Reset Configuration" onClick={resetSettings} appearance="danger" />
        </Fragment>
    );
};
