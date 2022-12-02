const pkgsRecievedEvent = new Event("pkgsRecieved");

const pkgOut = document.querySelector("#pkg-out")

let pkgs;

function getPromiseFromEvent(item, event) {
    return new Promise((resolve) => {
      const listener = () => {
        item.removeEventListener(event, listener);
        resolve();
      }
      item.addEventListener(event, listener);
    })
  }

async function getpkg() {
    window.AppInventor.setWebViewString("request::getPackages") //|| setpkgresult()

    await getPromiseFromEvent(document, "pkgsRecieved")

    pkgOut.textContent += pkgs + "\n"

    return pkgs
}
function setpkgresult(res) {
    //const result = JSON.parse((window.AppInventor?.getWebViewString() || `a::a::[{"package name": "abc"}]`).split("::")[2]).map(i => i["package name"])
    if(res.startsWith("result::getPackages::")) {
        const result = JSON.parse(res.split("::")[2]).map(i => i["package name"])
        pkgs = result
        document.dispatchEvent(pkgsRecievedEvent);
    } else {
        pkgOut.textContent = res + "\n"
}
    }
    //const result = JSON.parse(res.split("::")[2]).map(i => i["app name"])
    

async function getUpdates() {
    const pkgs = await getpkg()

    // API calls

    const response = await fetch("/apps/index.json")
    const json = await response.json()
    const appIDs = json["by-android-id"]

    const appNames = pkgs.filter(i => i in appIDs)
    pkgOut.textContent += appNames + "\n"

    const apps = await Promise.all(appNames.map(async i => {
      pkgOut.textContent += appIDs[i]+"index.json" + "\n"
      const response = await fetch(appIDs[i]+"index.json")
      const json = await response.json()
      pkgOut.textContent += JSON.stringify(json) + "\n"
      return json
    }))

    //pkgOut.textContent += JSON.stringify(apps) + "\n"

    const card = document.querySelector(".update-card-template").children[0]
    const list = document.querySelector(".update-container")

    apps.forEach(elm => {
      pkgOut.textContent += JSON.stringify(elm) + "\n"
      const clone = card.cloneNode(true)
      clone.href = appIDs[elm.androidid]
      clone.querySelector(".app-name").textContent = elm.title
      clone.querySelector(".app-desc").textContent = elm.description
      clone.querySelector(".app-icon").src = elm.icon

      list.appendChild(clone)
    });

    pkgOut.textContent += appNames
}