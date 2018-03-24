let toolset = require('./toolset');
module.exports = {
    isMessage(value) {
        try {
            let message = value;
            return (
                typeof message.type == 'string'
                && typeof message.text == 'string'
            );
        } catch (e) {
            return false;
        }
    },

    msgNotEmpty(value){
        return this.isMessage(value) && value.text.length > 0;
    },

    isInArray(target, arr) {
        return toolset.isInArray(target, arr);
    }
};