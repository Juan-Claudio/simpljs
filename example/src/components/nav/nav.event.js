import Waiter from "../../../../Waiter.js";

function alertVersionOnClickOnBtn(bodyWaiter) {
  Waiter.addAct("alertVersion", () => {
    alert("version: 1.0.0");
  });

  return bodyWaiter
    .on("click")
    .at("#mljs-alertVersion-btn")
    .arm("alertVersion")
    .getArmId();
}

function displayLicenseOnClickOnBtn(bodyWaiter) {
  //showLicense yet in Waiter acts (toggle visibility of modal component)

  return bodyWaiter
    .on("click")
    .at("#mljs-showLicense-btn")
    .arm("showLicense")
    .getArmId();
}

function toggleReadmeOnClickOnBtn(bodyWaiter) {
  //insertReadme yet in Waiter acts (insert main content)
  //removeReadme yet in Waiter acts (remove main content)

  return bodyWaiter
    .on("click")
    .at("#mljs-toggleReadme-btn")
    .toggle(["insertReadme", "removeReadme"])
    .getArmId();
}

export {
  alertVersionOnClickOnBtn,
  displayLicenseOnClickOnBtn,
  toggleReadmeOnClickOnBtn,
};
