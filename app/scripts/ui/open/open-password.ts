import * as kdbxweb from 'kdbxweb';
import { h, FunctionComponent } from 'preact';
import { OpenPasswordView } from 'views/open/open-password-view';
import { Workspace } from 'models/workspace';
import { useEvent, useModelWatcher } from 'util/ui/hooks';
import { Locale } from 'util/locale';
import { AppSettings } from 'models/app-settings';
import { Keys } from 'const/keys';
import { OpenController } from 'comp/app/open-controller';
import { Alerts } from 'comp/ui/alerts';

export const OpenPassword: FunctionComponent = () => {
    useModelWatcher(Workspace.openState);

    useEvent('user-idle', () => {
        Workspace.openState.password = kdbxweb.ProtectedValue.fromString('');
    });

    const passwordClicked = () => {
        OpenController.chooseFile();
    };

    const passwordChanged = (password: kdbxweb.ProtectedValue) => {
        Workspace.openState.password = password;
    };

    const passwordKeyUp = (e: KeyboardEvent) => {
        const code = e.keyCode || e.which;
        if (code === Keys.DOM_VK_CAPS_LOCK) {
            Workspace.openState.capsLockPressed = false;
        }
    };

    const passwordKeyDown = (e: KeyboardEvent) => {
        const code = e.keyCode || e.which;
        if (code === Keys.DOM_VK_RETURN) {
            OpenController.open();
        } else if (code === Keys.DOM_VK_CAPS_LOCK) {
            Workspace.openState.capsLockPressed = false;
        }
    };

    const passwordKeyPress = (e: KeyboardEvent) => {
        const charCode = e.keyCode || e.which;
        const ch = String.fromCharCode(charCode);
        const lower = ch.toLowerCase();
        const upper = ch.toUpperCase();
        if (lower !== upper && !e.shiftKey) {
            Workspace.openState.capsLockPressed = ch !== lower;
        }
    };

    let passwordPlaceholder = '';
    if (Workspace.openState.name) {
        passwordPlaceholder = `${Locale.openPassFor} ${Workspace.openState.name}`;
    } else if (AppSettings.canOpen) {
        passwordPlaceholder = Locale.openClickToOpen;
    }

    const submitClicked = () => {
        OpenController.open();
    };

    return h(OpenPasswordView, {
        password: Workspace.openState.password,
        passwordReadOnly: !Workspace.openState.name,
        passwordPlaceholder,
        autoFocusPassword: !Alerts.alertDisplayed && Workspace.openState.autoFocusPassword,
        buttonFingerprint: false,
        capsLockPressed: Workspace.openState.capsLockPressed,
        openingFile: Workspace.openState.openingFile,
        showInputError: Workspace.openState.openError && Workspace.openState.invalidKey,

        passwordClicked,
        passwordChanged,
        passwordKeyUp,
        passwordKeyDown,
        passwordKeyPress,
        submitClicked
    });
};