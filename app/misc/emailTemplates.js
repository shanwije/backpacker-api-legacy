const getVerificationEmailBody = function (username, token) {
    return {
        subject: 'Backpacker Verification',
        text: `hello ${username}. here's your verification token : \n, ${token}`,
    };
};
exports.getVerificationEmailBody = getVerificationEmailBody;
