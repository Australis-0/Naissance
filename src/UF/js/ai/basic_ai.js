//Requires AdBlockerPlugin, fetch-blob, node-fetch, child-process, puppeteer, puppeteer-extra-plugin-stealth

/*
  getCurrentGeminiAccount() - Gets the current email address of the logged-in account for Gemini.
  arg0_browser_instance: (Object, BrowserInstance)

  Returns: (String)
*/
async function getCurrentGeminiAccount (arg0_browser_instance) {
  //Convert from parameters
  var chrome_browser = arg0_browser_instance;

  //Declare local instance variables
  var email_name_selector = `div.account-text`;

  var account_name = await chrome_browser.evaluate(async (email_name_selector) => {
    return document.querySelector(email_name_selector).innerText;
  }, email_name_selector);

  //Return statement
  return account_name;
}

/*
  initialiseBrowserGemini()
  arg0_type: (String) - Either 'gemini'/'gemini_flash'

  Returns: (Object, BrowserInstance)
*/
async function initialiseBrowserGemini (arg0_type) {
  //Convert from parameters
  var type = arg0_type;

  //Declare local instance variables
  var chrome_browser = await getBrowserInstance();

  //Wait ~1,5 seconds to make sure the browser is actually loaded.
  await sleep(randomNumber(1500, 2000));

  //Gemini handler
  if (["gemini", "gemini_flash"].includes(type))
    try {
      console.log(`Trying to navigate to AI studio!`);
      await chrome_browser.goto("https://aistudio.google.com/app/prompts/new_chat");
      await chrome_browser.goto("https://aistudio.google.com/app/prompts/new_chat");

      //Close initial build prompt first
      try {
        await chrome_browser.click(".warm-welcome-dialog-panel .mdc-icon-button.mat-mdc-icon-button.mat-unthemed.mat-mdc-button-base.gmat-mdc-button");
      } catch {}

      await sleep(randomNumber(500, 1500));

      //Change model if needed
      {
        await chrome_browser.click("mat-select#model-selector");

        //Declare model_types
        if (type == "gemini_flash") {
          await chrome_browser.click(`#model-selector-panel #mat-option-2`);
        } else if (type == "gemini") {
          await chrome_browser.click(`#model-selector-panel #mat-option-3`);
        }
      }

      //Disable safety
      {
        await chrome_browser.click("button.edit-safety-button.mdc-button");

        //Use chrome_browser.evaluate() to run querySelectorAll and set all sliders to the minimum value
        await chrome_browser.evaluate(async () => {
          //Define functions in scope
          {
            function sleep (arg0_ms) {
              //Convert from parameters
              var ms = arg0_ms;

              //Return statement
              return new Promise(resolve => setTimeout(resolve, ms));
            }
          }

          //Begin actual script
          var all_sliders = document.querySelectorAll(`run-safety-settings input[type="range"]`);

          for (var i = 0; i < all_sliders.length; i++) {
            all_sliders[i].value = all_sliders[i].min;

            all_sliders[i].dispatchEvent(new Event("input", { bubbles: true }));
            all_sliders[i].dispatchEvent(new Event("change", { bubbles: true }));
          }

          //Wait 750ms before closing prompt
          await sleep(750);

          var all_buttons = document.querySelectorAll(".light.mdc-button.mdc-button--unelevated.mat-mdc-unelevated-button.mat-primary.mat-mdc-button-base.gmat-mdc-button");

          for (var i = 0; i < all_buttons.length; i++)
            if (all_buttons[i].textContent.includes("Turn filters off"))
              all_buttons[i].click();

          //Wait another 500ms before closing safety settings prompt
          await sleep(500);

          var local_close_el = document.querySelector(`run-safety-settings [aria-label*="Close"]`);

          local_close_el.click();
        });
      }
    } catch (e) {
      console.log(e);
    }

  global.browser_instance = chrome_browser;

  //Return statement
  return chrome_browser;
}

//initialiseAIRateLimits() - Initialises rate limit logic for AI.
function initialiseAIRateLimits () {
  //Declare local instance variables
  var ai_config = global.config.ai;
  var rate_limits_obj = global.rate_limits;

  //Logic loops, 1-second logic loop
  global.ai_rate_limit_clock = setInterval(function(){
    //Fetch current_date
    var current_date = new Date().getTime();
    var time_difference = current_date - returnSafeNumber(global.last_rate_limit_reset);

    //Reset rate limit trackers once threshold is passed
    if (time_difference > ai_config.rate_limit_reset*1000) {
      global.last_rate_limit_reset = current_date;
      resetRateLimitTrackers();

      log.info(`Resetting rate limit trackers!`);
    }
  }, 1000);
}

