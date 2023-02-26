import ForgeUI, { Checkbox, CheckboxGroup, Form, FormCondition, Fragment, Heading, Text, TextField, useState } from '@forge/ui';

export const JiraOptions = (props) => {
    const { currentConfig, setCurrentConfig, context } = props;
    const [ jiraOptions, setJiraOptions ] = useState(currentConfig.jiraOptions);

    const saveJiraOptions = async (formData) => {
        const { awardSettings, issueCreatedProbability, issueUpdatedProbability, issueCommentedProbability } = formData;
        const jiraOptions = {
            issueCreated: awardSettings.includes('issueCreated'),
            issueUpdated: awardSettings.includes('issueUpdated'),
            issueCommented: awardSettings.includes('issueCommented'),
            issueCreatedProbability: parseInt(issueCreatedProbability),
            issueUpdatedProbability: parseInt(issueUpdatedProbability),
            issueCommentedProbability: parseInt(issueCommentedProbability),
        };
        await setCurrentConfig({ ...currentConfig, jiraOptions });
        setJiraOptions(jiraOptions);
    };

    return (
        <Fragment>
            <Text>
                Awards will be distributed randomly while users work within Jira, you can configure which actions qualify for user
                awards.
            </Text>
            <Form onSubmit={saveJiraOptions} submitButtonText='Update Jira Settings' submitButtonAppearance='primary'>
            <Heading size='small'>Eligible Activities</Heading>
            <Text>
                For each of the actions below, you can set the probability that a user will be eligible to win an Award Increment.
                Award increments will only be granted if they are available in the pool.
            </Text>
                <CheckboxGroup label='Award Increments when' name='awardSettings'>
                    <Checkbox label='An Issue is Created' value='issueCreated' defaultChecked={jiraOptions?.issueCreated ?? true}  />
                    <Checkbox label='An Issue is Updated' value='issueUpdated' defaultChecked={jiraOptions?.issueUpdated ?? true}/>
                    <Checkbox label='An Issue is Commented On' value='issueCommented' defaultChecked={jiraOptions?.issueCommented ?? true} />
                </CheckboxGroup>
                <Heading size='small'>Activity Probability</Heading>
                <Text>
                    All of the probabilities are based on how many user operations out of 100 will receive an Award Increment.  A probability of 50 means that approximately %5 of the user activities will receive an Award Increment for the action.
                </Text>
                <TextField
                    label='Issue Created Probability'
                    name='issueCreatedProbability'
                    defaultValue={jiraOptions?.issueCreatedProbability ?? "50"}
                />
                <TextField
                    label='Issue Update Probability'
                    name='issueUpdatedProbability'
                    defaultValue={jiraOptions?.issueUpdatedProbability ?? "50"}
                />
                <TextField
                    label='Issue Commented on Probability'
                    name='issueCommentedProbability'
                    defaultValue={jiraOptions?.issueCommentedProbability ?? "50"}
                />
            </Form>
        </Fragment>
    );
};
