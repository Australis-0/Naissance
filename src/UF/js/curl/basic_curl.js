//Requires puppeteer, puppeteer-extra-plugin-stealth

/*
  addMarginsToScreenshot() - Adds margins to a screenshot using an HTML5 canvas.
  arg0_screnshot_buffer: (Object, ImageBuffer) - The current screenshot buffer.
  arg1_options: (Object)
    height: (Number)
    width: (Number)

    margin_bottom: (Number)
    margin_left: (Number)
    margin_right: (Number)
    margin_top: (Number)

  Returns: (Object, ImageBuffer)
*/
async function addMarginsToScreenshot (arg0_screnshot_buffer, arg1_options) {
  //Convert from parameters
  var screenshot_buffer = arg0_screnshot_buffer;
  var options = (arg1_options) ? arg1_options : {};

  //Declare local instance variables
  var { createCanvas, loadImage } = require("canvas");

  //Create a canvas with specified dimensions
  var canvas = createCanvas(options.width, options.height);
  var ctx = canvas.getContext("2d");

  //Fill the canvas with a white background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, options.width, options.height);

  //Load the screenshot image
  var img = await loadImage(screenshot_buffer);

  //Draw the screenshot on the canvas with margins
  ctx.drawImage(img,
    options.margin_left,
    options.margin_top,
    options.width - options.margin_left - options.margin_right,
    options.height - options.margin_top - options.margin_bottom
  );

  //Return the final image buffer
  return canvas.toBuffer();
}

async function adjustSliderToMin (arg0_el) {
  //Convert from parameters
  var slider_el = arg0_el;

  //Get the size of the slider, calculate offset to move slider to minimum value
  var slider_size = await slider_el.getRect();
  var x_offset = -slider_size.width/2;

  //Create an actions object; move slider to the minimum value
  var actions = browser_instance.actions({ bridge: true });
  await actions.dragAndDrop(slider, { x: x_offset, y: 0 }).perform();
}

async function clickElement (arg0_el) {
  //Convert from parameters
  var local_el = arg0_el;

  //Click element
  try { await local_el.click(); } catch {}
}

/*
  getBrowserInstance() - Fetches browser instance.
  arg0_options: (Object)
    initialise_gpt: (String) - Either 'chat_gpt'/'gemini'/'gemini_flash'
*/
async function getBrowserInstance (arg0_options) {
  //Convert from parameters
  var options = (arg0_options) ? arg0_options : {};

  //Guard clause if already connected
  if (global.browser_instance)
    if (await isPageConnected(global.browser_instance)) {
      return global.browser_instance;
    } else {
      console.log(`Page isn't connected. Restarting browser instance.`);
      delete global.browser_instance;
    }

  //Declare local instance variables
  global.browser_instance = await initialiseChrome();
  await sleep(randomNumber(1500, 2000));

  //options handler
  if (options.initialise_gpt)
    return await initialiseBrowserGPT(options.initialise_gpt);

  //Return statement
  return global.browser_instance;
}

async function getPlaintextFromSelectors (arg0_url, arg1_selectors) {
  //Convert from parameters
  var url = arg0_url;
  var selectors = getList(arg1_selectors);

  //Declare local instance variables
  var html = await getWebsiteHTML(url);

  if (html) {
    var dom = new JSDOM.JSDOM(html);
    var plaintext = ``;
    var website_body = dom.window.document.body;

    for (var i = 0; i < selectors.length; i++) {
      var local_elements = website_body.querySelectorAll(selectors[i]);
      var local_string = ``;

      for (var x = 0; x < local_elements.length; x++)
        local_string += local_elements[x].textContent;

      //Append to plaintext
      plaintext += local_string;
    }

    //Return statement
    return plaintext;
  } else {
    return "";
  }
}

async function getWebsiteHTML (arg0_url) {
  //Convert from parameters
  var url = arg0_url;

  //Declare local instance variables
  var fetch_html;
  var fetch_website;

  //Function body
  try {
    fetch_website = sync_request("GET", url);
    fetch_html = fetch_website.getBody("utf8");
  } catch (e) {
    fetch_html = "";
  }

  //Use Chrome profile instead if website HTML could not be fetched normally
  if (!fetch_html) {
    var chrome_instance = await puppeteer.launch();
    var page = await chrome_instance.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });
    fetch_html = await page.content();
    await chrome_instance.close();
  }

  //Return statement
  return fetch_html;
}

