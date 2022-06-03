const mongoose = require('mongoose');

exports.mongooseConnect = () => {
    return mongoose.connect('mongodb+srv://huypham00funix:Huy100100@node-complete.nqvxr.mongodb.net/asm1?retryWrites=true&w=majority');
}
