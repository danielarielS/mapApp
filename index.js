const express = require("express");
const app = express();
const compression = require("compression");
const db = require("./database/database");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { hashPassword } = require("./database/database");
const secret = require("./config.json");
const csurf = require("csurf");

const server = require("http").Server(app);
const io = require("socket.io")(server, {
    origins: "localhost:8080, 192.168.50.106:* mapapp-spiced.herokuapp.com:*"
});

const multer = require("multer"); //it's like bodyParser but for many(multi)
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3"); //check
const config = require("./config.json");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(compression());

app.use(express.static("./public"));

app.use(bodyParser.json());

const cookieSessionMiddleWare = cookieSession({
    secret: secret.secret,
    maxAge: 1000 * 60 * 60 * 24 * 14
});
app.use(cookieSessionMiddleWare);
io.use(function(socket, next) {
    cookieSessionMiddleWare(socket.request, socket.request.res, next);
});

if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: "http://localhost:8081/"
        })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}
app.use(function(req, res, next) {
    next();
});
app.use(csurf());

app.use(function(req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});
function requireLogin(req, res, next) {
    if (!req.session.user) {
        res.sendStatus(403);
    } else {
        next();
    }
}

app.get("/getUser", requireLogin, function(req, res) {
    res.json({
        success: true,
        user: req.session.user
    });
});

app.get("/getUser/:userId", requireLogin, function(req, res) {
    db
        .getUserInfoById(req.params.userId)
        .then((userInfo) => {
            res.json({
                user: userInfo.rows[0]
            });
        })
        .catch((err) => {
            console.log("problem with getting userInfo", err);
        });
});

app.get("/welcome", function(req, res) {
    if (!req.session.user) {
        res.sendFile(__dirname + "/index.html");
    } else {
        res.redirect("/");
    }
});

