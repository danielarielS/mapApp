import React from "react";
import ReactDOM from "react-dom";
import axios from "./axios";

// statuses:
// 0-no relationship
// 1-friend request sent
// 2-friend request cancelled
// 3-friendship
// 4-removed friend
// 5-deny friend
export class FriendButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "Friend Button"
        };
        this.changeStatus = this.changeStatus.bind(this);
        this.setTextStatus = this.setTextStatus.bind(this);
    }

    setTextStatus(text) {
        this.setState({
            text: text
        });
    }

    componentDidMount() {
        axios
            .get("/checkFriendshipStatus?otherId=" + this.props.otherId)
            .then((response) => {
                console.log("response", response.data.friendshipStatus == null);

                if (!response.data.friendshipStatus) {
                    this.setTextStatus("Add Friend");
                    console.log("No status exists yet ", response.data);
                } else if (response.data.friendshipStatus.status == 1) {
                    if (
                        response.data.friendshipStatus.receiver_id ==
                        this.props.otherId
                    ) {
                        this.setTextStatus("Cancel Request");
                    } else {
                        this.setTextStatus("Accept Friend Request");
                    }
                } else if (response.data.friendshipStatus.status == 2) {
                    this.setTextStatus("Add Friend");
                } else if (response.data.friendshipStatus.status == 3) {
                    this.setTextStatus("Remove Friend");
                } else if (response.data.friendshipStatus.status == 4) {
                    this.setTextStatus("Add Friend");
                } else if (response.data.friendshipStatus.status == 5) {
                    this.setTextStatus("Add Friend");
                }
            })
            .catch((err) => {
                console.log("err when getting status");
            });
    }

    changeStatus() {
        var buttonText = this.state.text;
        console.log("buttonText:", buttonText);
        if (buttonText == "Add Friend") {
            axios
                .post("/updateFriendshipStatus", {
                    id: this.props.otherId,
                    status: 1
                })
                .then((response) => {
                    console.log(
                        "Friend request sent. friendshipStatus:",
                        response.data.friendshipStatus
                    );
                    this.setTextStatus("Cancel Request");
                })
                .catch((err) => {
                    console.log("err when sending friend request");
                });
        } else if (this.state.text == "Cancel Request") {
            console.log("Cancelling friend request");
            axios
                .post("/updateFriendshipStatus", {
                    id: this.props.otherId,
                    status: 2
                })
                .then((response) => {
                    console.log(
                        "Cancelled friend request.",
                        response.data.friendshipStatus
                    );
                    this.setTextStatus("Add Friend");
                })
                .catch((err) => {
                    console.log("err when cancelling friend req");
                });
        } else if (this.state.text == "Accept Friend Request") {
            axios
                .post("/updateFriendshipStatus", {
                    id: this.props.otherId,
                    status: 3
                })
                .then((response) => {
                    console.log(
                        "Accepted friend request.",
                        response.data.friendshipStatus
                    );
                    this.setTextStatus("Remove Friend");
                })
                .catch((err) => {
                    console.log("err when accepting friend req");
                });
        } else if (this.state.text == "Remove Friend") {
            axios
                .post("/updateFriendshipStatus", {
                    id: this.props.otherId,
                    status: 4
                })
                .then((response) => {
                    console.log(
                        "Removed friend.",
                        response.data.friendshipStatus
                    );
                    this.setTextStatus("Add Friend");
                })
                .catch((err) => {
                    console.log("err when removing friend");
                });
        } else {
            console.log("none of the above happened! problem?");
        }
    }

    render() {
        return (
            <button className="FriendButton pinAppButton" onClick={this.changeStatus}>
                {" "}
                {this.state.text}
            </button>
        );
    }
}
