const GOOGLE_CLIENT_ID = '214990682122-5d6pkhtsj45akaukn3hr5hi00ucbbk9j.apps.googleusercontent.com';

export const initGoogleAuth = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
    });
};

export const handleGoogleLogin = (callback) => {
    if (window.google) {
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: callback,
        });
        window.google.accounts.id.prompt();
    }
};

export const renderGoogleButton = (elementId, callback) => {
    if (window.google) {
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: callback,
        });
        window.google.accounts.id.renderButton(
            document.getElementById(elementId),
            {
                theme: 'outline',
                size: 'large',
                width: '100%',
                text: 'continue_with',
            }
        );
    }
};
