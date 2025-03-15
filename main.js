//本工具由StarNet.X Tianpao编写 https://starnetx.top
//请勿滥用 
//温馨提醒：学习禁毒知识不能靠机器刷 看视频认真学认真答题才是学习禁毒知识！
import {chromium} from "playwright"
import got from "got"
const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0"
//设置年级
const grade = "%E5%85%AB%E5%B9%B4%E7%BA%A7"
//七年级为%E4%B8%83%E5%B9%B4%E7%BA%A7
//八年级为%E5%85%AB%E5%B9%B4%E7%BA%A7
//九年级为%E4%B9%9D%E5%B9%B4%E7%BA%A7

const main = async () => {
   
    const browser = await chromium.launch(({ headless: false }))

    const page = await browser.newPage();

////登录步骤
    await page.goto('https://www.2-class.com/')
    await page.reload();
    const loginbutton = page.locator('button[type="button"][class="ant-btn ant-btn-primary"][style="width: 192px;"]');
    await loginbutton.waitFor({ state: 'visible' });
    await loginbutton.click();

    //账号输入
    const input = page.locator('input[type="text"][placeholder="请输入登录账号"][id="account"][class="ant-input ant-input-lg"]');
    await input.waitFor({ state: 'visible' });
    await input.fill('qinyuhao2603');
    //密码输入
    const pwinput = page.locator('input[type="password"][placeholder="请输入密码"][id="password"][class="ant-input ant-input-lg"]');
    await pwinput.waitFor({ state: 'visible' });
    await pwinput.fill('63711751');
    //登录
    const gobutton = page.locator('button[type="submit"][class="ant-btn submit-btn ant-btn-primary"] span >> text="确 定"');
    await gobutton.waitFor({ state: 'visible' });
    await gobutton.click();

    const cookies = await page.context().cookies(page.url())
    //解析cookie
    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    console.log(cookies)
    console.log(cookieString)
////登录步骤

//////Got获取课堂内容+内容解析
const classinfo =  await got(`https://gw.2-class.com/ws/c/content/course/homepage/list?grade=${grade}&pageSize=24&pageNo=1`, {
    headers: {
        "User-Agent": ua
      },
})
const cijson = JSON.parse(classinfo.body);
for(let i =0;i < cijson.data.list.length;i++){ //获取年级课堂
console.log(cijson.data.list[i].courseId)
//获取课堂题目
const plinfo = await got(`https://www.2-class.com/api/exam/getTestPaperList?courseId=${cijson.data.list[i].courseId}`, {
    headers: {
        "User-Agent": ua,
        'Cookie': cookieString
      },
})
const pljson = JSON.parse(plinfo.body)
if (!pljson.data.testPaperList == null){
    return;
}
console.log(pljson)
for(let i = 0;i < pljson.data.testPaperList.length;i++){
    console.log(pljson.data.testPaperList[i].title)
    console.log(pljson.data.testPaperList[i].examContent)
}

}



////AI获取答案


    page.screenshot({
    path: 'image.png' })
}

main()




//////FASTLIB
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }