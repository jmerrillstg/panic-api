var appConfig = {
    dbConnect: {
        host: '', // Change this to the mysql hostname
        user: '', // Change this to the mysql user
        password: '', // Change this to the mysql password
        database: '', // Change this to the mysql database
        port: 3306 // Change this to the mysql port
    },
    mailConfig: {
        service: 'gmail',
        auth: {
            user: 'your@gmail.com', // Change this to the gmail username
            pass: 'yourpassword' // Change this to the gmail password
        }
    },
    jwtKey: '', // Change this to the jwt_key you wish to use
    appUrl: '', // Change this to the front end's main URL for the environment you are on
    environment: '' // Change this to 'dev' or 'production'
};
module.exports = appConfig;