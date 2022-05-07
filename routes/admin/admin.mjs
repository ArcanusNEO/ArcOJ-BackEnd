import express from 'express'
const router = express.Router()
import hsc from '../../config/http-status-code.mjs'
import announcement from './announcement.mjs'
import assignment from './assignment.mjs'
import contest from './contest.mjs'
import course from './course.mjs'
import problem from './problem.mjs'
import user from './user.mjs'
import rejudge from './rejudge.mjs'
import advance from './advance-setting.mjs'

router.use('/announcement(s)?', announcement)
router.use('/assignment(s)?', assignment)
router.use('/contest(s)?', contest)
router.use('/course(s)?', course)
router.use('/problem(s)?', problem)
router.use('/u(ser(s)?)?', user)
router.use('/rejudge', rejudge)
router.use('/advance(-setting(s)?)?', advance)

router.get('*', (req, res) => {
  res.sendStatus(hsc.notFound)
})

export default router
