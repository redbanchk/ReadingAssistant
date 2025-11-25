import nodemailer from 'nodemailer'
import cron from 'node-cron'

const host = process.env.SMTP_HOST || 'smtp.qq.com'
const port = Number(process.env.SMTP_PORT || 465)
const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const to = process.env.REMINDER_TO || user
const from = process.env.REMINDER_FROM || user
const subject = process.env.REMINDER_SUBJECT || '阅读提醒'
const text = process.env.REMINDER_TEXT || '该阅读啦！'
const cronExpr = process.env.REMINDER_CRON || '0 9 * * *'
const timezone = process.env.REMINDER_TIMEZONE || 'Asia/Shanghai'

if (!user || !pass) {
  console.error('缺少SMTP凭据，请设置环境变量 SMTP_USER 与 SMTP_PASS')
  process.exit(1)
}

const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } })

async function verifyConnection() {
  try {
    await transporter.verify()
    console.log('SMTP连接验证成功')
  } catch (e) {
    console.error('SMTP连接验证失败', e.message)
    process.exit(1)
  }
}

async function sendReminder() {
  try {
    await transporter.sendMail({ from, to, subject, text })
    console.log('提醒邮件已发送', new Date().toISOString())
  } catch (e) {
    console.error('发送失败', e.message)
  }
}

async function main() {
  await verifyConnection()
  if (!cron.validate(cronExpr)) {
    console.error('无效的CRON表达式：', cronExpr)
    process.exit(1)
  }
  cron.schedule(cronExpr, sendReminder, { timezone })
  console.log('定时任务已启动', JSON.stringify({ cron: cronExpr, timezone, to, from }))
  if (process.env.SEND_TEST_ON_START === 'true') {
    await sendReminder()
  }
}

main()

