import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link } from "react-router-dom";
import axios from "./axios";
import { Logo, Login } from "./welcome";
// import { EditBio, ExistingBio } from "./bio";

export class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.pic = this.props.profilepic;
        this.bio = this.props.bio;
        this.toggleEditor = this.toggleEditor.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.saveNewInputValue = this.saveNewInputValue.bind(this);
    }

    toggleEditor() {
        this.setState({
            editorIsVisible: !this.state.editorIsVisible
        });
    }
    inputField(inputValue, state) {
        console.log("lalala", name);
        return <div>I wonder...</div>;
    }
    changeInputValues(inputValues) {
        this.props.changeInputValues(inputValues);
    }
    handleChange(e) {
        this[e.target.name] = e.target.value;
    }
    saveNewInputValue() {
        let inputName = this.first || this.lastname;
        axios
            .post(`/updateUserInfo/`, {
                first: this.first,
                last: this.lastname,
                email: this.email,
                bio: this.bio,
                pass: this.pass
            })
            .then((response) => {
                if (response.data.user) {
                    console.log("response.data.user", response.data.user);
                    this.props.changeInputValues(response.data.user);
                    setTimeout(this.toggleEditor, 300);
                } else {
                    console.log(
                        "response.data in register error ",
                        response.data.errorMsg
                    );
                }
            })
            .catch((err) => {
                console.log("PROBLEM :(", err);
            });
    }
    render() {
        let pic = this.state.profilepic || this.props.profilepic || "/user.png";
        let bio = this.props.bio || "Tell us something about urself!";

        const style = {
            backgroundImage: `url(${pic})`,
            backgroundColor: "purple",
            backgroundSize: "cover"
        };

        const existingValue = (textToShow, propertyKey) => {
            return (
                <div className="profileInputField">
                    <div className="inputPropertyName">{textToShow}</div>
                    <div className="inputPropertyValue">{propertyKey}</div>
                </div>
            );
        };
        const inputField = (textToShow, propertyKey) => {
            return (
                <div className="profileInputField">
                    <div className="inputPropertyName">{textToShow}</div>
                    <div className="inputPropertyValue">
                        <input
                            id="first"
                            onChange={this.handleChange}
                            className="inputField"
                            name="first"
                            defaultValue={propertyKey}
                        />
                    </div>
                </div>
            );
        };

        return (
            <div className="profilePageContainer">
                <div className="profilePageContainerLeft">
                    <p>Welcome, {this.props.first}</p>
                    <div className="profilePicFrame">
                        <div className="profilePicOwn">
                            <div className="profilePicCircle" style={style}>
                                {/*<img src={pic} />*/}
                            </div>
                            <img
                                src="/editWhite.png"
                                className="icons editIcon"
                                onClick={this.props.toggleUploader}
                            />
                        </div>
                    </div>
                </div>
                <div className="profilePageContainerRight">
                    <div className="profileInfoContainer">
                        {(this.state.editorIsVisible && (
                            <div className="editingValues">
                                {inputField("Firstname", this.props.first)}
                                {inputField("Lastname", this.props.last)}
                                {inputField("Email", this.props.email)}
                                <div className="profileInputField">
                                    <div className="inputPropertyName">
                                        {" "}
                                        Password{" "}
                                    </div>
                                    <div className="inputPropertyValue">
                                        <input
                                            id="pass"
                                            onChange={this.handleChange}
                                            className="inputField"
                                            name="pass"
                                            placeholder="*******"
                                        />
                                    </div>
                                </div>
                                <div className="profileInputField">
                                    <div className="inputPropertyName">
                                        {" "}
                                        Bio{" "}
                                    </div>
                                    <div className="inputPropertyValue">
                                        <textarea
                                            id="bio"
                                            onChange={this.handleChange}
                                            className="inputField editBioTextArea"
                                            name="bio"
                                            defaultValue={bio}
                                        />
                                    </div>
                                </div>
                                <div className="editButtons">
                                    <button
                                        className="subtleButton"
                                        onClick={this.saveNewInputValue}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="subtleButton"
                                        onClick={this.toggleEditor}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )) || (
                            <div className="existingValues">
                                {existingValue("Firstname", this.props.first)}
                                {existingValue("Lastname", this.props.last)}
                                {existingValue("Email", this.props.email)}
                                {existingValue("Password", "*******")}
                                <div className="profileInputField">
                                    <div className="inputPropertyName">Bio</div>
                                    <div
                                        className="inputPropertyValue"
                                        style={{
                                            width: 130 + "px",
                                            paddingBottom: 20 + "px"
                                        }}
                                    >
                                        {bio}
                                    </div>
                                </div>
                                <button
                                    className="subtleButton"
                                    onClick={this.toggleEditor}
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export function ProfilePic(props) {
    let pic = props.profilepic;
    function toggleUploader() {
        props.toggleUploader();
    }
    if (!pic) {
        pic = "/user.png";
    }
    return <img src={pic} className="userImage" onClick={toggleUploader} />;
}

export function UploadProfilePic(props) {
    console.log("props in upload Profile pic", props);
    let pic = props.profilepic;
    let file;

    function getFile(e) {
        file = e.target.files[0];
    }

    function upload() {
        var formData = new FormData();
        var app = this;
        formData.append("file", file);
        axios.post("/updateProfilepic", formData).then((response) => {
            console.log("response: ", response);
            if (response.data.success) {
                props.changeImage(response.data.profilepic);
                console.log("response.data :D", response.data);
                props.toggleUploader();
            }
        });
    }
    function closePopUp() {
        props.hideUploader();
        props.toggleUploader();
    }
    if (!pic) {
        pic = "/user.png";
    }
    return (
        <div className="uploader">
            <div className="centerText"> Change profile picture </div>
            <input type="file" className="inputButton " onChange={getFile} />
            <div className="profileInfoButtons">
                <button type="button" className="subtleButton" onClick={upload}>
                    {" "}
                    Upload{" "}
                </button>
                <button
                    type="button"
                    className="subtleButton"
                    onClick={closePopUp}
                >
                    {" "}
                    Cancel{" "}
                </button>
            </div>
        </div>
    );
}
