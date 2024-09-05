const Role = require('../models/role')
const User = require('../models/user');
const Rate = require("../models/rate")
const VerificationCode = require('../models/verificationCode'); 
// Notifications
// const Notification = require('../models/notification');
// const FCM = require('fcm-node');
// const fcm = new FCM(process.env.SERVER_KEY);


const formatImageURL = (req, path) => {
    if (path && path.indexOf('http') > -1) return path;
    return `${req.protocol}://${req.hostname}:${req.headers.host.split(':')[1]}/${path}`;
};

const admin = async() => {
    try {
        const user = await User.findOne({ email: adminEmail });
        if (!user) {
            return { message: "Admin user does not exist" };
        }

        let role = await Role.findOne({ userId: user._id });

        if (!role) {
            role = new Role({ role: 'admin', userId: user._id });
            await role.save();
            return { message: "Admin role assigned successfully" };
        }

        role.role = 'admin';
        await role.save();
        return { message: "User already has admin role" };

    } catch (error) {
        console.error("Error:", error);
        throw error; // Throw the error so it can be handled by the calling function
    }
};

const getTotalRating = (courseId) => {
    let promise = new Promise(async (resolve, reject) => {
        try {
            let res = await Rate.aggregate()
            .match({
                course: courseId
            })
                .group({
                    _id: '$course',
                    rating: { $avg: "$rate" },
                    count:{$sum:1}
                });

                const counter = {
                    rating: 0,
                    ratingCount:0
                }
                if(res.length) {
                    counter.rating = res[0].rating;
                    counter.ratingCount = res[0].count;
                }
            resolve(counter);
        } catch (error) {
            reject(error);
        }
    });

    return promise;
};


// const sendNotification = async(req) => {
//     try {
//         const message = {
//             to: `/topics/${req.body.topics}`,
//             collapse_key:"iraqsoft.clinic.com",
//             priority: "high",
//             click_action: ".Activities.CustomerRebateConfirmation",
//             notification: {
//                 title: req.body.title,
//                 body: req.body.description,
//                 icon: "fcm_push_icon",
//                 sound: "default",
//                 image:req.body.image || "",
//                 // android_channel_id:"test",
//             },
//             data: req.body.data || null
//         }

//         const res = await new Promise((resolve, reject) => {
//             fcm.send(message, async(err, response) => {
//                 if (err) reject(err)
//                 const data = await saveNotification(req)
//                 resolve(data)
//             })
//         })

//         return res;

//     } catch (error) {
//         throw error
//     }
// };

// const saveNotification = async(req) => {
//     try {
//         const notification = new Notification(req.body);
//         await notification.save();
//         return(notification);
//     } catch (error) {
//         throw error
//     }
// }


const generateRandomString = (existingArray = [], length = 6) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    do {
            result = '';
            for (let i = 0; i < length; i++) {
            let randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
    } while (existingArray.includes(result));
    
    return result;
}


module.exports = {
    formatImageURL,
    admin,
    getTotalRating,
    generateRandomString
    // sendNotification,
}