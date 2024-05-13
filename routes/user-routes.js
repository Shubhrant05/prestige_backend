import express from 'express'
import {signupController, signinController, googleController, updateUserController, deleteUserController, signOutController, getListingsController, getUser} from '../controllers/user-controllers.js'
import {verifyUser} from '../verifyUser.js'
const router = express.Router()

router.post('/signup', signupController)
router.post('/signin', signinController)
router.post('/google', googleController)
router.get('/signout', signOutController)

router.post('/update/:id', verifyUser, updateUserController)
router.delete('/delete/:id', verifyUser, deleteUserController)
router.post('/get-listings/:id', verifyUser, getListingsController)
router.post('/:id', verifyUser, getUser)
export default router