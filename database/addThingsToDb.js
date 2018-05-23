
// exports.sendFriendRequest = (requester_id, receiver_id, status) => {
//     return db.query(
//         `INSERT INTO friendships (requester_id, receiver_id, status)
//                     VALUES ($1, $2, $3) RETURNING *
//                      `,
//         [requester_id, receiver_id, status]
//     );
// };
//
// exports.updateFriendshipStatus = (requester_id, receiver_id, status) => {
//     // console.log('inside the database requester_id, receiver_id, status',requester_id, receiver_id, status);
//     return db.query(
//         `UPDATE friendships
//                     SET status = $3
//                     WHERE (requester_id = $1 and receiver_id = $2)
//                     OR (receiver_id = $1 and requester_id = $2)
//                     RETURNING *
//                      `,
//         [requester_id, receiver_id, status]
//     );
// };
//
// exports.insertNewPin = (id, description, title, catagory, lat, lng, color) => {
//     return db.query(
//         `INSERT INTO pins (user_id,  description, title,category, lat, lng, color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
//         [id, description, title, catagory, lat, lng, color]
//     );
// };

//ADD USERS: (exports.saveUser)

psql mapappdb

DROP TABLE users CASCADE;
DROP TABLE friendships;
DROP TABLE pins CASCADE;

SELECT * FROM users;
INSERT INTO users (first, last, email, pass, profilepic, bio) VALUES ('Angie', 'Pip', 'a@p', '123', 'https://s3.amazonaws.com/spicyturkeyangie/j8E-sBeB7DvM8WA-7WNqF-BwE-B-FECO.jpg', 'I love programming!') RETURNING id;
INSERT INTO users (first, last, email, pass, bio) VALUES ('David', 'Gilmour', 'd@g', 'd', 'I can play the guitar! Looking for the best music bars in town') RETURNING id;
INSERT INTO users (first, last, email, pass, bio) VALUES ('Oliver', 'Stone', 'o@s', 'o', 'Movies. I am into cinemas a lot') RETURNING id;
INSERT INTO users (first, last, email, pass, bio) VALUES ('Friendly', 'Dog', 'f@d', 'f', 'I like paaaarks!!!') RETURNING id;
