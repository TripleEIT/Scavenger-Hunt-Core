import ForgeUI, { Checkbox, CheckboxGroup, Form, FormCondition, Fragment, Heading, Text, TextField, useState } from '@forge/ui';

export const ConfluenceOptions = (props) => {
    const { currentConfig, setCurrentConfig, context } = props;
    const [ confluenceOptions, setConfluenceOptions ] = useState(currentConfig.confluenceOptions);

    const saveConfluenceOptions = async (formData) => {
        const { rewardSettings } = formData;
        const confluenceOptions = {
            pageCreated: rewardSettings.includes('pageCreated'),
            pageUpdated: rewardSettings.includes('pageUpdated'),
            pageLiked: rewardSettings.includes('pageLiked'),
            blogCreated: rewardSettings.includes('blogCreated'),
            blogUpdated: rewardSettings.includes('blogUpdated'),
            blogLiked: rewardSettings.includes('blogLiked'),
            commentCreated: rewardSettings.includes('commentCreated'),
            pageCreatedProbability: parseInt(formData.pageCreatedProbability),
            pageUpdatedProbability: parseInt(formData.pageUpdatedProbability),
            pageLikedProbability: parseInt(formData.pageLikedProbability),
            blogCreatedProbability: parseInt(formData.blogCreatedProbability),
            blogUpdatedProbability: parseInt(formData.blogUpdatedProbability),
            blogLikedProbability: parseInt(formData.blogLikedProbability),
            commentCreatedProbability: parseInt(formData.commentCreatedProbability)
        };
        await setCurrentConfig({ ...currentConfig, confluenceOptions: confluenceOptions });
        setConfluenceOptions(confluenceOptions);
    };

    return (
        <Fragment>
            <Text>
                Rewards will be distributed randomly while users work within Jira, you can configure which actions qualify for user
                rewards.
            </Text>
            <Form onSubmit={saveConfluenceOptions} submitButtonText='Update Confluence Settings' submitButtonAppearance='primary'>
                <Heading size='small'>Eligible Activities</Heading>
                <Text>
                    For each of the actions below, you can set the probability that a user will be eligible to win an Reward Increment.
                    Reward increments will only be granted if they are available in the pool.
                </Text>
                <CheckboxGroup label='Reward Increments when' name='rewardSettings'>
                    <Checkbox label='A Page is Created' value='pageCreated' defaultChecked={confluenceOptions?.pageCreated ?? true} />
                    <Checkbox label='A Page is Updated' value='pageUpdated' defaultChecked={confluenceOptions?.pageUpdated ?? true} />
                    <Checkbox label='A Page is Liked' value='pageLiked' defaultChecked={confluenceOptions?.pageLiked ?? true} />
                    <Checkbox label='A Blog is Created' value='blogCreated' defaultChecked={confluenceOptions?.blogCreated ?? true} />
                    <Checkbox label='A Blog is Updated' value='blogUpdated' defaultChecked={confluenceOptions?.blogUpdated ?? true} />
                    <Checkbox label='A Blog is Liked' value='blogLiked' defaultChecked={confluenceOptions?.blogLiked ?? true} />
                    <Checkbox
                        label='A Comment is Created'
                        value='commentCreated'
                        defaultChecked={confluenceOptions?.commentCreated ?? true}
                    />
                </CheckboxGroup>
                <Heading size='small'>Activity Probability</Heading>
                <Text>
                    All of the probabilities are based on how many user operations out of 100 will receive an Reward Increment.
                </Text>
                <TextField
                    label='Page Created Probability'
                    name='pageCreatedProbability'
                    defaultValue={confluenceOptions?.pageCreatedProbability ?? '225'}
                />
                <TextField
                    label='Page Updated Probability'
                    name='pageUpdatedProbability'
                    defaultValue={confluenceOptions?.pageUpdatedProbability ?? '75'}
                />
                <TextField
                    label='Page Liked Probability'
                    name='pageLikedProbability'
                    defaultValue={confluenceOptions?.pageLikedProbability ?? '50'}
                />
                <TextField
                    label='Blog Created Probability'
                    name='blogCreatedProbability'
                    defaultValue={confluenceOptions?.blogCreatedProbability ?? '225'}
                />
                <TextField
                    label='Blog Updated Probability'
                    name='blogUpdatedProbability'
                    defaultValue={confluenceOptions?.blogUpdatedProbability ?? '75'}
                />
                <TextField
                    label='Blog Liked Probability'
                    name='blogLikedProbability'
                    defaultValue={confluenceOptions?.blogLikedProbability ?? '50'}
                />
                <TextField
                    label='Comment Created Probability'
                    name='commentCreatedProbability'
                    defaultValue={confluenceOptions?.commentCreatedProbability ?? '100'}
                />
            </Form>
        </Fragment>
    );
};
