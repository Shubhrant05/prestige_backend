import User from '../models/user-model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Listing from '../models/listing-model.js';
dotenv.config();

export const signupController = async (req, res) => {
  let userData = req.body;
  console.debug("User data on Signup : ", userData);

  if (userData.password === '' || userData.email === '' || userData.name === '') {
    return res.status(400).json('Please fill up the details');
  }
  if (userData.email.includes('@') === false) {
    return res.status(400).json('Please enter a valid email');
  }
  if (userData.password !== userData.confirmPassword) {
    return res.status(400).json('Confirm password and password are not matching');
  }
  if (userData.password.length < 6) {
    return res.status(400).json('Password should be atleast 6 characters long');
  }

  let hashedPassword = await bcryptjs.hash(userData.password, 10);
  let newUser = new User({
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: hashedPassword
  });

  await newUser.save().then(() => {
    console.log('User created');
    res.status(200).json('Signup Successfull');
  }).catch((err) => {
    console.log('Error while creating user', err);
    res.status(500).json('[SERVER ERROR] Error while creating user:' + err);
  });

};

export const signinController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser)
      return res.status(404).json('User not found!');

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword)
      return res.status(401).json('Wrong Credentials!')

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    rest.access_token = token;
    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    res.status(500).json("[SERVER ERROR] : Error while signing in user " + error);
  }
};

export const googleController = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      rest.access_token = token;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      let newUser = new User({
        name: req.body.name.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      rest.access_token = token;
      res
        .status(200)
        .json(rest);
    }
  } catch (error) {
    res.status(500).json("[SERVER ERROR] : Error while signing in user with GOOGLE " + error);
  }
};

export const updateUserController = async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json('Please sign-in to update your account.');
  }

  if (req.body.password) {
    req.body.password = await bcryptjs.hashSync(req.body.password, 10);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    res.status(500).json("[SERVER ERROR] : Error while updating user " + error);
  }
};

export const deleteUserController = async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json('Please sign-in to delete your account.');
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User deleted successfully');
  } catch (error) {
    res.status(500).json("[SERVER ERROR] : Error while deleting user " + error);
  } 
};

export const signOutController = async (req, res) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User signed out successfully'); 
  } catch (error) {
    res.status(500).json("[SERVER ERROR] : Error while signing out user " + error);
  }
};

export const getListingsController = async (req, res) => {
  if(req.user.id !== req.params.id){
    return res.status(403).json('Please sign-in to view your listings.');
  }
  else{
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      res.status(500).json("[SERVER ERROR] : Error while fetching listings " + error);
    }
  }
};

export const getUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);
  
    if (!user) return next(errorHandler(404, 'User not found!'));
  
    const { password: pass, ...rest } = user._doc;
  
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};