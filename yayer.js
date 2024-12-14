import fs from 'fs'
import express from 'express'
import {CronJob} from 'cron'

const app = express()
const port = 3000

let combinedData

async function loadData() {
    const file1Data = JSON.parse(fs.readFileSync('./files/database1.json', 'utf8'))
    combinedData = file1Data['data']['get_execution']['execution_succeeded']['data']
}

await loadData()

app.listen(port, () => {
    console.log(`API server is running on port ${port}`);
})

app.get('/api/data', (req, res) => {
    let walletInfo = {}
    let data = combinedData.filter(item => item.ua === req.query.wallet.toLowerCase())
    if (data.length) {
        let chains = data[0].cc.split(' / ')
        let actives = data[0].dwm.split(' / ')
        walletInfo.wallet = data[0].ua
        walletInfo.rank = data[0].rk
        walletInfo.tx_count = data[0].tc
        walletInfo.volume = data[0].amt
        walletInfo.source_chain = chains[0]
        walletInfo.dest_chain = chains[1]
        walletInfo.contracts = chains[2]
        walletInfo.days = actives[0]
        walletInfo.weeks = actives[1]
        walletInfo.month = actives[2]
        walletInfo.first_tx = Date.parse(data[0].ibt)
        walletInfo.last_tx = Date.parse(data[0].lbt)
    }
    res.json(walletInfo)
})


const job = new CronJob('10 0 * * *', () => loadData(), null, true, 'UTC')
job.start()