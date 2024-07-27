#!/usr/bin/env node

const CHECK_URL = [
  "https://raw.githubusercontent.com/dxawi/0/main/tvlive.txt",
  "https://raw.githubusercontent.com/qist/tvbox/master/list.txt",
  "https://gitee.com/xxy002/zhiboyuan/raw/master/zby.txt",
  "http://kv.zwc365.com/tvlive",
];

const PROXY_ENV =
  "http_proxy=http://127.0.0.1:7890 https_proxy=http://127.0.0.1:7890";
const fetch = require("node-fetch");
var exec = require("child_process").exec;

async function verifyurl(url) {
  try {
    var res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
      },
      responseType: "stream",
      timeout: 3000,
    });
    return true;
  } catch (e) {
    // console.log(e);
    return false;
  }
}
async function geturlcontent(url) {
  try {
    var res = await execmd(PROXY_ENV + " " + 'curl -s -L "' + url + '"');
    if (res[0]) {
      return "";
    }
    return res[1];
  } catch (e) {
    console.log(e);
    return "";
  }
}
async function execmd(cmd) {
  // console.log(cmd);
  var over = false;
  var waitcall = null;
  var _err,
    _stdout,
    _stderr = null;
  exec(cmd, async function (err, stdout, stderr) {
    _err = err;
    _stdout = stdout;
    _stderr = stderr;
    if (!over) {
      over = true;
      if (waitcall) {
        waitcall();
        waitcall = null;
      }
    }
  });
  if (!over) {
    await new Promise((r) => {
      waitcall = r;
    });
  }
  return [_err, _stdout, _stderr];
}
async function pushgit() {
  console.log("exec over");
  var gitstatu = await execmd("git add .");
  if (gitstatu[0]) {
    console.log("git 提交出错：", gitstatu);
    return;
  }
  var gitstatu = await execmd('git commit -m "' + "自动提交: $(date)" + '"');
  if (gitstatu[0]) {
    console.log("git 提交出错：", gitstatu);
    return;
  }
  var gitstatu = await execmd("git push origin master");
  if (gitstatu[0]) {
    console.log("git 提交出错：", gitstatu);
    return;
  }
}

function convertToM3U(txt) {
  const txtInput = txt;
  const lines = txtInput.split("\n");
  let m3uOutput = '#EXTM3U x-tvg-url="https://live.fanmingming.com/e.xml"\n';
  let currentGroup = null;
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine !== "") {
      if (trimmedLine.includes("#genre#")) {
        currentGroup = trimmedLine.replace(/,#genre#/, "").trim();
      } else {
        const [originalChannelName, channelLink] = trimmedLine
          .split(",")
          .map((item) => item.trim());
        const processedChannelName = originalChannelName.replace(
          /(CCTV|CETV)-(\d+).*/,
          "$1$2"
        );
        m3uOutput += `#EXTINF:-1 tvg-name="${processedChannelName}" tvg-logo="https://live.fanmingming.com/tv/${processedChannelName}.png"`;
        if (currentGroup) {
          m3uOutput += ` group-title="${currentGroup}"`;
        }
        m3uOutput += `,${originalChannelName}\n${channelLink}\n`;
      }
    }
  }
  return m3uOutput;
}

async function checkallurl(data) {
  var listsplit = data.split("\n");
  let ret = "";
  await listsplit.reduce(async (memo, ise) => {
    await memo;
    if (!ise || ise == "") {
      return 0;
    }

    var isesplit = ise.trim().split(",");
    if (isesplit.length >= 2) {
      if (isesplit[1].trim().indexOf("http") == 0) {
        if (await verifyurl(isesplit[1].trim())) {
          console.log("append:", ise);
          // await execmd('printf -- "\n' + ise + '"' + " >>live.txt");
          ret += "\n" + ise;
        } else {
          console.log("过滤无法访问的源:", ise);
        }
        return;
      }
    }
    // await execmd('printf -- "\n' + ise + '"' + " >>live.txt");
    ret += "\n" + ise;
  }, "");
  return ret;
}
async function loadexturl() {
  // const loadlist='https://raw.githubusercontent.com/qist/tvbox/master/list.txt'
  await execmd('printf -- "' + '"' + " >live.txt");
  await execmd('printf -- "' + '"' + " >live.m3u");

  let ret = "";
  await CHECK_URL.reduce(async (memo, url) => {
    await memo;
    if (!url || url == "") {
      return 0;
    }

    var content = await geturlcontent(url);
    // console.log(content);
    if (content) {
      ret += await checkallurl(content);
    }
  }, "");
  // 获取全部可用链接后，统一写入
  for (const line of ret.split("\n")) {
    await execmd('printf -- "\n' + line + '"' + " >>live.txt");
  }
  let m3u_txt = convertToM3U(ret);
  // console.log(m3u_txt);
  // 写入 m3u 地址
  for (const line of m3u_txt.split("\n")) {
    await execmd('printf -- "\n' + line + '"' + " >>live.m3u");
  }
  // push到 github
  await pushgit();
  console.log("状态:", "over");
  process.exit(0);
}

console.log("开始测试live地址并保存");
loadexturl();
// pushgit();