/*
  processGPT() - Processses an AI config object as arg1_options using puppeteered browser.
  arg0_input_text: (String)
  arg1_options: (Object)
    cache: (Boolean)
    cache_prefix: (String)
    use_text_file: (Boolean)

    <prompt_#>: (Object)
      custom_type: (String) - Used for Custom GPTs.
      type: (String) - Can be either ‘chat_gpt’/gemini’/’gemini_flash’, where ‘chat_gpt’ is GPT4o, ‘gemini’ is Gemini 1.5 Pro, and ‘gemini_flash’ is Gemini 1.5 Flash.

      header_content: (Array<String>) - Optional. The header content to include before the function input string.
      footer_content: (Array<String>) - Optional. The footer content to include after the function input string.

      return_final_history: (Number) - Optional. Whether this is the final breakpoint. Returns the last n messages as a string. 0 by default.
      return_history: (Number) - Optional. Whether this is a breakpoint. Returns the last n messages as a string. If there is no step after this, the function will return the current AI output for the last n outputs. Otherwise, the last n will be passed onto a new GPT instance (either chat_gpt/gemini). 0 by default.

  Returns: (Array<String>)
*/
async function processGPT (arg0_input_text, arg1_options) { //[WIP] - Add ChatGPT 4o handling later
  //Convert from parameters
  var input_text = arg0_input_text;
  var options = (arg1_options) ? arg1_options : {};

  //Declare local instance variables
  var all_options = Object.keys(options);
  var chat_history = [input_text];
  var current_instance = ["", undefined];
  var current_return_history = [input_text]; //Initialise with input_text
  var new_return = false;
  var prompt_steps = [];

  //1. Establish prompt_steps
  for (var i = 0; i < all_options.length; i++) {
    var local_option = options[all_options[i]];

    //Create prompt step array first
    if (all_options[i].startsWith("prompt_"))
      prompt_steps.push(local_option);
  }

  //2. Process prompt_steps individually
  for (var i = 0; i < prompt_steps.length; i++) {
    var local_option = prompt_steps[i];

    var current_input_text = "";
    var current_type = (local_option.type) ? local_option.type : "gemini_flash";
    var response_text = "";
    var send_text = false;

    var header_content = (local_option.header_content) ?
      local_option.header_content.join("\n") : "";
    var footer_content = (local_option.footer_content) ?
      local_option.footer_content.join("\n") : "";

    if (current_instance[0] != current_type) {
      current_instance[1] = await getBrowserInstance({ initialise_gpt: local_option.type });

      if (options.use_text_file) {
        var text_file_name = `${settings.cache_folder}${generateRandomID()}.txt`;

        //Create random_cache
        writeTextFile(text_file_name, current_return_history.join("\n\n"));

        //Send text to GPT
        await sleep(randomNumber(1500, 3000));

        current_input_text = `${header_content}${footer_content}`;
        response_text = await sendFileToBrowserGPT(current_instance[1], text_file_name, current_input_text, {
          type: current_type
        });
      } else {
        send_text = true;
      }
    } else {
      send_text = true;
    }

    //send_text handler - activated if text file is not used - Send current_input_text to GPT
    if (send_text) {
      current_input_text = `${header_content}${current_return_history.join("\n\n")}${footer_content}`;
      response_text = await sendTextToBrowserGPT(current_instance[1], current_input_text, {
        type: current_type
      });
    }

    //Append to chat history
    chat_history.push(response_text);

    //.return_history handler
    if (local_option.return_history) {
      //Clear current_return_history
      current_return_history = [];

      //Iterate over local_option.return_history to fetch current_return_history
      for (var x = 0; x < local_option.return_history; x++) {
        var local_return_history = chat_history[chat_history.length - 1 - x];

        if (local_return_history)
          current_return_history.unshift(local_return_history);
      }
      new_return = true;
    } else {
      //Once processed, clear current_return_history
      current_return_history = [];
      new_return = false;
    }

    //3. .return_final_history handler
    if (local_option.return_final_history) {
      var return_history = [];

      for (var x = 0; x < local_option.return_final_history; x++) {
        var local_return_history = chat_history[chat_history.length - 1 - x];

        if (local_return_history)
          return_history.unshift(local_return_history);
      }

      //Quit browser
      var browser = await current_instance[1].browser();
      await browser.close();

      return return_history;
      break;
    }

    //Keep at bottom in step
    current_instance[0] = current_type;
    current_return_history = [];
  }
}

