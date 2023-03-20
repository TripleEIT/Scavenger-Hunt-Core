import ForgeUI, { Fragment, Form, TextField, ModalDialog, Toggle, Button, TextArea, Tabs, Tab, Text, Link } from '@forge/ui';
import {
    rewardEarnedMessage,
    rewardRedeemedMessage,
    incrementEarnedMessage,
    oneIncrementRemainingMessage
} from '../../defaults/rewardSuggestions';
import { HelpLink } from '../HelpLink';

export const AdvancedRewardModal = (props) => {
    const { rewardOptionState, rewardActions } = props;
    const { advancedEditing, setAdvancedEditing, saveReward, deleteReward } = rewardActions;

    return (
        <Fragment>
            {advancedEditing && (
                <ModalDialog header="Modify reward settings" onClose={() => setAdvancedEditing(false)}>
                    <Form onSubmit={saveReward} submitButtonText="Update Reward">
                        <Text>
                            If you'd would like to configure the messages used when a user earns and increment or an entire reward you can
                            do that here. Check out the documentation for available customization variables.
                        </Text>
                        <HelpLink helpLink="https://tripleeit.atlassian.net/wiki/spaces/SHD/pages/9601093/Configuring+Rewards#Advanced" />

                        <TextArea
                            name="incrementEarnedMessage"
                            label="Increment Earned"
                            defaultValue={rewardOptionState.incrementEarnedMessage ?? incrementEarnedMessage}
                        />
                        <TextArea
                            name="oneIncrementRemainingMessage"
                            label="One Increment Remaining"
                            defaultValue={rewardOptionState.oneIncrementRemainingMessage ?? oneIncrementRemainingMessage}
                        />
                        <TextArea
                            name="rewardEarnedMessage"
                            label="Reward Earned"
                            defaultValue={rewardOptionState.rewardEarnedMessage ?? rewardEarnedMessage}
                        />
                        <TextArea
                            name="rewardRedeemedMessage"
                            label="Reward Redeemed"
                            defaultValue={rewardOptionState.rewardRedeemedMessage ?? rewardRedeemedMessage}
                        />
                    </Form>
                </ModalDialog>
            )}
        </Fragment>
    );
};