/*
  getWebsiteLinks()
  arg0_url: (String)
  arg1_options: (Object)
    allowed_domains: (Array<String>)
    exclude_domains: (Array<String>)

    attempts: (Number) - Optional. Number of current attempts. 1 by default.
    max_attempts: (Number) - Optional. 15 by default.
*/
async function getWebsiteLinks (arg0_url, arg1_options) {
  //Convert from parameters
  var url = arg0_url;
  var options = (arg1_options) ? arg1_options : {};

  //Initialise options
  console.log(options);
  if (options.attempts == undefined)
    options.attempts = 1;
  if (options.max_attempts == undefined)
    options.max_attempts = 15;

  //Declare local instance variables
  var attempt_to_reconnect = false;
  var html = await getWebsiteHTML(url);
  var links = [];

  if (html) {
    var dom = new JSDOM.JSDOM(html);
    var website_links = [];
    var website_body = dom.window.document.body;

    var all_link_els = website_body.querySelectorAll(`a`);

    for (var i = 0; i < all_link_els.length; i++) {
      var local_href = new URL(all_link_els[i].getAttribute("href"), url).href;

      if (local_href)
        links.push(local_href);
    }

    //If there's no all_link_els, try again
    if (links.length == 0)
      attempt_to_reconnect = true;

    //Filter links if options.allowed_domains is defined
    if (options.allowed_domains) {
      var processed_links = [];

      for (var i = 0; i < links.length; i++)
        for (var x = 0; x < options.allowed_domains.length; x++)
          if (links[i].includes(options.allowed_domains[x])) {
            var link_allowed = true;

            if (options.exclude_domains)
              for (var y = 0; y < options.exclude_domains.length; y++)
                if (links[i].includes(options.exclude_domains[y]))
                  link_allowed = false;

            if (link_allowed)
              processed_links.push(links[i]);

            break;
          }

      links = processed_links;
    }
  } else {
    attempt_to_reconnect = true;
  }

  if (attempt_to_reconnect && options.attempts < options.max_attempts) {
    var random_delay = randomNumber(500, 10000);

    console.log(`Attempt ${options.attempts} failed to fetch links. Retrying after ${random_delay}ms ..`);
    options.attempts++;

    await sleep(random_delay);
    return await getWebsiteLinks(url, options);
  }

  //Return statement
  return unique(links);
}

async function getWebsitePlaintext (arg0_url) {
  //Convert from parameters
  var url = arg0_url;

  //Declare local instance variables
  var fetch_html = await getWebsiteHTML(url);

  //Return statement
  if (fetch_html)
    return stripHTML(fetch_html);
}

/*
  generatePlaintext() - Generates a plaintext string dump from Plaintext CURL JSON.
  arg0_options: (Object)
    cache: (Boolean) - Optional. Whether to cache the current plaintext dump. False by default.
    cache_folder: (String) - Optional. ./cache/ by default
    cache_prefix: (String) - Optional. The cache prefix. '' by default.
    scrape_urls: (Array<Object>)
      name*: (String) - The header for the plaintext dump to be generated.
      url: (String) - The base URL to start scraping at.

      recursive_depth*: (Number) - Optional. The recursive depth traversal from the initial page. 0 by default.
      recursive_exclude_links*: (Array<String>) - Optional. Invalid subdomains. Nothing by default.
      recursive_links*: (Array<String>) - Optional. Valid subdomains over which to traverse. Everything by default.
      selectors*: (Object)
        <#>: (Object) - The traversal depth at which these selector rules apply.
          exclude: Array<String>) - Optional. CSS selectors to be excluded. Strips HTML tags from included text.
          include: (Array<String>) - Optional. CSS selectors to be included. If specified, only included selectors will have HTML added for plaintext processing.
          scrape_iframes: (Boolean) - Optional. Whether to scrape iframe contents by fetching and loading their href. False by default.

  Returns: (String)
*/
async function generatePlaintext (arg0_options) {
  //Convert from parameters
  var options = (arg0_options) ? arg0_options : {};

  //Initialise options
  if (!options.cache_folder) options.cache_folder = `./cache/`;
  if (!options.cache_prefix) options.cache_prefix = "";

  //Declare local instance variables
  var scrape_urls = (options.scrape_urls) ? getList(options.scrape_urls) : [];
  var string = ``;

  console.log(`generatePlaintext() called!`, scrape_urls);

  //Iterate over scrape_urls and parse websites
  for (var i = 0; i < scrape_urls.length; i++)
    string += await generatePlaintextRecursively(JSON.parse(JSON.stringify(scrape_urls[i])));

  //Cache to /cache if options.cache is true
  if (options.cache) {
    var cache_file_name = `${options.cache_folder}${options.cache_prefix}${returnABRSDateString()}.txt`;

    //Write file
    writeTextFile(cache_file_name, string);
  }

  //Return statement
  return string;
}

