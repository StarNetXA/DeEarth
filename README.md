# DeEarth
## 来源
此开源项目可以让你筛选掉部分Minecraft客户端模组
至于为什么要删除，因为大部分模组都未对Minecraft环境做检测，导致某些应作用在客户端的mixins作用在了服务器上，导致了服务器的崩溃，所以诞生了此项目。

## 如何使用？
```javascript
import { DeEarthMain } from "main.js";
await DeEarthMain(模组文件夹路径,移动后的文件夹路径)
```

## 处理优先级
1.Mondrinth
2.DeEarthPublic
3.MODINFO
4.MIXININFO

©2023-2025 StarNet.X
