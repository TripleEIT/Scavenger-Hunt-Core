// This file holds the endpoints to help allow a consistent storage across products

import { getKnownEndpoints } from './storage/endpointManager';
import { storage } from '@forge/api';
import { getStandardContext, StandardContext } from './utils';

// this simple key is used to put a basic tamper seal on the storage calls
// it must be used whenever calling the webhooks
export const storageKey = 'unique-storage-key';
export const storeReceivedData = async (request, context) => {
    const endpointRequest = getEndpointRequest(request, context, 'storeReceivedData');
    if (!endpointRequest) {
        return null;
    }

    try {
        const { key, value } = endpointRequest.body;
        if (!key || !value) {
            console.error('Invalid request body, storeReceivedData failed');
            return null;
        }

        await storage.set(key, value);
        return buildResponse({ success: true });
    } catch (error) {
        console.error('Error storing data:', error);
        return buildResponse({ success: false }, 500);
    }
};

export const fetchStoredData = async (request, context: StandardContext) => {
    const standardContext = getStandardContext(context, 'webhook');
    const endpointRequest = getEndpointRequest(request, standardContext, 'fetchStoredData');
    if (!endpointRequest) {
        return null;
    }

    try {
        const { key } = endpointRequest.body;
        if (!key) {
            console.error('Invalid request body, fetchStoredData failed');
            return null;
        }

        const value = await storage.get(key);
        return buildResponse({
            success: true,
            empty: value == null,
            value: value
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return buildResponse({ success: false }, 500);
    }
};

export const deleteStoredData = async (request, context) => {
    const standardContext = getStandardContext(context, 'webhook');
    const endpointRequest = getEndpointRequest(request, standardContext, 'deleteStoredData');
    if (!endpointRequest) {
        return null;
    }

    try {
        const { key } = endpointRequest.body;
        if (!key) {
            console.error('Invalid request body, deleteStoredData failed');
            return null;
        }

        await storage.delete(key);
        return buildResponse({ success: true });
    } catch (error) {
        console.error('Error deleting data:', error);
        return buildResponse({ success: false }, 500);
    }
};

export const fetchKnownEndpoints = async (request, context) => {
    const standardContext = getStandardContext(context, 'webhook');
    const endpointRequest = getEndpointRequest(request, standardContext, 'fetchKnownEndpoints');
    if (!endpointRequest) {
        return null;
    }

    const knownEndpoints = await getKnownEndpoints(endpointRequest.product);
    console.debug('found knownEndpoints', knownEndpoints);
    return buildResponse(knownEndpoints);
};

const buildResponse = (body, statusCode = 200) => {
    return {
        body: JSON.stringify(body),
        headers: {
            'Content-Type': ['application/json']
        },
        statusCode: statusCode
    };
};

const getEndpointRequest = (request, context: StandardContext, name) => {
    // Bail if things don't look right
    if (!isValidRequest(request)) {
        console.error(`Invalid ${name} request, look at the logs for more details`);
        return null;
    }

    const body = getRequestBody(request);
    const product = context.product;
    if (!body || !product) {
        console.error(`Invalid request body or product, ${name} failed`);
        return null;
    }

    const endpointRequest = {
        product: product as 'jira' | 'confluence',
        body: body
    };

    console.debug(`${name} request received`);
    return endpointRequest;
};

const isValidRequest = (request) => {
    if (request.method !== 'POST') {
        console.error('Invalid request method:', request.method);
        return false;
    } else if (Array.isArray(request.headers['content-type'][0]) && request.headers['content-type'][0].toString() !== 'application/json') {
        console.error('Invalid content type:', request.headers['content-type']);
        return false;
    } else if (!request.body) {
        console.error('No request body');
        return false;
    } else {
        return Array.isArray(request.headers['x-storage-key']) && request.headers['x-storage-key'][0] === storageKey;
    }
};

const getRequestBody = (request) => {
    try {
        return JSON.parse(request.body);
    } catch (error) {
        console.error('Error parsing request body:', error);
        return null;
    }
};
