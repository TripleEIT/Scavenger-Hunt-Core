import ForgeUI, { Fragment, Form, TextField, ModalDialog, Toggle, Button, TextArea, Tabs, Tab, Text, Link } from '@forge/ui';
import { ConfirmationButton } from '../ConfirmationButton';
import { HelpLink } from '../HelpLink';

export const EditRewardModal = (props) => {
    const { rewardOptionState, rewardActions } = props;
    const { editing, setEditing, saveReward, setAdvancedEditing, deleteReward } = rewardActions;
    const actionButtons = [
        <ConfirmationButton onClick={deleteReward} appearance="danger" text="Delete" />,
        <Button text="Advanced" onClick={() => setAdvancedEditing(true)} />
    ];

    return (
        <Fragment>
            {editing && (
                <ModalDialog header="Modify reward settings" onClose={() => setEditing(false)}>
                    <Form onSubmit={saveReward} submitButtonText="Update Reward" actionButtons={actionButtons}>
                        <Text>
                            If you'd would like to configure the messages used when a user earns and increment or an entire reward you can
                            do that here. Check out the help tab for customization available variables.
                        </Text>
                        <HelpLink helpLink="https://tripleeit.atlassian.net/wiki/spaces/SHD/pages/9601093/Configuring+Rewards#Edit" />
                        <TextField
                            name="name"
                            description="A short but descriptive name for the reward."
                            label="Reward Name"
                            defaultValue={rewardOptionState.name}
                        />
                        <TextArea
                            name="description"
                            description="Describe the reward and anything those collecting increments to earn it need to know."
                            label="Description"
                            defaultValue={rewardOptionState.description}
                        />
                        <TextField
                            name="incrementName"
                            description="The name of the increment that will be collected, such as a slice of Pizza."
                            label="Increment Name"
                            defaultValue={rewardOptionState.incrementName}
                        />
                        <TextField
                            name="quantityRequired"
                            description="How many increments are required to earn this reward?"
                            label="Quantity Required"
                            defaultValue={rewardOptionState.quantityRequired}
                        />
                        <TextField
                            name="icon"
                            description="Using standard Atlassian emojis like :pizza: you can specify an icon to use."
                            label="Reward Icon"
                            defaultValue={rewardOptionState.icon}
                        />
                        <Toggle name="enabled" label="Active" defaultChecked={rewardOptionState.enabled} />
                    </Form>
                </ModalDialog>
            )}
        </Fragment>
    );
};
