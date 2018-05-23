export default class Uploader extends React.Component {
    constructor(props) {
        super(props),
        this.state = {},
        this.cancelUpload = this.cancelUpload.bind(this);
        this.compileData = this.compileData.bind(this);
        this.sendData = this.sendData.bind(this);
    }
    toggleImgBtn() {
        this.setState({
            isFileReader: true
        });
    }
    cancelUpload() {
        this.setState({
            dataUrl: null,
            isFileReader: false
        });
    }
    compileData(e) {
        this.setState({
            file: e.target.files[0]
        });
        let selectedImg = new FileReader();
        selectedImg.readAsDataURL(e.target.files[0]);
        selectedImg.addEventListener('load', () => {
            this.setState({ dataUrl: selectedImg.result });
            this.toggleImgBtn();
        });
    }
    async sendData() {
        const formData = new FormData;
        formData.append('file', this.state.file);
        try {
            const resp = await axios.post('/upload.json', formData);
            if (resp.data.success) {
                this.props.setImg(resp.data.result);
                this.props.closeUploader();
            } else {
                this.setState({ error: 'Something went wrong.' });
            }
        } catch (err) {
            console.log(err);
            this.setState({ error: 'Something went wrong.' });
        }
    }
    render() {
        return (
            <section onClick={this.props.closeUploader} style={style.frame}>
                <input id="fileInput" type="file" name="upload" onChange={this.compileData} style={style.hiddenInput} onClick={e => e.stopPropagation()} />
                <section onClick={e => e.stopPropagation()} style={style.container}>
                    <section style={style.imgContainer}>
                        {this.state.isFileReader ? <h2 style={style.h2}>New Profile Pic ?</h2>
                                                 : <h2 style={style.h2}>Hello {this.props.first} !</h2>}
                        <div style={style.imgBackground}>
                            <img src={this.state.dataUrl || this.props.img_url || 'https://image.freepik.com/icones-gratis/esboco-perfil-de-usuarios_318-39758.jpg'} style={style.img} />
                        </div>
                        {this.state.isFileReader ? <div style={style.imgBtns}>
                                                        <button onClick={this.cancelUpload} style={style.imgBtn}>Cancel</button>
                                                        <button onClick={this.sendData} style={style.imgBtn}>Submit</button>
                                                   </div>
                                                 : <label htmlFor="fileInput" style={style.inputLabel}>Change Profile Pic</label>}
                    </section>
                    <article style={style.inputContainer}>
                        <h2 style={style.h2}>. Your Profile</h2>
                        <article style={style.userInfo}>
                            <span style={style.info}>Name</span>
                            <div>
                                <p style={style.infoLine}><span style={style.infoLine}>{this.props.first}</span> <span style={style.infoLine}>{this.props.last}</span></p>
                            </div>
                            <span onClick={this.props.openAbout} style={style.infoEdit}>&#9998;</span>
                            <span style={style.info}>Contact</span>
                            <span style={style.infoLine}>{this.props.contact}</span>
                            <span onClick={this.props.openAbout} style={style.infoEdit}>&#9998;</span>
                            <span style={style.info}>Birthday</span>
                            <span style={style.infoLine}>{this.props.birth}</span>
                            <span onClick={this.props.openAbout} style={style.infoEdit}>&#9998;</span>
                            <span style={style.info}>Gender</span>
                            <span style={style.infoLine}>{this.props.gender}</span>
                            <span onClick={this.props.openAbout} style={style.infoEdit}>&#9998;</span>
                            <span style={style.info}>Bio</span>
                            <p style={style.infoLine}>{this.props.bio}</p>
                            <span onClick={this.props.openAbout} style={style.infoEdit}>&#9998;</span>
                        </article>
                        <button onClick={this.props.closeUploader} style={style.submitButton}>Submit</button>
                    </article>
                </section>
            </section>
        )
    }
}
