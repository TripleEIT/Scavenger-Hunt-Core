import ForgeUI, { Fragment, Tag, TagGroup, Text } from '@forge/ui';
import { getActivePowerUp } from '../../utils.js';

export const ActivePowerUp = (props) => {
    const { user } = props;

    const activePowerUpTag = (user) => {
        const activePowerUp = getActivePowerUp(user);
        switch (activePowerUp) {
            case 'doubleReward':
                return (
                    <TagGroup>
                        <Tag text='Double Reward Detective' color='purple' />
                    </TagGroup>
                );
            case 'luckyCharm10':
                return (
                    <TagGroup>
                        <Tag text='Lucky Charm +10%' color='green' />
                    </TagGroup>
                );
            default:
                return (
                    <TagGroup>
                        <Tag text='none' color='grey-light' />
                    </TagGroup>
                );
        }
    };

    return <Fragment>{activePowerUpTag(user)}</Fragment>;
};
