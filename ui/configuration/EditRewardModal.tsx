import ForgeUI, { Fragment, Form, TextField, ModalDialog, Toggle, Button, TextArea, Tabs, Tab, Text } from '@forge/ui';
import {
    rewardEarnedMessage,
    rewardRedeemedMessage,
    incrementEarnedMessage,
    oneIncrementRemainingMessage
} from '../../defaults/rewardSuggestions';

export const EditRewardModal = (props) => {
    const { rewardOptionState, rewardActions } = props;
    const { editing, setEditing, saveReward, deleteReward } = rewardActions;

    const actionButtons = [<Button text='Delete' onClick={deleteReward} appearance='warning' />];
    return (
        <Fragment>
            {editing && (
                <ModalDialog header='Modify reward settings' onClose={() => setEditing(false)}>
                    <Form onSubmit={saveReward} submitButtonText='Update Reward' actionButtons={actionButtons}>
                        <Tabs>
                            <Tab label='General'>
                                <TextField
                                    name='name'
                                    description='A short but descriptive name for the reward.'
                                    label='Reward Name'
                                    defaultValue={rewardOptionState.name}
                                />
                                <TextArea
                                    name='description'
                                    description='Describe the reward and anything those collecting increments to earn it need to know.'
                                    label='Description'
                                    defaultValue={rewardOptionState.description}
                                />
                                <TextField
                                    name='incrementName'
                                    description='The name of the increment that will be collected, such as a slice of Pizza.'
                                    label='Increment Name'
                                    defaultValue={rewardOptionState.incrementName}
                                />
                                <TextField
                                    name='quantityRequired'
                                    description='How many increments are required to earn this reward?'
                                    label='Quantity Required'
                                    defaultValue={rewardOptionState.quantityRequired}
                                />
                                <TextField
                                    name='icon'
                                    description='Using standard Atlassian emojis like :pizza: you can specify an icon to use.'
                                    label='Reward Icon'
                                    defaultValue={rewardOptionState.icon}
                                />
                                <Toggle name='enabled' label='Active' defaultChecked={rewardOptionState.enabled}/>
                            </Tab>
                            <Tab label='Advanced'>
                                <Text>
                                    If you'd would like to configure the messages used when a user earns and increment or an entire
                                    reward you can do that here. Check out the help tab for customization available variables.
                                </Text>

                                <TextArea
                                    name='incrementEarnedMessage'
                                    label='Increment Earned'
                                    defaultValue={rewardOptionState.incrementEarnedMessage ?? incrementEarnedMessage}
                                />
                                <TextArea
                                    name='oneIncrementRemainingMessage'
                                    label='One Increment Remaining'
                                    defaultValue={rewardOptionState.oneIncrementRemainingMessage ?? oneIncrementRemainingMessage}
                                />
                                <TextArea
                                    name='rewardEarnedMessage'
                                    label='Reward Earned'
                                    defaultValue={rewardOptionState.rewardEarnedMessage ?? rewardEarnedMessage}
                                />
                                <TextArea
                                    name='rewardRedeemedMessage'
                                    label='Reward Redeemed'
                                    defaultValue={rewardOptionState.rewardRedeemedMessage ?? rewardRedeemedMessage}
                                />
                            </Tab>
                            <Tab label='Help'>
                                <Text>Customize the motivational messages with the below Mustache tags.</Text>
                                <Text>{"{{userMention}} - The user's display name"} </Text>
                                <Text>{'{{actionPerformed}} - What was done to receive the reward increment.'} </Text>
                                <Text>{'{{incrementName}} - The name of the increment'} </Text>
                                <Text>{'{{quantityRequired}} - The number of increments required to earn the reward'} </Text>
                                <Text>{'{{quantityRemaining}} - The number of increments remaining to earn the reward'} </Text>
                                <Text>{'{{rewardName}} - The name of the reward'} </Text>
                                <Text>{'{{rewardDescription}} - The description of the reward'} </Text>
                                <Text>{'{{rewardIcon}} - The emoji icon of the reward'} </Text>
                            </Tab>
                        </Tabs>
                    </Form>
                </ModalDialog>
            )}
        </Fragment>
    );
};
