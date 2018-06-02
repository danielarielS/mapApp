var bcrypt = require("bcryptjs");
var spicedPg = require("../node_modules/spiced-pg");

var db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg("postgres:funky:chicken@localhost:5432/mapappdb");
}

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}
exports.hashPassword = hashPassword;
// ************** REGISTRATION *************
exports.saveUser = (first, last, email, password) => {
    return db.query(
        "INSERT INTO users (first, last, email, pass) VALUES ($1, $2, $3, $4) RETURNING id",
        [first, last, email, password]
    );
};

// ************** LOGIN *************
//this used to be getUserInfo
exports.getUserInfoByEmail = (email) => {
    return db.query("SELECT * FROM users WHERE UPPER(email)=UPPER($1)", [
        email
    ]);
};
exports.getUserInfoById = (id) => {
    return db.query("SELECT * FROM users WHERE id=$1", [id]);
};
exports.checkForUser = (email) => {
    return db.query("SELECT id FROM users WHERE UPPER(email)=UPPER($1)", [
        email
    ]);
};
exports.checkPassword = (
    textEnteredInLoginForm,
    hashedPasswordFromDatabase
) => {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
};

// ******* INSERT IMAGES *******
exports.updateProfilepic = (profilepic, email) => {
    return db.query(
        `UPDATE users
                     SET profilepic = $1
                     WHERE email = $2
                     RETURNING *
                     `,
        [profilepic, email]
    );
};
// ******* INSERT BIO *******

exports.updateUserInfo = (id, first, last, email, bio, pass) => {
    if (pass) {
        return hashPassword(pass)
            .then((hashedPassword) => {
                return db.query(
                    `UPDATE users
                SET first = $2, last=$3, email=$4, bio=$5, pass=$6
                WHERE id = $1
                RETURNING *
                `,
                    [id, first, last, email, bio, hashedPassword]
                );
            })
            .catch((err) => {
                console.log("err when hashing in db", err);
            });
    } else {
        return db.query(
            `UPDATE users
                         SET first = $2, last=$3, email=$4, bio=$5
                         WHERE id = $1
                         RETURNING *
                        `,
            [id, first, last, email, bio]
        );
    }
};
// ******* CHECK FRIENDSHIP STATUS ********
exports.checkFriendshipStatus = (requester_id, receiver_id) => {
    return db.query(
        `SELECT requester_id, receiver_id, status FROM friendships
                     WHERE (requester_id = $1 and receiver_id = $2)
                     OR (receiver_id = $1 and requester_id = $2)
                     ORDER BY id DESC
                    `,
        [requester_id, receiver_id]
    );
};

exports.sendFriendRequest = (requester_id, receiver_id, status) => {
    return db.query(
        `INSERT INTO friendships (requester_id, receiver_id, status)
                    VALUES ($1, $2, $3) RETURNING *
                     `,
        [requester_id, receiver_id, status]
    );
};

exports.updateFriendshipStatus = (requester_id, receiver_id, status) => {
    // console.log('inside the database requester_id, receiver_id, status',requester_id, receiver_id, status);
    return db.query(
        `UPDATE friendships
                    SET status = $3
                    WHERE (requester_id = $1 and receiver_id = $2)
                    OR (receiver_id = $1 and requester_id = $2)
                    RETURNING *
                     `,
        [requester_id, receiver_id, status]
    );
};

exports.getFriends = (id) => {
    console.log("inside get friends");
    return db.query(
        `SELECT * FROM friendships
        WHERE (receiver_id = $1 or requester_id = $1) AND status = 3
        ORDER BY id DESC
        `,
        [id]
    );
};
// *********** PART 7 : List Friends ***********

exports.getFriendsAndWannabes = (id) => {
    return db.query(
        `
        SELECT users.id, status, first, last, profilepic
            FROM friendships
            JOIN users
            ON (status = 1 AND receiver_id = $1 AND requester_id = users.id)
            OR (status = 3 AND receiver_id = $1 AND requester_id = users.id)
            OR (status = 3 AND requester_id = $1 AND receiver_id = users.id)
            ORDER BY status DESC
                    `,
        [id]
    );
};

// ********* PART 8 *************

exports.getUsersByIds = (array) => {
    return db.query(
        `
        SELECT id, first, last, profilepic FROM users
        WHERE id = ANY($1)`,
        [array]
    );
};
////////// map stuff //////////////
exports.selectCategory = (array, id) => {
    return db.query(
        `SELECT * FROM pins WHERE category = ANY($1) AND user_id = $2`,
        [array, id]
    );
};

exports.insertNewPin = (id, description, title, catagory, lat, lng, color) => {
    return db.query(
        `INSERT INTO pins (user_id,  description, title,category, lat, lng, color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [id, description, title, catagory, lat, lng, color]
    );
};
exports.getMarkerInfo = (id) => {
    return db.query(`SELECT * FROM pins WHERE user_id=$1`, [id]);
};
exports.getAllPins = () => {
    return db.query(`SELECT * FROM pins`);
};
exports.saveMarkerImage = (url, id) => {
    return db.query(`UPDATE pins SET url = $1  WHERE id = $2 RETURNING *`, [
        url,
        id
    ]);
};
exports.formatDate = (date) => {
    // var monthNames = [
    //     "January",
    //     "February",
    //     "March",
    //     "April",
    //     "May",
    //     "June",
    //     "July",
    //     "August",
    //     "September",
    //     "October",
    //     "November",
    //     "December"
    // ];
    var monthNames = [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12"
    ];
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var hour = date.getHours();
    var minutes = date.getMinutes();

    return (
        day + "." + monthNames[monthIndex] + "." + year
        // +
        // " " +
        // hour +
        // ":" +
        // minutes
    );
};
exports.getPinClickInfo = (pinId) => {
    return db.query(`SELECT * FROM pins WHERE id=$1`, [pinId]);
};
exports.nameOfUser = (name) => {
    name = name + "%";

    return db.query("SELECT * FROM users WHERE UPPER(first)  LIKE UPPER($1)", [
        name
    ]);
};
exports.deletePinDb = (pinId) => {
    return db.query(`DELETE FROM pins WHERE id=$1 RETURNING *`, [pinId]);
};
exports.updateThePin = (pinId, description, title) => {
    return db.query(
        `UPDATE pins SET description = $2, title=$3 WHERE id = $1 RETURNING *`,
        [pinId, description, title]
    );
};
