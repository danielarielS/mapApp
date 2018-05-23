import * as io from "socket.io-client";
import { onlineUsers, userJoined, userLeft, newPinToView } from "./actions";

let socket;

export function init(store) {
    if (!socket) {
        socket = io.connect();
        socket.on("onlineUsers", function(data) {
            store.dispatch(onlineUsers(data));
        });
        socket.on("userJoined", function(data) {
            console.log("socket data", data);
            store.dispatch(userJoined(data));
        });
        socket.on("userLeft", function(data) {
            console.log("data inside socket", data);
            store.dispatch(userLeft(data));
        });

        //********PART 9***********
        socket.on("chatMessage", function(data) {
            store.dispatch(chatMessage(data));
        }); //the reducer returns the old array plus the latest one
        socket.on("mostRecentTenMessages", (data) => {
            store.dispatch(mostRecentTenMessages(data));
        }); //this happens when user comes online
        socket.on("sharePin", (pinInfo) => {
            console.log("in socket", pinInfo);
            store.dispatch(newPinToView(pinInfo));
        });
    }
    return socket;
}

export function emit(eventName, data) {
    socket.emit(eventName, data);
}
