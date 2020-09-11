const express = require("express")
const bodyParser = require("body-parser")
const validator = require("validator")
const https = require("https")

const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/iCrowdTaskDB", { useNewUrlParser: true })

//New schema
const accountSchema = new mongoose.Schema(
    {
        _country: {
            type: String,
            required: [true, 'Country required']
        },

        _firstname: {
            type: String,
            required: [true, 'First name required']
        },

        _lastname: {
            type: String,
            required: [true, 'Last name required']
        },
        _email: {
            type: String,
            required: [true, 'E-Mail required'],
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) { throw new Error('The email is not valid!') }
            },
            _password: {
                type: String,
                required: [true, 'Password required'],
                min: [8, 'Must be at least 8 characters'],

            },
            _confirmpassword: {
                type: String,
                required: [true, 'Re-enter the password'],
                min: [8, 'Must be at least 8 characters'],
                validate:{
                    validator: function (v){
                        return v != accountSchema._password
                    },
                    message: 'Password entered do not match'
                }

            },
            _address: {
                type: String,
                required: [true, 'Address required'],
            },
            _city: {
                type: String,
                required: [true, 'City required'],
            },
            _state: {
                type: String,
                required: [true, 'State required'],
            },
            _zip: {
                type: String,
            },
            _phone: {
                type: Number,
                validate(value) {
                    if (!validator.isMobilePhone(value)) { throw new Error('The Phone number is not valid!') }
                },
            }
        }
    }
)

const Account = mongoose.model('Account', accountSchema)

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.post('/', (req, res) => {
    const country = req.body.country
    const firstname = req.body.first_name
    const lastname = req.body.last_name
    const email = req.body.email
    const password = req.body.password
    const confirmpassword = req.body.confirmpassword
    const address = req.body.address
    const address2 = req.body.address2
    const city = req.body.city
    const state = req.body.state
    const zip = req.body.zip
    const phone = req.body.phone
    

    const account = new Account(
        {
            _country: country,
            _firstname: firstname,
            _lastname: lastname,
            _email: email,
            _password: password,
            _address: address,
            _address2: address2,
            _city: city,
            _state: state,
            _zip: zip,
            _phone: phone

        }
    )
    account.save((err) => {
        if (err) { console.log(err) }
        else { console.log("Inserted successfully") }
    })

    //console.log(country, firstname, lastname, email, password, confirmpassword, address, address2, city, state, zip, phone)
    const apiKey = "5a0589ffd1e4153e344c1b61b9fceda9-us2"
    //const list_id="625c9ddf31"
    const data = {
        members:[{
            email_address: email,
            status : "subscribed",
            merge_fields:{
                FNAME: firstname,
                LNAME: lastname
            }

        }]
    }
    jsonData = JSON.stringify(data)

    const url="https://us2.api.mailchimp.com/3.0/lists/625c9ddf31"
    const options={
        method:"POST",
        auth:"azi:5a0589ffd1e4153e344c1b61b9fceda9-us2"
    }

    const request = https.request(url, options, (response)=>{

        response.on("data", (data)=>{
            console.log(JSON.parse(data))
        })

    })

    request.write(jsonData)
    request.end()
    console.log(firstname, lastname, email)
})

app.listen(8080, function (request, response) {
    console.log("Server is running on port 8080")
})