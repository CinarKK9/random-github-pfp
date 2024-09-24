import * as cfg from "./config.json";
import * as cookies from "./cookies.json";
import GitPfp from "./gitpfp";
import puppeteer from "puppeteer";

const gitPfp = new GitPfp(cfg.nasa_api_key);

gitPfp.getRandomPicture();

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  await gitPfp.getRandomPicture();

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

main().catch((err) => {
  console.log(err);
});
