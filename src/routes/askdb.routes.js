import {Router} from 'express'
import { askDatabase } from '../controllers/askdb.controller.js'

const router = Router()

router.post('/askdb',askDatabase)
export default router