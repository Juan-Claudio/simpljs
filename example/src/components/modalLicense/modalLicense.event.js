import Waiter from "../../../../Waiter.js";

function closeModalLicense(bodyWaiter) {
  //register act
  Waiter.addAct({
    closeLicense() {
      $("#jsml-modalLicense-0").remove();
    },
  });

  //create event to add to body Waiter
  return bodyWaiter
    .on("click")
    .at("#jsml-modalLicense-btn-close")
    .arm("closeLicense")
    .getArmId();
}

function showLicenseText(bodyWaiter) {
  //register act
  Waiter.addAct({
    showLicenseText() {
      $("<license>").swap($(".jsml-modal-content"), {});
      $(".jsml-modal-content").style.textAlign = "justify";
      $("#jsml-modalLicense-btn-next").remove();
    },
  });

  //create event to add to body Waiter
  return bodyWaiter
    .on("click")
    .at("#jsml-modalLicense-btn-next")
    .arm("showLicenseText")
    .getArmId();
}

export { closeModalLicense, showLicenseText };
