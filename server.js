var express = require("express");
var app = express();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var multer = require('multer'),
  bodyParser = require('body-parser'),
  path = require('path');
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/workinghoursDB");
var fs = require('fs');
var workinghours = require("./model/workinghours.js");
var user = require("./model/user.js");

var dir = './uploads';
var upload = multer({
  storage: multer.diskStorage({

    destination: function (req, file, callback) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, './uploads');
    },
    filename: function (req, file, callback) { callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); }

  }),

  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(/*res.end('Only images are allowed')*/ null, false)
    }
    callback(null, true)
  }
});
app.use(cors());
app.use(express.static('uploads'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
}));

app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, 'shhhhh11111', function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: 'User unauthorized!',
            status: false
          });
        }
      })
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
})

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});

/* login api */
app.post("/login", (req, res) => {
  try {
    if (req.body && req.body.email) {
      user.find({ email: req.body.email }, (err, data) => {
        if (data.length > 0) {
          if (data[0].email == req.body.email) {
            checkUserAndGenerateToken(data[0], req, res);
          } else {
            res.status(400).json({
              errorMessage: 'Username or password is incorrect!',
              status: false
            });
          }

        } else {
          if (data.length == 0) {

            let User = new user({
              email: req.body.email,
              guid: req.body.guid,
            });
            User.save((err, data) => {
              if (err) {
                res.status(400).json({
                  errorMessage: err,
                  status: false
                });
              } else {
                checkUserAndGenerateToken1(data, req, res);
              }
            });

          } else {
            res.status(400).json({
              errorMessage: `UserName ${req.body.email} Already Exist!`,
              status: false
            });
          }
        }
      })
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});

/* register api */
app.post("/register", (req, res) => {
  // var API_KEY = 'c4bccf805a34982c8584f60ef42fcec2-30b9cd6d-280c3169';
  // var DOMAIN = 'sandbox209ba22243b643eaa947b05c2123b056.mailgun.org';
  // // var HOST = 'api.eu.mailgun.net';

  // var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN }); console.log("---data--", mailgun);
  // var MailComposer = require('nodemailer/lib/mail-composer');
  // var url_data = "https://618db613d1675ea607ad4d4f--focused-varahamihira-0307c5.netlify.app/" + req.body.guid;
  // const output = `
  //       <h3>Contact Details</h3>
  //       <p>please verify&nbsp; "<a href='${url_data}'>Click Here!</a>";
  //   `;

  // var mailOptions = {
  //   from: 'Demo.com <user@mail.catwalker.com>',
  //   to: 'shane.jong0223@gmail.com',
  //   subject: `You got message`,
  //   text: 'Here is the message information',
  //   html: output
  // };

  // var mail = new MailComposer(mailOptions);

  // mail.compile().build((err, message) => {

  //   var dataToSend = {
  //     to: 'shane.jong0223@gmail.com',
  //     message: message.toString('ascii')
  //   };
  //   console.log("---dfs--", dataToSend);
  //   mailgun.messages().sendMime(dataToSend, (sendError, body) => {
  //     if (sendError) {
  //       console.log(sendError);
  //       return;
  //     }
  //   });
  // });  
});

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.email, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    } else {
      res.json({
        id: data._id,
        title: 'Login Successfully.',
        token: token,
        status: true,
        data: data,
      });
    }
  });
}

function checkUserAndGenerateToken1(data, req, res) {
  jwt.sign({ user: data.email, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    } else {
      res.json({
        id: data._id,
        title: 'Registered Successfully.',
        token: token,
        status: true,
        data: data
      });
    }
  });
}

app.post("/addworkinghours", (req, res) => {
  try {
    let new_workinghours = new workinghours();
    new_workinghours.user_id = req.user.id;
    new_workinghours.header_label = req.body.header_label;
    new_workinghours.week_hour = req.body.week_hour;
    new_workinghours.save((err, data) => {
      if (err) {
        res.status(400).json({
          errorMessage: err,
          status: false
        });
      } else {
        res.status(200).json({
          data
        });
      }
    });


  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

app.post("/editworkinghours", (req, res) => {
  try {

    if (req.body.id) {
      workinghours.findById(req.body.id, (err, new_workinghours) => {
        new_workinghours.user_id = req.user.id;
        new_workinghours.header_label = req.body.header_label;
        new_workinghours.week_hour = req.body.week_hour;
        new_workinghours.save((err, data) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            res.status(200).json({
              data
            });
          }
        });
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

/* Api to add Product */
app.post("/edit", upload.any(), (req, res) => {
  try {
    if (req.files && req.body && req.body.email) {

      user.findById(req.body.id, (err, new_user) => {

        // if file already exist than remove it
        if (req.files && req.files[0] && req.files[0].filename && new_user.image) {
          var path = `./uploads/${new_user.image}`;
          fs.unlinkSync(path);
        }

        if (req.files && req.files[0] && req.files[0].filename) {
          new_user.image = req.files[0].filename;
        }
        new_user.name = req.body.name;
        new_user.office_email = req.body.office_email;
        new_user.title = req.body.title;
        new_user.mobile = req.body.mobile;
        new_user.phone = req.body.phone;
        new_user.address = req.body.address;
        new_user.facebook = req.body.facebook;
        new_user.whatsapp = req.body.whatsapp;
        new_user.linkedin = req.body.linkedin;
        new_user.twitter = req.body.twitter;
        new_user.save((err, data) => {
          if (err) {
            res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            res.status(200).json({
              status: true,
              title: 'Success'
            });
          }
        });

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


/*Api to get and search product with pagination and search by name*/
app.get("/getdata", (req, res) => {
  user.find((error, data) => {
    if (error) {
      console.log("err1");
      return next(error);
    } else {
      res.status(200).json(data);
    }
  })
})

app.get("/getworkinghours", (req, res) => {
  workinghours.find((error, data) => {
    if (error) {

      return next(error);
    } else {
      res.status(200).json(data);
    }
  })
})

app.listen(2000, () => {
  console.log("Server is Runing On port 2000");
});
