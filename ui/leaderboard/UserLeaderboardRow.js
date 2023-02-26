import ForgeUI, { Button, Cell, Row, Text, User } from '@forge/ui';
import { ActivePowerUp } from './ActivePowerUp';

const getAwardBalance = (user, award) => {
    const awardBalance = user.awardBalance.find((awardBalance) => awardBalance.id === award.id);
    const balanceValue = awardBalance ? awardBalance.balance : 0;
    return `${balanceValue} ${award.incrementName}`;
};

export const UserLeaderboardRow = (props) => {
    const { user, awards, setViewingUserState } = props;

    return (
        <Row>
            <Cell>
                <User accountId={user.accountId} />
            </Cell>
            <Cell>
                <ActivePowerUp user={user} />
            </Cell>
            {awards.map((award) => {
                return (
                    <Cell>
                        <Text>{getAwardBalance(user, award)}</Text>
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