/*
  generatePlaintextRecursively() - Helper function for generatePlaintext().
  arg0_options: (Object)
    depth: (Number) - Optimisation parameter. The current depth at which the website is being traversed.
    crawled_pages: (Array<String>) - Optimisation parameter. Current pages already trawled to prevent double-dipping.

    name*: (String) - The header for the plaintext dump to be generated.
    url: (String) - The base URL to start scraping at.

    recursive_depth*: (Number) - Optional. The recursive depth traversal from the initial page. 0 by default.
    recursive_links*: (Array<String>) - Optional. Valid subdomains over which to traverse. Everything by default.
    selectors*: (Object)
      <#>: (Object) - The traversal depth at which these selector rules apply.
        exclude: Array<String>) - Optional. CSS selectors to be excluded. Strips HTML tags from included text.
        include: (Array<String>) - Optional. CSS selectors to be included. If specified, only included selectors will have HTML added for plaintext processing.
        scrape_iframes: (Boolean) - Optional. Whether to scrape iframe contents by fetching and loading their href. False by default.
*/
async function generatePlaintextRecursively (arg0_options) {
  //Convert from parameters
  var options = (arg0_options) ? arg0_options : {};

  //Initialise options
  if (options.depth == undefined) options.depth = 0;
  if (options.crawled_pages == undefined) options.crawled_pages = [];

  if (options.selectors[options.depth] == undefined) options.selectors[options.depth] = {};

  //Push to options.crawled_pages
  //options.crawled_pages.push(options.url);

  //Declare local instance variables
  var selectors = options.selectors[options.depth];
  var string = ``;
  var website_html = await getWebsiteHTML(options.url);

  var dom = new JSDOM.JSDOM(website_html);
  var website_body = dom.window.document.body;

  //Begin processing include_els
  var include_els = [];
  var include_els_html = [];
  var website_include_html = ``;

  console.log(`Scraping`, options.url);

  //1. Scrape iframes handler (replace HTML)
  if (selectors.scrape_iframes) {
    var all_iframe_els = website_body.querySelectorAll(`iframe`);

    for (var i = 0; i < all_iframe_els.length; i++)
      try {
        var local_href = new URL(all_iframe_els[i].getAttribute("href"), url).href;

        if (local_href)
          //Replace iframe with inner HTML contents
          all_iframe_els[i].outerHTML = await getWebsiteHTML(local_href);
      } catch {}
  }

  //2. Exclude elements from website DOM first
  if (selectors.exclude)
    for (var i = 0; i < selectors.exclude.length; i++) {
      var local_els = website_body.querySelectorAll(selectors.exclude[i]);

      for (var x = 0; x < local_els.length; x++)
        local_els[x].remove();
    }

  //3. Fetch include_els for later processing
  if (selectors.include) {
    for (var i = 0; i < selectors.include.length; i++) {
      var local_els = website_body.querySelectorAll(selectors.include[i]);

      for (var x = 0; x < local_els.length; x++)
        if (!include_els_html.includes(local_els[x].outerHTML)) {
          include_els.push(local_els[x]);
          include_els_html.push(local_els[x].outerHTML);
        }
    }
  } else {
    include_els.push(website_body);
  }

  for (var i = 0; i < include_els_html.length; i++)
    string += stripHTML(include_els_html[i]) + "\n";

  //5. Recursive depth handler
  if (options.depth < options.recursive_depth) {
    var current_website_links = await getWebsiteLinks(options.url, {
        allowed_domains: options.recursive_links,
        exclude_domains: options.recursive_exclude_links
    });

    console.log(`Website links:`, current_website_links);

    for (var i = 0; i < current_website_links.length; i++)
      //Check if page is already crawled
      if (!options.crawled_pages.includes(current_website_links[i])) {
        var new_options = JSON.parse(JSON.stringify(options));
        console.log(`Calling recursively for`, current_website_links[i]);

        //Iterate depth; set new url
        new_options.url = current_website_links[i];
        new_options.depth++;

        var local_page_plaintext = await generatePlaintextRecursively(new_options);

        if (local_page_plaintext)
          string += local_page_plaintext;
      }
  }

  //6. Return string
  //Return statement
  return string;
}