app.post("/register", function(req, res) {
    db.checkForUser(req.body.email).then(function(result) {
        if (result.rows[0]) {
            req.session.email = req.body.email;
            res.json({
                success: false,
                errorMsg: "User exists. go to login"
            });
        } else if (!result.rows[0]) {
            if (
                req.body.first &&
                req.body.last &&
                req.body.email &&
                req.body.password
            ) {
                hashPassword(req.body.password)
                    .then((hashedPassword) => {
                        db
                            .saveUser(
                                req.body.first,
                                req.body.last,
                                req.body.email,
                                hashedPassword
                            )
                            .then((result) => {
                                req.session.user = {
                                    first: req.body.first,
                                    last: req.body.last,
                                    email: req.body.email,
                                    id: result.rows[0].id,
                                    bio: result.rows[0].bio,
                                    profilepic: result.rows[0].profilepic,
                                    isLoggedIn: true
                                };

                                res.json({
                                    success: true
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.json({
                                    success: false
                                });
                            });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.json({
                            success: false
                        });
                    });
            } else {
                res.json({
                    success: false,
                    errorMsg: "please fill out everything"
                });
            }
        }
    });
});

app.post("/login", function(req, res) {
    if (req.session.user) {
        console.log("problem in login");
        res.sendStatus(500);
        return;
    }

    if (req.body.email && req.body.password) {
        db.getUserInfoByEmail(req.body.email).then((userInfo) => {
            if (userInfo.rows[0]) {
                req.session.user = {
                    id: userInfo.rows[0].id,
                    first: userInfo.rows[0].first,
                    last: userInfo.rows[0].last,
                    email: userInfo.rows[0].email,
                    profilepic: userInfo.rows[0].profilepic,
                    bio: userInfo.rows[0].bio,
                    sex: userInfo.rows[0].sex,
                    isLoggedIn: true
                };

                db
                    .checkPassword(req.body.password, userInfo.rows[0].pass)
                    .then((doesMatch) => {
                        if (doesMatch) {
                            res.json({
                                success: true,
                                user: req.session.user
                            });
                        } else {
                            res.json({
                                success: false,
                                errorMsg: "passwords don't match"
                            });
                        }
                    })
                    .catch((err) => {
                        console.log("error when checking passwords", err);
                    });
            } else {
                res.json({
                    success: false,
                    errorMsg: 'user not found"'
                });
            }
        });
    } else {
        res.json({
            success: false,
            errorMsg: "user must fill out everything"
        });
    }
});

app.post("/updateUserInfo/", function(req, res) {
    let first = req.body.first || req.session.user.first;
    let last = req.body.last || req.session.user.last;
    let email = req.body.email || req.session.user.email;
    let bio = req.body.bio || req.session.user.bio;
    let password = req.body.pass;

    db
        .updateUserInfo(req.session.user.id, first, last, email, bio, password)
        .then((result) => {
            req.session.user = {
                id: result.rows[0].id,
                first: result.rows[0].first,
                last: result.rows[0].last,
                email: result.rows[0].email,
                bio: result.rows[0].bio,
                profilepic: result.rows[0].profilepic,
                sex: result.rows[0].sex
            };

            res.json({ user: req.session.user });
        })
        .catch((err) => {
            console.log("opss.!!!.", err);
        });
});

app.post("/editBio", function(req, res) {
    let id = req.session.user.id || req.session.user.id;
    if (req.body.bio) {
        db
            .updateBio(req.body.bio, id)
            .then((updatedBio) => {
                req.session.user.bio = updatedBio.rows[0].bio;
                res.json({
                    success: true,
                    bio: updatedBio.rows[0].bio
                });
            })
            .catch((err) => {
                console.log("problem when updating bio", err);
            });
    }
});

app.post("/updateProfilepic", uploader.single("file"), s3.upload, function(
    req,
    res
) {
    if (req.file) {
        const imageUrl = config.s3Url + req.file.filename;
        db
            .updateProfilepic(imageUrl, req.session.user.email)
            .then((result) => {
                req.session.user.profilepic = imageUrl;
                res.json({
                    profilepic: imageUrl,
                    images: result.rows[0],
                    success: true
                });
            })
            .catch((err) => {
                console.log("problem with adding to db: ", err);
            });
    }
});

app.get("/checkFriendshipStatus", function(req, res) {
    db
        .checkFriendshipStatus(req.session.user.id, req.query.otherId)
        .then((status) => {
            if (!status.rows[0]) {
                res.json({});
            } else {
                res.json({
                    friendshipStatus: status.rows[0]
                });
            }
        });
});
app.post("/categorySelect", (req, res) => {
    db
        .selectCategory(req.body.marker, req.session.user.id)
        .then((result) => {
            res.json({
                marker: result.rows
            });
        })
        .catch((err) => {
            console.log(`error in selectCategory: ${err}`);
        });
});
app.get("/getMarker", (req, res) => {
    db
        .getMarkerInfo(req.session.user.id)
        .then((result) => {
            for (let i = 0; i < result.rows.length; i++) {
                result.rows[i].created_at = db.formatDate(
                    result.rows[i].created_at
                );
            }
            res.json({
                marker: result.rows
            });
        })
        .catch((err) => {
            console.log(`error in getMarkerInfo: ${err}`);
        });
});
app.get("/getUserMarkers", (req, res) => {
    db
        .getMarkerInfo(req.query.id)
        .then((result) => {
            for (let i = 0; i < result.rows.length; i++) {
                result.rows[i].created_at = db.formatDate(
                    result.rows[i].created_at
                );
            }
            res.json({
                marker: result.rows
            });
        })
        .catch((err) => {
            console.log(`error in getMarkerInfo: ${err}`);
        });
});
app.post("/deletePin", (req, res) => {
    db
        .deletePinDb(req.body.pinId)
        .then((result) => {
            res.json({
                data: result.rows[0]
            });
        })
        .catch((err) => {
            console.log(`error in pic deletePinDb: ${err}`);
        });
});
app.post("/updatePinInfo", (req, res) => {
    console.log(req.body);
    db
        .updateThePin(req.body.pinId, req.body.description, req.body.title)
        .then((result) => {
            console.log(result.rows[0]);
            req.session.markerId = result.rows[0].id;
            res.json({
                marker: result.rows[0]
            });
        })
        .catch((err) => {
            console.log(`error in updatePinInfo: ${err}`);
        });
});
app.post("/insertNewPin", (req, res) => {
    db
        .insertNewPin(
            req.session.user.id,
            req.body.description,
            req.body.title,
            req.body.category,
            req.body.lat,
            req.body.lng,
            req.body.color
        )
        .then((result) => {
            req.session.markerId = result.rows[0].id;
            res.json({
                marker: result.rows[0]
            });
        })
        .catch((err) => {
            console.log(`error in insertMarkerPic: ${err}`);
        });
});
app.post("/PinClick", (req, res) => {
    db
        .getPinClickInfo(req.body.pinId)
        .then((result) => {
            console.log(result.rows[0]);
            result.rows[0].created_at = db.formatDate(
                result.rows[0].created_at
            );
            res.json({
                pinInfo: result.rows[0]
            });
        })
        .catch((err) => {
            console.log(`error in post/PinClick: ${err}`);
        });
});
app.post("/uploadPinPic", uploader.single("file"), s3.upload, function(
    req,
    res
) {
    let url = `${config.s3Url}${req.file.filename}`;

    db
        .saveMarkerImage(url, req.session.markerId)
        .then((result) => {
            res.json({
                success: true,
                url: result.rows[0].url
            });
        })
        .catch((err) => {
            // let pinUrl = "/user.png";
            // db.saveMarkerImage(pinUrl, req.session.markerId).then((result) => {
            //     res.json({
            //         success: true,
            //         url: result.rows[0].url
            //     });
            // });
            console.log(`error in POST/upload: ${err}`);
        });
});

app.post("/updateFriendshipStatus", function(req, res) {
    db
        .updateFriendshipStatus(
            req.session.user.id,
            req.body.id,
            req.body.status
        )
        .then((status) => {
            if (!status.rows[0] && req.body.status == 1) {
                db
                    .sendFriendRequest(
                        req.session.user.id,
                        req.body.id,
                        req.body.status
                    )
                    .then((status) => {
                        res.json({
                            friendshipStatus: status.rows[0]
                        });
                    });
            } else {
                res.json({
                    friendshipStatus: status.rows[0]
                });
            }
        });
});
///////////////////////// search users stuff im adding //////////////////
app.post("/userName", (req, res) => {
    let str = req.body.name;
    db
        .nameOfUser(str)
        .then((result) => {
            res.json({
                data: result.rows
            });
        })
        .catch((err) => {
            console.log(`error in POST/userName: ${err}`);
        });
});
///////////////////////// search users stuff im adding //////////////////
app.get("/getFriendsAndWannabes", function(req, res) {
    db
        .getFriendsAndWannabes(req.session.user.id)
        .then((status) => {
            if (!status.rows) {
                res.json({});
            } else {
                res.json({
                    friends: status.rows
                });
            }
        })
        .catch((err) => {
            console.log("err when getting friends", err);
        });
});

app.get("/logout", function(req, res) {
    req.session = null;
    res.redirect("/welcome");
});

app.get("*", function(req, res) {
    if (req.url == "/welcome" && req.session.user) {
        res.redirect("/");
        return;
    }
    if (!req.session.user) {
        res.redirect("/welcome");
        return;
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("/", function(req, res) {
    // just a normal route
    res.sendStatus(200);
});

server.listen(process.env.PORT || 8080);

let onlineUsers = [];

io.on("connection", function(socket) {
    const session = socket.request.session;

    if (!session.user) {
        socket.disconnect(true);
        return;
    }

    onlineUsers.push({
        socketId: socket.id,
        userId: session.user.id
    });

    let onlineUsersIdAll = onlineUsers.map((onlineUser) => onlineUser.userId);

    db.getUsersByIds(onlineUsersIdAll).then((users) => {
        socket.emit("onlineUsers", users.rows);
    });

    if (
        onlineUsers.filter((user) => {
            return user.userId == session.user.id;
        }).length == 1
    ) {
        let userThatJoined = {
            id: session.user.id,
            first: session.user.first,
            last: session.user.last,
            profilepic: session.user.profilepic
        };
        socket.broadcast.emit("userJoined", userThatJoined);
    }
    socket.on("sharePin", (pinId) => {
        db
            .getPinClickInfo(pinId)
            .then((result) => {
                let shareInfo = {
                    data: result.rows[0],
                    userName: session.user.first
                };
                console.log(shareInfo);
                socket.broadcast.emit("sharePin", shareInfo);
            })
            .catch((err) => {
                console.log(`error in getUserIdByPinId: ${err}`);
            });
        //     console.log(onlineUsers);
        //     let recieverId = onlineUsers.filter((user) => {
        //         if (user.userId == result.rows[0].user_id) {
        //             return user;
        //         }
        //     });
        //     console.log(
        //         "from the socket",
        //         recieverId.socketId,
        //         result.rows[0]
        //     );
        //     io.sockets
        //         .socket(recieverId.socketId)
        //         .emit("getSharedPin", pinId);
        // })
    });
    socket.on("disconnect", function() {
        onlineUsers = onlineUsers.filter((user) => {
            return user.socketId !== socket.id;
        });

        if (!onlineUsers.find((user) => user.userId == session.user.id)) {
            const { id } = session.user;
            io.sockets.emit("userLeft", { id });
        }
    });
    socket.on("thanks", function(data) {});

    socket.emit("welcome", {
        message: "Welome. It is nice to see you"
    });
});
