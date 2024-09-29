import axios, { AxiosResponse } from "axios";
import { createWriteStream } from "fs";
import { resolve } from "path";
import { writeFile } from "fs";
import { Stream } from "stream";
import { Browser } from "puppeteer";

export default class GitPfp {
  private nasaApiKey: string;
  private filePath: string;

  constructor(nasaApiKey: string) {
    this.nasaApiKey = nasaApiKey;
    this.filePath = resolve(__dirname, "../images/image.jpg");
  }

  async getRandomPicture() {
    const metadataResponse = await axios({
      url: `https://api.nasa.gov/planetary/apod?api_key=${this.nasaApiKey}&count=1`,
      method: "GET",
    });

    const imageUrl = metadataResponse.data[0].url;
    const mediaType = metadataResponse.data[0].media_type;

    if (mediaType !== "image") {
      console.log("media type is not an image, trying again...");
      this.getRandomPicture();
      return;
    }

    const writer = createWriteStream(this.filePath);
    const imageResponse: AxiosResponse<Stream> = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "stream",
    });

    if (parseInt(imageResponse.headers["content-length"]) > 1000000) {
      console.log("image is too big, trying again...");
      this.getRandomPicture();
      return;
    }

    imageResponse.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }
  async loginToGitHub(
    browser: Browser,
    {
      githubUsername,
      githubPassword,
      mfa,
      loginCookies,
    }: {
      githubUsername?: string;
      githubPassword?: string;
      mfa?: "github_mobile" | "no_mfa";
      loginCookies?: string[];
    }
  ) {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1024,
      height: 720,
    });
    if (loginCookies) {
      try {
        await page.setCookie({
          name: "user_session",
          secure: true,
          value: loginCookies[0],
          domain: ".github.com",
        });
        await page.setCookie({
          name: "__Host-user_session_same_site",
          secure: true,
          sameSite: "Strict",
          domain: "github.com",
          httpOnly: true,
          value: loginCookies[1],
          path: "/",
        });
      } catch (error) {
        console.log("error setting cookies: ", error);
      } finally {
        console.log("logged in with cookies.");
      }
    }
    if (githubUsername && githubPassword) {
      await page.goto("https://github.com/login");
      await page.type("#login_field", githubUsername);
      await page.type("#password", githubPassword);
      await page.click(".js-sign-in-button");

      if (mfa == "github_mobile") {
        await page.waitForSelector('a[data-test-selector="gh-mobile-link"]', {
          visible: true,
        });
        await page.click('a[data-test-selector="gh-mobile-link"]');
        await page.waitForSelector(
          'h3[data-target="sudo-credential-options.githubMobileChallengeValue"]'
        );
        const elem = await page.$(
          'h3[data-target="sudo-credential-options.githubMobileChallengeValue"]'
        );
        await page
          .evaluate((el) => el?.textContent, elem)
          .then((val) => {
            console.log(`github mobile sign in request digits: ${val?.trim()}`);
          })
          .catch((err) => {
            console.log(
              err +
                " this was either an error or the sign in request didnt require digits to approve."
            );
          });
        await page
          .waitForSelector(".logged-in")
          .then(async () => {
            console.log("logged in to github.");
            const cookies = await page.cookies();
            const sessionCookie = cookies.find(
              (cookie) => cookie.name == "user_session"
            )?.value;
            const sameSiteCookie = cookies.find(
              (cookie) => cookie.name == "__Host-user_session_same_site"
            )?.value;
            writeFile(
              "./cookies.json",
              JSON.stringify(
                {
                  user_session: sessionCookie,
                  user_session_same_site: sameSiteCookie,
                },
                null,
                2
              ),
              (err) => {
                if (err) {
                  console.log(err);
                }
              }
            );
          })
          .catch((err) => {
            console.log(err + ": could not log in.");
          });
      }
    }
  }

  async setGitHubPfp(browser: Browser) {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1024,
      height: 720,
    });

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.goto("https://github.com/settings/profile");
    try {
      await page.waitForSelector(
        'button[data-url="/settings/gravatar_status"]',
        { timeout: 2000 }
      );
      await page.click('button[data-url="/settings/gravatar_status"]');
      const handle = await page.$('input[type="file"]');
      await handle?.uploadFile(this.filePath);
    } catch (error) {
      const handle = await page.$('input[type="file"]');
      await handle?.uploadFile(this.filePath);
      await page.waitForSelector(
        ".Button--primary.Button--medium.Button.Button--fullWidth"
      );
      await page.click(
        ".Button--primary.Button--medium.Button.Button--fullWidth"
      );
    } finally {
      console.log("uploading avatar...");
    }
    console.log("avatar has been set.");
    await browser.close();
  }
}