async function getElement (arg0_browser_instance, arg1_query_selector) {
  //Convert from parameters
  var browser_instance = arg0_browser_instance;
  var query_selector = arg1_query_selector;

  //Wait for the element to be located and visible
  var element = await browser_instance.wait(until.elementLocated(By.css(query_selector)), 10000);
  await browser_instance.wait(until.elementIsVisible(element), 10000);
  await browser_instance.wait(until.elementIsEnabled(element), 10000);

  element.click();

  //Return statement
  return element;
}

async function initialiseChrome () {
  //Open chrome browser first
  exec(settings.chrome_launch_cmd);
  await sleep(1500);

  //Connect to chrome browser afterwards
  var chrome_browser = await puppeteer.connect({
    browserURL: "http://localhost:9222",
    defaultViewport: null
  });
  var pages = await chrome_browser.pages();

  //Set initial viewport
  await pages[0].setViewport({ width: 1080, height: 1080 });
  global.browser_instance = pages[0];

  //Return statement
  return pages[0];
}

async function isPageConnected (arg0_browser_instance) {
  //Convert from parameters
  var chrome_instance = arg0_browser_instance;

  //Try/catch return block
  try {
    await chrome_instance.title(); //Try fetching the title of the page to check if its still connected
    return true;
  } catch (e) {
    return false;
  }
}

