/* Power by.Tianpao
 * 本工具可能会判断失误，但也能为您节省不少时间！
 * DeEarth V2 From StarNet.X
 * Writing in 03.15.2025(latest)
 * ©2024-2025 
*/
import AdmZip from "adm-zip";
import got from "got";
import fs from "fs";
import toml from 'toml'
import path from 'path'
import pMap from "p-map";

export async function DeEarthMain(modspath, movepath) {
    const resaddr = fs.readdirSync(modspath)
    for (let i = 0; i < resaddr.length; i++) {
        const e = `${modspath}/${resaddr[i]}`
        if (e.endsWith(".jar") && fs.statSync(e).isFile()) { //判断是否以.jar结尾并且是文件
            //console.log(e)
            await DeEarth(e, movepath) //使用DeEarth进行审查mod并移动
        }
    }
}

export async function DeEarth(modpath, movepath) {
    const zip = new AdmZip(modpath).getEntries();
    for (let i = 0; i < zip.length; i++) {
        const e = zip[i]
        try { //Modrinth
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
        } catch (error) { //从Mixin判断 但是可能为不准确
            try {
                if (!e.entryName.includes("/") && e.entryName.endsWith(".json") && !e.entryName.endsWith(".refmap.json") && !e.entryName.endsWith("mod.json")) {
                    const resx = JSON.parse(e.getData().toString('utf-8'))
                    if (e.entryName.includes("common.mixins.json")) { //第一步从common mixins文件判断，判断失败后再使用modid.mixins.json进行判断
                        if (resx.mixins == null || resx.mixins == "[]" && resx.client !== null || resx.client !== "[]") { //CM的判断if (反正对类型没严格要求，判断一下)
                            fs.renameSync(modpath, `${movepath}/${path.basename(modpath)}`)
                        }
                    } else {
                        if (resx.client !== null || resx.client !== "[]" && resx.mixins == null || resx.mixins == "[]") { //通过判断mixin来确定是否为客户端模组
                            fs.renameSync(modpath, `${movepath}/${path.basename(modpath)}`)
                        }
                    }
                }
            } catch (err) {//避免有傻逼JSON写注释（虽然GSON可以这样 但是这样一点也不人道）
                console.log(`大天才JSON写注释了估计，模组路径:${modpath}，过滤失败`)
            }
        }
    }
}

async function FastGot(url) {
    let e=[]
    e.push([url])
    const fastgot = await pMap(e,async(e)=>{
try {
    console.log(e[0]) //打印测试
    if(e[0] !== null){ //防止
    return (await got.get(e[0], { headers: { "User-Agent": "DeEarth" } })).body
    }
} catch (error) {
    //console.error(error)
}
    },{
        concurrency:32
    })
    return fastgot[0]
}