//resetRateLimitTrackers() - Resets rate limit trackers over global.rate_limits.
async function resetRateLimitTrackers () {
  //Declare local instance variables
  var rate_limits_obj = global.rate_limits;

  var all_rate_limits = Object.keys(rate_limits_obj);

  //Iterate over all_rate_limits; empty each object
  for (var i = 0; i < all_rate_limits.length; i++)
    rate_limits_obj[all_rate_limits[i]] = {};
}

/*
  sendFileToBrowserGPT() - Sends a file to the current browser GPT.
  arg0_browser_instance: (Object, BrowserInstance)
  arg1_file_path: (String)
  arg2_input_text: (String)
  arg3_options: (Object) - Same as sendTextToBrowserGPT().
*/
async function sendFileToBrowserGPT (arg0_browser_instance, arg1_file_path, arg2_input_text, arg3_options) {
  //Convert from parameters
  var chrome_browser = arg0_browser_instance;
  var file_path = arg1_file_path;
  var input_text = (arg2_input_text) ? arg2_input_text : "";
  var options = (arg3_options) ? arg3_options : {};

  //Declare local instance variables
  var disabled_run_selector = `run-button button[aria-disabled="true"]`;
  var file_button_selector = `button[aria-label*="Insert assets such as images"]`;
  var file_iframe_selector = `.picker-iframe-container iframe`;
  var file_input_selector = `input[type="file"]`;
  var upload_to_drive_selector = `button[aria-label*="Upload to Drive"]`;

  //1. Handle file_path
  try {
    //Wait for file_button_selector to be available; then press on upload_to_drive_selector
    await chrome_browser.waitForSelector(file_button_selector);
    await chrome_browser.click(file_button_selector);

    await sleep(randomNumber(750, 1500));
    await chrome_browser.click(upload_to_drive_selector);
    await sleep(randomNumber(750, 1500));

    //Now wait for the file input element to be available; upload the file
    var file_input_frame_el = await chrome_browser.$(file_iframe_selector);
    var file_input_iframe = await file_input_frame_el.contentFrame();

    //Attempt to upload file within iframe
    var file_input_el = await file_input_iframe.waitForSelector(file_input_selector);

    //Upload the file
    try {
      await file_input_el.uploadFile(file_path);
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    console.log(e);
  }

  //Wait for 'Run' to turn blue
  await chrome_browser.waitForFunction(
    (selector) => !document.querySelector(selector),
    { timeout: 0 },
    disabled_run_selector
  );
  await sleep(randomNumber(750, 1500));

  //2. Handle sendTextToBrowserGPT if necessary
  var text_output = await sendTextToBrowserGPT(chrome_browser, input_text, options);

  //Return statement
  return text_output;
}

/*
  sendTextToBrowserGPT() - Sends text to a BrowserGPT instance. [WIP] - Finish function body relating to switching accounts once rate limits are reached on the current account.
  arg0_browser_instance: (Object, BrowserInstance)
  arg1_input_text: (String)
  arg2_options: (Object)
    type: (String) - The current type. 'chat_gpt'/'gemini'/'gemini_flash'

    exclude_metadata: (Boolean) - Optional. False by default.
*/
async function sendTextToBrowserGPT (arg0_browser_instance, arg1_input_text, arg2_options) {
  //Convert from parameters
  var chrome_browser = arg0_browser_instance;
  var input_text = arg1_input_text;
  var options = (arg2_options) ? arg2_options : {};

  //Initialise options; input_text
  if (!options.type)
    options.type = "gemini";

  //Add current timestamp to input_text
  if (!options.exclude_metadata)
    input_text += `\n\n(Metadata: Current Time - ${returnABRSDateString()})`;

  //Declare local instance variables
  var gemini_rate_limits = global.rate_limits[options.type];

  var chat_prompts_selector = `.chat-turn-container.render .prompt-container`;
  var loading_selector = `loading-indicator`;
  var textarea_selector = "footer .input-wrapper textarea";

  //Check rate limits first
  try {
    //Wait for the textarea to be available; then type text
    await chrome_browser.waitForSelector(textarea_selector);
    await chrome_browser.type(textarea_selector, input_text, {
       delay: (input_text.length < 200) ? randomNumber(10, 20) : 0
    });

    //Wait for a random amount of time to prevent triggering bot-resistance
    await sleep(randomNumber(1200, 2400));

    //Click run
    await chrome_browser.click(`run-button`);

    //Log usage to rate limits tracker
    var current_account = await getCurrentGeminiAccount(chrome_browser);
    gemini_rate_limits[current_account] = modifyValue(gemini_rate_limits, current_account, 1);
    console.log(gemini_rate_limits);

    await switchToAvailableAccount(chrome_browser, options.type, settings.gemini_accounts);

    //Wait for response from Gemini
    await sleep(randomNumber(250, 500));

    //Wait for the loading-indicator to stop existing and for content to stop changing
    await chrome_browser.waitForFunction(
      (selector, waitForStableContent) => !document.querySelector(selector),
      { timeout: 0 },
      loading_selector, waitForStableContent
    );
    //This second delay is necessary due to loading element display behaviour
    await sleep(randomNumber(3000, 5000));

    //Check to make sure content has stopped changing
    await waitForStableContent(chrome_browser, chat_prompts_selector);

    //Retrieve the value of the last .chat-turn-container
    var output_text = await chrome_browser.evaluate((chat_prompts_selector) => {
      var chat_prompts = document.querySelectorAll(chat_prompts_selector);

      return (chat_prompts.length > 0) ? chat_prompts[chat_prompts.length - 1].outerText : "";
    }, chat_prompts_selector);

    //Return statement
    return output_text;
  } catch (e) {
    console.log(e);
  }

  return "";
}

/*
  switchAccount() - Switches Google accounts in browser for BrowserGPT instances.
  arg0_browser_instance: (Object, BrowserInstance)
  arg1_account_name: (String) - Email/username of the account.
*/
async function switchAccount (arg0_browser_instance, arg1_account_name) {
  //Convert from parameters
  var chrome_browser = arg0_browser_instance;
  var account_name = arg1_account_name;

  //Declare local instance variables
  //1. Account switch button to pop up modal
  var account_switch_modal_selector = `alkali-accountswitcher [role*="button"]`;
  //2. Switch account button once the logo pops up
  var account_switch_btn_selector = `button.switch-account-button.mdc-button`;
  //3. Fetches <li> list on account switcher page
  var account_container_selector = `form ul`;

  //Click on modal selectors and buttons in order
  await chrome_browser.click(account_switch_modal_selector);
  await sleep(randomNumber(150, 350));
  await chrome_browser.click(account_switch_btn_selector);

  //This should now be on a separate page for the account switcher
  await sleep(randomNumber(1500, 2000));

  console.log(`Switching account to:`, account_name);

  await chrome_browser.evaluate(async (account_container_selector, account_name) => {
    //Define functions in scope
    {
      function randomNumber (min, max, do_not_round) {
        //Declare local instance variables
        var random_number = Math.random() * (max - min) + min;

        //Return statement
      	return (!do_not_round) ? Math.round(random_number) : random_number;
      }
      function sleep (arg0_ms) {
        //Convert from parameters
        var ms = arg0_ms;

        //Return statement
        return new Promise(resolve => setTimeout(resolve, ms));
      }
    }

    sleep(randomNumber(350, 500));

    //Begin actual script
    var account_container_el = document.querySelector(account_container_selector);

    var account_els = account_container_el.querySelectorAll("li");
    var account_btn_els = account_container_el.querySelectorAll("li > div");

    //Iterate over account_els and fetch .outerText
    for (var i = 0; i < account_els.length; i++) {
      var local_account_names = account_els[i].outerText.split("\n");

      for (var x = 0; x < local_account_names.length; x++)
        if (local_account_names[x] == account_name) {
          //This is the account we're looking for, click on it
          console.log(`Account button:`, account_btn_els[i]);

          account_btn_els[i].click();
          return account_btn_els[i];
          break;
        }
    }
  }, account_container_selector, account_name);
}

/*
  switchToAvailableAccount() - Switches to an available account as defined in global.config.ai.
  arg0_browser_instance: (Object, BrowserInstance)
  arg1_type: (String)
  arg2_available_accounts: (Array<String>/String)
*/
async function switchToAvailableAccount (arg0_browser_instance, arg1_type, arg2_available_accounts) { //[WIP] - Finish function body
  //Convert from parameters
  var chrome_browser = arg0_browser_instance;
  var type = (arg1_type) ? arg1_type : "gemini_flash";
  var available_accounts = getList(arg2_available_accounts);

  //Declare local instance variables
  var ai_config = global.config.ai;
  var rate_limits_obj = global.rate_limits;

  //Type handling
  if (["gemini", "gemini_flash"].includes(type)) {
    var current_account = await getCurrentGeminiAccount(chrome_browser);
    var current_rate_usage = returnSafeNumber(rate_limits_obj[type][current_account]);

    if (current_rate_usage >= ai_config[`${type}_rate_limit`])
      //Find new account
      for (var i = 0; i < available_accounts.length; i++) {
        var local_rate_usage = returnSafeNumber(rate_limits_obj[type][current_account]);

        if (local_rate_usage < ai_config[`${type}_rate_limit`])
          await switchAccount(chrome_browser, available_accounts[i]);
      }
  }
}
