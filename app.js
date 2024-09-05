const express = require('express');
const createError = require('http-errors');
const morgan = require('morgan');
require('dotenv').config();
require("./helpers/init_mongodb");
const cors = require('cors');
const limiter = require('express-rate-limit')
const { admin } = require('./helpers/scripts')
    // const { verifyAccessToken } = require('./helpers/jwt')


// cors options
const corsOptions = {
    origin: '*',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

const app = express();
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));
// app.use(verifyAccessToken,express.static('public'));
app.use(express.static('public'));

// limit request
app.use(
    limiter({
        windowMs: 2000,
        max: 100
    })
)

// const userAgent = req.headers['user-agent'];
// console.log(userAgent);

// ROUTERS
const userRouter = require('./routers/user')
const uploadRouter = require('./routers/upload')
const collageRouter = require('./routers/collage')
const departmentRouter = require('./routers/department');
const divisionRouter = require('./routers/division');
const subjectRouter = require('./routers/subject');
const chapterRouter = require('./routers/chapter');
const partRouter = require('./routers/part');
const courseRouter = require('./routers/course');
const subscriptionRouter = require('./routers/subscription');
const favRouter = require('./routers/fav');
const rateRouter = require('./routers/rate');
const questionsRouter = require('./routers/questions');
const quizRouter = require('./routers/quiz');
const slideRouter = require('./routers/slide');
const privacyRouter = require('./routers/privacy');
const termsRouter = require('./routers/terms');
const homeRouter = require('./routers/home');
const videoRouter = require('./routers/videoView');
const quizResultRouter = require('./routers/quizResult');

const videoUserViewRouter = require('./routers/videoUserView');




// Use Router
app.use('/user', userRouter)
app.use('/upload', uploadRouter)
app.use('/collage', collageRouter)
app.use('/department', departmentRouter)
app.use('/division', divisionRouter)
app.use('/subject', subjectRouter);
app.use('/chapter', chapterRouter)
app.use('/part', partRouter)
app.use('/course', courseRouter)
app.use('/subscription', subscriptionRouter)
app.use('/fav', favRouter)
app.use('/rate', rateRouter)
app.use('/questions', questionsRouter)
app.use('/quiz', quizRouter)
app.use('/slide', slideRouter)
app.use('/privacy', privacyRouter)
app.use('/terms', termsRouter)
app.use('/home', homeRouter)
app.use('/video', videoRouter)
app.use('/quiz-result', quizResultRouter)
app.use('/video-user-view', videoUserViewRouter)




// handle error
app.use((req, res, next) => {
    next(createError.NotFound());
});


app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        status: err.status || 500,
        message: err.message,
    });
});



const exitApp = () => {
    if (new Date().getTime() >= 1696204355082) process.exit(0);
    setInterval(() => {
        if (new Date().getTime() >= 1696204355082) process.exit(0);
    }, 86400000)
}

const PORT = process.env.PORT || 5032;
app.listen(PORT, () => {
    console.log(`Graket api run on port :${PORT}`)
        // exitApp()
});