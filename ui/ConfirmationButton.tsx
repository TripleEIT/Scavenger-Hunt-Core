import ForgeUI, { render, AdminPage, Fragment, GlobalSettings, useState, Button, useProductContext, Tabs, Tab, Text } from '@forge/ui';

export const ConfirmationButton = (props) => {
    const { text, onClick, disabled } = props;
    const [confirming, setConfirming] = useState(false);

    const performConfirm = () => {
        setConfirming(true);
    };

    if (confirming) {
        return <Button text={'Confirm ' + text} onClick={onClick} disabled={disabled} appearance="danger" />;
    } else {
        return <Button text={text} onClick={performConfirm} disabled={disabled} appearance="danger" />;
    }
};
