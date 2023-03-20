import { getNonSelfStorageEndpoint, StorageEndpoints } from './endpointManager';
import { fetch, storage } from '@forge/api';
import { storageKey } from '../storageWebtrigger';

let nonSelfEndpoint: StorageEndpoints = null;

export const getDistributedData = async (key: string, currentProduct: string) => {
    // check locally first, and then check the distributed storage
    const localData = await storage.get(key);

    if (localData) {
        // potentially a time to update the distributed storage
        return localData;
    }

    if (!nonSelfEndpoint) {
        nonSelfEndpoint = await getNonSelfStorageEndpoint(currentProduct);
    }

    // if we don't have another endpoint, then we can't find the data
    if (nonSelfEndpoint == null) {
        return null;
    }

    const storageRequest = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-storage-key': storageKey
        },
        body: `{ "key" : "${key}" }`
    };

    const storageResponse = await fetch(nonSelfEndpoint.fetchData, storageRequest);
    const storageData = await storageResponse.json();

    if (storageData.empty) {
        return null;
    } else {
        // store the data locally for faster access next time
        await storage.set(key, storageData.value);
        return storageData.value;
    }
};

export const setDistributedData = async (key: string, value: any, currentProduct: string) => {
    // store locally first and get a promise, and then store the distributed storage
    const storagePromise = storage.set(key, value);

    if (!nonSelfEndpoint) {
        nonSelfEndpoint = await getNonSelfStorageEndpoint(currentProduct);
    }

    // if we don't have another endpoint, then we can't store the data
    if (nonSelfEndpoint == null) {
        console.warn('No non-self endpoint found, unable to save remote data');
        await storagePromise;
        return { successful: false };
    }

    const bodyPayload = {
        key: key,
        value: value
    };

    const storageRequest = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-storage-key': storageKey
        },
        body: JSON.stringify(bodyPayload)
    };

    const storageResponse = await fetch(nonSelfEndpoint.storeData, storageRequest);
    await storagePromise;
    return await storageResponse.json();
};

export const deleteDistributedData = async (key: string, currentProduct: string) => {
    // delete locally first and get a promise, and then delete the distributed storage
    const storagePromise = storage.delete(key);

    if (!nonSelfEndpoint) {
        nonSelfEndpoint = await getNonSelfStorageEndpoint(currentProduct);
    }

    // if we don't have another endpoint, then we can't delete the data
    if (nonSelfEndpoint == null) {
        await storagePromise;
        return;
    }

    const bodyPayload = {
        key: key
    };

    const storageRequest = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-storage-key': storageKey
        },
        body: JSON.stringify(bodyPayload)
    };

    const storageResponse = await fetch(nonSelfEndpoint.deleteData, storageRequest);
    await storagePromise;
    return await storageResponse.json();
};
