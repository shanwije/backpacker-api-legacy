const getVerificationEmailBody = function (email, token) {
    return {
        subject: 'Backpacker Verification',
        text: `Hi, Here's your verification token : \n BP-${token}`,
    };
};
exports.getVerificationEmailBody = getVerificationEmailBody;
