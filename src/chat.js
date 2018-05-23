import React from "react";
import ReactDOM from "react-dom";
import axios from "./axios";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

class Chat extends React.Component {
    componentDidMount() {
        console.log("chat m,ounted");
    }

    render() {
        // console.log('exist, pending...', pendingFriends, existingFriends);
        return (
            <div className="chatComponent">
                <h1> Welcome to chat </h1>
                <div className="chatBox">
                    <h3>it's a great day!</h3>
                    <p>
                        {" "}
                        just go in the sun with the person next to you and chat
                    </p>
                </div>
                <div className="newChat">
                    <textarea
                        name="chat"
                        onChange={this.handleChange}
                        className="ChatNewTextArea"
                        defaultValue={this.props.bio}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = function(state) {
    // console.log('state!!!',state.friends);
    return {
        // friends: state.friends && state.friends.filter(friends => friends),
        // existingFriends:
        //     state.friends &&
        //     state.friends.filter(friends => friends.status == 3),
        // pendingFriends:
        //     state.friends &&
        //     state.friends.filter(friends => friends.status == 1)
    };
};

export default connect(mapStateToProps)(Chat);
