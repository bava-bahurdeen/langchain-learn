import {Router} from 'express'
import { embedData } from '../controllers/ragchat.controller.js'

const router = Router()

router.post('/',embedData)

export default router