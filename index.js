const express = require("express");
const firebase = require("firebase");
const admin = require("firebase-admin");
const multer = require("multer");
const upload = multer();
const cloudinary = require("cloudinary");
const serviceAccount = require("./admin.json");


// Config cloudinary
cloudinary.config({
    cloud_name: "toporasca",
    "api_key": "183668327677982",
    "api_secret": "SaK6ql7evdfxrQmD4S4CpX1bIM4"
})


// Initialize
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://uploadplatform.firebaseio.com"
})

firebase.initializeApp({
    "apiKey": "AIzaSyBMYn9PpUezAt3WG626WbUb5SLAkwQErXg",
    serviceAccount: "admin.json",
    databaseURL: "https://uploadplatform.firebaseio.com"
})


// Init App
const app = express();

const http = require("http").Server(app);

const io = require("socket.io")(http);

// View engine
app.set("view engine", "ejs");

// Static Files
app.use(express.static(__dirname + "/static"));  


// Get /
app.get("/", (req, res) => {
    res.render("signIn.ejs");
})

// Set Users
const users = firebase.database().ref("users");

/*io.on("connection", socket => {
    console.log("Socket connected");

    /*socket.on("data", data => {
        console.log(data);
    })
    socket.emit("data", "Sugi coaiele");

    socket.on("disconnect", () => console.log("Disconencted"));
})*/

io.on("connection", socket => {
    console.log("Socket connected");

    socket.on("signUp", data => {
        // Get Data Body
        const email = data.email;
        const password = data.password;
        const avatar = data.avatar;
        const images = ["dasd"];
        const videos = ["dsad"];

        // Push New User
        let newUser = users.push();

        // Upload Image
        cloudinary.uploader.upload(avatar, (result) => {
            // Get Image URL
            const url = result.url

            // Set New User Object
            newUser.set({ email, password, url, images, videos});

            console.log(url);
        });

        // Create User
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .catch(err => {
            console.log(err.code, err.message);
        });
    })


    // Sign In User
    socket.on("signIn", data => {
        // Get Data Body
        const email = data.email;
        const password = data.password;

        // Auth User
        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(err => {
                console.log(err.code, err.message);
                let data = "Please check again your email/password";
                socket.emit("error", data);
            })

        // Get Signed In User
        firebase.auth().onAuthStateChanged(user => {
            if(user) {
                console.log(user);
                firebase.database().ref("users").on("value", snapshot => {
                    let dataObj = Object.values(snapshot.val());
                    //console.log(dataObj);
                    console.log(email);
                    console.log(dataObj.filter(obj => obj.email === email));
                });
            } else {
                console.log("User is not signed in");
            }
        })

    })


    // Get First Video
    socket.on("firstVideo", data => {
        console.log(data);
    })

    socket.on("disconnect", () => console.log("Disconencted"));
})




// Post
app.post("/welcome", (req, res) => {
    

    


    
    // Render Thanks Page
    /*res.render(("thanks.ejs"), {
        email: "dasdasdasd",
        password: "21312edqw"
    });*/
    res.render("welcome.ejs");

})


app.get("/signUp", (req, res) => {
    res.render("signUp.ejs");
})


// Sample Data
/*firebase.database().ref("/").set({
    username: "test",
    email: "test@gmail.com"
})*/


http.listen(process.env.PORT || 3000, () => console.log("Server is up and running..."));