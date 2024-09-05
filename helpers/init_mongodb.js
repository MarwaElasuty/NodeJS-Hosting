const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
        // online
        dbName: process.env.DB_NAME

    })
    .then(() => {
        console.log('connected to mongoDb');
    }).catch((err) => {
        console.log(err);
    })

mongoose.connection.on("connected", (connection) => {
    console.log('mongoose connected');
})

mongoose.connection.on("error", (err) => {
    console.log('error on mongoose ', err);
})

mongoose.connection.on("disconnected", () => {
    console.log('disconnected to mongoose');
})

process.on("SIGINT", async() => {
    await mongoose.connection.close();
    process.exit(0);
})