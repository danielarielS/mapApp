import axios from "./axios";

export async function receiveFriends() {
    const { data } = await axios.get("/getFriendsAndWannabes");

    return {
        type: "RECEIVE_FRIENDS_AND_WANNABES",
        friends: data.friends
    };
}

export async function removeFriend(id) {
    const { data } = await axios.post("updateFriendshipStatus", {
        id: id,
        status: 4
    });
    return {
        type: "REMOVE_FRIEND",
        id: id
    };
}

export async function acceptFriend(id) {
    const { data } = await axios.post("updateFriendshipStatus", {
        id: id,
        status: 3
    });
    return {
        type: "ACCEPT_FRIEND",
        id: id
    };
}
export async function denyFriend(id) {
    const { data } = await axios.post("updateFriendshipStatus", {
        id: id,
        status: 5
    });

    return {
        type: "DENY_FRIEND",
        id: id
    };
}

export async function onlineUsers(array) {
    return {
        type: "ONLINE_USERS",
        onlineUsers: array
    };
    //only send back ones that are not the current user
}
export async function userJoined(user) {
    return {
        type: "USER_JOINED",
        newUser: user
    };
}

export async function userLeft(user) {
    return {
        type: "USER_LEFT",
        userId: user.id
    };
}

// *********** ADD NEW PIN *********** //

export function updatePinInfo(info) {
    return axios
        .post("/updatePinInfo", info.pinInfo)
        .then((response) => {
            let pinInfo = response.data;
            if (!info.formData) {
                return {
                    type: "UPDATE_PIN",
                    pinInfo: pinInfo.marker
                };
            }
            return axios
                .post("/uploadPinPic", info.formData)
                .then((resp) => {
                    pinInfo.marker.url = resp.data.url;
                    return {
                        type: "UPDATE_PIN",
                        pinInfo: pinInfo.marker
                    };
                })
                .catch((err) => {
                    pinInfo.marker.url = "/user.png";
                    return {
                        type: "UPDATE_PIN",
                        pinInfo: pinInfo.marker
                    };
                    console.log(`error in pic uploadPinPic: ${err}`);
                });
        })
        .catch(function(err) {
            console.log("there was an error in updatePinInfo", err);
        });
}
export function insertPinInfo(info) {
    return axios
        .post("/insertNewPin", info.pinInfo)
        .then((response) => {
            let pinInfo = response.data;

            return axios
                .post("/uploadPinPic", info.formData)
                .then((resp) => {
                    pinInfo.marker.url = resp.data.url;
                    return {
                        type: "INSERT_PIN_INFO",
                        pinInfo: pinInfo.marker
                    };
                })
                .catch((err) => {
                    pinInfo.marker.url = "/user.png";
                    return {
                        type: "INSERT_PIN_INFO",
                        pinInfo: pinInfo.marker
                    };
                    console.log(`error in pic uploadPinPic: ${err}`);
                });
        })
        .catch(function(err) {
            console.log("there was an error in insertNewPin", err);
        });
}
export function getPinInfo() {
    return axios
        .get("/getMarker")
        .then((response) => {
            return {
                type: "GET_PIN_INFO",
                pinsArray: response.data.marker
            };
        })
        .catch((err) => {
            console.log(`error in pic getPinInfo: ${err}`);
        });
}
export function getAllPins() {
    return axios
        .get("/getAllPins")
        .then((response) => {
            return {
                type: "GET_PIN_INFO",
                pinsArray: response.data.pinInfo
            };
        })
        .catch((err) => {
            console.log(`error in pic getPinInfo: ${err}`);
        });
}
export function getUserPinInfo(id) {
    return axios
        .get(`/getUserMarkers`, { params: { id } })
        .then((response) => {
            return {
                type: "GET_USER_PIN_INFO",
                pinsArray: response.data.marker
            };
        })
        .catch((err) => {
            console.log(`error in pic getPinInfo: ${err}`);
        });
}

export function selectActionBycategory(categories, pinsArray) {
    if (categories.length == 0) {
        return {
            type: "SELECT_CATEGORY",
            pinsArray: pinsArray
        };
    } else {
        pinsArray = pinsArray.filter((item) => {
            for (let i = 0; i < categories.length; i++) {
                if (categories[i] == item.category) {
                    return item;
                }
            }
        });

        return {
            type: "SELECT_CATEGORY",
            pinsArray: pinsArray
        };
    }
}
export function deletePin(pinId) {
    return axios
        .post("/deletePin", { pinId })
        .then((response) => {
            return {
                type: "DELETE_PIN",
                deletedPinObj: response.data.data
            };
        })
        .catch((err) => {
            console.log(`error in pic deletePin: ${err}`);
        });
}
export function saveUserInfo(userInfo) {
    return {
        type: "SAVE_USER_INFO",
        user: userInfo
    };
}
export function newPinToView(pinInfo) {
    return {
        type: "SHARE_PIN",
        pinInfo: pinInfo
    };
}