/*
  screenshotHTML() - Takes screenshots from a current Puppeteer browser instance.
  arg0_browser_instance: (Object, BrowserInstance)
  arg1_path: (String) - The path to save screenshots to.
  arg2_options: (Object)
    full_page: (Boolean) - Optional. Overrides everything else and captures the entire page as a single screenshot. False by default.

    height: (Number) - Optional. 794 by default.
    width: (Number) - Optional. 1531 by default.

    margin_bottom: (Number) - Optional. 20 by default.
    margin_left: (Number) - Optional. 20 by default.
    margin_top: (Number) - Optional. 20 by default.
    margin_right: (Number) - Optional. 20 by default.
*/
async function screenshotHTML (arg0_browser_instance, arg1_path, arg2_options) {
  //Convert from parameters
  var browser_instance = arg0_browser_instance;
  var path = arg1_path;
  var options = (arg2_options) ? arg2_options : {};

  //Initialise options
  if (options.height == undefined) options.height = 794;
  if (options.width == undefined) options.width = 1531;

  if (options.margin_bottom == undefined) options.margin_bottom = 20;
  if (options.margin_left == undefined) options.margin_left = 20;
  if (options.margin_top == undefined) options.margin_top = 20;
  if (options.margin_right == undefined) options.margin_right = 20;

  //Declare local instance variables
  var page;
  var page_height;
  var pages;

  //Function body
  try {
    //Set viewport width first
    await browser_instance.setViewport({ width: options.width, height: options.height });

    //options.full_page handler
    if (!options.full_page) {
      //Get the page height
      var body_handle = await browser_instance.$("body");
      var { height } = await body_handle.boundingBox();
      await body_handle.dispose();

      //Get the positions of all lines of text on the page
      var line_positions = await browser_instance.evaluate(() => {
        var lines = [];
        var node;
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

        while (node = walker.nextNode()) {
          var range = document.createRange();

          range.selectNodeContents(node);
          var rects = range.getClientRects();

          for (var rect of rects) lines.push(rect.top);
        }

        //Return statement
        return lines;
      });

      //Determine the split points
      var split_points = [0];

      for (var i = 1; i < line_positions.length; i++)
        if (line_positions[i] - split_points[split_points.length - 1] > options.height)
          split_points.push(line_positions[i - 1]);
      split_points.push(height);

      //Take screenshots of the regions
      for (var i = 0; i < split_points.length - 1; i++) {
        var clip_height = split_points[i + 1] - split_points[i];

        var screenshot_buffer = await browser_instance.screenshot({
          clip: {
            x: 0,
            y: split_points[i],
            width: await (browser_instance.evaluate(() =>  document.body.clientWidth)),
            height: clip_height
          }
        });

        //Add margins and save screenshot
        var padded_screenshot_buffer = await addMarginsToScreenshot(screenshot_buffer, {
          height: clip_height + options.margin_top + options.margin_bottom,
          width: options.width,
          margin_bottom: options.margin_bottom,
          margin_left: options.margin_left,
          margin_right: options.margin_right,
          margin_top: options.margin_top
        });

        //Write screenshot to file
        fs.writeFileSync(`${path}_${i + 1}.png`, padded_screenshot_buffer);
      }

      //await browser_instance.close();
    } else {
      //Fetch browser height; set viewport height to the full height of the content
      var height = await browser_instance.evaluate(() => {
        return document.documentElement.scrollHeight;
      });

      await browser_instance.setViewport({ width: options.width, height: Math.ceil(height) + 48 });
      await browser_instance.screenshot({ path: `${path}_full.png` });
    }
  } catch (e) {
    log.error(`Error taking A4 screenshots: ${e}`);
    console.log(e);
  }
}

function sleep (arg0_ms) {
  //Convert from parameters
  var ms = arg0_ms;

  //Return statement
  return new Promise(resolve => setTimeout(resolve, ms));
}

function stripHTML (arg0_html) {
  //Convert from parameters
  var html = arg0_html;

  //Declare local instance variables
  var dom = new JSDOM.JSDOM(html);

  if (dom) {
    //Remove all script and style elements
    var website_body = dom.window.document.body;

    //Remove all script and style elements
    var remove_elements = website_body.querySelectorAll(`script, style`);

    for (var i = 0; i < remove_elements.length; i++)
      remove_elements[i].remove();

    //Get the text content and trim excessive whitespace
    var plaintext = website_body.textContent || "";

    //Replace multiple whitespace characters with a single space
    var pt_lines = plaintext.split("\n");
    var pt_formatted = pt_lines.map((line) => line.trim())
      .filter((line) => line.length > 0).join("\n");

    //Return statement
    return pt_formatted.trim();
  }
}

async function waitForStableContent (arg0_browser_instance, arg1_selector, arg2_interval) {
  //Convert from parameters
  var chrome_instance = arg0_browser_instance;
  var selector = arg1_selector;
  var interval = (arg2_interval) ? arg2_interval : 3000;

  //Wait for function inside of page
  await chrome_instance.waitForFunction(
    (selector) => {
      var local_elements = document.querySelectorAll(selector);
      if (local_elements.length == 0) return false;

      var last_element = local_elements[local_elements.length - 1];

      if (!window.previous_html) {
        window.previous_html = last_element.innerHTML;
        return false;
      }

      console.log(`Previous HTML:`, window.previous_html.length);
      console.log(`Current HTML:`, last_element.innerHTML.length);

      var current_html = last_element.innerHTML;

      if (current_html == window.previous_html) {
        return true;
      } else {
        window.previous_html = current_html;
        return false;
      }
    },
    { polling: interval, timeout: 0 },
    selector
  );
}

function writeTextFile (arg0_filepath, arg1_text) {
  //Convert from parameters
  var file_path = arg0_filepath;
  var text = arg1_text;

  //Write to file
  try {
    fs.writeFileSync(file_path, text);
  } catch (e) {
    console.log(e);
  }
}
