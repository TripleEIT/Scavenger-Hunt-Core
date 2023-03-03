import ForgeUI, { Button, Cell, Fragment, Head, Heading, ModalDialog, Row, Table, Text, useState } from '@forge/ui';
import { render } from 'mustache';
import { rewardRedeemedMessage } from '../../defaults/rewardSuggestions';
import { getRewardOption, recordRewardRedemption } from '../../storage/rewardData';
import { setConfigurationSettings } from '../../storage/configurationData';
import { getNarrowUserRecord, setUserRecord } from '../../storage/userData';

export const RedeemRewardsBlock = (props) => {
    const { userDetails, setUserDetails, currentConfig, setCurrentConfig, context } = props;
    const [isRedeeming, setIsRedeeming] = useState({ isRedeeming: false, message: null, redemptionCode: null });

    const redeemReward = async (rewardId) => {
        const rewardData = await getRewardOption(rewardId, context);
        const rewardBalance = userDetails.rewardBalance.find((rewardBalance) => rewardBalance.id == rewardId);
        if (rewardBalance && rewardBalance.balance >= rewardData.quantityRequired) {
            console.info(`Redeeming reward ${rewardId} for ${rewardData.quantityRequired} for user ${userDetails.accountId}`);

            const newRewardBalance = { id: rewardId, balance: rewardBalance.balance - rewardData.quantityRequired };
            const newUserDetails = {
                ...userDetails,
                rewardBalance: [...userDetails.rewardBalance.filter((rewardBalance) => rewardBalance.id != rewardId), newRewardBalance]
            };

            newUserDetails.rewardActivity.push({
                rewardId: rewardData.id,
                rewardName: rewardData.name,
                incrementName: rewardData.incrementName,
                incrementsWon: rewardData.quantityRequired,
                activePowerUp: null,
                rewardActivity: 'Redeemed',
                date: new Date().toISOString()
            });

            const newNarrowUserDetails = getNarrowUserRecord(newUserDetails);

            const redemptionRecord = await recordRewardRedemption(rewardData, userDetails);//, context, currentConfig);
            const newConfig = {
                ...currentConfig,
                activeUsers: [
                    ...currentConfig.activeUsers.filter((user) => user.accountId != newUserDetails.accountId),
                    newNarrowUserDetails
                ],
                rewards: [...currentConfig.rewards],
                redemptions: [...(currentConfig?.redemptions ?? []), redemptionRecord]
            };

            setUserDetails(newUserDetails);
            setCurrentConfig(newConfig);

            setIsRedeeming({
                isRedeeming: true,
                message: rewardData.rewardRedeemedMessage ?? rewardRedeemedMessage,
                redemptionCode: redemptionRecord.redemptionCode
            });

            // Save the new user record and the new global config
            await Promise.all([
                setUserRecord(newUserDetails.accountId, newUserDetails, context),
                setConfigurationSettings(newConfig, context)
            ]);
        }
    };

    return (
        <Fragment>
            <Table>
                <Head>
                    <Cell>
                        <Text>Reward Name</Text>
                    </Cell>
                    <Cell>
                        <Text>Description</Text>
                    </Cell>
                    <Cell>
                        <Text>Quantity Collected</Text>
                    </Cell>
                    <Cell>
                        <Text>Quantity Required</Text>
                    </Cell>
                    <Cell>
                        <Text>Actions</Text>
                    </Cell>
                </Head>
                {currentConfig.rewards
                    .filter((reward) => reward.enabled)
                    .map((reward) => {
                        const rewardBalance = userDetails.rewardBalance.find((rewardBalance) => rewardBalance.id == reward.id);
                        return (
                            <Row>
                                <Cell>
                                    <Text>{reward.name}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{reward.description}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{rewardBalance ? rewardBalance.balance : 0}</Text>
                                </Cell>
                                <Cell>
                                    <Text>{reward.quantityRequired}</Text>
                                </Cell>
                                <Cell>
                                    {rewardBalance && rewardBalance.balance >= reward.quantityRequired && (
                                        <Button text='Redeem Reward' appearance='primary' onClick={async () => redeemReward(reward.id)} />
                                    )}
                                    {rewardBalance && rewardBalance.balance < reward.quantityRequired && <Text>Not Enough Yet</Text>}
                                    {!rewardBalance && <Text>Not Enough Yet</Text>}
                                </Cell>
                            </Row>
                        );
                    })}
            </Table>
            {isRedeeming.isRedeeming && (
                <Fragment>
                    <ModalDialog header='Congratulations' onClose={() => setIsRedeeming({isRedeeming: false, message: null, redemptionCode: null})} closeButtonText='Close'>
                        <Text>{isRedeeming.message}</Text>
                        <Text> </Text>
                        <Heading size='small'>Redemption Code</Heading>
                        <Text>{isRedeeming.redemptionCode}</Text>
                    </ModalDialog>
                </Fragment>
            )}
        </Fragment>
    );
};
