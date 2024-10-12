import * as cfg from "../config.json";
import * as cookies from "../cookies.json";
import GitPfp from "./gitpfp";
import puppeteer from "puppeteer";

const gitPfp = new GitPfp(cfg.nasa_api_key);

const startTime = new Date();

const main = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/chromium-browser",
  });

  try {
    await gitPfp.getRandomPicture();
  } catch (error) {
    console.log("Error getting random picture, trying again: ");
    await gitPfp.getRandomPicture();
  }

  if (cookies.user_session == "" || cookies.user_session_same_site == "") {
    await gitPfp.loginToGitHub(browser, {
      githubUsername: cfg.github_username,
      githubPassword: cfg.github_password,
      mfa: "github_mobile",
    });
  } else {
    await gitPfp.loginToGitHub(browser, {
      loginCookies: [cookies.user_session, cookies.user_session_same_site],
    });
  }

  await gitPfp.setGitHubPfp(browser);
};

main().catch((error) => {
  console.log(error);
});

setInterval(async () => {
  const currentTime = new Date();

  if (
    currentTime.getHours() === startTime.getHours() &&
    currentTime.getMinutes() === startTime.getMinutes()
  ) {
    main().catch((error) => {
      console.log(error);
    });
  }
}, 60000 * 10);
