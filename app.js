require("dotenv/config");
const fetch = require("node-fetch");
const btoa = require("btoa");
const FormData = require("form-data");
const fs = require("fs");
const zip = require("bestzip");
const { VITE_APP_NAME, VITE_APP_SHORT_NAME, VITE_BASE_URL, VITE_USERNAME, VITE_PASSWORD } = process.env;

const manifest = {
  launch_path: "index.html",
  default_locale: "en",
  activities: {
    dhis: {
      href: "*"
    }
  },
  appType: "DASHBOARD_WIDGET",
  name: VITE_APP_NAME,
  version: "0.1.1",
  description: VITE_APP_NAME,
  developer: {
    name: "HISPVN Team"
  },
  key: VITE_APP_SHORT_NAME,
  short_name: VITE_APP_SHORT_NAME,
  icons: {
    16: "icon.png",
    48: "icon.png",
    128: "icon.png"
  }
};

fs.writeFileSync("dist/manifest.webapp", JSON.stringify(manifest));

zip({
  source: "*",
  destination: `./${VITE_APP_SHORT_NAME}.zip`,
  cwd: "dist/"
})
  .then(async function () {
    const path = `./dist/${VITE_APP_SHORT_NAME}.zip`;
    const form = new FormData();
    const fileStream = fs.createReadStream(path);
    form.append("file", fileStream);
    const result = await fetch(`${VITE_BASE_URL}/api/apps`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(VITE_USERNAME + ":" + VITE_PASSWORD)}`
      },
      body: form
    });
  })
  .catch(function (err) {
    console.error(err.stack);
    process.exit(1);
  });
