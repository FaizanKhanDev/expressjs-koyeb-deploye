import UserModel from '../../models/auth/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from '../../config/emailConfig.js'
import otpGenerator from 'otp-generator'
import moment from 'moment'

class UserController {
  /* ================== User Registration ================== */
  static userRegistration = async (req, res) => {
    // Get user input
    const { first_name, last_name, email, password, confirm_password } = req.body

    // check if user exists
    const user = await UserModel.findOne({ email: email })

    if (user) {
      // User exists
      res.send({ "status": "failed", "message": "Email already exists" })
    } else {

      if (first_name && last_name && email && password && confirm_password) {
        if (password === confirm_password) {
          try {
            // Encrypt user password
            const salt = await bcrypt.genSalt(10)
            // Hash user password
            const hashPassword = await bcrypt.hash(password, salt)
            // Create user
            const createUser = new UserModel({
              first_name: first_name,
              last_name: last_name,
              email: email,
              password: hashPassword,

            })
            await createUser.save();

            /* ================ Send Verification Email ================ */
            const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
            const expirationTime = moment().add(15, 'minutes');
            createUser.resetOTP = {
              otp: otp,
              expiresAt: expirationTime
            }

            await createUser.save();

            const saved_user = await UserModel.findOne({ email: email })
            let userFullName = saved_user.first_name + " " + saved_user.last_name;

            if (saved_user) {
              /* ================ Verification Email Configuration  ================ */
              let info = await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: saved_user.email,
                subject: 'Email Verification',
                /* ================ Email Template ================ */
                html: `
                  <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                  <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Sound Match</a>
                    </div>
                    <p style="font-size:1.1em">Hi, ${userFullName} </p>
                    <p>Thank you for Joining Sounds Match. Use the following OTP to complete your Sign Up procedures. OTP is valid for 15 minutes</p>
                    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                    <p style="font-size:0.9em;">Regards,<br />Sounds Match</p>
                    <hr style="border:none;border-top:1px solid #eee" />
                    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                      <p>Sounds Match</p>
                    </div>
                  </div>
                </div>
                `,
              });
            }

            res.status(201).send(
              {
                "status": "success",
                "message": "Verification Email Sent Successfully Please Check Your Email"
              }
            )
          } catch (error) {
            console.log(error)
            res.send({ "status": "failed", "message": "Unable to Register" })
          }
        } else {
          res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
        }
      } else {
        res.send({ "status": "failed", "message": "All fields are required" })
      }
    }
  }

  /* ================ Verify User Email ================ */
  static verifyUserEmail = async (req, res) => {
    const { otp, email } = req.body
    console.log(otp);
    try {
      if (!otp || !email) {
        return res.send({ "status": "failed", "message": "Some thing went wrong" })
      }
      const user = await UserModel.findOne({ email: email })
      if (user) {
        if (moment().isBefore(user.resetOTP.expiresAt)) {
          user.is_email_verified = true
          await user.save()
          res.send({ "status": "success", "message": "Email Verified Successfully" })
        } else {
          res.send({ "status": "failed", "message": "OTP Expired" })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }


  /* ================ User Login ================ */
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body
      if (email && password) {
        const user = await UserModel.findOne({ email: email })
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password)
          if ((user.email === email) && isMatch) {
            if (!user.is_email_verified) {
              res.send({ "status": "failed", "message": "Please Verify Your Email First" })
            }

            // Generate JWT Token
            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
            res.send({ "status": "success", "message": "Login Success", "token": token })
          } else {
            res.send({ "status": "failed", "message": "Email or Password is not Valid" })
          }
        } else {
          res.send({ "status": "failed", "message": "You are not a Registered User" })
        }
      } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
      }
    } catch (error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Unable to Login" })
    }
  }

  /* ================ Change User Password ================ */
  static changeUserPassword = async (req, res) => {
    const { password, confirm_password } = req.body
    console.log(password, confirm_password);
    if (password && confirm_password) {
      if (password != confirm_password) {
        res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
      } else {
        const salt = await bcrypt.genSalt(10)
        const newHashPassword = await bcrypt.hash(password, salt)
        await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
        res.send({ "status": "success", "message": "Password changed succesfully" })
      }
    } else {
      res.send({ "status": "failed", "message": "All Fields are Required" })
    }
  }

  static loggedUser = async (req, res) => {
    res.send({ "user": req.user })
  }


  /* ================ Send User Password Reset Email ================ */
  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });
      if (user) {

        // const secret = user._id + process.env.JWT_SECRET_KEY;
        // const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' });
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

        // Set expiration time (15 minutes from now)
        const expirationTime = moment().add(15, 'minutes');

        // Save OTP and expiration time in user document
        user.resetOTP = {
          otp: otp,
          expiresAt: expirationTime
        };

        await user.save();
        let userFullName = user.first_name + " " + user.last_name;

        // const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        // console.log(link);

        /* ======================== Send email ===================== */
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Sounds Match - Password Reset Link",
          /* ========== HTML Message ========== */
          html: `
          <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
          <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
              <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Sound Match</a>
            </div>
            <p style="font-size:1.1em">Hi, ${userFullName} </p>
            <p>Thank you for Joining Sounds Match. Use the following OTP to reset your password  procedures. OTP is valid for 15 minutes</p>
            <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
            <p style="font-size:0.9em;">Regards,<br />Sounds Match</p>
            <hr style="border:none;border-top:1px solid #eee" />
            <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
              <p>Sounds Match</p>
            </div>
          </div>
          </div>
          `
        });
        res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" });
      } else {
        res.send({ "status": "failed", "message": "Email doesn't exist" });
      }
    } else {
      res.send({ "status": "failed", "message": "Email Field is Required" });
    }
  }

  //  ========== User Password Reset OTP Verify ==========
  static userPasswordResetOTPVerify = async (req, res) => {
    const { otp, email } = req.body
    const user = await UserModel.findOne({ email: email })
    try {
      if (!user) {
        res.send({ "status": "failed", "message": "Email doesn't exist" })
      }
      const token = user.resetOTP.otp
      /* ================== Generate JWT ==================== */
      let jwtToken = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
      if (otp) {
        if (token === otp) {
          if (moment().isBefore(user.resetOTP.expiresAt)) {
            res.send({
              "status": "success", "message": "OTP Verified Successfully",
              token: jwtToken
            })
          } else {
            res.send({ "status": "failed", "message": "OTP Expired" })
          }
        } else {
          res.send({ "status": "failed", "message": "Invalid OTP" })
        }
      } else {
        res.send({ "status": "failed", "message": "OTP Field is Required" })
      }
    } catch (error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Unauthorized User" })
    }
  }


  /* ================ User Password Reset ================ */
  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body
    const { id, token, otp } = req.params
    const user = await UserModel.findById(id)
    const new_secret = user._id + process.env.JWT_SECRET_KEY
    try {
      jwt.verify(token, new_secret)
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
        } else {
          const salt = await bcrypt.genSalt(10)
          const newHashPassword = await bcrypt.hash(password, salt)
          await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
          res.send({ "status": "success", "message": "Password Reset Successfully" })
        }
      } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
      }
    } catch (error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Invalid Token" })
    }
  }


  // Profile
  static getProfile = async (req, res) => {
    let { _id } = req.user
    let user = await UserModel.findOne({
      _id: _id
    });


    if (user) {
      res.send({
        message: "User Found",
        success: true,
        data: req.user
      })
    } else {
      res.send({
        message: "User Not Found",
        success: false
      })
    }
  }
}

export default UserController