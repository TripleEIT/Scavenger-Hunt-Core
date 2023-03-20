import { fetch, storage, webTrigger } from '@forge/api';
import { storageKey } from '../storageWebtrigger';
import { setDistributedData } from './distributedStorage';

let storageKnownEndpoints: KnownEndpoints = null;

export interface KnownEndpoints {
    jiraFetchUrl: string;
    confluenceFetchUrl: string;
    jira: StorageEndpoints;
    confluence: StorageEndpoints;
}

export interface StorageEndpoints {
    storeData: string;
    fetchData: string;
    deleteData: string;
}

const endpointStorageKey = 'knownEndpoints';

export const createOrUpdateRemoteEndpoints = async (currentProduct: 'jira' | 'confluence', remoteEndpointFetchUrl) => {
    console.debug('Creating or updating remote endpoints');
    storageKnownEndpoints = {
        jiraFetchUrl: null,
        confluenceFetchUrl: null,
        jira: null,
        confluence: null
    };

    const localEndpointPromise = generateEndpoints();
    const remoteEndpointPromise = getRemoteEndpoints(remoteEndpointFetchUrl);
    const localEndPointUrlPromise = webTrigger.getUrl('scavenger-hunt-fetch-endpoints');

    // Removed the null check as we will update each run
    if (currentProduct === 'confluence') {
        console.info('Confluence user endpoints are null, but we are in confluence, generating and returning endpoints');
        storageKnownEndpoints.confluence = await localEndpointPromise;
        storageKnownEndpoints.jira = await remoteEndpointPromise;
        storageKnownEndpoints.confluenceFetchUrl = await localEndPointUrlPromise;
        storageKnownEndpoints.jiraFetchUrl = remoteEndpointFetchUrl;
    }

    if (currentProduct === 'jira') {
        console.info('Jira user endpoints are null, but we are in jira, generating and returning endpoints');
        storageKnownEndpoints.jira = await localEndpointPromise;
        storageKnownEndpoints.confluence = await remoteEndpointPromise;
        storageKnownEndpoints.jiraFetchUrl = await localEndPointUrlPromise;
        storageKnownEndpoints.confluenceFetchUrl = remoteEndpointFetchUrl;
    }

    await setDistributedData(endpointStorageKey, storageKnownEndpoints, currentProduct);
    console.debug('Updated known endpoints', storageKnownEndpoints);
    return storageKnownEndpoints;
};

const getRemoteEndpoints = async (remoteEndpointFetchUrl) => {
    const storageRequest = {
        method: 'POST',
        body: JSON.stringify({"empty": "true"}),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-storage-key': storageKey
        }
    };

    const storageResponse = await fetch(remoteEndpointFetchUrl, storageRequest);
    return (await storageResponse.json()) as StorageEndpoints;
};

export const getKnownEndpoints = async (currentProduct: 'jira' | 'confluence') => {
    let storageUpdates: boolean = false;
    if (storageKnownEndpoints != null) {
        console.log('Using cached known endpoints');
        return storageKnownEndpoints;
    }

    storageKnownEndpoints = (await storage.get(endpointStorageKey)) as KnownEndpoints;

    if (storageKnownEndpoints == null) {
        storageUpdates = true;
        console.debug('No known endpoints found, creating new ones');
        storageKnownEndpoints = {
            jiraFetchUrl: null,
            confluenceFetchUrl: null,
            jira: null,
            confluence: null
        };
    }

    // These should only be needed on the first run.
    if (storageKnownEndpoints.confluenceFetchUrl == null && currentProduct === 'confluence') {
        storageUpdates = true;
        console.info('Confluence fetch url is null, but we are in confluence, generating and returning endpoints');
        const endpointPromise = generateEndpoints();
        storageKnownEndpoints.confluenceFetchUrl = await webTrigger.getUrl('scavenger-hunt-fetch-endpoints');
        storageKnownEndpoints.confluence = await endpointPromise;
    }

    if (storageKnownEndpoints.jiraFetchUrl == null && currentProduct === 'jira') {
        storageUpdates = true;
        console.info('Jira fetch url is null, but we are in jira, generating and returning endpoints');
        const endpointPromise = generateEndpoints();
        storageKnownEndpoints.jiraFetchUrl = await webTrigger.getUrl('scavenger-hunt-fetch-endpoints');
        storageKnownEndpoints.jira = await endpointPromise;
    }

    if (storageUpdates) {
        await storage.set(endpointStorageKey, storageKnownEndpoints);
    }

    return storageKnownEndpoints;
};

export const generateEndpoints = async () => {
    const storeDataEndpointPromise = webTrigger.getUrl('scavenger-hunt-store-data');
    const fetchDataEndpointPromise = webTrigger.getUrl('scavenger-hunt-fetch-data');
    const deleteDataEndpointPromise = webTrigger.getUrl('scavenger-hunt-delete-data');

    return {
        storeData: await storeDataEndpointPromise,
        fetchData: await fetchDataEndpointPromise,
        deleteData: await deleteDataEndpointPromise
    } as StorageEndpoints;
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
