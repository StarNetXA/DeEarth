/* Power by.Tianpao
 * 本工具可能会判断失误，但也能为您节省不少时间！
 * DeEarth V2 From StarNet.X
 * Writing in 03.29.2025(latest)
 * ©2024-2025 
*/
import AdmZip from "adm-zip";
import got from "got";
import fs from "fs";
import toml from 'toml';
import path from 'path';
import pMap from "p-map";
import {pino} from 'pino';
import { MultiBar } from "cli-progress";
import ms from 'ms';

export async function DeEarthMain(modspath, movepath) {
    LOGGER.info(`DeEarth V${JSON.parse(fs.readFileSync("./package.json")).version}`)
    const resaddr = fs.readdirSync(modspath)
    LOGGER.info(`获取目录列表，一共${resaddr.length}个jar文件。`)
    const totalBar = multibar.create(resaddr.length, 0, {filename: '总文件数'})
    for (let i = 0; i < resaddr.length; i++) {
        const e = `${modspath}/${resaddr[i]}`
        if (e.endsWith(".jar") && fs.statSync(e).isFile()) { //判断是否以.jar结尾并且是文件
            //console.log(e)
            await DeEarth(e, movepath) //使用DeEarth进行审查mod并移动
            totalBar.increment()
        }
    }
    multibar.stop()
}

export async function DeEarth(modpath, movepath) {
    const zip = new AdmZip(modpath).getEntries();
    //for (let i = 0; i < zip.length; i++) {
        //const e = zip[i]
        try { //Modrinth
            for (let i = 0; i < zip.length; i++){
                const e = zip[i]
            if (e.entryName == "META-INF/mods.toml") { //Forge,NeoForge
                const modid = toml.parse(e.getData().toString('utf-8')).mods[0].modId
                //const body = await got.get(`https://api.modrinth.com/v2/project/${modid}`, { headers: { "User-Agent": "DeEarth" } }).json()
                const body = JSON.parse(await FastGot(`https://api.modrinth.com/v2/project/${modid}`))
                if (body.client_side == "required" && body.server_side == "unsupported") {
                    fs.renameSync(modpath, `${movepath}/${path.basename(modpath)}`)
                }
            } else if (e.entryName == "fabric.mod.json") { //Fabric
                const modid = JSON.parse(e.getData().toString('utf-8')).id
                //const body = await got.get(`https://api.modrinth.com/v2/project/${modid}`, { headers: { "User-Agent": "DeEarth" } }).json()
                const body = JSON.parse(await FastGot(`https://api.modrinth.com/v2/project/${modid}`))
                if (body.client_side == "required" && body.server_side == "unsupported") {
                    fs.renameSync(modpath, `${movepath}/${path.basename(modpath)}`)
                }
            }
        }
        } catch (error) { //从Mixin判断 但是可能为不准确
            for (let i = 0; i < zip.length; i++){
                const e = zip[i]
            try {
                if (!e.entryName.includes("/") && e.entryName.endsWith(".json") && !e.entryName.endsWith("refmap.json") && !e.entryName.endsWith("mod.json")) {
                    LOGGER.info(e.entryName)
                    const resx = JSON.parse(e.getData().toString('utf-8'))
                    if (e.entryName.includes("common.mixins.json")) { //第一步从common mixins文件判断，判断失败后再使用modid.mixins.json进行判断
                        //console.log(resx.mixins)
                        //LOGGER.warn(resx.mixins+"我是傻逼"+typeof resx.mixins)
                         /*if (resx.mixins == null || resx.mixins == "[]" && resx.client !== null || resx.client !== "[]") { //CM的判断if (反正对类型没严格要求，判断一下)
                             fs.renameSync(modpath, `${movepath}/${path.basename(modpath)}`)
                         }*/
                        if(resx.mixins == null || Object.keys(resx.mixins).length == 0){
                            //LOGGER.error(Object.keys(resx.mixins).length+"你好"+modpath+JSON.stringify(resx))
                            //LOGGER.warn("客户端模组第一个"+modpath)
                            fs.renameSync(modpath, `${movepath}/${path.basename(modpath)}`)
                        }
                    } else {
                        //LOGGER.warn(resx.mixins+"我是傻逼第二个"+typeof resx.mixins)
                        //if (resx.client !== null || resx.client !== "[]" && resx.mixins == null || resx.mixins == "[]") { //通过判断mixin来确定是否为客户端模组
                            //fs.renameSync(modpath, `${movepath}/${path.basename(modpath)}`)
                        //}
                        //LOGGER.error(Object.keys(resx.mixins).length+"你好"+modpath+JSON.stringify(resx))
                        if(resx.mixins == null || Object.keys(resx.mixins).length == 0 ){
                            //LOGGER.warn("客户端模组"+modpath)
                            fs.renameSync(modpath, `${movepath}/${path.basename(modpath)}`)
                        }
                    }
                }
            } catch (err) {//避免有傻逼JSON写注释（虽然GSON可以这样 但是这样一点也不人道）
                if(err.errno !==  -4058){
                LOGGER.error(`大天才JSON写注释了估计，模组路径:${modpath}，过滤失败`)
                }
            }
        }
        }
    //}
}

async function FastGot(url) {
    let e=[]
    e.push([url])
    const fastgot = await pMap(e,async(e)=>{
try {
    if(e[0] !== null){ //防止URL为空
        //if(isChinaIpAddress((await got.get("https://4.ipw.cn/")).body)){
    return (await got.get(e[0], { headers: { "User-Agent": "DeEarth" } })).body
        //}else{
    //return (await got.get(`https://mod.mcimirror.top/modrinth/${new URL(e[0]).pathname}`, { headers: { "User-Agent": "DeEarth" } })).body //MCIM源
        //}
    }
} catch (error) {
    if(error.message !== "Response code 404 (Not Found)"){
        LOGGER.error({err:error})
    }else{
        throw new Error(error)
    }
}
    },{
        concurrency:48
    })
    return fastgot[0]
}

const LOGGER = pino({
    level: process.env.LOGLEVEL || 'info',
    transport: process.env.PLAIN_LOG
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:standard',
            singleLine: true,
          },
        },
  })

const multibar = new MultiBar({
    format: ' {bar} | {filename} | {value}/{total}',
    noTTYOutput: true,
    notTTYSchedule: ms('10s'),
  })

function isChinaIpAddress(ipAddress) {
const chinaRegex = /^((?:(?:1(?:0|1|2[0-7]|[3-9][0-9])|2(?:[0-4][0-9]|5[0-5])|[3-9][0-9]{2})\.){3}(?:(?:1(?:0|1|2[0-7]|[3-9][0-9])|2(?:[0-4][0-9]|5[0-5])|[3-9][0-9]{2})))$/;
return chinaRegex.test(ipAddress);
}