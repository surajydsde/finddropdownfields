const { Builder, By } = require("selenium-webdriver");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const mentioned_dropdowns = [
  "jobtitle",
  "onlineSales",
  "monthlyonlinesales",
  "annualsales",
  "annualonlinesales",
  "organizationalrole",
  "country",
  "jobrole",
  "estimateoftotalonlinevolume",
  "estimateOfTotalOnlineVolume1",
];

async function scrapeData() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile("MPPBRC.xlsx");
  const worksheet = workbook.getWorksheet(1);
  const errorUrls = [];
  const data = [];

  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const pageURL = row.getCell(1).value;

    const driver = await new Builder().forBrowser("chrome").build();
    try {
      await driver.get(pageURL);
      const currentUrl = await driver.getCurrentUrl();

      if (currentUrl !== pageURL) {
            errorUrls.push({ pageurl: pageURL, errorText: `Page Redirected to ${currentUrl}` });
      }

      const formElement = await driver.findElement(By.css("form"));
      if (formElement) {
        const dropDownData = {};
        for (const dropdown of mentioned_dropdowns) {
          try {
            const dropdownElement = await driver.findElement(By.name(dropdown));
            const tagName = await dropdownElement.getTagName();

            if (tagName === "select") {
              await driver.executeScript(
                "arguments[0].scrollIntoView(true);",
                dropdownElement
              );

              const options = await dropdownElement.findElements(
                By.css("option")
              );
              const optionsData = {};
              for (const option of options) {
                const optionText = await option.getText();
                const optionValue = await option.getAttribute("value");
                optionsData[optionValue] = optionText;
              }

              const labelElement = await dropdownElement.findElement(
                By.xpath("following-sibling::label")
              );
              const label = await labelElement.getText();

              dropDownData[dropdown] = {
                label: label,
                options: optionsData,
              };

              const pageData = {
                pageURL: pageURL,
                dropDown: dropDownData,
              };

              data.push(pageData);
            }
          } catch (error) {
            // If dropdown element not found, create an empty object for it
            console.error(`Dropdown "${dropdown}" not found on URL ${pageURL}`);

            dropDownData[dropdown] = {
              label: "",
              options: {},
            };

            const pageData = {
              pageURL: pageURL,
              dropDown: dropDownData,
            };
            data.push(pageData);
          }
        }

        // Check for div with data-ppui-info="combobox_3.5.8"
        const comboboxDiv = await driver.findElement(
          By.css('div[data-ppui-info="combobox_3.5.8"]')
        );
        if (comboboxDiv) {
          const inputElement = await comboboxDiv.findElement(By.css("input"));
          const inputName = await inputElement.getAttribute("name");
          if (mentioned_dropdowns.includes(inputName)) {
            try {
              await driver.executeScript(
                "arguments[0].scrollIntoView(true);",
                inputElement
              );
              await inputElement.click();
              await driver.sleep(2000); // Wait for 10 seconds
              const liElements = await comboboxDiv.findElements(By.css("li"));
              const liValues = {};
              for (const li of liElements) {
                await driver.executeScript(
                  "arguments[0].scrollIntoView(true);",
                  li
                );
                const optionTextElement = await li.findElement(
                  By.css("p span:first-child")
                );
                const optionText = await optionTextElement.getText();
                const dataValue = await li.getAttribute("data-value");
                liValues[dataValue] = optionText;
              }

              await driver.sleep(2000); //
              const labelElement = await inputElement.findElement(
                By.xpath("following-sibling::label")
              );
              const label = await labelElement.getText();

              dropDownData[inputName] = {
                label: label,
                options: liValues,
              };

              const pageData = {
                pageURL: pageURL,
                dropDown: dropDownData,
              };

              data.push(pageData);
            } catch (error) {
              console.error(
                `Error processing combobox input "${inputName}" on URL ${pageURL}: ${error}`
              );
            }
          }
        }

      }
    } catch (error) {
      const dropDownData = {};
      if (error.name === "NoSuchElementError") {
        const validateError = error.message.includes("selector") && error.message.includes("form");
        if (validateError) {
          for (const dropdown of mentioned_dropdowns) {

          dropDownData[dropdown] = {
              label: "",
              options: {},
            };

            const pageData = {
              pageURL: pageURL,
              dropDown: dropDownData,
            };
            data.push(pageData);
          }
           
          errorUrls.push({ pageurl: pageURL, errorText: "form not found" });
        }
      }
      console.error(`Error processing URL ${pageURL}: ${error}`);
    } finally {
      await driver.quit();
    }
  }
  


  // Write data to JSON file
  const uniqueData = new Map();
  for (const pageData of data) {
    const pageURL = pageData.pageURL;
    if (!uniqueData.has(pageURL)) {
      uniqueData.set(pageURL, pageData);
    }
  }
  const filteredData = Array.from(uniqueData.values());
  const jsonFilePath = path.join(__dirname, 'Reports.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(filteredData, null, 2));
  console.log("Filtered data written to filteredPageData.json");

  const errorFilePath = 'PagesNeedAttention.json';
  fs.writeFileSync(errorFilePath, JSON.stringify(errorUrls, null, 2));
  console.log(`Error URLs written to ${errorFilePath}`);
}

scrapeData();
