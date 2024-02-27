
tvbox 网络上有许多源。然后直播源无法判断其质量。
即便是有可用的源，说不定ipv4地址限制了运营商访问。
例如有的源只允许中国移动ip访问。如果一个个测试的话，心理负担极大

于是有了此项目：自动测试链接可用性并生成新的直播源


[https://raw.githubusercontent.com/zwc456baby/iptv_alive/master/live.txt](https://raw.githubusercontent.com/zwc456baby/iptv_alive/master/live.txt)：经过筛选后可用的直播源

> 每天凌晨自动筛选并提交，经过实际测试，发现一些源筛选时可用，然而可能会在一天内过期
> 所以依旧不能保证百分百有效，但至少提高了其可用性

筛选网络环境：联通

如果使用的是电信或者移动网络环境，可用性还会降低

内部源的 ipv6 可用性很高，建议优先使用ipv6


