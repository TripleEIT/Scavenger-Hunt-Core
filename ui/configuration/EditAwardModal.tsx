import ForgeUI, { Fragment, Form, TextField, ModalDialog, Toggle, Button, TextArea, Tabs, Tab, Text } from '@forge/ui';
import {
    awardEarnedMessage,
    awardRedeemedMessage,
    incrementEarnedMessage,
    oneIncrementRemainingMessage
} from '../../defaults/awardSuggestions';

export const EditAwardModal = (props) => {
    const { awardOptionState, awardActions } = props;
    const { editing, setEditing, saveAward, deleteAward } = awardActions;

    const actionButtons = [<Button text='Delete' onClick={deleteAward} appearance='warning' />];
    return (
        <Fragment>
            {editing && (
                <ModalDialog header='Modify award settings' onClose={() => setEditing(false)}>
                    <Form onSubmit={saveAward} submitButtonText='Update Reward' actionButtons={actionButtons}>
                        <Tabs>
                            <Tab label='General'>
                                <TextField
                                    name='name'
                                    description='A short but descriptive name for the award.'
                                    label='Award Name'
                                    defaultValue={awardOptionState.name}
                                />
                                <TextArea
                                    name='description'
                                    description='Describe the award and anything those collecting increments to earn it need to know.'
                                    label='Description'
                                    defaultValue={awardOptionState.description}
                                />
                                <TextField
                                    name='incrementName'
                                    description='The name of the increment that will be collected, such as a slice of Pizza.'
                                    label='Increment Name'
                                    defaultValue={awardOptionState.incrementName}
                                />
                                <TextField
                                    name='quantityRequired'
                                    description='How many increments are required to earn this award?'
                                    label='Quantity Required'
                                    defaultValue={awardOptionState.quantityRequired}
                                />
                                <TextField
                                    name='icon'
                                    description='Using standard Atlassian emojis like :pizza: you can specify an icon to use.'
                                    label='Award Icon'
                                    defaultValue={awardOptionState.icon}
                                />
                                <Toggle name='enabled' label='Active' defaultChecked={awardOptionState.enabled}/>
                            </Tab>
                            <Tab label='Advanced'>
                                <Text>
                                    If you'd would like to configure the messages used when a user earns and increment or an entire
                                    award you can do that here. Check out the help tab for customization available variables.
                                </Text>

                                <TextArea
                                    name='incrementEarnedMessage'
                                    label='Increment Earned'
                                    defaultValue={awardOptionState.incrementEarnedMessage ?? incrementEarnedMessage}
                                />
                                <TextArea
                                    name='oneIncrementRemainingMessage'
                                    label='One Increment Remaining'
                                    defaultValue={awardOptionState.oneIncrementRemainingMessage ?? oneIncrementRemainingMessage}
                                />
                                <TextArea
                                    name='awardEarnedMessage'
                                    label='Award Earned'
                                    defaultValue={awardOptionState.awardEarnedMessage ?? awardEarnedMessage}
                                />
                                <TextArea
                                    name='awardRedeemedMessage'
                                    label='Award Redeemed'
                                    defaultValue={awardOptionState.awardRedeemedMessage ?? awardRedeemedMessage}
                                />
                            </Tab>
                            <Tab label='Help'>
                                <Text>Customize the motivational messages with the below Mustache tags.</Text>
                                <Text>{"{{userMention}} - The user's display name"} </Text>
                                <Text>{'{{actionPerformed}} - What was done to receive the award increment.'} </Text>
                                <Text>{'{{incrementName}} - The name of the increment'} </Text>
                                <Text>{'{{quantityRequired}} - The number of increments required to earn the award'} </Text>
                                <Text>{'{{quantityRemaining}} - The number of increments remaining to earn the award'} </Text>
                                <Text>{'{{awardName}} - The name of the award'} </Text>
                                <Text>{'{{awardDescription}} - The description of the award'} </Text>
                                <Text>{'{{awardIcon}} - The emoji icon of the award'} </Text>
                            </Tab>
                        </Tabs>
                    </Form>
                </ModalDialog>
            )}
        </Fragment>
    );
};
