import { webTrigger } from '@forge/api';
import { getConfluenceUserProperty, getJiraUserProperty, setConfluenceUserProperty, setJiraUserProperty } from './userData';

const jiraStorageKeyName = 'jiraStorageEndpoints';
const confluenceStorageKeyName = 'confluenceStorageEndpoints';

export const getKnownEndpoints = async (currentProduct: 'jira' | 'confluence') => {
    const jiraUserEndpointPromise = getJiraUserProperty(jiraStorageKeyName);
    const confluenceUserEndpointPromise = getConfluenceUserProperty(confluenceStorageKeyName);

    let jiraUserEndpoints = await jiraUserEndpointPromise;
    let confluenceUserEndpoints = await confluenceUserEndpointPromise;

    if (confluenceUserEndpoints == null && currentProduct === 'confluence') {
        console.info('Confluence user endpoints are null, but we are in confluence, generating and returning endpoints');
        confluenceUserEndpoints = await generateEndpoints();
        await setConfluenceUserProperty(confluenceStorageKeyName, confluenceUserEndpoints);
    }

    if (jiraUserEndpoints == null && currentProduct === 'jira') {
        console.info('Jira user endpoints are null, but we are in jira, generating and returning endpoints');
        jiraUserEndpoints = await generateEndpoints();
        await setJiraUserProperty(jiraStorageKeyName, jiraUserEndpoints);
    }
    
    const knownEndpoints = {
        jira: jiraUserEndpoints,
        confluence: confluenceUserEndpoints
    };
    return knownEndpoints;
};

export const generateEndpoints = async () => {
    const storeDataEndpointPromise = webTrigger.getUrl('scavenger-hunt-store-data');
    const fetchDataEndpointPromise = webTrigger.getUrl('scavenger-hunt-fetch-data');
    const deleteDataEndpointPromise = webTrigger.getUrl('scavenger-hunt-delete-data');

    return {
        storeData: await storeDataEndpointPromise,
        fetchData: await fetchDataEndpointPromise,
        deleteData: await deleteDataEndpointPromise
    };
};

export const getNonSelfStorageEndpoint = async (currentProduct) => {
    const knownEndpoints = await getKnownEndpoints(currentProduct);

    // return the endpoints that don't match the current product
    if (currentProduct === 'jira') {
        return knownEndpoints.confluence;
    } else {
        return knownEndpoints.jira;
    }
};
