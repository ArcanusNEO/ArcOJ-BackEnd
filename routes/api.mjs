import express from 'express'
const router = express.Router()
import hsc from '../config/http-status-code.mjs'
import admin from './admin/admin.mjs'
import announcement from './announcement.mjs'
import assignment from './assignment.mjs'
import contest from './contest.mjs'
import exam from './exam.mjs'
import problemset from './problemset.mjs'
import course from './course.mjs'
import emailCaptcha from './email-captcha.mjs'
import judge from './judge.mjs'
import login from './login.mjs'
import logout from './logout.mjs'
import problem from './problem.mjs'
import reset from './reset.mjs'
import signup from './signup.mjs'
import user from './user.mjs'
import solution from './solution.mjs'
import version from './version.mjs'

router.use('/admin(istrator(s)?)?', admin)
router.use('/announcement(s)?', announcement)
router.use('/assignment(s)?', assignment)
router.use('/contest(s)?', contest)
router.use('/exam(s)?', exam)
router.use('/problemset(s)?', problemset.router)
router.use('/course(s)?', course)
router.use('/email-captcha', emailCaptcha)
router.use('/judge', judge)
router.use('/login', login)
router.use('/logout', logout)
router.use('/problem(s)?', problem)
router.use('/reset', reset)
router.use('/signup', signup)
router.use('/u(ser(s)?)?', user)
router.use('/solution(s)?', solution)
router.use('/version', version)

router.all('*', (req, res) => {
  res.sendStatus(hsc.notFound)
})

export default router
