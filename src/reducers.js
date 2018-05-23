export default function reducer(state = { markersArray: [] }, action) {
    if (action.type == "RECEIVE_FRIENDS_AND_WANNABES") {
        state = Object.assign({}, state, {
            friends: action.friends
        });
    }
    if (action.type == "REMOVE_FRIEND") {
        state = {
            ...state,
            friends: state.friends.map((friend) => {
                if (friend.id == action.id) {
                    return {
                        ...friend,
                        status: 4
                    };
                } else {
                    return friend;
                }
            })
        };
    }
    if (action.type == "ACCEPT_FRIEND") {
        state = {
            ...state,
            friends: state.friends.map((friend) => {
                if (friend.id == action.id) {
                    return {
                        ...friend,
                        status: 3
                    };
                } else {
                    return friend;
                }
            })
        };
    }
    if (action.type == "DENY_FRIEND") {
        state = {
            ...state,
            friends: state.friends.map((friend) => {
                if (friend.id == action.id) {
                    return {
                        ...friend,
                        status: 5
                    };
                } else {
                    return friend;
                }
            })
        };
    }

    if (action.type == "ONLINE_USERS") {
        state = {
            ...state,
            onlineUsers: action.onlineUsers
        };
    }

    if (action.type == "USER_JOINED") {
        state = {
            ...state,
            onlineUsers: [...state.onlineUsers, action.newUser]
        };
    }
    if (action.type == "USER_LEFT") {
        state = {
            ...state,
            onlineUsers: state.onlineUsers.filter((user) => {
                return user.id != action.userId;
            })
        };
    }
    if (action.type == "INSERT_PIN_INFO") {
        state = {
            ...state,
            markersArray: state.markersArray.concat(action.pinInfo)
        };
    }
    if (action.type == "GET_PIN_INFO") {
        state = {
            ...state,
            markersArray: [...action.pinsArray]
        };
    }
    if (action.type == "GET_USER_PIN_INFO") {
        console.log("REDUCER:action in GET_USER_PIN_INFO");
        state = {
            ...state,
            markersArray: [...action.pinsArray]
        };
    }
    if (action.type == "SELECT_CATEGORY") {
        state = {
            ...state,
            markersArray: [...action.pinsArray]
        };
    }
    if (action.type == "DELETE_PIN") {
        state = {
            ...state,
            markersArray: state.markersArray.filter((marker) => {
                return marker.id != action.deletedPinObj.id;
            })
        };
    }
    if (action.type == "UPDATE_PIN") {
        console.log("in the reducer", action.pinInfo);
        state = {
            ...state,
            markersArray: state.markersArray.map((marker) => {
                if (marker.id == action.pinInfo.id) {
                    return {
                        ...marker,
                        title: action.pinInfo.title,
                        description: action.pinInfo.description,
                        url: action.pinInfo.url
                    };
                } else {
                    return marker;
                }
            })
        };
    }
    if (action.type == "SAVE_USER_INFO") {
        state = {
            ...state,
            user: action.user
        };
    }
    if (action.type == "SHARE_PIN") {
        console.log("from the reducer", state, action.pinInfo);
        state = {
            ...state,
            pinInfo: action.pinInfo.data,
            userName: action.pinInfo.userName,
            markersArray: state.markersArray.concat(action.pinInfo.data)
        };
    }

    return state;
}
