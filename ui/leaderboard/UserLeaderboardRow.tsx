import ForgeUI, { Button, Cell, Row, Text, User } from '@forge/ui';
import { ActivePowerUp } from './ActivePowerUp';

const getRewardBalance = (user, reward) => {
    const rewardBalance = user.rewardBalance.find((rewardBalance) => rewardBalance.id === reward.id);
    const balanceValue = rewardBalance ? rewardBalance.balance : 0;
    return `${balanceValue} ${reward.incrementName}`;
};

export const UserLeaderboardRow = (props) => {
    const { user, rewards, setViewingUserState } = props;

    return (
        <Row>
            <Cell>
                <User accountId={user.accountId} />
            </Cell>
            <Cell>
                <ActivePowerUp user={user} />
            </Cell>
            {rewards.map((reward) => {
                return (
                    <Cell>
                        <Text>{getRewardBalance(user, reward)}</Text>
                    </Cell>
                );
            })}
            <Cell>
                <Button
                    text='View'
                    appearance='subtle-link'
                    onClick={() => setViewingUserState({ viewingUser: true, viewingUserAccountId: user.accountId })}
                />
            </Cell>
        </Row>
    );
};
