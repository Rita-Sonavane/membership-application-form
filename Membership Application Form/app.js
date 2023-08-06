var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");

mongoose.connect('mongodb://localhost:27017/Membership-Application');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("connection succeeded");
})

var app = express();
app.use(express.static('public'));

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));


// Defined the schema for the "users" collection
var userSchema = new mongoose.Schema({
    fname: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    rpassword: String,
    gender: String,
    address: String,
    phone: String,
    dob: String,
    qualification: String,
    bExperience: String,
    currentOccu: String,
    aIncome: String,
    otp: String,
});

// Create the "users" model based on the schema
var User = mongoose.model('User', userSchema);

app.post('/sign_up', function (req, res) {
    var fname = req.body.fname;
    var email = req.body.email;
    var password = req.body.password;
    var rpassword = req.body.rpassword;
    var gender = req.body.gender;
    var address = req.body.address;
    var phone = req.body.phone;
    var dob = req.body.dob;
    var qualification = req.body.qualification;
    var bExperience = req.body.bExperience;
    var currentOccu = req.body.currentOccu;
    var aIncome = req.body.aIncome;


    this.newUser = new User({
        "fname": fname,
        "email": email,
        "password": password,
        "rpassword": rpassword,
        "gender": gender,
        "address": address,
        "phone": phone,
        "dob": dob,
        "qualification": qualification,
        "bExperience": bExperience,
        "currentOccu": currentOccu,
        "aIncome": aIncome,

    });

    //checking all filleds should not empty
    var checkFillds = req.body.fname || req.body.email || req.body.password || req.body.rpassword || req.body.phone || req.body.gender ||
        req.body.address || req.body.dob || req.body.qualification || req.body.bExperience || req.body.currentOccu || req.body.aIncome;

    var checkEqual = req.body.password === req.body.rpassword;

    if ((!(checkFillds === "") && !(checkEqual === false))) {
        this.newUser.save()
            .then((user) => {
                sendRegisterMail(user);
                console.log("Record inserted Successfully");
            })
            .catch((err) => {
                console.log("err", err);
                if (err.code === 11000 && err.keyPattern && err.keyPattern.email === 1) {
                    return res.status(400).json({ message: "Email address already exists." });
                } else {
                    return res.status(500).json({ message: "Internal Server Error" });
                }
            });

    }
});



//login
app.post("/sign_in", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!User) {
        return res.status(404).send({
            message: "User Not Found !!"
        })
    }
    var checkFilleds = req.body.email || req.body.password;
    if (!(checkFilleds === "")) {
        if (req.body.password !== user.password) {
            return res.status(400).send({
                message: 'Password Is Incorrect !!',
            });
        }
        else {
            return res.redirect('signin_success.html');
        }
    }

});

// Route to get all records from the "users" collection
app.get('/users', function (req, res) {
    // Use the find() method to retrieve all records
    User.find({})
        .exec()
        .then((users) => {
            return res.json(users); // Return the retrieved records as JSON
        })
        .catch((err) => {
            return res.status(500).json({ message: "Internal Server Error" });
        });
});


async function sendRegisterMail(user, callback) {

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'unexoin@gmail.com',
            pass: 'cvyueuxppkrtvqob'
        }
    });

    let mailOptions = {
        from: 'unexoin@gmail.com',
        to: user.email,
        subject: "Hello",
        html:
            `
   <span>Hi, ${user.fname}</span><br>
   <br>
   <span><b>Welcome..!</b></span>
   <br>
   <span>Here's Your Login Credential's</span>
   <br>
   <h4>Email: ${user.email}</h4>
   <h4>Password: ${user.password}</h4>
   <h1>Thank You For Joining With Us</h1>
   `
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });

}



//Forgot Password
app.post('/forgotPassword-form', async (req, res) => {
    var checkFilleds = req.body.email;

    const email = await req.body.email;
    if (!(checkFilleds === "")) {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                // User with the provided email was not found
                return res.status(404).json({ message: "Email not registered." });
            } else {
                sendUpdatePasswordMail(user);
                res.sendFile(__dirname + '/public/enterOTP.html');
                // return res.status(200).json({ message: "Email found. Proceed with password reset." });
            }
        } catch (error) {
            console.error('An error occurred while checking email:', error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }


});



async function sendUpdatePasswordMail(user, callback) {

    this.OTP = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP

    const updatedUser = await User.findByIdAndUpdate(user.id, { otp: this.OTP }, { new: true });

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'unexoin@gmail.com',
            pass: 'cvyueuxppkrtvqob'
        }
    });

    let mailOptions = {
        from: 'unexoin@gmail.com',
        to: user.email,
        subject: "Hello",
        html:
            `
   <span>Hi, ${user.fname}</span><br>
   <br>
   <span><b>Welcome..!</b></span>
   <br>
   <span>Here's Your Login Credential's</span>
   <br>
   <h4>Email: ${user.email}</h4>
   <h4>OTP:${this.OTP}</h4>
   <h4>Password: ${user.password}</h4>
   <h1>Thank You For Joining With Us</h1>
   `
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });

    return updatedUser;
}



//validdate OTP
app.post('/validateOTP', async (req, res) => {
    var checkFilleds = req.body.otp;
    const user = await User.findOne({ otp: req.body.otp });

    if (!User) {
        return res.status(404).send({
            message: "User Not Found !!"
        })
    }

    if (!(checkFilleds === "")) {
        if (req.body.otp !== user.otp) {
            return res.status(400).send({
                message: 'OTP Is Incorrect !!',
            });
        }
        else {
            return res.redirect('signin_success.html');
        }

    }

});


app.get('/', function (req, res) {
    res.set({
        'Access-control-Allow-Origin': '*'
    });
    return res.redirect('index.html');
}).listen(3000)


console.log("server listening at port 3000");