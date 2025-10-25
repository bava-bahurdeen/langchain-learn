import {Router} from 'express'
import { parseResume } from '../controllers/resumeparse.controller.js'

const router = Router()

router.post('/parse',parseResume)

export default router